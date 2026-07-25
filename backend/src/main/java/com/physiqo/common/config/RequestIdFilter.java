package com.physiqo.common.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

/**
 * Servlet filter that ensures every request has an {@code X-Request-Id} header.
 *
 * <p>Behaviour:
 * <ol>
 *   <li>If the incoming request already has {@code X-Request-Id}, it is reused
 *       (useful when a reverse proxy or load balancer generates it).</li>
 *   <li>Otherwise a fresh UUID is generated.</li>
 *   <li>The ID is placed into the SLF4J MDC under key {@code request_id} so
 *       every log line emitted during request processing includes it.</li>
 *   <li>The ID is echoed back in the response {@code X-Request-Id} header so
 *       callers can correlate client-side logs with server logs.</li>
 * </ol>
 *
 * <p>This filter runs at the very beginning of the filter chain
 * ({@link Ordered#HIGHEST_PRECEDENCE}) to ensure correlation is available for
 * all downstream filters, including Spring Security.
 *
 * <p>When Spring Boot calls the Python AI service, the same request ID is
 * forwarded via {@code X-Request-Id} so both services' logs can be correlated
 * (see docs/ARCHITECTURE.md §11, AI_ARCHITECTURE.md §6).
 *
 * @see <a href="docs/ARCHITECTURE.md">docs/ARCHITECTURE.md §11</a>
 */
@Slf4j
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RequestIdFilter extends OncePerRequestFilter {

    /** HTTP header name used for request correlation. */
    public static final String REQUEST_ID_HEADER = "X-Request-Id";

    /** MDC key where the request ID is stored for log inclusion. */
    public static final String MDC_REQUEST_ID = "request_id";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String requestId = request.getHeader(REQUEST_ID_HEADER);

        if (requestId == null || requestId.isBlank()) {
            requestId = UUID.randomUUID().toString();
        }

        // Put into MDC so logback includes it in every log line
        MDC.put(MDC_REQUEST_ID, requestId);

        // Echo back in response header for client-side correlation
        response.setHeader(REQUEST_ID_HEADER, requestId);

        try {
            filterChain.doFilter(request, response);
        } finally {
            // Always clear MDC to prevent leaks in pooled threads
            MDC.remove(MDC_REQUEST_ID);
        }
    }
}
