from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

class BodyCompositionMeasurementExtracted(BaseModel):
    weight_kg: Optional[float] = Field(None, description="Weight in kg")
    body_fat_kg: Optional[float] = Field(None, description="Body fat in kg")
    body_fat_percentage: Optional[float] = Field(None, description="Body fat percentage")
    muscle_mass_kg: Optional[float] = Field(None, description="Muscle mass in kg")
    fat_free_mass_kg: Optional[float] = Field(None, description="Fat-free mass or remove fat in kg")
    water_content_kg: Optional[float] = Field(None, description="Water content in kg")
    water_percentage: Optional[float] = Field(None, description="Water percentage")
    protein_kg: Optional[float] = Field(None, description="Protein mass in kg")
    inorganic_salt_kg: Optional[float] = Field(None, description="Inorganic salt in kg")
    bmi: Optional[float] = Field(None, description="Body Mass Index")
    visceral_fat_level: Optional[float] = Field(None, description="Visceral fat level")

class BodyCompositionExtractionResponse(BaseModel):
    measurement: BodyCompositionMeasurementExtracted
    confidence: float = Field(0.85, description="Estimated confidence score between 0.0 and 1.0")

class OcrScanRequest(BaseModel):
    image_url: Optional[str] = Field(None, alias="imageUrl")
    imageUrl: Optional[str] = None

    class Config:
        populate_by_name = True
