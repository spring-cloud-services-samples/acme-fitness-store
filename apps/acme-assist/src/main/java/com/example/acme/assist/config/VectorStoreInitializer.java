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

        List<Document> documents = new ArrayList<>();
        productRepository.refreshProductList();
        productRepository.getProductList().stream()
                .map(DocumentUtils::createDocument)
                .forEach(doc -> {
                    documents.add(doc);
                });
        LOGGER.info("Found {} products to index", documents.size());
        vectorStore.add(documents);
     }
}
