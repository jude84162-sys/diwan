import { Navigate } from 'react-router-dom'
import { getSession } from '../lib/session'

interface Props {
  children: React.ReactNode
}

function ProtectedRoute({ children }: Props) {
  const session = getSession()
  if (!session) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

export default ProtectedRoute
