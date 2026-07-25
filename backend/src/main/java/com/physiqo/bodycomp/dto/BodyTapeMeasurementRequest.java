package com.physiqo.bodycomp.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data
public class BodyTapeMeasurementRequest {

    @NotNull(message = "Measurement timestamp is required")
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
}
