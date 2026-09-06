package com.physiqo.nutrition.service;

import com.physiqo.common.exception.ErrorCode;
import com.physiqo.common.exception.ResourceNotFoundException;
import com.physiqo.nutrition.entity.NutritionGoal;
import com.physiqo.nutrition.repository.NutritionGoalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NutritionGoalService {

    private final NutritionGoalRepository goalRepository;

    @Transactional(readOnly = true)
    public NutritionGoal getCurrentGoal(UUID userId) {
        return goalRepository.findCurrentGoalForUser(userId, LocalDate.now())
                .orElseGet(() -> NutritionGoal.builder()
                        .userId(userId)
                        .caloriesKcal(new java.math.BigDecimal("2200"))
                        .proteinG(new java.math.BigDecimal("160"))
                        .carbsG(new java.math.BigDecimal("220"))
                        .fatG(new java.math.BigDecimal("65"))
                        .effectiveFrom(LocalDate.now())
                        .build());
    }

    @Transactional
    public NutritionGoal setGoal(UUID userId, NutritionGoal goal) {
        goal.setUserId(userId);
        if (goal.getEffectiveFrom() == null) {
            goal.setEffectiveFrom(LocalDate.now());
        }

        // Close previous active goal
        Optional<NutritionGoal> previous = goalRepository.findFirstByUserIdAndEffectiveToIsNullOrderByEffectiveFromDesc(userId);
        previous.ifPresent(prev -> {
            if (!prev.getEffectiveFrom().isAfter(goal.getEffectiveFrom())) {
                prev.setEffectiveTo(goal.getEffectiveFrom().minusDays(1));
                goalRepository.save(prev);
            }
        });

        return goalRepository.save(goal);
    }
}
