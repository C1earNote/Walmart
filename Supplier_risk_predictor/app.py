from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import json
from datetime import datetime
from pathlib import Path
import os
import requests
from dotenv import load_dotenv

from news import fetch_news
from risk import analyze_risk
from sentiment import analyze_sentiment

router = APIRouter()

with open("walmart_india_suppliers_final.json") as f:
    SUPPLIERS = json.load(f)["suppliers"]

# Pydantic model for request validation
class SupplierRequest(BaseModel):
    supplier_name: str
    state: str
    city: str
    category_name: str

# Extend SupplierRequest to include latitude and longitude for LLM analysis
class SupplierLLMRequest(BaseModel):
    supplier_name: str
    state: str
    city: str
    category_name: str
    latitude: float
    longitude: float

load_dotenv()
WEATHER_API_KEY = os.getenv("WEATHER_API_KEY")
WEATHER_API_URL = "https://api.openweathermap.org/data/2.5/weather"

def fetch_road_details(state, lat, lon):
    params = {
        "lat": lat,
        "lon": lon,
        "appid": WEATHER_API_KEY,
        "units": "metric"
    }
    response = requests.get(WEATHER_API_URL, params=params)
    if response.status_code == 200:
        data = response.json()
        return {
            "weather": data.get("weather", [{}])[0].get("description", "N/A"),
            "temp": data.get("main", {}).get("temp", "N/A"),
            "humidity": data.get("main", {}).get("humidity", "N/A"),
            "wind_speed": data.get("wind", {}).get("speed", "N/A")
        }
    return {"error": f"Failed to fetch road/weather details for {state}"}

def llm_generate_risk_report(supplier_name, news_json, road_json):
    api_key = os.getenv("TOGETHER_API_KEY")
    llm_url = "https://api.together.xyz/v1/chat/completions"
    import json as _json
    prompt = f"""
You are a JSON-generating API that analyzes both recent news and weather data related to suppliers.

Your task is to return ONLY a valid JSON object for each supplier using the format below.

- Use the news content to detect issues such as strikes, financial trouble, factory incidents, legal actions, or operational disruptions.
- Use weather data to identify environmental threats like floods, storms, extreme heat, or rainfall affecting operations or transport.
- Determine the overall risk level based on the severity and combined impact of both sources.
- Assess any potential supply chain impacts and include a clear explanation in the `reason` field if disruptions are likely.
- The state field should indicate the Indian state where the supplier is physically located (e.g., Maharashtra, Tamil Nadu, Gujarat, etc.) 

STRICTLY FOLLOW this JSON structure. Return only valid JSON (no extra text or formatting comments):

{{
  "supplier": "<supplier name>",
  "issue": "<short summary of the most relevant issue>",
  "risk_level": "<low|medium|high>",
  "state": "<Indian state where the supplier is located>",
  "reason": "<detailed reason combining both news events and weather impact, if applicable>"
}}
Supplier: {supplier_name}
News JSON: {_json.dumps(news_json)}
Road/Weather JSON: {_json.dumps(road_json)}
Analyze the above and return the JSON as specified.
"""
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "mistralai/Mistral-7B-Instruct-v0.1",
        "messages": [
            {"role": "system", "content": "You are a JSON API."},
            {"role": "user", "content": prompt}
        ],
        "max_tokens": 512,
        "temperature": 0.2
    }
    response = requests.post(llm_url, headers=headers, json=payload)
    if response.status_code == 200:
        try:
            content = response.json()["choices"][0]["message"]["content"]
            return _json.loads(content)
        except Exception as e:
            return {
                "supplier": supplier_name,
                "issue": "LLM response error",
                "risk_level": "high",
                "reason": f"Failed to parse LLM response: {str(e)}"
            }
    else:
        return {
            "supplier": supplier_name,
            "issue": "LLM API error",
            "risk_level": "high",
            "reason": f"HTTP {response.status_code}: {response.text}"
        }

