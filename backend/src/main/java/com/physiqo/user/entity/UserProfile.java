package com.physiqo.user.entity;

import com.physiqo.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "user_profiles")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfile extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId;

    @Column(name = "display_name")
    private String displayName;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    private String gender;

    @Column(name = "height_cm")
    private BigDecimal heightCm;

    @Column(name = "activity_level")
    private String activityLevel;

    @Column(name = "fitness_goal")
    private String fitnessGoal;

    @Column(name = "unit_preference", nullable = false)
    private String unitPreference = "METRIC";

    @Column(name = "avatar_file_id")
    private UUID avatarFileId;

    @Column(nullable = false)
    private String timezone = "UTC";
}
