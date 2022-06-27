#!/bin/bash

set -euo pipefail

: "${AZURE_CREDENTIALS:?'must be set'}"
: "${BACKEND_CONFIG:?'must be set'}"

# Prepare terraform credentials
readonly CREDENTIALS=$(
  cat <<EOF
  $AZURE_CREDENTIALS
EOF
)

# We don't want to expose credentials in the logs.
set +x

readonly CLIENT_ID=$(echo "$CREDENTIALS" | jq -r '.clientId')
echo "::add-mask::$CLIENT_ID"
readonly CLIENT_SECRET=$(echo "$CREDENTIALS" | jq -r '.clientSecret')
echo "::add-mask::$CLIENT_SECRET"
readonly SUBSCRIPTION_ID=$(echo "$CREDENTIALS" | jq -r '.subscriptionId')
echo "::add-mask::$SUBSCRIPTION_ID"
readonly TENANT_ID=$(echo "$CREDENTIALS" | jq -r '.tenantId')
echo "::add-mask::$TENANT_ID"

set -x

{
  echo "ARM_CLIENT_ID=$CLIENT_ID"
  echo "ARM_CLIENT_SECRET=$CLIENT_SECRET"
  echo "ARM_SUBSCRIPTION_ID=$SUBSCRIPTION_ID"
  echo "ARM_TENANT_ID=$TENANT_ID"
} >>"$GITHUB_ENV"

# Prepare Backend Config
cat <<EOF >azurerm.tfbackend
 $BACKEND_CONFIG
EOF
