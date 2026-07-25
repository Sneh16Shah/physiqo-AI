from app.core.ai_provider import AIProvider
from app.schemas.analysis import ProgressAnalysisRequest, ProgressAnalysisResponse
from app.schemas.common import StructuredResponse
from app.core.confidence import calculate_confidence_category
import json

class ProgressAnalysisPipeline:
    def __init__(self, provider: AIProvider):
        self.provider = provider
        
    async def analyze(self, request: ProgressAnalysisRequest) -> StructuredResponse[ProgressAnalysisResponse]:
        try:
            prompt = f"Analyze these metrics over the last {request.timeframe_days} days: {json.dumps(request.metrics)}"
            system_prompt = "You are a professional fitness and health data analyst. Provide insights and recommendations based on the user's data."
            
            result = await self.provider.extract_structured(
                model_name="gpt-4o",
                prompt=prompt,
                response_model=ProgressAnalysisResponse,
                system_prompt=system_prompt
            )
            
            category = calculate_confidence_category(result.confidence_score)
            
            return StructuredResponse(
                data=result,
                confidence_score=result.confidence_score,
                confidence_category=category
            )
        except Exception as e:
            return StructuredResponse(
                confidence_score=0.0,
                confidence_category="rejected",
                error_message=str(e)
            )
