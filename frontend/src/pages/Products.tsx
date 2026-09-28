import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCurrency } from '../lib/useCurrency'
import './Products.css'

interface Product {
  id: string
  name: string
  price: number
  cost: number
  stock: number
  category: string
}

const CATEGORIES = [
  { id: 'food', icon: '🍞', name: 'أغذية', color: '#22c55e' },
  { id: 'drink', icon: '🥤', name: 'مشروبات', color: '#3b82f6' },
  { id: 'clean', icon: '🧴', name: 'منظفات', color: '#06b6d4' },
  { id: 'stationery', icon: '✏️', name: 'مكتبة', color: '#f59e0b' },
  { id: 'school', icon: '📚', name: 'قرطاسية مدرسية', color: '#8b5cf6' },
  { id: 'office', icon: '📎', name: 'أدوات مكتبية', color: '#ec4899' },
  { id: 'other', icon: '📦', name: 'أخرى', color: '#6b7280' },
]

// منتجات جاهزة للمكتبة
const STATIONERY_TEMPLATES = [
  { icon: '✏️', name: 'قلم رصاص' },
  { icon: '🖊️', name: 'قلم أزرق' },
  { icon: '🖍️', name: 'قلم أحمر' },
  { icon: '✏️', name: 'محاية' },
  { icon: '📏', name: 'مسطرة' },
  { icon: '📐', name: 'مثلث' },
  { icon: '📓', name: 'دفتر' },
  { icon: '📒', name: 'كشكول' },
  { icon: '📔', name: 'مذكرة' },
  { icon: '📎', name: 'مشابك ورق' },
  { icon: '🗂️', name: 'ملف' },
  { icon: '📁', name: 'حافظة أوراق' },
  { icon: '🎨', name: 'علبة ألوان' },
  { icon: '🖌️', name: 'فرشاة رسم' },
  { icon: '📌', name: 'دباسة' },
  { icon: '📌', name: 'دبابيس' },
  { icon: '🔖', name: 'ملصقات' },
  { icon: '📝', name: 'ورق A4' },
  { icon: '📋', name: 'لوح كتابة' },
  { icon: '🧮', name: 'آلة حاسبة' },
  { icon: '📅', name: 'أجندة' },
  { icon: '📖', name: 'كتاب' },
  { icon: '🗒️', name: 'ورق ملاحظات' },
  { icon: '✂️', name: 'مقص' },
  { icon: '📌', name: 'لاصق' },
  { icon: '🖇️', name: 'مشابك' },
]

