from fastapi import FastAPI
from app.api.v1 import ocr, analysis, estimation

app = FastAPI(title="PhysiqO AI Service")

app.include_router(ocr.router, prefix="/api/v1/ocr", tags=["OCR"])
app.include_router(analysis.router, prefix="/api/v1/analysis", tags=["Analysis"])
app.include_router(estimation.router, prefix="/api/v1/estimation", tags=["Estimation"])

@app.get("/health")
def health_check():
    return {"status": "ok"}
