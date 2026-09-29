import { useEffect, useState } from 'react'

export function ScrollHint() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 100) setVisible(false)
      else setVisible(true)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 40,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        color: '#d4af37',
        fontFamily: 'Cairo, sans-serif',
        fontSize: 14,
        pointerEvents: 'none',
        animation: 'float-soft 2s ease-in-out infinite',
      }}
    >
      <span>اسحب للأسفل</span>
      <span style={{ fontSize: 24 }}>↓</span>
    </div>
  )
}
