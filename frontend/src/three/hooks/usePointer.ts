import { useEffect, useState } from 'react'

export interface PointerState {
  x: number   // -1 to 1
  y: number   // -1 to 1
  active: boolean
}

export function usePointer(): PointerState {
  const [state, setState] = useState<PointerState>({
    x: 0,
    y: 0,
    active: false,
  })

  useEffect(() => {
    const handleMove = (x: number, y: number) => {
      const nx = (x / window.innerWidth) * 2 - 1
      const ny = -((y / window.innerHeight) * 2 - 1)
      setState({ x: nx, y: ny, active: true })
    }

    const onMouse = (e: MouseEvent) => handleMove(e.clientX, e.clientY)
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0]
      if (t) handleMove(t.clientX, t.clientY)
    }
    const onLeave = () => setState(s => ({ ...s, active: false }))

    window.addEventListener('mousemove', onMouse)
    window.addEventListener('touchmove', onTouch, { passive: true })
    window.addEventListener('mouseleave', onLeave)
    window.addEventListener('touchend', onLeave)

    return () => {
      window.removeEventListener('mousemove', onMouse)
      window.removeEventListener('touchmove', onTouch)
      window.removeEventListener('mouseleave', onLeave)
      window.removeEventListener('touchend', onLeave)
    }
  }, [])

  return state
}
