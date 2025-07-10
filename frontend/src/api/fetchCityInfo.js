// src/api/fetchCityInfo.js

const mockData = {
  delhi: {
    population: "32 million",
    description: "Capital of India. Known for politics, culture, and history.",
    famous: ["Red Fort", "India Gate", "Qutub Minar"],
  },
  mumbai: {
    population: "20 million",
    description: "Financial capital of India. Known for Bollywood and business.",
    famous: ["Gateway of India", "Marine Drive", "Elephanta Caves"],
  },
  bengaluru: {
    population: "13 million",
    description: "Tech hub of India. Known as Silicon Valley of India.",
    famous: ["Lalbagh", "Vidhana Soudha", "Cubbon Park"],
  },
  kolkata: {
    population: "15 million",
    description: "Cultural capital. Known for literature, arts, and sweets.",
    famous: ["Victoria Memorial", "Howrah Bridge", "Dakshineswar Temple"],
  },
};

export async function fetchCityInfo(cityId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (mockData[cityId]) {
        resolve(mockData[cityId]);
      } else {
        resolve({ error: "City not found" });
      }
    }, 800); // simulate network delay
  });
}
