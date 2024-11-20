# Local Development

## Local Dependencies

After following instructions in [Spring Enterprise setup](spring-enterprise/README.md) to obtain the JAR.

This will set up the following for you for local development
- Config Server
  - Config in TAS is created by a Repo backed tile. For local development, included [docker-compose.yml](docker-compose.yaml) will start up an instance of config-server on port 8888.

- Eureka Server
  - Spring boot apps (Identify, Catalog, Payment, Assist) communicate via TAS service registry. For local development, included [docker-compose.yml](docker-compose.yaml) starts up a local instance of Eureka discovery server on port 8761.
- Local Tanzu Authorization Server
- Commercial Spring Cloud Gateway

```bash
cd local-development
docker compose -p acme-fitness up -d
```

### Boot up each of the local application following their README

- [acme-cart](../apps/acme-cart/README.md)
    - build local running image
    - local docker compose to run locally
- [acme-catalog](../apps/acme-catalog/README.md)
    - local docker compose dependency
    - start locally via gradle wrapper or / IDE (with `local` active profile)
- [acme-assist](../apps/acme-assist/README.md)
    - local docker compose dependency
    - start locally via maven wrapper / IDE (with `local` active profile)
- [acme-identity](../apps/acme-identity/README.md)
    - start locally via gradle wrapper or / IDE (with `local` active profile)
- [acme-payment](../apps/acme-payment/README.md)
    - start locally via gradle wrapper or / IDE (with local property)
- [acme-order](../apps/acme-order/README.md)
    - local docker compose dependency
    - DotNet run or start via IDE
- [acme-shopping](../apps/acme-shopping/README.md)
    - `npm install` and `npm run start`

### Run E2E Test
Run the Cypress test in the [e2e](../e2e/README.md) directory.

### Local Development Ports
```
localhost:8080 - acme-shopping - Frontend
localhost:8081 - acme-assist - SpringBoot - AI integtegration
localhost:8082 - acme-catalog - SpringBoot - CrudRepository
localhost:8083 - acme-identity - SpringBoot - Token Resource server
localhost:8084 - acme-payment - SpringBoot -  Service related to checkout
localhost:8085 - acme-cart - Python server -  Service for Management of Cart
localhost:8086 - acme-order - DotNet application
localhost:8090 - spring-cloud-gateway 
localhost:8761 - local discovery server
localhost:8888 - spring local config server 
localhost:9000 - spring local authorization 
```
