package com.physiqo.bodycomp.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class BodyCompReportDto {
    private UUID id;
    private UUID userId;
    private LocalDate reportDate;
    private String reportType;
    private String source;
    private UUID fileId;
    private BigDecimal aiConfidence;
    private Boolean userReviewed;
    private String notes;
    private List<MeasurementDto> measurements;
    private Instant createdAt;
    private Instant updatedAt;
}
