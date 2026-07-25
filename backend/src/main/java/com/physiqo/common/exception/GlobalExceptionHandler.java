package com.physiqo.common.exception;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.time.Instant;
import java.util.List;

/**
 * Global exception handler — the single point where exceptions become
 * the canonical {@link ErrorResponse} JSON shape.
 *
 * <p>Order of precedence:
 * <ol>
 *   <li>{@link ApiException} and its subclasses — application errors</li>
 *   <li>{@link MethodArgumentNotValidException} — Bean Validation failures</li>
 *   <li>{@link NoResourceFoundException} — unknown API paths (Spring 6+)</li>
 *   <li>{@link Exception} — catch-all, logged at ERROR, returns 500</li>
 * </ol>
 *
 * <p>See docs/ARCHITECTURE.md §10.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handles the entire {@link ApiException} hierarchy.
     * Each subclass carries an {@link ErrorCode} that provides both the
     * machine-readable error string and the HTTP status.
     */
    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ErrorResponse> handleApiException(
            ApiException ex, HttpServletRequest request) {

        log.warn("ApiException: {} — {}", ex.getErrorCode(), ex.getMessage());

        return ResponseEntity
                .status(ex.getErrorCode().httpStatus())
                .body(toResponse(ex, request));
    }

    /**
     * Converts Jakarta Bean Validation errors into a 422 VALIDATION_ERROR
     * response with per-field details.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex, HttpServletRequest request) {

        log.warn("Validation error on {}: {}", request.getRequestURI(), ex.getMessage());

        List<ErrorResponse.Detail> details = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(fe -> ErrorResponse.Detail.of(
                        fe.getField(),
                        fe.getDefaultMessage() != null ? fe.getDefaultMessage() : "invalid value"))
                .toList();

        ErrorResponse response = ErrorResponse.builder()
                .status(422)
                .error(ErrorCode.VALIDATION_ERROR.name())
                .message("Validation failed")
                .details(details)
                .timestamp(Instant.now())
                .path(request.getRequestURI())
                .build();

        return ResponseEntity.status(422).body(response);
    }

    /**
     * Returns 404 for requests to paths that don't match any controller.
     */
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErrorResponse> handleNoResourceFound(
            NoResourceFoundException ex, HttpServletRequest request) {

        log.warn("No resource found: {}", request.getRequestURI());

        ErrorResponse response = ErrorResponse.builder()
                .status(404)
                .error("NOT_FOUND")
                .message("Resource not found")
                .timestamp(Instant.now())
                .path(request.getRequestURI())
                .build();

        return ResponseEntity.status(404).body(response);
    }

    /**
     * Catch-all for unexpected exceptions. Logged at ERROR level (potential bug),
     * but never leaks stack traces to the client (docs/SECURITY.md §4).
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpectedException(
            Exception ex, HttpServletRequest request) {

        log.error("Unexpected exception on {}: {}", request.getRequestURI(), ex.getMessage(), ex);

        ErrorResponse response = ErrorResponse.builder()
                .status(500)
                .error(ErrorCode.INTERNAL_ERROR.name())
                .message("An unexpected error occurred")
                .timestamp(Instant.now())
                .path(request.getRequestURI())
                .build();

        return ResponseEntity.status(500).body(response);
    }

    // ── Helpers ────────────────────────────────────────────────────────────

    private ErrorResponse toResponse(ApiException ex, HttpServletRequest request) {
        return ErrorResponse.builder()
                .status(ex.getErrorCode().httpStatus())
                .error(ex.getErrorCode().name())
                .message(ex.getMessage())
                .details(ex.getDetails())
                .timestamp(Instant.now())
                .path(request.getRequestURI())
                .build();
    }
}