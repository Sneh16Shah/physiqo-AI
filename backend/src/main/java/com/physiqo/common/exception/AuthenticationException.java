package com.physiqo.common.exception;

/**
 * Thrown for authentication / authorisation failures.
 *
 * <p>Codes: {@code AUTH_INVALID_CREDENTIALS}, {@code AUTH_TOKEN_EXPIRED},
 * {@code AUTH_TOKEN_INVALID}, {@code AUTH_ACCOUNT_DISABLED}, {@code FORBIDDEN}.
 */
public class AuthenticationException extends ApiException {

    public AuthenticationException(ErrorCode errorCode, String message) {
        super(errorCode, message);
    }
}