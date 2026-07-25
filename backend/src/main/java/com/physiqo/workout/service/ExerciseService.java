package com.physiqo.workout.service;

import com.physiqo.common.exception.AuthenticationException;
import com.physiqo.common.exception.ErrorCode;
import com.physiqo.common.exception.ResourceNotFoundException;
import com.physiqo.workout.entity.Exercise;
import com.physiqo.workout.entity.Muscle;
import com.physiqo.workout.repository.ExerciseRepository;
import com.physiqo.workout.repository.MuscleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ExerciseService {

    private final ExerciseRepository exerciseRepository;
    private final MuscleRepository muscleRepository;

    @Transactional(readOnly = true)
    public List<Muscle> getMuscles(String group) {
        if (group != null && !group.isBlank()) {
            return muscleRepository.findByMuscleGroup(group.toUpperCase());
        }
        return muscleRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Page<Exercise> searchExercises(String category, String equipment, String search, UUID userId, Pageable pageable) {
        return exerciseRepository.searchExercises(category, equipment, search, userId, pageable);
    }

    @Transactional(readOnly = true)
    public Exercise getExerciseById(UUID id) {
        return exerciseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.NOT_FOUND_EXERCISE, "Exercise not found: " + id));
    }

    @Transactional
    public Exercise createCustomExercise(UUID userId, Exercise exercise) {
        exercise.setCustom(true);
        exercise.setCreatedBy(userId);
        return exerciseRepository.save(exercise);
    }

    @Transactional
    public Exercise updateCustomExercise(UUID id, UUID userId, Exercise updated) {
        Exercise exercise = exerciseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.NOT_FOUND_EXERCISE, "Exercise not found: " + id));

        if (!exercise.isCustom() || !userId.equals(exercise.getCreatedBy())) {
            throw new AuthenticationException(ErrorCode.FORBIDDEN, "Cannot edit system exercises or exercises owned by another user");
        }

        if (updated.getName() != null) exercise.setName(updated.getName());
        if (updated.getDescription() != null) exercise.setDescription(updated.getDescription());
        if (updated.getCategory() != null) exercise.setCategory(updated.getCategory());
        if (updated.getEquipment() != null) exercise.setEquipment(updated.getEquipment());
        if (updated.getDifficulty() != null) exercise.setDifficulty(updated.getDifficulty());
        if (updated.getInstructions() != null) exercise.setInstructions(updated.getInstructions());

        return exerciseRepository.save(exercise);
    }

    @Transactional
    public void deleteCustomExercise(UUID id, UUID userId) {
        Exercise exercise = exerciseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.NOT_FOUND_EXERCISE, "Exercise not found: " + id));

        if (!exercise.isCustom() || !userId.equals(exercise.getCreatedBy())) {
            throw new AuthenticationException(ErrorCode.FORBIDDEN, "Cannot delete system exercises or exercises owned by another user");
        }

        exerciseRepository.delete(exercise);
    }
}
