export interface Country {
  code: string
  name: string
  dialCode: string
  flag: string
  phoneLength: number
  example: string
  format?: string  // نمط التنسيق
}

export const COUNTRIES: Country[] = [
  // عربية — سوريا أولاً
  { code: 'SY', name: 'سوريا', dialCode: '+963', flag: '🇸🇾', phoneLength: 9, example: '937522989', format: '### ### ###' },
  { code: 'SA', name: 'السعودية', dialCode: '+966', flag: '🇸🇦', phoneLength: 9, example: '512345678', format: '## ### ####' },
  { code: 'AE', name: 'الإمارات', dialCode: '+971', flag: '🇦🇪', phoneLength: 9, example: '501234567', format: '## ### ####' },
  { code: 'EG', name: 'مصر', dialCode: '+20', flag: '🇪🇬', phoneLength: 10, example: '1012345678', format: '### ### ####' },
  { code: 'JO', name: 'الأردن', dialCode: '+962', flag: '🇯🇴', phoneLength: 9, example: '791234567', format: '## #### ###' },
  { code: 'LB', name: 'لبنان', dialCode: '+961', flag: '🇱🇧', phoneLength: 8, example: '3123456', format: '## ### ###' },
  { code: 'IQ', name: 'العراق', dialCode: '+964', flag: '🇮🇶', phoneLength: 10, example: '7912345678', format: '### ### ####' },
  { code: 'KW', name: 'الكويت', dialCode: '+965', flag: '🇰🇼', phoneLength: 8, example: '51234567', format: '#### ####' },
  { code: 'QA', name: 'قطر', dialCode: '+974', flag: '🇶🇦', phoneLength: 8, example: '33123456', format: '#### ####' },
  { code: 'BH', name: 'البحرين', dialCode: '+973', flag: '🇧🇭', phoneLength: 8, example: '36123456', format: '#### ####' },
  { code: 'OM', name: 'عمان', dialCode: '+968', flag: '🇴🇲', phoneLength: 8, example: '91234567', format: '#### ####' },
  { code: 'YE', name: 'اليمن', dialCode: '+967', flag: '🇾🇪', phoneLength: 9, example: '712345678', format: '### ### ###' },
  { code: 'LY', name: 'ليبيا', dialCode: '+218', flag: '🇱🇾', phoneLength: 9, example: '912345678', format: '## ### ####' },
  { code: 'TN', name: 'تونس', dialCode: '+216', flag: '🇹🇳', phoneLength: 8, example: '20123456', format: '## ### ###' },
  { code: 'DZ', name: 'الجزائر', dialCode: '+213', flag: '🇩🇿', phoneLength: 9, example: '551234567', format: '### ## ####' },
  { code: 'MA', name: 'المغرب', dialCode: '+212', flag: '🇲🇦', phoneLength: 9, example: '612345678', format: '### ## ####' },
  { code: 'SD', name: 'السودان', dialCode: '+249', flag: '🇸🇩', phoneLength: 9, example: '912345678', format: '## ### ####' },
  { code: 'PS', name: 'فلسطين', dialCode: '+970', flag: '🇵🇸', phoneLength: 9, example: '599123456', format: '### ### ###' },
  
  // عالمية
  { code: 'TR', name: 'تركيا', dialCode: '+90', flag: '🇹🇷', phoneLength: 10, example: '5012345678', format: '### ### ####' },
  { code: 'US', name: 'أمريكا', dialCode: '+1', flag: '🇺🇸', phoneLength: 10, example: '5551234567', format: '(###) ###-####' },
  { code: 'GB', name: 'بريطانيا', dialCode: '+44', flag: '🇬🇧', phoneLength: 10, example: '7911123456', format: '#### ######' },
  { code: 'DE', name: 'ألمانيا', dialCode: '+49', flag: '🇩🇪', phoneLength: 10, example: '1511234567', format: '### #######' },
  { code: 'FR', name: 'فرنسا', dialCode: '+33', flag: '🇫🇷', phoneLength: 9, example: '612345678', format: '# ## ## ## ##' },
  { code: 'CA', name: 'كندا', dialCode: '+1', flag: '🇨🇦', phoneLength: 10, example: '5551234567', format: '(###) ###-####' },
  { code: 'AU', name: 'أستراليا', dialCode: '+61', flag: '🇦🇺', phoneLength: 9, example: '412345678', format: '### ### ###' },
  { code: 'IN', name: 'الهند', dialCode: '+91', flag: '🇮🇳', phoneLength: 10, example: '9876543210', format: '##### #####' },
  { code: 'CN', name: 'الصين', dialCode: '+86', flag: '🇨🇳', phoneLength: 11, example: '13812345678', format: '### #### ####' },
  { code: 'RU', name: 'روسيا', dialCode: '+7', flag: '🇷🇺', phoneLength: 10, example: '9123456789', format: '### ### ## ##' },
]

export const DEFAULT_COUNTRY = 'SY'

export function getCountry(code: string): Country {
  return COUNTRIES.find(c => c.code === code) || COUNTRIES[0]
}

const STORAGE_KEY = 'diwan_country'

export function getSelectedCountry(): string {
  if (typeof window === 'undefined') return DEFAULT_COUNTRY
  return localStorage.getItem(STORAGE_KEY) || DEFAULT_COUNTRY
}

export function setSelectedCountry(code: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, code)
  window.dispatchEvent(new CustomEvent('country-changed', { detail: code }))
}

// ==========================================
// تنسيق رقم الجوال
// ==========================================
export function formatPhoneNumber(digits: string, format?: string): string {
  if (!format) return digits
  
  let result = ''
  let digitIndex = 0
  
  for (let i = 0; i < format.length && digitIndex < digits.length; i++) {
    if (format[i] === '#') {
      result += digits[digitIndex]
      digitIndex++
    } else {
      result += format[i]
    }
  }
  
  return result
}

// إزالة كل شي ما عدا الأرقام
export function cleanPhoneNumber(value: string): string {
  return value.replace(/\D/g, '')
}
