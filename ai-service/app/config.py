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

    # AI providers (auto-detected in order: NVIDIA → Gemini → OpenAI → HuggingFace)
    AI_PROVIDER: str = "nvidia"  # "nvidia" | "gemini" | "openai" | "huggingface"
    NVIDIA_API_KEY: str = ""
    NVIDIA_MODEL: str = "meta/llama-3.2-90b-vision-instruct"
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o"
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.0-flash"
    HF_TOKEN: str = ""
    HUGGINGFACE_API_KEY: str = ""
    HF_MODEL: str = "meta-llama/Llama-3.2-11b-vision-instruct"

    # MinIO / S3
    MINIO_ENDPOINT: str = "http://localhost:9000"
    MINIO_ACCESS_KEY: str = "physiqo"
    MINIO_SECRET_KEY: str = "physiqo_dev"
    MINIO_BUCKET: str = "physiqo-uploads"


settings = Settings()
