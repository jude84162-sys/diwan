async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + 'diwan-salt-2026')
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

interface StoredUser {
  hash: string
  name: string
}

function getUsers(): Record<string, StoredUser> {
  try {
    return JSON.parse(localStorage.getItem('diwan_users_v2') || '{}')
  } catch {
    return {}
  }
}

function saveUsers(users: Record<string, StoredUser>) {
  localStorage.setItem('diwan_users_v2', JSON.stringify(users))
}

export async function registerUser(email: string, password: string, name?: string): Promise<boolean> {
  const users = getUsers()
  if (users[email]) return false

  const hash = await hashPassword(password)
  users[email] = { hash, name: name || email.split('@')[0] }
  saveUsers(users)
  return true
}

export async function verifyUser(email: string, password: string): Promise<StoredUser | null> {
  const users = getUsers()
  if (!users[email]) return null

  const hash = await hashPassword(password)
  if (users[email].hash !== hash) return null

  return users[email]
}
