export interface Currency {
  code: string
  name: string
  symbol: string
  flag: string
  decimals: number
  country: string
}

export const CURRENCIES: Currency[] = [
  { code: 'SYP', name: 'ليرة سورية', symbol: 'ل.س', flag: '🇸🇾', decimals: 0, country: 'سوريا' },
  { code: 'SAR', name: 'ريال سعودي', symbol: 'ر.س', flag: '🇸🇦', decimals: 2, country: 'السعودية' },
  { code: 'USD', name: 'دولار أمريكي', symbol: '$', flag: '🇺🇸', decimals: 2, country: 'أمريكا' },
  { code: 'AED', name: 'درهم إماراتي', symbol: 'د.إ', flag: '🇦🇪', decimals: 2, country: 'الإمارات' },
  { code: 'EGP', name: 'جنيه مصري', symbol: 'ج.م', flag: '🇪🇬', decimals: 2, country: 'مصر' },
  { code: 'JOD', name: 'دينار أردني', symbol: 'د.أ', flag: '🇯🇴', decimals: 3, country: 'الأردن' },
  { code: 'LBP', name: 'ليرة لبنانية', symbol: 'ل.ل', flag: '🇱🇧', decimals: 0, country: 'لبنان' },
  { code: 'IQD', name: 'دينار عراقي', symbol: 'د.ع', flag: '🇮🇶', decimals: 0, country: 'العراق' },
  { code: 'KWD', name: 'دينار كويتي', symbol: 'د.ك', flag: '🇰🇼', decimals: 3, country: 'الكويت' },
  { code: 'QAR', name: 'ريال قطري', symbol: 'ر.ق', flag: '🇶🇦', decimals: 2, country: 'قطر' },
  { code: 'BHD', name: 'دينار بحريني', symbol: 'د.ب', flag: '🇧🇭', decimals: 3, country: 'البحرين' },
  { code: 'OMR', name: 'ريال عماني', symbol: 'ر.ع', flag: '🇴🇲', decimals: 3, country: 'عمان' },
  { code: 'YER', name: 'ريال يمني', symbol: 'ر.ي', flag: '🇾🇪', decimals: 0, country: 'اليمن' },
  { code: 'LYD', name: 'دينار ليبي', symbol: 'د.ل', flag: '🇱🇾', decimals: 3, country: 'ليبيا' },
  { code: 'TND', name: 'دينار تونسي', symbol: 'د.ت', flag: '🇹🇳', decimals: 3, country: 'تونس' },
  { code: 'DZD', name: 'دينار جزائري', symbol: 'د.ج', flag: '🇩🇿', decimals: 2, country: 'الجزائر' },
  { code: 'MAD', name: 'درهم مغربي', symbol: 'د.م', flag: '🇲🇦', decimals: 2, country: 'المغرب' },
  { code: 'SDG', name: 'جنيه سوداني', symbol: 'ج.س', flag: '🇸🇩', decimals: 0, country: 'السودان' },
  { code: 'TRY', name: 'ليرة تركية', symbol: '₺', flag: '🇹🇷', decimals: 2, country: 'تركيا' },
  { code: 'EUR', name: 'يورو', symbol: '€', flag: '🇪🇺', decimals: 2, country: 'أوروبا' },
  { code: 'GBP', name: 'جنيه إسترليني', symbol: '£', flag: '🇬🇧', decimals: 2, country: 'بريطانيا' },
  { code: 'CAD', name: 'دولار كندي', symbol: 'C$', flag: '🇨🇦', decimals: 2, country: 'كندا' },
  { code: 'AUD', name: 'دولار أسترالي', symbol: 'A$', flag: '🇦🇺', decimals: 2, country: 'أستراليا' },
  { code: 'JPY', name: 'ين ياباني', symbol: '¥', flag: '🇯🇵', decimals: 0, country: 'اليابان' },
  { code: 'CNY', name: 'يوان صيني', symbol: '¥', flag: '🇨🇳', decimals: 2, country: 'الصين' },
  { code: 'INR', name: 'روبية هندية', symbol: '₹', flag: '🇮🇳', decimals: 2, country: 'الهند' },
  { code: 'RUB', name: 'روبل روسي', symbol: '₽', flag: '🇷🇺', decimals: 2, country: 'روسيا' },
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
