from models import SentimentModel

sentiment_model = SentimentModel()  # This loads only once

def analyze_sentiment(text):
    return sentiment_model.analyze(text)
