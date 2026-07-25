package com.physiqo.bodycomp.entity;

import com.physiqo.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "body_measurements")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BodyMeasurement extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "measured_at", nullable = false)
    private Instant measuredAt;

    @Column(name = "weight_kg")
    private BigDecimal weightKg;

    @Column(name = "neck_cm")
    private BigDecimal neckCm;

    @Column(name = "chest_cm")
    private BigDecimal chestCm;

    @Column(name = "waist_cm")
    private BigDecimal waistCm;

    @Column(name = "hips_cm")
    private BigDecimal hipsCm;

    @Column(name = "left_bicep_cm")
    private BigDecimal leftBicepCm;

    @Column(name = "right_bicep_cm")
    private BigDecimal rightBicepCm;

    @Column(name = "left_forearm_cm")
    private BigDecimal leftForearmCm;

    @Column(name = "right_forearm_cm")
    private BigDecimal rightForearmCm;

    @Column(name = "left_thigh_cm")
    private BigDecimal leftThighCm;

    @Column(name = "right_thigh_cm")
    private BigDecimal rightThighCm;

    @Column(name = "left_calf_cm")
    private BigDecimal leftCalfCm;

    @Column(name = "right_calf_cm")
    private BigDecimal rightCalfCm;

    private String notes;
}
