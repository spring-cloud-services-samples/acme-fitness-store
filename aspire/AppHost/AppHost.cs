using System.Runtime.InteropServices;
using AcmeFitness.AppHost;
using Aspire.Extensions.CloudFoundryPublish;
using Aspire.Extensions.Spring;
using Libraries.CloudFoundry.HostExtensions;
using Libraries.Configuration.ConfigServer.HostExtensions;
using Libraries.ServiceDiscovery.Eureka.HostExtensions;
using Microsoft.Extensions.Configuration;
using Projects;
using Steeltoe.Common;

#pragma warning disable CA1861 // Avoid constant arrays as arguments

var builder = DistributedApplication.CreateBuilder(args);

// Enable the Cloud Foundry deployment integration (publish-mode only, no effect in run-mode).
// Org/Space/SystemDomain come from configuration (appsettings.<environment>.json).
// Select the deployment environment via `aspire deploy -e <environment>`.
builder.AddCloudFoundryEnvironment("cfEnvironment");

// Add a Postgres server, with pgvector for vector search (only used by assist).
var pgServer = builder.AddPostgres("acme-postgres")
    .WithImage("pgvector/pgvector", "pg16")
    .WithImagePullPolicy(ImagePullPolicy.Always)
    .WithLifetime(ContainerLifetime.Persistent);

// Add databases for each service that needs one
var assistDb = pgServer.AddDatabase("assistDb", "acme-assist");
var catalogDb = pgServer.AddDatabase("catalogDb", "acme-catalog");
var orderDb = pgServer.AddDatabase("orderDb", "acme-order");

// When deploying to Cloud Foundry, optionally use dedicated Postgres service instances instead of single shared server.
if (builder.ExecutionContext.IsPublishMode && builder.Configuration.GetValue<bool>("UseDedicatedPostgresInstances"))
{
    assistDb.WithDedicatedCloudFoundryServiceInstance("acme-assist-postgres");
    catalogDb.WithDedicatedCloudFoundryServiceInstance("acme-catalog-postgres");
    orderDb.WithDedicatedCloudFoundryServiceInstance("acme-order-postgres");
}

// Add a Valkey service for the cart app and SCG
var valkey = builder.AddValkey("acme-redis")
    .WithLifetime(ContainerLifetime.Persistent)
    .WithImagePullPolicy(ImagePullPolicy.Always);

// Add Config Server and Eureka. Pushing to Cloud Foundry will create and bind managed instances.
var eureka = builder.AddEureka("acme-registry")
    .WithLifetime(ContainerLifetime.Persistent)
    .WithImagePullPolicy(ImagePullPolicy.Always)
    .WithErrorLoggingOnly();

var configServer = builder.AddConfigServer("acme-config")
    .WithSources(sources => sources.AddLocalDirectorySource(GetLocalDevResourcePath("config")))
    .WithLifetime(ContainerLifetime.Persistent)
    .WithImagePullPolicy(ImagePullPolicy.Always);

var scheme = builder.Configuration.GetValue<bool>("ASPIRE_ALLOW_UNSECURED_TRANSPORT") ? "http" : "https";

// ── .NET Service ────────────────────────────────────────────────────────────────────────────────

// Use the matching launch profile so Aspire registers the right endpoints (https adds both schemes).
var order = builder.AddProject<acme_order>("acme-order", launchProfileName: scheme)
    .WithReference(orderDb)
    .WithRegistrationInEureka(eureka)
    .WaitFor(orderDb)
    .WaitFor(eureka)
    .PublishAsCloudFoundryApp(app =>
    {
    #pragma warning disable ASPIRECLOUDFOUNDRYPUBLISHERS001
        app.WithDeploymentPublishOutput(DotNetPublishOutput.FrameworkDependent)
            .WithServiceBinding("acme-registry")
            .WithServiceBinding("acme-sso", new
            {
                grant_types = new[] { "client_credentials" }
            });
        AcmeGatewayRouteFileSet.ApplyCfBinding(app, GetLocalAppPath("order"));
    #pragma warning restore ASPIRECLOUDFOUNDRYPUBLISHERS001
    });

// ── Python Service ───────────────────────────────────────────────────────────────────────────────

var valkeyEndpoint = valkey.GetEndpoint("tcp");

var cart = builder.AddPythonAppForCloudFoundry("acme-cart", GetLocalAppPath("cart"), "cart.py")
    .WaitFor(valkey);

if (builder.ExecutionContext.IsRunMode)
{
    cart.WithReference(valkey)
        .WithEnvironment("REDIS_HOST", valkeyEndpoint.Property(EndpointProperty.Host))
        .WithEnvironment("REDIS_PORT", valkeyEndpoint.Property(EndpointProperty.Port))
        .WithEnvironment("REDIS_PASSWORD", ReferenceExpression.Create($"{valkey.Resource.PasswordParameter!}"))
        .WithEnvironment("REDIS_TLS_ENABLED", "false")
        .WithEnvironment("AUTH_MODE", "0");
}

