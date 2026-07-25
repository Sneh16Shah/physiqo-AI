package com.physiqo.workout.repository;

import com.physiqo.workout.entity.WorkoutSession;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WorkoutSessionRepository extends JpaRepository<WorkoutSession, UUID> {
    Page<WorkoutSession> findByUserId(UUID userId, Pageable pageable);
    Page<WorkoutSession> findByUserIdAndStartedAtBetween(UUID userId, Instant from, Instant to, Pageable pageable);
    Optional<WorkoutSession> findByIdAndUserId(UUID id, UUID userId);
}
