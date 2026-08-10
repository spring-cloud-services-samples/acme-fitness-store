using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Configuration.Json;

namespace AcmeOrder.Db;

// Enables `dotnet ef migrations add` without a running Postgres instance.
// Reads ConnectionStrings:orderDb from appsettings.Development.json, matching the Aspire key.
public class PostgresOrderContextFactory : IDesignTimeDbContextFactory<PostgresOrderContext>
{
    public PostgresOrderContext CreateDbContext(string[] args)
    {
        IConfiguration config = new ConfigurationBuilder()
            .AddJsonFile("appsettings.Development.json", optional: false)
            .Build();

        var optionsBuilder = new DbContextOptionsBuilder<PostgresOrderContext>();
        optionsBuilder.UseNpgsql(config.GetConnectionString("orderDb"));
        return new PostgresOrderContext(optionsBuilder.Options);
    }
}
