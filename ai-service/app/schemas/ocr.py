from pydantic import BaseModel, Field
from typing import Optional

class BodyCompositionMeasurementExtracted(BaseModel):
    weight_kg: Optional[float] = Field(None, description="Weight in kg")
    body_fat_percentage: Optional[float] = Field(None, description="Body fat percentage")
    muscle_mass_kg: Optional[float] = Field(None, description="Muscle mass in kg")
    water_percentage: Optional[float] = Field(None, description="Water percentage")
    bmi: Optional[float] = Field(None, description="Body Mass Index")

class BodyCompositionExtractionResponse(BaseModel):
    measurement: BodyCompositionMeasurementExtracted
    confidence: float = Field(..., description="Estimated confidence score between 0.0 and 1.0")
