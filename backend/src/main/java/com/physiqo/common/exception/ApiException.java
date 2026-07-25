package com.physiqo.common.exception;

import lombok.Getter;

import java.util.List;

/**
 * Base exception for all application-level errors.
 *
 * <p>Subclasses carry a specific {@link ErrorCode} which determines both the
 * machine-readable {@code error} string and the HTTP status. The hierarchy is:
 *
 * <pre>
 *   ApiException
 *     ├── AuthenticationException
 *     ├── ResourceNotFoundException
 *     ├── ValidationException
 *     ├── AiServiceException
 *     ├── StorageException
 *     └── BusinessRuleException
 * </pre>
 *
 * <p>Never thrown directly — use a subclass.
 */
@Getter
public abstract class ApiException extends RuntimeException {

    private final ErrorCode errorCode;
    private final List<ErrorResponse.Detail> details;

    protected ApiException(ErrorCode errorCode, String message) {
        this(errorCode, message, List.of());
    }

    protected ApiException(ErrorCode errorCode, String message, List<ErrorResponse.Detail> details) {
        super(message);
        this.errorCode = errorCode;
        this.details = details;
    }
}