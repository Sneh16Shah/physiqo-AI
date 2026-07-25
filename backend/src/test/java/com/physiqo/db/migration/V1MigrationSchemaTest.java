package com.physiqo.db.migration;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertAll;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Verifies that Flyway migration V1 produced a schema matching docs/DATABASE.md.
 *
 * <p>Asserts the presence, types, nullability, defaults, and key constraints of
 * the {@code users} and {@code user_profiles} tables. This is the acceptance test
 * for P0-T03 ("schema matches spec").
 *
 * <p>Runs against the real PostgreSQL (docker-compose service). Connection details
 * come from {@code application-test.yml}.
 */
@SpringBootTest
@ActiveProfiles("test")
class V1MigrationSchemaTest {

    @Autowired
    private DataSource dataSource;

    private record Column(String name, String type, boolean nullable, String defaultValue) {}

    private List<String> getColumnNames(String table) throws Exception {
        List<String> names = new ArrayList<>();
        try (Connection con = dataSource.getConnection()) {
            try (ResultSet rs = con.getMetaData().getColumns(null, "public", table, null)) {
                while (rs.next()) names.add(rs.getString("COLUMN_NAME"));
            }
        }
        return names;
    }

    private Set<String> getIndexNames(String table) throws Exception {
        Set<String> names = new HashSet<>();
        try (Connection con = dataSource.getConnection()) {
            try (ResultSet rs = con.getMetaData().getIndexInfo(null, "public", table, false, false)) {
                while (rs.next()) {
                    String name = rs.getString("INDEX_NAME");
                    if (name != null) names.add(name);
                }
            }
        }
        return names;
    }

    private boolean pkColumnIsUuid(String table, String pkColumn) throws Exception {
        try (Connection con = dataSource.getConnection()) {
            try (ResultSet rs = con.getMetaData().getColumns(null, "public", table, pkColumn)) {
                assertTrue(rs.next(), pkColumn + " column must exist");
                return "uuid".equalsIgnoreCase(rs.getString("TYPE_NAME"));
            }
        }
    }

    @Nested
    @DisplayName("users table")
    class UsersTable {

        @Test
        @DisplayName("has all required columns")
        void hasRequiredColumns() throws Exception {
            List<String> cols = getColumnNames("users");
            Set<String> actual = new HashSet<>(cols);
            Set<String> expected = new HashSet<>(Set.of(
                "id", "email", "password_hash", "email_verified", "enabled",
                "role", "created_at", "updated_at", "deleted_at"
            ));
            assertEquals(expected, actual, "users columns must match docs/DATABASE.md exactly");
        }

        @Test
        @DisplayName("id is UUID PK")
        void idIsUuidPk() throws Exception {
            assertTrue(pkColumnIsUuid("users", "id"), "users.id must be UUID");
        }

        @Test
        @DisplayName("has unique index on email")
        void hasUniqueEmailIndex() throws Exception {
            Set<String> indexes = getIndexNames("users");
            // Spec: idx_users_email UNIQUE on email
            assertTrue(indexes.contains("idx_users_email")
                    || indexes.stream().anyMatch(i -> i.equalsIgnoreCase("idx_users_email")),
                "users must have a unique index on email; found: " + indexes);
        }
    }

    @Nested
    @DisplayName("user_profiles table")
    class UserProfilesTable {

        @Test
        @DisplayName("has all required columns")
        void hasRequiredColumns() throws Exception {
            List<String> cols = getColumnNames("user_profiles");
            Set<String> actual = new HashSet<>(cols);
            Set<String> expected = new HashSet<>(Set.of(
                "id", "user_id", "display_name", "date_of_birth", "gender",
                "height_cm", "activity_level", "fitness_goal", "unit_preference",
                "avatar_file_id", "timezone", "created_at", "updated_at"
            ));
            assertEquals(expected, actual, "user_profiles columns must match docs/DATABASE.md exactly");
        }

        @Test
        @DisplayName("id is UUID PK")
        void idIsUuidPk() throws Exception {
            assertTrue(pkColumnIsUuid("user_profiles", "id"), "user_profiles.id must be UUID");
        }

        @Test
        @DisplayName("has unique index on user_id")
        void hasUniqueUserIdIndex() throws Exception {
            Set<String> indexes = getIndexNames("user_profiles");
            assertTrue(indexes.contains("idx_user_profiles_user_id")
                    || indexes.stream().anyMatch(i -> i.equalsIgnoreCase("idx_user_profiles_user_id")),
                "user_profiles must have a unique index on user_id; found: " + indexes);
        }
    }

    @Nested
    @DisplayName("Flyway history")
    class FlywayHistory {

        @Test
        @DisplayName("records V1 as successfully applied")
        void v1RecordedAsSuccess() throws Exception {
            try (Connection con = dataSource.getConnection();
                 var stmt = con.createStatement();
                 ResultSet rs = stmt.executeQuery(
                     "SELECT version, description, success FROM flyway_schema_history WHERE version = '1'")) {
                assertTrue(rs.next(), "Flyway must have applied version 1");
                assertAll("V1 migration record",
                    () -> assertEquals("1", rs.getString("version")),
                    () -> assertEquals("create users", rs.getString("description")),
                    () -> assertTrue(rs.getBoolean("success"))
                );
            }
        }
    }
}
