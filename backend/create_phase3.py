import os

base_dir = "d:/Projects/physiqo-AI/backend/src/main/java/com/physiqo"

files = {
    # Product Package
    f"{base_dir}/product/entity/Product.java": """package com.physiqo.product.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.UUID;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
@Data
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    private String name;
    private String brand;
    private String category;
    private String description;
    private String imageUrl;
    private String barcode;
    private Boolean isVerified = false;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
""",
    f"{base_dir}/product/entity/ProductNutrition.java": """package com.physiqo.product.entity;

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
""",
    f"{base_dir}/product/entity/ProductPrice.java": """package com.physiqo.product.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.UUID;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity
@Table(name = "product_prices")
@Data
public class ProductPrice {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;
    
    private String storeName;
    private BigDecimal price;
    private String currency;
    private String url;
    private Boolean isAvailable;
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
""",
    f"{base_dir}/product/entity/ProductVerification.java": """package com.physiqo.product.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.UUID;
import java.time.LocalDateTime;

@Entity
@Table(name = "product_verifications")
@Data
public class ProductVerification {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;
    
    private String status;
    private String verifiedBy;
    private String remarks;
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
""",
    f"{base_dir}/product/entity/PriceAlert.java": """package com.physiqo.product.entity;

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
""",
    # Repositories
    f"{base_dir}/product/repository/ProductRepository.java": """package com.physiqo.product.repository;

import com.physiqo.product.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {
    @Query("SELECT p FROM Product p WHERE (:category IS NULL OR p.category = :category) " +
           "AND (:brand IS NULL OR p.brand = :brand) " +
           "AND (:isVerified IS NULL OR p.isVerified = :isVerified)")
    List<Product> searchProducts(@Param("category") String category, 
                                 @Param("brand") String brand, 
                                 @Param("isVerified") Boolean isVerified);
}
""",
    f"{base_dir}/product/repository/ProductNutritionRepository.java": """package com.physiqo.product.repository;

import com.physiqo.product.entity.ProductNutrition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductNutritionRepository extends JpaRepository<ProductNutrition, UUID> {
    Optional<ProductNutrition> findByProductId(UUID productId);
}
""",
    f"{base_dir}/product/repository/ProductPriceRepository.java": """package com.physiqo.product.repository;

import com.physiqo.product.entity.ProductPrice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface ProductPriceRepository extends JpaRepository<ProductPrice, UUID> {
    List<ProductPrice> findByProductIdOrderByCreatedAtDesc(UUID productId);
}
""",
    f"{base_dir}/product/repository/ProductVerificationRepository.java": """package com.physiqo.product.repository;

import com.physiqo.product.entity.ProductVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface ProductVerificationRepository extends JpaRepository<ProductVerification, UUID> {
    List<ProductVerification> findByProductId(UUID productId);
}
""",
    f"{base_dir}/product/repository/PriceAlertRepository.java": """package com.physiqo.product.repository;

import com.physiqo.product.entity.PriceAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;
import java.util.UUID;

@Repository
public interface PriceAlertRepository extends JpaRepository<PriceAlert, UUID> {
    Optional<PriceAlert> findByUserIdAndProductId(UUID userId, UUID productId);
    List<PriceAlert> findByUserId(UUID userId);
}
""",
    # DTOs
    f"{base_dir}/product/dto/ProductDto.java": """package com.physiqo.product.dto;
import lombok.Data;
import java.util.UUID;
@Data public class ProductDto { private UUID id; private String name; private String brand; private String category; private Boolean isVerified; }
""",
    f"{base_dir}/product/dto/ProductNutritionDto.java": """package com.physiqo.product.dto;
import lombok.Data;
@Data public class ProductNutritionDto { private Double calories; private Double protein; private Double carbs; private Double fat; }
""",
    f"{base_dir}/product/dto/ProductPriceDto.java": """package com.physiqo.product.dto;
import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;
@Data public class ProductPriceDto { private UUID id; private String storeName; private BigDecimal price; private String currency; private Boolean isAvailable; }
""",
    f"{base_dir}/product/dto/ProductVerificationDto.java": """package com.physiqo.product.dto;
import lombok.Data;
@Data public class ProductVerificationDto { private String status; private String remarks; }
""",
    f"{base_dir}/product/dto/PriceAlertDto.java": """package com.physiqo.product.dto;
import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;
@Data public class PriceAlertDto { private UUID id; private UUID productId; private BigDecimal targetPrice; private Boolean isActive; }
""",
    f"{base_dir}/product/dto/ProductComparisonDto.java": """package com.physiqo.product.dto;
import lombok.Data;
import java.util.List;
@Data public class ProductComparisonDto { 
    private ProductDto product;
    private ProductNutritionDto nutrition;
    private List<ProductPriceDto> prices;
}
""",
    # Services
    f"{base_dir}/product/service/ProductService.java": """package com.physiqo.product.service;

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
""",
    f"{base_dir}/product/service/PriceAlertService.java": """package com.physiqo.product.service;

import com.physiqo.product.entity.PriceAlert;
import com.physiqo.product.repository.PriceAlertRepository;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PriceAlertService {
    private final PriceAlertRepository priceAlertRepository;

    public PriceAlert createAlert(PriceAlert alert) {
        if(priceAlertRepository.findByUserIdAndProductId(alert.getUserId(), alert.getProduct().getId()).isPresent()) {
            throw new RuntimeException("Alert already exists for this product");
        }
        return priceAlertRepository.save(alert);
    }
    
    public List<PriceAlert> getUserAlerts(UUID userId) {
        return priceAlertRepository.findByUserId(userId);
    }
    
    public PriceAlert updateAlert(UUID id, PriceAlert alertDetails) {
        PriceAlert alert = priceAlertRepository.findById(id).orElseThrow();
        alert.setTargetPrice(alertDetails.getTargetPrice());
        return priceAlertRepository.save(alert);
    }
    
    public void deleteAlert(UUID id) {
        priceAlertRepository.deleteById(id);
    }
}
""",
    f"{base_dir}/product/service/VerificationService.java": """package com.physiqo.product.service;

import com.physiqo.product.entity.ProductVerification;
import com.physiqo.product.repository.ProductVerificationRepository;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class VerificationService {
    private final ProductVerificationRepository verificationRepository;

    public ProductVerification submitVerification(ProductVerification verification) {
        return verificationRepository.save(verification);
    }
}
""",
    # Controllers
    f"{base_dir}/product/controller/ProductController.java": """package com.physiqo.product.controller;

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
""",
    f"{base_dir}/product/controller/PriceAlertController.java": """package com.physiqo.product.controller;

import com.physiqo.product.entity.PriceAlert;
import com.physiqo.product.service.PriceAlertService;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/price-alerts")
@RequiredArgsConstructor
public class PriceAlertController {
    private final PriceAlertService priceAlertService;

    @PostMapping
    public PriceAlert createAlert(@RequestBody PriceAlert alert) {
        return priceAlertService.createAlert(alert);
    }

    @GetMapping
    public List<PriceAlert> getAlerts(@RequestParam UUID userId) {
        return priceAlertService.getUserAlerts(userId);
    }

    @PutMapping("/{id}")
    public PriceAlert updateAlert(@PathVariable UUID id, @RequestBody PriceAlert alert) {
        return priceAlertService.updateAlert(id, alert);
    }

    @DeleteMapping("/{id}")
    public void deleteAlert(@PathVariable UUID id) {
        priceAlertService.deleteAlert(id);
    }
}
""",

    # Notification Package
    f"{base_dir}/notification/entity/Notification.java": """package com.physiqo.notification.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.UUID;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    private UUID userId;
    private String title;
    private String message;
    private String type;
    private Boolean isRead = false;
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
""",
    f"{base_dir}/notification/repository/NotificationRepository.java": """package com.physiqo.notification.repository;

import com.physiqo.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    List<Notification> findByUserIdAndIsReadAndType(UUID userId, Boolean isRead, String type);
    List<Notification> findByUserId(UUID userId);
}
""",
    f"{base_dir}/notification/dto/NotificationDto.java": """package com.physiqo.notification.dto;
import lombok.Data;
import java.util.UUID;
@Data public class NotificationDto { private UUID id; private String title; private String message; private Boolean isRead; }
""",
    f"{base_dir}/notification/dto/NotificationListResponse.java": """package com.physiqo.notification.dto;
import lombok.Data;
import java.util.List;
@Data public class NotificationListResponse { private List<NotificationDto> notifications; private long totalCount; }
""",
    f"{base_dir}/notification/service/NotificationService.java": """package com.physiqo.notification.service;

import com.physiqo.notification.entity.Notification;
import com.physiqo.notification.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;

    public Notification create(Notification notification) {
        return notificationRepository.save(notification);
    }

    public List<Notification> getUserNotifications(UUID userId) {
        return notificationRepository.findByUserId(userId);
    }

    public void markAsRead(UUID id) {
        Notification n = notificationRepository.findById(id).orElseThrow();
        n.setIsRead(true);
        notificationRepository.save(n);
    }

    public void markAllAsRead(UUID userId) {
        List<Notification> notifs = notificationRepository.findByUserId(userId);
        notifs.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(notifs);
    }
}
""",
    f"{base_dir}/notification/controller/NotificationController.java": """package com.physiqo.notification.controller;

import com.physiqo.notification.entity.Notification;
import com.physiqo.notification.service.NotificationService;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;

    @GetMapping
    public List<Notification> getNotifications(@RequestParam UUID userId) {
        return notificationService.getUserNotifications(userId);
    }

    @PutMapping("/{id}/read")
    public void markAsRead(@PathVariable UUID id) {
        notificationService.markAsRead(id);
    }

    @PutMapping("/read-all")
    public void markAllAsRead(@RequestParam UUID userId) {
        notificationService.markAllAsRead(userId);
    }
}
"""
}

for path, content in files.items():
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
print("done")
