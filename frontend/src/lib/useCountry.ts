import { useState, useEffect } from 'react'
import { getSelectedCountry, setSelectedCountry, getCountry } from './countries'

export function useCountry() {
  const [country, setCountry] = useState<string>(() => getSelectedCountry())

  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<string>
      setCountry(customEvent.detail)
    }
    window.addEventListener('country-changed', handler)
    return () => window.removeEventListener('country-changed', handler)
  }, [])

  const changeCountry = (code: string) => {
    setSelectedCountry(code)
    setCountry(code)
  }

  return {
    country,
    countryData: getCountry(country),
    changeCountry,
  }
}
