#!/bin/bash

set -xu

: "${RESOURCE_GROUP:?'must be set'}"
: "${SPRING_CLOUD_SERVICE:?'must be set'}"
: "${ORDER_SERVICE_DB_CONNECTION:?'must be set'}"
: "${ORDER_SERVICE_APP:?'must be set'}"
: "${ORDER_SERVICE_DB:?'must be set'}"
: "${CATALOG_SERVICE_DB_CONNECTION:?'must be set'}"
: "${CATALOG_SERVICE_APP:?'must be set'}"
: "${CATALOG_SERVICE_DB:?'must be set'}"
: "${CART_SERVICE_CACHE_CONNECTION:?'must be set'}"
: "${CART_SERVICE_APP:?'must be set'}"
: "${AZURE_CACHE_NAME:?'must be set'}"
: "${POSTGRES_SERVER:?'must be set'}"
: "${POSTGRES_SERVER_USER:?'must be set'}"
: "${POSTGRES_SERVER_PASSWORD:?'must be set'}"

main() {
  az spring-cloud connection create postgres-flexible \
    --resource-group "${RESOURCE_GROUP}" \
    --service "${SPRING_CLOUD_SERVICE}" \
    --connection "${ORDER_SERVICE_DB_CONNECTION}" \
    --app "${ORDER_SERVICE_APP}" \
    --deployment default \
    --tg "${RESOURCE_GROUP}" \
    --server "${POSTGRES_SERVER}" \
    --database "${ORDER_SERVICE_DB}" \
    --secret name="${POSTGRES_SERVER_USER}" secret="${POSTGRES_SERVER_PASSWORD}" \
    --client-type dotnet

  az spring-cloud connection create postgres-flexible \
    --resource-group "${RESOURCE_GROUP}" \
    --service "${SPRING_CLOUD_SERVICE}" \
    --connection "${CATALOG_SERVICE_DB_CONNECTION}" \
    --app "${CATALOG_SERVICE_APP}" \
    --deployment default \
    --tg "${RESOURCE_GROUP}" \
    --server "${POSTGRES_SERVER}" \
    --database "${CATALOG_SERVICE_DB}" \
    --secret name="${POSTGRES_SERVER_USER}" secret="${POSTGRES_SERVER_PASSWORD}" \
    --client-type springboot

  az spring-cloud connection create redis \
    --resource-group "${RESOURCE_GROUP}" \
    --service "${SPRING_CLOUD_SERVICE}" \
    --connection "$CART_SERVICE_CACHE_CONNECTION" \
    --app "${CART_SERVICE_APP}" \
    --deployment default \
    --tg "${RESOURCE_GROUP}" \
    --server "${AZURE_CACHE_NAME}" \
    --database 0 \
    --client-type java
}

main
