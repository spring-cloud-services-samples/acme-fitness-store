# Spring Enterprise Dependencies

Resources listed in this document must be obtained from the Broadcom Support portal or (if available) from your company's mirror of the Broadcom artifactory.

## Tanzu Local Authentication Server

Follow the instructions on ["Getting Started with Tanzu Local Authorization Server"](https://techdocs.broadcom.com/us/en/vmware-tanzu/spring/tanzu-spring/commercial/spring-tanzu/local-auth-server-about-local-auth-server.html) to obtain the executable jar from the Broadcom Support portal.
If you are already authenticated, [view the available versions of Tanzu Local Authorization Server](https://packages.broadcom.com/artifactory/spring-enterprise/com/vmware/tanzu/spring/tanzu-local-authorization-server/).
Name the file `tanzu-local-authorization-server.jar` and place it into the directory `local-development/spring-enterprise`.
From there, both Aspire and the included [docker-compose.yml](../docker-compose.yaml) can start an instance of Tanzu Local Authentication Server.

## Spring Cloud Gateway Server

Similar to the instructions above, you must obtain from the Spring Commercial Gateway jar from the Broadcom Support portal.
If you are already authenticated, [view the available versions of Tanzu Spring Cloud Gateway Server](https://packages.broadcom.com/artifactory/spring-enterprise/com/vmware/tanzu/spring/tanzu-spring-cloud-gateway/).
Name the file `tanzu-spring-cloud-gateway.jar` and place it into the directory `local-development/spring-enterprise`.
From there, both Aspire and the included [docker-compose.yml](../docker-compose.yaml) can start an instance of Spring Cloud Gateway Server.
