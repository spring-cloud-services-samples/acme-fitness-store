## Local running

Ensure the Local Development dependencies are running. (See main [README](../../local-development/README.md))

```bash
cd ../../local-development
docker compose up -d
```

This application also assumes there is an OPEN AI API key setup as an environment variable. 
Need to set `OPENAI_API_KEY` for the application-local.yml

This project uses Java version 21. Ensure your system has this available before running the app locally.

To run the acme-assist app locally,
```bash
./gradlew bootRun --args="--spring.profiles.active=local"
```
