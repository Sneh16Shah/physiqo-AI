package com.physiqo.bodycomp.repository;

import com.physiqo.bodycomp.entity.BodyCompositionReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BodyCompositionReportRepository extends JpaRepository<BodyCompositionReport, UUID> {
    Page<BodyCompositionReport> findByUserId(UUID userId, Pageable pageable);
    Page<BodyCompositionReport> findByUserIdAndReportDateBetween(UUID userId, LocalDate from, LocalDate to, Pageable pageable);
    Optional<BodyCompositionReport> findByIdAndUserId(UUID id, UUID userId);
    List<BodyCompositionReport> findByUserIdAndReportDateBetweenOrderByReportDateAsc(UUID userId, LocalDate from, LocalDate to);
}
