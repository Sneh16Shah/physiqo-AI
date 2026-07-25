package com.physiqo.nutrition.dto;

import com.physiqo.nutrition.entity.NutritionGoal;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
public class DailySummaryDto {
    private LocalDate date;
    private BigDecimal totalCalories;
    private BigDecimal totalProtein;
    private BigDecimal totalCarbs;
    private BigDecimal totalFat;
    private NutritionGoal goal;
    private List<MealSummary> meals;

    @Data
    @Builder
    public static class MealSummary {
        private String mealType;
        private BigDecimal calories;
        private BigDecimal protein;
        private BigDecimal carbs;
        private BigDecimal fat;
    }
}
