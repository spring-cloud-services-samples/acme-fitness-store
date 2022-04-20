#!/bin/bash

set -xu

: "${RESOURCE_GROUP:?'must be set'}"
: "${SPRING_CLOUD_SERVICE:?'must be set'}"

main() {
  local length

  length=$(az spring-cloud application-configuration-service git repo list \
    --resource-group "$RESOURCE_GROUP" \
    --service "$SPRING_CLOUD_SERVICE" \
    --query "[?name=='acme-fitness-store-config'] | length(@)")

  if [[ -z "$length" || "$length" == "0" ]]; then
    az spring-cloud application-configuration-service git repo add --name acme-fitness-store-config \
      --label Azure \
      --patterns "catalog/default,catalog/key-vault,identity/default,identity/key-vault,payment/default" \
      --resource-group "$RESOURCE_GROUP" \
      --service "$SPRING_CLOUD_SERVICE" \
      --uri "https://github.com/spring-cloud-services-samples/acme_fitness_demo" \
      --search-paths config
  else
    echo "Application Configuration Service is already configured."
  fi
}

main
