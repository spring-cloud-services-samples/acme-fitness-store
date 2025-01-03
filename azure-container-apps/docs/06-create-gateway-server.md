# Create Gateway Server for Spring
## Introduction
In this guide, you will learn how to create and configure a Gateway Server for Spring component on Azure Container Apps Environment. Gateway for Spring offers an efficient and powerful way to route, manage and handle API requests as part of a microservices architecture. It serves as an API Gateway that routes external requests to different services, adding various capabilities such as filtering, load balancing, and more.

## Prerequisites
- Completion of [05-deploy-and-build-applications](./05-deploy-and-build-applications.md).

## Outputs
By the end of this guide, you will have a running Getaway Server for Spring component on your Azure Container Apps Environment.

## Steps

### 1. Verify variables
Verify the variables to create Gateway Server:
```bash
source setup-env-variables.sh

echo "GATEWAY_COMPONENT_NAME=${GATEWAY_COMPONENT_NAME}"
echo "ROUTE_PATH=${ROUTE_PATH}"
```

### 2. Prepare the routes configuration of the Gateway Server
```bash
cat << EOF > routes.yml
springCloudGatewayRoutes:
- id: "cart-service1"
  uri: "https://${CART_SERVICE_URL}"
  predicates:
    - "Path=/cart/item/add/{userId}"
    - "Method=POST"
  filters:
    - "StripPrefix=0"
- id: "cart-service2"
  uri: "https://${CART_SERVICE_URL}"
  predicates:
    - "Path=/cart/item/modify/{userId}"
    - "Method=POST"
  filters:
    - "StripPrefix=0"
- id: "cart-service3"
  uri: "https://${CART_SERVICE_URL}"
  predicates:
    - "Path=/cart/items/{userId}"
    - "Method=GET"
  filters:
    - "StripPrefix=0"
- id: "cart-service4"
  uri: "https://${CART_SERVICE_URL}"
  predicates:
    - "Path=/cart/clear/{userId}"
    - "Method=GET"
  filters:
    - "StripPrefix=0"
- id: "cart-service5"
  uri: "https://${CART_SERVICE_URL}"
  predicates:
    - "Path=/cart/total/{userId}"
    - "Method=GET"
  filters:
    - "StripPrefix=0"
- id: "catalog-service1"
  uri: "https://${CATALOG_SERVICE_URL}"
  predicates:
    - "Path=/products"
    - "Method=GET"
  filters:
    - "StripPrefix=0"
- id: "catalog-service2"
  uri: "https://${CATALOG_SERVICE_URL}"
  predicates:
    - "Path=/products/{id}"
    - "Method=GET"
  filters:
    - "StripPrefix=0"
- id: "catalog-service3"
  uri: "https://${CATALOG_SERVICE_URL}"
  predicates:
    - "Path=/products"
    - "Method=POST"
  filters:
    - "StripPrefix=0"
- id: "catalog-service4"
  uri: "https://${CATALOG_SERVICE_URL}"
  predicates:
    - "Path=/products/{id}"
    - "Method=POST"
  filters:
    - "StripPrefix=0"
- id: "catalog-service5"
  uri: "https://${CATALOG_SERVICE_URL}"
  predicates:
    - "Path=/catalogliveness"
    - "Method=GET"
  filters:
    - "StripPrefix=0"
    - "SetPath=/actuator/health/liveness"
- id: "catalog-service6"
  uri: "https://${CATALOG_SERVICE_URL}"
  predicates:
    - "Path=/static/images/{id}"
    - "Method=GET"
  filters:
    - "StripPrefix=0"
- id: "frontend"
  uri: "https://${FRONTEND_URL}"
  predicates:
    - "Path=/**"
    - "Method=GET"
  order: "1000"
  filters:
    - "StripPrefix=0"
- id: "order-service1"
  uri: "https://${ORDER_SERVICE_URL}"
  predicates:
    - "Path=/order/add/{userId}"
    - "Method=POST"
  filters:
    - "StripPrefix=0"
- id: "order-service2"
  uri: "https://${ORDER_SERVICE_URL}"
  predicates:
    - "Path=/order/{userId}"
    - "Method=GET"
  filters:
    - "StripPrefix=0"
EOF
```

### 3. Create the Gateway Server for Spring Java component
Create a Gateway Server on the existing Azure Container Apps Environment and get the gateway URL:
```bash
export GATEWAY_URL=$(az containerapp env java-component gateway-for-spring create \
    --environment ${ENVIRONMENT} \
    --resource-group ${RESOURCE_GROUP} \
    --name ${GATEWAY_COMPONENT_NAME} \
    --route-yaml ${ROUTE_PATH} \
    --query properties.ingress.fqdn \
    -o tsv)
```

### 4. Access the Application through Spring Cloud Gateway
Retrieve the URL for Spring Cloud Gateway and open it in a browser:
```bash
open "https://${GATEWAY_URL}"
```
If using Azure Cloud Shell or Windows, open the output from the following command in a browser:
```bash
echo "https://${GATEWAY_URL}"
```
You should see the Acme Fitness Store application:
![An image of the ACME Fitness Store Application homepage](../media/homepage.png)

## Next Steps

- Follow [07-integrate-with-azure-database-for-postgresql-and-azure-cache-for-redis](./07-integrate-with-azure-database-for-postgresql-and-azure-cache-for-redis.md) to Integrate with persistent stores outside the applications.

