package com.physiqo.common.exception;

/**
 * Thrown for file storage / retrieval failures (MinIO / S3).
 *
 * <p>Codes: {@code STORAGE_FILE_TOO_LARGE}, {@code STORAGE_UPLOAD_FAILED}.
 */
public class StorageException extends ApiException {

    public StorageException(ErrorCode errorCode, String message) {
        super(errorCode, message);
    }

    public StorageException(ErrorCode errorCode, String message, Throwable cause) {
        super(errorCode, message);
        initCause(cause);
    }
}