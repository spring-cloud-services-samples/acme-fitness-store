#!/bin/bash

set -euo pipefail

readonly PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")"/.. && pwd)"
readonly APPS_ROOT="${PROJECT_ROOT}/apps"

readonly REDIS_NAME="acme-fitness-redis"
readonly ORDER_SERVICE_POSTGRES_CONNECTION="order_service_postgres"
readonly CART_SERVICE_REDIS_CONNECTION="cart_service_redis"
readonly ACMEFIT_CATALOG_DB_NAME="acmefit_catalog"
readonly ACMEFIT_ORDER_DB_NAME="acmefit_order"
readonly ACMEFIT_POSTGRES_DB_PASSWORD=$(openssl rand -base64 32)
readonly ACMEFIT_POSTGRES_DB_USER=dbadmin
readonly ACMEFIT_POSTGRES_SERVER="acmefit-db-server"
readonly ORDER_DB_NAME="orders"
readonly CART_SERVICE="cart-service"
readonly IDENTITY_SERVICE="identity-service"
readonly ORDER_SERVICE="order-service"
readonly PAYMENT_SERVICE="payment-service"
readonly CATALOG_SERVICE="catalog-service"
readonly FRONTEND_APP="frontend"
readonly CUSTOM_BUILDER="no-bindings-builder"

RESOURCE_GROUP=''
SPRING_CLOUD_INSTANCE=''

function configure_defaults() {
  echo "Configure azure defaults resource group: $RESOURCE_GROUP and spring-cloud $SPRING_CLOUD_INSTANCE"
  az configure --defaults group=$RESOURCE_GROUP spring-cloud=$SPRING_CLOUD_INSTANCE
}

function create_dependencies() {
  echo "Creating Azure Cache for Redis Instance $REDIS_NAME in location eastus"
  az redis create --location eastus --name $REDIS_NAME --resource-group $RESOURCE_GROUP --sku Basic --vm-size c0

  echo "Creating Azure Database for Postgres $ACMEFIT_POSTGRES_SERVER"

  az postgres server create --name $ACMEFIT_POSTGRES_SERVER \
    --resource-group $RESOURCE_GROUP \
    --location "South Central US" \
    --admin-user $ACMEFIT_POSTGRES_DB_USER \
    --admin-password $ACMEFIT_POSTGRES_DB_PASSWORD \
    --sku-name GP_Gen5_2 \
    --version 11

  echo "Creating Postgres Database $ACMEFIT_CATALOG_DB_NAME"
  az postgres db create \
    --name $ACMEFIT_CATALOG_DB_NAME \
    --server-name $ACMEFIT_POSTGRES_SERVER

  echo "Creating Postgres Database $ACMEFIT_ORDER_DB_NAME"
  az postgres db create \
    --name $ACMEFIT_ORDER_DB_NAME \
    --server-name $ACMEFIT_POSTGRES_SERVER
}

function create_builder() {
  echo "Creating a custom builder with name $CUSTOM_BUILDER and configuration $PROJECT_ROOT/azure-spring-cloud/builder.json"
  az spring-cloud build-service builder create -n $CUSTOM_BUILDER --builder-file "$PROJECT_ROOT/azure-spring-cloud/builder.json"
}

function configure_gateway() {
  az spring-cloud gateway update --assign-endpoint true
  local gateway_url=$(az spring-cloud gateway show | jq -r '.properties.url')

  echo "Configuring Spring Cloud Gateway"
  az spring-cloud gateway update \
    --api-description "ACME Fitness API" \
    --api-title "ACME Fitness" \
    --api-version "v.01" \
    --server-url "https://$gateway_url" \
    --allowed-origins "*" \
    --client-id ${CLIENT_ID} \
    --client-secret ${CLIENT_SECRET} \
    --scope "openid,profile" \
    --issuer-uri ${ISSUER_URI}
}

function configure_acs() {
  echo "Configuring Application Configuration Service to use repo: https://github.com/spring-cloud-services-samples/acme_fitness_demo"
  az spring-cloud application-configuration-service git repo add --name animal-rescue-config --label Azure --patterns "default,catalog,identity,payment" --uri "https://github.com/spring-cloud-services-samples/acme_fitness_demo" --search-paths config
}

