import { getAuth, onAuthStateChanged, User } from 'firebase/auth'
import { app } from './firebase'

const SESSION_TIMEOUT = 24 * 60 * 60 * 1000

export interface Session {
  userId: string
  email: string
  name: string
  createdAt: number
  expiresAt: number
}

export function createSession(user: {
  uid: string
  email: string | null
  displayName?: string | null
}): Session {
  const now = Date.now()
  const session: Session = {
    userId: user.uid,
    email: user.email || '',
    name: user.displayName || user.email?.split('@')[0] || 'تاجر',
    createdAt: now,
    expiresAt: now + SESSION_TIMEOUT,
  }
  sessionStorage.setItem('diwan_session', JSON.stringify(session))
  return session
}

export function getSession(): Session | null {
  try {
    const raw = sessionStorage.getItem('diwan_session')
    if (!raw) return null
    const session: Session = JSON.parse(raw)
    if (Date.now() > session.expiresAt) {
      sessionStorage.removeItem('diwan_session')
      return null
    }
    return session
  } catch {
    return null
  }
}

export function destroySession() {
  sessionStorage.removeItem('diwan_session')
}

export function refreshSession() {
  const session = getSession()
  if (session) {
    session.expiresAt = Date.now() + SESSION_TIMEOUT
    sessionStorage.setItem('diwan_session', JSON.stringify(session))
  }
}

export function watchFirebaseAuth(
  callback: (user: User | null) => void
): () => void {
  const auth = getAuth(app as any)
  return onAuthStateChanged(auth, callback)
}
