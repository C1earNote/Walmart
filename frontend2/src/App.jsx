import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import SupplierMap from './components/SupplierMap'
import { Link } from 'react-router-dom';

function Navbar({ onShowAllSuppliers }) {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img src={viteLogo} alt="Logo" />
        <span className="navbar-title">Walmart Supply Chain Manager</span>
      </div>
      <div className="navbar-links">
        <a href="#" className="navbar-link">Home</a>
        <button className="navbar-link" onClick={onShowAllSuppliers} style={{background:'none',border:'none',cursor:'pointer',padding:0}}>Show all suppliers</button>
        <Link to="/demand" className="navbar-link" style={{background:'none',border:'none',cursor:'pointer',padding:0}}>Go to Demand Page</Link>
      </div>
    </nav>
  );
}

function App() {
  const [suppliers, setSuppliers] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [showAddSupplier, setShowAddSupplier] = useState(false)
  const [newSupplier, setNewSupplier] = useState({
    supplier_name: '',
    city: '',
    category: '',
    items: ['']
  });

  useEffect(() => {
    // Simulate fetching from backend (replace with real fetch in production)
    fetch('/backend-sample.json') // or wherever your backend endpoint is
      .then(res => res.json())
      .then(data => setSuppliers(data.supplier_risk_report))
      .catch(() => setSuppliers([]));
  }, []);

  const handleShowAllSuppliers = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  const handleSupplierClick = (supplier) => setSelectedSupplier(supplier);
  const handleCloseSupplierDetail = () => setSelectedSupplier(null);
  const handleShowAddSupplier = () => setShowAddSupplier(true);
  const handleCloseAddSupplier = () => {
    setShowAddSupplier(false);
    setNewSupplier({ supplier_name: '', city: '', category: '', items: [''] });
  };
  const handleAddSupplierChange = (e) => {
    const { name, value } = e.target;
    if (name === 'items') {
      setNewSupplier(s => ({ ...s, items: [value] }));
    } else {
      setNewSupplier(s => ({ ...s, [name]: value }));
    }
  };
  const handleAddSupplierSubmit = (e) => {
    e.preventDefault();
    setSuppliers(sups => [
      ...sups,
      { ...newSupplier, risk_level: 'Unknown', headline: '', state: '', overall_sentiment: '', average_polarity_score: 0 }
    ]);
    handleCloseAddSupplier();
  };

  return (
    <>
      <Navbar onShowAllSuppliers={handleShowAllSuppliers} />
      {showModal && !selectedSupplier && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseModal}>&times;</button>
            <h2>All Suppliers</h2>
            <ul className="modal-supplier-list">
              {suppliers.map((s, i) => (
                <li key={i} className="modal-supplier-item" onClick={() => handleSupplierClick(s)} style={{cursor:'pointer'}}>
                  <strong>{s.supplier_name}</strong><br/>
                  <span>{s.city} &mdash; {s.category}</span><br/>
                  <span>Risk: {s.risk_level}</span><br/>
                  <span>Headline: {s.headline}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      {selectedSupplier && (
        <div className="modal-overlay" onClick={handleCloseSupplierDetail}>
          <div className="modal-content supplier-detail-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseSupplierDetail}>&times;</button>
            <h2>Supplier Details</h2>
            <div className="supplier-detail-fields">
              <p><b>Name:</b> {selectedSupplier.supplier_name}</p>
              <p><b>Address:</b> {selectedSupplier.city}, {selectedSupplier.state}</p>
              <p><b>Items:</b> {selectedSupplier.items ? selectedSupplier.items.join(', ') : 'N/A'}</p>
            </div>
          </div>
        </div>
      )}
      {showAddSupplier && (
        <div className="modal-overlay" onClick={handleCloseAddSupplier}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseAddSupplier}>&times;</button>
            <h2>Add Supplier</h2>
            <form onSubmit={handleAddSupplierSubmit} className="add-supplier-form">
              <label>Name:<br/>
                <input name="supplier_name" value={newSupplier.supplier_name} onChange={handleAddSupplierChange} required />
              </label><br/>
              <label>City Name:<br/>
                <input name="city" value={newSupplier.city} onChange={handleAddSupplierChange} required />
              </label><br/>
              <label>Category:<br/>
                <input name="category" value={newSupplier.category} onChange={handleAddSupplierChange} required />
              </label><br/>
              <label>Item Name:<br/>
                <input name="items" value={newSupplier.items[0]} onChange={handleAddSupplierChange} required />
              </label><br/>
              <button type="submit" className="sidebar-btn add" style={{marginTop:'1rem'}}>Add</button>
            </form>
          </div>
        </div>
      )}
      <div className="main-layout">
        <SupplierMap suppliers={suppliers} />
        <div className="sidebar-container">
          <h2 className="sidebar-title">Supplier Management</h2>
          <div className="sidebar-buttons">
            <button className="sidebar-btn add" onClick={handleShowAddSupplier}>Add Supplier</button>
            <button className="sidebar-btn remove">Remove Supplier</button>
          </div>
          <div className="sidebar-list">
            <h3>Current Suppliers</h3>
            <ul>
              {suppliers.map((s, i) => (
                <li key={i} className="supplier-list-item" onClick={() => handleSupplierClick(s)} style={{cursor:'pointer'}}>
                  <strong>{s.supplier_name}</strong> <br />
                  <span>{s.city} &mdash; {s.category}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}
export default App
