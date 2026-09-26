import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Onboarding.css'

interface Slide {
  icon: string
  title: string
  description: string
  color: string
}

const SLIDES: Slide[] = [
  {
    icon: '📖',
    title: 'أهلاً بك في ديوان',
    description: 'دفترك الذكي لإدارة تجارتك — بالعربي، وفي جيبك',
    color: '#d4af37',
  },
  {
    icon: '💰',
    title: 'سجّل بيعة في 3 نقرات',
    description: 'بدون تعقيد، بدون مصطلحات محاسبية — فقط اضغط وسجّل',
    color: '#22c55e',
  },
  {
    icon: '📊',
    title: 'اعرف ربحك لحظياً',
    description: 'تقارير واضحة، صافي ربح، هوامش — كل شي أمام عينك',
    color: '#3b82f6',
  },
  {
    icon: '🚀',
    title: 'جاهز تبدأ؟',
    description: 'سجّل دخولك الآن وابدأ رحلتك من دكان صغير إلى مشروع منظّم',
    color: '#d4af37',
  },
]

function Onboarding() {
  const [current, setCurrent] = useState(0)
  const navigate = useNavigate()

  const slide = SLIDES[current]
  const isLast = current === SLIDES.length - 1
  const isFirst = current === 0

  const next = () => {
    if (isLast) {
      finish()
    } else {
      setCurrent(current + 1)
    }
  }

  const prev = () => {
    if (!isFirst) setCurrent(current - 1)
  }

  const finish = () => {
    localStorage.setItem('diwan_onboarded', 'true')
    navigate('/login')
  }

  const skip = () => {
    localStorage.setItem('diwan_onboarded', 'true')
    navigate('/login')
  }

  // Swipe support
  const [touchStart, setTouchStart] = useState(0)

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEnd = e.changedTouches[0].clientX
    const diff = touchStart - touchEnd
    
    // RTL: السحب يمين = التالي
    if (diff > 50) next()
    if (diff < -50) prev()
  }

  return (
    <div className="onboarding-container">
      <div className="bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      {/* Skip */}
      <button className="onboarding-skip" onClick={skip}>
        تخطي
      </button>

      {/* Slider */}
      <div 
        className="onboarding-slider"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="onboarding-track"
          style={{ transform: `translateX(${current * 100}%)` }}
        >
          {SLIDES.map((s, i) => (
            <div key={i} className="onboarding-slide">
              <div 
                className="onboarding-icon-wrapper"
                style={{ 
                  background: `radial-gradient(circle, ${s.color}30, transparent 70%)`,
                }}
              >
                <div 
                  className="onboarding-icon"
                  style={{ 
                    boxShadow: `0 0 60px ${s.color}60`,
                    borderColor: `${s.color}40`,
                  }}
                >
                  {s.icon}
                </div>
              </div>

              <h1 className="onboarding-title">{s.title}</h1>
              <p className="onboarding-description">{s.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Dots */}
      <div className="onboarding-dots">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            className={`onboarding-dot ${i === current ? 'active' : ''}`}
            onClick={() => setCurrent(i)}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="onboarding-actions">
        {!isFirst && (
          <button 
            className="onboarding-btn secondary" 
            onClick={prev}
          >
            السابق
          </button>
        )}

        <button 
          className={`onboarding-btn primary ${isFirst ? 'full' : ''}`}
          onClick={next}
        >
          {isLast ? 'ابدأ الآن' : 'التالي'}
          <span className="btn-arrow">←</span>
        </button>
      </div>
    </div>
  )
}

export default Onboarding
