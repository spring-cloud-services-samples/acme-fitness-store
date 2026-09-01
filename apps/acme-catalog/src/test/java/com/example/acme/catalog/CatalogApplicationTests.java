package com.example.acme.catalog;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.web.client.RestTemplate;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.containers.wait.strategy.Wait;
import org.testcontainers.images.builder.Transferable;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.shaded.org.awaitility.Awaitility;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = {
                "management.endpoints.web.exposure.include=*",
                "management.prometheus.metrics.export.step=2s",
                "eureka.client.enabled=false",
                "spring.cloud.config.enabled=false"})
@Testcontainers
class CatalogApplicationTests {

    private static final Logger LOGGER = LoggerFactory.getLogger(CatalogApplicationTests.class);

    @LocalServerPort
    private int serverPort;

    private final RestTemplate restTemplate = new RestTemplate();

    @Container
    public static final PostgreSQLContainer postgres = new PostgreSQLContainer("postgres:14.19-alpine");

    @Container
    public static final GenericContainer<?> prometheus = new GenericContainer<>("prom/prometheus:v2.37.0")
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

        var config = String.format("""
                scrape_configs:
                  - job_name: "prometheus"
                    scrape_interval: 2s
                    metrics_path: "/actuator/prometheus"
                    static_configs:
                      - targets: ['host.testcontainers.internal:%s']""", this.serverPort);
        prometheus.copyFileToContainer(Transferable.of(config), "/etc/prometheus/prometheus.yml");

        // Reload config
        try {
            prometheus.execInContainer("kill", "-HUP", "1");
        } catch (Exception e) {
            LOGGER.warn("Failed to reload Prometheus config", e);
        }
    }

    @Test
    void listAllProducts() {
        String url = "http://localhost:" + serverPort + "/products";
        ResponseEntity<Map> response = restTemplate.getForEntity(URI.create(url), Map.class);
        assertThat(response.getStatusCode().value()).isEqualTo(200);
        List<?> data = (List<?>) response.getBody().get("data");
        assertThat(data).hasSize(49);
        checkMetric("getProducts");
    }

    @Test
    void findProductById() {
        String url = "http://localhost:" + serverPort + "/products/cdc8abf3-51cc-4d73-8bee-8ce876a550e5";
        ResponseEntity<Map> response = restTemplate.getForEntity(URI.create(url), Map.class);
        assertThat(response.getStatusCode().value()).isEqualTo(200);
        Map<?, ?> data = (Map<?, ?>) response.getBody().get("data");
        assertThat(data.get("name")).isEqualTo("E-Adrenaline 8.0 EX1");
        checkMetric("getProduct");
    }

    private void checkMetric(String method) {
        var rawQuery = String.format("store_products_seconds_count{method=\"%s\"}", method);
        String encodedQuery = URLEncoder.encode(rawQuery, StandardCharsets.UTF_8);
        URI prometheusUri = URI.create(String.format("http://%s:%d/api/v1/query?query=%s", prometheus.getHost(), prometheus.getMappedPort(9090), encodedQuery));
        Awaitility.given().pollInterval(Duration.ofSeconds(2))
                .atMost(Duration.ofSeconds(15))
                .ignoreExceptions()
                .untilAsserted(() -> {
                    ResponseEntity<Map> res = restTemplate.getForEntity(prometheusUri, Map.class);
                    assertThat(res.getStatusCode().value()).isEqualTo(200);
                    Map<?, ?> data = (Map<?, ?>) res.getBody().get("data");
                    List<?> result = (List<?>) data.get("result");
                    assertThat(result).isNotEmpty();
                });
    }

}
