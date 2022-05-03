#!/bin/bash

set -xu

: "${RESOURCE_GROUP:?'must be set'}"
: "${SPRING_CLOUD_SERVICE:?'must be set'}"
: "${IDENTITY_SERVICE_APP:?'must be set'}"
: "${CART_SERVICE_APP:?'must be set'}"
: "${ORDER_SERVICE_APP:?'must be set'}"
: "${CATALOG_SERVICE_APP:?'must be set'}"
: "${FRONTEND_APP:?'must be set'}"
: "${CLIENT_ID:?'must be set'}"
: "${CLIENT_SECRET:?'must be set'}"
: "${SCOPE:?'must be set'}"
: "${ISSUER_URI:?'must be set'}"
: "${KEY_VAULT:?'must be set'}"

main() {
  local gateway_url portal_url

  az configure --defaults group="$RESOURCE_GROUP" spring-cloud="$SPRING_CLOUD_SERVICE"

  gateway_url=$(az spring-cloud gateway show | jq -r '.properties.url')

  portal_url=$(az spring-cloud api-portal show | jq -r '.properties.url')

  az ad app update \
      --id "$CLIENT_ID" \
      --reply-urls "https://$gateway_url/login/oauth2/code/sso" "https://$portal_url/oauth2-redirect.html" "https://$portal_url/login/oauth2/code/sso"

  az spring-cloud api-portal update \
      --client-id "$CLIENT_ID" \
      --client-secret "$CLIENT_SECRET"\
      --scope "openid,profile,email" \
      --issuer-uri "$ISSUER_URI"

  az spring-cloud app identity assign --name "$CART_SERVICE_APP"
  cart_service_app_identity=$(az spring-cloud app show --name "$CART_SERVICE_APP" | jq -r '.identity.principalId')
  az keyvault set-policy --name "$KEY_VAULT" --object-id "$cart_service_app_identity" --secret-permissions get list

  az spring-cloud app identity assign --name "$ORDER_SERVICE_APP"
  order_service_app_identity=$(az spring-cloud app show --name "$ORDER_SERVICE_APP" | jq -r '.identity.principalId')
  az keyvault set-policy --name "$KEY_VAULT" --object-id "$order_service_app_identity" --secret-permissions get list

  az spring-cloud app identity assign --name "$CATALOG_SERVICE_APP"
  catalog_service_app_identity=$(az spring-cloud app show --name "$CATALOG_SERVICE_APP" | jq -r '.identity.principalId')
  az keyvault set-policy --name "$KEY_VAULT" --object-id "$catalog_service_app_identity" --secret-permissions get list

  az spring-cloud app identity assign --name "$IDENTITY_SERVICE_APP"
  identity_service_app_identity=$(az spring-cloud app show --name "$IDENTITY_SERVICE_APP" | jq -r '.identity.principalId')
  az keyvault set-policy --name "$KEY_VAULT" --object-id "$identity_service_app_identity" --secret-permissions get list

  az spring-cloud app identity assign --name "$FRONTEND_APP"
  frontend_app_identity=$(az spring-cloud app show --name "$FRONTEND_APP" | jq -r '.identity.principalId')
  az keyvault set-policy --name "$KEY_VAULT" --object-id "$frontend_app_identity" --secret-permissions get list
}

main
