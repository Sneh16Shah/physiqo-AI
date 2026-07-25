package com.physiqo.bodycomp.service;

import com.physiqo.bodycomp.dto.BodyTapeMeasurementDto;
import com.physiqo.bodycomp.dto.BodyTapeMeasurementRequest;
import com.physiqo.bodycomp.entity.BodyMeasurement;
import com.physiqo.bodycomp.repository.BodyMeasurementRepository;
import com.physiqo.common.exception.ErrorCode;
import com.physiqo.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BodyMeasurementService {

    private final BodyMeasurementRepository measurementRepository;

    @Transactional
    public BodyTapeMeasurementDto createMeasurement(UUID userId, BodyTapeMeasurementRequest request) {
        BodyMeasurement measurement = BodyMeasurement.builder()
                .userId(userId)
                .measuredAt(request.getMeasuredAt() != null ? request.getMeasuredAt() : Instant.now())
                .weightKg(request.getWeightKg())
                .neckCm(request.getNeckCm())
                .chestCm(request.getChestCm())
                .waistCm(request.getWaistCm())
                .hipsCm(request.getHipsCm())
                .leftBicepCm(request.getLeftBicepCm())
                .rightBicepCm(request.getRightBicepCm())
                .leftForearmCm(request.getLeftForearmCm())
                .rightForearmCm(request.getRightForearmCm())
                .leftThighCm(request.getLeftThighCm())
                .rightThighCm(request.getRightThighCm())
                .leftCalfCm(request.getLeftCalfCm())
                .rightCalfCm(request.getRightCalfCm())
                .notes(request.getNotes())
                .build();

        BodyMeasurement saved = measurementRepository.save(measurement);
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public Page<BodyTapeMeasurementDto> getMeasurements(UUID userId, Instant from, Instant to, Pageable pageable) {
        Page<BodyMeasurement> page;
        if (from != null && to != null) {
            page = measurementRepository.findByUserIdAndMeasuredAtBetween(userId, from, to, pageable);
        } else {
            page = measurementRepository.findByUserId(userId, pageable);
        }
        return page.map(this::toDto);
    }

    @Transactional(readOnly = true)
    public BodyTapeMeasurementDto getMeasurementById(UUID id, UUID userId) {
        BodyMeasurement m = measurementRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.NOT_FOUND_MEASUREMENT, "Body measurement not found: " + id));
        return toDto(m);
    }

    @Transactional
    public BodyTapeMeasurementDto updateMeasurement(UUID id, UUID userId, BodyTapeMeasurementRequest request) {
        BodyMeasurement m = measurementRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.NOT_FOUND_MEASUREMENT, "Body measurement not found: " + id));

        if (request.getMeasuredAt() != null) m.setMeasuredAt(request.getMeasuredAt());
        if (request.getWeightKg() != null) m.setWeightKg(request.getWeightKg());
        if (request.getNeckCm() != null) m.setNeckCm(request.getNeckCm());
        if (request.getChestCm() != null) m.setChestCm(request.getChestCm());
        if (request.getWaistCm() != null) m.setWaistCm(request.getWaistCm());
        if (request.getHipsCm() != null) m.setHipsCm(request.getHipsCm());
        if (request.getLeftBicepCm() != null) m.setLeftBicepCm(request.getLeftBicepCm());
        if (request.getRightBicepCm() != null) m.setRightBicepCm(request.getRightBicepCm());
        if (request.getLeftForearmCm() != null) m.setLeftForearmCm(request.getLeftForearmCm());
        if (request.getRightForearmCm() != null) m.setRightForearmCm(request.getRightForearmCm());
        if (request.getLeftThighCm() != null) m.setLeftThighCm(request.getLeftThighCm());
        if (request.getRightThighCm() != null) m.setRightThighCm(request.getRightThighCm());
        if (request.getLeftCalfCm() != null) m.setLeftCalfCm(request.getLeftCalfCm());
        if (request.getRightCalfCm() != null) m.setRightCalfCm(request.getRightCalfCm());
        if (request.getNotes() != null) m.setNotes(request.getNotes());

        BodyMeasurement saved = measurementRepository.save(m);
        return toDto(saved);
    }

    @Transactional
    public void deleteMeasurement(UUID id, UUID userId) {
        BodyMeasurement m = measurementRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.NOT_FOUND_MEASUREMENT, "Body measurement not found: " + id));
        measurementRepository.delete(m);
    }

    private BodyTapeMeasurementDto toDto(BodyMeasurement m) {
        return BodyTapeMeasurementDto.builder()
                .id(m.getId())
                .userId(m.getUserId())
                .measuredAt(m.getMeasuredAt())
                .weightKg(m.getWeightKg())
                .neckCm(m.getNeckCm())
                .chestCm(m.getChestCm())
                .waistCm(m.getWaistCm())
                .hipsCm(m.getHipsCm())
                .leftBicepCm(m.getLeftBicepCm())
                .rightBicepCm(m.getRightBicepCm())
                .leftForearmCm(m.getLeftForearmCm())
                .rightForearmCm(m.getRightForearmCm())
                .leftThighCm(m.getLeftThighCm())
                .rightThighCm(m.getRightThighCm())
                .leftCalfCm(m.getLeftCalfCm())
                .rightCalfCm(m.getRightCalfCm())
                .notes(m.getNotes())
                .createdAt(m.getCreatedAt())
                .updatedAt(m.getUpdatedAt())
                .build();
    }
}
