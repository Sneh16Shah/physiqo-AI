package com.physiqo.product.repository;

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
