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
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: '2rem', marginTop: '2rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 260, background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', padding: '1.5rem 1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button style={{ padding: '0.5em 1.5em', borderRadius: '8px', border: 'none', background: '#1976d2', color: '#fff', fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }}>
            Add Supplier
          </button>
          <button style={{ padding: '0.5em 1.5em', borderRadius: '8px', border: 'none', background: '#d32f2f', color: '#fff', fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }}>
            Remove Supplier
          </button>
        </div>
        <div style={{ marginTop: '1.5rem', maxHeight: 350, overflowY: 'auto' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: '#222' }}>Current Suppliers</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {suppliers.map((s, i) => (
              <li key={i} style={{ marginBottom: 8, padding: '0.5em 0.5em', borderRadius: 6, background: '#f5f6fa', fontSize: '0.98rem', color: '#333' }}>
                <strong>{s.supplier_name}</strong> <br />
                <span style={{ color: '#666', fontSize: '0.92em' }}>{s.city} &mdash; {s.category}</span>
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
