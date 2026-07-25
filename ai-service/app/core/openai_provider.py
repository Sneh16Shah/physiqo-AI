from typing import Type, TypeVar, Any, Dict, List, Optional
from pydantic import BaseModel
import openai
from .ai_provider import AIProvider
import base64
import os
import json

T = TypeVar('T', bound=BaseModel)

class OpenAIProvider(AIProvider):
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.environ.get("OPENAI_API_KEY")
        self.client = openai.AsyncOpenAI(api_key=self.api_key)

    async def extract_structured(
        self,
        model_name: str,
        prompt: str,
        response_model: Type[T],
        image_bytes: Optional[bytes] = None,
        image_mime_type: Optional[str] = None,
        system_prompt: Optional[str] = None
    ) -> T:
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
            
        content: List[Dict[str, Any]] = [{"type": "text", "text": prompt}]
        
        if image_bytes and image_mime_type:
            base64_image = base64.b64encode(image_bytes).decode('utf-8')
            content.append({
                "type": "image_url",
                "image_url": {
                    "url": f"data:{image_mime_type};base64,{base64_image}"
                }
            })
            
        messages.append({"role": "user", "content": content})

        completion = await self.client.beta.chat.completions.parse(
            model=model_name,
            messages=messages,
            response_format=response_model,
        )
        
        return completion.choices[0].message.parsed

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

        response = await self.client.chat.completions.create(
            model=model_name,
            messages=messages
        )
        
        return response.choices[0].message.content
