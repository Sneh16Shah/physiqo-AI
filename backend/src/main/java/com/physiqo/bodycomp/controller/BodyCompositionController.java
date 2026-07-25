package com.physiqo.bodycomp.controller;

import com.physiqo.bodycomp.dto.*;
import com.physiqo.bodycomp.service.BodyCompositionService;
import com.physiqo.common.security.CurrentUser;
import com.physiqo.common.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/body-composition")
@RequiredArgsConstructor
public class BodyCompositionController {

    private final BodyCompositionService bodyCompositionService;

    @PostMapping("/reports")
    public ResponseEntity<BodyCompReportDto> createReport(
            @CurrentUser UserPrincipal currentUser,
            @Valid @RequestBody BodyCompReportRequest request) {
        BodyCompReportDto response = bodyCompositionService.createReport(currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @PostMapping("/reports/upload")
    public ResponseEntity<BodyCompReportDto> uploadReport(
            @CurrentUser UserPrincipal currentUser,
            @RequestParam("file") MultipartFile file) {
        BodyCompReportDto response = bodyCompositionService.uploadAndExtractReport(currentUser.getId(), file);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/reports/{id}/confirm")
    public ResponseEntity<BodyCompReportDto> confirmReport(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable UUID id,
            @Valid @RequestBody BodyCompReportRequest request) {
        BodyCompReportDto response = bodyCompositionService.confirmReport(id, currentUser.getId(), request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/reports")
    public ResponseEntity<Page<BodyCompReportDto>> getReports(
            @CurrentUser UserPrincipal currentUser,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            Pageable pageable) {
        Page<BodyCompReportDto> reports = bodyCompositionService.getReports(currentUser.getId(), from, to, pageable);
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/reports/{id}")
    public ResponseEntity<BodyCompReportDto> getReportById(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable UUID id) {
        BodyCompReportDto report = bodyCompositionService.getReportById(id, currentUser.getId());
        return ResponseEntity.ok(report);
    }

    @DeleteMapping("/reports/{id}")
    public ResponseEntity<Void> deleteReport(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable UUID id) {
        bodyCompositionService.deleteReport(id, currentUser.getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/trends")
    public ResponseEntity<TrendResponseDto> getTrends(
            @CurrentUser UserPrincipal currentUser,
            @RequestParam(defaultValue = "body_fat_pct") String metric,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        TrendResponseDto trends = bodyCompositionService.getTrends(currentUser.getId(), metric, from, to);
        return ResponseEntity.ok(trends);
    }
}
