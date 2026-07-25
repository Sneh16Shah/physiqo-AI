package com.physiqo.product.dto;
import lombok.Data;
import java.util.List;
@Data public class ProductComparisonDto { 
    private ProductDto product;
    private ProductNutritionDto nutrition;
    private List<ProductPriceDto> prices;
}
