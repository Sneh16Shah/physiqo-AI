from pydantic import BaseModel, Field
from typing import List, Optional

class EstimatedFoodItem(BaseModel):
    name: str = Field(..., description="Name of the food item")
    portion_size: str = Field(..., description="Estimated portion size")
    calories: int = Field(..., description="Estimated calories")
    protein_g: float = Field(..., description="Estimated protein in grams")
    carbs_g: float = Field(..., description="Estimated carbs in grams")
    fat_g: float = Field(..., description="Estimated fat in grams")
    confidence: float = Field(..., description="Confidence score for this item")

class MealEstimationResponse(BaseModel):
    items: List[EstimatedFoodItem]
    total_calories: int
    total_protein_g: float
    total_carbs_g: float
    total_fat_g: float
    overall_confidence: float = Field(..., description="Overall confidence score between 0.0 and 1.0")
