import logging
import os
import json
from typing import Dict, Any, Optional

from app.core.ai_provider import AIProvider
from app.core.openai_provider import OpenAIProvider
from app.core.gemini_provider import GeminiProvider
from app.schemas.ocr import BodyCompositionExtractionResponse, BodyCompositionMeasurementExtracted
from app.schemas.common import StructuredResponse
from app.core.confidence import calculate_confidence_category
from app.config import settings
from .preprocessor import ImagePreprocessor

logger = logging.getLogger(__name__)

class BodyCompOCRPipeline:
    def __init__(self, provider: Optional[AIProvider] = None):
        if provider:
            self.provider = provider
        else:
            # Auto-detect available provider based on API keys
            gemini_key = os.environ.get("GEMINI_API_KEY") or settings.GEMINI_API_KEY
            openai_key = os.environ.get("OPENAI_API_KEY") or settings.OPENAI_API_KEY
            
            if gemini_key:
                logger.info("Using GeminiProvider for BodyComp OCR")
                self.provider = GeminiProvider(api_key=gemini_key)
            elif openai_key:
                logger.info("Using OpenAIProvider for BodyComp OCR")
                self.provider = OpenAIProvider(api_key=openai_key)
            else:
                logger.warning("No AI API keys configured (GEMINI_API_KEY or OPENAI_API_KEY missing)")
                self.provider = None

    async def extract(self, image_bytes: bytes, mime_type: str = "image/jpeg") -> StructuredResponse[BodyCompositionExtractionResponse]:
        try:
            processed_bytes = ImagePreprocessor.process(image_bytes)
            
            if self.provider:
                prompt = (
                    "Extract body composition measurements from this scale / monitor display image.\n"
                    "Extract values for:\n"
                    "- Weight (kg)\n"
                    "- Body fat (kg or %)\n"
                    "- Remove fat / Fat-free mass / Lean mass (kg)\n"
                    "- Water content / Moisture (kg or %)\n"
                    "- Protein (kg)\n"
                    "- Inorganic salt / Bone mineral (kg)\n"
                    "- BMI\n"
                    "- Visceral fat level\n"
                    "Look carefully at tables and digital screen numbers."
                )
                system_prompt = (
                    "You are a medical OCR specialist. Extract body composition scale screen numbers accurately. "
                    "Only extract numbers that are clearly visible."
                )

                model_name = settings.GEMINI_MODEL if isinstance(self.provider, GeminiProvider) else settings.OPENAI_MODEL
                
                result = await self.provider.extract_structured(
                    model_name=model_name,
                    prompt=prompt,
                    response_model=BodyCompositionExtractionResponse,
                    image_bytes=processed_bytes,
                    image_mime_type=mime_type,
                    system_prompt=system_prompt
                )
                
                category = calculate_confidence_category(result.confidence)
                return StructuredResponse(
                    data=result,
                    confidence_score=result.confidence,
                    confidence_category=category
                )
            
            # Fallback if no AI key configured: return empty struct with lower confidence
            logger.info("Returning standard extraction template for manual user review")
            extracted = BodyCompositionMeasurementExtracted(
                weight_kg=None,
                body_fat_percentage=None,
                muscle_mass_kg=None,
                water_percentage=None,
                bmi=None
            )
            response = BodyCompositionExtractionResponse(measurement=extracted, confidence=0.50)
            return StructuredResponse(data=response, confidence_score=0.50, confidence_category="medium")

        except Exception as e:
            logger.error(f"OCR Extraction pipeline error: {e}", exc_info=True)
            extracted = BodyCompositionMeasurementExtracted()
            response = BodyCompositionExtractionResponse(measurement=extracted, confidence=0.30)
            return StructuredResponse(
                data=response,
                confidence_score=0.30,
                confidence_category="low",
                error_message=str(e)
            )
