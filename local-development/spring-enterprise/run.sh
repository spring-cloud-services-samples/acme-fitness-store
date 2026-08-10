#!/usr/bin/env bash

set -euo pipefail

java -jar ./tanzu-local-authorization-server.jar &

SPRING_PROFILES_ACTIVE=sso java -jar tanzu-spring-cloud-gateway.jar \
  --add-exports java.base/jdk.internal.ref=ALL-UNNAMED \
  --add-exports java.base/sun.security.x509=ALL-UNNAMED \
  --add-opens java.base/java.lang=ALL-UNNAMED \
  --add-opens java.base/java.nio=ALL-UNNAMED \
  --add-opens java.base/sun.nio.ch=ALL-UNNAMED \
  --add-opens java.management/sun.management=ALL-UNNAMED \
  --add-opens jdk.management/com.sun.management.internal=ALL-UNNAMED \
  --spring.config.additional-location=file:./scg-config.yml,file:./routes.yml
