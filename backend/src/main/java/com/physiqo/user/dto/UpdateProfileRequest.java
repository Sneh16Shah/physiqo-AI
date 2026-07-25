package com.physiqo.user.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class UpdateProfileRequest {

    @Size(max = 100, message = "Display name cannot exceed 100 characters")
    private String displayName;

    private LocalDate dateOfBirth;

    @Pattern(regexp = "^(MALE|FEMALE|OTHER|PREFER_NOT_TO_SAY)$", message = "Invalid gender")
    private String gender;

    @DecimalMin(value = "50.0", message = "Height must be at least 50 cm")
    @DecimalMax(value = "300.0", message = "Height cannot exceed 300 cm")
    private BigDecimal heightCm;

    @Pattern(regexp = "^(SEDENTARY|LIGHT|MODERATE|ACTIVE|VERY_ACTIVE)$", message = "Invalid activity level")
    private String activityLevel;

    @Pattern(regexp = "^(LOSE_FAT|MAINTAIN|BUILD_MUSCLE|RECOMP)$", message = "Invalid fitness goal")
    private String fitnessGoal;

    @Pattern(regexp = "^(METRIC|IMPERIAL)$", message = "Unit preference must be METRIC or IMPERIAL")
    private String unitPreference;

    private String timezone;
}
