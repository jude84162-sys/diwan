// ==========================================
// Firebase — Real Auth
// ==========================================

import { initializeApp, FirebaseApp } from 'firebase/app'
import { 
  getAuth, 
  Auth,
  createUserWithEmailAndPassword as fbCreate,
  signInWithEmailAndPassword as fbSignIn,
  signOut as fbSignOut,
  updateProfile as fbUpdate,
  onAuthStateChanged as fbOnAuth,
  GoogleAuthProvider as fbGoogle,
  signInWithPopup as fbPopup,
  sendPasswordResetEmail as fbReset,
  User,
} from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'DEMO_KEY',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'diwan-app.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'diwan-app',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'diwan-app.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '000000000000',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:000:web:000',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-BNMTLXVW3S',
}

export let app: FirebaseApp | null = null
export let authInstance: Auth | null = null

try {
  app = initializeApp(firebaseConfig)
  authInstance = getAuth(app)
  console.log('✅ Firebase initialized')
} catch (err) {
  console.warn('⚠️ Firebase init failed, using Local Auth fallback')
}

// ==========================================
// Local Auth Fallback (إذا Firebase فشل)
// ==========================================
interface LocalUser {
  uid: string
  email: string
  displayName: string
}

function getUsers(): Record<string, { password: string; name: string }> {
  try {
    return JSON.parse(localStorage.getItem('diwan_users') || '{}')
  } catch {
    return {}
  }
}

function saveUsers(users: Record<string, { password: string; name: string }>) {
  localStorage.setItem('diwan_users', JSON.stringify(users))
}

function getCurrentLocalUser(): LocalUser | null {
  try {
    const u = localStorage.getItem('diwan_current_user')
    return u ? JSON.parse(u) : null
  } catch {
    return null
  }
}

function setCurrentLocalUser(user: LocalUser | null) {
  if (user) {
    localStorage.setItem('diwan_current_user', JSON.stringify(user))
  } else {
    localStorage.removeItem('diwan_current_user')
  }
}

// ==========================================
// Auth API — يدعم Firebase + Local
// ==========================================

export const auth = authInstance || {
  get currentUser() {
    return getCurrentLocalUser()
  },
  onAuthStateChanged: (cb: (user: LocalUser | null) => void) => {
    cb(getCurrentLocalUser())
    return () => {}
  },
  signOut: async () => {
    setCurrentLocalUser(null)
  },
}

export async function createUserWithEmailAndPassword(_auth: any, email: string, password: string) {
  if (authInstance) {
    const cred = await fbCreate(authInstance, email, password)
    return { user: { uid: cred.user.uid, email: cred.user.email, displayName: cred.user.displayName } }
  }
  // Local fallback
  return new Promise<{ user: LocalUser }>((resolve, reject) => {
    setTimeout(() => {
      const users = getUsers()
      if (users[email]) return reject({ code: 'auth/email-already-in-use' })
      if (password.length < 6) return reject({ code: 'auth/weak-password' })
      users[email] = { password, name: email.split('@')[0] }
      saveUsers(users)
      const user: LocalUser = { uid: 'local-' + Date.now(), email, displayName: users[email].name }
      setCurrentLocalUser(user)
      resolve({ user })
    }, 300)
  })
}

export async function signInWithEmailAndPassword(_auth: any, email: string, password: string) {
  if (authInstance) {
    const cred = await fbSignIn(authInstance, email, password)
    return { user: { uid: cred.user.uid, email: cred.user.email, displayName: cred.user.displayName } }
  }
  return new Promise<{ user: LocalUser }>((resolve, reject) => {
    setTimeout(() => {
      const users = getUsers()
      if (!users[email]) return reject({ code: 'auth/user-not-found' })
      if (users[email].password !== password) return reject({ code: 'auth/wrong-password' })
      const user: LocalUser = { uid: 'local-' + Date.now(), email, displayName: users[email].name }
      setCurrentLocalUser(user)
      resolve({ user })
    }, 300)
  })
}

export async function updateProfile(user: any, data: { displayName?: string }) {
  if (authInstance && user.uid && !user.uid.startsWith('local-')) {
    try {
      const fbUser = authInstance.currentUser
      if (fbUser) await fbUpdate(fbUser, data)
    } catch {}
  }
  if (data.displayName) {
    const users = getUsers()
    if (users[user.email]) {
      users[user.email].name = data.displayName
      saveUsers(users)
    }
    const current = getCurrentLocalUser()
    if (current) {
      current.displayName = data.displayName
      setCurrentLocalUser(current)
    }
  }
}

export async function signOut() {
  if (authInstance) await fbSignOut(authInstance)
  setCurrentLocalUser(null)
}

export async function sendPasswordResetEmail(_auth: any, email: string) {
  if (authInstance) {
    await fbReset(authInstance, email)
    return { success: true }
  }
  return { success: false, message: 'Firebase غير متاح' }
}

export const GoogleAuthProvider = fbGoogle

export async function signInWithPopup(_auth: any, provider: any) {
  if (authInstance) {
    const cred = await fbPopup(authInstance, provider)
    return { user: { uid: cred.user.uid, email: cred.user.email, displayName: cred.user.displayName } }
  }
  throw new Error('Firebase غير متاح')
}

export function connectAuthEmulator(_auth: any, _url: string, _opts?: any) {}
