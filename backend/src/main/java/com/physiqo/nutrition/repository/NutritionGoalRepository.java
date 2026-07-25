package com.physiqo.nutrition.repository;

import com.physiqo.nutrition.entity.NutritionGoal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NutritionGoalRepository extends JpaRepository<NutritionGoal, UUID> {

    @Query("SELECT g FROM NutritionGoal g WHERE g.userId = :userId AND " +
           ":date >= g.effectiveFrom AND (g.effectiveTo IS NULL OR :date <= g.effectiveTo) " +
           "ORDER BY g.effectiveFrom DESC")
    Optional<NutritionGoal> findCurrentGoalForUser(@Param("userId") UUID userId, @Param("date") LocalDate date);

    Optional<NutritionGoal> findFirstByUserIdAndEffectiveToIsNullOrderByEffectiveFromDesc(UUID userId);
}
