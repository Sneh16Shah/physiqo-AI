"""End-to-end test: encode a real test image as base64, POST it to /api/v1/ocr/scan, print result."""
import httpx
import base64
import json
import sys

# Create a tiny test image (red 10x10 pixel JPEG)
from PIL import Image
import io

img = Image.new("RGB", (10, 10), color="red")
buf = io.BytesIO()
img.save(buf, format="JPEG")
img_bytes = buf.getvalue()
b64 = base64.b64encode(img_bytes).decode("utf-8")

print(f"Test image size: {len(img_bytes)} bytes")
print(f"Base64 length: {len(b64)} chars")

payload = {
    "image_base64": b64,
    "mime_type": "image/jpeg"
}

r = httpx.post("http://localhost:8000/api/v1/ocr/scan", json=payload, timeout=30)
print(f"\nHTTP Status: {r.status_code}")
print(f"Response: {json.dumps(r.json(), indent=2)}")
