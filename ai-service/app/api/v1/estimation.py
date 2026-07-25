from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from app.pipelines.nutrition.meal_estimator import MealEstimatorPipeline
from app.core.openai_provider import OpenAIProvider
from app.schemas.common import StructuredResponse
from app.schemas.nutrition import MealEstimationResponse

router = APIRouter()

def verify_service_key():
    pass

@router.post("/meal", response_model=StructuredResponse[MealEstimationResponse])
async def estimate_meal(
    file: UploadFile = File(...),
    _: None = Depends(verify_service_key)
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
        
    image_bytes = await file.read()
    
    provider = OpenAIProvider()
    pipeline = MealEstimatorPipeline(provider)
    
    result = await pipeline.estimate(image_bytes, mime_type=file.content_type)
    
    if result.error_message:
        raise HTTPException(status_code=500, detail=result.error_message)
        
    return result
