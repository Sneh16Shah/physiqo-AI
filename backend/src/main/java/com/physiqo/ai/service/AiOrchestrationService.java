package com.physiqo.ai.service;

import com.physiqo.ai.client.AiServiceClient;
import com.physiqo.ai.dto.InsightDto;
import com.physiqo.ai.entity.AiInsight;
import com.physiqo.ai.repository.AiInsightRepository;
import com.physiqo.ai.validation.AiResponseValidator;
import com.physiqo.common.exception.ErrorCode;
import com.physiqo.common.exception.ResourceNotFoundException;
import com.physiqo.storage.dto.FileResponseDto;
import com.physiqo.storage.service.StorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiOrchestrationService {

    private final AiServiceClient aiServiceClient;
    private final AiResponseValidator aiResponseValidator;
    private final AiInsightRepository aiInsightRepository;
    private final StorageService storageService;

    @Transactional
    public Map<String, Object> analyzeProgress(UUID userId, Map<String, Object> payload) {
        UUID requestId = UUID.randomUUID();
        Map<String, Object> response = aiServiceClient.analyzeProgress(requestId, payload);
        
        double confidence = aiResponseValidator.extractConfidence(response);
        if (aiResponseValidator.isConfident(confidence)) {
            if (response.containsKey("insights")) {
                Object insightsObj = response.get("insights");
                if (insightsObj instanceof List<?> list) {
                    for (Object obj : list) {
                        if (obj instanceof String insightContent) {
                            AiInsight insight = AiInsight.builder()
                                    .userId(userId)
                                    .insightType("PROGRESS")
                                    .content(insightContent)
                                    .confidence(confidence)
                                    .isDismissed(false)
                                    .build();
                            aiInsightRepository.save(insight);
                        }
                    }
                }
            } else if (response.containsKey("analysis")) {
                AiInsight insight = AiInsight.builder()
                        .userId(userId)
                        .insightType("PROGRESS")
                        .content(response.get("analysis").toString())
                        .confidence(confidence)
                        .isDismissed(false)
                        .build();
                aiInsightRepository.save(insight);
            }
        }
        
        return response;
    }

    @Transactional
    public Map<String, Object> estimateMeal(UUID userId, MultipartFile file) {
        FileResponseDto fileInfo = storageService.uploadFile(userId, file, "MEAL");
        UUID requestId = UUID.randomUUID();
        return aiServiceClient.estimateMeal(requestId, fileInfo.getUrl());
    }

    @Transactional(readOnly = true)
    public List<InsightDto> getInsights(UUID userId) {
        return aiInsightRepository.findByUserIdAndIsDismissedFalseOrderByCreatedAtDesc(userId)
                .stream()
                .map(insight -> InsightDto.builder()
                        .id(insight.getId())
                        .insightType(insight.getInsightType())
                        .content(insight.getContent())
                        .confidence(insight.getConfidence())
                        .createdAt(insight.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public void dismissInsight(UUID insightId, UUID userId) {
        AiInsight insight = aiInsightRepository.findById(insightId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.INTERNAL_ERROR, "Insight not found"));
                
        if (!insight.getUserId().equals(userId)) {
            throw new ResourceNotFoundException(ErrorCode.INTERNAL_ERROR, "Insight not found for this user");
        }
        
        insight.setDismissed(true);
        aiInsightRepository.save(insight);
    }
}
