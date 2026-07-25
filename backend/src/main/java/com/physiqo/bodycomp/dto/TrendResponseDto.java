package com.physiqo.bodycomp.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
public class TrendResponseDto {
    private String metric;
    private List<DataPoint> dataPoints;
    private TrendSummary trend;

    @Data
    @Builder
    public static class DataPoint {
        private LocalDate date;
        private BigDecimal value;
    }

    @Data
    @Builder
    public static class TrendSummary {
        private String direction; // UP, DOWN, STABLE
        private BigDecimal changePercent;
    }
}
