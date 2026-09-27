import { useState } from 'react'
import './DateRangePicker.css'

export interface DateRange {
  from: string  // YYYY-MM-DD
  to: string    // YYYY-MM-DD
  label: string
}

interface Props {
  value: DateRange
  onChange: (range: DateRange) => void
}

const PRESETS = [
  { id: 'today', label: 'اليوم', icon: '📅' },
  { id: 'yesterday', label: 'أمس', icon: '📆' },
  { id: 'week', label: 'هذا الأسبوع', icon: '🗓️' },
  { id: 'month', label: 'هذا الشهر', icon: '📊' },
  { id: 'lastMonth', label: 'الشهر الماضي', icon: '📈' },
  { id: 'year', label: 'هذا العام', icon: '🎯' },
  { id: 'custom', label: 'مخصص', icon: '✏️' },
]

function toISO(date: Date): string {
  return date.toISOString().split('T')[0]
}

function getPresetRange(presetId: string): DateRange {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  switch (presetId) {
    case 'today':
      return { from: toISO(today), to: toISO(today), label: 'اليوم' }
    case 'yesterday': {
      const y = new Date(today)
      y.setDate(y.getDate() - 1)
      return { from: toISO(y), to: toISO(y), label: 'أمس' }
    }
    case 'week': {
      const weekStart = new Date(today)
      const day = weekStart.getDay()
      const diff = day === 6 ? 0 : day + 1
      weekStart.setDate(weekStart.getDate() - diff)
      return { from: toISO(weekStart), to: toISO(today), label: 'هذا الأسبوع' }
    }
    case 'month': {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      return { from: toISO(monthStart), to: toISO(today), label: 'هذا الشهر' }
    }
    case 'lastMonth': {
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
      return { from: toISO(lastMonthStart), to: toISO(lastMonthEnd), label: 'الشهر الماضي' }
    }
    case 'year': {
      const yearStart = new Date(now.getFullYear(), 0, 1)
      return { from: toISO(yearStart), to: toISO(today), label: 'هذا العام' }
    }
    default:
      return { from: toISO(today), to: toISO(today), label: 'اليوم' }
  }
}

function DateRangePicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [customFrom, setCustomFrom] = useState(value.from)
  const [customTo, setCustomTo] = useState(value.to)

  const applyPreset = (presetId: string) => {
    if (presetId === 'custom') {
      setOpen(true)
      return
    }
    onChange(getPresetRange(presetId))
    setOpen(false)
  }

  const applyCustom = () => {
    if (!customFrom || !customTo) return
    onChange({
      from: customFrom,
      to: customTo,
      label: 'مخصص',
    })
    setOpen(false)
  }

  return (
    <>
      <button className="drp-trigger" onClick={() => setOpen(true)}>
        <span className="drp-trigger-icon">📅</span>
        <span className="drp-trigger-label">{value.label}</span>
        <span className="drp-trigger-chevron">▾</span>
      </button>

      {open && (
        <div className="drp-overlay" onClick={() => setOpen(false)}>
          <div className="drp-modal" onClick={e => e.stopPropagation()}>
            <div className="drp-header">
              <h3>اختر الفترة</h3>
              <button className="drp-close" onClick={() => setOpen(false)}>✕</button>
            </div>

            <div className="drp-presets">
              {PRESETS.map(p => (
                <button
                  key={p.id}
                  className={`drp-preset ${value.label === p.label ? 'active' : ''}`}
                  onClick={() => applyPreset(p.id)}
                >
                  <span>{p.icon}</span>
                  <span>{p.label}</span>
                </button>
              ))}
            </div>

            <div className="drp-custom">
              <h4>أو اختر تاريخاً مخصصاً</h4>
              <div className="drp-inputs">
                <div className="drp-input-group">
                  <label>من</label>
                  <input
                    type="date"
                    value={customFrom}
                    onChange={e => setCustomFrom(e.target.value)}
                    max={customTo}
                    dir="ltr"
                  />
                </div>
                <div className="drp-input-group">
                  <label>إلى</label>
                  <input
                    type="date"
                    value={customTo}
                    onChange={e => setCustomTo(e.target.value)}
                    min={customFrom}
                    dir="ltr"
                  />
                </div>
              </div>
              <button className="drp-apply" onClick={applyCustom}>
                تطبيق
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default DateRangePicker
