from typing import Type, TypeVar, Optional
from pydantic import BaseModel
from .ai_provider import AIProvider
import os
import json
import logging
import httpx
import base64

logger = logging.getLogger(__name__)

T = TypeVar('T', bound=BaseModel)

# NVIDIA NIM API base URL (OpenAI-compatible)
NIM_BASE_URL = "https://integrate.api.nvidia.com/v1"


class NvidiaProvider(AIProvider):
    """Vision provider using NVIDIA NIM free serverless API (OpenAI-compatible)."""

    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.environ.get("NVIDIA_API_KEY", "")

    async def extract_structured(
        self,
        model_name: str,
        prompt: str,
        response_model: Type[T],
        image_bytes: Optional[bytes] = None,
        image_mime_type: Optional[str] = None,
        system_prompt: Optional[str] = None
    ) -> T:
        # Build the JSON schema hint for the prompt
        schema_fields = response_model.model_json_schema().get("properties", {})
        field_names = list(schema_fields.keys())

        full_prompt = (
            f"{prompt}\n\n"
            f"Respond ONLY with a valid JSON object containing these fields: {field_names}.\n"
            f"Use null for any value you cannot read. Do not include markdown, code fences, or explanation."
        )

        # Build messages array (OpenAI chat completions format)
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})

        user_content = []
        if image_bytes and image_mime_type:
            b64 = base64.b64encode(image_bytes).decode("utf-8")
            user_content.append({
                "type": "image_url",
                "image_url": {"url": f"data:{image_mime_type};base64,{b64}"}
            })
        user_content.append({"type": "text", "text": full_prompt})
        messages.append({"role": "user", "content": user_content})

        url = f"{NIM_BASE_URL}/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": model_name,
            "messages": messages,
            "max_tokens": 1024,
            "temperature": 0.1
        }

        logger.info(f"Calling NVIDIA NIM model '{model_name}' with {len(image_bytes) if image_bytes else 0} image bytes")

        async with httpx.AsyncClient(timeout=90.0) as client:
            resp = await client.post(url, headers=headers, json=payload)

        if resp.status_code != 200:
            error_text = resp.text[:500]
            logger.error(f"NVIDIA NIM API error {resp.status_code}: {error_text}")
            raise Exception(f"NVIDIA NIM API error {resp.status_code}: {error_text}")

        resp_json = resp.json()
        raw_text = resp_json["choices"][0]["message"]["content"]
        logger.info(f"NVIDIA NIM raw response: {raw_text[:500]}")

        # Clean markdown fences if present
        cleaned = raw_text.strip()
        if cleaned.startswith("```"):
            # Remove ```json or ``` prefix
            first_newline = cleaned.find("\n")
            if first_newline > 0:
                cleaned = cleaned[first_newline + 1:]
            else:
                cleaned = cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()

        try:
            data = json.loads(cleaned)
            return response_model.model_validate(data)
        except Exception as e:
            logger.error(f"Failed to parse NVIDIA NIM response: {e}. Raw: {raw_text[:500]}")
            raise Exception(f"Failed to parse NVIDIA NIM response: {e}")

    async def analyze(
        self,
        model_name: str,
        prompt: str,
        system_prompt: Optional[str] = None
    ) -> str:
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        url = f"{NIM_BASE_URL}/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {"model": model_name, "messages": messages, "max_tokens": 1024}

        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(url, headers=headers, json=payload)

        resp_json = resp.json()
        return resp_json["choices"][0]["message"]["content"]
