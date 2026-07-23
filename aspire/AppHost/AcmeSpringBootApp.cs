using System.Diagnostics;
using Aspire.Extensions.Spring;
using Aspire.Hosting.Pipelines;
using Libraries.CloudFoundry.HostExtensions;
using Libraries.Configuration.ConfigServer.HostExtensions;
using Libraries.Configuration.ConfigServer.HostExtensions.Java;
using Libraries.ServiceDiscovery.Eureka.HostExtensions;
using Libraries.ServiceDiscovery.Eureka.HostExtensions.Java;
using Microsoft.Extensions.Logging;

namespace AcmeFitness.AppHost;

public static class AcmeSpringBootAppExtensions
{
    /// <summary>
    /// Local-dev wiring common to all Spring apps: Gradle bootRun, the local OTel agent, the dev HTTPS certificate,
    /// the actuator health check, Eureka and Spring Cloud Config Server references.
    /// </summary>
    public static IResourceBuilder<JavaAppExecutableResource> AddAcmeSpringBootApp(this IDistributedApplicationBuilder builder, string name,
        string appDirectory, string otelAgentPath, IResourceBuilder<EurekaResource> eureka, IResourceBuilder<ConfigServerResource> configServer)
    {
        return builder.AddJavaApp(name, appDirectory)
            .WithGradleTask("bootRun", "--no-daemon")
            .WithLocalOnlyOtelAgent(otelAgentPath)
            .WithHttpEndpoint(name: "primary", env: "SERVER_PORT")
            .WithDevCertTrustForSpring()
            .WithHttpHealthCheck("/actuator/health", endpointName: "primary")
            .WithRegistrationInEureka(eureka)
            .WaitFor(eureka)
            .WithConfigServer(configServer)
            .WaitFor(configServer);
    }

