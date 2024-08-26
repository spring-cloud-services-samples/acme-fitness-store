package com.example.acme.catalog;

import org.junit.jupiter.api.Test;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import static org.assertj.core.api.Assertions.assertThat;

@Testcontainers
@DataJpaTest(excludeFilters = @ComponentScan.Filter(MetricsConfiguration.class))
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class ProductRepositoryTests {

    @Container
    private static final PostgreSQLContainer postgres = new PostgreSQLContainer("postgres:14.4-alpine3.16");

    @Autowired
    private ProductRepository productRepository;

    @DynamicPropertySource
    static void sqlserverProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Test
    void findAll() {
        var products = this.productRepository.findAll();
        assertThat(products).hasSize(49);
    }

    @Test
    void findById() {
        var product = this.productRepository.findById("cdc8abf3-51cc-4d73-8bee-8ce876a550e5");
        assertThat(product).hasValueSatisfying(p -> {
            assertThat(p.getName()).isEqualTo("E-Adrenaline 8.0 EX1");
            assertThat(p.getImageUrl1()).isEqualTo("/static/images/new_bikes_1.jpg");
            assertThat(p.getImageUrl2()).isEqualTo("/static/images/new_bikes_1.jpg");
            assertThat(p.getImageUrl3()).isEqualTo("/static/images/new_bikes_1.jpg");
        });
    }

}
