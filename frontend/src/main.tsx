import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { registerServiceWorker } from './lib/registerSW'
import './styles/global.css'

// ═══ Register Service Worker (PWA) ═══
registerServiceWorker()

// ═══ Preload critical fonts ═══
if ('fonts' in document) {
  ;(document as any).fonts.ready.then(() => {
    document.documentElement.classList.add('fonts-loaded')
  })
}

// ═══ Render app ═══
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
