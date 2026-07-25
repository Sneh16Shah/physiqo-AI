from typing import Type, TypeVar, Any, Dict, List, Optional
from pydantic import BaseModel
import google.generativeai as genai
from .ai_provider import AIProvider
import os
import json

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
        
        contents = [prompt]
        if image_bytes and image_mime_type:
            contents.append({
                "mime_type": image_mime_type,
                "data": image_bytes
            })
            
        response = await model.generate_content_async(
            contents,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
                response_schema=response_model
            )
        )
        
        try:
            data = json.loads(response.text)
            return response_model.model_validate(data)
        except Exception as e:
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