# New endpoint for individual supplier analysis
@router.post("/analyze-supplier")
async def analyze_individual_supplier(supplier_data: SupplierRequest):
    try:
        articles = fetch_news(supplier_data.supplier_name)
        processed_articles = []

        for article in articles:
            content = article.get("description") or article.get("title", "")
            risk = analyze_risk(content)
            sentiment = analyze_sentiment(content)
            processed_articles.append({
                "title": article.get("title"),
                "url": article.get("url"),
                "publishedAt": article.get("publishedAt"),
                "risk_keywords": risk["keywords"],
                "risk_score": risk["risk_score"],
                "sentiment": sentiment["sentiment"],
                "polarity_score": sentiment["polarity_score"]
            })

        avg_polarity = sum([a["polarity_score"] for a in processed_articles]) / len(processed_articles) if processed_articles else 0.0
        overall_sentiment = (
            "Negative" if avg_polarity < -0.2
            else "Positive" if avg_polarity > 0.2
            else "Neutral"
        )

        response = {
            "supplier_name": supplier_data.supplier_name,
            "state": supplier_data.state,
            "city": supplier_data.city,
            "category_name": supplier_data.category_name,
            "overall_sentiment": overall_sentiment,
            "average_polarity_score": avg_polarity,
            "articles": processed_articles,
            "generatedAt": datetime.utcnow().isoformat() + "Z"
        }

        # Optionally save to file
        Path("output").mkdir(exist_ok=True)
        filename = f"output/supplier_{supplier_data.supplier_name.replace(' ', '_').lower()}_analysis.json"
        with open(filename, "w") as f:
            json.dump(response, f, indent=2)

        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing supplier: {str(e)}")

@router.post("/analyze-supplier-llm")
async def analyze_supplier_llm(supplier: SupplierLLMRequest):
    try:
        articles = fetch_news(supplier.supplier_name)
        processed_news = []
        for article in articles:
            content = article.get("description") or article.get("title", "")
            risk = analyze_risk(content)
            sentiment = analyze_sentiment(content)
            processed_news.append({
                "title": article.get("title"),
                "url": article.get("url"),
                "publishedAt": article.get("publishedAt"),
                "risk_keywords": risk["keywords"],
                "risk_score": risk["risk_score"],
                "sentiment": sentiment["sentiment"],
                "polarity_score": sentiment["polarity_score"]
            })
        road_details = fetch_road_details(supplier.state, supplier.latitude, supplier.longitude)
        # Pass the actual state to the LLM prompt by including it in the news_json
        llm_report = llm_generate_risk_report(
            supplier_name=supplier.supplier_name,
            news_json={"articles": processed_news, "state": supplier.state},
            road_json=road_details
        )
        return llm_report
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in LLM supplier analysis: {str(e)}")

@router.get("/analyze-all-suppliers-llm")
def analyze_all_suppliers_llm():
    try:
        with open("walmart_india_suppliers_final.json") as f:
            suppliers = json.load(f)["suppliers"]
        results = []
        for supplier in suppliers:
            articles = fetch_news(supplier["supplier_name"])
            processed_news = []
            for article in articles:
                content = article.get("description") or article.get("title", "")
                risk = analyze_risk(content)
                sentiment = analyze_sentiment(content)
                processed_news.append({
                    "title": article.get("title"),
                    "url": article.get("url"),
                    "publishedAt": article.get("publishedAt"),
                    "risk_keywords": risk["keywords"],
                    "risk_score": risk["risk_score"],
                    "sentiment": sentiment["sentiment"],
                    "polarity_score": sentiment["polarity_score"]
                })
            road_details = fetch_road_details(supplier["state"], supplier["latitude"], supplier["longitude"])
            # Pass the actual state to the LLM prompt by including it in the news_json
            llm_report = llm_generate_risk_report(
                supplier_name=supplier["supplier_name"],
                news_json={"articles": processed_news, "state": supplier["state"]},
                road_json=road_details
            )
            results.append(llm_report)
        Path("output").mkdir(exist_ok=True)
        with open("output/all_suppliers_analysis_llm.json", "w") as f:
            json.dump(results, f, indent=2)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in LLM analysis for all suppliers: {str(e)}")
