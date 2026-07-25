package com.physiqo.workout.service;

import com.physiqo.common.exception.ErrorCode;
import com.physiqo.common.exception.ResourceNotFoundException;
import com.physiqo.workout.entity.ExerciseSet;
import com.physiqo.workout.entity.WorkoutSession;
import com.physiqo.workout.repository.ExerciseSetRepository;
import com.physiqo.workout.repository.WorkoutSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WorkoutSessionService {

    private final WorkoutSessionRepository sessionRepository;
    private final ExerciseSetRepository setRepository;

    @Transactional
    public WorkoutSession startSession(UUID userId, WorkoutSession session) {
        session.setUserId(userId);
        if (session.getStartedAt() == null) {
            session.setStartedAt(Instant.now());
        }
        return sessionRepository.save(session);
    }

    @Transactional
    public WorkoutSession updateSession(UUID id, UUID userId, WorkoutSession updated) {
        WorkoutSession session = sessionRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.NOT_FOUND_WORKOUT_SESSION, "Workout session not found: " + id));

        if (updated.getCompletedAt() != null) {
            session.setCompletedAt(updated.getCompletedAt());
            if (session.getStartedAt() != null) {
                long minutes = Duration.between(session.getStartedAt(), updated.getCompletedAt()).toMinutes();
                session.setDurationMinutes((int) Math.max(1, minutes));
            }
        }
        if (updated.getNotes() != null) session.setNotes(updated.getNotes());
        if (updated.getRating() != null) session.setRating(updated.getRating());

        return sessionRepository.save(session);
    }

    @Transactional
    public ExerciseSet logSet(UUID sessionId, UUID userId, ExerciseSet exerciseSet) {
        WorkoutSession session = sessionRepository.findByIdAndUserId(sessionId, userId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.NOT_FOUND_WORKOUT_SESSION, "Workout session not found: " + sessionId));

        exerciseSet.setSession(session);
        return setRepository.save(exerciseSet);
    }

    @Transactional
    public ExerciseSet updateSet(UUID sessionId, UUID setId, UUID userId, ExerciseSet updated) {
        WorkoutSession session = sessionRepository.findByIdAndUserId(sessionId, userId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.NOT_FOUND_WORKOUT_SESSION, "Workout session not found: " + sessionId));

        ExerciseSet set = setRepository.findById(setId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.NOT_FOUND_WORKOUT_SESSION, "Set not found: " + setId));

        if (updated.getWeightKg() != null) set.setWeightKg(updated.getWeightKg());
        if (updated.getReps() != null) set.setReps(updated.getReps());
        if (updated.getDurationSeconds() != null) set.setDurationSeconds(updated.getDurationSeconds());
        if (updated.getRpe() != null) set.setRpe(updated.getRpe());
        if (updated.getSetType() != null) set.setSetType(updated.getSetType());
        set.setCompleted(updated.isCompleted());
        if (updated.getNotes() != null) set.setNotes(updated.getNotes());

        return setRepository.save(set);
    }

    @Transactional(readOnly = true)
    public Page<WorkoutSession> getSessions(UUID userId, Instant from, Instant to, Pageable pageable) {
        if (from != null && to != null) {
            return sessionRepository.findByUserIdAndStartedAtBetween(userId, from, to, pageable);
        }
        return sessionRepository.findByUserId(userId, pageable);
    }

    @Transactional(readOnly = true)
    public WorkoutSession getSessionById(UUID id, UUID userId) {
        return sessionRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.NOT_FOUND_WORKOUT_SESSION, "Workout session not found: " + id));
    }

    @Transactional
    public void deleteSession(UUID id, UUID userId) {
        WorkoutSession session = sessionRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.NOT_FOUND_WORKOUT_SESSION, "Workout session not found: " + id));
        sessionRepository.delete(session);
    }
}
