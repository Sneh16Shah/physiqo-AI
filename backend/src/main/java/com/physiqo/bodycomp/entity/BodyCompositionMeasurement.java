package com.physiqo.bodycomp.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.physiqo.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "body_composition_measurements")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BodyCompositionMeasurement extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_id", nullable = false)
    @JsonIgnore
    private BodyCompositionReport report;

    @Column(name = "metric_name", nullable = false)
    private String metricName;

    @Column(name = "metric_value", nullable = false)
    private BigDecimal metricValue;

    @Column(name = "metric_unit", nullable = false)
    private String metricUnit;

    private BigDecimal confidence;

    @Column(name = "user_corrected", nullable = false)
    private boolean userCorrected = false;
}
