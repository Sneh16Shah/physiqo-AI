package com.physiqo.workout.repository;

import com.physiqo.workout.entity.Muscle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MuscleRepository extends JpaRepository<Muscle, UUID> {
    List<Muscle> findByMuscleGroup(String muscleGroup);
}
