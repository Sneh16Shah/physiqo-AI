package com.physiqo.bodycomp.entity;

import com.physiqo.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "body_composition_reports")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BodyCompositionReport extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "report_date", nullable = false)
    private LocalDate reportDate;

    @Column(name = "report_type", nullable = false)
    private String reportType; // DEXA, INBODY, BIOIMPEDANCE, MANUAL

    @Column(nullable = false)
    private String source; // OCR, MANUAL

    @Column(name = "file_id")
    private UUID fileId;

    @Column(name = "ai_confidence")
    private BigDecimal aiConfidence;

    @Column(name = "user_reviewed", nullable = false)
    private boolean userReviewed = false;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "ai_raw_response", columnDefinition = "jsonb")
    private String aiRawResponse;

    private String notes;

    @OneToMany(mappedBy = "report", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<BodyCompositionMeasurement> measurements = new ArrayList<>();
}
