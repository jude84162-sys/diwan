import { Link } from 'react-router-dom'
import { useCurrency } from '../lib/useCurrency'
import './Reports.css'

function Reports() {
  const { format } = useCurrency()

  const sales = 1240
  const expenses = JSON.parse(localStorage.getItem('diwan_expenses') || '[]')
  const todayExpenses = expenses
    .filter((e: any) => new Date(e.date).toDateString() === new Date().toDateString())
    .reduce((s: number, e: any) => s + e.amount, 0)

  const monthExpenses = expenses
    .filter((e: any) => {
      const d = new Date(e.date)
      const now = new Date()
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
    .reduce((s: number, e: any) => s + e.amount, 0)

  const netProfit = sales - todayExpenses
  const monthProfit = sales * 30 - monthExpenses

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
          <p className="reports-sub">ملخص شامل لأداء تجارتك</p>
        </div>

        <div className="report-card">
          <span className="report-label">تقرير اليوم</span>
          <div className="report-row">
            <span>المبيعات</span>
            <span className="positive">+{format(sales)}</span>
          </div>
          <div className="report-row">
            <span>المصاريف</span>
            <span className="negative">-{format(todayExpenses)}</span>
          </div>
          <div className="report-divider"></div>
          <div className="report-row report-total">
            <span>صافي الربح</span>
            <span>{format(netProfit)}</span>
          </div>
        </div>

        <div className="report-card">
          <span className="report-label">تقرير الشهر</span>
          <div className="report-row">
            <span>المبيعات</span>
            <span className="positive">+{format(sales * 30)}</span>
          </div>
          <div className="report-row">
            <span>المصاريف</span>
            <span className="negative">-{format(monthExpenses)}</span>
          </div>
          <div className="report-divider"></div>
          <div className="report-row report-total">
            <span>صافي الربح</span>
            <span>{format(monthProfit)}</span>
          </div>
        </div>

        <div className="report-info">
          <p>📊 تقارير مفصلة قادمة قريباً</p>
        </div>
      </div>
    </div>
  )
}

export default Reports
