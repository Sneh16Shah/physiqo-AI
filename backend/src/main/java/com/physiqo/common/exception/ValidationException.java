package com.physiqo.common.exception;

import java.util.List;

/**
 * Thrown for request validation failures (Bean Validation or programmatic).
 *
 * <p>Carries field-level {@link com.physiqo.common.exception.ErrorResponse.Detail}
 * entries that are serialised into the {@code details} array of the error response.
 */
public class ValidationException extends ApiException {

    public ValidationException(String message) {
        super(ErrorCode.VALIDATION_ERROR, message);
    }

    public ValidationException(String message, List<ErrorResponse.Detail> details) {
        super(ErrorCode.VALIDATION_ERROR, message, details);
    }
}