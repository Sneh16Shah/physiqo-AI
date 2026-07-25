package com.physiqo.product.controller;

import com.physiqo.product.entity.Product;
import com.physiqo.product.entity.ProductPrice;
import com.physiqo.product.entity.ProductVerification;
import com.physiqo.product.service.ProductService;
import com.physiqo.product.repository.ProductPriceRepository;
import com.physiqo.product.service.VerificationService;
import com.physiqo.product.dto.ProductComparisonDto;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {
    private final ProductService productService;
    private final ProductPriceRepository priceRepository;
    private final VerificationService verificationService;

    @GetMapping
    public List<Product> getProducts(@RequestParam(required = false) String category, 
                                     @RequestParam(required = false) String brand,
                                     @RequestParam(required = false) Boolean isVerified) {
        return productService.searchProducts(category, brand, isVerified);
    }

    @GetMapping("/{id}")
    public Product getProduct(@PathVariable UUID id) {
        return productService.getProduct(id);
    }

    @PostMapping
    public Product createProduct(@RequestBody Product product) {
        return productService.createProduct(product);
    }

    @PutMapping("/{id}")
    public Product updateProduct(@PathVariable UUID id, @RequestBody Product product) {
        return productService.updateProduct(id, product);
    }

    @GetMapping("/compare")
    public List<ProductComparisonDto> compareProducts(@RequestParam List<UUID> ids) {
        return productService.getComparison(ids);
    }

    @PostMapping("/{id}/prices")
    public ProductPrice addPrice(@PathVariable UUID id, @RequestBody ProductPrice price) {
        Product p = new Product(); p.setId(id);
        price.setProduct(p);
        return priceRepository.save(price);
    }

    @GetMapping("/{id}/prices")
    public List<ProductPrice> getPrices(@PathVariable UUID id) {
        return priceRepository.findByProductIdOrderByCreatedAtDesc(id);
    }

    @PostMapping("/{id}/verify")
    public ProductVerification verifyProduct(@PathVariable UUID id, @RequestBody ProductVerification verification) {
        Product p = new Product(); p.setId(id);
        verification.setProduct(p);
        return verificationService.submitVerification(verification);
    }
}
