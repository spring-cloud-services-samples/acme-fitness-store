using System.Diagnostics;
using Aspire.Hosting.ApplicationModel;
using Aspire.Hosting.JavaScript;
using Aspire.Hosting.Pipelines;
using Aspire.Hosting.Python;
using Microsoft.Extensions.Logging;

namespace Aspire.Extensions.CloudFoundryPublish;

/// <summary>
/// Drop-in replacements for <c>AddPythonApp</c>/<c>AddViteApp</c> that avoid Docker entirely in publish mode, so
/// these resources can go through <c>PublishAsCloudFoundryApp</c> (buildpack/source push) instead.
/// </summary>
/// <remarks>
/// <c>AddPythonApp</c>/<c>AddViteApp</c> (confirmed against Aspire 13.4.6 source) unconditionally call
/// <c>PublishAsDockerFile(...)</c> at the end of their method bodies, with no opt-out. In publish mode, that method
/// removes the original <see cref="ExecutableResource" /> from the model and adds a brand-new container resource
/// under the same name -- any builder reference obtained beforehand (including the return value of
/// <c>AddPythonApp</c>/<c>AddViteApp</c> themselves) ends up pointing at the orphaned original, not the live
/// resource, so nothing configured afterward (buildpack, artifact path, service bindings) actually reaches the
/// generated manifest. Cloud Foundry doesn't use Docker at all here -- <c>cart</c> pushes as Python source via
/// <c>python_buildpack</c>, <c>shopping</c> pushes its pre-built <c>dist/</c> via <c>staticfile_buildpack</c> -- so
/// these helpers skip the Docker-wrapping step entirely in publish mode instead of working around it.
///
/// The specific command/args passed to <see cref="IDistributedApplicationBuilder.AddExecutable(string, string, string, string[])" />
/// in publish mode are cosmetic only: the CF library deliberately leaves the manifest's <c>command:</c> unset for
/// non-project resources so the buildpack auto-detects it from the app's own <c>Procfile</c>/<c>Staticfile</c> --
/// this resource is never actually executed once published. In run mode, both methods fall through to the normal
/// <c>AddPythonApp</c>/<c>AddViteApp</c> local-dev experience unchanged (<c>PublishAsDockerFile</c> is already a
/// no-op there).
/// </remarks>
public static class DockerFreePublishExtensions
{
    public static IResourceBuilder<ExecutableResource> AddPythonAppForCloudFoundry(this IDistributedApplicationBuilder builder, string name,
        string appDirectory, string scriptPath)
    {
        if (builder.ExecutionContext.IsPublishMode)
        {
            return builder.AddExecutable(name, "python3", appDirectory, scriptPath);
        }

        return builder.AddPythonApp(name, appDirectory, scriptPath);
    }

    public static IResourceBuilder<ExecutableResource> AddViteAppForCloudFoundry(this IDistributedApplicationBuilder builder, string name,
        string appDirectory)
    {
        if (builder.ExecutionContext.IsPublishMode)
        {
            // Unlike a .NET ProjectResource (which the CF library builds automatically via its own dotnet-publish
            // pipeline step), a plain ExecutableResource is never actually run once published -- the "npm"/"run"/
            // "build" command below is cosmetic only (see the class remarks). Nothing would otherwise ever produce
            // dist/, so the build has to happen somewhere -- as an async pipeline step tied into the Build graph,
            // not synchronously here at Program.cs top level. A blocking, potentially multi-minute subprocess call
            // at this point in AppHost startup prevents the host's own StartAsync() from ever running, which starves
            // the CLI backchannel listener (also started by that same host) -- `aspire publish` gives up waiting to
            // connect and fails with "Run completed without returning a backchannel" before the build (or anything
            // else) gets a chance to finish. Steps reachable from WellKnownPipelineSteps.BeforeStart still run before
            // the host starts (same problem, just moved), so this must hang off Build specifically.
            IResourceBuilder<ExecutableResource> resourceBuilder = builder.AddExecutable(name, "npm", appDirectory, "run", "build");

#pragma warning disable ASPIREPIPELINES001 // Pipeline APIs are for evaluation purposes only and are subject to change or removal in future updates.
            resourceBuilder.WithPipelineStepFactory($"{name}-npm-build", context => RunNpmBuildAsync(appDirectory, context),
                dependsOn: [WellKnownPipelineSteps.BuildPrereq], requiredBy: [WellKnownPipelineSteps.Build]);
#pragma warning restore ASPIREPIPELINES001

            return resourceBuilder;
        }

        return builder.AddViteApp(name, appDirectory);
    }

#pragma warning disable ASPIREPIPELINES001 // Pipeline APIs are for evaluation purposes only and are subject to change or removal in future updates.
    private static async Task RunNpmBuildAsync(string appDirectory, PipelineStepContext context)
    {
        context.Logger.LogInformation("Running 'npm run build' in '{AppDirectory}'...", appDirectory);

        // Invoking "npm.cmd" directly via Process.Start (no shell) hits a real, reproducible bug on at least one
        // nvm-for-windows install: npm.cmd's own prefix-detection logic (a `FOR /F` calling npm-prefix.js) resolves
        // differently without a real console attached and ends up pointing at a nonexistent
        // "<appDirectory>/node_modules/npm/bin/npm-cli.js". Routing through "cmd.exe /c" (the same way a normal
        // interactive `npm run build` invocation ultimately executes) avoids it; confirmed working when npm.cmd
        // alone was not.
        var startInfo = OperatingSystem.IsWindows()
            ? new ProcessStartInfo("cmd.exe")
            : new ProcessStartInfo("npm");

        if (OperatingSystem.IsWindows())
        {
            startInfo.ArgumentList.Add("/c");
            startInfo.ArgumentList.Add("npm");
        }

        startInfo.ArgumentList.Add("run");
        startInfo.ArgumentList.Add("build");
        startInfo.WorkingDirectory = appDirectory;
        startInfo.UseShellExecute = false;
        startInfo.RedirectStandardOutput = true;
        startInfo.RedirectStandardError = true;

        using var process = new Process { StartInfo = startInfo };

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
            throw new InvalidOperationException("Failed to start 'npm run build'.");
        }

        process.BeginOutputReadLine();
        process.BeginErrorReadLine();

        await process.WaitForExitAsync(context.CancellationToken).ConfigureAwait(false);

        if (process.ExitCode != 0)
        {
            throw new InvalidOperationException($"'npm run build' failed in '{appDirectory}' with exit code {process.ExitCode}.");
        }
    }
#pragma warning restore ASPIREPIPELINES001
}
