using Aspire.Hosting.ApplicationModel;

namespace Aspire.Extensions.Spring;

public static class SpringDataSourceExtensions
{
    /// <summary>
    /// Injects Spring Boot data source properties from an Aspire-managed Postgres database.
    /// Uses the built-in <c>JdbcConnectionString</c> expression so the URL is dynamically
    /// composed from the container's allocated endpoint.
    /// </summary>
    public static IResourceBuilder<JavaAppExecutableResource> WithSpringDataSource(this IResourceBuilder<JavaAppExecutableResource> resource,
        IResourceBuilder<PostgresDatabaseResource> database)
    {
        if (!resource.ApplicationBuilder.ExecutionContext.IsRunMode)
        {
            return resource;
        }

        PostgresDatabaseResource db = database.Resource;
        resource.WithEnvironment("SPRING_DATASOURCE_URL", db.JdbcConnectionString);
        resource.WithEnvironment("SPRING_DATASOURCE_USERNAME", db.Parent.UserNameReference);
        resource.WithEnvironment("SPRING_DATASOURCE_PASSWORD", ReferenceExpression.Create($"{db.Parent.PasswordParameter}"));
        return resource;
    }
}
