import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { useCurrency } from '../lib/useCurrency'
import CurrencyPicker from '../components/CurrencyPicker'
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
  { id: 'other', icon: '📌', name: 'أخرى', color: '#6b7280' },
]

function Dashboard() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [incomes, setIncomes] = useState<Income[]>([])
  const [tab, setTab] = useState<'today' | 'month'>('today')
  const { format } = useCurrency()

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

  const chartData = CATEGORIES.map(c => ({
    name: c.name,
    value: pExpenses.filter(e => e.category === c.id).reduce((s, e) => s + e.amount, 0),
    color: c.color,
  })).filter(d => d.value > 0)

  return (
    <div className="page-container dashboard-page">
      <div className="bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <div className="page-content dashboard-content">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-greeting">صباح الخير 👋</h1>
            <p className="dashboard-sub">ملخص {tab === 'today' ? 'اليوم' : 'الشهر'}</p>
          </div>
          <CurrencyPicker />
        </div>

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

        <div className="main-actions">
          <Link to="/income" className="main-action income">
            <span className="main-action-icon">↑</span>
            <span className="main-action-label">دخل</span>
          </Link>
          <Link to="/expenses" className="main-action expense">
            <span className="main-action-icon">↓</span>
            <span className="main-action-label">مصروف</span>
          </Link>
          <Link to="/transfer" className="main-action transfer">
            <span className="main-action-icon">⇄</span>
            <span className="main-action-label">تحويل</span>
          </Link>
        </div>

        {/* Quick Links */}
        <div className="quick-links">
          <Link to="/debts" className="quick-link">
            <span>💰</span>
            <span>الديون</span>
          </Link>
          <Link to="/budgets" className="quick-link">
            <span>📊</span>
            <span>الميزانية</span>
          </Link>
          <Link to="/accounts" className="quick-link">
            <span>🏦</span>
            <span>الحسابات</span>
          </Link>
          <Link to="/reports" className="quick-link">
            <span>📈</span>
            <span>التقارير</span>
          </Link>
        </div>

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

        {chartData.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">📊</span>
            <p>لا توجد بيانات بعد</p>
            <Link to="/expenses" className="btn-primary">أضف أول مصروف</Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