// Foundation-specific, from GatewayUrl in appsettings.{environment}.json (see cfEnvironment above) --
// the gateway's real public URL once deployed, used for OAuth2 redirect/launch URLs.
// Only evaluated in publish mode -- run mode never reads this.
string gatewayRedirectUri = builder.ExecutionContext.IsPublishMode
    ? builder.Configuration["GatewayUrl"] is { Length: > 0 } configuredGatewayUrl
        ? configuredGatewayUrl
        : throw new ArgumentException("GatewayUrl", "Please set the GatewayUrl in appsettings.{environment}.json to the public URL of the deployed gateway, e.g. https://acme-fitness.REPLACE_WITH_YOUR_APPS_DOMAIN/")
    : string.Empty;

// cart.py appends paths directly ("/verify-token", "/login") to AUTH_URL, so it needs no trailing slash -- unlike
// identity's redirect_uris/launch_url above, which are full URIs where the trailing slash is the correct form.
string gatewayBaseUrl = gatewayRedirectUri.TrimEnd('/');

if (builder.ExecutionContext.IsPublishMode)
{
    // cart.py reads AUTH_URL directly to build its verify-token/login URLs; no self-referential-expression concern
    // here (unlike the PORT endpoint env var below, whose publish-mode value is CF's own real assigned port, not
    // anything Aspire needs to communicate), so this can be set right away.
    cart.WithEnvironment("AUTH_URL", gatewayBaseUrl);

    if (!builder.Configuration.GetValue("VerifyGatewayTls", true))
    {
        cart.WithEnvironment("AUTH_URL_VERIFY_SSL", "false");
    }

    // Optional: some foundations' staging cells can't reach public PyPI (files.pythonhosted.org) to resolve
    // requirements.txt during the python_buildpack compile phase. When set, this points pip at a reachable
    // mirror instead; unset foundations get default pip behavior. See PipIndexUrl in
    // appsettings.{environment}.json -- left unset in the base appsettings.json on purpose.
    if (builder.Configuration["PipIndexUrl"] is { Length: > 0 } pipIndexUrl)
    {
        cart.WithEnvironment("PIP_INDEX_URL", pipIndexUrl);
    }
}

cart.PublishAsCloudFoundryApp(app =>
{
    app.WithArtifactPath(".")
        .WithBuildpack("python_buildpack")
        .WithMemory("1G")
        .WithServiceBinding("acme-redis");
    AcmeGatewayRouteFileSet.ApplyCfBinding(app, GetLocalAppPath("cart"));
});

// ── React Vite Frontend ──────────────────────────────────────────────────────────────────────────

var shopping = builder.AddViteAppForCloudFoundry("acme-shopping", GetLocalAppPath("shopping-react"));

// The dev-server executable ("npm run dev") isn't what CF should push -- run `npm run build` before
// `aspire publish` so the static dist/ output exists; this only tells CF where to find it once built.
shopping.PublishAsCloudFoundryApp(app =>
{
    app.WithArtifactPath("dist").WithBuildpack("staticfile_buildpack").WithMemory("1G");
    AcmeGatewayRouteFileSet.ApplyCfBinding(app, GetLocalAppPath("shopping-react"), "frontend-routes.json");
});

// ── Spring Boot Services ─────────────────────────────────────────────────────────────────────────

// See README for instructions regarding the OpenTelemetry jar.
var otelAgent = Path.GetFullPath(GetLocalDevResourcePath("opentelemetry-javaagent.jar"));

var catalog = builder.AddAcmeSpringBootApp("acme-catalog", GetLocalAppPath("catalog"), otelAgent, eureka, configServer)
    .WithSpringDataSource(catalogDb)
    .WaitFor(catalogDb)
    .PublishAsAcmeSpringBootApp(builder, GetLocalAppPath("catalog"));

if (builder.ExecutionContext.IsPublishMode)
{
    catalog.WithEnvironment("SPRING_MVC_STATIC_PATH_PATTERN", "/static/images/**");
}

var assist = builder.AddAcmeSpringBootApp("acme-assist", GetLocalAppPath("assist"), otelAgent, eureka, configServer)
    .WithSpringDataSource(assistDb)
    .WaitFor(assistDb)
    // VectorStoreInitializer calls acme-catalog at startup to index products; catalog must be up first.
    .WaitFor(catalog);

if (builder.ExecutionContext.IsRunMode)
{
    var openAiKeyValue = builder.Configuration["Parameters:openai-api-key"];
    var openAiKey = openAiKeyValue is { Length: > 0 }
        ? builder.AddParameter("openai-api-key", value: openAiKeyValue, secret: true)
        : builder.AddParameter("openai-api-key", secret: true);
    assist.WithEnvironment("SPRING_AI_OPENAI_API_KEY", openAiKey);
}

