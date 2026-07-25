package com.physiqo.bodycomp.repository;

import com.physiqo.bodycomp.entity.BodyMeasurement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BodyMeasurementRepository extends JpaRepository<BodyMeasurement, UUID> {
    Page<BodyMeasurement> findByUserId(UUID userId, Pageable pageable);
    Page<BodyMeasurement> findByUserIdAndMeasuredAtBetween(UUID userId, Instant from, Instant to, Pageable pageable);
    Optional<BodyMeasurement> findByIdAndUserId(UUID id, UUID userId);
}
