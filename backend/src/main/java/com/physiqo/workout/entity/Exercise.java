package com.physiqo.workout.entity;

import com.physiqo.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "exercises")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Exercise extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(nullable = false)
    private String category; // COMPOUND, ISOLATION, CARDIO, FLEXIBILITY

    private String equipment; // BARBELL, DUMBBELL, MACHINE, CABLE, BODYWEIGHT, BAND
    private String difficulty; // BEGINNER, INTERMEDIATE, ADVANCED
    private String instructions;

    @Column(name = "is_custom", nullable = false)
    private boolean custom = false;

    @Column(name = "created_by")
    private UUID createdBy;

    @OneToMany(mappedBy = "exercise", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ExerciseMuscle> exerciseMuscles = new ArrayList<>();
}
