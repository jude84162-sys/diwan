import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './lib/theme'
import { useRecurring } from './lib/useRecurring'
import { useAutoBackup } from './lib/useAutoBackup'
import ProtectedRoute from './components/ProtectedRoute'

// ─── Lazy loaded pages (code-split) ───
const Home = lazy(() => import('./pages/Home'))
const Login = lazy(() => import('./pages/Login'))
const About = lazy(() => import('./pages/About'))
const Expenses = lazy(() => import('./pages/Expenses'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Products = lazy(() => import('./pages/Products'))
const Reports = lazy(() => import('./pages/Reports'))
const Settings = lazy(() => import('./pages/Settings'))
const Onboarding = lazy(() => import('./pages/Onboarding'))
const Debts = lazy(() => import('./pages/Debts'))
const Budgets = lazy(() => import('./pages/Budgets'))
const Income = lazy(() => import('./pages/Income'))
const Transfer = lazy(() => import('./pages/Transfer'))
const Accounts = lazy(() => import('./pages/Accounts'))
const SalesJournal = lazy(() => import('./pages/SalesJournal'))
const Invoices = lazy(() => import('./pages/Invoices'))
const Goals = lazy(() => import('./pages/Goals'))
const Search = lazy(() => import('./pages/Search'))
const Markets = lazy(() => import('./pages/Markets'))
const ThreeTest = lazy(() => import('./pages/ThreeTest'))

// ─── Non-lazy (small components) ───
import Support from './components/Support'
import BottomNav from './components/BottomNav'
import UpdateNotification from './components/UpdateNotification'

// ─── Loading fallback ───
function PageLoader() {
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
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: 50,
            height: 50,
            margin: '0 auto 16px',
            border: '3px solid rgba(212, 175, 55, 0.2)',
            borderTopColor: '#d4af37',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
        <p style={{ opacity: 0.7, fontSize: 14 }}>جارٍ التحميل...</p>
      </div>
    </div>
  )
}

const hasOnboarded = () => localStorage.getItem('diwan_onboarded') === 'true'

function ProtectedOnboarding({ children }: { children: React.ReactNode }) {
  if (!hasOnboarded()) return <Navigate to="/onboarding" replace />
  return <>{children}</>
}

function AppContent() {
  useRecurring()
  useAutoBackup()

  return (
    <main id="main-content" role="main" style={{ display: "contents" }}>
      <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/" element={<ProtectedOnboarding><Home /></ProtectedOnboarding>} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/support" element={<Support />} />
        <Route path="/3d-test" element={<ThreeTest />} />

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
    </Suspense>
    </main>
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
