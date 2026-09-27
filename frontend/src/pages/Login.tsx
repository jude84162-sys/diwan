import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth'
import { auth } from '../lib/firebase'
import './Login.css'

type Tab = 'login' | 'signup'

function Login() {
  const [tab, setTab] = useState<Tab>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
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

  // Google Sign-In
  const handleGoogle = async () => {
    setGoogleLoading(true)
    setError('')
    try {
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({ prompt: 'select_account' })
      const result = await signInWithPopup(auth, provider)
      
      sessionStorage.setItem('diwan_user', JSON.stringify({
        uid: result.user.uid,
        email: result.user.email,
        name: result.user.displayName,
        photo: result.user.photoURL,
      }))
      
      console.log('✅ Google:', result.user.email)
      navigate('/dashboard')
    } catch (err: any) {
      console.error('❌ Google Error:', err.code)
      
      let message = 'فشل تسجيل الدخول'
      switch (err.code) {
        case 'auth/popup-closed-by-user':
          message = 'تم إغلاق النافذة'
          break
        case 'auth/popup-blocked':
          message = 'المتصفح منع النافذة'
          break
        case 'auth/network-request-failed':
          message = 'فشل الاتصال'
          break
        case 'auth/operation-not-allowed':
          message = 'Google Sign-In غير مفعّل'
          break
      }
      setError(message)
    } finally {
      setGoogleLoading(false)
    }
  }

  // Email/Password Sign-In
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!isFormValid) return

    setLoading(true)
    setError('')

    try {
      if (isSignup) {
        const result = await createUserWithEmailAndPassword(auth, email, password)
        
        if (name.trim()) {
          await updateProfile(result.user, { displayName: name })
        }

        sessionStorage.setItem('diwan_user', JSON.stringify({
          uid: result.user.uid,
          email: result.user.email,
          name,
        }))
      } else {
        const result = await signInWithEmailAndPassword(auth, email, password)
        
        sessionStorage.setItem('diwan_user', JSON.stringify({
          uid: result.user.uid,
          email: result.user.email,
          name: result.user.displayName,
        }))
      }

      navigate('/dashboard')
    } catch (err: any) {
      console.error('❌ Error:', err.code)
      
      let message = 'حدث خطأ'
      switch (err.code) {
        case 'auth/email-already-in-use':
          message = 'هذا الإيميل مسجّل مسبقاً'
          break
        case 'auth/invalid-email':
          message = 'الإيميل غير صحيح'
          break
        case 'auth/weak-password':
          message = 'كلمة المرور ضعيفة (6 أحرف+)'
          break
        case 'auth/user-not-found':
          message = 'لا يوجد حساب بهذا الإيميل'
          break
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          message = 'كلمة المرور غير صحيحة'
          break
        case 'auth/too-many-requests':
          message = 'محاولات كثيرة — حاول لاحقاً'
          break
      }
      setError(message)
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

        {/* Tabs */}
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

        {/* Google Sign-In */}
        <div className="social-login">
          <button
            type="button"
            className="social-btn google"
            onClick={handleGoogle}
            disabled={googleLoading}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>{googleLoading ? 'جارٍ...' : 'المتابعة بـ Google'}</span>
          </button>
        </div>

        {/* Divider */}
        <div className="divider">
          <span>أو</span>
        </div>

        {/* Form */}
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
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
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
      </div>
    </div>
  )
}

export default Login
