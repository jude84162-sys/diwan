import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCurrency } from '../lib/useCurrency'
import './Income.css'

interface Income {
  id: string
  amount: number
  source: string
  note: string
  date: string
}

const SOURCES = [
  { id: 'sales', icon: '🛒', name: 'مبيعات', color: '#22c55e' },
  { id: 'service', icon: '🛠️', name: 'خدمات', color: '#3b82f6' },
  { id: 'salary', icon: '💼', name: 'راتب', color: '#8b5cf6' },
  { id: 'gift', icon: '🎁', name: 'هدية', color: '#f59e0b' },
  { id: 'other', icon: '📌', name: 'أخرى', color: '#6b7280' },
]

function Income() {
  const [incomes, setIncomes] = useState<Income[]>(() => {
    const saved = localStorage.getItem('diwan_incomes')
    return saved ? JSON.parse(saved) : []
  })

  const [amount, setAmount] = useState('')
  const [source, setSource] = useState('sales')
  const [note, setNote] = useState('')
  const { format } = useCurrency()
  const navigate = useNavigate()

  const save = (data: Income[]) => {
    setIncomes(data)
    localStorage.setItem('diwan_incomes', JSON.stringify(data))
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!amount) return

    const income: Income = {
      id: Date.now().toString(),
      amount: parseFloat(amount),
      source,
      note,
      date: new Date().toISOString(),
    }

    save([income, ...incomes])
    setAmount('')
    setNote('')
    navigate('/dashboard')
  }

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthIncomes = incomes.filter(i => new Date(i.date) >= monthStart)
  const monthTotal = monthIncomes.reduce((s, i) => s + i.amount, 0)

  return (
    <div className="page-container income-page">
      <div className="bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <div className="page-content income-content">
        <Link to="/dashboard" className="back-btn">
          <span>→</span>
          <span>رجوع</span>
        </Link>

        <div className="income-header">
          <div className="income-header-icon">💰</div>
          <h1 className="income-title">تسجيل دخل</h1>
          <p className="income-sub">إجمالي الشهر: {format(monthTotal)}</p>
        </div>

        <form onSubmit={handleSubmit} className="income-form">
          <div className="amount-input-wrapper">
            <input
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="amount-input"
              autoFocus
              required
            />
            <span className="amount-currency">ر.س</span>
          </div>

          <div className="category-picker">
            {SOURCES.map(s => (
              <button
                key={s.id}
                type="button"
                className={`category-chip ${source === s.id ? 'active' : ''}`}
                onClick={() => setSource(s.id)}
                style={source === s.id ? {
                  background: s.color + '20',
                  borderColor: s.color,
                  color: s.color,
                } : {}}
              >
                <span>{s.icon}</span>
                <span>{s.name}</span>
              </button>
            ))}
          </div>

          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="ملاحظة (اختياري)"
            className="note-input"
          />

          <button type="submit" className="btn-primary" disabled={!amount}>
            حفظ الدخل
          </button>
        </form>

        {incomes.length > 0 && (
          <div className="income-recent">
            <h3 className="income-recent-title">آخر الدخل</h3>
            <div className="income-list">
              {incomes.slice(0, 5).map(i => {
                const src = SOURCES.find(s => s.id === i.source)
                return (
                  <div key={i.id} className="income-item">
                    <div className="income-icon" style={{ background: (src?.color || '#666') + '20' }}>
                      {src?.icon || '💰'}
                    </div>
                    <div className="income-info">
                      <span className="income-name">{src?.name}</span>
                      {i.note && <span className="income-note">{i.note}</span>}
                    </div>
                    <span className="income-amount">+{format(i.amount)}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Income
