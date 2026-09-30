declare global {
  interface Window {
    gtag?: (...args: any[]) => void
    dataLayer?: any[]
  }
}

export function trackEvent(name: string, params?: Record<string, any>) {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', name, params || {})
      console.log('[GTAG]', name, params)
    }
  } catch (err) {
    console.warn('[GTAG] error:', err)
  }
}

export function setUserProps(props: Record<string, string | number>) {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('set', 'user_properties', props)
    }
  } catch {}
}

export function initAnalytics(): void {
  if (typeof window !== 'undefined' && window.gtag) {
    console.log('✅ gtag Analytics ready')
  }
}

export const events = {
  login: () => trackEvent('login', { method: 'email' }),
  loginGoogle: () => trackEvent('login', { method: 'google' }),
  signup: () => trackEvent('sign_up', { method: 'email' }),
  signupGoogle: () => trackEvent('sign_up', { method: 'google' }),
  passwordReset: () => trackEvent('password_reset'),
  addExpense: (amount: number, category: string) => trackEvent('add_expense', { amount, category }),
  addIncome: (amount: number, category: string) => trackEvent('add_income', { amount, category }),
  addDebt: (amount: number, type: string) => trackEvent('add_debt', { amount, type }),
  addProduct: (price: number, category: string) => trackEvent('add_product', { price, category }),
  viewPage: (page: string) => trackEvent('page_view', { page_path: page }),
  viewMarkets: () => trackEvent('view_markets'),
  view3D: () => trackEvent('view_3d'),
}
