import { Suspense, ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import { Preload, AdaptiveDpr, AdaptiveEvents } from '@react-three/drei'
import { useWebGLSupport } from './hooks/useWebGLSupport'
import { usePerformanceTier } from './hooks/usePerformanceTier'

interface ThreeCanvasProps {
  children: ReactNode
  fallback?: ReactNode
  className?: string
  cameraPosition?: [number, number, number]
  fov?: number
}

export function ThreeCanvas({
  children,
  fallback = null,
  className = '',
  cameraPosition = [0, 0, 5],
  fov = 45,
}: ThreeCanvasProps) {
  const webgl = useWebGLSupport()
  const tier = usePerformanceTier()

  if (webgl === null) {
    return (
      <div
        className={className}
        style={{
          background: 'linear-gradient(135deg, #0a3d26, #1a5c3a)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#d4af37',
          fontFamily: 'Cairo, sans-serif',
        }}
      >
        <span>جارٍ التحميل...</span>
      </div>
    )
  }

  if (!webgl) return <>{fallback}</>

  const dpr: [number, number] =
    tier === 'low' ? [1, 1] : tier === 'medium' ? [1, 1.5] : [1, 2]

  return (
    <div className={className} style={{ width: '100%', height: '100%' }}>
      <Canvas
        dpr={dpr}
        camera={{ position: cameraPosition, fov }}
        gl={{
          antialias: tier !== 'low',
          powerPreference: 'high-performance',
          alpha: true,
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0)
        }}
      >
        <Suspense fallback={null}>
          {children}
          <Preload all />
        </Suspense>
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />
      </Canvas>
    </div>
  )
}
