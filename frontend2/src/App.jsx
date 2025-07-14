import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import SupplierMap from './components/SupplierMap'
import { Link } from 'react-router-dom';
import { addSupplier, fetchSupplierRiskData } from './services/api';

function Navbar({ onShowAllSuppliers }) {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img src={viteLogo} alt="Logo" />
        <span className="navbar-title">Walmart Supply Chain Manager</span>
      </div>
      <div className="navbar-links">
        <Link to="/" className="navbar-link">Home</Link>
        <a href="#" className="navbar-link" onClick={e => { e.preventDefault(); onShowAllSuppliers(); }}>Show all suppliers</a>
        <Link to="/demand" className="navbar-link">Go to Demand Page</Link>
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
    state: '',
    city: '',
    category: '',
    items: ['']
  });
  const [addSupplierError, setAddSupplierError] = useState("");
  const [showRemoveSupplier, setShowRemoveSupplier] = useState(false);
  const [categoryLookup, setCategoryLookup] = useState({});

  useEffect(() => {
    // Fetch from supplier-api-response.json for legacy suppliers
    fetchSupplierRiskData()
      .then(data => setSuppliers(data.supplier_risk_report))
      .catch(() => setSuppliers([]));
    // Fetch backend-sample.json for category lookup
    fetch('/backend-sample.json')
      .then(res => res.json())
      .then(data => {
        const lookup = {};
        (data.supplier_risk_report || []).forEach(s => {
          lookup[s.supplier_name] = s.category;
        });
        setCategoryLookup(lookup);
      })
      .catch(() => setCategoryLookup({}));
  }, []);

  const handleShowAllSuppliers = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  const handleSupplierClick = (supplier) => setSelectedSupplier(supplier);
  const handleCloseSupplierDetail = () => setSelectedSupplier(null);
  const handleShowAddSupplier = () => setShowAddSupplier(true);
  const handleCloseAddSupplier = () => {
    setShowAddSupplier(false);
    setNewSupplier({ supplier_name: '', state: '', city: '', category: '', items: [''] });
  };
  const handleAddSupplierChange = (e) => {
    const { name, value } = e.target;
    if (name === 'items') {
      setNewSupplier(s => ({ ...s, items: [value] }));
    } else {
      setNewSupplier(s => ({ ...s, [name]: value }));
    }
  };
  const handleAddSupplierSubmit = async (e) => {
    e.preventDefault();
    if (!newSupplier.supplier_name || !newSupplier.state || !newSupplier.city || !newSupplier.category || !newSupplier.items[0]) {
      setAddSupplierError("All fields are required.");
      return;
    }
    setAddSupplierError("");
    setShowAddSupplier(false);
    try {
      // Send to backend and wait for response
      const backendResp = await addSupplier(newSupplier);
      // Add the backend response to the suppliers list for pinning
      setSuppliers(sups => [
        ...sups,
        {
          supplier_name: backendResp.supplier,
          state: backendResp.state,
          city: newSupplier.city,
          category: newSupplier.category,
          items: newSupplier.items,
          risk_level: backendResp.risk_level,
          issue: backendResp.issue,
          reason: backendResp.reason
        }
      ]);
    } catch (err) {
      setAddSupplierError("Failed to add supplier. Please try again.");
    }
  };
  const handleShowRemoveSupplier = () => setShowRemoveSupplier(true);
  const handleCloseRemoveSupplier = () => setShowRemoveSupplier(false);
  const handleRemoveSupplier = (supplierName) => {
    setSuppliers(sups => sups.filter(s => (s.supplier_name || s.supplier) !== supplierName));
    setShowRemoveSupplier(false);
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
                  <span>{s.state} &mdash; {s.category}</span><br/>
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
              <p><b>Name:</b> {selectedSupplier.supplier}</p>
              <p><b>State:</b> {selectedSupplier.state}</p>
              <p><b>Items:</b> {selectedSupplier.items ? selectedSupplier.items.join(', ') : 'N/A'}</p>
              <p><b>Risk Level:</b> {selectedSupplier.risk_level}</p>
              <p><b>Reason:</b> {selectedSupplier.reason}</p>
            </div>
          </div>
        </div>
      )}
      {showAddSupplier && (
        <div className="modal-overlay" onClick={handleCloseAddSupplier}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseAddSupplier}>&times;</button>
            <h2>Add Supplier</h2>
            {addSupplierError && <div style={{color:'red',marginBottom:'1em'}}>{addSupplierError}</div>}
            <form onSubmit={handleAddSupplierSubmit} className="add-supplier-form">
              <label>Name:<br/>
                <input name="supplier_name" value={newSupplier.supplier_name} onChange={handleAddSupplierChange} required />
              </label><br/>
              <label>State:<br/>
                <input name="state" value={newSupplier.state} onChange={handleAddSupplierChange} required />
              </label><br/>
              <label>City:<br/>
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
      {showRemoveSupplier && (
        <div className="modal-overlay" onClick={handleCloseRemoveSupplier}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseRemoveSupplier}>&times;</button>
            <h2>Remove Supplier</h2>
            <ul className="modal-supplier-list">
              {suppliers.map((s, i) => (
                <li key={i} className="modal-supplier-item" onClick={() => handleRemoveSupplier(s.supplier_name || s.supplier)} style={{cursor:'pointer'}}>
                  <strong>{s.supplier_name || s.supplier}</strong><br/>
                  <span>{s.state} &mdash; {s.category || s.category_name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      <div className="main-layout">
        <SupplierMap suppliers={suppliers} />
        <div className="sidebar-container">
          <h2 className="sidebar-title">Supplier Management</h2>
          <div className="sidebar-buttons">
            <button className="sidebar-btn add" onClick={handleShowAddSupplier}>Add Supplier</button>
            <button className="sidebar-btn remove" onClick={handleShowRemoveSupplier}>Remove Supplier</button>
          </div>
          <div className="sidebar-list">
            <h3>Current Suppliers</h3>
            <ul>
              {suppliers.map((s, i) => {
                const industry = s.category || s.category_name || categoryLookup[s.supplier_name || s.supplier] || '';
                return (
                  <li key={i} className="supplier-list-item" onClick={() => handleSupplierClick(s)} style={{cursor:'pointer'}}>
                    <strong>{s.supplier_name || s.supplier}</strong> <br />
                    <span><b>State:</b> {s.state}</span><br />
                    <span><b>Industry:</b> {industry}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}
export default App