assist.PublishAsAcmeSpringBootApp(builder, GetLocalAppPath("assist"),
    configureExtra: cf => cf.WithServiceBinding("acme-genai-chat").WithServiceBinding("acme-genai-embed"));

var identity = builder.AddAcmeSpringBootApp("acme-identity", GetLocalAppPath("identity"), otelAgent, eureka, configServer);

identity.PublishAsAcmeSpringBootApp(builder, GetLocalAppPath("identity"),
    configureExtra: cf => cf.WithServiceBinding("acme-sso", new
    {
        grant_types = new[] { "authorization_code" },
        scopes = new[] { "openid" },
        authorities = new[] { "openid" },
        redirect_uris = new[] { gatewayRedirectUri },
        auto_approved_scopes = new[] { "openid" },
        identity_providers = new[] { "uaa" },
        launch_url = gatewayRedirectUri,
        show_on_home_page = false
    }));

var payment = builder.AddAcmeSpringBootApp("acme-payment", GetLocalAppPath("payment"), otelAgent, eureka, configServer);

payment.PublishAsAcmeSpringBootApp(builder, GetLocalAppPath("payment"), routeFileName: "payment-routes.json");

// ── Spring Cloud Gateway + Authorization Server ──────────────────────────────────────────────────

if (builder.ExecutionContext.IsRunMode)
{
    ThrowIfMissingLocalDevResource("Tanzu Local Authorization Server");
    ThrowIfMissingLocalDevResource("Tanzu Spring Cloud Gateway");
}

// Use fixed ports for the two "front door" services when the AppHost runs in a devcontainer, so the ports can be reliably forwarded.
// In devcontainer.json, forwardPorts can't track Aspire's per-run random port assignment.
// - When the fixed port is used, use isProxied: false so the resource binds the declared port directly, without DCP-managed indirection.
int? gatewayPort = Platform.IsContainerized ? 8090 : null;
int? authServerPort = Platform.IsContainerized ? 9000 : null;
bool? fixedPortIsProxied = Platform.IsContainerized ? false : null;

IResourceBuilder<ExecutableResource> authServer = builder.AddJavaApp(
        "acme-login", GetLocalDevResourcePath("spring-enterprise"), "tanzu-local-authorization-server.jar")
    .WithOtelAgent(otelAgent)
    .WithDevCertTrustForSpring()
    .WithHttpEndpoint(port: authServerPort, name: "primary", env: "SERVER_PORT", isProxied: fixedPortIsProxied)
    .WithExternalHttpEndpoints()
    .WithHttpHealthCheck("/.well-known/openid-configuration", endpointName: "primary")
    .ExcludeFromManifest();

// The JAR's hardcoded RSA key uses LF-only line endings, which fails on Windows.
// TANZU_LOCAL_AUTHORIZATION_SERVER_JWK_RANDOM routes through generateRsaKey() instead.
if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
{
    authServer.WithEnvironment("TANZU_LOCAL_AUTHORIZATION_SERVER_JWK_RANDOM", "true");
}

// acme-identity validates JWTs issued by the authorization server.
// Use the Aspire-managed endpoint locally, but needs an entry in appsettings.{environment}.json for deployment.
if (builder.ExecutionContext.IsRunMode)
{
    identity.WithEnvironment("JWK_URI", ReferenceExpression.Create($"{authServer.GetEndpoint("primary")}/oauth2/jwks"));
}
else
{
    // From "UaaJwkUrl" in appsettings.{environment}.json (conventionally "<uaa-url>/token_keys").
    identity.WithEnvironment("JWK_URI", builder.Configuration["UaaJwkUrl"] is { Length: > 0 } configuredJwkUrl
        ? configuredJwkUrl
        : throw new ArgumentException("JWK_URI", "Missing required configuration: UaaJwkUrl"));
}

