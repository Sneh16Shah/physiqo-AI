from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from app.pipelines.ocr.body_comp import BodyCompOCRPipeline
from app.core.openai_provider import OpenAIProvider
from app.schemas.common import StructuredResponse
from app.schemas.ocr import BodyCompositionExtractionResponse

router = APIRouter()

# Dependency for now, we'll replace with real one if needed.
def verify_service_key():
    pass

@router.post("/body-composition", response_model=StructuredResponse[BodyCompositionExtractionResponse])
async def extract_body_composition(
    file: UploadFile = File(...),
    _: None = Depends(verify_service_key)
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
        
    image_bytes = await file.read()
    
    # In a real app we might inject this dependency
    provider = OpenAIProvider()
    pipeline = BodyCompOCRPipeline(provider)
    
    result = await pipeline.extract(image_bytes, mime_type=file.content_type)
    
    if result.error_message:
        raise HTTPException(status_code=500, detail=result.error_message)
        
    return result
