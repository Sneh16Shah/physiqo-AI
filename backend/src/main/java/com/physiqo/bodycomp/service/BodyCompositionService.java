package com.physiqo.bodycomp.service;

import com.physiqo.bodycomp.dto.*;
import com.physiqo.bodycomp.entity.BodyCompositionMeasurement;
import com.physiqo.bodycomp.entity.BodyCompositionReport;
import com.physiqo.bodycomp.repository.BodyCompositionReportRepository;
import com.physiqo.common.exception.ErrorCode;
import com.physiqo.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.springframework.web.multipart.MultipartFile;
import com.physiqo.storage.service.StorageService;
import com.physiqo.storage.dto.FileResponseDto;
import com.physiqo.ai.client.AiServiceClient;
import com.physiqo.ai.validation.AiResponseValidator;
import com.fasterxml.jackson.databind.ObjectMapper;

@Slf4j
@Service
@RequiredArgsConstructor
public class BodyCompositionService {

    private final BodyCompositionReportRepository reportRepository;
    private final StorageService storageService;
    private final AiServiceClient aiServiceClient;
    private final AiResponseValidator aiResponseValidator;
    private final ObjectMapper objectMapper;

    @Transactional
    public BodyCompReportDto createReport(UUID userId, BodyCompReportRequest request) {
        BodyCompositionReport report = BodyCompositionReport.builder()
                .userId(userId)
                .reportDate(request.getReportDate())
                .reportType(request.getReportType())
                .source("MANUAL")
                .userReviewed(true)
                .notes(request.getNotes())
                .build();

        if (request.getMeasurements() != null) {
            for (MeasurementDto mDto : request.getMeasurements()) {
                BodyCompositionMeasurement m = BodyCompositionMeasurement.builder()
                        .report(report)
                        .metricName(mDto.getMetricName())
                        .metricValue(mDto.getMetricValue())
                        .metricUnit(mDto.getMetricUnit())
                        .confidence(BigDecimal.ONE)
                        .userCorrected(false)
                        .build();
                report.getMeasurements().add(m);
            }
        }

        BodyCompositionReport saved = reportRepository.save(report);
        return toDto(saved);
    }

    @Transactional
    public BodyCompReportDto uploadAndExtractReport(UUID userId, MultipartFile file) {
        FileResponseDto fileInfo = storageService.uploadFile(userId, file, "BODYCOMP");
        UUID requestId = UUID.randomUUID();
        
        Map<String, Object> aiResponse = null;
        double confidence = 0.85;
        try {
            aiResponse = aiServiceClient.extractBodyComposition(requestId, fileInfo.getUrl());
            if (aiResponse != null) {
                confidence = aiResponseValidator.extractConfidence(aiResponse);
            }
        } catch (Exception e) {
            log.error("AI service OCR extraction call failed, proceeding with uploaded document report", e);
        }

        BodyCompositionReport report = BodyCompositionReport.builder()
                .userId(userId)
                .reportDate(LocalDate.now())
                .reportType("INBODY")
                .source("OCR")
                .fileId(fileInfo.getId())
                .aiConfidence(BigDecimal.valueOf(confidence))
                .userReviewed(false)
                .build();

        if (aiResponse == null) {
            log.error("AI service OCR extraction call returned null or failed for request {}", requestId);
        } else {
            try {
                report.setAiRawResponse(objectMapper.writeValueAsString(aiResponse));
            } catch (Exception e) {
                log.error("Failed to serialize AI response", e);
            }

            if (aiResponse.containsKey("measurements") && aiResponse.get("measurements") instanceof Map<?, ?> measurementsMap) {
                for (Map.Entry<?, ?> entry : measurementsMap.entrySet()) {
                    Double numVal = null;
                    String unitVal = "kg";

                    if (entry.getValue() instanceof Number value) {
                        numVal = value.doubleValue();
                    } else if (entry.getValue() instanceof Map<?, ?> objMap) {
                        if (objMap.containsKey("value") && objMap.get("value") instanceof Number vNum) {
                            numVal = vNum.doubleValue();
                        }
                        if (objMap.containsKey("unit") && objMap.get("unit") != null) {
                            unitVal = objMap.get("unit").toString();
                        }
                    }

                    if (numVal != null) {
                        String metricKey = entry.getKey().toString();
                        if (metricKey.contains("pct") || metricKey.contains("percent")) {
                            unitVal = "%";
                        }
                        BodyCompositionMeasurement m = BodyCompositionMeasurement.builder()
                                .report(report)
                                .metricName(metricKey)
                                .metricValue(BigDecimal.valueOf(numVal))
                                .metricUnit(unitVal)
                                .confidence(BigDecimal.valueOf(confidence))
                                .userCorrected(false)
                                .build();
                        report.getMeasurements().add(m);
                    }
                }
            }
        }

        if (report.getMeasurements().isEmpty()) {
            log.warn("AI service OCR extraction yielded 0 measurements for image request {}", requestId);
        }

        BodyCompositionReport saved = reportRepository.save(report);
        return toDto(saved);
    }

