#!/bin/bash

set -xu

: "${RESOURCE_GROUP:?'must be set'}"
: "${SPRING_CLOUD_SERVICE:?'must be set'}"
: "${CART_SERVICE_APP:?'must be set'}"
: "${ORDER_SERVICE_APP:?'must be set'}"
: "${CATALOG_SERVICE_APP:?'must be set'}"
: "${FRONTEND_APP:?'must be set'}"
: "${IDENTITY_SERVICE_APP:?'must be set'}"
: "${CLIENT_ID:?'must be set'}"
: "${CLIENT_SECRET:?'must be set'}"
: "${SCOPE:?'must be set'}"
: "${ISSUER_URI:?'must be set'}"

main() {
  local gateway_url cart order catalog shopping identity

  az configure --defaults group="$RESOURCE_GROUP" spring-cloud="$SPRING_CLOUD_SERVICE"

  az spring-cloud gateway update --assign-endpoint true

  gateway_url=$(az spring-cloud gateway show | jq -r '.properties.url')

  az spring-cloud gateway update \
    --api-description "Acme Fitness Store API" \
    --api-title "Acme Fitness Store" \
    --api-version "v1.0" \
    --server-url "https://$gateway_url" \
    --allowed-origins "*" \
    --client-id "${CLIENT_ID}" \
    --client-secret "${CLIENT_SECRET}" \
    --scope "${SCOPE}" \
    --issuer-uri "${ISSUER_URI}"

  cart=$(az spring-cloud gateway route-config show --name "$CART_SERVICE_APP")
  if [[ -z "$cart" ]]; then
    az spring-cloud gateway route-config create \
      --name "$CART_SERVICE_APP" \
      --app-name "$CART_SERVICE_APP" \
      --routes-file cart-service.json
  else
    az spring-cloud gateway route-config update \
      --name "$CART_SERVICE_APP" \
      --app-name "$CART_SERVICE_APP" \
      --routes-file cart-service.json
  fi

  order=$(az spring-cloud gateway route-config show --name "$ORDER_SERVICE_APP")
  if [[ -z "$order" ]]; then
    az spring-cloud gateway route-config create \
      --name "$ORDER_SERVICE_APP" \
      --app-name "$ORDER_SERVICE_APP" \
      --routes-file order-service.json
  else
    az spring-cloud gateway route-config update \
      --name "$ORDER_SERVICE_APP" \
      --app-name "$ORDER_SERVICE_APP" \
      --routes-file order-service.json
  fi

  catalog=$(az spring-cloud gateway route-config show --name "$CATALOG_SERVICE_APP")
  if [[ -z "$catalog" ]]; then
    az spring-cloud gateway route-config create \
      --name "$CATALOG_SERVICE_APP" \
      --app-name "$CATALOG_SERVICE_APP" \
      --routes-file catalog-service.json
  else
    az spring-cloud gateway route-config update \
      --name "$CATALOG_SERVICE_APP" \
      --app-name "$CATALOG_SERVICE_APP" \
      --routes-file catalog-service.json
  fi

  shopping=$(az spring-cloud gateway route-config show --name "$FRONTEND_APP")
  if [[ -z "$shopping" ]]; then
    az spring-cloud gateway route-config create \
      --name "$FRONTEND_APP" \
      --app-name "$FRONTEND_APP" \
      --routes-file frontend.json
  else
    az spring-cloud gateway route-config update \
      --name "$FRONTEND_APP" \
      --app-name "$FRONTEND_APP" \
      --routes-file frontend.json
  fi

  identity=$(az spring-cloud gateway route-config show --name "$IDENTITY_SERVICE_APP")
  if [[ -z "$identity" ]]; then
    az spring-cloud gateway route-config create \
      --name "$IDENTITY_SERVICE_APP" \
      --app-name "$IDENTITY_SERVICE_APP" \
      --routes-file identity-service.json
  else
    az spring-cloud gateway route-config update \
      --name "$IDENTITY_SERVICE_APP" \
      --app-name "$IDENTITY_SERVICE_APP" \
      --routes-file identity-service.json
  fi
}

main
