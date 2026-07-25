package com.physiqo.workout.controller;

import com.physiqo.workout.entity.Muscle;
import com.physiqo.workout.service.ExerciseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/muscles")
@RequiredArgsConstructor
public class MuscleController {

    private final ExerciseService exerciseService;

    @GetMapping
    public ResponseEntity<List<Muscle>> getMuscles(@RequestParam(required = false) String group) {
        List<Muscle> muscles = exerciseService.getMuscles(group);
        return ResponseEntity.ok(muscles);
    }
}
