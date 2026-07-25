package com.physiqo.product.service;

import com.physiqo.product.entity.Product;
import com.physiqo.product.repository.ProductRepository;
import com.physiqo.product.dto.ProductComparisonDto;
import com.physiqo.product.dto.ProductDto;
import com.physiqo.product.dto.ProductNutritionDto;
import com.physiqo.product.repository.ProductNutritionRepository;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;
    private final ProductNutritionRepository nutritionRepository;

    public List<Product> searchProducts(String category, String brand, Boolean isVerified) {
        return productRepository.searchProducts(category, brand, isVerified);
    }
    
    public Product getProduct(UUID id) {
        return productRepository.findById(id).orElseThrow();
    }
    
    public Product createProduct(Product product) {
        return productRepository.save(product);
    }
    
    public Product updateProduct(UUID id, Product updatedProduct) {
        Product p = getProduct(id);
        p.setName(updatedProduct.getName());
        return productRepository.save(p);
    }
    
    public List<ProductComparisonDto> getComparison(List<UUID> ids) {
        return ids.stream().map(id -> {
            Product p = getProduct(id);
            ProductComparisonDto dto = new ProductComparisonDto();
            ProductDto pdto = new ProductDto();
            pdto.setId(p.getId()); pdto.setName(p.getName());
            dto.setProduct(pdto);
            return dto;
        }).collect(Collectors.toList());
    }
}
