package com.physiqo.workout.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.util.UUID;

@Entity
@Table(name = "exercise_muscles")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@IdClass(ExerciseMuscle.ExerciseMuscleId.class)
public class ExerciseMuscle {

    @Id
    @Column(name = "exercise_id")
    private UUID exerciseId;

    @Id
    @Column(name = "muscle_id")
    private UUID muscleId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exercise_id", insertable = false, updatable = false)
    @JsonIgnore
    private Exercise exercise;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "muscle_id", insertable = false, updatable = false)
    private Muscle muscle;

    @Column(nullable = false)
    private String involvement; // PRIMARY, SECONDARY, STABILIZER

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExerciseMuscleId implements Serializable {
        private UUID exerciseId;
        private UUID muscleId;
    }
}
