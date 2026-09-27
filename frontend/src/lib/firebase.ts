// ==========================================
// Firebase — Real Configuration
// ==========================================

import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'DEMO_KEY',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'diwan-app.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'diwan-app',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'diwan-app.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '000000000000',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:000:web:000'
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)

console.log('🔥 Firebase initialized:', firebaseConfig.projectId)
