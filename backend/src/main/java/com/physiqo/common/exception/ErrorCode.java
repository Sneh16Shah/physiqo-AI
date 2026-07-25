package com.physiqo.common.exception;

/**
 * Machine-readable error codes returned in every API error response.
 *
 * <p>Each code maps to exactly one HTTP status. Codes are stable — once shipped
 * they must not change semantics. New codes are appended; old ones are never
 * removed (only deprecated).
 *
 * <p>Convention: {@code DOMAIN_SPECIFIC_DETAIL}  e.g. {@code AUTH_EMAIL_EXISTS},
 * {@code NOT_FOUND_REPORT}, {@code STORAGE_FILE_TOO_LARGE}.
 *
 * <p>See docs/ARCHITECTURE.md §10 for the canonical error response shape.
 */
public enum ErrorCode {

    // ── Authentication (401 / 403) ─────────────────────────────────────────
    AUTH_INVALID_CREDENTIALS(401),
    AUTH_TOKEN_EXPIRED(401),
    AUTH_TOKEN_INVALID(401),
    AUTH_ACCOUNT_DISABLED(403),
    FORBIDDEN(403),

    // ── Validation (422) ───────────────────────────────────────────────────
    VALIDATION_ERROR(422),
    VALIDATION_UNSUPPORTED_TYPE(415),

    // ── Not Found (404) ────────────────────────────────────────────────────
    NOT_FOUND_PROFILE(404),
    NOT_FOUND_REPORT(404),
    NOT_FOUND_MEASUREMENT(404),
    NOT_FOUND_EXERCISE(404),
    NOT_FOUND_WORKOUT_PLAN(404),
    NOT_FOUND_WORKOUT_SESSION(404),
    NOT_FOUND_MEAL(404),
    NOT_FOUND_FOOD(404),
    NOT_FOUND_PRODUCT(404),
    NOT_FOUND_NOTIFICATION(404),
    NOT_FOUND_PRICE_ALERT(404),

    // ── Conflict (409) ─────────────────────────────────────────────────────
    AUTH_EMAIL_EXISTS(409),
    REPORT_ALREADY_CONFIRMED(409),
    EXERCISE_IN_USE(409),
    ALERT_ALREADY_EXISTS(409),
    GOAL_OVERLAP(409),

    // ── AI Service (502 / 422) ─────────────────────────────────────────────
    AI_SERVICE_UNAVAILABLE(502),
    AI_EXTRACTION_FAILED(422),
    AI_INSUFFICIENT_DATA(422),

    // ── Storage (413) ──────────────────────────────────────────────────────
    STORAGE_FILE_TOO_LARGE(413),
    STORAGE_UPLOAD_FAILED(500),

    // ── Business Rule (409 / 422) ──────────────────────────────────────────
    BUSINESS_RULE_VIOLATION(409),

    // ── Generic (500) ──────────────────────────────────────────────────────
    INTERNAL_ERROR(500);

    private final int httpStatus;

    ErrorCode(int httpStatus) {
        this.httpStatus = httpStatus;
    }

    /** The HTTP status code that should be returned for this error. */
    public int httpStatus() {
        return httpStatus;
    }
}