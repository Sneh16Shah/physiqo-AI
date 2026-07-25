package com.physiqo.nutrition.controller;

import com.physiqo.common.security.CurrentUser;
import com.physiqo.common.security.UserPrincipal;
import com.physiqo.nutrition.entity.NutritionGoal;
import com.physiqo.nutrition.service.NutritionGoalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/nutrition-goals")
@RequiredArgsConstructor
public class NutritionGoalController {

    private final NutritionGoalService goalService;

    @GetMapping("/current")
    public ResponseEntity<NutritionGoal> getCurrentGoal(@CurrentUser UserPrincipal currentUser) {
        NutritionGoal goal = goalService.getCurrentGoal(currentUser.getId());
        return ResponseEntity.ok(goal);
    }

    @PostMapping
    public ResponseEntity<NutritionGoal> setGoal(
            @CurrentUser UserPrincipal currentUser,
            @Valid @RequestBody NutritionGoal goal) {
        NutritionGoal created = goalService.setGoal(currentUser.getId(), goal);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
