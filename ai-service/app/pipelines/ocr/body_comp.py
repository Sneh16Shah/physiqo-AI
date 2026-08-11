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
            "Extract body composition measurements from this scale / monitor display image.\n\n"
            "STRICT EXTRACTION RULES (PREVENT HALLUCINATION):\n"
            "1. ONLY extract metrics that are EXPLICITLY labeled on the screen image.\n"
            "2. IF A METRIC IS NOT LABELED ON THIS SCREEN, YOU MUST LEAVE IT AS NULL. DO NOT GUESS, ESTIMATE, OR CALCULATE MISSING VALUES.\n"
            "3. IMPEDANCE TABLE WARNING: Numbers in tables labeled 'Impedance', '20kHz', '50kHz', '100kHz', 'RA', 'LA', 'TR', 'RL', 'LL' are bioelectrical impedance values (Ohms). DO NOT extract or map impedance numbers (e.g. 21.2, 513, 628) as BMI, Body Fat, Muscle, Protein, or Water!\n"
            "4. TARGET WEIGHT vs MEASURED WEIGHT: 'Target weight' (e.g. 70.0 kg) is target_weight_kg. DO NOT map 'Target weight' to current measured body weight (weight_kg). Only map to weight_kg if labeled 'Weight' or 'Body Weight'.\n"
            "5. HEIGHT: If the screen header shows 'Height' (e.g. '171cm'), extract it as height_cm. DO NOT confuse height with weight.\n"
            "6. EXACT DISAMBIGUATION:\n"
            "   - 'Body fat rate %' or 'Body fat %' -> body_fat_percentage (e.g. 20.7%).\n"
            "   - 'BMI (kg/m²)' -> bmi (e.g. 24.6). DO NOT confuse BMI with Body Fat Rate %.\n"
            "   - 'Basic metabolic' or 'BMR' -> bmr_kcal (e.g. 1697).\n"
            "   - 'Health assess-ment score' or 'Health score' -> health_score (e.g. 88).\n"
            "   - 'Weight Control' -> weight_control_kg (e.g. -2.2).\n"
            "   - 'Fat Control' -> fat_control_kg (e.g. -2.2).\n"
            "   - 'Muscle Control' -> muscle_control_kg (e.g. 0.0).\n\n"
            "Extract values for visible parameters only:"
        )
        system_prompt = (
            "You are a medical OCR specialist. Extract body composition scale screen numbers strictly and accurately. "
            "Never hallucinate or invent missing fields. Leave any unlabeled parameter as null."
        )

        candidates = [
            ("original", processed_bytes),
            ("rotated_90_cw", ImagePreprocessor.rotate(processed_bytes, 90)),
            ("rotated_270_cw", ImagePreprocessor.rotate(processed_bytes, 270)),
            ("rotated_180_cw", ImagePreprocessor.rotate(processed_bytes, 180)),
        ]

        import asyncio

        async def _extract_candidate(label: str, img_candidate: bytes):
            try:
                res = await self.provider.extract_structured(
                    model_name=self.model_name,
                    prompt=prompt,
                    response_model=BodyCompositionExtractionResponse,
                    image_bytes=img_candidate,
                    image_mime_type=mime_type,
                    system_prompt=system_prompt
                )
                return label, res
            except Exception as e:
                logger.warning(f"Orientation attempt '{label}' error: {e}")
                return label, None

        tasks = [_extract_candidate(label, img) for label, img in candidates]
        orientation_results = await asyncio.gather(*tasks)

        best_result = None
        best_metric_count = -1
        best_label = ""

        for label, result in orientation_results:
            if result and result.measurement:
                dumped = result.measurement.model_dump(exclude_none=True)
                metric_count = len(dumped)
                logger.info(f"Orientation attempt '{label}' extracted {metric_count} metrics: {dumped}")

                if metric_count > best_metric_count:
                    best_metric_count = metric_count
                    best_result = result
                    best_label = label

        if best_result and best_metric_count > 0:
            category = calculate_confidence_category(best_result.confidence)
            logger.info(f"✅ AI extraction selected best candidate ({best_label}): {best_metric_count} metrics extracted")
            return StructuredResponse(
                data=best_result,
                confidence_score=best_result.confidence,
                confidence_category=category
            )

        extracted = BodyCompositionMeasurementExtracted()
        response = BodyCompositionExtractionResponse(measurement=extracted, confidence=0.0)
        return StructuredResponse(
            data=response,
            confidence_score=0.0,
            confidence_category="none",
            error_message="AI extraction failed across all rotation angles"
        )
