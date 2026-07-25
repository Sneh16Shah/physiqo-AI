"""
Health-check endpoint.

Called by Docker HEALTHCHECK and monitoring. Intentionally *not* guarded
by the service-key dependency so container orchestrators can probe it
without credentials (docs/DEPLOYMENT.md §6).
"""

from fastapi import APIRouter

from app.config import settings

router = APIRouter()


@router.get("/health")
async def health_check() -> dict:
    """Return service health status."""
    return {
        "status": "healthy",
        "service": settings.SERVICE_NAME,
        "version": settings.VERSION,
    }
