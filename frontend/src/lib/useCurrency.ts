import { useState, useEffect } from 'react'
import { getSelectedCurrency, setSelectedCurrency, formatMoney, getCurrency, type CurrencyCode } from './currencies'

export function useCurrency() {
  const [currency, setCurrency] = useState<CurrencyCode>(() => getSelectedCurrency())

  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<CurrencyCode>
      setCurrency(customEvent.detail)
    }
    window.addEventListener('currency-changed', handler)
    return () => window.removeEventListener('currency-changed', handler)
  }, [])

  const changeCurrency = (code: CurrencyCode) => {
    setSelectedCurrency(code)
    setCurrency(code)
  }

  return {
    currency,
    currencyData: getCurrency(currency),
    changeCurrency,
    format: (amount: number) => formatMoney(amount, currency),
  }
}
