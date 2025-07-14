import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getSentimentColor } from "../utils/sentimentColor";

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
        let color;
        if (supplier.risk_level) {
          if (typeof supplier.risk_level === 'string') {
            const risk = supplier.risk_level.toLowerCase();
            if (risk === 'high') color = 'red';
            else if (risk === 'medium') color = 'orange';
            else if (risk === 'low') color = 'green';
            else color = '#1976d2';
          } else {
            color = '#1976d2';
          }
        } else {
          color = getSentimentColor(supplier.overall_sentiment, supplier.average_polarity_score);
        }
        const icon = new L.DivIcon({
          className: "custom-icon",
          html: `<div style="background:${color};width:18px;height:18px;border-radius:50%;border:2px solid white;"></div>`,
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        });
        return (
          <Marker key={i} position={supplier.coords} icon={icon}>
            <Popup>
              <strong>{supplier.supplier_name || supplier.supplier}</strong><br />
              <span>{supplier.state}</span><br />
              <span>{supplier.category || supplier.category_name}</span><br />
              {supplier.issue && <><span><b>Issue:</b> {supplier.issue}</span><br /></>}
              {supplier.risk_level && <><span><b>Risk Level:</b> {supplier.risk_level}</span><br /></>}
              {supplier.reason && <><span><b>Reason:</b> {supplier.reason}</span><br /></>}
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default SupplierMap;