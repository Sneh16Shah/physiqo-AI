package com.physiqo.nutrition.repository;

import com.physiqo.nutrition.entity.Meal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MealRepository extends JpaRepository<Meal, UUID> {
    Page<Meal> findByUserId(UUID userId, Pageable pageable);
    Page<Meal> findByUserIdAndMealDate(UUID userId, LocalDate mealDate, Pageable pageable);
    Page<Meal> findByUserIdAndMealDateBetween(UUID userId, LocalDate from, LocalDate to, Pageable pageable);
    List<Meal> findByUserIdAndMealDateOrderByMealTimeAsc(UUID userId, LocalDate mealDate);
    Optional<Meal> findByIdAndUserId(UUID id, UUID userId);
}
