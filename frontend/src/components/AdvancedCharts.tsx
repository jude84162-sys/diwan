import { useEffect, useState } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useCurrency } from '../lib/useCurrency'
import './AdvancedCharts.css'

interface DayData {
  day: string
  income: number
  expense: number
  profit: number
}

function AdvancedCharts() {
  const [data, setData] = useState<DayData[]>([])
  const [view, setView] = useState<'week' | 'month'>('week')
  const { format } = useCurrency()

  useEffect(() => {
    const expenses = JSON.parse(localStorage.getItem('diwan_expenses') || '[]')
    const incomes = JSON.parse(localStorage.getItem('diwan_incomes') || '[]')

    const now = new Date()
    const days = view === 'week' ? 7 : 30
    const result: DayData[] = []

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dateStr = date.toDateString()

      const dayIncome = incomes
        .filter((inc: any) => new Date(inc.date).toDateString() === dateStr)
        .reduce((s: number, inc: any) => s + inc.amount, 0)

      const dayExpense = expenses
        .filter((exp: any) => new Date(exp.date).toDateString() === dateStr)
        .reduce((s: number, exp: any) => s + exp.amount, 0)

      result.push({
        day: view === 'week'
          ? ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'][date.getDay()]
          : `${date.getDate()}`,
        income: dayIncome,
        expense: dayExpense,
        profit: dayIncome - dayExpense,
      })
    }

    setData(result)
  }, [view])

  return (
    <div className="adv-charts">
      <div className="adv-charts-header">
        <h2 className="adv-charts-title">📈 تحليل الأداء</h2>
        <div className="adv-charts-toggle">
          <button
            className={`adv-toggle-btn ${view === 'week' ? 'active' : ''}`}
            onClick={() => setView('week')}
          >
            7 أيام
          </button>
          <button
            className={`adv-toggle-btn ${view === 'month' ? 'active' : ''}`}
            onClick={() => setView('month')}
          >
            30 يوم
          </button>
        </div>
      </div>

      {/* Bar Chart - Income vs Expense */}
      <div className="adv-chart-block">
        <h3 className="adv-chart-label">الدخل مقابل المصاريف</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="day" stroke="rgba(255,255,255,0.5)" fontSize={10} />
            <YAxis stroke="rgba(255,255,255,0.5)" fontSize={10} />
            <Tooltip
              contentStyle={{
                background: '#0f3d26',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                borderRadius: 8,
                fontFamily: 'Cairo',
              }}
              formatter={(value) => format(Number(value))}
            />
            <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Line Chart - Profit Trend */}
      <div className="adv-chart-block">
        <h3 className="adv-chart-label">اتجاه الربح</h3>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="day" stroke="rgba(255,255,255,0.5)" fontSize={10} />
            <YAxis stroke="rgba(255,255,255,0.5)" fontSize={10} />
            <Tooltip
              contentStyle={{
                background: '#0f3d26',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                borderRadius: 8,
                fontFamily: 'Cairo',
              }}
              formatter={(value) => format(Number(value))}
            />
            <Line
              type="monotone"
              dataKey="profit"
              stroke="#d4af37"
              strokeWidth={3}
              dot={{ fill: '#d4af37', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default AdvancedCharts
