package com.physiqo.workout.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "muscles")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Muscle {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(name = "muscle_group", nullable = false)
    private String muscleGroup;

    private String description;
}
