import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useCurrency } from '../lib/useCurrency'
import './Budgets.css'

interface Budget {
  id: string
  category: string
  limit: number
  icon: string
  color: string
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

function Budgets() {
  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem('diwan_budgets')
    return saved ? JSON.parse(saved) : []
  })

  const [expenses] = useState<any[]>(() => {
    const saved = localStorage.getItem('diwan_expenses')
    return saved ? JSON.parse(saved) : []
  })

  const [showForm, setShowForm] = useState(false)
  const [category, setCategory] = useState('stock')
  const [limit, setLimit] = useState('')
  const { format } = useCurrency()

  const save = (data: Budget[]) => {
    setBudgets(data)
    localStorage.setItem('diwan_budgets', JSON.stringify(data))
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!limit) return

    const cat = CATEGORIES.find(c => c.id === category)
    if (!cat) return

    const newBudget: Budget = {
      id: Date.now().toString(),
      category,
      limit: parseFloat(limit),
      icon: cat.icon,
      color: cat.color,
    }

    save([...budgets.filter(b => b.category !== category), newBudget])
    setLimit('')
    setShowForm(false)
  }

  // حساب المصروفات لكل فئة (هذا الشهر)
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthExpenses = expenses.filter(e => new Date(e.date) >= monthStart)

  const getSpent = (catId: string) => 
    monthExpenses
      .filter(e => e.category === catId)
      .reduce((s, e) => s + e.amount, 0)

  const totalLimit = budgets.reduce((s, b) => s + b.limit, 0)
  const totalSpent = budgets.reduce((s, b) => s + getSpent(b.category), 0)

  return (
    <div className="page-container budgets-page">
      <div className="bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <div className="page-content budgets-content">
        <div className="page-header-row"><Link to="/dashboard" className="back-btn">
          <span>→</span>
          <span>رجوع</span>
        </Link><button className="header-add-btn" onClick={() => setShowForm(true)}>+</button></div>

        <div className="budgets-header">
          <h1 className="budgets-title">الميزانيات</h1>
          <p className="budgets-sub">حدّد ميزانية لكل فئة</p>
        </div>

        {/* Summary */}
        {budgets.length > 0 && (
          <div className="budgets-summary">
            <div className="budgets-summary-row">
              <span>المصروف</span>
              <span>{format(totalSpent)}</span>
            </div>
            <div className="budgets-summary-row">
              <span>الميزانية</span>
              <span>{format(totalLimit)}</span>
            </div>
            <div className="budgets-summary-bar">
              <div 
                className="budgets-summary-fill"
                style={{ 
                  width: `${Math.min((totalSpent / totalLimit) * 100, 100)}%`,
                  background: totalSpent > totalLimit ? '#ef4444' : 
                              totalSpent > totalLimit * 0.8 ? '#f59e0b' : '#22c55e'
                }}
              ></div>
            </div>
            <div className="budgets-summary-percent">
              {((totalSpent / totalLimit) * 100).toFixed(0)}%
            </div>
          </div>
        )}

        {/* List */}
        {budgets.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📊</span>
            <p>لم تحدد ميزانيات بعد</p>
            <button className="btn-primary empty-btn" onClick={() => setShowForm(true)}>
              أضف أول ميزانية
            </button>
          </div>
        ) : (
          <div className="budgets-list">
            {budgets.map(b => {
              const spent = getSpent(b.category)
              const percent = (spent / b.limit) * 100
              const remaining = b.limit - spent
              return (
                <div key={b.id} className="budget-item">
                  <div className="budget-icon" style={{ background: b.color + '20', color: b.color }}>
                    {b.icon}
                  </div>
                  <div className="budget-info">
                    <div className="budget-header-row">
                      <span className="budget-name">
                        {CATEGORIES.find(c => c.id === b.category)?.name}
                      </span>
                      <span className={`budget-remaining ${remaining < 0 ? 'over' : ''}`}>
                        {remaining >= 0 ? `باقي ${format(remaining)}` : `تجاوزت ${format(Math.abs(remaining))}`}
                      </span>
                    </div>
                    <div className="budget-bar">
                      <div 
                        className="budget-bar-fill"
                        style={{
                          width: `${Math.min(percent, 100)}%`,
                          background: percent > 100 ? '#ef4444' : 
                                      percent > 80 ? '#f59e0b' : b.color,
                        }}
                      ></div>
                    </div>
                    <div className="budget-info-row">
                      <span>{format(spent)}</span>
                      <span>{percent.toFixed(0)}%</span>
                      <span>{format(b.limit)}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

              </div>

              <form onSubmit={handleSubmit} className="modal-form">
                <div className="category-picker">
                  {CATEGORIES.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      className={`category-chip ${category === c.id ? 'active' : ''}`}
                      onClick={() => setCategory(c.id)}
                      style={category === c.id ? {
                        background: c.color + '20',
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
                  type="number"
                  value={limit}
                  onChange={e => setLimit(e.target.value)}
                  placeholder="الميزانية الشهرية"
                  className="note-input"
                  required
                />

                <button type="submit" className="btn-primary" disabled={!limit}>
                  حفظ
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Budgets
