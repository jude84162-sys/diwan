import { useEffect } from 'react'

export function useAutoBackup() {
  useEffect(() => {
    // نسخ احتياطي كل 24 ساعة
    const checkBackup = () => {
      const lastBackup = localStorage.getItem('diwan_last_backup')
      const now = Date.now()

      if (!lastBackup || now - parseInt(lastBackup) > 24 * 60 * 60 * 1000) {
        performBackup()
        localStorage.setItem('diwan_last_backup', now.toString())
      }
    }

    // تحقق عند الفتح
    checkBackup()

    // ثم كل ساعة
    const interval = setInterval(checkBackup, 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])
}

function performBackup() {
  try {
    const data = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      expenses: JSON.parse(localStorage.getItem('diwan_expenses') || '[]'),
      incomes: JSON.parse(localStorage.getItem('diwan_incomes') || '[]'),
      products: JSON.parse(localStorage.getItem('diwan_products') || '[]'),
      debts: JSON.parse(localStorage.getItem('diwan_debts') || '[]'),
      budgets: JSON.parse(localStorage.getItem('diwan_budgets') || '[]'),
      goals: JSON.parse(localStorage.getItem('diwan_goals') || '[]'),
      recurring: JSON.parse(localStorage.getItem('diwan_recurring') || '[]'),
      stores: JSON.parse(localStorage.getItem('diwan_stores') || '[]'),
      currency: localStorage.getItem('diwan_currency'),
      store: localStorage.getItem('diwan_store'),
      theme: localStorage.getItem('diwan_theme'),
    }

    // احفظ في localStorage (نسخة داخلية)
    localStorage.setItem('diwan_auto_backup', JSON.stringify(data))

    // احتفظ بآخر 3 نسخ
    const backups = JSON.parse(localStorage.getItem('diwan_backups') || '[]')
    backups.unshift(data)
    if (backups.length > 3) backups.pop()
    localStorage.setItem('diwan_backups', JSON.stringify(backups))

    console.log('✅ Auto backup saved')
  } catch (err) {
    console.warn('Backup failed:', err)
  }
}

export function restoreBackup(index: number = 0) {
  try {
    const backups = JSON.parse(localStorage.getItem('diwan_backups') || '[]')
    if (!backups[index]) return false

    const data = backups[index]

    if (data.expenses) localStorage.setItem('diwan_expenses', JSON.stringify(data.expenses))
    if (data.incomes) localStorage.setItem('diwan_incomes', JSON.stringify(data.incomes))
    if (data.products) localStorage.setItem('diwan_products', JSON.stringify(data.products))
    if (data.debts) localStorage.setItem('diwan_debts', JSON.stringify(data.debts))
    if (data.budgets) localStorage.setItem('diwan_budgets', JSON.stringify(data.budgets))
    if (data.goals) localStorage.setItem('diwan_goals', JSON.stringify(data.goals))
    if (data.currency) localStorage.setItem('diwan_currency', data.currency)
    if (data.store) localStorage.setItem('diwan_store', data.store)
    if (data.theme) localStorage.setItem('diwan_theme', data.theme)

    return true
  } catch {
    return false
  }
}
