package com.vmware.acme.catalog;

import io.restassured.RestAssured;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.actuate.observability.AutoConfigureObservability;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.containers.wait.strategy.Wait;
import org.testcontainers.images.builder.Transferable;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.shaded.org.awaitility.Awaitility;

import java.time.Duration;
import java.util.Map;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasItem;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = {
                "management.endpoints.web.exposure.include=*",
                "management.prometheus.metrics.export.step=2s"})
@AutoConfigureObservability
@Testcontainers
class CatalogApplicationTests {

    @LocalServerPort
    private int serverPort;

    @Container
    private static final PostgreSQLContainer postgres = new PostgreSQLContainer("postgres:14.4-alpine3.16");

    @Container
    static final GenericContainer<?> prometheus = new GenericContainer<>("prom/prometheus:v2.37.0")
            .withExposedPorts(9090)
            .waitingFor(Wait.forLogMessage("(?s).*Server is ready to receive web requests.*$", 1))
            .withAccessToHost(true);

    @DynamicPropertySource
    static void sqlserverProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @BeforeEach
    void before() {
        org.testcontainers.Testcontainers.exposeHostPorts(this.serverPort);
        RestAssured.port = this.serverPort;

        var config = String.format("""
                scrape_configs:
                  - job_name: "prometheus"
                    scrape_interval: 2s
                    metrics_path: "/actuator/prometheus"
                    static_configs:
                      - targets: ['host.testcontainers.internal:%s']""", this.serverPort);
        prometheus.copyFileToContainer(Transferable.of(config), "/etc/prometheus/prometheus.yml");

        // Reload config
        prometheus.getDockerClient().killContainerCmd(prometheus.getContainerId())
                .withSignal("SIGHUP")
                .exec();
    }

    @Test
    void listAllProducts() {
        given()
                .get("/products")
                .then()
                .assertThat()
                .body("data.size()", equalTo(8));
        checkMetric("getProducts");
    }

    @Test
    void findProductById() {
        given()
                .get("/products/533445d-530e-4a76-9398-5d16713b827b")
                .then()
                .assertThat()
                .body("data.description", equalTo("Magic Yoga Mat!"));
        checkMetric("getProduct");
    }

    private void checkMetric(String method) {
        var query = String.format("store_products_seconds_count{method=\"%s\"}", method);
        Awaitility.given().pollInterval(Duration.ofSeconds(2))
                .atMost(Duration.ofSeconds(15))
                .ignoreExceptions()
                .untilAsserted(() -> given().baseUri("http://" + prometheus.getHost())
                                        .port(prometheus.getMappedPort(9090))
                                        .queryParams(Map.of("query", query))
                                        .get("/api/v1/query")
                                        .prettyPeek()
                                        .then()
                                        .assertThat()
                                        .statusCode(200)
                                        .body("data.result[0].value", hasItem("1")));
    }

}
