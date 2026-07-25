package com.physiqo.product.dto;
import lombok.Data;
import java.util.UUID;
@Data public class ProductDto { private UUID id; private String name; private String brand; private String category; private Boolean isVerified; }
