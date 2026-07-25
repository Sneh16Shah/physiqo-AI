package com.physiqo.nutrition.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
public class MealRequest {

    @NotBlank(message = "Meal type is required")
    private String mealType; // BREAKFAST, LUNCH, DINNER, SNACK

    @NotNull(message = "Meal date is required")
    private LocalDate mealDate;

    private LocalTime mealTime;

    @NotEmpty(message = "Meal items cannot be empty")
    @Valid
    private List<MealItemRequest> items;

    private String notes;
}
