# Containerize Applications using Buildpacks
## Introduction
This guide shows you how to create an Azure Container Registry (ACR), how to build the polyglot applications using Pack CLI on your local development machine and push them to Azure Container Registry (ACR).
Buildpacks provide a higher-level abstraction for building container images. They take your application source code and transform it into a container image without the need for a Dockerfile. This process involves detecting the type of application, compiling the code, and packaging it with the necessary runtime dependencies. Buildpacks are particularly useful for polyglot environments where multiple languages and frameworks are used, as they can automatically handle the specifics of each technology stack. For more information, refer to the [official Buildpacks documentation](https://buildpacks.io/docs/).

## Prerequisites
- Completion of  [03-create-eureke-server](./03-create-eureke-server.md).
- Install Pack CLI. For instructions, refer to [Pack CLI installation guide](https://buildpacks.io/docs/for-platform-operators/how-to/integrate-ci/pack/).
- Docker installed on your local machine.

## Outputs
- Azure Container Registry (ACR). This ACR will be used to store application images built by buildpack
- Docker images for each application pushed to your ACR.

## Steps

### 1. Verify variables
Verify the variables to create Azure Container Registry (ACR) and build the container images:
```bash
source setup-env-variables.sh

echo "ACR_NAME=${ACR_NAME}"
echo "ACR_LOGIN_SERVER=${ACR_LOGIN_SERVER}"
echo "CATALOG_SERVICE_APP=${CATALOG_SERVICE_APP}"
echo "PAYMENT_SERVICE_APP=${PAYMENT_SERVICE_APP}"
echo "ORDER_SERVICE_APP=${ORDER_SERVICE_APP}"
echo "CART_SERVICE_APP=${CART_SERVICE_APP}"
echo "FRONTEND_APP=${FRONTEND_APP}"
echo "APP_IMAGE_TAG=${APP_IMAGE_TAG}"
```

### 2. Prepare resources for Azure Container Apps used
The source built previously for the Azure Spring Apps Enterprise plan does not include the Config Server dependency and configuration required by Azure Container Apps. Therefore, use the following commands to copy the necessary resources to the corresponding application.
```bash
cp azure-container-apps/resources/apps . -r
```

### 3. Open your Docker environment
Open your docker environment to build and push the images to ACR.

### 4. Build applications
The following commands will build each application using the Pack CLI and the Paketo Buildpacks builder. Each application will be built with the necessary runtime dependencies and tagged with the specified image tag. The built images will then be pushed to the Azure Container Registry.
```bash
# Build Catalog Service
pack build ${ACR_LOGIN_SERVER}/${CATALOG_SERVICE_APP}:${APP_IMAGE_TAG} \
    --path apps/acme-catalog \
    --builder paketobuildpacks/builder-jammy-base \
    -e BP_JVM_VERSION=17

# Build Payment Service
pack build ${ACR_LOGIN_SERVER}/${PAYMENT_SERVICE_APP}:${APP_IMAGE_TAG} \
    --path apps/acme-payment \
    --builder paketobuildpacks/builder-jammy-base \
    -e BP_JVM_VERSION=17

# Build Order Service
pack build ${ACR_LOGIN_SERVER}/${ORDER_SERVICE_APP}:${APP_IMAGE_TAG} \
    --path apps/acme-order \
    --builder paketobuildpacks/builder-jammy-base

# Build Cart Service
pack build ${ACR_LOGIN_SERVER}/${CART_SERVICE_APP}:${APP_IMAGE_TAG} \
    --path apps/acme-cart \
    --builder paketobuildpacks/builder-jammy-base

# Build Frontend App
pack build ${ACR_LOGIN_SERVER}/${FRONTEND_APP}:${APP_IMAGE_TAG} \
    --path apps/acme-shopping \
    --builder paketobuildpacks/builder-jammy-base
```

### 5. Create Azure Container Registry and Push Images
1. Create Azure Container Registry (ACR) for storing application images built by buildpack:
```bash
az acr create \
    -g ${RESOURCE_GROUP} \
    -n ${ACR_NAME} \
    --sku Premium
```

2. Login the ACR
```bash
az acr login \
    -n ${ACR_NAME} \
    -g ${RESOURCE_GROUP}
```

3. Push Docker images to container registry
```bash
docker push ${ACR_LOGIN_SERVER}/${CATALOG_SERVICE_APP}:${APP_IMAGE_TAG}
docker push ${ACR_LOGIN_SERVER}/${PAYMENT_SERVICE_APP}:${APP_IMAGE_TAG}
docker push ${ACR_LOGIN_SERVER}/${ORDER_SERVICE_APP}:${APP_IMAGE_TAG}
docker push ${ACR_LOGIN_SERVER}/${CART_SERVICE_APP}:${APP_IMAGE_TAG}
docker push ${ACR_LOGIN_SERVER}/${FRONTEND_APP}:${APP_IMAGE_TAG}
```

## Next Steps

- Follow [05-deploy-and-build-applications](./05-deploy-and-build-applications.md) to deploy and build the Acme applications.