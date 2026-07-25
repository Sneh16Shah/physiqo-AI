from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Body
from typing import Dict, Any, Optional
import httpx
import logging

from app.pipelines.ocr.body_comp import BodyCompOCRPipeline
from app.schemas.common import StructuredResponse
from app.schemas.ocr import BodyCompositionExtractionResponse, OcrScanRequest

logger = logging.getLogger(__name__)
router = APIRouter()

def verify_service_key():
    pass

@router.post("/scan")
async def scan_ocr_image(
    payload: OcrScanRequest,
    _: None = Depends(verify_service_key)
):
    """
    Endpoint called by Spring Boot AiServiceClient: POST /api/v1/ocr/scan
    Payload: {"image_url": "http://minio:9000/physiqo-uploads/..."}
    """
    image_bytes = None
    mime_type = "image/jpeg"
    
    if payload.image_url:
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.get(payload.image_url)
                if res.status_code == 200:
                    image_bytes = res.content
                    mime_type = res.headers.get("content-type", "image/jpeg")
                else:
                    logger.warning(f"Failed to fetch image from URL {payload.image_url}: HTTP {res.status_code}")
        except Exception as e:
            logger.error(f"Error downloading image from {payload.image_url}: {e}")

    pipeline = BodyCompOCRPipeline()
    
    if image_bytes:
        result = await pipeline.extract(image_bytes, mime_type=mime_type)
    else:
        # Fallback if image download failed
        result = await pipeline.extract(b"", mime_type="image/jpeg")
        
    # Convert response into flat measurements map for Spring Boot & React frontend
    measurements_map: Dict[str, Any] = {}
    if result.data and result.data.measurement:
        m = result.data.measurement
        if m.weight_kg is not None:
            measurements_map["weight"] = {"value": m.weight_kg, "unit": "kg"}
        if m.body_fat_percentage is not None:
            measurements_map["body_fat_pct"] = {"value": m.body_fat_percentage, "unit": "%"}
        elif m.body_fat_kg is not None:
            measurements_map["body_fat_mass"] = {"value": m.body_fat_kg, "unit": "kg"}
        if m.muscle_mass_kg is not None:
            measurements_map["skeletal_muscle_mass"] = {"value": m.muscle_mass_kg, "unit": "kg"}
        if m.fat_free_mass_kg is not None:
            measurements_map["fat_free_mass"] = {"value": m.fat_free_mass_kg, "unit": "kg"}
        if m.water_content_kg is not None:
            measurements_map["water_content"] = {"value": m.water_content_kg, "unit": "kg"}
        elif m.water_percentage is not None:
            measurements_map["water_pct"] = {"value": m.water_percentage, "unit": "%"}
        if m.protein_kg is not None:
            measurements_map["protein"] = {"value": m.protein_kg, "unit": "kg"}
        if m.inorganic_salt_kg is not None:
            measurements_map["inorganic_salt"] = {"value": m.inorganic_salt_kg, "unit": "kg"}
        if m.bmi is not None:
            measurements_map["bmi"] = {"value": m.bmi, "unit": "kg/m²"}
        if m.visceral_fat_level is not None:
            measurements_map["visceral_fat_level"] = {"value": m.visceral_fat_level, "unit": "level"}

    return {
        "confidence": result.confidence_score,
        "confidenceCategory": result.confidence_category,
        "measurements": measurements_map
    }

@router.post("/body-composition", response_model=StructuredResponse[BodyCompositionExtractionResponse])
async def extract_body_composition(
    file: UploadFile = File(...),
    _: None = Depends(verify_service_key)
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
        
    image_bytes = await file.read()
    pipeline = BodyCompOCRPipeline()
    result = await pipeline.extract(image_bytes, mime_type=file.content_type)
    
    if result.error_message:
        raise HTTPException(status_code=500, detail=result.error_message)
        
    return result
