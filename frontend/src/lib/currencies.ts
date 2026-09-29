// ==========================================
// Diwan — Currencies (Simplified)
// ==========================================

export interface Currency {
  code: string
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

export const DEFAULT_CURRENCY = 'SYP'

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

export function getSelectedCurrency(): string {
  if (typeof window === 'undefined') return DEFAULT_CURRENCY
  return localStorage.getItem(STORAGE_KEY) || DEFAULT_CURRENCY
}

export function setSelectedCurrency(code: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, code)
  window.dispatchEvent(new CustomEvent('currency-changed', { detail: code }))
}

// Exchange rates (approximate vs USD)
export const EXCHANGE_RATES: Record<string, number> = {
  USD: 1,
  SYP: 15000,
  EUR: 0.92,
}

export function convert(amount: number, from: string, to: string): number {
  const fromRate = EXCHANGE_RATES[from] || 1
  const toRate = EXCHANGE_RATES[to] || 1
  const inUSD = amount / fromRate
  return inUSD * toRate
}
