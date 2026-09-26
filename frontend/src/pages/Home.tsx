import { Link } from 'react-router-dom'
import './Home.css'

function Home() {
  const features = [
    { icon: '💰', title: 'سجّل بيعة', desc: 'في 3 نقرات' },
    { icon: '📦', title: 'تابع مخزونك', desc: 'بدون فوضى' },
    { icon: '📊', title: 'اعرف ربحك', desc: 'لحظياً' },
  ]

  return (
    <div className="page-container">
      <div className="bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <div className="page-content">
        <div className="home-hero">
          <div className="home-logo-wrapper">
            <img
              src="/icon-512.png"
              alt="ديوان"
              className="home-logo"
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
          </div>

          <h1 className="home-title">ديوان</h1>
          <p className="home-tagline">دفترك الذكي لإدارة تجارتك</p>
          <p className="home-sub">
            سجّل مبيعاتك، تابع مصاريفك، واعرف ربحك — كل هذا بالعربي
          </p>
        </div>

        <div className="home-features">
          {features.map((f, i) => (
            <div
              key={i}
              className="home-feature"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <span className="home-feature-icon">{f.icon}</span>
              <div className="home-feature-text">
                <span className="home-feature-title">{f.title}</span>
                <span className="home-feature-desc">{f.desc}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="home-actions">
          <Link to="/dashboard" className="btn-primary">
            ابدأ الآن مجاناً
            <span className="btn-arrow">←</span>
          </Link>

          <Link to="/expenses" className="home-link-secondary">
            💸 تابع مصاريفك
          </Link>

          <Link to="/about" className="home-link-secondary">
            تعرف على ديوان
          </Link>
        </div>

        <div className="home-footer">
          <p>صُنع بـ 💚 للتاجر العربي</p>
        </div>
      </div>
    </div>
  )
}

export default Home
