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
    payload: Optional[OcrScanRequest] = Body(None),
    _: None = Depends(verify_service_key)
):
    """
    Endpoint called by Spring Boot AiServiceClient: POST /api/v1/ocr/scan
    Payload: {"image_url": "http://localhost:9000/physiqo-uploads/..."}
    """
    image_bytes = None
    mime_type = "image/jpeg"
    
    url_to_fetch = ""
    if payload:
        url_to_fetch = payload.image_url or payload.imageUrl or ""

    if url_to_fetch:
        # Resolve internal Docker network hostname for MinIO
        target_url = url_to_fetch.replace("localhost:9000", "minio:9000").replace("127.0.0.1:9000", "minio:9000")
        logger.info(f"Fetching image for OCR from target URL: {target_url} (original: {url_to_fetch})")
        
        try:
            async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
                res = await client.get(target_url)
                if res.status_code == 200:
                    image_bytes = res.content
                    mime_type = res.headers.get("content-type", "image/jpeg")
                    logger.info(f"Successfully downloaded image for OCR ({len(image_bytes)} bytes)")
                else:
                    logger.warning(f"Failed to fetch image from URL {target_url}: HTTP {res.status_code}")
        except Exception as e:
            logger.error(f"Error downloading image from {target_url}: {e}")

    pipeline = BodyCompOCRPipeline()
    
    if image_bytes:
        result = await pipeline.extract(image_bytes, mime_type=mime_type)
    else:
        # Fallback if image download failed
        logger.warning("No image bytes available for OCR, running fallback pipeline")
        result = await pipeline.extract(b"", mime_type="image/jpeg")
        
    # Flat measurements map for Java BodyCompositionService (which checks: entry.getValue() instanceof Number)
    measurements_map: Dict[str, Any] = {}
    if result.data and result.data.measurement:
        m = result.data.measurement
        if m.weight_kg is not None:
            measurements_map["weight"] = m.weight_kg
        if m.body_fat_kg is not None:
            measurements_map["body_fat_mass"] = m.body_fat_kg
        if m.body_fat_percentage is not None:
            measurements_map["body_fat_pct"] = m.body_fat_percentage
        if m.muscle_mass_kg is not None:
            measurements_map["skeletal_muscle_mass"] = m.muscle_mass_kg
        if m.fat_free_mass_kg is not None:
            measurements_map["fat_free_mass"] = m.fat_free_mass_kg
        if m.water_content_kg is not None:
            measurements_map["water_content"] = m.water_content_kg
        if m.water_percentage is not None:
            measurements_map["water_pct"] = m.water_percentage
        if m.protein_kg is not None:
            measurements_map["protein"] = m.protein_kg
        if m.inorganic_salt_kg is not None:
            measurements_map["inorganic_salt"] = m.inorganic_salt_kg
        if m.bmi is not None:
            measurements_map["bmi"] = m.bmi
        if m.visceral_fat_level is not None:
            measurements_map["visceral_fat_level"] = m.visceral_fat_level

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
