import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useCurrency } from '../lib/useCurrency'
import './Debts.css'

interface Debt {
  id: string
  person: string
  amount: number
  paid: number
  type: 'owed' | 'owing'  // يدينون لي / أنا مدين
  dueDate: string
  note: string
  createdAt: string
}

function Debts() {
  const [debts, setDebts] = useState<Debt[]>(() => {
    const saved = localStorage.getItem('diwan_debts')
    return saved ? JSON.parse(saved) : []
  })

  const [tab, setTab] = useState<'owed' | 'owing'>('owed')
  const [showForm, setShowForm] = useState(false)
  const [person, setPerson] = useState('')
  const [amount, setAmount] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [note, setNote] = useState('')
  const { format } = useCurrency()

  const save = (data: Debt[]) => {
    setDebts(data)
    localStorage.setItem('diwan_debts', JSON.stringify(data))
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!person || !amount) return

    const debt: Debt = {
      id: Date.now().toString(),
      person,
      amount: parseFloat(amount),
      paid: 0,
      type: tab,
      dueDate,
      note,
      createdAt: new Date().toISOString(),
    }

    save([debt, ...debts])
    setPerson('')
    setAmount('')
    setDueDate('')
    setNote('')
    setShowForm(false)
  }

  const addPayment = (id: string, payment: number) => {
    save(debts.map(d => 
      d.id === id 
        ? { ...d, paid: Math.min(d.paid + payment, d.amount) }
        : d
    ))
  }

  const filtered = debts.filter(d => d.type === tab)
  const total = filtered.reduce((s, d) => s + (d.amount - d.paid), 0)

  return (
    <div className="page-container debts-page">
      <div className="bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <div className="page-content debts-content">
        <Link to="/dashboard" className="back-btn">
          <span>→</span>
          <span>رجوع</span>
        </Link>

        <div className="debts-header">
          <h1 className="debts-title">الديون</h1>
          <p className="debts-sub">تابع من يدين لك ومن تدين له</p>
        </div>

        {/* Tabs */}
        <div className="debts-tabs">
          <button
            className={`debts-tab ${tab === 'owed' ? 'active' : ''}`}
            onClick={() => setTab('owed')}
          >
            <span>💰</span>
            <span>يدينون لي</span>
          </button>
          <button
            className={`debts-tab ${tab === 'owing' ? 'active' : ''}`}
            onClick={() => setTab('owing')}
          >
            <span>💸</span>
            <span>أنا مدين</span>
          </button>
          <div 
            className="debts-tab-indicator"
            style={{ transform: `translateX(${tab === 'owing' ? '-100%' : '0%'})` }}
          ></div>
        </div>

        {/* Summary */}
        <div className={`debts-summary ${tab}`}>
          <span className="debts-summary-label">
            {tab === 'owed' ? 'إجمالي يدينون لك' : 'إجمالي ما تدين'}
          </span>
          <span className="debts-summary-value">{format(total)}</span>
          <span className="debts-summary-count">{filtered.length} شخص</span>
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">💰</span>
            <p>{tab === 'owed' ? 'لا أحد يدين لك' : 'لست مديناً لأحد'}</p>
            <button className="btn-primary empty-btn" onClick={() => setShowForm(true)}>
              {tab === 'owed' ? 'أضف شخصاً يدين لك' : 'أضف ديناً عليك'}
            </button>
          </div>
        ) : (
          <div className="debts-list">
            {filtered.map(d => {
              const remaining = d.amount - d.paid
              const progress = (d.paid / d.amount) * 100
              return (
                <div key={d.id} className="debt-item">
                  <div className="debt-header">
                    <div className="debt-avatar">
                      {d.person.charAt(0)}
                    </div>
                    <div className="debt-info">
                      <span className="debt-person">{d.person}</span>
                      {d.note && <span className="debt-note">{d.note}</span>}
                    </div>
                    <span className={`debt-amount ${d.type}`}>
                      {format(remaining)}
                    </span>
                  </div>

                  {/* Progress */}
                  <div className="debt-progress-wrapper">
                    <div className="debt-progress-bar">
                      <div 
                        className="debt-progress-fill"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <div className="debt-progress-info">
                      <span>{progress.toFixed(0)}%</span>
                      <span>{format(d.paid)} / {format(d.amount)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="debt-actions">
                    <button 
                      className="debt-btn payment"
                      onClick={() => {
                        const pay = prompt('المبلغ المدفوع:', '')
                        if (pay) addPayment(d.id, parseFloat(pay))
                      }}
                    >
                      دفع
                    </button>
                    <a 
                      href={`https://wa.me/?text=${encodeURIComponent(`تذكير: ${d.person} - ${format(remaining)}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="debt-btn whatsapp"
                    >
                      واتساب
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <button className="fab-button" onClick={() => setShowForm(true)}>+</button>

        {/* Modal */}
        {showForm && (
          <div className="modal-overlay" onClick={() => setShowForm(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{tab === 'owed' ? 'شخص يدين لك' : 'دين عليك'}</h3>
                <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
              </div>

              <form onSubmit={handleSubmit} className="modal-form">
                <input
                  type="text"
                  value={person}
                  onChange={e => setPerson(e.target.value)}
                  placeholder="اسم الشخص"
                  className="note-input"
                  autoFocus
                  required
                />

                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="المبلغ"
                  className="note-input"
                  required
                />

                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="note-input"
                />

                <input
                  type="text"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="ملاحظة (اختياري)"
                  className="note-input"
                />

                <button type="submit" className="btn-primary" disabled={!person || !amount}>
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

export default Debts
