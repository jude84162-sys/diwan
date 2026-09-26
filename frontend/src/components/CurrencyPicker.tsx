import { useState, useEffect } from 'react'
import { CURRENCIES, getCurrency } from '../lib/currencies'
import { useCurrency } from '../lib/useCurrency'
import './CurrencyPicker.css'

function CurrencyPicker() {
  const { currency, changeCurrency } = useCurrency()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const current = getCurrency(currency)

  const filtered = CURRENCIES.filter(c =>
    c.name.includes(search) ||
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.country.includes(search)
  )

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      <button className="currency-trigger" onClick={() => setOpen(true)}>
        <span className="currency-flag">{current.flag}</span>
        <span className="currency-code">{current.code}</span>
        <span className="currency-chevron">▾</span>
      </button>

      {open && (
        <div className="currency-overlay" onClick={() => setOpen(false)}>
          <div className="currency-modal" onClick={e => e.stopPropagation()}>
            <div className="currency-modal-header">
              <h3>اختر العملة</h3>
              <button className="currency-close" onClick={() => setOpen(false)}>✕</button>
            </div>

            <input
              type="text"
              className="currency-search"
              placeholder="ابحث... (سوريا، دولار، SYP)"
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />

            <div className="currency-list">
              {filtered.map(c => (
                <button
                  key={c.code}
                  className={`currency-item ${c.code === currency ? 'active' : ''}`}
                  onClick={() => { changeCurrency(c.code); setOpen(false); setSearch('') }}
                >
                  <span className="currency-item-flag">{c.flag}</span>
                  <div className="currency-item-info">
                    <span className="currency-item-name">{c.name}</span>
                    <span className="currency-item-country">{c.country} • {c.code}</span>
                  </div>
                  {c.code === currency && <span className="currency-check">✓</span>}
                </button>
              ))}
              {filtered.length === 0 && <div className="currency-empty">لا توجد نتائج</div>}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default CurrencyPicker
