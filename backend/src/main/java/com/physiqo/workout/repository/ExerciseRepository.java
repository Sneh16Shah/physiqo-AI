package com.physiqo.workout.repository;

import com.physiqo.workout.entity.Exercise;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ExerciseRepository extends JpaRepository<Exercise, UUID> {

    @Query("SELECT e FROM Exercise e WHERE " +
           "(:category IS NULL OR e.category = :category) AND " +
           "(:equipment IS NULL OR e.equipment = :equipment) AND " +
           "(:search IS NULL OR LOWER(e.name) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(e.custom = false OR e.createdBy = :userId)")
    Page<Exercise> searchExercises(
            @Param("category") String category,
            @Param("equipment") String equipment,
            @Param("search") String search,
            @Param("userId") UUID userId,
            Pageable pageable);

    Optional<Exercise> findByIdAndCreatedBy(UUID id, UUID createdBy);
}
