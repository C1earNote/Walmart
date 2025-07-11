from transformers import pipeline

class SentimentModel:
    def __init__(self):
        self.model = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")

    def analyze(self, text):
        try:
            result = self.model(text[:512])[0]
            label = result["label"]
            score = result["score"]
            return {
                "sentiment": "Negative" if label == "NEGATIVE" else "Positive",
                "polarity_score": -score if label == "NEGATIVE" else score
            }
        except Exception as e:
            print("Sentiment analysis error:", e)
            return {"sentiment": "Neutral", "polarity_score": 0.0}
