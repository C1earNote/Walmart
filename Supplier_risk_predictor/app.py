from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import json
from datetime import datetime
from pathlib import Path

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

@router.get("/risk-report")
def generate_supplier_risk_report():
    risk_results = []

    for supplier in SUPPLIERS:
        name = supplier["supplier_name"]
        articles = fetch_news(name)
        processed = []

        for article in articles:
            content = article.get("description") or article.get("title", "")
            risk = analyze_risk(content)
            sentiment = analyze_sentiment(content)
            processed.append({
                "title": article.get("title"),
                "url": article.get("url"),
                "publishedAt": article.get("publishedAt"),
                "risk_keywords": risk["keywords"],
                "risk_score": risk["risk_score"],
                "sentiment": sentiment["sentiment"],
                "polarity_score": sentiment["polarity_score"]
            })

        avg_polarity = sum([a["polarity_score"] for a in processed]) / len(processed) if processed else 0.0
        overall = (
            "Negative" if avg_polarity < -0.2
            else "Positive" if avg_polarity > 0.2
            else "Neutral"
        )

        risk_results.append({
            "supplier_name": name,
            "state": supplier["state"],
            "city": supplier["city"],
            "category": supplier["category_name"],
            "overall_sentiment": overall,
            "average_polarity_score": avg_polarity,
            "articles": processed
        })

    report = {
        "generatedAt": datetime.utcnow().isoformat() + "Z",
        "supplier_risk_report": risk_results
    }

    Path("output").mkdir(exist_ok=True)
    with open("output/supplier_risk_report.json", "w") as f:
        json.dump(report, f, indent=2)

    return report

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
