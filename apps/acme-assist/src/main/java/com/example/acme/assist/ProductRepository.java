package com.example.acme.assist;

import com.example.acme.assist.model.CatalogProductListResponse;
import com.example.acme.assist.model.CatalogProductResponse;
import com.example.acme.assist.model.Product;
import jakarta.annotation.PostConstruct;
import org.apache.logging.log4j.util.Strings;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Repository;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

@Repository
public class ProductRepository {

    @Value("${app.catalog.url:default}")
    private String catalogUrl;

    private static final Logger log = LoggerFactory.getLogger(ProductRepository.class);
    private static List<Product> products;
    private final RestTemplate restTemplate = new RestTemplate();
    private final DiscoveryClient discoveryClient;
    
    public ProductRepository(DiscoveryClient discoveryClient) {
        this.discoveryClient = discoveryClient;
    }
    private String getCatalogServiceUrl() {
        if ( catalogUrl != null && !catalogUrl.equals("default")) {
            return catalogUrl;
        }
        List<ServiceInstance> services = discoveryClient.getInstances("acme-catalog");
        if (services.size() > 0) 
            return services.get(0).getUri().toString();
        else    {
            log.warn("Can't find acme-catalog in registry, no products returned");
            return null;
        }
    }

    public Product getProductById(String id) {
        if (Strings.isEmpty(id)) {
            return null;
        }
        try {
            String catalogService = getCatalogServiceUrl();
            if (catalogService == null) 
                return null;
            
            var response = this.restTemplate.getForEntity(catalogService + "/products/" + id, CatalogProductResponse.class);
            log.info("Response code from catalog-service: {}", response.getStatusCode());
            return response.getBody().getData();
        } catch (HttpClientErrorException ex) {
            log.warn("Can't get the product detail: {}", ex.getMessage());
            return null;
        }
    }

    public void refreshProductList() {
        String catalogService = getCatalogServiceUrl();
        if (catalogService == null) 
            return;
        ResponseEntity<CatalogProductListResponse> response = this.restTemplate
                .getForEntity(catalogService + "/products", CatalogProductListResponse.class);
        products = response.getBody().getData();
    }

    @PostConstruct
    public List<Product> getProductList() {
        if (products == null) {
            String catalogService = getCatalogServiceUrl();
            if (catalogService == null) 
                return new ArrayList<Product>();

            ResponseEntity<CatalogProductListResponse> response = this.restTemplate
                    .getForEntity(catalogService + "/products", CatalogProductListResponse.class);
            products = response.getBody().getData();
        }
        return products;
    }
}
