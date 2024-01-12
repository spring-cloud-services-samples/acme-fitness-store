#!/bin/bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/.."
GATEWAY_NAME=gateway-acme-fitness

init() {
  cd "$ROOT_DIR/apps/acme-shopping"
  npm install

  cd "$ROOT_DIR/apps/acme-order"
  dotnet restore
  dotnet build --configuration Release --no-restore

  cd "$ROOT_DIR/apps/acme-catalog"
  ./gradlew assemble
  cd "$ROOT_DIR/apps/acme-identity"
  ./gradlew assemble
  cd "$ROOT_DIR/apps/acme-payment"
  ./gradlew assemble
}

deploy() {
  cf push
}

cd "$ROOT_DIR" || exit 1

case $1 in
init)
  init
  ;;
deploy)
  deploy
  ;;
*)
  echo 'Unknown command. Please specify "init" or "deploy"'
  ;;
esac
