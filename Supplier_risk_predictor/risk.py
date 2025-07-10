from config import RISK_KEYWORDS

def analyze_risk(text):
    text_lower = text.lower()
    risk_hits = [kw for kw in RISK_KEYWORDS if kw in text_lower]
    score = min(len(risk_hits) * 2, 10)
    return {"keywords": risk_hits, "risk_score": score}
