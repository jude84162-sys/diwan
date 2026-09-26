import { useState } from 'react'
import { Link } from 'react-router-dom'
import CurrencyPicker from '../components/CurrencyPicker'
import './Settings.css'

function Settings() {
  const [storeName, setStoreName] = useState(localStorage.getItem('diwan_store') || '')
  const [notifications, setNotifications] = useState(true)
  const [saved, setSaved] = useState(false)

  const saveStore = () => {
    localStorage.setItem('diwan_store', storeName)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const exportData = () => {
    const data = {
      expenses: JSON.parse(localStorage.getItem('diwan_expenses') || '[]'),
      products: JSON.parse(localStorage.getItem('diwan_products') || '[]'),
      currency: localStorage.getItem('diwan_currency'),
      store: localStorage.getItem('diwan_store'),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `diwan-backup-${Date.now()}.json`
    a.click()
  }

  const clearData = () => {
    if (confirm('هل أنت متأكد؟ سيتم حذف كل البيانات!')) {
      localStorage.clear()
      alert('تم حذف كل البيانات')
      window.location.reload()
    }
  }

  return (
    <div className="page-container settings-page">
      <div className="bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <div className="page-content settings-content">
        <Link to="/dashboard" className="back-btn">
          <span>→</span>
          <span>رجوع</span>
        </Link>

        <div className="settings-header">
          <h1 className="settings-title">الإعدادات</h1>
        </div>

        <div className="settings-section">
          <h2 className="settings-section-title">المتجر</h2>
          <div className="settings-item">
            <label>اسم المتجر</label>
            <input
              type="text"
              value={storeName}
              onChange={e => setStoreName(e.target.value)}
              placeholder="مثال: بقالة الأمانة"
              className="note-input"
            />
          </div>
          <button className="btn-primary" onClick={saveStore}>
            {saved ? '✅ تم الحفظ' : 'حفظ'}
          </button>
        </div>

        <div className="settings-section">
          <h2 className="settings-section-title">العملة</h2>
          <div className="settings-item-row">
            <span>عملة التطبيق</span>
            <CurrencyPicker />
          </div>
        </div>

        <div className="settings-section">
          <h2 className="settings-section-title">الإشعارات</h2>
          <div className="settings-item-row">
            <span>تفعيل الإشعارات</span>
            <button
              className={`toggle ${notifications ? 'on' : ''}`}
              onClick={() => setNotifications(!notifications)}
            >
              <span className="toggle-knob"></span>
            </button>
          </div>
        </div>

        <div className="settings-section">
          <h2 className="settings-section-title">البيانات</h2>
          <button className="settings-btn" onClick={exportData}>
            📥 تصدير البيانات
          </button>
          <button className="settings-btn danger" onClick={clearData}>
            🗑️ حذف كل البيانات
          </button>
        </div>

        <div className="settings-section">
          <h2 className="settings-section-title">حول</h2>
          <div className="settings-about">
            <p><strong>ديوان</strong> — الإصدار 1.0.0</p>
            <p>دفترك الذكي لإدارة تجارتك</p>
            <p>صُنع بـ 💚 للتاجر العربي</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
