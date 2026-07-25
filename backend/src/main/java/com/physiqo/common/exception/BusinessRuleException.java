package com.physiqo.common.exception;

/**
 * Thrown when a business rule is violated (e.g. conflicting state, illegal
 * transition, overlap).
 *
 * <p>Codes: {@code BUSINESS_RULE_VIOLATION}, plus any 409 code like
 * {@code REPORT_ALREADY_CONFIRMED}, {@code EXERCISE_IN_USE},
 * {@code ALERT_ALREADY_EXISTS}, {@code GOAL_OVERLAP}, {@code AUTH_EMAIL_EXISTS}.
 */
public class BusinessRuleException extends ApiException {

    public BusinessRuleException(ErrorCode errorCode, String message) {
        super(errorCode, message);
    }
}