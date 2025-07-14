import json
import requests
from datetime import datetime
from pathlib import Path
from transformers import pipeline
import os
from dotenv import load_dotenv

# --- Load Supplier Data ---
with open("walmart_india_suppliers_final.json") as f:
    data = json.load(f)

suppliers = data["suppliers"]

# --- Expanded Risk Keywords ---
RISK_KEYWORDS = [
    "strike", "protest", "labour unrest", "shutdown", "fire", "flood",
    "bharat bandh", "curfew", "rain havoc", "roadblock", "cyclone",
    "factory accident", "supply chain disruption", "violence", "riot",
    "earthquake", "landslide", "corruption", "economic slowdown",
    "political instability", "commodity price hike", "drought",
    "heatwave", "strike notice", "legal action"
]

# --- Hugging Face Sentiment Pipeline ---
sentiment_pipeline = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")


# --- News API Configuration ---
load_dotenv()  # Load environment variables from .env file if exists
NEWS_API_KEY = os.getenv("NEWS_API_KEY")  # Replace with your actual API key
NEWS_ENDPOINT = "https://newsapi.org/v2/everything"

# --- Risk Analysis ---
def analyze_risk(text):
    text_lower = text.lower()
    risk_hits = [kw for kw in RISK_KEYWORDS if kw in text_lower]
    score = min(len(risk_hits) * 2, 10)  # cap at 10
    return {
        "keywords": risk_hits,
        "risk_score": score
    }

# --- Sentiment Analysis ---
def analyze_sentiment(text):
    try:
        result = sentiment_pipeline(text[:512])[0]  # limit to 512 tokens
        sentiment = result["label"]
        score = result["score"]
        if sentiment == "NEGATIVE":
            return {"sentiment": "Negative", "polarity_score": -score}
        else:
            return {"sentiment": "Positive", "polarity_score": score}
    except Exception as e:
        print("Sentiment analysis error:", e)
        return {"sentiment": "Neutral", "polarity_score": 0.0}

# --- News Fetching ---
def fetch_news_for_supplier(supplier_name):
    response = requests.get(NEWS_ENDPOINT, params={
        "q": supplier_name,
        "apiKey": NEWS_API_KEY,
        "language": "en",
        "sortBy": "publishedAt",
        "pageSize": 3
    })
    if response.status_code == 200:
        return response.json().get("articles", [])
    else:
        print(f" Error fetching news for {supplier_name}: {response.status_code}")
        return []

# --- Main Risk Evaluation Loop ---
risk_results = []
for supplier in suppliers:
    name = supplier["supplier_name"]
    print(f"\n🔍 Processing: {name}")
    articles = fetch_news_for_supplier(name)
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

    

    polarity_scores = [a["polarity_score"] for a in processed_articles]
    average_polarity = sum(polarity_scores) / len(polarity_scores) if polarity_scores else 0.0

    # --- Determine overall sentiment label ---
    if average_polarity < -0.2:
        overall_sentiment = "Negative"
    elif average_polarity > 0.2:
        overall_sentiment = "Positive"
    else:
        overall_sentiment = "Neutral"

    result = {
        "supplier_name": name,
        "state": supplier["state"],
        "city": supplier["city"],
        "category": supplier["category_name"],
        "overall_sentiment": overall_sentiment,
        "average_polarity_score": average_polarity,
        "articles": processed_articles
    }
    risk_results.append(result)

# --- Save Risk Report ---
output = {
    "generatedAt": datetime.utcnow().isoformat() + "Z",
    "supplier_risk_report": risk_results
}

Path("output").mkdir(exist_ok=True)
with open("output/supplier_risk_report.json", "w") as f:
    json.dump(output, f, indent=2)

print("\n✅ Supplier risk report saved to output/supplier_risk_report.json")
