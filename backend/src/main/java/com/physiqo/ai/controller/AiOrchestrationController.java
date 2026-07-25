package com.physiqo.ai.controller;

import com.physiqo.ai.dto.InsightDto;
import com.physiqo.ai.service.AiOrchestrationService;
import com.physiqo.common.security.CurrentUser;
import com.physiqo.common.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AiOrchestrationController {

    private final AiOrchestrationService aiOrchestrationService;

    @PostMapping("/analyze-progress")
    public ResponseEntity<Map<String, Object>> analyzeProgress(
            @CurrentUser UserPrincipal currentUser,
            @RequestBody Map<String, Object> payload) {
        Map<String, Object> response = aiOrchestrationService.analyzeProgress(currentUser.getId(), payload);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/estimate-meal")
    public ResponseEntity<Map<String, Object>> estimateMeal(
            @CurrentUser UserPrincipal currentUser,
            @RequestParam("file") MultipartFile file) {
        Map<String, Object> response = aiOrchestrationService.estimateMeal(currentUser.getId(), file);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/insights")
    public ResponseEntity<List<InsightDto>> getInsights(
            @CurrentUser UserPrincipal currentUser) {
        List<InsightDto> insights = aiOrchestrationService.getInsights(currentUser.getId());
        return ResponseEntity.ok(insights);
    }

    @PutMapping("/insights/{id}/dismiss")
    public ResponseEntity<Void> dismissInsight(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable UUID id) {
        aiOrchestrationService.dismissInsight(id, currentUser.getId());
        return ResponseEntity.noContent().build();
    }
}