function create_cart_service() {
  echo "Creating cart-service app"
  az spring-cloud app create --name $CART_SERVICE
  az spring-cloud gateway route-config create --name $CART_SERVICE --app-name $CART_SERVICE --routes-file "$PROJECT_ROOT/azure-spring-cloud/routes/cart-service.json"

  az spring-cloud connection create redis \
    --service $SPRING_CLOUD_INSTANCE \
    --deployment default \
    --resource-group $RESOURCE_GROUP \
    --target-resource-group $RESOURCE_GROUP \
    --server $REDIS_NAME \
    --database 0 \
    --app $CART_SERVICE \
    --client-type java \
    --connection $CART_SERVICE_REDIS_CONNECTION
}

function create_identity_service() {
  echo "Creating identity service"
  az spring-cloud app create --name $IDENTITY_SERVICE
  az spring-cloud application-configuration-service bind --app $IDENTITY_SERVICE
  az spring-cloud gateway route-config create --name $IDENTITY_SERVICE --app-name $IDENTITY_SERVICE --routes-file "$PROJECT_ROOT/azure-spring-cloud/routes/identity-service.json"
}

function create_order_service() {
  echo "Creating order service"
  az spring-cloud app create --name $ORDER_SERVICE
  az spring-cloud gateway route-config create --name $ORDER_SERVICE --app-name $ORDER_SERVICE --routes-file "$PROJECT_ROOT/azure-spring-cloud/routes/order-service.json"

  az spring-cloud connection create postgres \
    --resource-group $RESOURCE_GROUP \
    --service $SPRING_CLOUD_INSTANCE \
    --connection $ORDER_SERVICE_POSTGRES_CONNECTION \
    --app $ORDER_SERVICE \
    --deployment default \
    --tg $RESOURCE_GROUP \
    --server $ACMEFIT_POSTGRES_SERVER \
    --database $ACMEFIT_ORDER_DB_NAME \
    --secret name=${ACMEFIT_POSTGRES_DB_USER} secret=${ACMEFIT_POSTGRES_DB_PASSWORD} \
    --client-type java
}

function create_catalog_service() {
  echo "Creating catalog service"
  az spring-cloud app create --name $CATALOG_SERVICE
  az spring-cloud application-configuration-service bind --app $CATALOG_SERVICE
  az spring-cloud gateway route-config create --name $CATALOG_SERVICE --app-name $CATALOG_SERVICE --routes-file "$PROJECT_ROOT/azure-spring-cloud/routes/catalog-service.json"

  az spring-cloud connection create postgres \
    --resource-group $RESOURCE_GROUP \
    --service $SPRING_CLOUD_INSTANCE \
    --app $CATALOG_SERVICE \
    --deployment default \
    --tg $RESOURCE_GROUP \
    --server $ACMEFIT_POSTGRES_SERVER \
    --database $ACMEFIT_CATALOG_DB_NAME \
    --secret name=${ACMEFIT_POSTGRES_DB_USER} secret=${ACMEFIT_POSTGRES_DB_PASSWORD} \
    --client-type springboot
}

function create_payment_service() {
  echo "Creating payment service"
  az spring-cloud app create --name $PAYMENT_SERVICE
  az spring-cloud application-configuration-service bind --app $PAYMENT_SERVICE
  az spring-cloud gateway route-config create --name $PAYMENT_SERVICE --app-name $PAYMENT_SERVICE --routes-file "$PROJECT_ROOT/azure-spring-cloud/routes/payment-service.json"
}

function create_frontend_app() {
  echo "Creating frontend"
  az spring-cloud app create --name $FRONTEND_APP
  az spring-cloud gateway route-config create --name $FRONTEND_APP --app-name $FRONTEND_APP --routes-file "$PROJECT_ROOT/azure-spring-cloud/routes/frontend.json"
}

