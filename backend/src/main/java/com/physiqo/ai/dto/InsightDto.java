package com.physiqo.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InsightDto {
    private UUID id;
    private String insightType;
    private String content;
    private Double confidence;
    private LocalDateTime createdAt;
}
