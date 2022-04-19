export SUBSCRIPTION=subscription-id                 # replace it with your subscription-id
export RESOURCE_GROUP=resource-group-name           # existing resource group or one that will be created in next steps
export SPRING_CLOUD_SERVICE=azure-spring-cloud-name # name of the service that will be created in the next steps
export LOG_ANALYTICS_WORKSPACE=log-analytics-name   # existing workspace or one that will be created in next steps

export CART_SERVICE_APP="cart-service"
export IDENTITY_SERVICE_APP="identity-service"
export ORDER_SERVICE_APP="order-service"
export PAYMENT_SERVICE_APP="payment-service"
export CATALOG_SERVICE_APP="catalog-service"
export FRONTEND_APP="frontend"

export CUSTOM_BUILDER="no-bindings-builder"

export AZURE_CACHE_NAME="acme-store-cache"
export POSTGRES_SERVER="acmefitdb"
export ORDER_SERVICE_DB="acmefit_order"
export CATALOG_SERVICE_DB="acmefit_catalog"