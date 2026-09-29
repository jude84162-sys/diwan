import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './lib/theme'
import { useRecurring } from './lib/useRecurring'
import { useAutoBackup } from './lib/useAutoBackup'
import ProtectedRoute from './components/ProtectedRoute'
import ThreeTest from './pages/ThreeTest'
import Markets from './pages/Markets'
import Home from './pages/Home'
import Login from './pages/Login'
import About from './pages/About'
import Expenses from './pages/Expenses'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import Onboarding from './pages/Onboarding'
import Debts from './pages/Debts'
import Budgets from './pages/Budgets'
import Income from './pages/Income'
import Transfer from './pages/Transfer'
import Accounts from './pages/Accounts'
import SalesJournal from './pages/SalesJournal'
import Invoices from './pages/Invoices'
import Goals from './pages/Goals'
import Search from './pages/Search'
import Support from './components/Support'
import BottomNav from './components/BottomNav'
import UpdateNotification from './components/UpdateNotification'

const hasOnboarded = () => localStorage.getItem('diwan_onboarded') === 'true'

function ProtectedOnboarding({ children }: { children: React.ReactNode }) {
  if (!hasOnboarded()) return <Navigate to="/onboarding" replace />
  return <>{children}</>
}

function AppContent() {
  useRecurring()
  useAutoBackup()

  return (
    <Routes>
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/" element={<ProtectedOnboarding><Home /></ProtectedOnboarding>} />
      <Route path="/login" element={<Login />} />
      <Route path="/about" element={<About />} />
      <Route path="/support" element={<Support />} />
      <Route path="/3d-test" element={<ThreeTest />} />

      {/* Protected Routes */}
      <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
      <Route path="/invoice" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
      <Route path="/journal" element={<ProtectedRoute><SalesJournal /><BottomNav /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /><BottomNav /></ProtectedRoute>} />
      <Route path="/expenses" element={<ProtectedRoute><Expenses /><BottomNav /></ProtectedRoute>} />
      <Route path="/products" element={<ProtectedRoute><Products /><BottomNav /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><Reports /><BottomNav /></ProtectedRoute>} />
      <Route path="/markets" element={<ProtectedRoute><Markets /><BottomNav /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /><BottomNav /></ProtectedRoute>} />
      <Route path="/debts" element={<ProtectedRoute><Debts /><BottomNav /></ProtectedRoute>} />
      <Route path="/budgets" element={<ProtectedRoute><Budgets /><BottomNav /></ProtectedRoute>} />
      <Route path="/accounts" element={<ProtectedRoute><Accounts /><BottomNav /></ProtectedRoute>} />
      <Route path="/goals" element={<ProtectedRoute><Goals /><BottomNav /></ProtectedRoute>} />
      <Route path="/income" element={<ProtectedRoute><Income /></ProtectedRoute>} />
      <Route path="/transfer" element={<ProtectedRoute><Transfer /></ProtectedRoute>} />
    </Routes>
  )
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <UpdateNotification />
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
