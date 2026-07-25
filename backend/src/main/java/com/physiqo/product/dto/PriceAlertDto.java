package com.physiqo.product.dto;
import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;
@Data public class PriceAlertDto { private UUID id; private UUID productId; private BigDecimal targetPrice; private Boolean isActive; }
