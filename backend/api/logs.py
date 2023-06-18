import logging
from os import makedirs
from time import time_ns

from fastapi import Request
from starlette.datastructures import Headers
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import Message

# Sensitive headers and JSON fields that should not be logged
SENSITIVE_HEADERS = {
    "Authorization",
    "Cookie",
    "Set-Cookie",
}

SENSITIVE_FIELDS = {
    "password",
    "auth_token",
}

# Configure logging
makedirs("./logs", exist_ok=True)
HTTP_logger = logging.getLogger("http")
HTTP_logger.setLevel(logging.INFO)
HTTP_logger.addHandler(logging.FileHandler("./logs/http.log"))


class LoggingMiddleware(BaseHTTPMiddleware):
    async def set_body(self, request: Request):
        receive_ = await request._receive()

        async def receive() -> Message:
            return receive_

        request._receive = receive

    async def dispatch(self, request: Request, call_next):
        time = time_ns()
        request_body = None
        try:
            await self.set_body(request)
            request_body = await request.json()
        except Exception:
            pass

        response = await call_next(request)
        safe_request_headers = Headers(
            {
                k: (v if k not in SENSITIVE_HEADERS else "[Stripped for privacy]")
                for k, v in request.headers.items()
            }
        )
        safe_response_headers = Headers(
            {
                k: (v if k not in SENSITIVE_HEADERS else "[Stripped for privacy]")
                for k, v in response.headers.items()
            }
        )

        HTTP_logger.info(f"{time}:Request: {request.method} {request.url.path}")
        HTTP_logger.info(f"{time}:Request headers: {safe_request_headers}")
        HTTP_logger.info(f"{time}:Query params: {dict(request.query_params)}")
        if request_body:
            for k in SENSITIVE_FIELDS:
                if k in request_body:
                    request_body[k] = "[Stripped for privacy]"
            HTTP_logger.info(f"{time}:Request body: {request_body}")
        else:
            HTTP_logger.info(f"{time}:Request body: [empty]")

        HTTP_logger.info(f"{time}:Response: {response.status_code}")
        HTTP_logger.info(f"{time}:Response headers: {safe_response_headers}")

        # There is no easy way to fetch body of response, following doesn't work
        # if response.body:
        #     if request.url.path == "/auth/generateToken":
        #         HTTP_logger.info(f"{time}:Response body: [Stripped for privacy]")
        #     else:
        #         HTTP_logger.info(f"Response body: {response.body}")
        # else:
        #     HTTP_logger.info(f"{time}:Response body: [empty]")

        return response
