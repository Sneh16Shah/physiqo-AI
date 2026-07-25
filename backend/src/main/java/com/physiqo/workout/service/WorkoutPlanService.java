package com.physiqo.workout.service;

import com.physiqo.common.exception.ErrorCode;
import com.physiqo.common.exception.ResourceNotFoundException;
import com.physiqo.workout.entity.WorkoutDay;
import com.physiqo.workout.entity.WorkoutExercise;
import com.physiqo.workout.entity.WorkoutPlan;
import com.physiqo.workout.repository.WorkoutPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WorkoutPlanService {

    private final WorkoutPlanRepository planRepository;

    @Transactional
    public WorkoutPlan createPlan(UUID userId, WorkoutPlan plan) {
        plan.setUserId(userId);
        if (plan.getDays() != null) {
            for (WorkoutDay day : plan.getDays()) {
                day.setPlan(plan);
                if (day.getExercises() != null) {
                    for (WorkoutExercise ex : day.getExercises()) {
                        ex.setDay(day);
                    }
                }
            }
        }
        return planRepository.save(plan);
    }

    @Transactional(readOnly = true)
    public Page<WorkoutPlan> getPlans(UUID userId, Boolean active, Pageable pageable) {
        if (active != null) {
            return planRepository.findByUserIdAndActive(userId, active, pageable);
        }
        return planRepository.findByUserId(userId, pageable);
    }

    @Transactional(readOnly = true)
    public WorkoutPlan getPlanById(UUID id, UUID userId) {
        return planRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.NOT_FOUND_WORKOUT_PLAN, "Workout plan not found: " + id));
    }

    @Transactional
    public WorkoutPlan updatePlan(UUID id, UUID userId, WorkoutPlan updated) {
        WorkoutPlan plan = planRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.NOT_FOUND_WORKOUT_PLAN, "Workout plan not found: " + id));

        if (updated.getName() != null) plan.setName(updated.getName());
        if (updated.getDescription() != null) plan.setDescription(updated.getDescription());
        if (updated.getGoal() != null) plan.setGoal(updated.getGoal());
        if (updated.getDifficulty() != null) plan.setDifficulty(updated.getDifficulty());
        plan.setActive(updated.isActive());

        return planRepository.save(plan);
    }

    @Transactional
    public void deletePlan(UUID id, UUID userId) {
        WorkoutPlan plan = planRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.NOT_FOUND_WORKOUT_PLAN, "Workout plan not found: " + id));
        planRepository.delete(plan);
    }
}
