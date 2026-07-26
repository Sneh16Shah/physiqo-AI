import logging
import os
from typing import Optional

from app.core.ai_provider import AIProvider
from app.core.openai_provider import OpenAIProvider
from app.core.gemini_provider import GeminiProvider
from app.core.huggingface_provider import HuggingFaceProvider
from app.core.nvidia_provider import NvidiaProvider
from app.schemas.ocr import BodyCompositionExtractionResponse, BodyCompositionMeasurementExtracted
from app.schemas.common import StructuredResponse
from app.core.confidence import calculate_confidence_category
from app.config import settings
from .preprocessor import ImagePreprocessor

logger = logging.getLogger(__name__)

SKIP_VALUES = {"", "sk-replace-me", "hf-replace-me", "nvapi-replace-me"}


class BodyCompOCRPipeline:
    def __init__(self, provider: Optional[AIProvider] = None, model_name: Optional[str] = None):
        self.model_name = model_name
        if provider:
            self.provider = provider
        else:
            self.provider = None
            # Auto-detect provider from environment variables (priority order)
            providers = [
                ("NVIDIA_API_KEY", "nvidia", lambda k: NvidiaProvider(api_key=k), settings.NVIDIA_MODEL),
                ("GEMINI_API_KEY", "gemini", lambda k: GeminiProvider(api_key=k), settings.GEMINI_MODEL),
                ("OPENAI_API_KEY", "openai", lambda k: OpenAIProvider(api_key=k), settings.OPENAI_MODEL),
                ("HF_TOKEN", "huggingface", lambda k: HuggingFaceProvider(api_key=k), settings.HF_MODEL),
                ("HUGGINGFACE_API_KEY", "huggingface", lambda k: HuggingFaceProvider(api_key=k), settings.HF_MODEL),
            ]

            for env_var, name, factory, default_model in providers:
                key = os.environ.get(env_var, "") or getattr(settings, env_var, "")
                if key and key.strip() not in SKIP_VALUES:
                    logger.info(f"✅ Using {name} provider for BodyComp OCR (env: {env_var}, model: {default_model})")
                    self.provider = factory(key.strip())
                    if not self.model_name:
                        self.model_name = default_model
                    break

            if not self.provider:
                logger.error(
                    "❌ NO AI provider configured! Set one of: NVIDIA_API_KEY, GEMINI_API_KEY, OPENAI_API_KEY, HF_TOKEN. "
                    "Image extraction will NOT work."
                )

    async def extract(self, image_bytes: bytes, mime_type: str = "image/jpeg") -> StructuredResponse[BodyCompositionExtractionResponse]:
        processed_bytes = ImagePreprocessor.process(image_bytes) if image_bytes else b""

        if not self.provider:
            logger.error("No AI provider available. Cannot extract body composition data.")
            extracted = BodyCompositionMeasurementExtracted()
            response = BodyCompositionExtractionResponse(measurement=extracted, confidence=0.0)
            return StructuredResponse(
                data=response,
                confidence_score=0.0,
                confidence_category="none",
                error_message="No AI provider configured. Set NVIDIA_API_KEY, GEMINI_API_KEY, OPENAI_API_KEY, or HF_TOKEN."
            )

        if not processed_bytes:
            logger.error("No image bytes provided for OCR extraction")
            extracted = BodyCompositionMeasurementExtracted()
            response = BodyCompositionExtractionResponse(measurement=extracted, confidence=0.0)
            return StructuredResponse(
                data=response,
                confidence_score=0.0,
                confidence_category="none",
                error_message="No image provided for extraction"
            )

        prompt = (
            "Extract body composition measurements from this scale / monitor display image.\n"
            "Extract values for:\n"
            "- Weight (kg)\n"
            "- Body fat (kg or %)\n"
            "- Remove fat / Fat-free mass / Lean mass (kg)\n"
            "- Body fat percentage (%)\n"
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

        try:
            result = await self.provider.extract_structured(
                model_name=self.model_name,
                prompt=prompt,
                response_model=BodyCompositionExtractionResponse,
                image_bytes=processed_bytes,
                image_mime_type=mime_type,
                system_prompt=system_prompt
            )

            category = calculate_confidence_category(result.confidence)
            logger.info(f"✅ AI extraction succeeded: confidence={result.confidence}, data={result.measurement.model_dump(exclude_none=True)}")
            return StructuredResponse(
                data=result,
                confidence_score=result.confidence,
                confidence_category=category
            )

        except Exception as e:
            logger.error(f"❌ AI extraction failed: {e}", exc_info=True)
            extracted = BodyCompositionMeasurementExtracted()
            response = BodyCompositionExtractionResponse(measurement=extracted, confidence=0.0)
            return StructuredResponse(
                data=response,
                confidence_score=0.0,
                confidence_category="none",
                error_message=f"AI extraction failed: {str(e)}"
            )
