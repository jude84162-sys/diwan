import { Link } from 'react-router-dom'
import './About.css'

function About() {
  const features = [
    { icon: '💰', title: 'سجّل مبيعاتك', desc: '3 نقرات فقط لكل بيعة' },
    { icon: '📦', title: 'تابع مخزونك', desc: 'تنبيهات قبل نفاد المنتجات' },
    { icon: '📊', title: 'اعرف ربحك', desc: 'تقارير يومية وشهرية واضحة' },
    { icon: '👥', title: 'ديون العملاء', desc: 'تذكير تلقائي عبر واتساب' },
  ]

  const stats = [
    { num: '1.4M', label: 'منشأة صغيرة في السعودية' },
    { num: '60%', label: 'من فرص العمل' },
    { num: '8%', label: 'فقط من التمويل' },
  ]

  return (
    <div className="page-container about-page">
      <div className="bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <div className="page-content about-content">
        <Link to="/" className="back-btn">
          <span>→</span>
          <span>رجوع</span>
        </Link>

        <div className="about-hero">
          <img 
            src="/icon-512.png" 
            alt="ديوان" 
            className="about-logo"
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
          <h1 className="about-title">عن ديوان</h1>
          <p className="about-tagline">من دكان صغير... إلى مشروع منظّم</p>
        </div>

        <div className="about-section">
          <p className="about-text">
            ديوان هو دفترك الذكي لإدارة تجارتك. صُمم خصيصاً للتاجر العربي
            الذي يريد يعرف ربحه الحقيقي، يتابع مخزونه، ويدير ديونه —
            كل هذا بالعربي، وفي جيبك.
          </p>
        </div>

        <div className="about-section">
          <h2 className="about-section-title">
            <span className="title-line"></span>
            لماذا ديوان؟
          </h2>

          <div className="features-grid">
            {features.map((f, i) => (
              <div 
                key={i} 
                className="feature-card"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <span className="feature-icon">{f.icon}</span>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="about-section">
          <h2 className="about-section-title">
            <span className="title-line"></span>
            لماذا الآن؟
          </h2>

          <div className="stats-grid">
            {stats.map((s, i) => (
              <div 
                key={i} 
                className="stat-card"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <span className="stat-num">{s.num}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>

          <p className="about-text">
            نؤمن أن كل تاجر صغير يستحق أدوات احترافية. تنظيم الحسابات
            ليس رفاهية — بل أساس للنمو.
          </p>
        </div>

        <Link to="/login" className="btn-primary about-cta">
          ابدأ مجاناً الآن
          <span className="btn-arrow">←</span>
        </Link>

        <div className="about-footer">
          <p>صُنع بـ 💚 للتاجر العربي</p>
        </div>
      </div>
    </div>
  )
}

export default About
