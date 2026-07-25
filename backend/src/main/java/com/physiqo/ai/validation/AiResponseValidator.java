package com.physiqo.ai.validation;

import org.springframework.stereotype.Component;
import java.util.Map;

@Component
public class AiResponseValidator {

    private static final double MIN_CONFIDENCE_THRESHOLD = 0.70;
    private static final double REQUIRES_REVIEW_THRESHOLD = 0.85;

    public boolean isConfident(double confidence) {
        return confidence >= MIN_CONFIDENCE_THRESHOLD;
    }
    
    public boolean requiresHumanReview(double confidence) {
        return confidence < REQUIRES_REVIEW_THRESHOLD;
    }
    
    public double extractConfidence(Map<String, Object> aiResponse) {
        if (aiResponse == null || !aiResponse.containsKey("confidence")) {
            return 0.0;
        }
        Object conf = aiResponse.get("confidence");
        if (conf instanceof Number num) {
            return num.doubleValue();
        }
        return 0.0;
    }
}
