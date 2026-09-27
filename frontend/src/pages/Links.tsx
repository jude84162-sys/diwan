import { useState, useEffect } from 'react'
import './Links.css'

interface LinkItem {
  id: string
  icon: string
  title: string
  subtitle: string
  url: string
  gradient: string
  shadow: string
  primary?: boolean
}

const LINKS: LinkItem[] = [
  {
    id: 'app',
    icon: '📱',
    title: 'حمّل التطبيق مجاناً',
    subtitle: 'ابدأ في 5 دقائق',
    url: 'https://diwan-e70.pages.dev',
    gradient: 'linear-gradient(135deg, #d4af37, #e8c65a)',
    shadow: 'rgba(212, 175, 55, 0.5)',
    primary: true,
  },
  {
    id: 'instagram',
    icon: '📸',
    title: 'Instagram',
    subtitle: '@diwan.edara',
    url: 'https://instagram.com/diwan.edara',
    gradient: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)',
    shadow: 'rgba(253, 29, 29, 0.4)',
  },
  {
    id: 'whatsapp',
    icon: '💬',
    title: 'واتساب الدعم',
    subtitle: '+963 937 522 989',
    url: 'https://wa.me/963937522989?text=مرحباً%20ديوان%20👋',
    gradient: 'linear-gradient(135deg, #25d366, #128c7e)',
    shadow: 'rgba(37, 211, 102, 0.4)',
  },
  {
    id: 'email',
    icon: '📧',
    title: 'راسلنا',
    subtitle: 'dajo2162@gmail.com',
    url: 'mailto:dajo2162@gmail.com?subject=استفسار%20عن%20ديوان',
    gradient: 'linear-gradient(135deg, #4285f4, #1a73e8)',
    shadow: 'rgba(66, 133, 244, 0.4)',
  },
  {
    id: 'website',
    icon: '🌐',
    title: 'الموقع الرسمي',
    subtitle: 'diwan-e70.pages.dev',
    url: 'https://diwan-e70.pages.dev',
    gradient: 'linear-gradient(135deg, #1a5c3a, #2d7a52)',
    shadow: 'rgba(26, 92, 58, 0.5)',
  },
]

const FEATURES = [
  { icon: '💰', label: 'سجّل بيعة', color: '#d4af37' },
  { icon: '📊', label: 'اعرف ربحك', color: '#22c55e' },
  { icon: '👥', label: 'تابع ديونك', color: '#3b82f6' },
  { icon: '📦', label: 'أدر مخزونك', color: '#8b5cf6' },
]

const STATS = [
  { value: '27', label: 'عملة', color: '#d4af37' },
  { value: '28', label: 'دولة', color: '#22c55e' },
  { value: '14', label: 'صفحة', color: '#3b82f6' },
  { value: '100%', label: 'عربي', color: '#ec4899' },
]

function Links() {
  const [qrCode, setQrCode] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const targetUrl = 'https://diwan-e70.pages.dev'
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(targetUrl)}&color=1a5c3a&bgcolor=ffffff&margin=10`
    setQrCode(qrUrl)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20
      const y = (e.clientY / window.innerHeight - 0.5) * 20
      setMousePos({ x, y })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const handleShare = async () => {
    const shareData = {
      title: 'ديوان — دفترك الذكي',
      text: '📖 جرّب ديوان — دفترك الذكي لإدارة تجارتك',
      url: 'https://diwan-e70.pages.dev/links',
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
        return
      } catch (err) {}
    }

    try {
      await navigator.clipboard.writeText(shareData.url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {}
  }

  const handleQRDownload = () => {
    if (!qrCode) return
    const link = document.createElement('a')
    link.href = qrCode
    link.download = 'diwan-qr.png'
    link.click()
  }

  return (
    <div className="links-page">
      {/* 3D Background */}
      <div className="bg-blobs">
        <div className="blob blob-1" style={{
          transform: `translate(${mousePos.x}px, ${mousePos.y}px)`
        }}></div>
        <div className="blob blob-2" style={{
          transform: `translate(${-mousePos.x}px, ${-mousePos.y}px)`
        }}></div>
        <div className="blob blob-3"></div>
      </div>

      {/* Grid Overlay */}
      <div className="grid-overlay"></div>

      <div className="links-content">
        {/* Header */}
        <header className="links-header">
          <div className="links-logo-wrapper">
            <div className="logo-3d">
              <img
                src="/icon-512.png"
                alt="ديوان"
                className="links-logo"
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
            </div>
            <div className="logo-glow"></div>
          </div>

          <h1 className="links-title">ديوان</h1>
          <p className="links-subtitle">دفترك الذكي لإدارة تجارتك</p>

          <div className="links-badges">
            <span className="badge badge-3d">🇸🇾 سوريا</span>
            <span className="badge badge-3d">🇸🇦 السعودية</span>
            <span className="badge badge-3d">🌍 عربي</span>
          </div>
        </header>

        {/* Features 3D */}
        <section className="links-features">
          {FEATURES.map((f, i) => (
            <div key={i} className="feature-chip-3d" style={{ '--chip-color': f.color } as React.CSSProperties}>
              <span className="feature-chip-icon">{f.icon}</span>
              <span className="feature-chip-label">{f.label}</span>
            </div>
          ))}
        </section>

        {/* QR Code 3D */}
        <section className="links-qr">
          <div className="qr-wrapper-3d">
            {qrCode && <img src={qrCode} alt="QR" className="qr-image" loading="lazy" />}
          </div>
          <p className="qr-hint">📷 امسح الكود لفتح التطبيق</p>
          <button className="qr-download-3d" onClick={handleQRDownload}>
            ⬇️ حمّل QR
          </button>
        </section>

        {/* Links 3D */}
        <nav className="links-list">
          {LINKS.map((link, i) => (
            <a
              key={link.id}
              href={link.url}
              target={link.url.startsWith('mailto') ? '_self' : '_blank'}
              rel="noopener noreferrer"
              className={`link-item-3d ${link.primary ? 'primary' : ''}`}
              style={{
                '--link-gradient': link.gradient,
                '--link-shadow': link.shadow,
                animationDelay: `${i * 80}ms`,
              } as React.CSSProperties}
            >
              <span className="link-icon-3d">{link.icon}</span>
              <div className="link-info">
                <span className="link-title">{link.title}</span>
                <span className="link-subtitle">{link.subtitle}</span>
              </div>
              <span className="link-arrow-3d">←</span>
            </a>
          ))}
        </nav>

        {/* Stats 3D */}
        <section className="links-stats">
          {STATS.map((s, i) => (
            <div key={i} className="stat-box-3d" style={{ '--stat-color': s.color } as React.CSSProperties}>
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </section>

        {/* Share */}
        <button className={`share-btn-3d ${copied ? 'copied' : ''}`} onClick={handleShare}>
          {copied ? '✅ تم النسخ!' : '🔗 شارك الصفحة'}
        </button>

        {/* Footer */}
        <footer className="links-footer">
          <p className="footer-main">صُنع بـ 💚 للتاجر العربي</p>
          <p className="footer-version">v1.0.0</p>
        </footer>
      </div>
    </div>
  )
}

export default Links
