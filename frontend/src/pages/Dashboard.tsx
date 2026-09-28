import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { useCurrency } from '../lib/useCurrency'
import CurrencyPicker from '../components/CurrencyPicker'
import HealthScore from '../components/HealthScore'
import AdvancedCharts from '../components/AdvancedCharts'
import './Dashboard.css'

interface Expense {
  id: string
  amount: number
  category: string
  note: string
  date: string
}

interface Income {
  id: string
  amount: number
  source: string
  note: string
  date: string
}

const CATEGORIES = [
  { id: 'rent', icon: '🏠', name: 'إيجار', color: '#3b82f6' },
  { id: 'electricity', icon: '⚡', name: 'كهرباء', color: '#f59e0b' },
  { id: 'salary', icon: '👥', name: 'رواتب', color: '#8b5cf6' },
  { id: 'stock', icon: '📦', name: 'بضاعة', color: '#22c55e' },
  { id: 'transport', icon: '🚗', name: 'مواصلات', color: '#ef4444' },
  { id: 'internet', icon: '📱', name: 'اتصالات', color: '#ec4899' },
  { id: 'food', icon: '🍔', name: 'طعام', color: '#f97316' },
  { id: 'stationery', icon: '✏️', name: 'مكتبة', color: '#f59e0b' },
  { id: 'school', icon: '📚', name: 'قرطاسية مدرسية', color: '#8b5cf6' },
  { id: 'office', icon: '📎', name: 'أدوات مكتبية', color: '#ec4899' },
  { id: 'other', icon: '📌', name: 'أخرى', color: '#6b7280' },
]

