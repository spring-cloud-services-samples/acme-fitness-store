package com.example.acme.assist;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@Testcontainers
@SpringBootTest
class FitAssistApplicationTest {

    @MockitoBean
    private EmbeddingModel embeddingModel;

    @Test
    void contextLoads() {
    }

    @Container
    @ServiceConnection
    public static final PostgreSQLContainer postgreSQLContainer =
            new PostgreSQLContainer<>(DockerImageName.parse("pgvector/pgvector:pg16")
                    .asCompatibleSubstituteFor("postgres"));

    @Test
    public void testConnectToDB() {
        assertThat(postgreSQLContainer.isRunning()).isTrue();
    }

}
