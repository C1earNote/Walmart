import requests
from config import GNEWS_API_KEY, GNEWS_ENDPOINT
import time 

def fetch_news(supplier_name):
    time.sleep(1)  
    response = requests.get(GNEWS_ENDPOINT, params={
        "q": supplier_name,
        "token": GNEWS_API_KEY,
        "lang": "en",
        "sortby": "publishedAt",
        "max": 3
    })
    if response.status_code == 200:
        data = response.json()
        articles = data.get("articles", [])
        # Convert GNews format to match expected format
        formatted_articles = []
        for article in articles:
            formatted_articles.append({
                "title": article.get("title", ""),
                "description": article.get("description", ""),
                "url": article.get("url", ""),
                "publishedAt": article.get("publishedAt", ""),
                "source": article.get("source", {}).get("name", "")
            })
        return formatted_articles
    print(f"Error fetching news for {supplier_name}: {response.status_code}")
    return []




