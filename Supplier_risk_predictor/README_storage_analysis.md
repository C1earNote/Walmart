# Storage Analysis API

This module provides endpoints for analyzing storage locations and predicting demand trends for product categories based on news sentiment analysis.

## Features

- **Storage Location Management**: Retrieve all storage locations or specific locations by ID
- **Demand Prediction**: Analyze news sentiment for product categories to predict future demand trends
- **Comprehensive Analysis**: Get detailed insights including sentiment scores, confidence levels, and demand trends

## Endpoints

### 1. Get All Storage Locations
```
GET /api/storage-locations
```
Returns all storage locations with their basic information.

**Response:**
```json
{
  "total_locations": 10,
  "locations": [
    {
      "id": 1,
      "address": "1st & 4th Floor, Orchid Center, Golf Course Road, Sector 53, Gurgaon, Haryana",
      "coordinates": {
        "latitude": 28.4595,
        "longitude": 77.0266
      },
      "items": ["Electronics", "Home Appliances", "Clothing"]
    }
  ],
  "retrieved_at": "2024-01-15T10:30:00Z"
}
```

### 2. Get Storage Location by ID
```
GET /api/storage-location/{location_id}
```
Returns a specific storage location by its ID.

### 3. Storage Demand Analysis
```
GET /api/storage-demand-analysis
```
Analyzes all storage locations and predicts demand trends for their product categories based on recent news sentiment analysis.

**Response:**
```json
[
  {
    "location_id": 1,
    "address": "1st & 4th Floor, Orchid Center, Golf Course Road, Sector 53, Gurgaon, Haryana",
    "coordinates": {
      "latitude": 28.4595,
      "longitude": 77.0266
    },
    "demand_predictions": [
      {
        "product_category": "Electronics",
        "sentiment": "Positive",
        "polarity_score": 0.65,
        "demand_trend": "Increasing",
        "confidence": "High",
        "recent_news_count": 3
      }
    ],
    "overall_location_sentiment": "Positive",
    "average_polarity_score": 0.45,
    "analysis_timestamp": "2024-01-15T10:30:00Z"
  }
]
```

## Demand Trend Classification

The API classifies demand trends based on sentiment polarity scores:

- **Increasing Demand**: Polarity score > 0.2 (Positive sentiment)
- **Decreasing Demand**: Polarity score < -0.2 (Negative sentiment)
- **Stable Demand**: Polarity score between -0.2 and 0.2 (Neutral sentiment)

## Confidence Levels

- **High**: Polarity score > 0.5 or < -0.5
- **Medium**: Polarity score between 0.2-0.5 or -0.2 to -0.5
- **Low**: Polarity score between -0.2 and 0.2

## Usage Example

```python
import requests

# Get storage demand analysis
response = requests.get("http://localhost:8000/api/storage-demand-analysis")
analysis_results = response.json()

# Process results
for location in analysis_results:
    print(f"Location {location['location_id']}: {location['address']}")
    print(f"Overall Sentiment: {location['overall_location_sentiment']}")
    
    for prediction in location['demand_predictions']:
        print(f"  {prediction['product_category']}: {prediction['demand_trend']} "
              f"(confidence: {prediction['confidence']})")
```

## Output Files

The analysis results are automatically saved to:
- `output/storage_demand_analysis.json` - Complete analysis results

## Dependencies

- FastAPI
- Pydantic
- News API (for fetching recent news)
- Sentiment Analysis Model (distilbert-base-uncased-finetuned-sst-2-english)

## Testing

Run the test script to verify the endpoints:

```bash
python test_storage_analysis.py
```

Make sure the FastAPI server is running on `http://localhost:8000` before running the tests. 