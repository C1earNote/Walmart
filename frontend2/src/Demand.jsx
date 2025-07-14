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
        <button className="navbar-link" onClick={onShowAllDemands} style={{background:'none',border:'none',cursor:'pointer',padding:0}}>Show all demand</button>
      </div>
    </nav>
  );
}

function Demand() {
  const [demands, setDemands] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDemand, setSelectedDemand] = useState(null);

  useEffect(() => {
    fetch('/demand-sample.json')
      .then(res => res.json())
      .then(data => setDemands(data.demand_metrics))
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
            <h2>All Demand Metrics</h2>
            <ul className="modal-supplier-list">
              {demands.map((d, i) => (
                <li key={i} className="modal-supplier-item" onClick={() => handleDemandClick(d)} style={{cursor:'pointer'}}>
                  <strong>{d.region_name}</strong><br/>
                  <span>Item: {d.item}</span><br/>
                  <span>Demand: {d.demand}</span><br/>
                  <span>Period: {d.period}</span>
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
            <h2>Demand Details</h2>
            <div className="supplier-detail-fields">
              <p><b>Region:</b> {selectedDemand.region_name}</p>
              <p><b>Item:</b> {selectedDemand.item}</p>
              <p><b>Demand:</b> {selectedDemand.demand}</p>
              <p><b>Period:</b> {selectedDemand.period}</p>
            </div>
          </div>
        </div>
      )}
      <div className="main-layout">
        <DemandMap demands={demands} />
        <div className="sidebar-container">
          <h2 className="sidebar-title">Demand Management</h2>
          <div className="sidebar-list">
            <h3>Current Demand Metrics</h3>
            <ul>
              {demands.map((d, i) => (
                <li key={i} className="supplier-list-item" onClick={() => handleDemandClick(d)} style={{cursor:'pointer'}}>
                  <strong>{d.region_name}</strong> <br />
                  <span>Item: {d.item}</span>
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
