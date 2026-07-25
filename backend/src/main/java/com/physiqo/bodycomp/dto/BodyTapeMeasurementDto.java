package com.physiqo.bodycomp.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class BodyTapeMeasurementDto {
    private UUID id;
    private UUID userId;
    private Instant measuredAt;
    private BigDecimal weightKg;
    private BigDecimal neckCm;
    private BigDecimal chestCm;
    private BigDecimal waistCm;
    private BigDecimal hipsCm;
    private BigDecimal leftBicepCm;
    private BigDecimal rightBicepCm;
    private BigDecimal leftForearmCm;
    private BigDecimal rightForearmCm;
    private BigDecimal leftThighCm;
    private BigDecimal rightThighCm;
    private BigDecimal leftCalfCm;
    private BigDecimal rightCalfCm;
    private String notes;
    private Instant createdAt;
    private Instant updatedAt;
}
