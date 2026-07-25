package com.physiqo.common.exception;

/**
 * Thrown when the Python AI service is unavailable, returns an error, or
 * produces data that fails validation.
 *
 * <p>Codes: {@code AI_SERVICE_UNAVAILABLE}, {@code AI_EXTRACTION_FAILED},
 * {@code AI_INSUFFICIENT_DATA}.
 */
public class AiServiceException extends ApiException {

    public AiServiceException(ErrorCode errorCode, String message) {
        super(errorCode, message);
    }

    public AiServiceException(ErrorCode errorCode, String message, Throwable cause) {
        super(errorCode, message);
        initCause(cause);
    }
}