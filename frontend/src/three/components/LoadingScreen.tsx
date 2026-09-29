import { Html, useProgress } from '@react-three/drei'

export function LoadingScreen() {
  const { progress } = useProgress()

  return (
    <Html center>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
          fontFamily: 'Cairo, sans-serif',
          color: '#d4af37',
        }}
      >
        <div
          style={{
            width: 60,
            height: 60,
            border: '3px solid rgba(212, 175, 55, 0.2)',
            borderTopColor: '#d4af37',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
        <p style={{ fontSize: 14, opacity: 0.7 }}>
          {progress.toFixed(0)}%
        </p>
      </div>
    </Html>
  )
}
