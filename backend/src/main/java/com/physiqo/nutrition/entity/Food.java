package com.physiqo.nutrition.entity;

import com.physiqo.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "foods")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Food extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private String name;

    private String brand;

    @Column(name = "serving_size_g", nullable = false)
    private BigDecimal servingSizeG;

    @Column(name = "serving_label")
    private String servingLabel;

    @Column(name = "calories_kcal", nullable = false)
    private BigDecimal caloriesKcal;

    @Column(name = "protein_g", nullable = false)
    private BigDecimal proteinG;

    @Column(name = "carbs_g", nullable = false)
    private BigDecimal carbsG;

    @Column(name = "fat_g", nullable = false)
    private BigDecimal fatG;

    @Column(name = "fiber_g")
    private BigDecimal fiberG;

    @Column(name = "sugar_g")
    private BigDecimal sugarG;

    @Column(name = "sodium_mg")
    private BigDecimal sodiumMg;

    @Column(name = "is_custom", nullable = false)
    private boolean custom = false;

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(nullable = false)
    private boolean verified = false;
}
