from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Request
from typing import Dict, Any, Optional
import httpx
import logging
import base64
import json

from app.pipelines.ocr.body_comp import BodyCompOCRPipeline
from app.schemas.common import StructuredResponse
from app.schemas.ocr import BodyCompositionExtractionResponse

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/scan")
async def scan_ocr_image(request: Request):
    """
    Endpoint called by Spring Boot AiServiceClient: POST /api/v1/ocr/scan
    Payload: {"image_base64": "...", "mime_type": "image/jpeg"} or {"image_url": "..."}
    """
    body_bytes = await request.body()
    raw_payload = {}
    if body_bytes:
        try:
            raw_payload = json.loads(body_bytes.decode("utf-8"))
            logger.info(f"Parsed JSON payload with keys: {list(raw_payload.keys())}")
        except Exception as e:
            logger.warning(f"Could not parse JSON body from {len(body_bytes)} bytes: {e}")

    image_bytes = None

    image_base64 = raw_payload.get("image_base64") or raw_payload.get("imageBase64")
    image_url = raw_payload.get("image_url") or raw_payload.get("imageUrl")
    mime_type = raw_payload.get("mime_type") or raw_payload.get("mimeType") or "image/jpeg"

    logger.info(f"Received /ocr/scan request - base64_len: {len(image_base64) if image_base64 else 0}, image_url: {image_url}, mime_type: {mime_type}")

    if image_base64:
        try:
            raw_b64 = str(image_base64)
            if "," in raw_b64:
                raw_b64 = raw_b64.split(",", 1)[1]
            image_bytes = base64.b64decode(raw_b64)
            logger.info(f"Successfully decoded Base64 image payload ({len(image_bytes)} bytes)")
        except Exception as e:
            logger.error(f"Failed to decode Base64 image payload: {e}")

    if not image_bytes and image_url:
        target_url = str(image_url).replace("localhost:9000", "minio:9000").replace("127.0.0.1:9000", "minio:9000")
        logger.info(f"Fetching image for OCR from target URL fallback: {target_url}")

        try:
            async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
                res = await client.get(target_url)
                if res.status_code == 200:
                    image_bytes = res.content
                    mime_type = res.headers.get("content-type", mime_type)
                    logger.info(f"Successfully downloaded image for OCR ({len(image_bytes)} bytes)")
                else:
                    logger.warning(f"Failed to fetch image from URL {target_url}: HTTP {res.status_code}")
        except Exception as e:
            logger.error(f"Error downloading image from {target_url}: {e}")

    pipeline = BodyCompOCRPipeline()

    if image_bytes and len(image_bytes) > 0:
        logger.info(f"Executing OCR extraction pipeline on {len(image_bytes)} bytes (mime: {mime_type})")
        result = await pipeline.extract(image_bytes, mime_type=mime_type)
    else:
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

    logger.info(f"OCR extraction finished with {len(measurements_map)} metrics extracted: {measurements_map}")

    return {
        "confidence": result.confidence_score,
        "confidenceCategory": result.confidence_category,
        "measurements": measurements_map
    }


@router.post("/body-composition", response_model=StructuredResponse[BodyCompositionExtractionResponse])
async def extract_body_composition(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    image_bytes = await file.read()
    pipeline = BodyCompOCRPipeline()
    result = await pipeline.extract(image_bytes, mime_type=file.content_type)

    if result.error_message:
        raise HTTPException(status_code=500, detail=result.error_message)

    return result
