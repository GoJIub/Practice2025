import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { FireDataProvider } from './context/FireDataContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <FireDataProvider>
      <App />
    </FireDataProvider>
  </React.StrictMode>,
)
