package com.physiqo;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * Smoke test: verifies the Spring Boot application context loads successfully.
 *
 * <p>This is the acceptance test for P0-T02. If the context fails to load
 * (e.g. due to a missing bean, misconfigured datasource, or dependency conflict),
 * this test will fail with a clear error message.
 *
 * <p>Uses the {@code test} profile which expects Testcontainers for Postgres.
 * For unit tests that don't need a database, annotate with
 * {@code @SpringBootTest(classes = {...})} or use {@code @WebMvcTest} slices.
 */
@SpringBootTest
@ActiveProfiles("test")
class PhysiqoApplicationTests {

    @Test
    void contextLoads() {
        // If we get here, the full application context loaded without errors.
    }
}
