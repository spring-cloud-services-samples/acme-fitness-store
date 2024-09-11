# Catalog


> A Catalog service, used to service the bikes and accessories sold by acme fitness

The goal of this specific service is to keep track of bikes and accessories. 

Catalog contains a database it talks to store the information it needs.

### Run

* [Docker](https://www.docker.com/docker-community)


## Local running

Ensure the Local Development dependencies are running. (See main [README](../../local-development/README.md))

```bash
cd ../../local-development
docker compose up -d
```

Setup Docker database dependency

`docker compose -d up`

To run locally

```bash
./gradlew bootRun --args="--spring.profiles.active=local"
```

