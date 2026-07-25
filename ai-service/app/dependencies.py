"""
Reusable FastAPI dependencies.

The service-key guard is applied to all routes except the health check,
ensuring only Spring Boot can call AI endpoints (docs/SECURITY.md §5).
"""

from fastapi import Header, HTTPException, status

from app.config import settings


async def verify_service_key(
    x_service_key: str = Header(..., alias="X-Service-Key"),
) -> str:
    """
    Validate the ``X-Service-Key`` header against the configured secret.

    Raises:
        HTTPException 401 if the header is missing or does not match.
    """
    if x_service_key != settings.AI_SERVICE_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing service key",
        )
    return x_service_key
