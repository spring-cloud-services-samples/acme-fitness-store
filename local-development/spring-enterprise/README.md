### Tanzu Local Authentication Server
Follow the instructions on ["Getting Started with Tanzu Local Authorization Server"](https://docs.vmware.com/en/Tanzu-Spring-Runtime/Commercial/Tanzu-Spring-Runtime/local-auth-server-about-local-auth-server.html) page to obtain the jar executable from Broadcom download portal.

Place the jar named as `tanzu-local-authorization-server.jar` into the directory `local-development/spring-enterprise`.

Given jar is placed correctly, included [docker-compose.yml](../docker-compose.yaml) starts up a local instance of Tanzu Local Authentication Server on port 9000.


### Spring Cloud Gateway Server

Obtain from Broadcom download portal to get the Spring Commercial Gateway Jar for running local.
Place the jar named as `gateway-2.2.4.jar` into the directory `local-development/spring-enterprise`

Given jar is placed correctly, included [docker-compose.yml](../docker-compose.yaml) starts up a local instance of Spring Cloud Gateway Server on port 8090.
