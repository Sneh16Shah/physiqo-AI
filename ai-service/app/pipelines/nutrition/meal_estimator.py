from app.core.ai_provider import AIProvider
from app.schemas.nutrition import MealEstimationResponse
from app.schemas.common import StructuredResponse
from app.core.confidence import calculate_confidence_category
from app.pipelines.ocr.preprocessor import ImagePreprocessor

class MealEstimatorPipeline:
    def __init__(self, provider: AIProvider):
        self.provider = provider
        
    async def estimate(self, image_bytes: bytes, mime_type: str = "image/jpeg") -> StructuredResponse[MealEstimationResponse]:
        try:
            processed_bytes = ImagePreprocessor.process(image_bytes)
            
            prompt = "Analyze this meal photo and estimate the food items, portion sizes, and macros."
            system_prompt = "You are an expert nutritionist AI capable of estimating food items, portions, and macros from images."
            
            result = await self.provider.extract_structured(
                model_name="gpt-4o",
                prompt=prompt,
                response_model=MealEstimationResponse,
                image_bytes=processed_bytes,
                image_mime_type=mime_type,
                system_prompt=system_prompt
            )
            
            category = calculate_confidence_category(result.overall_confidence)
            
            return StructuredResponse(
                data=result,
                confidence_score=result.overall_confidence,
                confidence_category=category
            )
        except Exception as e:
            return StructuredResponse(
                confidence_score=0.0,
                confidence_category="rejected",
                error_message=str(e)
            )
