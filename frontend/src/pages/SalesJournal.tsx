import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useCurrency } from '../lib/useCurrency'
import './SalesJournal.css'

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

interface DayData {
  day: number
  dayName: string
  date: string
  isToday: boolean
  income: number
  expense: number
  profit: number
  debtsAdded: number
  debtsPaid: number
  hasData: boolean
}

const ARABIC_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
]

const ARABIC_DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']

function SalesJournal() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [incomes, setIncomes] = useState<Income[]>([])
  const [debts, setDebts] = useState<Debt[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showEmpty, setShowEmpty] = useState(true)
  const { format } = useCurrency()

  useEffect(() => {
    const e = localStorage.getItem('diwan_expenses')
    const i = localStorage.getItem('diwan_incomes')
    const d = localStorage.getItem('diwan_debts')
    if (e) setExpenses(JSON.parse(e))
    if (i) setIncomes(JSON.parse(i))
    if (d) setDebts(JSON.parse(d))
  }, [])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // بناء بيانات كل يوم
  const daysData: DayData[] = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const today = new Date()
    const todayStr = today.toDateString()

    const data: DayData[] = []

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dateStr = date.toDateString()

      const dayIncomes = incomes.filter(i => new Date(i.date).toDateString() === dateStr)
      const dayExpenses = expenses.filter(e => new Date(e.date).toDateString() === dateStr)
      const dayDebtsAdded = debts.filter(d => 
        new Date(d.createdAt).toDateString() === dateStr && d.type === 'owed'
      )

      const income = dayIncomes.reduce((s, i) => s + i.amount, 0)
      const expense = dayExpenses.reduce((s, e) => s + e.amount, 0)
      const debtsAdded = dayDebtsAdded.reduce((s, d) => s + d.amount, 0)

      data.push({
        day,
        dayName: ARABIC_DAYS[date.getDay()],
        date: `${day}/${month + 1}`,
        isToday: dateStr === todayStr,
        income,
        expense,
        profit: income - expense,
        debtsAdded,
        debtsPaid: 0,
        hasData: income > 0 || expense > 0 || debtsAdded > 0,
      })
    }

    return data
  }, [incomes, expenses, debts, year, month])

  // الإجماليات
  const totals = useMemo(() => {
    return daysData.reduce((acc, d) => ({
      income: acc.income + d.income,
      expense: acc.expense + d.expense,
      profit: acc.profit + d.profit,
      debts: acc.debts + d.debtsAdded,
    }), { income: 0, expense: 0, profit: 0, debts: 0 })
  }, [daysData])

  // التنقل بين الشهور
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))
  const goToToday = () => setCurrentDate(new Date())

  // الأيام المعروضة
  const displayDays = showEmpty ? daysData : daysData.filter(d => d.hasData)

  // تصدير CSV
  const exportCSV = () => {
    const headers = ['اليوم', 'التاريخ', 'الدخل', 'المصروف', 'الربح', 'الديون']
    const rows = daysData.map(d => [
      d.dayName,
      d.date,
      d.income,
      d.expense,
      d.profit,
      d.debtsAdded,
    ])

    const csv = [
      headers.join(','),
      ...rows.map(r => r.join(',')),
      '',
      ['الإجمالي', '', totals.income, totals.expense, totals.profit, totals.debts].join(','),
    ].join('\n')

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `diwan-${ARABIC_MONTHS[month]}-${year}.csv`
    a.click()
  }

  const isCurrentMonth = 
    currentDate.getMonth() === new Date().getMonth() && 
    currentDate.getFullYear() === new Date().getFullYear()

  return (
    <div className="page-container journal-page">
      <div className="bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <div className="page-content journal-content">
        <Link to="/dashboard" className="back-btn">
          <span>→</span>
          <span>رجوع</span>
        </Link>

        <div className="journal-header">
          <h1 className="journal-title">دفتر المبيعات</h1>
          <p className="journal-sub">سجل كل يوم في الشهر</p>
        </div>

        {/* Month Navigation */}
        <div className="month-nav">
          <button className="month-btn" onClick={prevMonth} aria-label="الشهر السابق">
            ›
          </button>
          <button className="month-current" onClick={goToToday}>
            {ARABIC_MONTHS[month]} {year}
          </button>
          <button 
            className="month-btn" 
            onClick={nextMonth}
            disabled={isCurrentMonth}
            aria-label="الشهر التالي"
          >
            ‹
          </button>
        </div>

        {/* Summary Cards */}
        <div className="summary-grid">
          <div className="summary-card income">
            <span className="summary-card-label">💰 دخل</span>
            <span className="summary-card-value">{format(totals.income)}</span>
          </div>
          <div className="summary-card expense">
            <span className="summary-card-label">💸 مصروف</span>
            <span className="summary-card-value">{format(totals.expense)}</span>
          </div>
          <div className="summary-card profit">
            <span className="summary-card-label">📊 ربح</span>
            <span className={`summary-card-value ${totals.profit >= 0 ? 'positive' : 'negative'}`}>
              {format(totals.profit)}
            </span>
          </div>
          <div className="summary-card debts">
            <span className="summary-card-label">👥 ديون</span>
            <span className="summary-card-value">{format(totals.debts)}</span>
          </div>
        </div>

        {/* Filters */}
        <div className="journal-filters">
          <button 
            className={`filter-btn ${showEmpty ? 'active' : ''}`}
            onClick={() => setShowEmpty(true)}
          >
            كل الأيام
          </button>
          <button 
            className={`filter-btn ${!showEmpty ? 'active' : ''}`}
            onClick={() => setShowEmpty(false)}
          >
            فقط اللي فيها عمليات
          </button>
          <button className="export-btn" onClick={exportCSV}>
            📥 CSV
          </button>
        </div>

        {/* Table */}
        {displayDays.length === 0 ? (
          <div className="journal-empty">
            <span className="journal-empty-icon">📅</span>
            <p>لا توجد عمليات في هذا الشهر</p>
            <Link to="/income" className="btn-primary">أضف أول دخل</Link>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="journal-table">
              <thead>
                <tr>
                  <th>اليوم</th>
                  <th>التاريخ</th>
                  <th>دخل</th>
                  <th>مصروف</th>
                  <th>ربح</th>
                  <th>ديون</th>
                </tr>
              </thead>
              <tbody>
                {displayDays.map(d => (
                  <tr 
                    key={d.day} 
                    className={`${d.isToday ? 'today' : ''} ${!d.hasData ? 'empty' : ''}`}
                  >
                    <td className="day-name">
                      {d.dayName}
                      {d.isToday && <span className="today-badge">اليوم</span>}
                    </td>
                    <td className="day-date">{d.date}</td>
                    <td className="num income">
                      {d.income > 0 ? format(d.income) : '—'}
                    </td>
                    <td className="num expense">
                      {d.expense > 0 ? format(d.expense) : '—'}
                    </td>
                    <td className={`num profit ${d.profit >= 0 ? 'positive' : 'negative'}`}>
                      {d.hasData ? format(d.profit) : '—'}
                    </td>
                    <td className="num debts">
                      {d.debtsAdded > 0 ? format(d.debtsAdded) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={2} className="total-label">📊 الإجمالي</td>
                  <td className="num income">{format(totals.income)}</td>
                  <td className="num expense">{format(totals.expense)}</td>
                  <td className={`num profit ${totals.profit >= 0 ? 'positive' : 'negative'}`}>
                    {format(totals.profit)}
                  </td>
                  <td className="num debts">{format(totals.debts)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        <div className="journal-footer">
          <p>📊 كل عملية تُسجّل في يومها</p>
          <p className="journal-hint">💡 اضغط على اسم الشهر للعودة لليوم</p>
        </div>
      </div>
    </div>
  )
}

export default SalesJournal
