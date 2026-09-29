// ==========================================
// Diwan — Currencies (Simplified)
// ==========================================

export type CurrencyCode = 'SYP' | 'USD' | 'EUR'

export interface Currency {
  code: CurrencyCode
  name: string
  nameEn: string
  symbol: string
  flag: string
  decimals: number
  country: string
}

export const CURRENCIES: Currency[] = [
  // 🇸🇾 Syrian Pound (Default)
  { 
    code: 'SYP', 
    name: 'ليرة سورية', 
    nameEn: 'Syrian Pound', 
    symbol: 'ل.س', 
    flag: '🇸🇾', 
    decimals: 0, 
    country: 'سوريا' 
  },
  
  // 🇺🇸 US Dollar
  { 
    code: 'USD', 
    name: 'دولار أمريكي', 
    nameEn: 'US Dollar', 
    symbol: '$', 
    flag: '🇺🇸', 
    decimals: 2, 
    country: 'الولايات المتحدة' 
  },
  
  // 🇪🇺 Euro
  { 
    code: 'EUR', 
    name: 'يورو', 
    nameEn: 'Euro', 
    symbol: '€', 
    flag: '🇪🇺', 
    decimals: 2, 
    country: 'أوروبا' 
  },
]

export const DEFAULT_CURRENCY: CurrencyCode = 'SYP'

export function getCurrency(code: string): Currency {
  return CURRENCIES.find(c => c.code === code) || CURRENCIES[0]
}

export function formatMoney(amount: number, currencyCode: string): string {
  const currency = getCurrency(currencyCode)
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: currency.decimals,
    maximumFractionDigits: currency.decimals,
  })
  return `${formatted} ${currency.symbol}`
}

const STORAGE_KEY = 'diwan_currency'

export function getSelectedCurrency(): CurrencyCode {
  if (typeof window === 'undefined') return DEFAULT_CURRENCY
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === 'SYP' || saved === 'USD' || saved === 'EUR') {
    return saved
  }
  return DEFAULT_CURRENCY
}

export function setSelectedCurrency(code: CurrencyCode): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, code)
  window.dispatchEvent(new CustomEvent('currency-changed', { detail: code }))
}

// Exchange rates (approximate vs USD)
export const EXCHANGE_RATES: Record<CurrencyCode, number> = {
  USD: 1,
  SYP: 15000,
  EUR: 0.92,
}

export function convert(amount: number, from: CurrencyCode, to: CurrencyCode): number {
  const fromRate = EXCHANGE_RATES[from] || 1
  const toRate = EXCHANGE_RATES[to] || 1
  const inUSD = amount / fromRate
  return inUSD * toRate
}
