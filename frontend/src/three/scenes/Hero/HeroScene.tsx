import { Environment, ContactShadows, Float } from '@react-three/drei'
import { TestBook } from './TestBook'

export function HeroScene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[-3, 2, -2]} intensity={0.6} color="#d4af37" />

      <Environment preset="city" />

      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
        <TestBook />
      </Float>

      <ContactShadows
        position={[0, -2.2, 0]}
        opacity={0.5}
        scale={10}
        blur={2.5}
        far={4}
        color="#000000"
      />
    </>
  )
}
