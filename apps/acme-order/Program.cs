using System;
using System.Net.Http.Headers;
using AcmeOrder.Db;
using AcmeOrder.Services;
using Libraries.BootstrapLogger.AppExtensions;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using Libraries.Connectors.Npgsql.AppExtensions;
using Libraries.ServiceDiscovery.Eureka.AppExtensions;
using Microsoft.Extensions.Hosting;
using Steeltoe.Common.Logging;
using Steeltoe.Configuration.CloudFoundry;
using Steeltoe.Configuration.CloudFoundry.ServiceBindings;
using Steeltoe.Management.Endpoint.Actuators.All;
using Steeltoe.Security.Authentication.JwtBearer;

var builder = WebApplication.CreateBuilder(args);

BootstrapLoggerFactory loggerFactory = builder.CreateBootstrapLoggerFactory();

builder.AddCloudFoundryConfiguration();
builder.Configuration.AddCloudFoundryServiceBindings();
builder.Services.AddAllActuators();
builder.Services.AddServiceDiscovery();
builder.AddEurekaServiceDiscovery(EurekaServiceDiscoveryModes.Register | EurekaServiceDiscoveryModes.Query, loggerFactory: loggerFactory);
builder.ConfigureEurekaOnCloudFoundry(loggerFactory: loggerFactory);

switch (builder.Configuration["DatabaseProvider"])
{
    case "Sqlite":
        builder.Services.AddDbContext<OrderContext, SqliteOrderContext>();
        break;

    case "Postgres":
        builder.AddNpgsqlDbContext<PostgresOrderContext>("orderDb",
            settings => settings.ConnectionString = builder.UpdateNpgsqlConnectionStringOnCloudFoundry(settings.ConnectionString));
        builder.Services.AddScoped<OrderContext>(sp => sp.GetRequiredService<PostgresOrderContext>());
        break;
}

builder.Services.AddHttpClient<OrderService>(c =>
    {
        c.BaseAddress = new Uri("https+http://acme-payment");
        c.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
    })
    .AddServiceDiscovery();

builder.Services.AddControllers();

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.SaveToken = true;
        if (builder.Configuration["DisableTokenValidation"] == "true")
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateAudience = false,
                ValidateIssuer = false,
                SignatureValidator = delegate (string token, TokenValidationParameters _)
                {
                    var jwt = new JsonWebToken(token);
                    return jwt;
                }
            };
        }
    })
    .ConfigureJwtBearerForCloudFoundry();

builder.Services.AddAuthorization();

var app = builder.Build();

await using (var scope = app.Services.CreateAsyncScope())
{
    var orderContext = scope.ServiceProvider.GetRequiredService<OrderContext>();
    await orderContext.Database.MigrateAsync();
}

app.UseDeveloperExceptionPage();
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

await app.RunAsync();
