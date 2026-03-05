"""SiliconFlow GLM-4-9B-0414 implementation."""
from typing import Any, AsyncGenerator, Optional
import json
import httpx
from app.services.base import BaseAIService, AIServiceError
from app.core.config import settings

class SiliconFlowService(BaseAIService):
    """SiliconFlow API service for GLM-4-9B-0414 model."""

    async def generate_completion(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        max_tokens: int | None = None,
        temperature: float | None = None,
        **kwargs: Any
    ) -> str:
        """
        Generate text completion using GLM-4-9B-0414.

        Args:
            prompt: User prompt
            system_prompt: Optional system prompt for context
            max_tokens: Maximum tokens to generate (default from config)
            temperature: Sampling temperature (default from config)

        Returns:
            Generated text response
        """
        max_tokens = max_tokens or settings.SILICONFLOW_MAX_TOKENS
        temperature = temperature or settings.SILICONFLOW_TEMPERATURE

        messages = [{"role": "user", "content": prompt}]
        if system_prompt:
            messages.insert(0, {"role": "system", "content": system_prompt})

        data = {
            "model": settings.SILICONFLOW_MODEL,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature,
            "stream": False
        }

        response = await self._make_request("chat/completions", data)

        try:
            return response["choices"][0]["message"]["content"]
        except (KeyError, IndexError) as e:
            raise AIServiceError(f"Invalid response format: {str(e)}") from e

    async def generate_completion_stream(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        max_tokens: int | None = None,
        temperature: float | None = None,
        **kwargs: Any
    ) -> AsyncGenerator[str, None]:
        """
        Generate streaming text completion.

        Yields:
            Text chunks as they arrive
        """
        max_tokens = max_tokens or settings.SILICONFLOW_MAX_TOKENS
        temperature = temperature or settings.SILICONFLOW_TEMPERATURE

        messages = [{"role": "user", "content": prompt}]
        if system_prompt:
            messages.insert(0, {"role": "system", "content": system_prompt})

        data = {
            "model": settings.SILICONFLOW_MODEL,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature,
            "stream": True
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                async with client.stream(
                    "POST",
                    f"{self.base_url}/chat/completions",
                    headers=self._get_headers(),
                    json=data
                ) as response:
                    response.raise_for_status()
                    async for line in response.aiter_lines():
                        if line.startswith("data: "):
                            chunk = json.loads(line[6:])
                            if (
                                chunk.get("choices")
                                and chunk["choices"][0].get("delta", {}).get("content")
                            ):
                                yield chunk["choices"][0]["delta"]["content"]
            except httpx.HTTPStatusError as e:
                raise AIServiceError(f"Streaming error: {e.response.status_code}") from e
            except httpx.RequestError as e:
                raise AIServiceError("Streaming connection failed") from e
