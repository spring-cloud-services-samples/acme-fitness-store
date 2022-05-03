#!/bin/bash

set -xu

: "${RESOURCE_GROUP:?'must be set'}"
: "${SPRING_CLOUD_SERVICE:?'must be set'}"
: "${CLIENT_ID:?'must be set'}"
: "${CLIENT_SECRET:?'must be set'}"
: "${SCOPE:?'must be set'}"
: "${ISSUER_URI:?'must be set'}"

main() {
  local gateway_url portal_url

  az configure --defaults group="$RESOURCE_GROUP" spring-cloud="$SPRING_CLOUD_SERVICE"

  az spring-cloud gateway update --assign-endpoint true
  gateway_url=$(az spring-cloud gateway show | jq -r '.properties.url')

  az spring-cloud api-portal update --assign-endpoint true
  portal_url=$(az spring-cloud api-portal show | jq -r '.properties.url')

  az ad app update \
      --id "${CLIENT_ID}" \
      --reply-urls "https://${gateway_url}/login/oauth2/code/sso" "https://${portal_url}/oauth2-redirect.html" "https://${portal_url}/login/oauth2/code/sso"

  az spring-cloud api-portal update \
      --client-id "${CLIENT_ID}" \
      --client-secret "${CLIENT_SECRET}"\
      --scope "openid,profile,email" \
      --issuer-uri "${ISSUER_URI}"
}

main
