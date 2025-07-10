import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import SupplierMap from './components/SupplierMap'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <h1>Hello World</h1>
    <SupplierMap />
    </>
  )
}
export default App
