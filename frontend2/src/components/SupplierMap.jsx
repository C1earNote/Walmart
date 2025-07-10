import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { getSentimentColor } from "../utils/sentimentColor";
import { fetchSupplierRiskData } from "../services/api"; // 🔁 using mock API now
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const SupplierMap = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchSupplierRiskData()
      .then((res) => setData(res.supplier_risk_report))
      .catch(console.error);
  }, []);

  const cityCoords = {
    Mumbai: [19.0760, 72.8777],
    Bangalore: [12.9716, 77.5946],
    Sonipat: [28.9958, 77.0114],
    Anjar: [23.1135, 70.0264],
    Tumkur: [13.3409, 77.1010],
    Moradabad: [28.8386, 78.7733],
    // Add more if needed
  };

  return (
    <div style={{ width: "100vw", maxWidth: "100%", margin: 0, padding: 0 }}>
      <MapContainer
        center={[22.5937, 78.9629]}
        zoom={5.2}
        style={{ height: "600px", width: "100vw" }}
      >
        <TileLayer
          attribution='&copy; <a href="http://osm.org">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {data.map((supplier, i) => {
          const coords = cityCoords[supplier.city];
          if (!coords) return null;

          const color = getSentimentColor(
            supplier.overall_sentiment,
            supplier.average_polarity_score
          );

          const icon = new L.DivIcon({
            className: "custom-icon",
            html: `<div style="background:${color};width:16px;height:16px;border-radius:50%;border:2px solid white;"></div>`,
          });

          return (
            <Marker key={i} position={coords} icon={icon}>
              <Popup>
                <strong>{supplier.supplier_name}</strong>
                <br />
                Category: {supplier.category}
                <br />
                Sentiment: {supplier.overall_sentiment}
                <br />
                Polarity: {supplier.average_polarity_score.toFixed(2)}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default SupplierMap;