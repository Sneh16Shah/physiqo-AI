package com.physiqo.product.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.UUID;

@Entity
@Table(name = "product_nutrition")
@Data
public class ProductNutrition {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @OneToOne
    @JoinColumn(name = "product_id")
    private Product product;
    
    private String servingSize;
    private Double calories;
    private Double protein;
    private Double carbs;
    private Double fat;
}
