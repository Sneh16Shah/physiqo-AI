from pydantic import BaseModel, Field
from typing import List, Optional

class ProgressAnalysisRequest(BaseModel):
    user_id: str
    metrics: List[dict] = Field(..., description="List of historical metrics")
    timeframe_days: int = 30

class InsightItem(BaseModel):
    category: str = Field(..., description="Category of the insight e.g., 'weight', 'fat'")
    observation: str = Field(..., description="The insight observation")
    trend: str = Field(..., description="Trend e.g., 'improving', 'stagnant', 'declining'")

class RecommendationItem(BaseModel):
    focus_area: str = Field(..., description="Area of focus for the recommendation")
    actionable_step: str = Field(..., description="Specific step to take")

class ProgressAnalysisResponse(BaseModel):
    summary: str
    insights: List[InsightItem]
    recommendations: List[RecommendationItem]
    confidence_score: float = Field(..., description="Confidence score between 0.0 and 1.0")
