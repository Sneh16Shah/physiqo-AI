package com.physiqo.product.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.UUID;
import java.math.BigDecimal;

@Entity
@Table(name = "price_alerts", uniqueConstraints = {@UniqueConstraint(columnNames = {"user_id", "product_id"})})
@Data
public class PriceAlert {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(name = "user_id")
    private UUID userId;
    
    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;
    
    private BigDecimal targetPrice;
    private Boolean isActive = true;
}
