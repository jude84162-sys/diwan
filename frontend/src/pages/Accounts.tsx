import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useCurrency } from '../lib/useCurrency'
import './Accounts.css'

interface Expense {
  amount: number
  date: string
}

interface Income {
  amount: number
  date: string
}

function Accounts() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [incomes, setIncomes] = useState<Income[]>([])
  const { format } = useCurrency()

  useEffect(() => {
    const e = localStorage.getItem('diwan_expenses')
    const i = localStorage.getItem('diwan_incomes')
    if (e) setExpenses(JSON.parse(e))
    if (i) setIncomes(JSON.parse(i))
  }, [])

  const totalIncome = incomes.reduce((s, i) => s + i.amount, 0)
  const totalExpense = expenses.reduce((s, e) => s + e.amount, 0)
  const balance = totalIncome - totalExpense

  const accounts = [
    { id: 'cash', icon: '💵', name: 'نقد', amount: balance * 0.4, color: '#22c55e' },
    { id: 'bank', icon: '🏦', name: 'بنك', amount: balance * 0.4, color: '#3b82f6' },
    { id: 'card', icon: '💳', name: 'بطاقة', amount: balance * 0.1, color: '#8b5cf6' },
    { id: 'wallet', icon: '📱', name: 'محفظة', amount: balance * 0.1, color: '#f59e0b' },
  ]

  return (
    <div className="page-container accounts-page">
      <div className="bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <div className="page-content accounts-content">
        <Link to="/dashboard" className="back-btn">
          <span>→</span>
          <span>رجوع</span>
        </Link>

        <div className="accounts-header">
          <h1 className="accounts-title">الحسابات</h1>
          <p className="accounts-sub">كل أموالك في مكان واحد</p>
        </div>

        {/* Total */}
        <div className="accounts-total">
          <span className="accounts-total-label">الرصيد الإجمالي</span>
          <span className={`accounts-total-value ${balance >= 0 ? 'positive' : 'negative'}`}>
            {format(balance)}
          </span>
          <div className="accounts-total-row">
            <span>💰 دخل: {format(totalIncome)}</span>
            <span>💸 مصروف: {format(totalExpense)}</span>
          </div>
        </div>

        {/* Accounts */}
        <div className="accounts-list">
          {accounts.map(acc => (
            <div key={acc.id} className="account-item">
              <div className="account-icon" style={{ background: acc.color + '20', color: acc.color }}>
                {acc.icon}
              </div>
              <div className="account-info">
                <span className="account-name">{acc.name}</span>
                <div className="account-bar">
                  <div 
                    className="account-bar-fill"
                    style={{ 
                      width: `${Math.min(Math.abs(acc.amount / balance) * 100, 100)}%`,
                      background: acc.color,
                    }}
                  ></div>
                </div>
              </div>
              <span className={`account-amount ${acc.amount >= 0 ? 'positive' : 'negative'}`}>
                {format(acc.amount)}
              </span>
            </div>
          ))}
        </div>

        <div className="accounts-info">
          <p>💡 الأرصدة موزّعة تقديرياً</p>
          <p>قريباً: ربط بنكي حقيقي</p>
        </div>
      </div>
    </div>
  )
}

export default Accounts
