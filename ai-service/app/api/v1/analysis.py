from fastapi import APIRouter, Depends, HTTPException
from app.pipelines.analysis.progress import ProgressAnalysisPipeline
from app.core.openai_provider import OpenAIProvider
from app.schemas.common import StructuredResponse
from app.schemas.analysis import ProgressAnalysisRequest, ProgressAnalysisResponse

router = APIRouter()

def verify_service_key():
    pass

@router.post("/progress", response_model=StructuredResponse[ProgressAnalysisResponse])
async def analyze_progress(
    request: ProgressAnalysisRequest,
    _: None = Depends(verify_service_key)
):
    provider = OpenAIProvider()
    pipeline = ProgressAnalysisPipeline(provider)
    
    result = await pipeline.analyze(request)
    
    if result.error_message:
        raise HTTPException(status_code=500, detail=result.error_message)
        
    return result
