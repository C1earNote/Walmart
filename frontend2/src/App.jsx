import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import SupplierMap from './components/SupplierMap'

function App() {
  const [suppliers, setSuppliers] = useState([])

  useEffect(() => {
    // Simulate fetching from backend (replace with real fetch in production)
    fetch('/backend-sample.json') // or wherever your backend endpoint is
      .then(res => res.json())
      .then(data => setSuppliers(data.supplier_risk_report))
      .catch(() => setSuppliers([]));
  }, []);

  return (
    <div className="main-layout">
      <div className="sidebar-container">
        <h2 className="sidebar-title">Supplier Management</h2>
        <div className="sidebar-buttons">
          <button className="sidebar-btn add">Add Supplier</button>
          <button className="sidebar-btn remove">Remove Supplier</button>
        </div>
        <div className="sidebar-list">
          <h3>Current Suppliers</h3>
          <ul>
            {suppliers.map((s, i) => (
              <li key={i} className="supplier-list-item">
                <strong>{s.supplier_name}</strong> <br />
                <span>{s.city} &mdash; {s.category}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <SupplierMap suppliers={suppliers} />
    </div>
  )
}
export default App
