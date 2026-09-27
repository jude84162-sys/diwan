// ==========================================
// Local Auth — بدون Firebase
// للتجربة والتطوير
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

function getCurrentUser(): LocalUser | null {
  try {
    const u = localStorage.getItem('diwan_current_user')
    return u ? JSON.parse(u) : null
  } catch {
    return null
  }
}

function setCurrentUser(user: LocalUser | null) {
  if (user) {
    localStorage.setItem('diwan_current_user', JSON.stringify(user))
  } else {
    localStorage.removeItem('diwan_current_user')
  }
}

export const auth = {
  get currentUser() {
    return getCurrentUser()
  },
  onAuthStateChanged: (cb: (user: LocalUser | null) => void) => {
    cb(getCurrentUser())
    return () => {}
  },
  signOut: async () => {
    setCurrentUser(null)
  }
}

export function createUserWithEmailAndPassword(
  _auth: any,
  email: string,
  password: string
) {
  return new Promise<{ user: LocalUser }>((resolve, reject) => {
    setTimeout(() => {
      const users = getUsers()

      if (users[email]) {
        reject({ code: 'auth/email-already-in-use' })
        return
      }

      if (password.length < 6) {
        reject({ code: 'auth/weak-password' })
        return
      }

      users[email] = { password, name: email.split('@')[0] }
      saveUsers(users)

      const user: LocalUser = {
        uid: 'local-' + Date.now(),
        email,
        displayName: users[email].name,
      }
      setCurrentUser(user)
      resolve({ user })
    }, 300)
  })
}

export function signInWithEmailAndPassword(
  _auth: any,
  email: string,
  password: string
) {
  return new Promise<{ user: LocalUser }>((resolve, reject) => {
    setTimeout(() => {
      const users = getUsers()

      if (!users[email]) {
        reject({ code: 'auth/user-not-found' })
        return
      }

      if (users[email].password !== password) {
        reject({ code: 'auth/wrong-password' })
        return
      }

      const user: LocalUser = {
        uid: 'local-' + Date.now(),
        email,
        displayName: users[email].name,
      }
      setCurrentUser(user)
      resolve({ user })
    }, 300)
  })
}

export function updateProfile(user: any, data: { displayName?: string }) {
  if (data.displayName) {
    const users = getUsers()
    if (users[user.email]) {
      users[user.email].name = data.displayName
      saveUsers(users)
    }
    const current = getCurrentUser()
    if (current) {
      current.displayName = data.displayName
      setCurrentUser(current)
    }
  }
  return Promise.resolve()
}

// Placeholder (لعدم كسر الاستيرادات إن وُجدت)
export const GoogleAuthProvider = class {
  setCustomParameters(_params: any) {}
}

export function signInWithPopup() {
  return Promise.reject({ code: 'auth/operation-not-allowed' })
}

export function connectAuthEmulator(_auth: any, _url: string, _opts?: any) {}
