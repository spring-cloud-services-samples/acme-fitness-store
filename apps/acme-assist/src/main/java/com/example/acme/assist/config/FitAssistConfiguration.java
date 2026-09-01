package com.example.acme.assist.config;

import com.example.acme.assist.ProductRepository;
import io.pivotal.cfenv.boot.genai.GenaiLocator;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FitAssistConfiguration {

    private static final String CHAT_MODEL_NAME = "openai/gpt-oss-120b";
    private static final String EMBEDDING_MODEL_NAME = "nomic-ai/nomic-embed-text-v2-moe";

    @Bean
    @ConditionalOnProperty("genai.locator.config-url")
    public ChatModel chatModel(GenaiLocator genaiLocator) {
        return genaiLocator.getChatModelByName(CHAT_MODEL_NAME);
    }

    @Bean
    @ConditionalOnProperty("genai.locator.config-url")
    public EmbeddingModel embeddingModel(GenaiLocator genaiLocator) {
        return genaiLocator.getEmbeddingModelByName(EMBEDDING_MODEL_NAME);
    }

    @Bean
    public ChatClient chatClient(ChatClient.Builder chatClientBuilder){
        return chatClientBuilder.build();
    }

	@Bean
	public VectorStoreInitializer vectorStoreInitializer(ProductRepository repo, VectorStore vectorStore) {
		return new VectorStoreInitializer(repo, vectorStore);
	}

}

