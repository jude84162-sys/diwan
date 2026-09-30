import { getAnalytics, logEvent, setUserProperties } from 'firebase/analytics'
import { app } from './firebase'

let analytics: any = null
let initialized = false

export function initAnalytics(): any {
  if (initialized) return analytics
  if (typeof window === 'undefined') return null

  try {
    analytics = getAnalytics(app as any)
    initialized = true
    console.log('✅ Analytics initialized')
    logEvent(analytics, 'app_open')
    return analytics
  } catch (err) {
    console.warn('⚠️ Analytics failed', err)
    return null
  }
}

export function trackEvent(name: string, params?: Record<string, any>) {
  if (!analytics) return
  try {
    logEvent(analytics, name, params || {})
  } catch (err) {
    console.warn('Track failed:', name, err)
  }
}

export function setUserProps(props: Record<string, string | number>) {
  if (!analytics) return
  try {
    setUserProperties(analytics, props)
  } catch (err) {
    console.warn('setUserProps failed', err)
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
  viewPage: (page: string) => trackEvent('page_view', { page }),
  viewMarkets: () => trackEvent('view_markets'),
  view3D: () => trackEvent('view_3d'),
}
