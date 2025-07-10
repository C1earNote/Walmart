from fastapi import FastAPI
from app import router  

app = FastAPI(
    title="Supplier Risk Analyzer",
    description="API for analyzing supplier risks through news sentiment analysis",
    version="1.0.0"
)

app.include_router(router, prefix="/api", tags=["Suppliers"])

@app.get("/")
def root():
    """Root endpoint providing API information"""
    return {
        "message": "Supplier Risk Analyzer API",
        "version": "1.0.0",
        "endpoints": {
            "risk_report": "/api/risk-report"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)