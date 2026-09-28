import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCurrency } from '../lib/useCurrency'
import './Goals.css'

interface Goal {
  id: string
  type: 'monthly_income' | 'monthly_savings' | 'custom'
  label: string
  target: number
  period: string  // YYYY-MM
  createdAt: string
}

const GOAL_TYPES = [
  { id: 'monthly_income', label: 'دخل شهري', icon: '💰' },
  { id: 'monthly_savings', label: 'مدخرات شهرية', icon: '🏦' },
  { id: 'custom', label: 'هدف مخصص', icon: '🎯' },
]

function Goals() {
  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem('diwan_goals')
    return saved ? JSON.parse(saved) : []
  })

  const [incomes, setIncomes] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [type, setType] = useState('monthly_income')
  const [label, setLabel] = useState('')
  const [target, setTarget] = useState('')
  const { format } = useCurrency()

  useEffect(() => {
    const i = localStorage.getItem('diwan_incomes')
    if (i) setIncomes(JSON.parse(i))
  }, [])

  const save = (data: Goal[]) => {
    setGoals(data)
    localStorage.setItem('diwan_goals', JSON.stringify(data))
  }

  const currentPeriod = new Date().toISOString().slice(0, 7)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!target) return

    const typeData = GOAL_TYPES.find(t => t.id === type)
    const newGoal: Goal = {
      id: Date.now().toString(),
      type: type as any,
      label: label || typeData?.label || 'هدف',
      target: parseFloat(target),
      period: currentPeriod,
      createdAt: new Date().toISOString(),
    }

    save([newGoal, ...goals])
    setLabel('')
    setTarget('')
    setShowForm(false)
  }

  const deleteGoal = (id: string) => {
    if (confirm('حذف هذا الهدف؟')) {
      save(goals.filter(g => g.id !== id))
    }
  }

  const getProgress = (goal: Goal) => {
    if (goal.type === 'monthly_income') {
      const monthIncomes = incomes.filter(i => i.date.startsWith(goal.period))
      const total = monthIncomes.reduce((s, i) => s + i.amount, 0)
      return { current: total, percent: Math.min((total / goal.target) * 100, 100) }
    }
    return { current: 0, percent: 0 }
  }

  return (
    <div className="page-container goals-page">
      <div className="bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <div className="page-content goals-content">
        <Link to="/dashboard" className="back-btn">
          <span>→</span>
          <span>رجوع</span>
        </Link>

        <div className="goals-header">
          <h1 className="goals-title">الأهداف</h1>
          <p className="goals-sub">حدّد أهدافك وتابعها</p>
        </div>

        {goals.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🎯</span>
            <p>لم تحدد أي هدف بعد</p>
            <button className="btn-primary empty-btn" onClick={() => setShowForm(true)}>
              أضف أول هدف
            </button>
          </div>
        ) : (
          <div className="goals-list">
            {goals.map(goal => {
              const { current, percent } = getProgress(goal)
              const isComplete = percent >= 100
              const goalType = GOAL_TYPES.find(t => t.id === goal.type)

              return (
                <div key={goal.id} className={`goal-item ${isComplete ? 'complete' : ''}`}>
                  <div className="goal-header">
                    <div className="goal-icon">{goalType?.icon || '🎯'}</div>
                    <div className="goal-info">
                      <span className="goal-label">{goal.label}</span>
                      <span className="goal-period">{goal.period}</span>
                    </div>
                    <button
                      className="goal-delete"
                      onClick={() => deleteGoal(goal.id)}
                      aria-label="حذف"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="goal-values">
                    <span className="goal-current">{format(current)}</span>
                    <span className="goal-target">من {format(goal.target)}</span>
                  </div>

                  <div className="goal-bar">
                    <div
                      className="goal-bar-fill"
                      style={{
                        width: `${percent}%`,
                        background: isComplete ? '#22c55e' : 'linear-gradient(90deg, #d4af37, #e8c65a)',
                      }}
                    ></div>
                  </div>

                  <div className="goal-footer">
                    <span className={`goal-percent ${isComplete ? 'complete' : ''}`}>
                      {percent.toFixed(0)}%
                    </span>
                    {isComplete && <span className="goal-complete-badge">🎉 مبروك!</span>}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {goals.length > 0 && (
          <button className="fab-button" onClick={() => setShowForm(true)}>+</button>
        )}

        {showForm && (
          <div className="modal-overlay" onClick={() => setShowForm(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>هدف جديد</h3>
                <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
              </div>

              <form onSubmit={handleSubmit} className="modal-form">
                <div className="category-picker">
                  {GOAL_TYPES.map(t => (
                    <button
                      key={t.id}
                      type="button"
                      className={`category-chip ${type === t.id ? 'active' : ''}`}
                      onClick={() => setType(t.id)}
                    >
                      <span>{t.icon}</span>
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  value={label}
                  onChange={e => setLabel(e.target.value)}
                  placeholder="اسم الهدف (اختياري)"
                  className="note-input"
                />

                <input
                  type="number"
                  value={target}
                  onChange={e => setTarget(e.target.value)}
                  placeholder="المبلغ المستهدف"
                  className="note-input"
                  required
                  autoFocus
                />

                <button type="submit" className="btn-primary" disabled={!target}>
                  حفظ الهدف
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Goals
