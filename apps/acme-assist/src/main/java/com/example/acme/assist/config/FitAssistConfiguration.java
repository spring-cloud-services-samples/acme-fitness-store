package com.example.acme.assist.config;

import com.example.acme.assist.mongodb.CosmosDBVectorStore;
import com.example.acme.assist.vectorstore.LazyCalculateSimpleVectorStore;
import org.springframework.ai.embedding.EmbeddingClient;
import org.springframework.ai.vectorstore.PgVectorStore;
import org.springframework.ai.vectorstore.PgVectorStore.PgDistanceType;
import org.springframework.ai.vectorstore.PgVectorStore.PgIndexType;
import org.springframework.ai.vectorstore.SimpleVectorStore;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
public class FitAssistConfiguration {

    @Value("classpath:/vector_store.json")
    private Resource vectorDbResource;

    @Bean
    @ConditionalOnProperty(value="vectorstore", havingValue = "simple", matchIfMissing = false)
    public SimpleVectorStore simpleVectorStore(EmbeddingClient embeddingClient) {
        SimpleVectorStore simpleVectorStore = new LazyCalculateSimpleVectorStore(embeddingClient);
        simpleVectorStore.load(vectorDbResource);
        return simpleVectorStore;
    }

    @Bean
    @ConditionalOnProperty(value = "vectorstore", havingValue = "mongodb")
    public VectorStore cosmosDBVectorStore(Resource vectorDbResource,
                                           MongoTemplate mongoTemplate,
                                           EmbeddingClient embeddingClient) {
        return new CosmosDBVectorStore(vectorDbResource, mongoTemplate, embeddingClient);
    }

    @Bean
    @ConditionalOnProperty(value = "vectorstore", havingValue = "postgres")
    public VectorStore postgresVectorStore(JdbcTemplate jcbcTemplate, EmbeddingClient embeddingClient) {
         return new PgVectorStore( jcbcTemplate, embeddingClient,
            4096,
            PgVectorStore.PgDistanceType.COSINE_DISTANCE,
            false,
            PgVectorStore.PgIndexType.NONE);
    }
 
    
}