function Dashboard() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [incomes, setIncomes] = useState<Income[]>([])
  const [tab, setTab] = useState<'today' | 'month'>('today')
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { format } = useCurrency()

  const user = (() => {
    try {
      return JSON.parse(sessionStorage.getItem('diwan_user') || '{}')
    } catch {
      return {}
    }
  })()

  const userName = user.name || user.email?.split('@')[0] || 'التاجر'
  const userInitial = userName.charAt(0).toUpperCase()

  useEffect(() => {
    const e = localStorage.getItem('diwan_expenses')
    const i = localStorage.getItem('diwan_incomes')
    if (e) setExpenses(JSON.parse(e))
    if (i) setIncomes(JSON.parse(i))
  }, [])

  const now = new Date()
  const todayStr = now.toDateString()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const inPeriod = (date: string) => {
    const d = new Date(date)
    return tab === 'today' ? d.toDateString() === todayStr : d >= monthStart
  }

  const pExpenses = expenses.filter(e => inPeriod(e.date))
  const pIncomes = incomes.filter(i => inPeriod(i.date))

  const totalIncome = pIncomes.reduce((s, i) => s + i.amount, 0)
  const totalExpense = pExpenses.reduce((s, e) => s + e.amount, 0)
  const balance = totalIncome - totalExpense
  const margin = totalIncome > 0 ? (balance / totalIncome) * 100 : 0

  const chartData = CATEGORIES.map(c => ({
    name: c.name,
    value: pExpenses.filter(e => e.category === c.id).reduce((s, e) => s + e.amount, 0),
    color: c.color,
  })).filter(d => d.value > 0)

  const hasData = expenses.length > 0 || incomes.length > 0

  const handleLogout = () => {
    sessionStorage.removeItem('diwan_user')
    window.location.href = '/login'
  }

  return (
    <div className="page-container dashboard-page">
      <div className="bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <div className="page-content dashboard-content">
        {/* Header */}
        <header className="app-header">
          <div className="app-header-brand">
            <span className="app-header-logo">📖</span>
            <div className="app-header-text">
              <span className="app-header-name">ديوان</span>
              <span className="app-header-greeting">أهلاً {userName} 👋</span>
            </div>
          </div>

          <div className="app-header-actions">
            <Link to="/search" className="header-icon-btn" aria-label="بحث">
              🔍
            </Link>
            <CurrencyPicker />
            <button
              className="user-btn"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              aria-label="الحساب"
            >
              <span className="user-avatar">{userInitial}</span>
            </button>
          </div>

          {userMenuOpen && (
            <>
              <div className="user-menu-overlay" onClick={() => setUserMenuOpen(false)}></div>
              <div className="user-menu">
                <div className="user-menu-header">
                  <span className="user-menu-avatar">{userInitial}</span>
                  <div className="user-menu-info">
                    <span className="user-menu-name">{userName}</span>
                    <span className="user-menu-email">{user.email || 'بدون إيميل'}</span>
                  </div>
                </div>
                <div className="user-menu-divider"></div>
                <Link to="/goals" className="user-menu-item" onClick={() => setUserMenuOpen(false)}>
                  <span>🎯</span>
                  <span>الأهداف</span>
                </Link>
                <Link to="/settings" className="user-menu-item" onClick={() => setUserMenuOpen(false)}>
                  <span>⚙️</span>
                  <span>الإعدادات</span>
                </Link>
                <Link to="/support" className="user-menu-item" onClick={() => setUserMenuOpen(false)}>
                  <span>💬</span>
                  <span>الدعم</span>
                </Link>
                <button className="user-menu-item danger" onClick={handleLogout}>
                  <span>🚪</span>
                  <span>تسجيل الخروج</span>
                </button>
              </div>
            </>
          )}
        </header>

        {/* Period Tabs */}
        <div className="period-tabs">
          <button
            className={`period-tab ${tab === 'today' ? 'active' : ''}`}
            onClick={() => setTab('today')}
          >اليوم</button>
          <button
            className={`period-tab ${tab === 'month' ? 'active' : ''}`}
            onClick={() => setTab('month')}
          >الشهر</button>
        </div>

        {/* Balance Card */}
        <div className="balance-card">
          <span className="balance-label">الرصيد</span>
          <div className={`balance-value ${balance >= 0 ? 'positive' : 'negative'}`}>
            {format(balance)}
          </div>
          <div className="balance-row">
            <div className="balance-stat">
              <span className="balance-stat-icon">💰</span>
              <div>
                <span className="balance-stat-label">دخل</span>
                <span className="balance-stat-value positive">+{format(totalIncome)}</span>
              </div>
            </div>
            <div className="balance-stat">
              <span className="balance-stat-icon">💸</span>
              <div>
                <span className="balance-stat-label">مصروف</span>
                <span className="balance-stat-value negative">-{format(totalExpense)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Actions */}
        <div className="primary-actions">
          <Link to="/income" className="primary-action income">
            <span className="primary-action-icon">↑</span>
            <div className="primary-action-text">
              <span className="primary-action-title">إضافة دخل</span>
              <span className="primary-action-sub">مبيعات، خدمات</span>
            </div>
          </Link>
          <Link to="/expenses" className="primary-action expense">
            <span className="primary-action-icon">↓</span>
            <div className="primary-action-text">
              <span className="primary-action-title">إضافة مصروف</span>
              <span className="primary-action-sub">بضاعة، إيجار</span>
            </div>
          </Link>
        </div>

        {/* Secondary - Transfer */}
        <Link to="/transfer" className="secondary-action">
          <span className="secondary-action-icon">⇄</span>
          <span className="secondary-action-text">تحويل بين الحسابات <span className="badge-new">beta</span></span>
          <span className="secondary-action-arrow">←</span>
        </Link>

        {/* Quick Grid */}
        <div className="quick-grid">
          <Link to="/journal" className="quick-grid-item">
            <span className="quick-grid-icon">📅</span>
            <span className="quick-grid-label">دفتر المبيعات</span>
          </Link>
          <Link to="/debts" className="quick-grid-item">
            <span className="quick-grid-icon">💰</span>
            <span className="quick-grid-label">الديون</span>
          </Link>
          <Link to="/budgets" className="quick-grid-item">
            <span className="quick-grid-icon">📊</span>
            <span className="quick-grid-label">الميزانية</span>
          </Link>
          <Link to="/goals" className="quick-grid-item">
            <span className="quick-grid-icon">🎯</span>
            <span className="quick-grid-label">الأهداف</span>
          </Link>
        </div>

        {/* Health Score */}
        {hasData && (
          <HealthScore
            income={totalIncome}
            expense={totalExpense}
            profit={balance}
            margin={margin}
          />
        )}

        {/* Advanced Charts */}
        {hasData && <AdvancedCharts />}

        {/* Donut Chart */}
        {chartData.length > 0 && (
          <div className="chart-card">
            <h2 className="chart-title">توزيع المصاريف</h2>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={chartData[i].color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="chart-center">
                <span className="chart-center-label">الإجمالي</span>
                <span className="chart-center-value">{format(totalExpense)}</span>
              </div>
            </div>
            <div className="chart-legend">
              {chartData.map(d => (
                <div key={d.name} className="legend-item">
                  <span className="legend-dot" style={{ background: d.color }}></span>
                  <span className="legend-name">{d.name}</span>
                  <span className="legend-value">{format(d.value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty */}
        {!hasData && (
          <div className="empty-state">
            <span className="empty-icon">📊</span>
            <p>لا توجد بيانات بعد</p>
            <Link to="/income" className="btn-primary">أضف أول دخل</Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
