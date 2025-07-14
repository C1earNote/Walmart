from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import json
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any

from news import fetch_news
from sentiment import analyze_sentiment

router = APIRouter()

# Load storage locations data
def load_storage_locations():
    try:
        with open("storage_loc.json", "r") as f:
            return json.load(f)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Storage locations data not found")
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Invalid storage locations data format")

# Pydantic models for request/response validation
class StorageLocation(BaseModel):
    id: int
    address: str
    coordinates: Dict[str, float]
    items: List[str]

class DemandPrediction(BaseModel):
    product_category: str
    sentiment: str
    polarity_score: float
    demand_trend: str
    confidence: str
    recent_news_count: int

class StorageAnalysisResponse(BaseModel):
    location_id: int
    address: str
    coordinates: Dict[str, float]
    demand_predictions: List[DemandPrediction]
    overall_location_sentiment: str
    average_polarity_score: float
    analysis_timestamp: str

@router.get("/storage-demand-analysis", response_model=List[StorageAnalysisResponse])
async def analyze_storage_demand():
    """
    Analyze all storage locations and predict demand trends for their product categories
    based on recent news sentiment analysis.
    """
    try:
        storage_locations = load_storage_locations()
        analysis_results = []

        for location in storage_locations:
            location_predictions = []
            location_polarities = []

            # Analyze each product category in the location
            for product_category in location["items"]:
                # Fetch news for the product category
                articles = fetch_news(product_category)
                
                if not articles:
                    # If no news found, create a neutral prediction
                    prediction = DemandPrediction(
                        product_category=product_category,
                        sentiment="Neutral",
                        polarity_score=0.0,
                        demand_trend="Stable",
                        confidence="Low",
                        recent_news_count=0
                    )
                    location_predictions.append(prediction)
                    location_polarities.append(0.0)
                    continue

                # Analyze sentiment for each article
                article_sentiments = []
                for article in articles:
                    content = article.get("description") or article.get("title", "")
                    if content:
                        sentiment_result = analyze_sentiment(content)
                        article_sentiments.append(sentiment_result["polarity_score"])

                # Calculate average sentiment for this product category
                if article_sentiments:
                    avg_polarity = sum(article_sentiments) / len(article_sentiments)
                    location_polarities.append(avg_polarity)
                    
                    # Determine sentiment and demand trend
                    if avg_polarity > 0.2:
                        sentiment = "Positive"
                        demand_trend = "Increasing"
                        confidence = "High" if avg_polarity > 0.5 else "Medium"
                    elif avg_polarity < -0.2:
                        sentiment = "Negative"
                        demand_trend = "Decreasing"
                        confidence = "High" if avg_polarity < -0.5 else "Medium"
                    else:
                        sentiment = "Neutral"
                        demand_trend = "Stable"
                        confidence = "Medium"
                else:
                    avg_polarity = 0.0
                    sentiment = "Neutral"
                    demand_trend = "Stable"
                    confidence = "Low"

                prediction = DemandPrediction(
                    product_category=product_category,
                    sentiment=sentiment,
                    polarity_score=avg_polarity,
                    demand_trend=demand_trend,
                    confidence=confidence,
                    recent_news_count=len(articles)
                )
                location_predictions.append(prediction)

            # Calculate overall location sentiment
            if location_polarities:
                overall_polarity = sum(location_polarities) / len(location_polarities)
                overall_sentiment = (
                    "Positive" if overall_polarity > 0.2
                    else "Negative" if overall_polarity < -0.2
                    else "Neutral"
                )
            else:
                overall_polarity = 0.0
                overall_sentiment = "Neutral"

            # Create response for this location
            location_analysis = StorageAnalysisResponse(
                location_id=location["id"],
                address=location["address"],
                coordinates=location["coordinates"],
                demand_predictions=location_predictions,
                overall_location_sentiment=overall_sentiment,
                average_polarity_score=overall_polarity,
                analysis_timestamp=datetime.utcnow().isoformat() + "Z"
            )
            
            analysis_results.append(location_analysis)

        # Save analysis results to file
        Path("output").mkdir(exist_ok=True)
        output_data = {
            "generatedAt": datetime.utcnow().isoformat() + "Z",
            "total_locations": len(analysis_results),
            "storage_demand_analysis": [result.dict() for result in analysis_results]
        }
        
        with open("output/storage_demand_analysis.json", "w") as f:
            json.dump(output_data, f, indent=2)

        return analysis_results

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing storage demand: {str(e)}")

@router.get("/storage-locations")
async def get_all_storage_locations():
    """
    Get all storage locations with their basic information.
    """
    try:
        storage_locations = load_storage_locations()
        return {
            "total_locations": len(storage_locations),
            "locations": storage_locations,
            "retrieved_at": datetime.utcnow().isoformat() + "Z"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving storage locations: {str(e)}")

@router.get("/storage-location/{location_id}")
async def get_storage_location(location_id: int):
    """
    Get a specific storage location by ID.
    """
    try:
        storage_locations = load_storage_locations()
        location = next((loc for loc in storage_locations if loc["id"] == location_id), None)
        
        if not location:
            raise HTTPException(status_code=404, detail=f"Storage location with ID {location_id} not found")
        
        return location
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving storage location: {str(e)}") 