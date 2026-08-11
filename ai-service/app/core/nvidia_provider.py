from typing import Type, TypeVar, Optional, Dict, Any
from pydantic import BaseModel
from .ai_provider import AIProvider
import os
import json
import logging
import httpx
import base64
import re

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
        for k, v in val.items():
            if k != "confidence":
                res = _extract_float(v)
                if res is not None:
                    return res
        return None
    if isinstance(val, str):
        try:
            m = re.search(r"(-?\d+\.?\d*)", val)
            return float(m.group(1)) if m else None
        except Exception:
            return None
    return None


def _parse_markdown_text_to_dict(text: str) -> Dict[str, Any]:
    """
    Fallback parser when LLM returns markdown bullet points instead of JSON.
    e.g. '* **Skeletal Muscle (kg)**: 31.8'
    """
    extracted: Dict[str, Any] = {}
    lines = text.split("\n")
    for line in lines:
        line_clean = line.strip()
        if not line_clean:
            continue
        # Pattern like * **Key**: Value or - **Key**: Value or Key: Value
        m = re.search(r"[\*\-]?\s*\*\*?([^\*:]+)\*\*?\s*:\s*(.+)", line_clean)
        if m:
            raw_key = m.group(1).strip().lower()
            raw_val_str = m.group(2).strip()
            if raw_val_str.lower() in ("null", "none", "n/a", "-"):
                continue
            val_float = _extract_float(raw_val_str)
            if val_float is not None:
                extracted[raw_key] = val_float
    return extracted


def normalize_ocr_response(data: Dict[str, Any]) -> Dict[str, Any]:
    """Normalizes LLM extraction JSON to fit BodyCompositionExtractionResponse schema."""
    if not isinstance(data, dict):
        return data

    m_data = data.get("measurement")
    if not isinstance(m_data, dict):
        if "measurements" in data and isinstance(data["measurements"], dict):
            m_data = data["measurements"]
        else:
            m_data = data

    normalized_m: Dict[str, Any] = {}

    # Comprehensive Field mapping rules (LLM key variations -> schema field names)
    field_map = {
        "height_cm": ["height_cm", "height"],
        "weight_kg": ["weight_kg", "weight", "body_weight"],
        "skeletal_muscle_mass_kg": ["skeletal_muscle_mass_kg", "skeletal_muscle_mass", "skeletal_muscle", "muscle_mass_kg", "muscle_mass", "muscle"],
        "body_fat_kg": ["body_fat_kg", "body_fat_mass", "body_fat", "fat_mass"],
        "body_fat_percentage": ["body_fat_percentage", "body_fat_pct", "body_fat_percent", "fat_percentage", "body_fat_rate"],
        "fat_free_mass_kg": ["fat_free_mass_kg", "fat_free_mass", "lean_mass", "remove_fat"],
        "water_content_kg": ["water_content_kg", "water_content", "water"],
        "water_percentage": ["water_percentage", "water_pct", "water_percent", "water_rate"],
        "protein_kg": ["protein_kg", "protein"],
        "inorganic_salt_kg": ["inorganic_salt_kg", "inorganic_salt", "bone_mineral", "salt"],
        "bmi": ["bmi", "body_mass_index"],
        "waist_hip_ratio": ["waist_hip_ratio", "waist_hip_rate", "whr"],
        "bmr_kcal": ["bmr_kcal", "bmr", "basic_metabolic", "basal_metabolic_rate"],
        "visceral_fat_level": ["visceral_fat_level", "visceral_fat", "visceral"],
        "health_score": ["health_score", "health_assessment_score", "health_score_val"],
        "target_weight_kg": ["target_weight_kg", "target_weight"],
        "weight_control_kg": ["weight_control_kg", "weight_control"],
        "fat_control_kg": ["fat_control_kg", "fat_control"],
        "muscle_control_kg": ["muscle_control_kg", "muscle_control"]
    }

    # Normalize case/punctuation in keys of m_data
    normalized_input_keys = {}
    for k, v in m_data.items():
        k_clean = str(k).lower().replace(" ", "_").replace("-", "_").replace("(", "").replace(")", "").replace("%", "pct").replace("kg", "")
        k_clean = re.sub(r"_+", "_", k_clean).strip("_")
        normalized_input_keys[k_clean] = v

    for schema_key, aliases in field_map.items():
        val = None
        # First search exact or alias matches in m_data
        for alias in aliases:
            if alias in m_data:
                val = _extract_float(m_data[alias])
                if val is not None:
                    break
            # Also check normalized keys
            alias_clean = alias.lower().replace(" ", "_").replace("-", "_").replace("(", "").replace(")", "").replace("%", "pct").replace("kg", "")
            alias_clean = re.sub(r"_+", "_", alias_clean).strip("_")
            if alias_clean in normalized_input_keys:
                val = _extract_float(normalized_input_keys[alias_clean])
                if val is not None:
                    break

        normalized_m[schema_key] = val

    data["measurement"] = normalized_m

    # Ensure confidence is a float
    conf = _extract_float(data.get("confidence"))
    data["confidence"] = conf if conf is not None else 0.90

    return data


