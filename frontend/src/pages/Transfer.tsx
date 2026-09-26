import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCurrency } from '../lib/useCurrency'
import './Transfer.css'

const ACCOUNTS = [
  { id: 'cash', icon: '💵', name: 'نقد', color: '#22c55e' },
  { id: 'bank', icon: '🏦', name: 'بنك', color: '#3b82f6' },
  { id: 'card', icon: '💳', name: 'بطاقة', color: '#8b5cf6' },
  { id: 'wallet', icon: '📱', name: 'محفظة', color: '#f59e0b' },
]

function Transfer() {
  const [amount, setAmount] = useState('')
  const [from, setFrom] = useState('cash')
  const [to, setTo] = useState('bank')
  const [note, setNote] = useState('')
  const { format } = useCurrency()
  const navigate = useNavigate()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!amount || from === to) return

    const transfer = {
      id: Date.now().toString(),
      amount: parseFloat(amount),
      from,
      to,
      note,
      date: new Date().toISOString(),
    }

    const saved = JSON.parse(localStorage.getItem('diwan_transfers') || '[]')
    localStorage.setItem('diwan_transfers', JSON.stringify([transfer, ...saved]))

    navigate('/dashboard')
  }

  const fromAcc = ACCOUNTS.find(a => a.id === from)
  const toAcc = ACCOUNTS.find(a => a.id === to)

  return (
    <div className="page-container transfer-page">
      <div className="bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <div className="page-content transfer-content">
        <Link to="/dashboard" className="back-btn">
          <span>→</span>
          <span>رجوع</span>
        </Link>

        <div className="transfer-header">
          <div className="transfer-header-icon">🔄</div>
          <h1 className="transfer-title">تحويل</h1>
          <p className="transfer-sub">انقل المال بين حساباتك</p>
        </div>

        <form onSubmit={handleSubmit} className="transfer-form">
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

          <div className="transfer-row">
            <div className="transfer-account">
              <label>من</label>
              <div className="account-picker">
                {ACCOUNTS.map(a => (
                  <button
                    key={a.id}
                    type="button"
                    className={`account-chip ${from === a.id ? 'active' : ''}`}
                    onClick={() => setFrom(a.id)}
                    style={from === a.id ? {
                      background: a.color + '20',
                      borderColor: a.color,
                      color: a.color,
                    } : {}}
                  >
                    <span>{a.icon}</span>
                    <span>{a.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="transfer-arrow">↓</div>

            <div className="transfer-account">
              <label>إلى</label>
              <div className="account-picker">
                {ACCOUNTS.map(a => (
                  <button
                    key={a.id}
                    type="button"
                    className={`account-chip ${to === a.id ? 'active' : ''}`}
                    onClick={() => setTo(a.id)}
                    disabled={a.id === from}
                    style={to === a.id ? {
                      background: a.color + '20',
                      borderColor: a.color,
                      color: a.color,
                    } : {}}
                  >
                    <span>{a.icon}</span>
                    <span>{a.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="ملاحظة (اختياري)"
            className="note-input"
          />

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={!amount || from === to}
          >
            تحويل
          </button>

          {from === to && (
            <p className="transfer-error">⚠️ اختر حسابين مختلفين</p>
          )}
        </form>

        {/* Preview */}
        {amount && from !== to && (
          <div className="transfer-preview">
            <div className="preview-row">
              <span>{fromAcc?.icon} {fromAcc?.name}</span>
              <span className="preview-amount negative">-{format(parseFloat(amount))}</span>
            </div>
            <div className="preview-divider">↓</div>
            <div className="preview-row">
              <span>{toAcc?.icon} {toAcc?.name}</span>
              <span className="preview-amount positive">+{format(parseFloat(amount))}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Transfer
