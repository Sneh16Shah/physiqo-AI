package com.physiqo.ai.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Map;
import java.util.UUID;

@Component
public class AiServiceClient {

    private final RestClient restClient;
    private final String serviceKey;

    public AiServiceClient(
            RestClient.Builder restClientBuilder,
            @Value("${physiqo.ai.base-url:${AI_SERVICE_URL:http://ai-service:8000}/api/v1}") String baseUrl,
            @Value("${physiqo.ai.service-key:${AI_SERVICE_KEY:dev-service-key}}") String serviceKey) {
        String finalUrl = baseUrl.endsWith("/api/v1") ? baseUrl : baseUrl + "/api/v1";
        this.restClient = restClientBuilder.baseUrl(finalUrl).build();
        this.serviceKey = serviceKey;
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> analyzeProgress(UUID requestId, Map<String, Object> payload) {
        return restClient.post()
                .uri("/progress/analyze")
                .header("X-Service-Key", serviceKey)
                .header("X-Request-Id", requestId.toString())
                .contentType(MediaType.APPLICATION_JSON)
                .body(payload)
                .retrieve()
                .body(Map.class);
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> estimateMeal(UUID requestId, String imageUrl) {
        return restClient.post()
                .uri("/meal/estimate")
                .header("X-Service-Key", serviceKey)
                .header("X-Request-Id", requestId.toString())
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of("image_url", imageUrl))
                .retrieve()
                .body(Map.class);
    }
    
    @SuppressWarnings("unchecked")
    public Map<String, Object> extractBodyComposition(UUID requestId, String imageUrl) {
        return restClient.post()
                .uri("/ocr/scan")
                .header("X-Service-Key", serviceKey)
                .header("X-Request-Id", requestId.toString())
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of("image_url", imageUrl))
                .retrieve()
                .body(Map.class);
    }
}
