package com.physiqo.bodycomp.controller;

import com.physiqo.bodycomp.dto.BodyTapeMeasurementDto;
import com.physiqo.bodycomp.dto.BodyTapeMeasurementRequest;
import com.physiqo.bodycomp.service.BodyMeasurementService;
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

import java.time.Instant;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/body-measurements")
@RequiredArgsConstructor
public class BodyMeasurementController {

    private final BodyMeasurementService measurementService;

    @PostMapping
    public ResponseEntity<BodyTapeMeasurementDto> createMeasurement(
            @CurrentUser UserPrincipal currentUser,
            @Valid @RequestBody BodyTapeMeasurementRequest request) {
        BodyTapeMeasurementDto response = measurementService.createMeasurement(currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<Page<BodyTapeMeasurementDto>> getMeasurements(
            @CurrentUser UserPrincipal currentUser,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to,
            Pageable pageable) {
        Page<BodyTapeMeasurementDto> page = measurementService.getMeasurements(currentUser.getId(), from, to, pageable);
        return ResponseEntity.ok(page);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BodyTapeMeasurementDto> getMeasurementById(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable UUID id) {
        BodyTapeMeasurementDto dto = measurementService.getMeasurementById(id, currentUser.getId());
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BodyTapeMeasurementDto> updateMeasurement(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable UUID id,
            @Valid @RequestBody BodyTapeMeasurementRequest request) {
        BodyTapeMeasurementDto updated = measurementService.updateMeasurement(id, currentUser.getId(), request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMeasurement(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable UUID id) {
        measurementService.deleteMeasurement(id, currentUser.getId());
        return ResponseEntity.noContent().build();
    }
}
