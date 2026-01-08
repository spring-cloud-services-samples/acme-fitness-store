package com.example.acme.assist.vectorstore;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.document.Document;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.vectorstore.SimpleVectorStore;
import org.springframework.ai.vectorstore.SimpleVectorStoreContent;

import java.util.List;

public class LazyCalculateSimpleVectorStore extends SimpleVectorStore {

    public static final Logger LOGGER = LoggerFactory.getLogger(LazyCalculateSimpleVectorStore.class);

    public LazyCalculateSimpleVectorStore(EmbeddingModel embeddingModel) {
        super(SimpleVectorStore.builder(embeddingModel));
    }

    @Override
    public void add(List<Document> documents) {
        for (Document document : documents) {
            if (this.store.containsKey(document.getId())) {
                LOGGER.info("Document id = {} already has an embedding in store, skipping.", document.getId());
            } else {
                LOGGER.info("Calling EmbeddingModel for document id = {}", document.getId());
                float[] embedding = this.embeddingModel.embed(document);
                this.store.put(document.getId(), new SimpleVectorStoreContent(document.getId(), document.getText(), document.getMetadata(), embedding));
            }
        }
    }
}
