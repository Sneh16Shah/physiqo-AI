package com.physiqo.common.exception;

/**
 * Thrown when a requested resource does not exist or the authenticated user
 * does not own it.
 *
 * <p>Per docs/SECURITY.md §2, ownership violations return 404 (not 403) to
 * prevent user ID enumeration.
 *
 * <p>Convenience constructors accept the resource type and id for a
 * standardised message format.
 */
public class ResourceNotFoundException extends ApiException {

    public ResourceNotFoundException(ErrorCode errorCode, String message) {
        super(errorCode, message);
    }

    /** Uses the given NOT_FOUND_* code with "{resourceType} not found: {id}" message. */
    public ResourceNotFoundException(ErrorCode errorCode, String resourceType, Object id) {
        super(errorCode, resourceType + " not found: " + id);
    }
}