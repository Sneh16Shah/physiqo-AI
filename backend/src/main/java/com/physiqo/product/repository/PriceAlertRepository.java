package com.physiqo.product.repository;

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
