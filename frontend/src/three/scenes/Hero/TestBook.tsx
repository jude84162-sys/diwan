import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

export function TestBook() {
  const group = useRef<THREE.Group>(null)

  useFrame((state, delta) => {
    if (!group.current) return
    group.current.rotation.y += delta * 0.3
    group.current.position.y = Math.sin(state.clock.elapsedTime) * 0.15
  })

  return (
    <group ref={group}>
      <RoundedBox args={[2, 2.8, 0.3]} radius={0.08} smoothness={4}>
        <meshStandardMaterial
          color="#d4af37"
          metalness={0.6}
          roughness={0.3}
        />
      </RoundedBox>

      <RoundedBox
        args={[1.9, 2.7, 0.25]}
        radius={0.06}
        smoothness={4}
        position={[0, 0, 0.05]}
      >
        <meshStandardMaterial
          color="#f5f0e1"
          metalness={0.05}
          roughness={0.9}
        />
      </RoundedBox>

      <mesh position={[-0.95, 0, 0.18]}>
        <boxGeometry args={[0.08, 2.6, 0.05]} />
        <meshStandardMaterial
          color="#8b6914"
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>
    </group>
  )
}
