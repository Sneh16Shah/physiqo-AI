package com.physiqo.workout.controller;

import com.physiqo.common.security.CurrentUser;
import com.physiqo.common.security.UserPrincipal;
import com.physiqo.workout.entity.Exercise;
import com.physiqo.workout.service.ExerciseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/exercises")
@RequiredArgsConstructor
public class ExerciseController {

    private final ExerciseService exerciseService;

    @GetMapping
    public ResponseEntity<Page<Exercise>> searchExercises(
            @CurrentUser UserPrincipal currentUser,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String equipment,
            @RequestParam(required = false) String search,
            Pageable pageable) {
        Page<Exercise> exercises = exerciseService.searchExercises(category, equipment, search, currentUser.getId(), pageable);
        return ResponseEntity.ok(exercises);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Exercise> getExerciseById(@PathVariable UUID id) {
        Exercise exercise = exerciseService.getExerciseById(id);
        return ResponseEntity.ok(exercise);
    }

    @PostMapping
    public ResponseEntity<Exercise> createCustomExercise(
            @CurrentUser UserPrincipal currentUser,
            @Valid @RequestBody Exercise exercise) {
        Exercise created = exerciseService.createCustomExercise(currentUser.getId(), exercise);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Exercise> updateCustomExercise(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable UUID id,
            @Valid @RequestBody Exercise exercise) {
        Exercise updated = exerciseService.updateCustomExercise(id, currentUser.getId(), exercise);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCustomExercise(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable UUID id) {
        exerciseService.deleteCustomExercise(id, currentUser.getId());
        return ResponseEntity.noContent().build();
    }
}
