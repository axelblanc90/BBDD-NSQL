import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'

// Punto de entrada principal de la aplicación React
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* BrowserRouter provee el contexto de enrutamiento a toda la aplicación */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
