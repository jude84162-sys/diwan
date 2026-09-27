import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import CurrencyPicker from '../components/CurrencyPicker'
import { useTheme } from '../lib/theme'
import './Settings.css'

function Settings() {
  const [storeName, setStoreName] = useState(localStorage.getItem('diwan_store') || '')
  const [notifications, setNotifications] = useState(true)
  const [saved, setSaved] = useState(false)
  const [importStatus, setImportStatus] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { theme, toggleTheme } = useTheme()

  const saveStore = () => {
    localStorage.setItem('diwan_store', storeName)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const exportData = () => {
    const data = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      expenses: JSON.parse(localStorage.getItem('diwan_expenses') || '[]'),
      incomes: JSON.parse(localStorage.getItem('diwan_incomes') || '[]'),
      products: JSON.parse(localStorage.getItem('diwan_products') || '[]'),
      debts: JSON.parse(localStorage.getItem('diwan_debts') || '[]'),
      budgets: JSON.parse(localStorage.getItem('diwan_budgets') || '[]'),
      currency: localStorage.getItem('diwan_currency'),
      store: localStorage.getItem('diwan_store'),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `diwan-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    setImportStatus('✅ تم التصدير')
    setTimeout(() => setImportStatus(''), 3000)
  }

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)

        if (!data.version && !data.expenses && !data.incomes) {
          throw new Error('ملف غير صالح')
        }

        const confirm = window.confirm(
          `⚠️ سيتم استبدال بياناتك الحالية!\n\n` +
          `المصاريف: ${data.expenses?.length || 0}\n` +
          `الدخل: ${data.incomes?.length || 0}\n` +
          `الديون: ${data.debts?.length || 0}\n` +
          `المنتجات: ${data.products?.length || 0}\n\n` +
          `هل تريد المتابعة؟`
        )

        if (!confirm) return

        if (data.expenses) localStorage.setItem('diwan_expenses', JSON.stringify(data.expenses))
        if (data.incomes) localStorage.setItem('diwan_incomes', JSON.stringify(data.incomes))
        if (data.products) localStorage.setItem('diwan_products', JSON.stringify(data.products))
        if (data.debts) localStorage.setItem('diwan_debts', JSON.stringify(data.debts))
        if (data.budgets) localStorage.setItem('diwan_budgets', JSON.stringify(data.budgets))
        if (data.currency) localStorage.setItem('diwan_currency', data.currency)
        if (data.store) localStorage.setItem('diwan_store', data.store)

        setImportStatus('✅ تم الاستيراد بنجاح! جاري التحديث...')
        setTimeout(() => window.location.reload(), 1500)
      } catch (err) {
        setImportStatus('❌ فشل الاستيراد — ملف غير صالح')
        setTimeout(() => setImportStatus(''), 4000)
      }
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  const clearData = () => {
    if (confirm(
      '⚠️ هل أنت متأكد؟\n\n' +
      'ستفقد جميع سجلات المبيعات والمصاريف والديون.\n\n' +
      'لا يمكن التراجع!'
    )) {
      if (confirm('🚨 تأكيد أخير: سيتم الحذف نهائياً!')) {
        localStorage.clear()
        alert('✅ تم حذف كل البيانات')
        window.location.reload()
      }
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

        {/* Store */}
        <div className="settings-section">
          <h2 className="settings-section-title">🏪 المتجر</h2>
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

        {/* Currency */}
        <div className="settings-section">
          <h2 className="settings-section-title">💱 العملة</h2>
          <div className="settings-item-row">
            <span>عملة التطبيق</span>
            <CurrencyPicker />
          </div>
        </div>

        {/* Theme */}
        <div className="settings-section">
          <h2 className="settings-section-title">🎨 المظهر</h2>
          <div className="settings-item-row">
            <span>الوضع الليلي</span>
            <button
              className={`toggle ${theme === 'dark' ? 'on' : ''}`}
              onClick={toggleTheme}
              aria-label="تبديل المظهر"
            >
              <span className="toggle-knob"></span>
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="settings-section">
          <h2 className="settings-section-title">🔔 الإشعارات</h2>
          <div className="settings-item-row">
            <span>تفعيل الإشعارات</span>
            <button
              className={`toggle ${notifications ? 'on' : ''}`}
              onClick={() => setNotifications(!notifications)}
              aria-label="تفعيل الإشعارات"
            >
              <span className="toggle-knob"></span>
            </button>
          </div>
        </div>

        {/* Data */}
        <div className="settings-section">
          <h2 className="settings-section-title">💾 البيانات</h2>

          <button className="settings-btn" onClick={exportData}>
            📥 تصدير البيانات (JSON)
          </button>

          <button
            className="settings-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            📤 استيراد البيانات
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={importData}
            style={{ display: 'none' }}
          />

          {importStatus && (
            <div className="import-status">{importStatus}</div>
          )}

          <button className="settings-btn danger" onClick={clearData}>
            🗑️ حذف كل البيانات
          </button>
        </div>

        {/* Support */}
        <div className="settings-section">
          <h2 className="settings-section-title">💬 الدعم</h2>

          <a
            href="https://wa.me/963937522989?text=مرحباً%20ديوان"
            target="_blank"
            rel="noopener noreferrer"
            className="settings-btn"
          >
            💬 تواصل عبر واتساب
          </a>

          <a
            href="mailto:dajo2162@gmail.com?subject=اقتراح%20ميزة"
            className="settings-btn"
          >
            💡 اقترح ميزة
          </a>

          <a
            href="mailto:dajo2162@gmail.com?subject=مشكلة%20في%20ديوان"
            className="settings-btn"
          >
            🐛 أبلغ عن مشكلة
          </a>
        </div>

        {/* About */}
        <div className="settings-section">
          <h2 className="settings-section-title">ℹ️ حول</h2>
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
