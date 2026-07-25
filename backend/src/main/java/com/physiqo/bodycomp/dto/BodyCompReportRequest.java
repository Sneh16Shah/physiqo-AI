package com.physiqo.bodycomp.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class BodyCompReportRequest {

    @NotNull(message = "Report date is required")
    private LocalDate reportDate;

    @NotBlank(message = "Report type is required")
    private String reportType;

    @NotEmpty(message = "Measurements cannot be empty")
    @Valid
    private List<MeasurementDto> measurements;

    private String notes;
}
