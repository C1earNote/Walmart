import requests
from config import NEWS_API_KEY, NEWS_ENDPOINT
import time 
def fetch_news(supplier_name):
    time.sleep(1)  
    response = requests.get(NEWS_ENDPOINT, params={
        "q": supplier_name,
        "apiKey": NEWS_API_KEY,
        "language": "en",
        "sortBy": "publishedAt",
        "pageSize": 3
    })
    if response.status_code == 200:
        return response.json().get("articles", [])
    print(f"Error fetching news for {supplier_name}: {response.status_code}")
    return []




