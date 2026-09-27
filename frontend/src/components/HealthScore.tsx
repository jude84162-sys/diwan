import { useCurrency } from '../lib/useCurrency'
import './HealthScore.css'

interface Props {
  income: number
  expense: number
  profit: number
  margin: number
}

function HealthScore({ income, expense, profit, margin }: Props) {
  const { format } = useCurrency()

  // حساب النقاط (0-100)
  let score = 0

  // 1. هامش الربح (40 نقطة)
  if (margin >= 30) score += 40
  else if (margin >= 20) score += 30
  else if (margin >= 10) score += 20
  else if (margin >= 5) score += 10

  // 2. الربح (30 نقطة)
  if (profit > 0) {
    if (profit > expense * 2) score += 30
    else if (profit > expense) score += 20
    else score += 10
  }

  // 3. النشاط (30 نقطة)
  if (income > 0) {
    if (income > expense * 3) score += 30
    else if (income > expense * 2) score += 20
    else if (income > expense) score += 15
  }

  const level = score >= 80 ? 'ممتاز' : score >= 60 ? 'جيد' : score >= 40 ? 'مقبول' : 'ضعيف'
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#86efac' : score >= 40 ? '#f59e0b' : '#ef4444'
  const emoji = score >= 80 ? '🏆' : score >= 60 ? '👍' : score >= 40 ? '⚠️' : '🚨'

  // نصائح
  const tips: string[] = []
  if (margin < 20) tips.push('حاول ترفع هامش الربح فوق 20%')
  if (profit <= 0) tips.push('المصاريف تتجاوز الدخل!')
  if (income < expense * 2) tips.push('زِد المبيعات أو قلل المصاريف')
  if (tips.length === 0) tips.push('استمر! أداء ممتاز')

  return (
    <div className="health-score">
      <div className="health-score-header">
        <span className="health-score-icon">{emoji}</span>
        <div className="health-score-title">
          <span className="health-score-label">صحة مالية</span>
          <span className="health-score-level" style={{ color }}>{level}</span>
        </div>
        <span className="health-score-value" style={{ color }}>
          {score}<span className="health-score-max">/100</span>
        </span>
      </div>

      <div className="health-score-bar">
        <div
          className="health-score-bar-fill"
          style={{ width: `${score}%`, background: color }}
        ></div>
      </div>

      <div className="health-score-tips">
        {tips.map((tip, i) => (
          <div key={i} className="health-score-tip">
            <span>💡</span>
            <span>{tip}</span>
          </div>
        ))}
      </div>

      <div className="health-score-stats">
        <div className="health-stat">
          <span className="health-stat-label">دخل</span>
          <span className="health-stat-value positive">{format(income)}</span>
        </div>
        <div className="health-stat">
          <span className="health-stat-label">مصروف</span>
          <span className="health-stat-value negative">{format(expense)}</span>
        </div>
        <div className="health-stat">
          <span className="health-stat-label">هامش</span>
          <span className="health-stat-value">{margin.toFixed(0)}%</span>
        </div>
      </div>
    </div>
  )
}

export default HealthScore
