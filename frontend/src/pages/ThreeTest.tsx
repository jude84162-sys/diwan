import { useState, useEffect } from 'react'
import { ThreeCanvas } from '../three/ThreeCanvas'
import { HeroScene } from '../three/scenes/Hero/HeroScene'
import './ThreeTest.css'

export default function ThreeTest() {
  const [fps, setFps] = useState(0)

  useEffect(() => {
    let frames = 0
    let last = performance.now()
    let raf: number

    const loop = () => {
      frames++
      const now = performance.now()
      if (now - last >= 1000) {
        setFps(Math.round((frames * 1000) / (now - last)))
        frames = 0
        last = now
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="three-test-page">
      <div className="three-test-canvas">
        <ThreeCanvas
          cameraPosition={[0, 0, 6]}
          fallback={
            <div className="three-test-fallback">
              <h2>المتصفح لا يدعم WebGL</h2>
              <p>سيظهر التصميم ثنائي الأبعاد بدلاً من 3D</p>
            </div>
          }
        >
          <HeroScene />
        </ThreeCanvas>
      </div>

      <div className="three-test-hud">
        <div className="hud-item">
          <span>FPS</span>
          <strong className={fps >= 55 ? 'good' : fps >= 30 ? 'warn' : 'bad'}>
            {fps}
          </strong>
        </div>
        <div className="hud-item">
          <span>WebGL</span>
          <strong className="good">Active</strong>
        </div>
      </div>

      <div className="three-test-info">
        <h1>🎬 Phase 1 — 3D Foundation</h1>
        <p>اختبار الأداء: شوف FPS فوق يمين الشاشة</p>
        <p className="muted">
          إذا كان 55+ → ممتاز. إذا 30-55 → مقبول. أقل من 30 → نحسّن.
        </p>
      </div>
    </div>
  )
}