    @Transactional
    public BodyCompReportDto confirmReport(UUID reportId, UUID userId, BodyCompReportRequest request) {
        BodyCompositionReport report = reportRepository.findByIdAndUserId(reportId, userId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.NOT_FOUND_REPORT, "Body composition report not found: " + reportId));

        report.setUserReviewed(true);
        if (request.getReportDate() != null) report.setReportDate(request.getReportDate());
        if (request.getReportType() != null) report.setReportType(request.getReportType());
        if (request.getNotes() != null) report.setNotes(request.getNotes());

        report.getMeasurements().clear();

        if (request.getMeasurements() != null) {
            for (MeasurementDto mDto : request.getMeasurements()) {
                BodyCompositionMeasurement m = BodyCompositionMeasurement.builder()
                        .report(report)
                        .metricName(mDto.getMetricName())
                        .metricValue(mDto.getMetricValue())
                        .metricUnit(mDto.getMetricUnit())
                        .confidence(mDto.getConfidence() != null ? mDto.getConfidence() : BigDecimal.ONE)
                        .userCorrected(true)
                        .build();
                report.getMeasurements().add(m);
            }
        }

        BodyCompositionReport saved = reportRepository.save(report);
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public Page<BodyCompReportDto> getReports(UUID userId, LocalDate from, LocalDate to, Pageable pageable) {
        Page<BodyCompositionReport> page;
        if (from != null && to != null) {
            page = reportRepository.findByUserIdAndReportDateBetween(userId, from, to, pageable);
        } else {
            page = reportRepository.findByUserId(userId, pageable);
        }
        return page.map(this::toDto);
    }

    @Transactional(readOnly = true)
    public BodyCompReportDto getReportById(UUID id, UUID userId) {
        BodyCompositionReport report = reportRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.NOT_FOUND_REPORT, "Body composition report not found: " + id));
        return toDto(report);
    }

    @Transactional
    public void deleteReport(UUID id, UUID userId) {
        BodyCompositionReport report = reportRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.NOT_FOUND_REPORT, "Body composition report not found: " + id));
        reportRepository.delete(report);
    }

    @Transactional(readOnly = true)
    public TrendResponseDto getTrends(UUID userId, String metric, LocalDate from, LocalDate to) {
        LocalDate startDate = from != null ? from : LocalDate.now().minusMonths(6);
        LocalDate endDate = to != null ? to : LocalDate.now();

        List<BodyCompositionReport> reports = reportRepository.findByUserIdAndReportDateBetweenOrderByReportDateAsc(userId, startDate, endDate);

        List<TrendResponseDto.DataPoint> dataPoints = new ArrayList<>();
        for (BodyCompositionReport report : reports) {
            Optional<BodyCompositionMeasurement> measurement = report.getMeasurements().stream()
                    .filter(m -> m.getMetricName().equalsIgnoreCase(metric))
                    .findFirst();

            measurement.ifPresent(m -> dataPoints.add(
                    TrendResponseDto.DataPoint.builder()
                            .date(report.getReportDate())
                            .value(m.getMetricValue())
                            .build()
            ));
        }

        String direction = "STABLE";
        BigDecimal changePercent = BigDecimal.ZERO;

        if (dataPoints.size() >= 2) {
            BigDecimal first = dataPoints.get(0).getValue();
            BigDecimal last = dataPoints.get(dataPoints.size() - 1).getValue();
            int comp = last.compareTo(first);
            if (comp > 0) {
                direction = "UP";
            } else if (comp < 0) {
                direction = "DOWN";
            }

            if (first.compareTo(BigDecimal.ZERO) != 0) {
                changePercent = last.subtract(first)
                        .divide(first, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100))
                        .setScale(2, RoundingMode.HALF_UP);
            }
        }

        return TrendResponseDto.builder()
                .metric(metric)
                .dataPoints(dataPoints)
                .trend(TrendResponseDto.TrendSummary.builder()
                        .direction(direction)
                        .changePercent(changePercent)
                        .build())
                .build();
    }

    private BodyCompReportDto toDto(BodyCompositionReport report) {
        List<MeasurementDto> measurementDtos = report.getMeasurements().stream()
                .map(m -> MeasurementDto.builder()
                        .id(m.getId())
                        .metricName(m.getMetricName())
                        .metricValue(m.getMetricValue())
                        .metricUnit(m.getMetricUnit())
                        .confidence(m.getConfidence())
                        .userCorrected(m.isUserCorrected())
                        .build())
                .toList();

        return BodyCompReportDto.builder()
                .id(report.getId())
                .userId(report.getUserId())
                .reportDate(report.getReportDate())
                .reportType(report.getReportType())
                .source(report.getSource())
                .fileId(report.getFileId())
                .aiConfidence(report.getAiConfidence())
                .userReviewed(report.isUserReviewed())
                .notes(report.getNotes())
                .measurements(measurementDtos)
                .createdAt(report.getCreatedAt())
                .updatedAt(report.getUpdatedAt())
                .build();
    }
}
