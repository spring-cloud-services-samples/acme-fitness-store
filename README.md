---
page_type: sample
languages:
- java
products:
- Azure Spring Cloud
- Azure Database for PostgresSQL
- Azure Cache for Redis
- Azure Active Directory
description: "Deploy Microservice Apps to Azure"
urlFragment: ""
---

# Deploy Microservice Applications to Azure Spring Cloud

Azure Spring cloud enables you to easily run Spring Boot and polyglot applications on Azure.

This quickstart shows you how to deploy existing microservices written in Java, Python, and C# to Azure. When you're 
finished, you can continue to manage the application via the Azure CLI or switch to using the Azure Portal.

* [Deploy Microservice Applications to Azure Spring Cloud](#deploy-microservice-applications-to-azure-spring-cloud)
   * [What will you experience](#what-will-you-experience)
   * [What you will need](#what-you-will-need)
   * [Install the Azure CLI extension](#install-the-azure-cli-extension)
   * [Clone the repo](#clone-the-repo)
   * [Unit 1 - Deploy and Build Applications](#unit-1---deploy-and-build-applications)
   * [Unit 2 - Configure Single Sign On](#unit-2---configure-single-sign-on)
   * [Unit 3 - Securely Load Application Secrets](#unit-3---securely-load-application-secrets)
   * [Unit 4 - Monitor Applications](#unit-4---monitor-applications)
   * [Unit 5 - Set Request Rate Limits](#unit-5---set-request-rate-limits)
   * [Unit 6 - Automate with GitHub Actions](#unit-6---automate-with-github-actions)

## What will you experience
You will:
- Provision an Azure Spring Cloud service instance.
- Configure Application Configuration Service repositories
- Deploy polyglot applications to Azure and build using Tanzu Build Service
- Configure routing to the applications using Spring Cloud Gateway
- Open the application
- Explore the application API with Api Portal
- Configure Single Sign On (SSO) for the application
- Monitor applications
- Automate provisioning and deployments using GitHub Actions

The following diagram shows the architecture of the ACME Fitness Store that will be used for this guide:

[//]: # (TODO: Add Image)
[//]: # ( ![An image showing the microservics involved in the ACME Fitness Store. It depicts the applications and their dependencies]&#40;./media/architecture.png&#41;)

## What you will need

In order to deploy a Java app to cloud, you need
an Azure subscription. If you do not already have an Azure
subscription, you can activate your
[MSDN subscriber benefits](https://azure.microsoft.com/pricing/member-offers/msdn-benefits-details/)
or sign up for a
[free Azure account]((https://azure.microsoft.com/free/)).

In addition, you will need the following:

| [Azure CLI version 2.17.1 or higher](https://docs.microsoft.com/cli/azure/install-azure-cli?view=azure-cli-latest)
| [Git](https://git-scm.com/)
| [`jq` utility](https://stedolan.github.io/jq/download/)
|

Note -  The [`jq` utility](https://stedolan.github.io/jq/download/). On Windows, download [this Windows port of JQ](https://github.com/stedolan/jq/releases) and add the following to the `~/.bashrc` file:
```shell
alias jq=<JQ Download location>/jq-win64.exe
```

Note - The Bash shell. While Azure CLI should behave identically on all environments, shell
semantics vary. Therefore, only bash can be used with the commands in this repo.
To complete these repo steps on Windows, use Git Bash that accompanies the Windows distribution of
Git. Use only Git Bash to complete this training on Windows. Do not use WSL.


### OR Use Azure Cloud Shell

Or, you can use the Azure Cloud Shell. Azure hosts Azure Cloud Shell, an interactive shell
environment that you can use through your browser. You can use the Bash with Cloud Shell
to work with Azure services. You can use the Cloud Shell pre-installed commands to run the
code in this README without having to install anything on your local environment. To start Azure
Cloud Shell: go to [https://shell.azure.com](https://shell.azure.com), or select the
Launch Cloud Shell button to open Cloud Shell in your browser.

To run the code in this article in Azure Cloud Shell:

1. Start Cloud Shell.

2. Select the Copy button on a code block to copy the code.

3. Paste the code into the Cloud Shell session by selecting Ctrl+Shift+V on Windows and Linux or by selecting Cmd+Shift+V on macOS.

4. Select Enter to run the code.


## Install the Azure CLI extension

Install the Azure Spring Cloud extension for the Azure CLI using the following command

```shell
az extension add --name spring-cloud
```
Note - `spring-cloud` CLI extension `3.0.0` or later is a pre-requisite to enable the
latest Enterprise tier functionality to configure VMware Tanzu Components. Use the following
command to remove previous versions and install the latest Enterprise tier extension:

```shell
az extension remove --name spring-cloud
az extension add --name spring-cloud
```

## Clone the repo

### Create a new folder and clone the sample app repository to your Azure Cloud account

```shell
mkdir source-code
cd source-code
git clone --branch Azure https://github.com/spring-cloud-services-samples/acme_fitness_demo
cd acme_fitness_demo
```

## Unit 1 - Deploy and Build Applications

### Prepare your environment for deployments

Create a bash script with environment variables by making a copy of the supplied template:

```shell
cp ./azure/setup-env-variables-template.sh ./azure/setup-env-variables.sh
```

Open `./azure/setup-env-variables.sh` and enter the following information:

```shell
export SUBSCRIPTION=subscription-id                 # replace it with your subscription-id
export RESOURCE_GROUP=resource-group-name           # existing resource group or one that will be created in next steps
export SPRING_CLOUD_SERVICE=azure-spring-cloud-name # name of the service that will be created in the next steps
export LOG_ANALYTICS_WORKSPACE=log-analytics-name   # existing workspace or one that will be created in next steps
export POSTGRES_SERVER_USER=change-name             # Postgres server username to be created in next steps
export POSTGRES_SERVER_PASSWORD=change-name         # Postgres server password to be created in next steps
export REGION=region-name                           # choose a region with Enterprise tier support
```

Then, set the environment:
```shell
source ./azure/setup-env-variables.sh
```

### Login to Azure
Login to the Azure CLI and choose your active subscription. Be sure to choose the active subscription that is whitelisted for Azure Spring Cloud

```shell
az login
az account list -o table
az account set --subscription ${SUBSCRIPTION}
```

### Create Azure Spring Cloud service instance
Prepare a name for your Azure Spring Cloud service.  The name must be between 4 and 32 characters long and can contain only lowercase letters, numbers, and hyphens.  The first character of the service name must be a letter and the last character must be either a letter or a number.

Create a resource group to contain your Azure Spring Cloud service.

> Note: This step can be skipped if using an existing resource group

```shell
az group create --name ${RESOURCE_GROUP} \
    --location ${REGION}
```

Accept the legal terms and privacy statements for the Enterprise tier.

> Note: This step is necessary only if your subscription has never been used to create an Enterprise tier instance of Azure Spring Cloud.

```shell
az provider register --namespace Microsoft.SaaS
az term accept --publisher vmware-inc --product azure-spring-cloud-vmware-tanzu-2 --plan tanzu-asc-ent-mtr
```

Create an instance of Azure Spring Cloud Enterprise.

```shell
az spring-cloud create --name ${SPRING_CLOUD_SERVICE} \
    --resource-group ${RESOURCE_GROUP} \
    --location ${REGION} \
    --sku Enterprise \
    --enable-application-configuration-service \
    --enable-service-registry \
    --enable-gateway \
    --enable-api-portal
```

The service instance will take around 10-15 minutes to deploy.

Set your default resource group name and cluster name using the following commands:

```shell
az configure --defaults \
    group=${RESOURCE_GROUP} \
    location=${REGION} \
    spring-cloud=${SPRING_CLOUD_SERVICE}
```

### Create Azure Cache for Redis

Create an instance of Azure Cache for Redis using the Azure CLI.

```shell
az redis create \
  --name ${AZURE_CACHE_NAME} \
  --location ${REGION} \
  --resource-group ${RESOURCE_GROUP} \
  --sku Basic \
  --vm-size c0
```

### Create an Azure Database for Postgres

Using the Azure CLI, create an Azure Database for Postgres Flexible Server:

```shell
az postgres flexible-server create --name ${POSTGRES_SERVER} \
    --resource-group ${RESOURCE_GROUP} \
    --location ${REGION} \
    --admin-user ${POSTGRES_SERVER_USER} \
    --admin-password ${POSTGRES_SERVER_PASSWORD} \
    --yes

# Allow connections from other Azure Services
az postgres flexible-server firewall-rule create --rule-name allAzureIPs \
     --name ${POSTGRES_SERVER} \
     --resource-group ${RESOURCE_GROUP} \
     --start-ip-address 0.0.0.0 --end-ip-address 0.0.0.0
     
# Enable the uuid-ossp extension
az postgres flexible-server parameter set \
    --resource-group ${RESOURCE_GROUP} \
    --server-name ${POSTGRES_SERVER} \
    --name azure.extensions --value uuid-ossp
```

Create a database for the order service:

```shell
az postgres flexible-server db create \
  --database-name ${ORDER_SERVICE_DB} \
  --server-name ${POSTGRES_SERVER}
```

Create a database for the catalog service:

```shell
az postgres flexible-server db create \
  --database-name ${CATALOG_SERVICE_DB} \
  --server-name ${POSTGRES_SERVER}
```

> Note: wait for all services to be ready before continuing

### Configure Log Analytics for Azure Spring Cloud

Create a Log Analytics Workspace to be used for your Azure Spring Cloud service.

> Note: This step can be skipped if using an existing workspace

```shell
az monitor log-analytics workspace create \
  --workspace-name ${LOG_ANALYTICS_WORKSPACE} \
  --location ${REGION} \
  --resource-group ${RESOURCE_GROUP}   
```

Retrieve the resource ID for the recently create Azure Spring Cloud Service and Log Analytics Workspace:

```shell
export LOG_ANALYTICS_RESOURCE_ID=$(az monitor log-analytics workspace show \
    --resource-group ${RESOURCE_GROUP} \
    --workspace-name ${LOG_ANALYTICS_WORKSPACE} | jq -r '.id')

export SPRING_CLOUD_RESOURCE_ID=$(az spring-cloud show \
    --name ${SPRING_CLOUD_SERVICE} \
    --resource-group ${RESOURCE_GROUP} | jq -r '.id')
```

Configure diagnostic settings for the Azure Spring Cloud Service:

```shell
az monitor diagnostic-settings create --name "send-logs-and-metrics-to-log-analytics" \
    --resource ${SPRING_CLOUD_RESOURCE_ID} \
    --workspace ${LOG_ANALYTICS_RESOURCE_ID} \
    --logs '[
         {
           "category": "ApplicationConsole",
           "enabled": true,
           "retentionPolicy": {
             "enabled": false,
             "days": 0
           }
         },
         {
            "category": "SystemLogs",
            "enabled": true,
            "retentionPolicy": {
              "enabled": false,
              "days": 0
            }
          },
         {
            "category": "IngressLogs",
            "enabled": true,
            "retentionPolicy": {
              "enabled": false,
              "days": 0
             }
           }
       ]' \
       --metrics '[
         {
           "category": "AllMetrics",
           "enabled": true,
           "retentionPolicy": {
             "enabled": false,
             "days": 0
           }
         }
       ]'
```

### Configure Application Configuration Service

Create a configuration repository for Application Configuration Service using the Azure CLI:

```shell
az spring-cloud application-configuration-service git repo add --name acme-fitness-store-config \
    --label Azure \
    --patterns "default,catalog,identity,payment" \
    --uri "https://github.com/spring-cloud-services-samples/acme_fitness_demo" \
    --search-paths config
```

### Configure Tanzu Build Service

Create a custom builder in Tanzu Build Service using the Azure CLI:

```shell
az spring-cloud build-service builder create -n ${CUSTOM_BUILDER} \
    --builder-file azure/builder.json \
    --no-wait
```

### Create applications in Azure Spring Cloud

Create an application for each service:

```shell
az spring-cloud app create --name ${CART_SERVICE_APP} --instance-count 1 --memory 1Gi
az spring-cloud app create --name ${ORDER_SERVICE_APP} --instance-count 1 --memory 1Gi
az spring-cloud app create --name ${PAYMENT_SERVICE_APP} --instance-count 1 --memory 1Gi
az spring-cloud app create --name ${CATALOG_SERVICE_APP} --instance-count 1 --memory 1Gi
az spring-cloud app create --name ${FRONTEND_APP} --instance-count 1 --memory 1Gi
```

### Bind to Application Configuration Service

Several applications require configuration from Application Configuration Service, so create
the bindings:

```shell
az spring-cloud application-configuration-service bind --app ${PAYMENT_SERVICE_APP}
az spring-cloud application-configuration-service bind --app ${CATALOG_SERVICE_APP}
```

### Bind to Service Registry

Several application require service discovery using Service Registry, so create
the bindings:

```shell
az spring-cloud service-registry bind --app ${PAYMENT_SERVICE_APP}
az spring-cloud service-registry bind --app ${CATALOG_SERVICE_APP}
```

### Create Service Connectors

The Order Service and Catalog Service use Azure Database for Postgres, create Service Connectors 
for those applications:

```shell
# Bind order service to Postgres
az spring-cloud connection create postgres-flexible \
    --resource-group ${RESOURCE_GROUP} \
    --service ${SPRING_CLOUD_SERVICE} \
    --connection ${ORDER_SERVICE_DB_CONNECTION} \
    --app ${ORDER_SERVICE_APP} \
    --deployment default \
    --tg ${RESOURCE_GROUP} \
    --server ${POSTGRES_SERVER} \
    --database ${ORDER_SERVICE_DB} \
    --secret name=${POSTGRES_SERVER_USER} secret=${POSTGRES_SERVER_PASSWORD} \
    --client-type dotnet
    

# Bind catalog service to Postgres
az spring-cloud connection create postgres-flexible \
    --resource-group ${RESOURCE_GROUP} \
    --service ${SPRING_CLOUD_SERVICE} \
    --connection ${CATALOG_SERVICE_DB_CONNECTION} \
    --app ${CATALOG_SERVICE_APP} \
    --deployment default \
    --tg ${RESOURCE_GROUP} \
    --server ${POSTGRES_SERVER} \
    --database ${CATALOG_SERVICE_DB} \
    --secret name=${POSTGRES_SERVER_USER} secret=${POSTGRES_SERVER_PASSWORD} \
    --client-type springboot
```

The Cart Service requires a connection to Azure Cache for Redis, create the Service Connector:

```shell
az spring-cloud connection create redis \
    --resource-group ${RESOURCE_GROUP} \
    --service ${SPRING_CLOUD_SERVICE} \
    --connection $CART_SERVICE_CACHE_CONNECTION \
    --app ${CART_SERVICE_APP} \
    --deployment default \
    --tg ${RESOURCE_GROUP} \
    --server ${AZURE_CACHE_NAME} \
    --database 0 \
    --client-type java 
```

### Configure Spring Cloud Gateway

Assign an endpoint and update the Spring Cloud Gateway configuration with API
information:

```shell
az spring-cloud gateway update --assign-endpoint true
export GATEWAY_URL=$(az spring-cloud gateway show | jq -r '.properties.url')
    
az spring-cloud gateway update \
    --api-description "Acme Fitness Store API" \
    --api-title "Acme Fitness Store" \
    --api-version "v1.0" \
    --server-url "https://${GATEWAY_URL}" \
    --allowed-origins "*"
```

Create  routing rules for the applications:

```shell
az spring-cloud gateway route-config create \
    --name ${CART_SERVICE_APP} \
    --app-name ${CART_SERVICE_APP} \
    --routes-file azure/routes/cart-service.json
    
az spring-cloud gateway route-config create \
    --name ${ORDER_SERVICE_APP} \
    --app-name ${ORDER_SERVICE_APP} \
    --routes-file azure/routes/order-service.json

az spring-cloud gateway route-config create \
    --name ${CATALOG_SERVICE_APP} \
    --app-name ${CATALOG_SERVICE_APP} \
    --routes-file azure/routes/catalog-service.json

az spring-cloud gateway route-config create \
    --name ${FRONTEND_APP} \
    --app-name ${FRONTEND_APP} \
    --routes-file azure/routes/frontend.json
```

### Build and Deploy Polyglot Applications

Deploy and build each application, specifying its required parameters

```shell
# Deploy Payment Service
az spring-cloud app deploy --name ${PAYMENT_SERVICE_APP} \
    --config-file-pattern payment \
    --source-path apps/acme-payment

# Deploy Catalog Service
az spring-cloud app deploy --name ${CATALOG_SERVICE_APP} \
    --config-file-pattern catalog \
    --source-path apps/acme-catalog

# Deploy Order Service after retrieving the database connection info
export postgres_connection_url=$(az spring-cloud connection show -g ${RESOURCE_GROUP} \
    --service ${SPRING_CLOUD_SERVICE} \
    --deployment default \
    --connection ${ORDER_SERVICE_DB_CONNECTION} \
    --app ${ORDER_SERVICE_APP} | jq '.configurations[0].value' -r)

az spring-cloud app deploy --name ${ORDER_SERVICE_APP} \
    --builder ${CUSTOM_BUILDER} \
    --env "ConnectionStrings__OrderContext=$POSTGRES_CONNECTION_STR" \
    --source-path apps/acme-order

# Deploy the Cart Service after retrieving the cache connection info
export redis_conn_str=$(az spring-cloud connection show -g ${RESOURCE_GROUP} \
    --service ${SPRING_CLOUD_SERVICE} \
    --deployment default \
    --app ${CART_SERVICE_APP} \
    --connection $CART_SERVICE_CACHE_CONNECTION | jq -r '.configurations[0].value')

az spring-cloud app deploy --name ${CART_SERVICE_APP} \
    --builder ${CUSTOM_BUILDER} \
    --env "CART_PORT=8080" "REDIS_CONNECTIONSTRING=${REDIS_CONN_STR}" \
    --source-path apps/acme-cart

# Deploy Frontend App
az spring-cloud app deploy --name ${FRONTEND_APP} \
    --builder ${CUSTOM_BUILDER} \
    --source-path apps/acme-shopping
```

### Access the Application through Spring Cloud Gateway

Retrieve the URL for Spring Cloud Gateway and open it in a browser:

```shell
open "https://${GATEWAY_URL}"
```

You should see the ACME Fitness Store Application:

![An image of the ACME Fitness Store Application homepage](media/homepage.png)

Explore the application, but notice that not everything is functioning yet. Continue on to
Unit 2 to configure Single Sign On to enable the rest of the functionality. 

### Explore the API using API Portal

Assign an endpoint to API Portal and open it in a browser:

```shell
az spring-cloud api-portal update --assign-endpoint true
export PORTAL_URL=$(az spring-cloud api-portal show | jq -r '.properties.url')

open "https://${PORTAL_URL}"
```

## Unit 2 - Configure Single Sign On

The following section steps through creating a Single Sign On Provider using Azure AD. 
To use an existing provider, skip ahead to [Using an Existing SSO Provider](#using-an-existing-sso-identity-provider)

### Register Application with Azure AD

Create an Application registration with Azure AD and save the output.

```shell
az ad app create --display-name acme-fitness-store > ad.json
```

Retrieve the Application ID and collect the client secret:

```shell
export APPLICATION_ID=$(cat ad.json | jq -r '.appId')

az ad app credential reset --id ${APPLICATION_ID} --append > sso.json
```

Assign a Service Principal to the Application Registration

```shell
az ad sp create --id ${APPLICATION_ID}
```

More detailed instructions on Application Registrations can be found [here](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app).

### Prepare your environment for deployments

Set the environment using the provided script and verify the environment variables are set:

```shell
source ./azure/setup-sso-variables-ad.sh

echo ${CLIENT_ID}
echo ${CLIENT_SECRET}
echo ${TENANT_ID}
echo ${ISSUER_URI}
echo ${JWK_SET_URI}
```

The `ISSUER_URI` shhould take the form `https://login.microsoftonline.com/${ENANT_ID}/v2.0`
The `JWK_SET_URI` should take the form `https://login.microsoftonline.com/${ENANT_ID}/discovery/v2.0/keys`

Add the necessary redirect URIs to the Azure AD Application Registration:

```shell
az ad app update --id ${APPLICATION_ID} \
    --reply-urls "https://${GATEWAY_URL}/login/oauth2/code/sso" "https://${PORTAL_URL}/oauth2-redirect.html" "https://${PORTAL_URL}/login/oauth2/code/sso"
```

Detailed information about redirect URIs can be found [here](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app#add-a-redirect-uri).

### Using an Existing SSO Identity Provider

> Note: Continue on to [Configure Spring Cloud Gateway with SSO](#configure-spring-cloud-gateway-with-sso) if you 
> just created an Azure AD Application Registration

To use an existing SSO Identity Provider, copy the existing template

```shell
cp ./azure/setup-sso-variables-template.sh ./azure/setup-sso-variables.sh
```

Open `./azure/setup-sso-variables.sh` and provide the required information.

```shell
export CLIENT_ID=change-me        # Your SSO Provider Client ID
export CLIENT_SECRET=change-me    # Your SSO Provider Client Secret
export ISSUER_URI=change-me       # Your SSO Provider Issuer URI
export JWK_SET_URI=change-me      # Your SSO Provider Json Web Token URI
```

The `issuer-uri` configuration should follow Spring Boot convention, as described in the official Spring Boot documentation:
The provider needs to be configured with an issuer-uri which is the URI that the it asserts as its Issuer Identifier. For example, if the issuer-uri provided is "https://example.com", then an OpenID Provider Configuration Request will be made to "https://example.com/.well-known/openid-configuration". The result is expected to be an OpenID Provider Configuration Response. 
Note that only authorization servers supporting OpenID Connect Discovery protocol can be used

The `JWK_SET_URI` typically takes the form `${SSUER_URI}/$VERSION/keys` 

Set the environment:

```shell
source ./azure/setup-sso-variables.sh
```

Add the following to your SSO provider's list of approved redirect URIs:

```shell
echo "https://${GATEWAY_URL}/login/oauth2/code/sso"
echo "https://${PORTAL_URL}/oauth2-redirect.html" 
echo "https://${PORTAL_URL}/login/oauth2/code/sso"
```

### Configure Spring Cloud Gateway with SSO

Configure Spring Cloud Gateway with SSO enabled:

```shell
export GATEWAY_URL=$(az spring-cloud gateway show | jq -r '.properties.url')

az spring-cloud gateway update \
    --api-description "ACME Fitness Store API" \
    --api-title "ACME Fitness Store" \
    --api-version "v1.0" \
    --server-url "https://${GATEWAY_URL}" \
    --allowed-origins "*" \
    --client-id ${CLIENT_ID} \
    --client-secret ${CLIENT_SECRET} \
    --scope ${SCOPE} \
    --issuer-uri ${ISSUER_URI}
```

### Deploy the Identity Service Application

Create the identity service application

```shell
az spring-cloud app create --name ${IDENTITY_SERVICE_APP} --instance-count 1 --memory 1Gi
```

Bind the identity service to Application Configuration Service

```shell
az spring-cloud application-configuration-service bind --app ${IDENTITY_SERVICE_APP}
```

Create routing rules for the identity service application

```shell
az spring-cloud gateway route-config create \
    --name ${IDENTITY_SERVICE_APP} \
    --app-name ${IDENTITY_SERVICE_APP} \
    --routes-file azure/routes/identity-service.json
```

Bind to Service Registry:

```shell
az spring-cloud service-registry bind --app ${IDENTITY_SERVICE_APP}
```

Deploy the Identity Service:

```shell
az spring-cloud app deploy --name ${IDENTITY_SERVICE_APP} \
    --env "SPRING_SECURITY_OAUTH2_RESOURCESERVER_JWT_JWK_SET_URI=${JWK_SET_URI}" \
    --config-file-pattern identity \
    --source-path apps/acme-identity
```

### Update Existing Applications

Update the existing applications to use authorization information from Spring Cloud Gateway:

```shell
# Update the Cart Service
az spring-cloud app update --name ${CART_SERVICE_APP} \
    --env "AUTH_URL=https://${GATEWAY_URL}" "CART_PORT=8080" "REDIS_CONNECTIONSTRING=${REDIS_CONN_STR}"
    
# Update the Order Service
az spring-cloud app  update --name ${ORDER_SERVICE_APP} \
    --env "AcmeServiceSettings__AuthUrl=https://${GATEWAY_URL}" "ConnectionStrings__OrderContext=$POSTGRES_CONNECTION_STR"
```

### Access the Application through Spring Cloud Gateway

Retrieve the URL for Spring Cloud Gateway and open it in a browser:

```shell
open "https://${GATEWAY_URL}"
```

You should see the ACME Fitness Store Application, and be able to log in using your
SSO Credentials. Once logged in, the remaining functionality of the application will
be available. This includes adding items to the cart and placing an order.

### Configure SSO for API Portal

Configure API Portal with SSO enabled:

```shell
export PORTAL_URL=$(az spring-cloud api-portal show | jq -r '.properties.url')

az spring-cloud api-portal update \
    --client-id ${CLIENT_ID} \
    --client-secret ${CLIENT_SECRET}\
    --scope "openid,profile,email" \
    --issuer-uri ${ISSUER_URI}
```

### Explore the API using API Portal

Open API Portal in a browser, this will redirect you to log in now:

```shell
open "https://${PORTAL_URL}"
```

To access the protected APIs, click Authorize and follow the steps that match your
SSO provider. Learn more about API Authorization with API Portal [here](https://docs.vmware.com/en/API-portal-for-VMware-Tanzu/1.0/api-portal/GUID-api-viewer.html#api-authorization)

## Unit 3 - Securely Load Application Secrets 

## Unit 4 - Monitor Applications

## Unit 5 - Set Request Rate Limits

## Unit 6 - Automate with GitHub Actions