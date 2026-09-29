import { useEffect, useState } from 'react'

export type PerfTier = 'low' | 'medium' | 'high'

export function usePerformanceTier(): PerfTier {
  const [tier, setTier] = useState<PerfTier>('medium')

  useEffect(() => {
    const cores = navigator.hardwareConcurrency ?? 2
    const memory = (navigator as any).deviceMemory ?? 4
    const isMobile = /Mobi|Android/i.test(navigator.userAgent)

    let detected: PerfTier = 'medium'

    if (cores <= 4 || memory <= 2) detected = 'low'
    else if (cores >= 8 && memory >= 8 && !isMobile) detected = 'high'
    else if (isMobile && cores < 6) detected = 'low'
    else detected = 'medium'

    setTier(detected)
  }, [])

  return tier
}
