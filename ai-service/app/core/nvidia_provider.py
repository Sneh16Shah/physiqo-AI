from typing import Type, TypeVar, Optional, Dict, Any
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


def _extract_float(val: Any, preferred_keys=("kg", "value", "%")) -> Optional[float]:
    """Helper to extract float from number, string, or nested dict like {'kg': 66.4}."""
    if val is None:
        return None
    if isinstance(val, (int, float)):
        return float(val)
    if isinstance(val, dict):
        for k in preferred_keys:
            if k in val and val[k] is not None:
                res = _extract_float(val[k])
                if res is not None:
                    return res
        # Return first float-convertible value found in dict
        for k, v in val.items():
            if k != "confidence":
                res = _extract_float(v)
                if res is not None:
                    return res
        return None
    if isinstance(val, str):
        try:
            import re
            m = re.search(r"(\d+\.?\d*)", val)
            return float(m.group(1)) if m else None
        except Exception:
            return None
    return None


def normalize_ocr_response(data: Dict[str, Any]) -> Dict[str, Any]:
    """Normalizes LLM extraction JSON to fit BodyCompositionExtractionResponse schema."""
    if not isinstance(data, dict):
        return data

    m_data = data.get("measurement")
    if not isinstance(m_data, dict):
        return data

    normalized_m: Dict[str, Any] = {}

    # Field mapping rules (LLM variations -> schema field names)
    field_map = {
        "weight_kg": ["weight_kg", "weight"],
        "body_fat_kg": ["body_fat_kg", "body_fat"],
        "body_fat_percentage": ["body_fat_percentage", "body_fat_percent", "fat_percentage"],
        "muscle_mass_kg": ["muscle_mass_kg", "muscle_mass", "muscle"],
        "fat_free_mass_kg": ["fat_free_mass_kg", "fat_free_mass", "lean_mass", "remove_fat"],
        "water_content_kg": ["water_content_kg", "water_content", "water"],
        "water_percentage": ["water_percentage", "water_percent"],
        "protein_kg": ["protein_kg", "protein"],
        "inorganic_salt_kg": ["inorganic_salt_kg", "inorganic_salt", "bone_mineral", "salt"],
        "bmi": ["bmi", "body_mass_index"],
        "visceral_fat_level": ["visceral_fat_level", "visceral_fat", "visceral"]
    }

    for schema_key, aliases in field_map.items():
        val = None
        for alias in aliases:
            if alias in m_data:
                raw_val = m_data[alias]
                if schema_key == "body_fat_kg" and isinstance(raw_val, dict) and "kg" in raw_val:
                    val = _extract_float(raw_val["kg"])
                elif schema_key == "body_fat_percentage" and isinstance(raw_val, dict) and "%" in raw_val:
                    val = _extract_float(raw_val["%"])
                elif schema_key == "water_content_kg" and isinstance(raw_val, dict) and "kg" in raw_val:
                    val = _extract_float(raw_val["kg"])
                elif schema_key == "water_percentage" and isinstance(raw_val, dict) and "%" in raw_val:
                    val = _extract_float(raw_val["%"])
                else:
                    val = _extract_float(raw_val)

                if val is not None:
                    break
        normalized_m[schema_key] = val

    data["measurement"] = normalized_m

    # Ensure confidence is a float
    conf = _extract_float(data.get("confidence"))
    data["confidence"] = conf if conf is not None else 0.90

    return data


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
        sample_json = '''{
  "measurement": {
    "weight_kg": 66.4,
    "body_fat_kg": 13.1,
    "body_fat_percentage": 19.8,
    "muscle_mass_kg": null,
    "fat_free_mass_kg": 53.3,
    "water_content_kg": 37.9,
    "water_percentage": 57.1,
    "protein_kg": 9.4,
    "inorganic_salt_kg": 2.6,
    "bmi": 22.8,
    "visceral_fat_level": 4.0
  },
  "confidence": 0.95
}'''

        full_prompt = (
            f"{prompt}\n\n"
            f"Respond ONLY with a JSON object strictly adhering to this template structure:\n"
            f"{sample_json}\n\n"
            f"Use numbers (floats) for extracted numeric values and null for values that are not visible. Do not use nested dicts for values."
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
        raw_text = resp_json["choices"][0]["message"]["content"] or ""
        logger.info(f"NVIDIA NIM raw response text length={len(raw_text)}: {repr(raw_text)}")

        # Clean markdown or extract JSON object using regex
        cleaned = raw_text.strip()
        import re
        json_match = re.search(r"(\{.*\})", cleaned, re.DOTALL)
        if json_match:
            cleaned = json_match.group(1).strip()

        try:
            data = json.loads(cleaned)
            normalized_data = normalize_ocr_response(data)
            logger.info(f"Normalized data for validation: {normalized_data}")
            return response_model.model_validate(normalized_data)
        except Exception as e:
            logger.warning(f"Could not parse valid JSON from NVIDIA NIM response: {e}. Raw text: {repr(raw_text)}")
            return response_model.model_validate({"measurement": {}, "confidence": 0.0})

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
