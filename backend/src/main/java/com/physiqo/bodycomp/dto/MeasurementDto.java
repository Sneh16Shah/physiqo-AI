package com.physiqo.bodycomp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MeasurementDto {
    private UUID id;

    @NotBlank(message = "Metric name is required")
    private String metricName;

    @NotNull(message = "Metric value is required")
    private BigDecimal metricValue;

    @NotBlank(message = "Metric unit is required")
    private String metricUnit;

    private BigDecimal confidence;
    private Boolean userCorrected;
}
