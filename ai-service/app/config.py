"""
Application settings loaded from environment variables.

Uses pydantic-settings to validate and type-cast env vars at startup.
See docs/DEPLOYMENT.md §4 and .env.example for variable reference.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """PhysiqO AI Service configuration."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Service identity
    SERVICE_NAME: str = "physiqo-ai"
    VERSION: str = "0.1.0"
    DEBUG: bool = False

    # Internal auth (Spring Boot ↔ Python AI)
    AI_SERVICE_KEY: str = "dev-service-key"

    # CORS
    CORS_ALLOWED_ORIGINS: list[str] = ["http://localhost:8080"]

    # AI providers
    AI_PROVIDER: str = "openai"  # "openai" | "gemini"
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o"
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.0-flash"

    # MinIO / S3
    MINIO_ENDPOINT: str = "http://localhost:9000"
    MINIO_ACCESS_KEY: str = "physiqo"
    MINIO_SECRET_KEY: str = "physiqo_dev"
    MINIO_BUCKET: str = "physiqo-uploads"


settings = Settings()
