package com.physiqo.workout.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "exercise_muscles")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExerciseMuscle {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exercise_id", nullable = false)
    @JsonIgnore
    private Exercise exercise;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "muscle_id", nullable = false)
    private Muscle muscle;

    @Column(nullable = false)
    private String involvement; // PRIMARY, SECONDARY, STABILIZER
}
