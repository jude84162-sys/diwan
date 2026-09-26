import { useState, FormEvent, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCountry } from '../lib/useCountry'
import { formatPhoneNumber, cleanPhoneNumber } from '../lib/countries'
import CountryPicker from '../components/CountryPicker'
import './Login.css'

type Tab = 'login' | 'signup'

function Login() {
  const [tab, setTab] = useState<Tab>('login')
  const [name, setName] = useState('')
  const [phoneDigits, setPhoneDigits] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [touched, setTouched] = useState(false)
  const { countryData } = useCountry()
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)

  const digitCount = phoneDigits.length
  const requiredCount = countryData.phoneLength
  const isValid = digitCount === requiredCount
  const isSignup = tab === 'signup'
  const isFormValid = isValid && (!isSignup || name.trim().length >= 2)

  const displayValue = formatPhoneNumber(phoneDigits, countryData.format)
  const placeholderValue = formatPhoneNumber('0'.repeat(requiredCount), countryData.format)

  // إعادة تعيين عند تغيير الدولة
  useEffect(() => {
    setPhoneDigits('')
    setError('')
  }, [countryData.code])

  useEffect(() => {
    if (touched && digitCount > 0 && !isValid) {
      setError(`الرجاء إدخال ${requiredCount} أرقام`)
    } else {
      setError('')
    }
  }, [phoneDigits, touched, isValid, requiredCount])

  const switchTab = (newTab: Tab) => {
    setTab(newTab)
    setError('')
    setTouched(false)
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = cleanPhoneNumber(e.target.value).slice(0, requiredCount)
    setPhoneDigits(digits)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setTouched(true)
    if (!isFormValid) return

    setLoading(true)
    setError('')

    try {
      const fullPhone = countryData.dialCode.replace('+', '') + phoneDigits
      
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: fullPhone,
          name: isSignup ? name : undefined,
          isSignup,
        }),
      })

      const text = await res.text()
      let data: any = {}
      
      if (text) {
        try {
          data = JSON.parse(text)
        } catch {
          throw new Error('رد غير صالح من السيرفر')
        }
      }

      if (!res.ok) {
        throw new Error(data.message || `خطأ ${res.status}`)
      }

      sessionStorage.setItem('diwan_phone', fullPhone)
      sessionStorage.setItem('diwan_country', countryData.code)
      sessionStorage.setItem('diwan_tab', tab)
      if (isSignup) {
        sessionStorage.setItem('diwan_name', name)
      }
      
      navigate('/otp')
    } catch (err) {
      console.error('❌ Error:', err)
      if (err instanceof TypeError) {
        setError('السيرفر غير متاح — شغّل Backend')
      } else {
        setError(err instanceof Error ? err.message : 'حدث خطأ')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container">
      <div className="bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <div className="page-content login-content">
        <Link to="/" className="back-btn">
          <span>→</span>
          <span>رجوع</span>
        </Link>

        <div className="login-header">
          <div className="login-icon">📖</div>
          <h1 className="login-title">
            {isSignup ? 'أهلاً بك في ديوان' : 'أهلاً بعودتك'}
          </h1>
          <p className="login-sub">
            {isSignup ? 'أنشئ حسابك في ثوانٍ' : 'سجّل دخولك للمتابعة'}
          </p>
        </div>

        <div className="tabs">
          <button
            type="button"
            className={`tab ${tab === 'login' ? 'active' : ''}`}
            onClick={() => switchTab('login')}
          >
            <span className="tab-icon">🔑</span>
            <span>تسجيل الدخول</span>
          </button>
          <button
            type="button"
            className={`tab ${tab === 'signup' ? 'active' : ''}`}
            onClick={() => switchTab('signup')}
          >
            <span className="tab-icon">✨</span>
            <span>حساب جديد</span>
          </button>
          <div 
            className="tab-indicator"
            style={{ transform: `translateX(${tab === 'signup' ? '-100%' : '0%'})` }}
          ></div>
        </div>

        <div className="social-login">
          <button
            type="button"
            className="social-btn google"
            onClick={() => alert('Google Sign-In قيد الإعداد')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>المتابعة بـ Google</span>
          </button>

          <button
            type="button"
            className="social-btn apple"
            onClick={() => alert('Apple Sign-In قيد الإعداد')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            <span>المتابعة بـ Apple</span>
          </button>
        </div>

        <div className="divider">
          <span>أو برقم الجوال</span>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {isSignup && (
            <div className="input-group">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="اسمك الكامل"
                className="note-input"
                autoFocus
                required
              />
            </div>
          )}

          <div className={`phone-field ${error ? 'has-error' : ''} ${isValid ? 'is-valid' : ''}`}>
            <div className="phone-input-wrapper">
              <CountryPicker />
              <input
                ref={inputRef}
                type="tel"
                inputMode="numeric"
                value={displayValue}
                onChange={handlePhoneChange}
                onBlur={() => setTouched(true)}
                placeholder={placeholderValue}
                className="phone-input"
                dir="ltr"
                disabled={loading}
                autoFocus={!isSignup}
              />
              {isValid && <span className="check-icon">✓</span>}
            </div>
            
            <div className="phone-counter">
              <span className={isValid ? 'counter-complete' : ''}>
                {digitCount}/{requiredCount} أرقام
              </span>
              {digitCount === 0 && (
                <span className="counter-hint">
                  مثال: {formatPhoneNumber(countryData.example, countryData.format)}
                </span>
              )}
            </div>
          </div>

          {error && (
            <p className="error-msg">
              <span>⚠️</span>
              {error}
            </p>
          )}

          <button
            type="submit"
            className="btn-primary login-submit"
            disabled={loading || !isFormValid}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                جارٍ الإرسال...
              </>
            ) : (
              <>
                {isSignup ? 'إنشاء الحساب' : 'أرسل رمز التحقق'}
                <span className="btn-arrow">←</span>
              </>
            )}
          </button>
        </form>

        <p className="switch-text">
          {isSignup ? 'لديك حساب بالفعل؟' : 'ليس لديك حساب؟'}{' '}
          <button
            type="button"
            className="switch-link"
            onClick={() => switchTab(isSignup ? 'login' : 'signup')}
          >
            {isSignup ? 'سجّل دخولك' : 'أنشئ حساباً جديداً'}
          </button>
        </p>

        <div className="login-info">
          <span className="info-icon">🔒</span>
          <p>بياناتك آمنة معنا. لن نشاركها مع أي طرف ثالث.</p>
        </div>

        <p className="login-terms">
          بالمتابعة أنت توافق على{' '}
          <a href="/terms">الشروط والأحكام</a>
          {' '}و{' '}
          <a href="/privacy">سياسة الخصوصية</a>
        </p>
      </div>
    </div>
  )
}

export default Login
