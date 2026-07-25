package com.physiqo.workout.controller;

import com.physiqo.common.security.CurrentUser;
import com.physiqo.common.security.UserPrincipal;
import com.physiqo.workout.entity.WorkoutPlan;
import com.physiqo.workout.service.WorkoutPlanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/workout-plans")
@RequiredArgsConstructor
public class WorkoutPlanController {

    private final WorkoutPlanService planService;

    @PostMapping
    public ResponseEntity<WorkoutPlan> createPlan(
            @CurrentUser UserPrincipal currentUser,
            @Valid @RequestBody WorkoutPlan plan) {
        WorkoutPlan created = planService.createPlan(currentUser.getId(), plan);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<Page<WorkoutPlan>> getPlans(
            @CurrentUser UserPrincipal currentUser,
            @RequestParam(required = false) Boolean active,
            Pageable pageable) {
        Page<WorkoutPlan> plans = planService.getPlans(currentUser.getId(), active, pageable);
        return ResponseEntity.ok(plans);
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkoutPlan> getPlanById(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable UUID id) {
        WorkoutPlan plan = planService.getPlanById(id, currentUser.getId());
        return ResponseEntity.ok(plan);
    }

    @PutMapping("/{id}")
    public ResponseEntity<WorkoutPlan> updatePlan(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable UUID id,
            @Valid @RequestBody WorkoutPlan plan) {
        WorkoutPlan updated = planService.updatePlan(id, currentUser.getId(), plan);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlan(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable UUID id) {
        planService.deletePlan(id, currentUser.getId());
        return ResponseEntity.noContent().build();
    }
}
