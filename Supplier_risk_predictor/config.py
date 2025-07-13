import os
from dotenv import load_dotenv

load_dotenv()

GNEWS_API_KEY = os.getenv("GNEWS_API_KEY")
GNEWS_ENDPOINT = "https://gnews.io/api/v4/search"
WEATHER_API_KEY = os.getenv("WEATHER_API_KEY")
NEWS_API_KEY = os.getenv("NEWS_API_KEY")
NEWS_ENDPOINT = "https://newsapi.org/v2/everything"

RISK_KEYWORDS = [
    "strike", "protest", "labour unrest", "shutdown", "fire", "flood",
    "bharat bandh", "curfew", "rain havoc", "roadblock", "cyclone",
    "factory accident", "supply chain disruption", "violence", "riot",
    "earthquake", "landslide", "corruption", "economic slowdown",
    "political instability", "commodity price hike", "drought",
    "heatwave", "strike notice", "legal action"
]
