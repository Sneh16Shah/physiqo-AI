from typing import Type, TypeVar, Any, Dict, List, Optional
from pydantic import BaseModel
import google.generativeai as genai
from .ai_provider import AIProvider
import os
import json
import logging

logger = logging.getLogger(__name__)

T = TypeVar('T', bound=BaseModel)

class GeminiProvider(AIProvider):
    def __init__(self, api_key: str = None):
        api_key = api_key or os.environ.get("GEMINI_API_KEY")
        genai.configure(api_key=api_key)

    async def extract_structured(
        self,
        model_name: str,
        prompt: str,
        response_model: Type[T],
        image_bytes: Optional[bytes] = None,
        image_mime_type: Optional[str] = None,
        system_prompt: Optional[str] = None
    ) -> T:
        model = genai.GenerativeModel(
            model_name,
            system_instruction=system_prompt
        )
        
        # Build the JSON schema hint for the prompt so Gemini knows the shape
        schema_fields = response_model.model_json_schema().get("properties", {})
        field_names = list(schema_fields.keys())
        
        structured_prompt = (
            f"{prompt}\n\n"
            f"Respond ONLY with a valid JSON object containing these fields: {field_names}.\n"
            f"Do not include any markdown formatting, code fences, or explanation."
        )
        
        contents = [structured_prompt]
        if image_bytes and image_mime_type:
            contents.append({
                "mime_type": image_mime_type,
                "data": image_bytes
            })
        
        logger.info(f"Calling Gemini model '{model_name}' with {len(image_bytes) if image_bytes else 0} image bytes")
        
        response = await model.generate_content_async(
            contents,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
            )
        )
        
        logger.info(f"Gemini raw response text: {response.text[:500] if response.text else 'EMPTY'}")
        
        try:
            data = json.loads(response.text)
            return response_model.model_validate(data)
        except Exception as e:
            logger.error(f"Failed to parse gemini response: {e}. Raw text: {response.text[:500]}")
            raise Exception(f"Failed to parse gemini response: {e}")

    async def analyze(
        self,
        model_name: str,
        prompt: str,
        system_prompt: Optional[str] = None
    ) -> str:
        model = genai.GenerativeModel(
            model_name,
            system_instruction=system_prompt
        )
        response = await model.generate_content_async(prompt)
        return response.text
