import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  auth,
} from '../lib/firebase'
import './Login.css'

type Tab = 'login' | 'signup'

function Login() {
  const [tab, setTab] = useState<Tab>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const isSignup = tab === 'signup'
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const isValidPassword = password.length >= 6
  const isFormValid = isValidEmail && isValidPassword && (!isSignup || name.trim().length >= 2)

  const switchTab = (newTab: Tab) => {
    setTab(newTab)
    setError('')
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!isFormValid) return

    setLoading(true)
    setError('')

    try {
      if (isSignup) {
        const result: any = await createUserWithEmailAndPassword(auth, email, password)
        if (name.trim()) {
          await updateProfile(result.user, { displayName: name })
        }
        sessionStorage.setItem('diwan_user', JSON.stringify({
          uid: result.user.uid,
          email: result.user.email,
          name,
        }))
      } else {
        const result: any = await signInWithEmailAndPassword(auth, email, password)
        sessionStorage.setItem('diwan_user', JSON.stringify({
          uid: result.user.uid,
          email: result.user.email,
          name: result.user.displayName,
        }))
      }

      if (rememberMe) {
        localStorage.setItem('diwan_remembered_email', email)
      } else {
        localStorage.removeItem('diwan_remembered_email')
      }

      navigate('/dashboard')
    } catch (err: any) {
      // رسائل عامة للأمان
      let message = 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
      if (err.code === 'auth/email-already-in-use') message = 'هذا الإيميل مسجّل مسبقاً'
      else if (err.code === 'auth/weak-password') message = 'كلمة المرور ضعيفة (6 أحرف على الأقل)'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = () => {
    if (!email) {
      setError('أدخل بريدك الإلكتروني أولاً')
      return
    }
    alert(`📧 سيتم إرسال رابط إعادة التعيين إلى:\n${email}\n\n(قريباً — يحتاج Firebase حقيقي)`)
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

        {/* Tabs - فقط للتبديل */}
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

        <form onSubmit={handleSubmit} className="login-form">
          {isSignup && (
            <div className="input-group">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="اسمك الكامل"
                className="note-input"
                autoComplete="name"
                autoFocus
                required
              />
            </div>
          )}

          <div className="input-group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="بريدك الإلكتروني"
              className="note-input"
              dir="ltr"
              autoComplete="email"
              autoFocus={!isSignup}
              required
            />
            {email && isValidEmail && (
              <span className="input-check">✓</span>
            )}
          </div>

          <div className="input-group password-group">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="كلمة المرور (6 أحرف على الأقل)"
              className="note-input"
              dir="ltr"
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="إظهار كلمة المرور"
              tabIndex={-1}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>

          {/* Remember Me + Forgot Password */}
          {!isSignup && (
            <div className="login-extras">
              <label className="remember-me">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="checkbox-mark"></span>
                <span>تذكرني</span>
              </label>

              <button
                type="button"
                className="forgot-link"
                onClick={handleForgotPassword}
              >
                نسيت كلمة المرور؟
              </button>
            </div>
          )}

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
                جارٍ المعالجة...
              </>
            ) : (
              <>
                {isSignup ? 'إنشاء الحساب' : 'تسجيل الدخول'}
                <span className="btn-arrow">←</span>
              </>
            )}
          </button>
        </form>

        {/* Switch بدون تكرار */}
        {!isSignup && (
          <p className="switch-text">
            ليس لديك حساب؟{' '}
            <button
              type="button"
              className="switch-link"
              onClick={() => switchTab('signup')}
            >
              أنشئ حساباً جديداً
            </button>
          </p>
        )}

        <div className="login-info">
          <span className="info-icon">🔒</span>
          <p>بياناتك آمنة معنا. لن نشاركها مع أي طرف ثالث.</p>
        </div>
      </div>
    </div>
  )
}

export default Login
