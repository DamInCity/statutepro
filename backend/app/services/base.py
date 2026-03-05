"""Base AI service with common patterns."""
from typing import Any, AsyncGenerator
import httpx
from app.core.config import settings

class AIServiceError(Exception):
    """Base exception for AI service errors."""
    pass

class BaseAIService:
    """Base class for AI services with security best practices."""

    def __init__(self) -> None:
        self.timeout = settings.SILICONFLOW_TIMEOUT
        self.base_url = settings.SILICONFLOW_BASE_URL

    def _get_headers(self) -> dict[str, str]:
        """Get secure headers (never logs API key)."""
        return {
            "Authorization": f"Bearer {settings.SILICONFLOW_API_KEY}",
            "Content-Type": "application/json"
        }

    async def _make_request(
        self,
        endpoint: str,
        data: dict[str, Any]
    ) -> dict[str, Any]:
        """Make HTTP request with error handling (never logs API key)."""
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.post(
                    f"{self.base_url}/{endpoint}",
                    headers=self._get_headers(),
                    json=data
                )
                response.raise_for_status()
                return response.json()
            except httpx.HTTPStatusError as e:
                # Sanitized error - never expose API details
                raise AIServiceError(
                    f"AI service error: {e.response.status_code}"
                ) from e
            except httpx.RequestError as e:
                raise AIServiceError(
                    "Failed to connect to AI service"
                ) from e