function deploy_cart_service() {
  echo "Deploying cart-service application"
  local redis_conn_str=$(az spring-cloud connection show -g $RESOURCE_GROUP --service $SPRING_CLOUD_INSTANCE --deployment default --app $CART_SERVICE --connection $CART_SERVICE_REDIS_CONNECTION | jq -r '.configurations[0].value')
  local gateway_url=$(az spring-cloud gateway show | jq -r '.properties.url')
  az spring-cloud app deploy --name $CART_SERVICE \
    --builder $CUSTOM_BUILDER \
    --env "CART_PORT=8080" "REDIS_CONNECTIONSTRING=$redis_conn_str" "AUTH_URL=https://${gateway_url}" \
    --source-path "$APPS_ROOT/acme-cart"
}

function deploy_identity_service() {
  echo "Deploying identity-service application"
  az spring-cloud app deploy --name $IDENTITY_SERVICE \
    --env "SPRING_SECURITY_OAUTH2_RESOURCESERVER_JWT_JWK_SET_URI=${JWK_SET_URI}" \
    --config-file-pattern identity \
    --source-path "$APPS_ROOT/acme-identity" #TODO: is this URI necessary?
}

function deploy_order_service() {
  echo "Deploying user-service application"
  local gateway_url=$(az spring-cloud gateway show | jq -r '.properties.url')
  local postgres_connection_url=$(az spring-cloud connection show -g $RESOURCE_GROUP --service $SPRING_CLOUD_INSTANCE --deployment default --connection $ORDER_SERVICE_POSTGRES_CONNECTION --app $ORDER_SERVICE | jq '.configurations[0].value' -r)

  az spring-cloud app deploy --name $ORDER_SERVICE \
    --builder $CUSTOM_BUILDER \
    --env "OrderDatabaseSettings__ConnectionString=$postgres_connection_url" "AcmeServiceSettings__AuthUrl=https://${gateway_url}" "AcmeServiceSettings__PaymentServiceUrl=http://payment-service.default.svc.cluster.local" \
    --source-path "$APPS_ROOT/acme-order"
}

function deploy_catalog_service() {
  echo "Deploying catalog-service application"

  az spring-cloud app deploy --name $CATALOG_SERVICE \
    --config-file-pattern catalog \
    --source-path "$APPS_ROOT/acme-catalog"
}

function deploy_payment_service() {
  echo "Deploying payment-service application"

  az spring-cloud app deploy --name $PAYMENT_SERVICE \
    --config-file-pattern payment \
    --source-path "$APPS_ROOT/acme-payment"
}

function deploy_frontend_app() {
  echo "Deploying frontend application"

  rm -rf "$APPS_ROOT/acme-shopping/node_modules"
  az spring-cloud app deploy --name $FRONTEND_APP \
    --builder $CUSTOM_BUILDER \
    --source-path "$APPS_ROOT/acme-shopping"
}

function main() {
  configure_defaults
  create_dependencies
  create_builder
  configure_acs
  configure_gateway
  create_identity_service
  create_cart_service
  create_order_service
  create_payment_service
  create_catalog_service
  create_frontend_app

  deploy_identity_service
  deploy_cart_service
  deploy_order_service
  deploy_payment_service
  deploy_catalog_service
  deploy_frontend_app
}

function usage() {
  echo 1>&2
  echo "Usage: $0 -g <resource_group> -s <spring_cloud_instance>" 1>&2
  echo 1>&2
  echo "Options:" 1>&2
  echo "  -g <namespace>              the Azure resource group to use for the deployment" 1>&2
  echo "  -s <spring_cloud_instance>  the name of the Azure Spring Cloud Instance to use" 1>&2
  echo 1>&2
  exit 1
}

function check_args() {
  if [[ -z $RESOURCE_GROUP ]]; then
    echo "Provide a valid resource group with -g"
    usage
  fi

  if [[ -z $SPRING_CLOUD_INSTANCE ]]; then
    echo "Provide a valid spring cloud instance name with -s"
    usage
  fi
}

while getopts ":g:s:" options; do
  case "$options" in
  g)
    RESOURCE_GROUP="$OPTARG"
    ;;
  s)
    SPRING_CLOUD_INSTANCE="$OPTARG"
    ;;
  *)
    usage
    exit 1
    ;;
  esac

  case $OPTARG in
  -*)
    echo "Option $options needs a valid argument"
    exit 1
    ;;
  esac
done

check_args
main
