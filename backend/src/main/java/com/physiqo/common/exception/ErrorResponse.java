package com.physiqo.common.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.List;

/**
 * Canonical API error response DTO.
 *
 * <p>Every exception handled by {@link GlobalExceptionHandler} is serialized to
 * this shape. See docs/ARCHITECTURE.md §10.
 *
 * <p>Example:
 * <pre>
 * {
 *   "status": 422,
 *   "error": "VALIDATION_ERROR",
 *   "message": "Validation failed",
 *   "details": [{"field": "weight", "message": "must be > 0"}],
 *   "timestamp": "2026-07-19T01:00:00Z",
 *   "path": "/api/v1/body-composition/measurements"
 * }
 * </pre>
 */
@Value
@Builder
@JsonInclude(JsonInclude.Include.NON_EMPTY)
public class ErrorResponse {

    int status;
    String error;
    String message;
    List<Detail> details;
    Instant timestamp;
    String path;

    /**
     * A single field-level validation detail.
     */
    @Value
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class Detail {
        String field;
        String message;

        public static Detail of(String field, String message) {
            return Detail.builder().field(field).message(message).build();
        }
    }
}