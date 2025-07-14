import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './App.css';
import DemandMap from './components/DemandMap';

function Navbar({ onShowAllDemands }) {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <span className="navbar-title">Walmart Demand Dashboard</span>
      </div>
      <div className="navbar-links">
        <Link to="/" className="navbar-link">Go to Supplier Page</Link>
        <a href="#" className="navbar-link" onClick={e => { e.preventDefault(); onShowAllDemands(); }}>Show all demand</a>
      </div>
    </nav>
  );
}

function Demand() {
  const [demands, setDemands] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDemand, setSelectedDemand] = useState(null);

  useEffect(() => {
    fetch('/demand-api-response.json')
      .then(res => res.json())
      .then(data => setDemands(data))
      .catch(() => setDemands([]));
  }, []);

  const handleShowAllDemands = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  const handleDemandClick = (demand) => setSelectedDemand(demand);
  const handleCloseDemandDetail = () => setSelectedDemand(null);

  return (
    <>
      <Navbar onShowAllDemands={handleShowAllDemands} />
      {showModal && !selectedDemand && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseModal}>&times;</button>
            <h2>All Demand Locations</h2>
            <ul className="modal-supplier-list">
              {demands.map((d, i) => (
                <li key={i} className="modal-supplier-item" onClick={() => handleDemandClick(d)} style={{cursor:'pointer'}}>
                  <strong>{d.address}</strong><br/>
                  <span>Sentiment: {d.overall_location_sentiment}</span><br/>
                  <span>Avg Polarity: {d.average_polarity_score?.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      {selectedDemand && (
        <div className="modal-overlay" onClick={handleCloseDemandDetail}>
          <div className="modal-content supplier-detail-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseDemandDetail}>&times;</button>
            <h2>Demand Location Details</h2>
            <div className="supplier-detail-fields">
              <p><b>Address:</b> {selectedDemand.address}</p>
              <p><b>Sentiment:</b> {selectedDemand.overall_location_sentiment}</p>
              <p><b>Avg Polarity:</b> {selectedDemand.average_polarity_score?.toFixed(2)}</p>
              <p><b>Demand Predictions:</b></p>
              <ul>
                {selectedDemand.demand_predictions.map((pred, idx) => (
                  <li key={idx}>
                    <b>{pred.product_category}</b> - {pred.sentiment}, {pred.demand_trend}, Confidence: {pred.confidence}, News: {pred.recent_news_count}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      <div className="main-layout">
        <DemandMap demands={demands} />
        <div className="sidebar-container">
          <h2 className="sidebar-title">Demand Management</h2>
          <div className="sidebar-list">
            <h3>Current Demand Locations</h3>
            <ul>
              {demands.map((d, i) => (
                <li key={i} className="supplier-list-item" onClick={() => handleDemandClick(d)} style={{cursor:'pointer'}}>
                  <strong>{d.address}</strong> <br />
                  <span>Sentiment: {d.overall_location_sentiment}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

export default Demand;