class NvidiaProvider(AIProvider):
    """Vision provider using NVIDIA NIM serverless API (OpenAI-compatible)."""

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
    "height_cm": 171.0,
    "weight_kg": 72.2,
    "skeletal_muscle_mass_kg": 31.8,
    "body_fat_kg": 15.0,
    "body_fat_percentage": 20.7,
    "fat_free_mass_kg": 57.2,
    "water_content_kg": 40.8,
    "water_percentage": 56.5,
    "protein_kg": 13.0,
    "inorganic_salt_kg": 3.31,
    "bmi": 24.6,
    "waist_hip_ratio": 0.77,
    "bmr_kcal": 1697.0,
    "visceral_fat_level": 5.0,
    "health_score": 88.0,
    "target_weight_kg": 70.0,
    "weight_control_kg": -2.2,
    "fat_control_kg": -2.2,
    "muscle_control_kg": 0.0
  },
  "confidence": 0.95
}'''

        full_prompt = (
            f"{prompt}\n\n"
            f"Respond ONLY with valid JSON strictly adhering to this key structure:\n"
            f"{sample_json}\n\n"
            f"Use numeric float values for extracted parameters and null for any parameter not visible in the image. Do not invent values."
        )

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

        candidate_models = [model_name]
        for fallback in ["meta/llama-3.2-90b-vision-instruct", "meta/llama-3.2-11b-vision-instruct"]:
            if fallback not in candidate_models:
                candidate_models.append(fallback)

        last_error = None
        resp_json = None
        raw_text = ""

        async with httpx.AsyncClient(timeout=90.0) as client:
            for current_model in candidate_models:
                payload = {
                    "model": current_model,
                    "messages": messages,
                    "max_tokens": 1024,
                    "temperature": 0.1,
                    "response_format": {"type": "json_object"}
                }
                logger.info(f"Calling NVIDIA NIM model '{current_model}' with {len(image_bytes) if image_bytes else 0} image bytes")
                try:
                    resp = await client.post(url, headers=headers, json=payload)
                    if resp.status_code == 200:
                        resp_json = resp.json()
                        raw_text = resp_json["choices"][0]["message"]["content"] or ""
                        logger.info(f"NVIDIA NIM model '{current_model}' succeeded! raw text len={len(raw_text)}")
                        break
                    else:
                        # If response_format json_object fails, retry without it
                        payload.pop("response_format", None)
                        resp = await client.post(url, headers=headers, json=payload)
                        if resp.status_code == 200:
                            resp_json = resp.json()
                            raw_text = resp_json["choices"][0]["message"]["content"] or ""
                            logger.info(f"NVIDIA NIM model '{current_model}' (no json_object format) succeeded! raw text len={len(raw_text)}")
                            break
                        error_text = resp.text[:500]
                        logger.warning(f"NVIDIA NIM model '{current_model}' returned {resp.status_code}: {error_text}")
                        last_error = f"NVIDIA NIM API error {resp.status_code}: {error_text}"
                except Exception as ex:
                    logger.warning(f"NVIDIA NIM model '{current_model}' exception: {ex}")
                    last_error = str(ex)

        if resp_json is None:
            raise Exception(f"All NVIDIA NIM candidate models failed. Last error: {last_error}")

        # Clean markdown or extract JSON object using regex
        cleaned = raw_text.strip()
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
            # Try fallback parsing if text returned as markdown bullet points
            markdown_dict = _parse_markdown_text_to_dict(raw_text)
            if markdown_dict:
                logger.info(f"Successfully extracted {len(markdown_dict)} fields from markdown text fallback: {markdown_dict}")
                normalized_data = normalize_ocr_response({"measurement": markdown_dict, "confidence": 0.85})
                return response_model.model_validate(normalized_data)
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

        async with httpx.AsyncClient(timeout=90.0) as client:
            resp = await client.post(
                url,
                headers=headers,
                json={"model": model_name, "messages": messages, "max_tokens": 1024, "temperature": 0.2}
            )
            resp.raise_for_request()
            r = resp.json()
            return r["choices"][0]["message"]["content"]
