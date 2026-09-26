import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { registerServiceWorker } from './lib/registerSW'
import './styles/global.css'

registerServiceWorker()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
