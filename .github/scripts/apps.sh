#!/bin/bash

set -xu

: "${RESOURCE_GROUP:?'must be set'}"
: "${SPRING_CLOUD_SERVICE:?'must be set'}"
: "${CART_SERVICE_APP:?'must be set'}"
: "${ORDER_SERVICE_APP:?'must be set'}"
: "${PAYMENT_SERVICE_APP:?'must be set'}"
: "${CATALOG_SERVICE_APP:?'must be set'}"
: "${FRONTEND_APP:?'must be set'}"

main() {
  local cart order payment catalog shopping

  az configure --defaults group="$RESOURCE_GROUP" spring-cloud="$SPRING_CLOUD_SERVICE"

  cart=$(az spring-cloud app show --name "$CART_SERVICE_APP")
  if [[ -z "$cart" ]]; then
    az spring-cloud app create --name "$CART_SERVICE_APP" --instance-count 1 --memory 1Gi
  else
    echo "Cart Service is already created."
  fi

  order=$(az spring-cloud app show --name "$ORDER_SERVICE_APP")
  if [[ -z "$order" ]]; then
    az spring-cloud app create --name "$ORDER_SERVICE_APP" --instance-count 1 --memory 1Gi
  else
    echo "Order Service is already created."
  fi

  payment=$(az spring-cloud app show --name "$PAYMENT_SERVICE_APP")
  if [[ -z "$payment" ]]; then
    az spring-cloud app create --name "$PAYMENT_SERVICE_APP" --instance-count 1 --memory 1Gi
  else
    echo "Payment Service is already created."
  fi

  catalog=$(az spring-cloud app show --name "$CATALOG_SERVICE_APP")
  if [[ -z "$catalog" ]]; then
    az spring-cloud app create --name "$CATALOG_SERVICE_APP" --instance-count 1 --memory 1Gi
  else
    echo "Catalog Service is already created."
  fi

  shopping=$(az spring-cloud app show --name "$FRONTEND_APP")
  if [[ -z "$shopping" ]]; then
    az spring-cloud app create --name "$FRONTEND_APP" --instance-count 1 --memory 1Gi
  else
    echo "Shopping Application is already created."
  fi
}

main
