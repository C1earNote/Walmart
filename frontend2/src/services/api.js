// src/services/api.js

export const fetchSupplierRiskData = async () => {
  // Simulate network delay
  await new Promise((res) => setTimeout(res, 500));
  const resp = await fetch('/supplier-api-response.json');
  const data = await resp.json();
  return { supplier_risk_report: data };
};

export const addSupplier = async (supplierObj) => {
  // Look up coordinates for the state
  const resp = await fetch('/in.json');
  const states = await resp.json();
  const stateRec = states.find(
    s => s["State.Name"].trim().toLowerCase() === supplierObj.state.trim().toLowerCase()
  );
  const latitude = stateRec ? stateRec.latitude : null;
  const longitude = stateRec ? stateRec.longitude : null;

  // Prepare payload for backend
  const payload = {
    supplier_name: supplierObj.supplier_name,
    state: supplierObj.state,
    city: supplierObj.city,
    category_name: supplierObj.category,
    latitude,
    longitude
  };

  // Send to backend (correct endpoint)
  const backendResp = await fetch('http://127.0.0.1:8000/api/analyze-supplier-llm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const result = await backendResp.json();
  return result;
};

export const fetchDemandData = async () => {
  await new Promise((res) => setTimeout(res, 500));
  const resp = await fetch('/demand-api-response.json');
  return await resp.json();
};
