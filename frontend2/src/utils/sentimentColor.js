export const getSentimentColor = (sentiment, polarity) => {
  if (sentiment === "Positive") {
    return polarity > 0.9 ? "green" : "#b2ff59"; // bright green vs lime
  }
  if (sentiment === "Negative") {
    return polarity < -0.9 ? "red" : "orange";
  }
  return "gray";
};
