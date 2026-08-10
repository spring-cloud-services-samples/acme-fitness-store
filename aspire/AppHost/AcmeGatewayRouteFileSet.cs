using System.Text.Json.Nodes;
using Libraries.CloudFoundry.HostExtensions;
using YamlDotNet.Serialization;

namespace AcmeFitness.AppHost;

public static class AcmeGatewayRouteFileSet
{
    /// <summary>
    /// Binds this app's route file to the managed <c>acme-gateway</c> service via a parameterized <c>cf bind-service</c> call.
    /// No-op when the route file doesn't exist.
    /// </summary>
    /// <param name="app">
    /// The Cloud Foundry publish configuration for the app resource.
    /// </param>
    /// <param name="appDirectory">
    /// The app's source directory (the same path already passed to <c>AddJavaApp</c>/<c>AddPythonApp</c>/etc.), used
    /// to locate its route file by convention.
    /// </param>
    /// <param name="routeFileName">
    /// Override for apps whose route file doesn't follow the <c>{directory-name}-routes.json</c> convention (for
    /// example <c>shopping</c> -&gt; <c>frontend-routes.json</c>).
    /// </param>
#pragma warning disable ASPIRECLOUDFOUNDRYPUBLISHERS001
    public static void ApplyCfBinding(CloudFoundryPublishConfiguration app, string appDirectory, string? routeFileName = null)
#pragma warning restore ASPIRECLOUDFOUNDRYPUBLISHERS001
    {
        string path = ResolveRouteFilePath(appDirectory, routeFileName);

        if (!File.Exists(path))
        {
            return;
        }

        JsonNode? parsed = JsonNode.Parse(File.ReadAllText(path));

        if (parsed is not null)
        {
            app.WithServiceBinding("acme-gateway", parsed);
        }
    }

    private static string ResolveRouteFilePath(string appDirectory, string? routeFileName)
    {
        string folderName = new DirectoryInfo(appDirectory).Name;

        string baseName = folderName.StartsWith("acme-", StringComparison.OrdinalIgnoreCase)
            ? folderName["acme-".Length..]
            : folderName;

        string fileName = routeFileName ?? $"{baseName}-routes.json";
        return Path.Combine(appDirectory, fileName);
    }
}
