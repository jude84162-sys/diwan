import { useState, useEffect } from 'react'
import { COUNTRIES, getCountry, formatPhoneNumber } from '../lib/countries'
import { useCountry } from '../lib/useCountry'
import './CountryPicker.css'

interface Props {
  onSelect?: (code: string) => void
}

function CountryPicker({ onSelect }: Props) {
  const { country, changeCountry } = useCountry()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const current = getCountry(country)

  const filtered = COUNTRIES.filter(c =>
    c.name.includes(search) ||
    c.dialCode.includes(search) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const handleSelect = (code: string) => {
    changeCountry(code)
    onSelect?.(code)
    setOpen(false)
    setSearch('')
  }

  return (
    <>
      <button
        type="button"
        className="country-trigger"
        onClick={() => setOpen(true)}
      >
        <span className="country-flag">{current.flag}</span>
        <span className="country-code">{current.dialCode}</span>
        <span className="country-chevron">▾</span>
      </button>

      {open && (
        <div className="country-overlay" onClick={() => setOpen(false)}>
          <div className="country-modal" onClick={e => e.stopPropagation()}>
            <div className="country-modal-header">
              <h3>اختر الدولة</h3>
              <button className="country-close" onClick={() => setOpen(false)}>✕</button>
            </div>

            <input
              type="text"
              className="country-search"
              placeholder="ابحث... (سوريا، +963، SY)"
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />

            <div className="country-list">
              {filtered.map(c => (
                <button
                  key={c.code}
                  type="button"
                  className={`country-item ${c.code === country ? 'active' : ''}`}
                  onClick={() => handleSelect(c.code)}
                >
                  <span className="country-item-flag">{c.flag}</span>
                  <div className="country-item-info">
                    <span className="country-item-name">{c.name}</span>
                    <span className="country-item-dial">
                      {c.dialCode} • {formatPhoneNumber(c.example, c.format)}
                    </span>
                  </div>
                  {c.code === country && <span className="country-check">✓</span>}
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="country-empty">لا توجد نتائج</div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default CountryPicker
