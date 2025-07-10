// src/services/api.js

export const fetchSupplierRiskData = async () => {
  // Simulating a delay like a real API call
  await new Promise((res) => setTimeout(res, 500));

  return {
    generatedAt: new Date().toISOString(),
    supplier_risk_report: [
      {
        supplier_name: "Welspun India Ltd",
        state: "Gujarat",
        city: "Anjar",
        category: "Apparel & Textiles",
        overall_sentiment: "Positive",
        average_polarity_score: 0.28,
        articles: [],
      },
      {
        supplier_name: "LT Foods",
        state: "Haryana",
        city: "Sonipat",
        category: "Spices & Grocery",
        overall_sentiment: "Negative",
        average_polarity_score: -0.98,
        articles: [],
      },
      {
        supplier_name: "Aniket Metals Moradabad",
        state: "Uttar Pradesh",
        city: "Moradabad",
        category: "Furniture & Home",
        overall_sentiment: "Neutral",
        average_polarity_score: 0.0,
        articles: [],
      },
      {
        supplier_name: "Sambhav Group",
        state: "Maharashtra",
        city: "Mumbai",
        category: "Apparel & Textiles",
        overall_sentiment: "Negative",
        average_polarity_score: -0.99,
        articles: [],
      },
      {
        supplier_name: "Shree Renuka Sugars Ltd.",
        state: "Karnataka",
        city: "Bangalore",
        category: "Spices & Grocery",
        overall_sentiment: "Negative",
        average_polarity_score: -0.98,
        articles: [],
      },
      {
        supplier_name: "Global Green Company",
        state: "Karnataka",
        city: "Tumkur",
        category: "Spices & Grocery",
        overall_sentiment: "Positive",
        average_polarity_score: 0.99,
        articles: [],
      },
    ],
  };
};
