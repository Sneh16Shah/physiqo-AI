package com.physiqo.nutrition.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class MealDto {
    private UUID id;
    private UUID userId;
    private String mealType;
    private LocalDate mealDate;
    private LocalTime mealTime;
    private String notes;
    private List<MealItemDto> items;
    private MacroTotals totals;
    private Instant createdAt;
    private Instant updatedAt;

    @Data
    @Builder
    public static class MealItemDto {
        private UUID id;
        private UUID foodId;
        private String foodName;
        private String brand;
        private BigDecimal servingSizeG;
        private String servingLabel;
        private BigDecimal quantity;
        private BigDecimal caloriesKcal;
        private BigDecimal proteinG;
        private BigDecimal carbsG;
        private BigDecimal fatG;
    }

    @Data
    @Builder
    public static class MacroTotals {
        private BigDecimal calories;
        private BigDecimal protein;
        private BigDecimal carbs;
        private BigDecimal fat;
    }
}
