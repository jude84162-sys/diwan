import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { registerServiceWorker } from './lib/registerSW'
import { initAnalytics } from './lib/analytics'
import './styles/global.css'

registerServiceWorker()

if (window.location.protocol === 'https:') {
  setTimeout(() => {
    try { initAnalytics() } catch (err) { console.warn('Analytics failed', err) }
  }, 500)
}

if ('fonts' in document) {
  ;(document as any).fonts.ready.then(() => {
    document.documentElement.classList.add('fonts-loaded')
  })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

requestAnimationFrame(() => {
  const splash = document.getElementById('splash')
  if (splash) {
    splash.style.opacity = '0'
    setTimeout(() => splash.remove(), 350)
  }
})
