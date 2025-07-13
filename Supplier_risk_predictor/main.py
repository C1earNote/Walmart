from fastapi import FastAPI
from app import router  
from storage_analysis import router as storage_router

app = FastAPI(
    title="Supplier Risk Analyzer",
    description="API for analyzing supplier risks through news sentiment analysis",
    version="1.0.0"
)

app.include_router(router, prefix="/api", tags=["Suppliers"])
app.include_router(storage_router, prefix="/api", tags=["Storage Analysis"])

@app.get("/")
def root():
    """Root endpoint providing API information"""
    return {
        "message": "Supplier Risk Analyzer API",
        "version": "1.0.0",
        "endpoints": {
            "supplier_risk_report": "/api/risk-report",
            "analyze_supplier": "/api/analyze-supplier",
            "storage_demand_analysis": "/api/storage-demand-analysis",
            "storage_locations": "/api/storage-locations",
            "storage_location_by_id": "/api/storage-location/{location_id}"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)