    /// <summary>
    /// Publish-mode wiring common to all 4 apps: the <c>JBP_CONFIG_*</c>/<c>SPRING_PROFILES_ACTIVE</c> settings
    /// java_buildpack/Spring Boot need on Cloud Foundry that Gradle's local bootRun never touches (confirmed against
    /// each app's pre-Aspire, hand-authored reference <c>manifest.yml</c>), plus the manifest shape itself --
    /// <c>java_buildpack_offline</c>, 1G memory, and the <c>acme-config</c>/<c>acme-registry</c> bindings every app
    /// needs. <paramref name="configureExtra" /> adds whatever's app-specific (assist's GenAI bindings, identity's
    /// SSO binding) before the gateway route binding is applied.
    /// </summary>
    /// <param name="app">
    /// The Java app resource, as returned by <see cref="AddAcmeSpringBootApp" />.
    /// </param>
    /// <param name="builder">
    /// The apphost builder, used only to check <see cref="IDistributedApplicationBuilder.ExecutionContext" />.
    /// </param>
    /// <param name="appDirectory">
    /// The app's source directory, passed through to <see cref="AcmeGatewayRouteFileSet.ApplyCfBinding" />.
    /// </param>
    /// <param name="routeFileName">
    /// Override for apps whose route file doesn't follow the <c>{directory-name}-routes.json</c> convention.
    /// </param>
    /// <param name="configureExtra">
    /// Additional fluent configuration (extra service bindings, etc.) applied after the common shape above and
    /// before the gateway route binding.
    /// </param>
#pragma warning disable ASPIRECLOUDFOUNDRYPUBLISHERS001
    public static IResourceBuilder<JavaAppExecutableResource> PublishAsAcmeSpringBootApp(this IResourceBuilder<JavaAppExecutableResource> app,
        IDistributedApplicationBuilder builder, string appDirectory, string? routeFileName = null,
        Action<CloudFoundryPublishConfiguration>? configureExtra = null)
#pragma warning restore ASPIRECLOUDFOUNDRYPUBLISHERS001
    {
        if (builder.ExecutionContext.IsPublishMode)
        {
            app.WithEnvironment("JBP_CONFIG_SPRING_AUTO_RECONFIGURATION", "{enabled: false}")
                .WithEnvironment("JBP_CONFIG_OPEN_JDK_JRE", "{ jre: { version: 21.+ } }")
                .WithEnvironment("SPRING_PROFILES_ACTIVE", "http2,cloud");

            // WithGradleTask("bootRun", ...) above only wires the local-dev command; it never runs in publish mode.
            // Add the build step, then splices it into "cf-deploy-*", so the .jar exists before `cf push`.
            var workingDirectory = app.Resource.WorkingDirectory;
            var buildStepName = $"{app.Resource.Name}-gradle-build";

#pragma warning disable ASPIREPIPELINES001 // Pipeline APIs are for evaluation purposes only and are subject to change or removal in future updates.
            app.WithPipelineStepFactory(buildStepName, context => RunGradleBootJarAsync(workingDirectory, context));

            app.WithPipelineConfiguration(context =>
            {
                var cfDeployStep = context.Steps.FirstOrDefault(step => step.Name.StartsWith("cf-deploy-", StringComparison.Ordinal));

                if (cfDeployStep is not null && !cfDeployStep.DependsOnSteps.Contains(buildStepName))
                {
                    cfDeployStep.DependsOnSteps.Add(buildStepName);
                }
            });
#pragma warning restore ASPIREPIPELINES001
        }

        app.PublishAsCloudFoundryApp(cf =>
        {
            // 256M (the manifest default) is too small for a Spring Boot JVM's own baseline overhead (reserved
            // code cache, metaspace, thread stacks) before any application heap -- java_buildpack's memory
            // calculator rejects it outright rather than starting with too little heap.
            cf.WithArtifactPath($"build/libs/{app.Resource.Name}-0.0.1-SNAPSHOT.jar")
                .WithBuildpack("java_buildpack_offline")
                .WithMemory("1G")
                .WithServiceBinding("acme-config")
                .WithServiceBinding("acme-registry");
            configureExtra?.Invoke(cf);

            AcmeGatewayRouteFileSet.ApplyCfBinding(cf, appDirectory, routeFileName);
        });

        return app;
    }

#pragma warning disable ASPIREPIPELINES001 // Pipeline APIs are for evaluation purposes only and are subject to change or removal in future updates.
    private static async Task RunGradleBootJarAsync(string workingDirectory, PipelineStepContext context)
    {
        var wrapperPath = Path.Combine(workingDirectory, OperatingSystem.IsWindows() ? "gradlew.bat" : "gradlew");

        context.Logger.LogInformation("Running '{WrapperPath} bootJar' in '{WorkingDirectory}'...", wrapperPath, workingDirectory);

        var startInfo = OperatingSystem.IsWindows() ? new ProcessStartInfo("cmd.exe") : new ProcessStartInfo(wrapperPath);

        if (OperatingSystem.IsWindows())
        {
            startInfo.ArgumentList.Add("/c");
            startInfo.ArgumentList.Add(wrapperPath);
        }

        startInfo.ArgumentList.Add("bootJar");
        startInfo.WorkingDirectory = workingDirectory;
        startInfo.UseShellExecute = false;
        startInfo.RedirectStandardOutput = true;
        startInfo.RedirectStandardError = true;

        using var process = new Process();
        process.StartInfo = startInfo;

        process.OutputDataReceived += (_, e) =>
        {
            if (e.Data is not null)
            {
                context.ReportingStep.Log(LogLevel.Information, e.Data);
            }
        };

        process.ErrorDataReceived += (_, e) =>
        {
            if (e.Data is not null)
            {
                context.ReportingStep.Log(LogLevel.Warning, e.Data);
            }
        };

        if (!process.Start())
        {
            throw new InvalidOperationException($"Failed to start '{wrapperPath}'.");
        }

        process.BeginOutputReadLine();
        process.BeginErrorReadLine();

        await process.WaitForExitAsync(context.CancellationToken).ConfigureAwait(false);

        if (process.ExitCode != 0)
        {
            throw new InvalidOperationException($"'{wrapperPath} bootJar' failed in '{workingDirectory}' with exit code {process.ExitCode}.");
        }
    }
#pragma warning restore ASPIREPIPELINES001
}
