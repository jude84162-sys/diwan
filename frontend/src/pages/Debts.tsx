import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useCurrency } from '../lib/useCurrency'
import { sendDebtReminder } from '../lib/whatsapp'
import { haptic } from '../lib/useHaptic'
import './Debts.css'

interface Debt {
  id: string
  person: string
  amount: number
  paid: number
  type: 'owed' | 'owing'
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
  const [showPayment, setShowPayment] = useState<Debt | null>(null)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [person, setPerson] = useState('')
  const [amount, setAmount] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [note, setNote] = useState('')
  const { format, currency } = useCurrency()

  const save = (data: Debt[]) => {
    setDebts(data)
    localStorage.setItem('diwan_debts', JSON.stringify(data))
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!person || !amount) return

    haptic('success')

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

  const handlePayment = (e: FormEvent) => {
    e.preventDefault()
    if (!showPayment || !paymentAmount) return

    const amount = parseFloat(paymentAmount)
    if (amount <= 0) return

    haptic('success')

    save(debts.map(d => {
      if (d.id === showPayment.id) {
        const newPaid = Math.min(d.paid + amount, d.amount)
        return { ...d, paid: newPaid }
      }
      return d
    }))

    setPaymentAmount('')
    setShowPayment(null)
  }

  const handleWhatsApp = (d: Debt) => {
    haptic('light')
    const url = sendDebtReminder({
      name: d.person,
      amount: d.amount,
      paid: d.paid,
      currency,
      dueDate: d.dueDate,
    })
    window.open(url, '_blank')
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

        <div className="debts-tabs">
          <button
            className={`debts-tab ${tab === 'owed' ? 'active' : ''}`}
            onClick={() => { haptic('light'); setTab('owed'); }}
          >
            <span>💰</span>
            <span>يدينون لي</span>
          </button>
          <button
            className={`debts-tab ${tab === 'owing' ? 'active' : ''}`}
            onClick={() => { haptic('light'); setTab('owing'); }}
          >
            <span>💸</span>
            <span>أنا مدين</span>
          </button>
          <div
            className="debts-tab-indicator"
            style={{ transform: `translateX(${tab === 'owing' ? '-100%' : '0%'})` }}
          ></div>
        </div>

        <div className={`debts-summary ${tab}`}>
          <span className="debts-summary-label">
            {tab === 'owed' ? 'إجمالي يدينون لك' : 'إجمالي ما تدين'}
          </span>
          <span className="debts-summary-value">{format(total)}</span>
          <span className="debts-summary-count">{filtered.length} شخص</span>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">💰</span>
            <p>{tab === 'owed' ? 'لا أحد يدين لك' : 'لست مديناً لأحد'}</p>
            <button className="btn-primary empty-btn" onClick={() => { haptic('light'); setShowForm(true); }}>
              {tab === 'owed' ? 'أضف شخصاً يدين لك' : 'أضف ديناً عليك'}
            </button>
          </div>
        ) : (
          <div className="debts-list">
            {filtered.map(d => {
              const remaining = d.amount - d.paid
              const progress = (d.paid / d.amount) * 100
              const isPaid = d.paid >= d.amount

              return (
                <div key={d.id} className={`debt-item ${isPaid ? 'paid' : ''}`}>
                  <div className="debt-header">
                    <div className="debt-avatar">{d.person.charAt(0)}</div>
                    <div className="debt-info">
                      <span className="debt-person">{d.person}</span>
                      {d.note && <span className="debt-note">{d.note}</span>}
                      {d.dueDate && (
                        <span className="debt-due">
                          📅 {new Date(d.dueDate).toLocaleDateString('ar-SA')}
                        </span>
                      )}
                    </div>
                    <span className={`debt-amount ${d.type} ${isPaid ? 'paid' : ''}`}>
                      {isPaid ? '✅ مسدد' : format(remaining)}
                    </span>
                  </div>

                  <div className="debt-progress-wrapper">
                    <div className="debt-progress-bar">
                      <div
                        className="debt-progress-fill"
                        style={{
                          width: `${Math.min(progress, 100)}%`,
                          background: isPaid ? '#22c55e' : 'linear-gradient(90deg, #d4af37, #e8c65a)'
                        }}
                      ></div>
                    </div>
                    <div className="debt-progress-info">
                      <span>{progress.toFixed(0)}%</span>
                      <span>{format(d.paid)} / {format(d.amount)}</span>
                    </div>
                  </div>

                  <div className="debt-actions">
                    {!isPaid && d.type === 'owed' && (
                      <button
                        className="debt-btn whatsapp"
                        onClick={() => handleWhatsApp(d)}
                      >
                        💬 تذكير
                      </button>
                    )}
                    {!isPaid && (
                      <button
                        className="debt-btn payment"
                        onClick={() => { haptic('light'); setShowPayment(d); }}
                      >
                        💵 دفع
                      </button>
                    )}
                    {isPaid && (
                      <span className="debt-paid-badge">✅ مكتمل</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* FAB - فقط إذا فيه بيانات */}
        {filtered.length > 0 && (
          <button
            className="fab-button"
            onClick={() => { haptic('light'); setShowForm(true); }}
            aria-label="إضافة"
          >
            +
          </button>
        )}

        {/* Add Debt Modal */}
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

        {/* Payment Modal */}
        {showPayment && (
          <div className="modal-overlay" onClick={() => setShowPayment(null)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>تسجيل دفعة</h3>
                <button className="modal-close" onClick={() => setShowPayment(null)}>✕</button>
              </div>

              <div className="payment-info">
                <span className="payment-info-label">المتبقي:</span>
                <span className="payment-info-value">
                  {format(showPayment.amount - showPayment.paid)}
                </span>
              </div>

              <form onSubmit={handlePayment} className="modal-form">
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(e.target.value)}
                  placeholder="المبلغ المدفوع"
                  className="note-input"
                  autoFocus
                  required
                  max={showPayment.amount - showPayment.paid}
                />

                <div className="payment-quick">
                  {[0.25, 0.5, 1].map(ratio => {
                    const val = Math.round((showPayment.amount - showPayment.paid) * ratio)
                    return (
                      <button
                        key={ratio}
                        type="button"
                        className="payment-quick-btn"
                        onClick={() => setPaymentAmount(val.toString())}
                      >
                        {ratio === 1 ? 'كامل' : `${ratio * 100}%`}
                      </button>
                    )
                  })}
                </div>

                <button type="submit" className="btn-primary" disabled={!paymentAmount}>
                  حفظ الدفعة
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
