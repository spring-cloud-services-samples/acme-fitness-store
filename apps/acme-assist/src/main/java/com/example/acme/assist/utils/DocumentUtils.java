package com.example.acme.assist.utils;

import com.example.acme.assist.model.Product;
import lombok.NoArgsConstructor;
import org.springframework.ai.document.Document;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@NoArgsConstructor
public class DocumentUtils {

    // The embedding model backing this app's vector store has a real per-request limit around
    // 2000 characters of total content (confirmed empirically against the live endpoint across
    // the full product catalog - its tokenizer doesn't match jtokkit's, so token-count-based
    // splitting undercounts for it). Long product descriptions are chunked below that limit,
    // with margin, so every product stays searchable.
    private static final int MAX_DESCRIPTION_CHUNK_CHARS = 600;

    public static List<Document> createDocuments(Product product) {
        List<String> descriptionChunks = splitIntoChunks(product.getDescription());
        List<Document> documents = new ArrayList<>();
        for (String descriptionChunk : descriptionChunks) {
            String content = buildContent(product, descriptionChunk);
            // PgVectorStore requires the document id to be a UUID, so chunks can't reuse
            // (or derive from) the product id; the product is still identifiable via metadata.
            documents.add(new Document(UUID.randomUUID().toString(), content,
                    Map.of("name", product.getName(), "productId", product.getId())));
        }
        return documents;
    }

    private static String buildContent(Product product, String descriptionChunk) {
        StringBuilder sb = new StringBuilder();
        sb.append("price: ").append(product.getPrice()).append(System.lineSeparator());
        sb.append("name: ").append(product.getName()).append(System.lineSeparator());
        sb.append("shortDescription: ").append(product.getShortDescription()).append(System.lineSeparator());
        sb.append("description: ").append(descriptionChunk).append(System.lineSeparator());
        sb.append("tags: ").append(product.getTags()).append(System.lineSeparator());
        return sb.toString();
    }

    private static List<String> splitIntoChunks(String description) {
        List<String> chunks = new ArrayList<>();
        if (description == null || description.isEmpty()) {
            chunks.add(description);
            return chunks;
        }
        int start = 0;
        while (start < description.length()) {
            int end = Math.min(start + MAX_DESCRIPTION_CHUNK_CHARS, description.length());
            if (end < description.length()) {
                int lastSpace = description.lastIndexOf(' ', end);
                if (lastSpace > start) {
                    end = lastSpace;
                }
            }
            chunks.add(description.substring(start, end).trim());
            start = end;
        }
        return chunks;
    }

}
