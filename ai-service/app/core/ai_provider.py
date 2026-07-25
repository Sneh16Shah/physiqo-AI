from typing import Protocol, Type, TypeVar, Any, Dict, List, Optional
from pydantic import BaseModel

T = TypeVar('T', bound=BaseModel)

class AIProvider(Protocol):
    async def extract_structured(
        self,
        model_name: str,
        prompt: str,
        response_model: Type[T],
        image_bytes: Optional[bytes] = None,
        image_mime_type: Optional[str] = None,
        system_prompt: Optional[str] = None
    ) -> T:
        ...

    async def analyze(
        self,
        model_name: str,
        prompt: str,
        system_prompt: Optional[str] = None
    ) -> str:
        ...
