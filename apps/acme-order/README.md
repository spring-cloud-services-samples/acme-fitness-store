# ACME Order Service

Requires DotNet version 8.

## Getting Started

Download donet
https://dotnet.microsoft.com/en-us/

In Visual Studio Code
Download the DotNet C# Dev Kit extension
VS Marketplace Link: https://marketplace.visualstudio.com/items?itemName=ms-dotnettools.csdevkit

## Locally running acme-order

To run the acme order service, do the following:

Ensure the Local Development dependencies are running. (See main [README](../../local-development/README.md))

```bash
cd ../../local-development
docker compose up -d
```

Start the application:

```bash
dotnet run --urls=http://localhost:8086/
```

Verify the health of the application:

```bash
open localhost:8086/actuator/health
```

## Deploying acme-order app

### Build deployable

```bash
dotnet publish -r linux-x64
```

### Deploy on TAS

Included [manifest.yml](./manifest.yml) file can be used to deploy the published binary

Ensure you're logged in to your TAS instance on cf cli

```bash
cf login -a <your-tas-api-url>
cf push -f manifest.yml
```