package com.physiqo.user.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
public class UserProfileDto {
    private UUID id;
    private UUID userId;
    private String displayName;
    private LocalDate dateOfBirth;
    private String gender;
    private BigDecimal heightCm;
    private String activityLevel;
    private String fitnessGoal;
    private String unitPreference;
    private UUID avatarFileId;
    private String avatarUrl;
    private String timezone;
    private Instant createdAt;
    private Instant updatedAt;
}
