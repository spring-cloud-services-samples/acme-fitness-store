/*
 * Copyright 2023-2024 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.example.acme.assist.config;

import java.util.List;
import java.util.ArrayList;

import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.example.acme.assist.ProductRepository;
import com.example.acme.assist.utils.DocumentUtils;

/**
 *
 * @author Stuart Charlton
 */
public class VectorStoreInitializer implements ApplicationListener<ApplicationReadyEvent> {

    private static final Logger LOGGER = LoggerFactory.getLogger(VectorStoreInitializer.class);

    private VectorStore vectorStore;
    private final ProductRepository productRepository;

    public VectorStoreInitializer(ProductRepository productRepository, VectorStore vectorStore) {
        this.productRepository = productRepository;
        this.vectorStore = vectorStore;
    }

    @Override
     @SuppressWarnings("unchecked")
     public void onApplicationEvent(ApplicationReadyEvent event) {

        List<Document> chunks = new ArrayList<>();
        int productCount = 0;
        productRepository.refreshProductList();
        for (var product : productRepository.getProductList()) {
            chunks.addAll(DocumentUtils.createDocuments(product));
            productCount++;
        }
        LOGGER.info("Found {} products to index ({} chunks)", productCount, chunks.size());

        int indexed = 0;
        for (Document chunk : chunks) {
            try {
                vectorStore.add(List.of(chunk));
                indexed++;
            } catch (Exception e) {
                LOGGER.error("Skipping chunk for product '{}': failed to index in vector store", chunk.getMetadata().get("name"), e);
            }
        }
        if (indexed < chunks.size()) {
            LOGGER.error("Indexed only {} of {} chunks from {} products in vector store; see preceding errors for the failures", indexed, chunks.size(), productCount);
        } else {
            LOGGER.info("Successfully indexed {} chunks from {} products in vector store", indexed, productCount);
        }
     }
}
