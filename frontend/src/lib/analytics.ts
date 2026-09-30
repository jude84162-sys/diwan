// ═══════════════════════════════════════════════════════
// Diwan — Firebase Analytics
// ═══════════════════════════════════════════════════════

import { getAnalytics, logEvent, setUserProperties, Analytics } from 'firebase/analytics'
import { app } from './firebase'

let analytics: Analytics | null = null

// ═══ Init (only in production, only once) ═══
export function initAnalytics(): Analytics | null {
  if (analytics) return analytics
  if (typeof window === 'undefined') return null

  try {
    analytics = getAnalytics(app as any)
    console.log('✅ Analytics initialized')
    return analytics
  } catch (err) {
    console.warn('⚠️ Analytics init failed', err)
    return null
  }
}

// ═══ Track event ═══
export function trackEvent(name: string, params?: Record<string, any>) {
  const a = initAnalytics()
  if (!a) return
  try {
    logEvent(a, name, params || {})
  } catch (err) {
    console.warn('Analytics event failed:', name, err)
  }
}

// ═══ Set user properties ═══
export function setUserProps(props: Record<string, string | number>) {
  const a = initAnalytics()
  if (!a) return
  try {
    setUserProperties(a, props)
  } catch (err) {
    console.warn('Analytics setUserProperties failed', err)
  }
}

// ═══ Predefined events for Diwan ═══
export const events = {
  login: () => trackEvent('login', { method: 'email' }),
  loginGoogle: () => trackEvent('login', { method: 'google' }),
  signup: () => trackEvent('sign_up', { method: 'email' }),
  signupGoogle: () => trackEvent('sign_up', { method: 'google' }),
  passwordReset: () => trackEvent('password_reset'),
  addExpense: (amount: number, category: string) =>
    trackEvent('add_expense', { amount, category }),
  addIncome: (amount: number, category: string) =>
    trackEvent('add_income', { amount, category }),
  addDebt: (amount: number, type: 'i_owe' | 'they_owe') =>
    trackEvent('add_debt', { amount, type }),
  addProduct: (price: number, category: string) =>
    trackEvent('add_product', { price, category }),
  viewPage: (page: string) => trackEvent('page_view', { page }),
  viewMarkets: () => trackEvent('view_markets'),
  view3D: () => trackEvent('view_3d'),
}
