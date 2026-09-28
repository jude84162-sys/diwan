const SESSION_KEY = 'diwan_session'
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000

interface Session {
  userId: string
  email: string
  name: string
  createdAt: number
  expiresAt: number
}

export function createSession(user: { uid: string; email: string; displayName?: string }): Session {
  const now = Date.now()
  const session: Session = {
    userId: user.uid,
    email: user.email,
    name: user.displayName || user.email.split('@')[0],
    createdAt: now,
    expiresAt: now + SESSION_TIMEOUT,
  }
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return session
}

export function getSession(): Session | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null

    const session: Session = JSON.parse(raw)

    if (Date.now() > session.expiresAt) {
      sessionStorage.removeItem(SESSION_KEY)
      return null
    }

    return session
  } catch {
    return null
  }
}

export function destroySession() {
  sessionStorage.removeItem(SESSION_KEY)
}

export function refreshSession() {
  const session = getSession()
  if (session) {
    session.expiresAt = Date.now() + SESSION_TIMEOUT
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
  }
}
