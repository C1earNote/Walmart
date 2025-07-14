import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { getSentimentColor } from "../utils/sentimentColor";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const SupplierMap = ({ suppliers }) => {
  const [stateCoords, setStateCoords] = useState({});
  const [readySuppliers, setReadySuppliers] = useState([]);

  useEffect(() => {
    // Load state coordinates from public/in.json
    fetch("/in.json")
      .then((res) => res.json())
      .then((states) => {
        // Build a lookup: state name (case-insensitive) => [lat, lng]
        const lookup = {};
        states.forEach((state) => {
          lookup[state["State.Name"].trim().toLowerCase()] = [parseFloat(state.latitude), parseFloat(state.longitude)];
        });
        setStateCoords(lookup);
      });
  }, []);

  useEffect(() => {
    // When stateCoords or suppliers change, build the list of suppliers with coordinates
    if (Object.keys(stateCoords).length === 0 || suppliers.length === 0) {
      setReadySuppliers([]);
      return;
    }
    const withCoords = suppliers.map((supplier) => {
      const coords = stateCoords[supplier.state?.trim().toLowerCase()];
      if (!coords) {
        console.warn(`No coordinates found for state: ${supplier.state}`);
        return null;
      }
      return { ...supplier, coords };
    }).filter(Boolean);
    setReadySuppliers(withCoords);
  }, [stateCoords, suppliers]);

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
      {readySuppliers.map((supplier, i) => {
        const color = getSentimentColor(supplier.overall_sentiment, supplier.average_polarity_score);
        const icon = new L.DivIcon({
          className: "custom-icon",
          html: `<div style="background:${color};width:18px;height:18px;border-radius:50%;border:2px solid white;"></div>`,
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        });
        return (
          <Marker key={i} position={supplier.coords} icon={icon}>
            <Popup eventHandlers={{ add: () => console.log('Popup for', supplier.supplier_name, 'articles:', supplier.articles) }}>
              <strong>{supplier.supplier_name}</strong><br />
              <span>{supplier.city}, {supplier.state}</span><br />
              <span>{supplier.category}</span><br />
              <span>Sentiment: {supplier.overall_sentiment}</span><br />
              <span>Polarity: {supplier.average_polarity_score?.toFixed(2)}</span>
              {supplier.articles && supplier.articles.length > 0 && (
                <div>
                  <strong>Headlines:</strong>
                  <ul>
                    {supplier.articles.map((a, j) => (
                      <li key={j}>
                        <a href={a.url} target="_blank" rel="noopener noreferrer">{a.title}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default SupplierMap;