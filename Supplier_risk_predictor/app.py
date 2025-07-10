from fastapi import APIRouter
import json
from datetime import datetime
from pathlib import Path

from news import fetch_news
from risk import analyze_risk
from sentiment import analyze_sentiment

router = APIRouter()

with open("walmart_india_suppliers_final.json") as f:
    SUPPLIERS = json.load(f)["suppliers"]

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
