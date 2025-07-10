import React, { useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";
import { cities } from "../data/cities";
import { fetchCityInfo } from "../api/fetchCityInfo";

const INDIA_TOPO_URL =
  "https://cdn.jsdelivr.net/gh/udit-001/india-maps-data@main/topojson/india.json";

const IndiaMap = () => {
  const [selectedCity, setSelectedCity] = useState(null);
  const [cityInfo, setCityInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCityClick = async (city) => {
    setSelectedCity(city.name);
    setLoading(true);
    setCityInfo(null);

    const data = await fetchCityInfo(city.id);
    setCityInfo(data);
    setLoading(false);
  };

  return (
    <div>
      <ComposableMap projection="geoMercator" width={800} height={600}>
        <Geographies geography={INDIA_TOPO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                style={{
                  default: { fill: "#E0E0E0", stroke: "#607D8B", strokeWidth: 0.5 },
                  hover: { fill: "#90CAF9" },
                  pressed: { fill: "#42A5F5" },
                }}
              />
            ))
          }
        </Geographies>

        {cities.map((city) => (
          <Marker key={city.id} coordinates={city.coordinates}>
            <circle
              r={6}
              fill="#FF5722"
              stroke="#fff"
              strokeWidth={2}
              onClick={() => handleCityClick(city)}
              style={{ cursor: "pointer" }}
            />
            <text
              textAnchor="middle"
              y={-10}
              style={{ fontFamily: "Arial", fontSize: 10, fill: "#333" }}
            >
              {city.name}
            </text>
          </Marker>
        ))}
      </ComposableMap>

      <div style={{ marginTop: "20px" }}>
        {selectedCity && <h3>{selectedCity}</h3>}
        {loading && <p>Loading city info...</p>}
        {cityInfo && (
          cityInfo.error ? (
            <p style={{ color: "red" }}>{cityInfo.error}</p>
          ) : (
            <pre>{JSON.stringify(cityInfo, null, 2)}</pre>
          )
        )}
      </div>
    </div>
  );
};

export default IndiaMap;