function Products() {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('diwan_products')
    return saved ? JSON.parse(saved) : []
  })

  const [filter, setFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [cost, setCost] = useState('')
  const [stock, setStock] = useState('')
  const [category, setCategory] = useState('food')
  const { format } = useCurrency()

  const save = (data: Product[]) => {
    setProducts(data)
    localStorage.setItem('diwan_products', JSON.stringify(data))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !price) return

    const newProduct: Product = {
      id: Date.now().toString(),
      name,
      price: parseFloat(price),
      cost: parseFloat(cost) || 0,
      stock: parseInt(stock) || 0,
      category,
    }

    save([newProduct, ...products])
    setName(''); setPrice(''); setCost(''); setStock('')
    setShowForm(false)
  }

  const addTemplate = (templateName: string, templateIcon: string) => {
    setCategory('stationery')
    setName(`${templateIcon} ${templateName}`)
    setShowTemplates(false)
    setShowForm(true)
  }

  const deleteProduct = (id: string) => {
    if (confirm('حذف هذا المنتج؟')) {
      save(products.filter(p => p.id !== id))
    }
  }

  const filtered = products.filter(p => {
    const matchCat = filter === 'all' || p.category === filter
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const lowStock = products.filter(p => p.stock > 0 && p.stock < 5).length
  const totalValue = products.reduce((s, p) => s + (p.price * p.stock), 0)

  const categoryCounts = CATEGORIES.map(c => ({
    ...c,
    count: products.filter(p => p.category === c.id).length,
  })).filter(c => c.count > 0)

  return (
    <div className="page-container products-page">
      <div className="bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <div className="page-content products-content">
        <Link to="/dashboard" className="back-btn">
          <span>→</span>
          <span>رجوع</span>
        </Link>

        <div className="products-header">
          <h1 className="products-title">المنتجات</h1>
          <p className="products-sub">
            {products.length} منتج • قيمة: {format(totalValue)}
            {lowStock > 0 && <span className="warning-badge"> • {lowStock} منخفض</span>}
          </p>
        </div>

        {/* Search */}
        <div className="products-search">
          <span className="products-search-icon">🔍</span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ابحث عن منتج..."
            className="products-search-input"
          />
          {search && (
            <button className="products-search-clear" onClick={() => setSearch('')}>✕</button>
          )}
        </div>

        {/* Category Filter */}
        <div className="products-filters">
          <button
            className={`products-filter ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            <span>📦</span>
            <span>الكل</span>
            <span className="filter-count">{products.length}</span>
          </button>

          {categoryCounts.map(c => (
            <button
              key={c.id}
              className={`products-filter ${filter === c.id ? 'active' : ''}`}
              onClick={() => setFilter(c.id)}
              style={filter === c.id ? { borderColor: c.color, color: c.color } : {}}
            >
              <span>{c.icon}</span>
              <span>{c.name}</span>
              <span className="filter-count">{c.count}</span>
            </button>
          ))}
        </div>

        {/* Products List */}
        {filtered.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📦</span>
            <p>{search ? 'لا توجد نتائج' : 'لا توجد منتجات بعد'}</p>
            <button className="btn-primary empty-btn" onClick={() => setShowForm(true)}>
              أضف أول منتج
            </button>
          </div>
        ) : (
          <div className="products-list">
            {filtered.map(p => {
              const cat = CATEGORIES.find(c => c.id === p.category)
              const profit = p.price - p.cost
              const margin = p.price > 0 ? ((profit / p.price) * 100).toFixed(0) : 0
              return (
                <div key={p.id} className="product-item">
                  <div
                    className="product-icon"
                    style={{ background: (cat?.color || '#666') + '20', color: cat?.color }}
                  >
                    {cat?.icon || '📦'}
                  </div>
                  <div className="product-info">
                    <span className="product-name">{p.name}</span>
                    <div className="product-meta">
                      <span>ربح: {format(profit)} ({margin}%)</span>
                      <span className={p.stock < 5 ? 'stock-low' : ''}>
                        مخزون: {p.stock}
                      </span>
                    </div>
                  </div>
                  <div className="product-actions">
                    <span className="product-price">{format(p.price)}</span>
                    <button
                      className="product-delete"
                      onClick={() => deleteProduct(p.id)}
                      aria-label="حذف"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <button className="fab-button" onClick={() => setShowForm(true)}>+</button>

        {/* Add Product Modal */}
        {showForm && (
          <div className="modal-overlay" onClick={() => setShowForm(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>منتج جديد</h3>
                <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
              </div>

              <form onSubmit={handleSubmit} className="modal-form">
                <div className="product-input-row">
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="اسم المنتج"
                    className="note-input"
                    autoFocus
                    required
                  />
                  <button
                    type="button"
                    className="templates-btn"
                    onClick={() => setShowTemplates(true)}
                    title="قوالب سريعة"
                  >
                    ⚡
                  </button>
                </div>

                <div className="category-picker-modal">
                  {CATEGORIES.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      className={`category-chip-modal ${category === c.id ? 'active' : ''}`}
                      onClick={() => setCategory(c.id)}
                      style={category === c.id ? {
                        background: c.color + '20',
                        borderColor: c.color,
                        color: c.color,
                      } : {}}
                    >
                      <span>{c.icon}</span>
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>

                <div className="form-row">
                  <input
                    type="number"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    placeholder="سعر البيع"
                    className="note-input"
                    required
                  />
                  <input
                    type="number"
                    value={cost}
                    onChange={e => setCost(e.target.value)}
                    placeholder="سعر التكلفة"
                    className="note-input"
                  />
                </div>

                <input
                  type="number"
                  value={stock}
                  onChange={e => setStock(e.target.value)}
                  placeholder="الكمية"
                  className="note-input"
                />

                <button type="submit" className="btn-primary" disabled={!name || !price}>
                  حفظ المنتج
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Templates Modal */}
        {showTemplates && (
          <div className="modal-overlay" onClick={() => setShowTemplates(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>⚡ قوالب سريعة</h3>
                <button className="modal-close" onClick={() => setShowTemplates(false)}>✕</button>
              </div>

              <div className="templates-section">
                <h4 className="templates-category">📚 مكتبة وقرطاسية</h4>
                <div className="templates-grid">
                  {STATIONERY_TEMPLATES.map((t, i) => (
                    <button
                      key={i}
                      className="template-item"
                      onClick={() => addTemplate(t.name, t.icon)}
                    >
                      <span className="template-icon">{t.icon}</span>
                      <span className="template-name">{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Products
