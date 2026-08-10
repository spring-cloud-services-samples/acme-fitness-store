using System.Runtime.InteropServices;
using Aspire.Hosting.ApplicationModel;
using Microsoft.Extensions.Configuration;

namespace Aspire.Extensions.Spring;

/// <summary>
/// Local alternative to the AspireExperiments libraries.
/// TODO: migrate into AspireExperiments once the patterns stabilize.
/// </summary>
public static class SpringHttpsExtensions
{
    /// <summary>
    /// Configures the Spring Boot app to use the specified HTTPS certificate for inbound TLS.
    /// No-op when ASPIRE_ALLOW_UNSECURED_TRANSPORT is set (HTTP profile), or in publish mode.
    /// </summary>
    /// <remarks>
    /// Run mode only: this entire method exists to trust Aspire's own ephemeral local dev certificate authority
    /// (inbound server cert, outbound JVM/OTel trust) -- none of that applies to a real Cloud Foundry deployment,
    /// which terminates TLS at the platform router using real certificates. Left enabled, the Windows/macOS-only
    /// trust store type baked into JDK_JAVA_OPTIONS is meaningless (and potentially fatal to the JVM) on the
    /// Linux container CF actually runs the app in.
    /// </remarks>
    public static IResourceBuilder<JavaAppExecutableResource> WithDevCertTrustForSpring(
        this IResourceBuilder<JavaAppExecutableResource> resourceBuilder)
    {
        if (!resourceBuilder.ApplicationBuilder.ExecutionContext.IsRunMode)
        {
            return resourceBuilder;
        }

        if (resourceBuilder.ApplicationBuilder.Configuration.GetValue<bool>("ASPIRE_ALLOW_UNSECURED_TRANSPORT"))
        {
            return resourceBuilder;
        }

        resourceBuilder.WithDeveloperCertificateTrust(true);

        // Outbound TLS - make the JVM trust the OS certificate store where `dotnet dev-certs https --trust`
        // places the Aspire root CA. Uses JDK_JAVA_OPTIONS (not JAVA_TOOL_OPTIONS)
        // so the OTel agent flag appended by WithOtelAgent is not clobbered.
        resourceBuilder.WithEnvironment(context =>
        {
            string? trustStoreType = RuntimeInformation.IsOSPlatform(OSPlatform.Windows) ? "Windows-ROOT"
                : RuntimeInformation.IsOSPlatform(OSPlatform.OSX) ? "KeychainStore"
                : null;

            if (trustStoreType is not null)
            {
                string arg = $"-Djavax.net.ssl.trustStoreType={trustStoreType}";

                context.EnvironmentVariables["JDK_JAVA_OPTIONS"] =
                    context.EnvironmentVariables.TryGetValue("JDK_JAVA_OPTIONS", out object? existing)
                    && existing is string { Length: > 0 } prev
                        ? $"{prev} {arg}"
                        : arg;
            }
        });

#pragma warning disable ASPIRECERTIFICATES001 // Type is for evaluation purposes only and is subject to change or removal in future updates. Suppress this diagnostic to proceed.
        resourceBuilder.WithHttpsCertificateConfiguration(context =>
        {
            // Inbound TLS - Spring Boot server certificate
            context.EnvironmentVariables["SERVER_SSL_ENABLED"] = "true";
            context.EnvironmentVariables["SERVER_SSL_KEY_STORE"] = context.PfxPath;
            context.EnvironmentVariables["SERVER_SSL_KEY_STORE_TYPE"] = "PKCS12";
            context.EnvironmentVariables["SERVER_SSL_KEY_STORE_PASSWORD"] = context.Password == null ? string.Empty : context.Password;
            return Task.CompletedTask;
        }).WithHttpsDeveloperCertificate();

        // Outbound TLS - OTel HTTPS export: point the Java OTel agent at the Aspire CA bundle
        // PEM so it can verify the dashboard certificate independently of the JVM trust store.
        resourceBuilder.WithCertificateTrustConfiguration(context =>
        {
            context.EnvironmentVariables["OTEL_EXPORTER_OTLP_CERTIFICATE"] = context.CertificateBundlePath;
            return Task.CompletedTask;
        });

        // Guaranteed run mode here -- the method returns early above when not in run mode.
        resourceBuilder.SubscribeHttpsEndpointsUpdate(_ => resourceBuilder.WithEndpoint("primary", endpoint => endpoint.UriScheme = "https"));
#pragma warning restore ASPIRECERTIFICATES001 // Type is for evaluation purposes only and is subject to change or removal in future updates. Suppress this diagnostic to proceed.

        return resourceBuilder;
    }
}
