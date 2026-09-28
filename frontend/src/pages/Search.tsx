import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useCurrency } from '../lib/useCurrency'
import './Search.css'

interface SearchResult {
  type: 'expense' | 'income' | 'product' | 'debt'
  id: string
  title: string
  subtitle: string
  amount?: number
  date: string
  route: string
  color: string
}

function Search() {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'expense' | 'income' | 'product' | 'debt'>('all')
  const { format } = useCurrency()

  const allItems = useMemo(() => {
    const results: SearchResult[] = []

    const expenses = JSON.parse(localStorage.getItem('diwan_expenses') || '[]')
    for (const e of expenses) {
      results.push({
        type: 'expense',
        id: e.id,
        title: e.category,
        subtitle: e.note || 'مصروف',
        amount: -e.amount,
        date: e.date,
        route: '/expenses',
        color: '#ef4444',
      })
    }

    const incomes = JSON.parse(localStorage.getItem('diwan_incomes') || '[]')
    for (const i of incomes) {
      results.push({
        type: 'income',
        id: i.id,
        title: i.source,
        subtitle: i.note || 'دخل',
        amount: i.amount,
        date: i.date,
        route: '/income',
        color: '#22c55e',
      })
    }

    const products = JSON.parse(localStorage.getItem('diwan_products') || '[]')
    for (const p of products) {
      results.push({
        type: 'product',
        id: p.id,
        title: p.name,
        subtitle: `سعر: ${p.price} | مخزون: ${p.stock}`,
        amount: p.price,
        date: '',
        route: '/products',
        color: '#3b82f6',
      })
    }

    const debts = JSON.parse(localStorage.getItem('diwan_debts') || '[]')
    for (const d of debts) {
      results.push({
        type: 'debt',
        id: d.id,
        title: d.person,
        subtitle: d.type === 'owed' ? 'يدين لك' : 'أنت مدين',
        amount: d.type === 'owed' ? d.amount : -d.amount,
        date: d.createdAt,
        route: '/debts',
        color: '#8b5cf6',
      })
    }

    return results.sort((a, b) => (b.date || '').localeCompare(a.date || ''))
  }, [])

  const filtered = useMemo(() => {
    let items = allItems
    if (filter !== 'all') items = items.filter(i => i.type === filter)
    if (query.trim()) {
      const q = query.toLowerCase()
      items = items.filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.subtitle.toLowerCase().includes(q)
      )
    }
    return items.slice(0, 50)
  }, [allItems, filter, query])

  const totalAmount = filtered.reduce((s, r) => s + (r.amount || 0), 0)

  return (
    <div className="page-container search-page">
      <div className="bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <div className="page-content search-content">
        <Link to="/dashboard" className="back-btn">
          <span>→</span>
          <span>رجوع</span>
        </Link>

        <div className="search-header">
          <h1 className="search-title">البحث</h1>
          <p className="search-sub">ابحث في كل بياناتك</p>
        </div>

        {/* Search Input */}
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="ابحث في المصاريف، الدخل، المنتجات، الديون..."
            className="search-input"
            autoFocus
          />
          {query && (
            <button className="search-clear" onClick={() => setQuery('')}>✕</button>
          )}
        </div>

        {/* Filters */}
        <div className="search-filters">
          {[
            { id: 'all', label: 'الكل', icon: '📊' },
            { id: 'expense', label: 'مصاريف', icon: '💸' },
            { id: 'income', label: 'دخل', icon: '💰' },
            { id: 'product', label: 'منتجات', icon: '📦' },
            { id: 'debt', label: 'ديون', icon: '👥' },
          ].map(f => (
            <button
              key={f.id}
              className={`search-filter ${filter === f.id ? 'active' : ''}`}
              onClick={() => setFilter(f.id as any)}
            >
              <span>{f.icon}</span>
              <span>{f.label}</span>
            </button>
          ))}
        </div>

        {/* Stats */}
        {filtered.length > 0 && (
          <div className="search-stats">
            <span>{filtered.length} نتيجة</span>
            <span className={`search-total ${totalAmount >= 0 ? 'positive' : 'negative'}`}>
              {totalAmount >= 0 ? '+' : ''}{format(totalAmount)}
            </span>
          </div>
        )}

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="search-empty">
            <span className="search-empty-icon">
              {query ? '🔍' : '📭'}
            </span>
            <p>{query ? 'لا توجد نتائج' : 'اكتب للبحث'}</p>
            {query && <p className="search-empty-hint">جرّب كلمة أخرى</p>}
          </div>
        ) : (
          <div className="search-results">
            {filtered.map(r => (
              <Link
                key={`${r.type}-${r.id}`}
                to={r.route}
                className="search-result"
              >
                <div
                  className="search-result-icon"
                  style={{ background: r.color + '20', color: r.color }}
                >
                  {r.type === 'expense' && '💸'}
                  {r.type === 'income' && '💰'}
                  {r.type === 'product' && '📦'}
                  {r.type === 'debt' && '👥'}
                </div>
                <div className="search-result-info">
                  <span className="search-result-title">{r.title}</span>
                  <span className="search-result-subtitle">{r.subtitle}</span>
                </div>
                {r.amount !== undefined && (
                  <span className={`search-result-amount ${r.amount >= 0 ? 'positive' : 'negative'}`}>
                    {r.amount >= 0 ? '+' : ''}{format(r.amount)}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Search
