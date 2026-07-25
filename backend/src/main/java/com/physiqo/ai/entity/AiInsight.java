package com.physiqo.ai.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "ai_insights")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiInsight {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "insight_type", nullable = false)
    private String insightType; // PROGRESS, NUTRITION, TRAINING, RECOVERY

    @Column(nullable = false, length = 1000)
    private String content;

    @Column(nullable = false)
    private Double confidence;

    @Column(name = "is_dismissed", nullable = false)
    private boolean isDismissed;

    @Column(name = "source_data_ref")
    private String sourceDataRef;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
