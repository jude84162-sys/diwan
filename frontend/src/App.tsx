import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
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
import BottomNav from './components/BottomNav'

const hasOnboarded = () => localStorage.getItem('diwan_onboarded') === 'true'

function ProtectedOnboarding({ children }: { children: React.ReactNode }) {
  if (!hasOnboarded()) return <Navigate to="/onboarding" replace />
  return <>{children}</>
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/" element={<ProtectedOnboarding><Home /></ProtectedOnboarding>} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/dashboard" element={<><Dashboard /><BottomNav /></>} />
        <Route path="/expenses" element={<><Expenses /><BottomNav /></>} />
        <Route path="/products" element={<><Products /><BottomNav /></>} />
        <Route path="/reports" element={<><Reports /><BottomNav /></>} />
        <Route path="/settings" element={<><Settings /><BottomNav /></>} />
        <Route path="/debts" element={<><Debts /><BottomNav /></>} />
        <Route path="/budgets" element={<><Budgets /><BottomNav /></>} />
        <Route path="/accounts" element={<><Accounts /><BottomNav /></>} />
        <Route path="/income" element={<Income />} />
        <Route path="/transfer" element={<Transfer />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
