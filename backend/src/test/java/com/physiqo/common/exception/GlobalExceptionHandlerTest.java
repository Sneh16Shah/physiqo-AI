package com.physiqo.common.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.core.MethodParameter;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * Unit tests for {@link GlobalExceptionHandler}.
 *
 * <p>Verifies that every exception type in the hierarchy is mapped to the
 * correct HTTP status, error code, and response shape.
 */
class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler handler;
    private HttpServletRequest request;

    @BeforeEach
    void setUp() {
        handler = new GlobalExceptionHandler();
        request = mock(HttpServletRequest.class);
        when(request.getRequestURI()).thenReturn("/api/v1/test");
    }

    // ── Shared assertions ──────────────────────────────────────────────────

    private void assertErrorResponse(ResponseEntity<ErrorResponse> response,
                                     int expectedStatus,
                                     String expectedError,
                                     String expectedMessageContains) {
        assertThat(response.getStatusCode().value()).isEqualTo(expectedStatus);

        ErrorResponse body = response.getBody();
        assertThat(body).isNotNull();
        assertThat(body.getStatus()).isEqualTo(expectedStatus);
        assertThat(body.getError()).isEqualTo(expectedError);
        assertThat(body.getMessage()).contains(expectedMessageContains);
        assertThat(body.getTimestamp()).isNotNull();
        assertThat(body.getPath()).isEqualTo("/api/v1/test");
    }

    // ── AuthenticationException tests ──────────────────────────────────────

    @Nested
    @DisplayName("AuthenticationException handling")
    class AuthenticationExceptionTests {

        @Test
        @DisplayName("AUTH_INVALID_CREDENTIALS → 401")
        void invalidCredentials() {
            var ex = new AuthenticationException(
                    ErrorCode.AUTH_INVALID_CREDENTIALS, "Invalid email or password");

            var response = handler.handleApiException(ex, request);

            assertErrorResponse(response, 401, "AUTH_INVALID_CREDENTIALS", "Invalid email or password");
        }

        @Test
        @DisplayName("AUTH_TOKEN_EXPIRED → 401")
        void tokenExpired() {
            var ex = new AuthenticationException(
                    ErrorCode.AUTH_TOKEN_EXPIRED, "Token has expired");

            var response = handler.handleApiException(ex, request);

            assertErrorResponse(response, 401, "AUTH_TOKEN_EXPIRED", "Token has expired");
        }

        @Test
        @DisplayName("AUTH_TOKEN_INVALID → 401")
        void tokenInvalid() {
            var ex = new AuthenticationException(
                    ErrorCode.AUTH_TOKEN_INVALID, "Malformed token");

            var response = handler.handleApiException(ex, request);

            assertErrorResponse(response, 401, "AUTH_TOKEN_INVALID", "Malformed token");
        }

        @Test
        @DisplayName("AUTH_ACCOUNT_DISABLED → 403")
        void accountDisabled() {
            var ex = new AuthenticationException(
                    ErrorCode.AUTH_ACCOUNT_DISABLED, "Account is disabled");

            var response = handler.handleApiException(ex, request);

            assertErrorResponse(response, 403, "AUTH_ACCOUNT_DISABLED", "Account is disabled");
        }

        @Test
        @DisplayName("FORBIDDEN → 403")
        void forbidden() {
            var ex = new AuthenticationException(
                    ErrorCode.FORBIDDEN, "Access denied");

            var response = handler.handleApiException(ex, request);

            assertErrorResponse(response, 403, "FORBIDDEN", "Access denied");
        }
    }

    // ── ResourceNotFoundException tests ────────────────────────────────────

    @Nested
    @DisplayName("ResourceNotFoundException handling")
    class ResourceNotFoundExceptionTests {

        @Test
        @DisplayName("NOT_FOUND_REPORT → 404")
        void reportNotFound() {
            var id = UUID.randomUUID();
            var ex = new ResourceNotFoundException(
                    ErrorCode.NOT_FOUND_REPORT, "Report", id);

            var response = handler.handleApiException(ex, request);

            assertErrorResponse(response, 404, "NOT_FOUND_REPORT", "Report not found");
        }

        @Test
        @DisplayName("NOT_FOUND_PROFILE → 404")
        void profileNotFound() {
            var ex = new ResourceNotFoundException(
                    ErrorCode.NOT_FOUND_PROFILE, "Profile not found");

            var response = handler.handleApiException(ex, request);

            assertErrorResponse(response, 404, "NOT_FOUND_PROFILE", "Profile not found");
        }

        @Test
        @DisplayName("NOT_FOUND_EXERCISE → 404")
        void exerciseNotFound() {
            var id = UUID.randomUUID();
            var ex = new ResourceNotFoundException(
                    ErrorCode.NOT_FOUND_EXERCISE, "Exercise", id);

            var response = handler.handleApiException(ex, request);

            assertErrorResponse(response, 404, "NOT_FOUND_EXERCISE", "Exercise not found");
        }

        @Test
        @DisplayName("NOT_FOUND_WORKOUT_PLAN → 404")
        void workoutPlanNotFound() {
            var id = UUID.randomUUID();
            var ex = new ResourceNotFoundException(
                    ErrorCode.NOT_FOUND_WORKOUT_PLAN, "Workout plan", id);

            var response = handler.handleApiException(ex, request);

            assertErrorResponse(response, 404, "NOT_FOUND_WORKOUT_PLAN", "Workout plan not found");
        }

        @Test
        @DisplayName("NOT_FOUND_MEAL → 404")
        void mealNotFound() {
            var id = UUID.randomUUID();
            var ex = new ResourceNotFoundException(
                    ErrorCode.NOT_FOUND_MEAL, "Meal", id);

            var response = handler.handleApiException(ex, request);

            assertErrorResponse(response, 404, "NOT_FOUND_MEAL", "Meal not found");
        }
    }

    // ── ValidationException tests ──────────────────────────────────────────

    @Nested
    @DisplayName("ValidationException handling")
    class ValidationExceptionTests {

        @Test
        @DisplayName("Simple validation error → 422")
        void simpleValidation() {
            var ex = new ValidationException("Weight must be positive");

            var response = handler.handleApiException(ex, request);

            assertErrorResponse(response, 422, "VALIDATION_ERROR", "Weight must be positive");
            assertThat(response.getBody().getDetails()).isNullOrEmpty();
        }

        @Test
        @DisplayName("Validation error with field details → 422 + details[]")
        void validationWithDetails() {
            var details = List.of(
                    ErrorResponse.Detail.of("weight", "must be > 0"),
                    ErrorResponse.Detail.of("height", "must be > 0"));
            var ex = new ValidationException("Validation failed", details);

            var response = handler.handleApiException(ex, request);

            assertErrorResponse(response, 422, "VALIDATION_ERROR", "Validation failed");

            ErrorResponse body = response.getBody();
            assertThat(body.getDetails()).hasSize(2);
            assertThat(body.getDetails().get(0).getField()).isEqualTo("weight");
            assertThat(body.getDetails().get(0).getMessage()).isEqualTo("must be > 0");
            assertThat(body.getDetails().get(1).getField()).isEqualTo("height");
        }
    }

    // ── AiServiceException tests ───────────────────────────────────────────

    @Nested
    @DisplayName("AiServiceException handling")
    class AiServiceExceptionTests {

        @Test
        @DisplayName("AI_SERVICE_UNAVAILABLE → 502")
        void aiUnavailable() {
            var ex = new AiServiceException(
                    ErrorCode.AI_SERVICE_UNAVAILABLE, "AI service is unreachable");

            var response = handler.handleApiException(ex, request);

            assertErrorResponse(response, 502, "AI_SERVICE_UNAVAILABLE", "AI service is unreachable");
        }

        @Test
        @DisplayName("AI_EXTRACTION_FAILED → 422")
        void aiExtractionFailed() {
            var ex = new AiServiceException(
                    ErrorCode.AI_EXTRACTION_FAILED, "Could not extract body comp data");

            var response = handler.handleApiException(ex, request);

            assertErrorResponse(response, 422, "AI_EXTRACTION_FAILED", "Could not extract");
        }

        @Test
        @DisplayName("AI_INSUFFICIENT_DATA → 422")
        void aiInsufficientData() {
            var ex = new AiServiceException(
                    ErrorCode.AI_INSUFFICIENT_DATA, "Insufficient data for analysis");

            var response = handler.handleApiException(ex, request);

            assertErrorResponse(response, 422, "AI_INSUFFICIENT_DATA", "Insufficient data");
        }

        @Test
        @DisplayName("AiServiceException with cause preserves cause chain")
        void aiWithCause() {
            var cause = new RuntimeException("Connection refused");
            var ex = new AiServiceException(
                    ErrorCode.AI_SERVICE_UNAVAILABLE, "AI service is unreachable", cause);

            assertThat(ex.getCause()).isEqualTo(cause);

            var response = handler.handleApiException(ex, request);
            assertErrorResponse(response, 502, "AI_SERVICE_UNAVAILABLE", "AI service is unreachable");
        }
    }

    // ── StorageException tests ─────────────────────────────────────────────

    @Nested
    @DisplayName("StorageException handling")
    class StorageExceptionTests {

        @Test
        @DisplayName("STORAGE_FILE_TOO_LARGE → 413")
        void fileTooLarge() {
            var ex = new StorageException(
                    ErrorCode.STORAGE_FILE_TOO_LARGE, "File exceeds 10MB limit");

            var response = handler.handleApiException(ex, request);

            assertErrorResponse(response, 413, "STORAGE_FILE_TOO_LARGE", "File exceeds 10MB");
        }

        @Test
        @DisplayName("STORAGE_UPLOAD_FAILED → 500")
        void uploadFailed() {
            var ex = new StorageException(
                    ErrorCode.STORAGE_UPLOAD_FAILED, "Upload to MinIO failed");

            var response = handler.handleApiException(ex, request);

            assertErrorResponse(response, 500, "STORAGE_UPLOAD_FAILED", "Upload to MinIO failed");
        }

        @Test
        @DisplayName("StorageException with cause preserves cause chain")
        void storageWithCause() {
            var cause = new RuntimeException("S3 connection timeout");
            var ex = new StorageException(
                    ErrorCode.STORAGE_UPLOAD_FAILED, "Upload failed", cause);

            assertThat(ex.getCause()).isEqualTo(cause);
        }
    }

    // ── BusinessRuleException tests ────────────────────────────────────────

    @Nested
    @DisplayName("BusinessRuleException handling")
    class BusinessRuleExceptionTests {

        @Test
        @DisplayName("BUSINESS_RULE_VIOLATION → 409")
        void genericBusinessRule() {
            var ex = new BusinessRuleException(
                    ErrorCode.BUSINESS_RULE_VIOLATION, "Cannot modify completed session");

            var response = handler.handleApiException(ex, request);

            assertErrorResponse(response, 409, "BUSINESS_RULE_VIOLATION", "Cannot modify completed session");
        }

        @Test
        @DisplayName("AUTH_EMAIL_EXISTS → 409")
        void emailExists() {
            var ex = new BusinessRuleException(
                    ErrorCode.AUTH_EMAIL_EXISTS, "Email already registered");

            var response = handler.handleApiException(ex, request);

            assertErrorResponse(response, 409, "AUTH_EMAIL_EXISTS", "Email already registered");
        }

        @Test
        @DisplayName("REPORT_ALREADY_CONFIRMED → 409")
        void reportAlreadyConfirmed() {
            var ex = new BusinessRuleException(
                    ErrorCode.REPORT_ALREADY_CONFIRMED, "Report already confirmed");

            var response = handler.handleApiException(ex, request);

            assertErrorResponse(response, 409, "REPORT_ALREADY_CONFIRMED", "Report already confirmed");
        }

        @Test
        @DisplayName("GOAL_OVERLAP → 409")
        void goalOverlap() {
            var ex = new BusinessRuleException(
                    ErrorCode.GOAL_OVERLAP, "Goal dates overlap with existing goal");

            var response = handler.handleApiException(ex, request);

            assertErrorResponse(response, 409, "GOAL_OVERLAP", "Goal dates overlap");
        }

        @Test
        @DisplayName("ALERT_ALREADY_EXISTS → 409")
        void alertAlreadyExists() {
            var ex = new BusinessRuleException(
                    ErrorCode.ALERT_ALREADY_EXISTS, "Price alert already exists");

            var response = handler.handleApiException(ex, request);

            assertErrorResponse(response, 409, "ALERT_ALREADY_EXISTS", "Price alert already exists");
        }
    }

    // ── MethodArgumentNotValidException (Bean Validation) ──────────────────

    @Nested
    @DisplayName("MethodArgumentNotValidException handling")
    class BeanValidationTests {

        @Test
        @DisplayName("Bean validation errors → 422 with per-field details")
        void beanValidationErrors() throws NoSuchMethodException {
            var bindingResult = new BeanPropertyBindingResult(new Object(), "request");
            bindingResult.addError(new FieldError(
                    "request", "email", null, false,
                    null, null, "must not be blank"));
            bindingResult.addError(new FieldError(
                    "request", "password", null, false,
                    null, null, "size must be between 8 and 100"));

            var methodParam = new MethodParameter(
                    Object.class.getMethod("toString"), -1);
            var ex = new MethodArgumentNotValidException(methodParam, bindingResult);

            var response = handler.handleMethodArgumentNotValid(ex, request);

            assertThat(response.getStatusCode().value()).isEqualTo(422);

            ErrorResponse body = response.getBody();
            assertThat(body).isNotNull();
            assertThat(body.getStatus()).isEqualTo(422);
            assertThat(body.getError()).isEqualTo("VALIDATION_ERROR");
            assertThat(body.getMessage()).isEqualTo("Validation failed");
            assertThat(body.getPath()).isEqualTo("/api/v1/test");
            assertThat(body.getTimestamp()).isNotNull();

            assertThat(body.getDetails()).hasSize(2);
            assertThat(body.getDetails())
                    .extracting(ErrorResponse.Detail::getField)
                    .containsExactlyInAnyOrder("email", "password");
            assertThat(body.getDetails())
                    .extracting(ErrorResponse.Detail::getMessage)
                    .containsExactlyInAnyOrder("must not be blank", "size must be between 8 and 100");
        }

        @Test
        @DisplayName("Null defaultMessage falls back to 'invalid value'")
        void nullDefaultMessage() throws NoSuchMethodException {
            var bindingResult = new BeanPropertyBindingResult(new Object(), "request");
            bindingResult.addError(new FieldError(
                    "request", "weight", null, false,
                    null, null, null));

            var methodParam = new MethodParameter(
                    Object.class.getMethod("toString"), -1);
            var ex = new MethodArgumentNotValidException(methodParam, bindingResult);

            var response = handler.handleMethodArgumentNotValid(ex, request);

            assertThat(response.getBody().getDetails()).hasSize(1);
            assertThat(response.getBody().getDetails().get(0).getMessage()).isEqualTo("invalid value");
        }
    }

    // ── NoResourceFoundException (Spring 6+ unknown paths) ─────────────────

    @Nested
    @DisplayName("NoResourceFoundException handling")
    class NoResourceFoundTests {

        @Test
        @DisplayName("Unknown API path → 404 NOT_FOUND")
        void unknownPath() {
            var ex = new NoResourceFoundException(org.springframework.http.HttpMethod.GET, "/api/v1/nonexistent");

            var response = handler.handleNoResourceFound(ex, request);

            assertThat(response.getStatusCode().value()).isEqualTo(404);

            ErrorResponse body = response.getBody();
            assertThat(body).isNotNull();
            assertThat(body.getStatus()).isEqualTo(404);
            assertThat(body.getError()).isEqualTo("NOT_FOUND");
            assertThat(body.getMessage()).isEqualTo("Resource not found");
            assertThat(body.getPath()).isEqualTo("/api/v1/test");
            assertThat(body.getTimestamp()).isNotNull();
        }
    }

    // ── Catch-all Exception handler ────────────────────────────────────────

    @Nested
    @DisplayName("Unexpected exception (catch-all) handling")
    class CatchAllTests {

        @Test
        @DisplayName("RuntimeException → 500 INTERNAL_ERROR with safe message")
        void runtimeException() {
            var ex = new RuntimeException("NullPointerException in service layer");

            var response = handler.handleUnexpectedException(ex, request);

            assertErrorResponse(response, 500, "INTERNAL_ERROR", "An unexpected error occurred");
        }

        @Test
        @DisplayName("Catch-all never leaks internal details to client")
        void noStackLeakage() {
            var ex = new RuntimeException("SELECT * FROM users WHERE id='1'; DROP TABLE users;--");

            var response = handler.handleUnexpectedException(ex, request);

            ErrorResponse body = response.getBody();
            assertThat(body).isNotNull();
            // The message must NOT contain the SQL injection content
            assertThat(body.getMessage()).doesNotContain("SELECT");
            assertThat(body.getMessage()).doesNotContain("DROP TABLE");
            assertThat(body.getMessage()).isEqualTo("An unexpected error occurred");
        }

        @Test
        @DisplayName("Error (checked) → 500 INTERNAL_ERROR")
        void checkedException() {
            var ex = new Exception("Checked exception from a library");

            var response = handler.handleUnexpectedException(ex, request);

            assertErrorResponse(response, 500, "INTERNAL_ERROR", "An unexpected error occurred");
        }
    }

    // ── ErrorCode completeness tests ───────────────────────────────────────

    @Nested
    @DisplayName("ErrorCode enum consistency")
    class ErrorCodeTests {

        @Test
        @DisplayName("All ErrorCodes have valid HTTP status codes")
        void allCodesHaveValidStatus() {
            for (ErrorCode code : ErrorCode.values()) {
                assertThat(code.httpStatus())
                        .as("ErrorCode.%s must map to a valid HTTP status", code.name())
                        .isBetween(100, 599);
            }
        }

        @Test
        @DisplayName("All NOT_FOUND_* codes map to 404")
        void allNotFoundCodesAre404() {
            for (ErrorCode code : ErrorCode.values()) {
                if (code.name().startsWith("NOT_FOUND_")) {
                    assertThat(code.httpStatus())
                            .as("ErrorCode.%s should map to 404", code.name())
                            .isEqualTo(404);
                }
            }
        }

        @Test
        @DisplayName("All AUTH_* codes map to 401 or 403")
        void allAuthCodesAreAuthStatus() {
            for (ErrorCode code : ErrorCode.values()) {
                if (code.name().startsWith("AUTH_") && !code.name().equals("AUTH_EMAIL_EXISTS")) {
                    assertThat(code.httpStatus())
                            .as("ErrorCode.%s should map to 401 or 403", code.name())
                            .isIn(401, 403);
                }
            }
        }
    }

    // ── ErrorResponse.Detail factory ───────────────────────────────────────

    @Nested
    @DisplayName("ErrorResponse.Detail")
    class DetailTests {

        @Test
        @DisplayName("Detail.of creates correctly populated detail")
        void detailFactory() {
            var detail = ErrorResponse.Detail.of("email", "must not be blank");

            assertThat(detail.getField()).isEqualTo("email");
            assertThat(detail.getMessage()).isEqualTo("must not be blank");
        }
    }
}
