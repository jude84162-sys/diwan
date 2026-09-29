import { useState, FormEvent, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCurrency } from '../lib/useCurrency'
import { haptic } from '../lib/useHaptic'
import './Expenses.css'

interface Expense {
  id: string
  amount: number
  category: string
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

function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('diwan_expenses')
    return saved ? JSON.parse(saved) : []
  })

  const [showForm, setShowForm] = useState(false)
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('stock')
  const [note, setNote] = useState('')
  const [filter, setFilter] = useState<'all' | 'today' | 'week' | 'month'>('month')
  const [showSuccess, setShowSuccess] = useState(false)
  const { format } = useCurrency()

  const save = (data: Expense[]) => {
    setExpenses(data)
    localStorage.setItem('diwan_expenses', JSON.stringify(data))
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!amount || parseFloat(amount) <= 0) return

    haptic('success')

    const newExpense: Expense = {
      id: Date.now().toString(),
      amount: parseFloat(amount),
      category,
      note,
      date: new Date().toISOString(),
    }

    save([newExpense, ...expenses])
    setAmount('')
    setNote('')
    setShowForm(false)

    // Success toast
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const filtered = expenses.filter(e => {
    const d = new Date(e.date)
    const now = new Date()
    if (filter === 'today') return d.toDateString() === now.toDateString()
    if (filter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      return d >= weekAgo
    }
    if (filter === 'month') {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }
    return true
  })

  const total = filtered.reduce((s, e) => s + e.amount, 0)

  const formatDate = (d: string) => {
    return new Date(d).toLocaleDateString('ar-SA', { day: 'numeric', month: 'short' })
  }

  return (
    <div className="page-container expenses-page">
      <div className="bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <div className="page-content expenses-content">
        {/* Header Row */}
        <div className="page-header-row">
          <Link to="/dashboard" className="back-btn">
            <span>→</span>
            <span>رجوع</span>
          </Link>
          {expenses.length > 0 && (
            <button
              className="header-add-btn"
              onClick={() => { haptic('light'); setShowForm(true); }}
              aria-label="مصروف جديد"
            >
              +
            </button>
          )}
        </div>

        <div className="expenses-header">
          <h1 className="expenses-title">المصاريف</h1>
          <p className="expenses-sub">تابع كل مبلغ يخرج من جيبك</p>
        </div>

        {/* Summary Card */}
        <div className="summary-card">
          <div className="summary-main">
            <span className="summary-label">إجمالي المصاريف</span>
            <span className="summary-value">{format(total)}</span>
          </div>

          <div className="filter-tabs">
            {(['today', 'week', 'month', 'all'] as const).map(f => (
              <button
                key={f}
                className={`filter-tab ${filter === f ? 'active' : ''}`}
                onClick={() => { haptic('light'); setFilter(f); }}
              >
                {f === 'today' ? 'اليوم' : f === 'week' ? 'الأسبوع' : f === 'month' ? 'الشهر' : 'الكل'}
              </button>
            ))}
          </div>
        </div>

        {/* Expenses List */}
        <div className="expenses-section">
          <h2 className="section-title">
            آخر المصاريف
            {filtered.length > 0 && <span className="count">{filtered.length}</span>}
          </h2>

          {filtered.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">💸</span>
              <p>لا توجد مصاريف بعد</p>
              <p>سجل أول مصروف وابدأ</p>
              <button
                className="btn-primary empty-btn"
                onClick={() => { haptic('medium'); setShowForm(true); }}
              >
                سجل أول مصروف
              </button>
            </div>
          ) : (
            <div className="expenses-list">
              {filtered.slice(0, 20).map(e => {
                const cat = CATEGORIES.find(c => c.id === e.category)
                return (
                  <div key={e.id} className="expense-item">
                    <div
                      className="expense-icon"
                      style={{
                        background: (cat?.color || '#666') + '20',
                        color: cat?.color
                      }}
                    >
                      {cat?.icon || '📌'}
                    </div>
                    <div className="expense-info">
                      <span className="expense-name">{cat?.name || 'أخرى'}</span>
                      {e.note && <span className="expense-note">{e.note}</span>}
                      <span className="expense-date">{formatDate(e.date)}</span>
                    </div>
                    <span className="expense-amount">-{format(e.amount)}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>مصروف جديد</h3>
              <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="amount-input-wrapper">
                <input
                  type="number"
                  inputMode="decimal"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0"
                  className="amount-input"
                  autoFocus
                  required
                />
              </div>

              <div className="category-picker">
                {CATEGORIES.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    className={`category-chip ${category === c.id ? 'active' : ''}`}
                    onClick={() => { haptic('light'); setCategory(c.id); }}
                    style={category === c.id ? {
                      background: c.color + '25',
                      borderColor: c.color,
                      color: c.color,
                    } : {}}
                  >
                    <span>{c.icon}</span>
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="ملاحظة (اختياري)"
                className="note-input"
              />

              <button type="submit" className="btn-primary" disabled={!amount}>
                حفظ المصروف
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showSuccess && (
        <div className="success-toast">
          <span className="success-toast-icon">✅</span>
          <span>تم حفظ المصروف</span>
        </div>
      )}
    </div>
  )
}

export default Expenses
