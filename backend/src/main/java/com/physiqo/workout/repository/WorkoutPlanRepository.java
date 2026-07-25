package com.physiqo.workout.repository;

import com.physiqo.workout.entity.WorkoutPlan;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface WorkoutPlanRepository extends JpaRepository<WorkoutPlan, UUID> {
    Page<WorkoutPlan> findByUserId(UUID userId, Pageable pageable);
    Page<WorkoutPlan> findByUserIdAndActive(UUID userId, boolean active, Pageable pageable);
    Optional<WorkoutPlan> findByIdAndUserId(UUID id, UUID userId);
}
