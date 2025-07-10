# setup.py (optional pre-initialization if needed elsewhere)
from models import SentimentModel

def setup():
    print("Loading sentiment model...")
    SentimentModel()  # Load once
    print("Model loaded.")
