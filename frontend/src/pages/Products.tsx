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
  { id: 'food', icon: '🍞', name: 'أغذية' },
  { id: 'drink', icon: '🥤', name: 'مشروبات' },
  { id: 'clean', icon: '🧴', name: 'منظفات' },
  { id: 'other', icon: '📦', name: 'أخرى' },
]

function Products() {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('diwan_products')
    return saved ? JSON.parse(saved) : []
  })

  const [showForm, setShowForm] = useState(false)
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

  const lowStock = products.filter(p => p.stock > 0 && p.stock < 5).length

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
            {products.length} منتج
            {lowStock > 0 && <span className="warning-badge"> • {lowStock} منخفض</span>}
          </p>
        </div>

        {products.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📦</span>
            <p>لا توجد منتجات بعد</p>
            <button className="btn-primary empty-btn" onClick={() => setShowForm(true)}>
              أضف أول منتج
            </button>
          </div>
        ) : (
          <div className="products-list">
            {products.map(p => {
              const cat = CATEGORIES.find(c => c.id === p.category)
              const profit = p.price - p.cost
              const margin = p.price > 0 ? ((profit / p.price) * 100).toFixed(0) : 0
              return (
                <div key={p.id} className="product-item">
                  <div className="product-icon">{cat?.icon || '📦'}</div>
                  <div className="product-info">
                    <span className="product-name">{p.name}</span>
                    <div className="product-meta">
                      <span>ربح: {format(profit)} ({margin}%)</span>
                      <span className={p.stock < 5 ? 'stock-low' : ''}>
                        مخزون: {p.stock}
                      </span>
                    </div>
                  </div>
                  <span className="product-price">{format(p.price)}</span>
                </div>
              )
            })}
          </div>
        )}

        <button className="fab-button" onClick={() => setShowForm(true)}>+</button>

        {showForm && (
          <div className="modal-overlay" onClick={() => setShowForm(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>منتج جديد</h3>
                <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
              </div>

              <form onSubmit={handleSubmit} className="modal-form">
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="اسم المنتج"
                  className="note-input"
                  autoFocus
                  required
                />

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

                <div className="category-picker">
                  {CATEGORIES.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      className={`category-chip ${category === c.id ? 'active' : ''}`}
                      onClick={() => setCategory(c.id)}
                    >
                      <span>{c.icon}</span>
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>

                <button type="submit" className="btn-primary" disabled={!name || !price}>
                  حفظ المنتج
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Products
