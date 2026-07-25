package com.physiqo.workout.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.physiqo.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "exercise_sets")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExerciseSet extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    @JsonIgnore
    private WorkoutSession session;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "exercise_id", nullable = false)
    private Exercise exercise;

    @Column(name = "set_number", nullable = false)
    private Integer setNumber;

    @Column(name = "set_type", nullable = false)
    private String setType = "WORKING"; // WARMUP, WORKING, DROP, FAILURE

    @Column(name = "weight_kg")
    private BigDecimal weightKg;

    private Integer reps;

    @Column(name = "duration_seconds")
    private Integer durationSeconds;

    private BigDecimal rpe;

    @Column(nullable = false)
    private boolean completed = true;

    private String notes;
}
