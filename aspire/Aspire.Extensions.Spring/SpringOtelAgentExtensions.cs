using Aspire.Hosting.ApplicationModel;

namespace Aspire.Extensions.Spring;

public static class SpringOtelAgentExtensions
{
    /// <summary>
    /// Configures the OpenTelemetry Java agent, but only when running locally.
    /// </summary>
    public static IResourceBuilder<JavaAppExecutableResource> WithLocalOnlyOtelAgent(this IResourceBuilder<JavaAppExecutableResource> resource,
        string otelAgentPath)
    {
        if (resource.ApplicationBuilder.ExecutionContext.IsRunMode)
        {
            resource.WithOtelAgent(otelAgentPath);
        }

        return resource;
    }
}
