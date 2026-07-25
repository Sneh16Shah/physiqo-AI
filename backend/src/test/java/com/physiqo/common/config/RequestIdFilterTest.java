package com.physiqo.common.config;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.slf4j.MDC;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for {@link RequestIdFilter}.
 *
 * <p>Verifies that the filter correctly generates/propagates the
 * {@code X-Request-Id} header and populates/clears the SLF4J MDC.
 */
class RequestIdFilterTest {

    private RequestIdFilter filter;
    private MockHttpServletRequest request;
    private MockHttpServletResponse response;
    private MockFilterChain filterChain;

    @BeforeEach
    void setUp() {
        filter = new RequestIdFilter();
        request = new MockHttpServletRequest("GET", "/api/v1/test");
        response = new MockHttpServletResponse();
        filterChain = new MockFilterChain();
    }

    @Test
    @DisplayName("Generates UUID request ID when header is absent")
    void generatesRequestIdWhenAbsent() throws Exception {
        filter.doFilter(request, response, filterChain);

        String responseId = response.getHeader(RequestIdFilter.REQUEST_ID_HEADER);
        assertThat(responseId)
                .isNotNull()
                .isNotBlank()
                .matches("[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}");
    }

    @Test
    @DisplayName("Reuses existing X-Request-Id from incoming request")
    void reusesExistingRequestId() throws Exception {
        String existingId = "existing-correlation-id-12345";
        request.addHeader(RequestIdFilter.REQUEST_ID_HEADER, existingId);

        filter.doFilter(request, response, filterChain);

        String responseId = response.getHeader(RequestIdFilter.REQUEST_ID_HEADER);
        assertThat(responseId).isEqualTo(existingId);
    }

    @Test
    @DisplayName("Generates new ID when header is blank/empty")
    void generatesNewIdWhenHeaderBlank() throws Exception {
        request.addHeader(RequestIdFilter.REQUEST_ID_HEADER, "   ");

        filter.doFilter(request, response, filterChain);

        String responseId = response.getHeader(RequestIdFilter.REQUEST_ID_HEADER);
        assertThat(responseId)
                .isNotBlank()
                .doesNotContain("   ");
    }

    @Test
    @DisplayName("MDC is populated during request processing")
    void mdcPopulatedDuringRequest() throws Exception {
        String testId = "mdc-test-id-67890";
        request.addHeader(RequestIdFilter.REQUEST_ID_HEADER, testId);

        // Custom filter chain that captures MDC during processing
        MockFilterChain capturingChain = new MockFilterChain() {
            @Override
            public void doFilter(jakarta.servlet.ServletRequest req,
                                 jakarta.servlet.ServletResponse res) {
                String mdcValue = MDC.get(RequestIdFilter.MDC_REQUEST_ID);
                assertThat(mdcValue).isEqualTo(testId);
            }
        };

        filter.doFilter(request, response, capturingChain);
    }

    @Test
    @DisplayName("MDC is cleared after request completes")
    void mdcClearedAfterRequest() throws Exception {
        filter.doFilter(request, response, filterChain);

        // After filter completes, MDC should be clean
        assertThat(MDC.get(RequestIdFilter.MDC_REQUEST_ID)).isNull();
    }

    @Test
    @DisplayName("MDC is cleared even when filter chain throws")
    void mdcClearedOnException() throws Exception {
        MockFilterChain throwingChain = new MockFilterChain() {
            @Override
            public void doFilter(jakarta.servlet.ServletRequest req,
                                 jakarta.servlet.ServletResponse res)
                    throws jakarta.servlet.ServletException {
                throw new jakarta.servlet.ServletException("Simulated failure");
            }
        };

        try {
            filter.doFilter(request, response, throwingChain);
        } catch (jakarta.servlet.ServletException ignored) {
            // Expected
        }

        // MDC must still be cleaned up
        assertThat(MDC.get(RequestIdFilter.MDC_REQUEST_ID)).isNull();
    }

    @Test
    @DisplayName("Response header is set for every request")
    void responseHeaderAlwaysSet() throws Exception {
        filter.doFilter(request, response, filterChain);

        assertThat(response.containsHeader(RequestIdFilter.REQUEST_ID_HEADER)).isTrue();
    }
}
