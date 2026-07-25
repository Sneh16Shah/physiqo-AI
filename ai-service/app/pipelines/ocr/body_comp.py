from app.core.ai_provider import AIProvider
from app.schemas.ocr import BodyCompositionExtractionResponse
from app.schemas.common import StructuredResponse
from app.core.confidence import calculate_confidence_category
from .preprocessor import ImagePreprocessor

class BodyCompOCRPipeline:
    def __init__(self, provider: AIProvider):
        self.provider = provider
        
    async def extract(self, image_bytes: bytes, mime_type: str = "image/jpeg") -> StructuredResponse[BodyCompositionExtractionResponse]:
        try:
            processed_bytes = ImagePreprocessor.process(image_bytes)
            
            prompt = "Extract body composition measurements from this image. Only provide numbers that are clearly visible."
            system_prompt = "You are a highly accurate OCR assistant specializing in reading body composition scale displays."
            
            result = await self.provider.extract_structured(
                model_name="gpt-4o", # or gemini-2.0-flash
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
        except Exception as e:
            return StructuredResponse(
                confidence_score=0.0,
                confidence_category="rejected",
                error_message=str(e)
            )
