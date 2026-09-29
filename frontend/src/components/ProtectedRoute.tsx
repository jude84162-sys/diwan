import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { getAuth, onAuthStateChanged, User } from 'firebase/auth'
import { app } from '../lib/firebase'
import { createSession, destroySession } from '../lib/session'

interface Props {
  children: React.ReactNode
}

function ProtectedRoute({ children }: Props) {
  const [user, setUser] = useState<User | null | undefined>(undefined)

  useEffect(() => {
    let mounted = true
    const auth = getAuth(app as any)

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (!mounted) return
      if (u) {
        createSession({
          uid: u.uid,
          email: u.email,
          displayName: u.displayName,
        })
        setUser(u)
      } else {
        destroySession()
        setUser(null)
      }
    })

    return () => {
      mounted = false
      unsubscribe()
    }
  }, [])

  if (user === undefined) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f3d26, #1a5c3a)',
          color: '#d4af37',
          fontFamily: 'Cairo, sans-serif',
          fontSize: 18,
        }}
      >
        جارٍ التحميل...
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
