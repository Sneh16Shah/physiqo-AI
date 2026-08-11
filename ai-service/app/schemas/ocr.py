from pydantic import BaseModel, Field
from typing import Optional, Dict, Any


class BodyCompositionMeasurementExtracted(BaseModel):
    height_cm: Optional[float] = Field(None, description="Height in cm from screen header (e.g. 171). DO NOT confuse with weight.")
    weight_kg: Optional[float] = Field(None, description="Weight in kg (e.g. 72.2)")
    skeletal_muscle_mass_kg: Optional[float] = Field(None, description="Skeletal muscle mass in kg (e.g. 31.8)")
    body_fat_kg: Optional[float] = Field(None, description="Body fat mass in kg (e.g. 15.0)")
    body_fat_percentage: Optional[float] = Field(None, description="Body fat percentage % (e.g. 20.7%). DO NOT confuse with BMI (e.g. 24.6)")
    fat_free_mass_kg: Optional[float] = Field(None, description="Fat-free mass or Remove fat in kg (e.g. 57.2)")
    water_content_kg: Optional[float] = Field(None, description="Water content in kg (e.g. 40.8)")
    water_percentage: Optional[float] = Field(None, description="Water rate % (e.g. 56.5)")
    protein_kg: Optional[float] = Field(None, description="Protein mass in kg (e.g. 13.0)")
    inorganic_salt_kg: Optional[float] = Field(None, description="Inorganic salt / bone mineral in kg (e.g. 3.31)")
    bmi: Optional[float] = Field(None, description="Body Mass Index BMI in kg/m² (e.g. 24.6)")
    waist_hip_ratio: Optional[float] = Field(None, description="Waist-hip rate / ratio (e.g. 0.77)")
    bmr_kcal: Optional[float] = Field(None, description="Basal Metabolic Rate BMR in kcal (e.g. 1697)")
    visceral_fat_level: Optional[float] = Field(None, description="Visceral fat level (e.g. 5)")
    health_score: Optional[float] = Field(None, description="Health assessment score (e.g. 88)")
    target_weight_kg: Optional[float] = Field(None, description="Target weight in kg (e.g. 70.0)")
    weight_control_kg: Optional[float] = Field(None, description="Weight control in kg (e.g. -2.2)")
    fat_control_kg: Optional[float] = Field(None, description="Fat control in kg (e.g. -2.2)")
    muscle_control_kg: Optional[float] = Field(None, description="Muscle control in kg (e.g. 0.0)")


class BodyCompositionExtractionResponse(BaseModel):
    measurement: BodyCompositionMeasurementExtracted
    confidence: float = Field(0.85, description="Estimated confidence score between 0.0 and 1.0")
    derived_fields: list[str] = Field(default_factory=list, description="Fields that were derived/calculated, not directly extracted")


class OcrScanRequest(BaseModel):
    image_base64: Optional[str] = Field(None, alias="imageBase64")
    image_url: Optional[str] = Field(None, alias="imageUrl")
    mime_type: Optional[str] = Field("image/jpeg", alias="mimeType")
    height_cm: Optional[float] = Field(None, alias="heightCm", description="User height in cm from profile")

    class Config:
        populate_by_name = True
