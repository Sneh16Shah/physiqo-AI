import logging
import os
import io
import re
from typing import Dict, Any, Optional

from PIL import Image
try:
    import pytesseract
except ImportError:
    pytesseract = None

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
                logger.warning("No Vision AI API keys configured (GEMINI_API_KEY or OPENAI_API_KEY missing). Falling back to local Tesseract OCR Engine.")
                self.provider = None

    def _extract_with_tesseract(self, image_bytes: bytes) -> BodyCompositionMeasurementExtracted:
        extracted = BodyCompositionMeasurementExtracted()
        if not pytesseract or not image_bytes:
            return extracted

        try:
            img = Image.open(io.BytesIO(image_bytes))
            raw_text = pytesseract.image_to_string(img)
            logger.info(f"Local Tesseract OCR extracted raw text:\n{raw_text}")

            lines = raw_text.split('\n')
            for line in lines:
                line_str = line.strip()
                if not line_str:
                    continue

                # Weight (72.2kg)
                if re.search(r'weight', line_str, re.IGNORECASE) and extracted.weight_kg is None:
                    m = re.search(r'(\d{2,3}\.?\d*)', line_str)
                    if m:
                        extracted.weight_kg = float(m.group(1))

                # Body fat (15.0kg or %)
                elif re.search(r'body\s*fat', line_str, re.IGNORECASE) and extracted.body_fat_kg is None:
                    m = re.search(r'(\d{1,2}\.?\d*)', line_str)
                    if m:
                        extracted.body_fat_kg = float(m.group(1))

                # Remove fat / Fat-free mass (57.2kg)
                elif re.search(r'remove\s*fat|fat\s*free', line_str, re.IGNORECASE) and extracted.fat_free_mass_kg is None:
                    m = re.search(r'(\d{2,3}\.?\d*)', line_str)
                    if m:
                        extracted.fat_free_mass_kg = float(m.group(1))

                # Water content (40.8kg)
                elif re.search(r'water', line_str, re.IGNORECASE) and extracted.water_content_kg is None:
                    m = re.search(r'(\d{2,3}\.?\d*)', line_str)
                    if m:
                        extracted.water_content_kg = float(m.group(1))

                # Protein (13.0kg)
                elif re.search(r'protein', line_str, re.IGNORECASE) and extracted.protein_kg is None:
                    m = re.search(r'(\d{1,2}\.?\d*)', line_str)
                    if m:
                        extracted.protein_kg = float(m.group(1))

                # Inorganic salt (3.31kg)
                elif re.search(r'salt|inorganic', line_str, re.IGNORECASE) and extracted.inorganic_salt_kg is None:
                    m = re.search(r'(\d{1,2}\.?\d*)', line_str)
                    if m:
                        extracted.inorganic_salt_kg = float(m.group(1))

            return extracted
        except Exception as e:
            logger.error(f"Tesseract OCR execution error: {e}")
            return extracted

    async def extract(self, image_bytes: bytes, mime_type: str = "image/jpeg") -> StructuredResponse[BodyCompositionExtractionResponse]:
        try:
            processed_bytes = ImagePreprocessor.process(image_bytes) if image_bytes else b""
            
            if self.provider and processed_bytes:
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
            
            # Local Tesseract OCR fallback when no API key is present
            logger.info("Executing local Tesseract OCR engine on image...")
            tess_extracted = self._extract_with_tesseract(processed_bytes)
            
            has_data = any(v is not None for v in tess_extracted.model_dump().values())
            conf_score = 0.85 if has_data else 0.50
            conf_cat = "high" if has_data else "medium"
            
            response = BodyCompositionExtractionResponse(measurement=tess_extracted, confidence=conf_score)
            return StructuredResponse(data=response, confidence_score=conf_score, confidence_category=conf_cat)

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
