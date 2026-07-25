from pydantic import BaseModel, Field
from typing import Any, Dict, Optional, Generic, TypeVar

T = TypeVar('T')

class ConfidenceThresholds(BaseModel):
    high: float = 0.85
    medium: float = 0.60
    low: float = 0.40

class StructuredResponse(BaseModel, Generic[T]):
    data: Optional[T] = None
    confidence_score: float = Field(0.0, description="Overall confidence score between 0.0 and 1.0")
    confidence_category: str = Field("rejected", description="Category: high, medium, low, rejected")
    raw_response: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
