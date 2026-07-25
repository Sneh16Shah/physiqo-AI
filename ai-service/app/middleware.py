"""
Request-ID correlation middleware for the Python AI service.

Extracts the ``X-Request-Id`` header forwarded by Spring Boot and binds it to
structlog context so every log line produced during the request includes the
same correlation ID.

If the header is absent (e.g. direct health-check probes), a new UUID is
generated so logs are still traceable.

See docs/ARCHITECTURE.md §11, docs/AI_ARCHITECTURE.md §6.
"""

import uuid
from typing import Callable

import structlog
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

REQUEST_ID_HEADER = "X-Request-Id"

log = structlog.get_logger()


class RequestIdMiddleware(BaseHTTPMiddleware):
    """
    ASGI middleware that propagates ``X-Request-Id`` into structlog context
    and echoes it back in the response.
    """

    async def dispatch(
        self, request: Request, call_next: Callable
    ) -> Response:
        # Use incoming header or generate a fresh UUID
        request_id = request.headers.get(REQUEST_ID_HEADER)
        if not request_id:
            request_id = str(uuid.uuid4())

        # Bind to structlog context for all downstream log calls
        structlog.contextvars.clear_contextvars()
        structlog.contextvars.bind_contextvars(request_id=request_id)

        log.info(
            "request_started",
            method=request.method,
            path=request.url.path,
        )

        response = await call_next(request)

        # Echo request ID back in response header
        response.headers[REQUEST_ID_HEADER] = request_id

        log.info(
            "request_completed",
            method=request.method,
            path=request.url.path,
            status_code=response.status_code,
        )

        # Clean up context vars after request completes
        structlog.contextvars.clear_contextvars()

        return response
