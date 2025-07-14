import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const DemandMap = ({ demands }) => {
  const [regionCoords, setRegionCoords] = useState({});
  const [readyDemands, setReadyDemands] = useState([]);

  useEffect(() => {
    // Load region coordinates from public/in.json (reuse state coords for demo)
    fetch("/in.json")
      .then((res) => res.json())
      .then((regions) => {
        const lookup = {};
        regions.forEach((region) => {
          lookup[region["State.Name"].trim().toLowerCase()] = [parseFloat(region.latitude), parseFloat(region.longitude)];
        });
        setRegionCoords(lookup);
      });
  }, []);

  useEffect(() => {
    if (Object.keys(regionCoords).length === 0 || demands.length === 0) {
      setReadyDemands([]);
      return;
    }
    const withCoords = demands.map((demand) => {
      const coords = regionCoords[demand.address?.trim().toLowerCase()];
      if (!coords) {
        console.warn(`No coordinates found for region: ${demand.address}`);
        return null;
      }
      return { ...demand, coords };
    }).filter(Boolean);
    setReadyDemands(withCoords);
  }, [regionCoords, demands]);

  return (
    <MapContainer
      center={[22.5937, 78.9629]}
      zoom={5.2}
      className="justmap"
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="http://osm.org">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {readyDemands.map((demand, i) => {
        const icon = new L.DivIcon({
          className: "custom-icon",
          html: `<div style="background:#1976d2;width:18px;height:18px;border-radius:50%;border:2px solid white;"></div>`,
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        });
        return (
          <Marker key={i} position={demand.coords || [demand.coordinates.latitude, demand.coordinates.longitude]} icon={icon}>
            <Popup>
              <strong>{demand.address}</strong><br />
              <span>Sentiment: {demand.overall_location_sentiment}</span><br />
              <span>Avg Polarity: {demand.average_polarity_score?.toFixed(2)}</span><br />
              <b>Demand Predictions:</b>
              <ul>
                {demand.demand_predictions.map((pred, idx) => (
                  <li key={idx}>
                    <b>{pred.product_category}</b> - {pred.sentiment}, {pred.demand_trend}, Confidence: {pred.confidence}.
                  </li>
                ))}
              </ul>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default DemandMap;
