# ─────────────────────────────────────────────────────────────────────────────
# PhysiqO-AI Backend — Multi-stage Docker build
# See docs/DEPLOYMENT.md §2
# ─────────────────────────────────────────────────────────────────────────────

# ── Build stage ────────────────────────────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /app

# Copy POM first for dependency caching
COPY pom.xml .

# Pre-download dependencies — cached layer
RUN mvn dependency:go-offline -B

# Copy source code
COPY src src

# Build the JAR, skip tests
RUN mvn package -DskipTests -B

# ── Run stage ───────────────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine

LABEL maintainer="physiqo"
LABEL description="PhysiqO-AI Spring Boot backend"

WORKDIR /app

# Create non-root user for security
RUN addgroup -S physiqo && adduser -S physiqo -G physiqo

# Copy built JAR from the build stage
COPY --from=build /app/target/*.jar app.jar

# Switch to non-root user
USER physiqo

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
