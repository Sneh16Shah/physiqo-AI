package com.physiqo.product.dto;
import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;
@Data public class ProductPriceDto { private UUID id; private String storeName; private BigDecimal price; private String currency; private Boolean isAvailable; }