IResourceBuilder<ExecutableResource> gateway = builder.AddJavaApp("acme-gateway", GetLocalDevResourcePath("spring-enterprise"), "tanzu-spring-cloud-gateway.jar",
        ["--spring.config.additional-location=file:./scg-config.yml,file:./routes.yml"])
    .WithOtelAgent(otelAgent)
    .WithDevCertTrustForSpring()
    .WithHttpEndpoint(port: gatewayPort, name: "primary", env: "SERVER_PORT", isProxied: fixedPortIsProxied)
    .WithExternalHttpEndpoints()
    //.WaitFor(valkey)
    .WithEnvironment(context =>
    {
        // "redis" profile switches SCG's HazelcastConfiguration from its multicast-based fallback
        // to Redis-backed session storage and rate limiting, eliminating the Hazelcast bind conflict.
        context.EnvironmentVariables["SPRING_PROFILES_ACTIVE"] = "sso,redis";
        context.EnvironmentVariables["GATEWAY_HOST"] = "localhost";
        context.EnvironmentVariables["AUTH_SERVER_URL"] = authServer.GetEndpoint("primary").Url;
        context.EnvironmentVariables["SPRING_DATA_REDIS_HOST"] = valkeyEndpoint.Property(EndpointProperty.Host);
        context.EnvironmentVariables["SPRING_DATA_REDIS_PORT"] = valkeyEndpoint.Property(EndpointProperty.Port);
        context.EnvironmentVariables["SPRING_DATA_REDIS_PASSWORD"] =
            ReferenceExpression.Create($"{valkey.Resource.PasswordParameter!}");
        context.EnvironmentVariables["ASSIST_PORT"] = assist.GetEndpoint("primary").Property(EndpointProperty.Port);
        context.EnvironmentVariables["CART_PORT"] = cart.GetEndpoint("primary").Property(EndpointProperty.Port);
        context.EnvironmentVariables["CATALOG_PORT"] = catalog.GetEndpoint("primary").Property(EndpointProperty.Port);
        context.EnvironmentVariables["IDENTITY_PORT"] = identity.GetEndpoint("primary").Property(EndpointProperty.Port);
        context.EnvironmentVariables["PAYMENT_PORT"] = payment.GetEndpoint("primary").Property(EndpointProperty.Port);
        context.EnvironmentVariables["ORDER_PORT"] = order.GetEndpoint(scheme).Property(EndpointProperty.Port);
        context.EnvironmentVariables["SHOPPING_PORT"] = shopping.GetEndpoint("http").Property(EndpointProperty.Port);
        context.EnvironmentVariables["SCHEME"] = scheme;
    })
    .WaitFor(authServer)
    .WithReferenceRelationship(assist)
    .WithReferenceRelationship(cart)
    .WithReferenceRelationship(catalog)
    .WithReferenceRelationship(identity)
    .WithReferenceRelationship(payment)
    .WithReferenceRelationship(order)
    .WithReferenceRelationship(shopping)
    .ExcludeFromManifest();

builder.AddExecutable("e2e-tests", "npx", "../../e2e", "cypress", "open")
    .WithEnvironment(context =>
    {
        context.EnvironmentVariables["CYPRESS_BASE_URL"] = gateway.GetEndpoint("primary").Url;
        context.EnvironmentVariables["CYPRESS_authUrl"] = authServer.GetEndpoint("primary").Url;
    })
    .WithExplicitStart()
    .WithParentRelationship(gateway)
    .ExcludeFromManifest();

#pragma warning disable ASPIRECERTIFICATES001 // Type is for evaluation purposes only and is subject to change or removal in future updates. Suppress this diagnostic to proceed.
if (scheme == "https")
{
    cart.WithHttpsEndpoint(name: "primary", env: "PORT");
    if (builder.ExecutionContext.IsRunMode)
    {
        cart.WithHttpsCertificateConfiguration(ctx =>
            {
                ctx.EnvironmentVariables["SSL_CERTFILE"] = ctx.CertificatePath;
                ctx.EnvironmentVariables["SSL_KEYFILE"] = ctx.KeyPath;
                return Task.CompletedTask;
            })
            .WithHttpsDeveloperCertificate();
        shopping.WithHttpsDeveloperCertificate();
    }
}
else
{
    cart.WithHttpEndpoint(name: "primary", env: "PORT");
    eureka.WithoutHttpsCertificate();
    configServer.WithoutHttpsCertificate();
}
#pragma warning restore ASPIRECERTIFICATES001 // Type is for evaluation purposes only and is subject to change or removal in future updates. Suppress this diagnostic to proceed.

builder.Build().Run();

static string GetLocalAppPath(string appName)
{
    return Path.Combine("..", "..", "apps", $"acme-{appName}");
}

static string GetLocalDevResourcePath(params string[] pathFragments)
{
    var fragments = new List<string> { "..", "..", "local-development" };
    fragments.AddRange(pathFragments);
    return Path.Combine([.. fragments]);
}

static void ThrowIfMissingLocalDevResource(string resourceName)
{
    var fileName = $"{resourceName.Replace(" ", "-").ToLower()}.jar";
    var resourcePath = GetLocalDevResourcePath("spring-enterprise", fileName);

    if (!File.Exists(resourcePath))
    {
        throw new IOException($"Missing required local dev resource: {Path.GetFullPath(resourcePath)}. " +
            $"Please download the {resourceName} jar from the Broadcom Support Portal and place it in the spring-enterprise directory."+
            "Refer to ./local-development/spring-enterprise/README.md for more information.");
    }
}