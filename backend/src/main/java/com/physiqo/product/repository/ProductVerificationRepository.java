package com.physiqo.product.repository;

import com.physiqo.product.entity.ProductVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface ProductVerificationRepository extends JpaRepository<ProductVerification, UUID> {
    List<ProductVerification> findByProductId(UUID productId);
}
