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
cp ./azure/setup-env-variables.sh ./azure/setup-env-variables.sh
```

Open `./azure/setup-env-variables.sh` and enter the following information:

```shell
export SUBSCRIPTION=subscription-id                 # replace it with your subscription-id
export RESOURCE_GROUP=resource-group-name           # existing resource group or one that will be created in next steps
export SPRING_CLOUD_SERVICE=azure-spring-cloud-name # name of the service that will be created in the next steps
export LOG_ANALYTICS_WORKSPACE=log-analytics-name   # existing workspace or one that will be created in next steps
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

Using the Azure CLI, create an Azure Database for MySQL Flexible Server:

```shell
az postgres flexible-server create --name ${POSTGRES_SERVER} \
    --resource-group${RESOURCE_GROUP} \
    --location ${REGION} \
    --admin-user ${POSTGRES_DB_USER} \
    --admin-password ${POSTGRES_DB_PASSWORD} \
    --yes

# Allow connections from other Azure Services
az postgres flexible-server firewall-rule create --rule-name allAzureIPs \
     --name ${MYSQL_SERVER_NAME} \
     --resource-group ${RESOURCE_GROUP} \
     --start-ip-address 0.0.0.0 --end-ip-address 0.0.0.0
```

Create a database for the order service:

```shell
az postgres db create \
  --name $ORDER_SERVICE_DB \
  --server-name $POSTGRES_SERVER
```

Create a database for the catalog service:

```shell
az postgres db create \
  --name $CATALOG_SERVICE_DB \
  --server-name $POSTGRES_SERVER
```

> Note: wait for all services to be ready before continuing

## Unit 2 - Configure Single Sign On

## Unit 3 - Monitor Applications

## Unit 4 - Automate with GitHub Actions