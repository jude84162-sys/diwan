import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useCurrency } from '../lib/useCurrency'
import DateRangePicker, { DateRange } from '../components/DateRangePicker'
import './Reports.css'

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

function Reports() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [incomes, setIncomes] = useState<Income[]>([])
  const { format } = useCurrency()

  const today = new Date()
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
  const [range, setRange] = useState<DateRange>({
    from: monthStart.toISOString().split('T')[0],
    to: today.toISOString().split('T')[0],
    label: 'هذا الشهر',
  })

  useEffect(() => {
    const e = localStorage.getItem('diwan_expenses')
    const i = localStorage.getItem('diwan_incomes')
    if (e) setExpenses(JSON.parse(e))
    if (i) setIncomes(JSON.parse(i))
  }, [])

  const filtered = useMemo(() => {
    const fromTime = new Date(range.from).getTime()
    const toTime = new Date(range.to).setHours(23, 59, 59, 999)

    const fExpenses = expenses.filter(e => {
      const t = new Date(e.date).getTime()
      return t >= fromTime && t <= toTime
    })

    const fIncomes = incomes.filter(i => {
      const t = new Date(i.date).getTime()
      return t >= fromTime && t <= toTime
    })

    return { expenses: fExpenses, incomes: fIncomes }
  }, [expenses, incomes, range])

  const totalIncome = filtered.incomes.reduce((s, i) => s + i.amount, 0)
  const totalExpense = filtered.expenses.reduce((s, e) => s + e.amount, 0)
  const profit = totalIncome - totalExpense
  const margin = totalIncome > 0 ? ((profit / totalIncome) * 100).toFixed(1) : '0'

  // الفئات
  const byCategory = CATEGORIES.map(c => ({
    ...c,
    total: filtered.expenses.filter(e => e.category === c.id).reduce((s, e) => s + e.amount, 0),
  })).filter(c => c.total > 0).sort((a, b) => b.total - a.total)

  const topCategory = byCategory[0]

  // تصدير CSV
  const exportCSV = () => {
    const rows = [
      ['التاريخ', 'النوع', 'الفئة', 'المبلغ', 'ملاحظة'],
      ...filtered.incomes.map(i => [
        new Date(i.date).toLocaleDateString('ar-SA'),
        'دخل',
        i.source,
        i.amount,
        i.note || '',
      ]),
      ...filtered.expenses.map(e => [
        new Date(e.date).toLocaleDateString('ar-SA'),
        'مصروف',
        e.category,
        e.amount,
        e.note || '',
      ]),
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `diwan-report-${range.from}-${range.to}.csv`
    a.click()
  }

  return (
    <div className="page-container reports-page">
      <div className="bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <div className="page-content reports-content">
        <Link to="/dashboard" className="back-btn">
          <span>→</span>
          <span>رجوع</span>
        </Link>

        <div className="reports-header">
          <h1 className="reports-title">التقارير</h1>
          <p className="reports-sub">تحليل شامل لأدائك</p>
        </div>

        {/* Date Range */}
        <div className="reports-filter">
          <DateRangePicker value={range} onChange={setRange} />
          <button className="reports-export" onClick={exportCSV} title="تصدير CSV">
            📥
          </button>
        </div>

        {/* Summary Cards */}
        <div className="reports-summary">
          <div className="report-card income">
            <span className="report-label">💰 دخل</span>
            <span className="report-value positive">{format(totalIncome)}</span>
          </div>
          <div className="report-card expense">
            <span className="report-label">💸 مصروف</span>
            <span className="report-value negative">{format(totalExpense)}</span>
          </div>
          <div className="report-card profit">
            <span className="report-label">📊 ربح</span>
            <span className={`report-value ${profit >= 0 ? 'positive' : 'negative'}`}>
              {format(profit)}
            </span>
          </div>
          <div className="report-card margin">
            <span className="report-label">📈 هامش</span>
            <span className="report-value">{margin}%</span>
          </div>
        </div>

        {/* Top Category */}
        {topCategory && (
          <div className="reports-top">
            <span className="reports-top-label">🏆 أعلى فئة مصاريف</span>
            <div className="reports-top-content">
              <span className="reports-top-icon">{topCategory.icon}</span>
              <span className="reports-top-name">{topCategory.name}</span>
              <span className="reports-top-amount">{format(topCategory.total)}</span>
            </div>
          </div>
        )}

        {/* Categories Breakdown */}
        {byCategory.length > 0 && (
          <div className="reports-section">
            <h2 className="reports-section-title">المصاريف حسب الفئة</h2>
            <div className="reports-categories">
              {byCategory.map(c => (
                <div key={c.id} className="report-cat-item">
                  <div className="report-cat-icon" style={{ background: c.color + '20', color: c.color }}>
                    {c.icon}
                  </div>
                  <div className="report-cat-info">
                    <div className="report-cat-header">
                      <span className="report-cat-name">{c.name}</span>
                      <span className="report-cat-amount">{format(c.total)}</span>
                    </div>
                    <div className="report-cat-bar">
                      <div
                        className="report-cat-bar-fill"
                        style={{
                          width: `${(c.total / totalExpense) * 100}%`,
                          background: c.color,
                        }}
                      ></div>
                    </div>
                    <span className="report-cat-percent">
                      {((c.total / totalExpense) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty */}
        {byCategory.length === 0 && filtered.incomes.length === 0 && (
          <div className="reports-empty">
            <span className="reports-empty-icon">📊</span>
            <p>لا توجد بيانات في هذه الفترة</p>
            <Link to="/expenses" className="btn-primary">أضف أول مصروف</Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default Reports
