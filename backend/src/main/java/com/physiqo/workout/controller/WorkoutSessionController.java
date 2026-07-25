package com.physiqo.workout.controller;

import com.physiqo.common.security.CurrentUser;
import com.physiqo.common.security.UserPrincipal;
import com.physiqo.workout.entity.ExerciseSet;
import com.physiqo.workout.entity.WorkoutSession;
import com.physiqo.workout.service.WorkoutSessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/workout-sessions")
@RequiredArgsConstructor
public class WorkoutSessionController {

    private final WorkoutSessionService sessionService;

    @PostMapping
    public ResponseEntity<WorkoutSession> startSession(
            @CurrentUser UserPrincipal currentUser,
            @Valid @RequestBody WorkoutSession session) {
        WorkoutSession created = sessionService.startSession(currentUser.getId(), session);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<WorkoutSession> updateSession(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable UUID id,
            @RequestBody WorkoutSession session) {
        WorkoutSession updated = sessionService.updateSession(id, currentUser.getId(), session);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/sets")
    public ResponseEntity<ExerciseSet> logSet(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable UUID id,
            @Valid @RequestBody ExerciseSet exerciseSet) {
        ExerciseSet created = sessionService.logSet(id, currentUser.getId(), exerciseSet);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{sessionId}/sets/{setId}")
    public ResponseEntity<ExerciseSet> updateSet(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable UUID sessionId,
            @PathVariable UUID setId,
            @RequestBody ExerciseSet exerciseSet) {
        ExerciseSet updated = sessionService.updateSet(sessionId, setId, currentUser.getId(), exerciseSet);
        return ResponseEntity.ok(updated);
    }

    @GetMapping
    public ResponseEntity<Page<WorkoutSession>> getSessions(
            @CurrentUser UserPrincipal currentUser,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to,
            Pageable pageable) {
        Page<WorkoutSession> sessions = sessionService.getSessions(currentUser.getId(), from, to, pageable);
        return ResponseEntity.ok(sessions);
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkoutSession> getSessionById(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable UUID id) {
        WorkoutSession session = sessionService.getSessionById(id, currentUser.getId());
        return ResponseEntity.ok(session);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSession(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable UUID id) {
        sessionService.deleteSession(id, currentUser.getId());
        return ResponseEntity.noContent().build();
    }
}
