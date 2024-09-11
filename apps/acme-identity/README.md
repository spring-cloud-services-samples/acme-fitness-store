# Identity


> An identity service, as a wrapper for the provided SSO service.

The goal of this specific service is to emulate a User account service.

## Local running

Ensure the Local Development dependencies are running. (See main [README](../../local-development/README.md))

```bash
cd ../../local-development
docker compose up -d
```

Ensure the local authentication server is setup or have it connect to your preferred SSO provider.  Included [docker-compose.yaml](../../local-development/docker-compose.yaml) in `/local-development` folder uses Tanzu Local Auth Server by default.  

To run locally

```bash
./gradlew bootRun --args="--spring.profiles.active=local"
```

