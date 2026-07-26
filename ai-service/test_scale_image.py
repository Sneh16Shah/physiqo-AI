import httpx
import base64
import json

with open("/app/user_scale.jpg", "rb") as f:
    img_bytes = f.read()

b64 = base64.b64encode(img_bytes).decode("utf-8")
print(f"Loaded image size: {len(img_bytes)} bytes, Base64 len: {len(b64)}")

payload = {
    "image_base64": b64,
    "mime_type": "image/jpeg"
}

r = httpx.post("http://localhost:8000/api/v1/ocr/scan", json=payload, timeout=60.0)
print(f"\nHTTP Status: {r.status_code}")
print(f"Response: {json.dumps(r.json(), indent=2)}")
