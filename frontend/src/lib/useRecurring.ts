import { useEffect } from 'react'

interface RecurringExpense {
  id: string
  category: string
  amount: number
  note: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  startDate: string
  lastRun?: string
  active: boolean
}

function shouldRun(recurring: RecurringExpense, now: Date): boolean {
  const start = new Date(recurring.startDate)
  const last = recurring.lastRun ? new Date(recurring.lastRun) : null

  if (!recurring.active) return false
  if (now < start) return false

  switch (recurring.frequency) {
    case 'daily': {
      const lastDate = last || start
      const diff = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
      return diff >= 1
    }
    case 'weekly': {
      const lastDate = last || start
      const diff = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
      return diff >= 7
    }
    case 'monthly': {
      const lastDate = last || start
      return (
        now.getMonth() !== lastDate.getMonth() ||
        now.getFullYear() !== lastDate.getFullYear()
      ) && now.getDate() >= start.getDate()
    }
    case 'yearly': {
      const lastDate = last || start
      return now.getFullYear() !== lastDate.getFullYear() && now.getMonth() >= start.getMonth()
    }
  }
}

export function processRecurringExpenses() {
  try {
    const saved = localStorage.getItem('diwan_recurring')
    if (!saved) return 0

    const recurrings: RecurringExpense[] = JSON.parse(saved)
    const now = new Date()
    const expenses = JSON.parse(localStorage.getItem('diwan_expenses') || '[]')
    let added = 0
    const updated: RecurringExpense[] = []

    for (const r of recurrings) {
      if (shouldRun(r, now)) {
        expenses.push({
          id: `${Date.now()}-${Math.random()}`,
          amount: r.amount,
          category: r.category,
          note: `[متكرر] ${r.note || ''}`.trim(),
          date: now.toISOString(),
          recurringId: r.id,
        })
        r.lastRun = now.toISOString()
        added++
      }
      updated.push(r)
    }

    if (added > 0) {
      localStorage.setItem('diwan_expenses', JSON.stringify(expenses))
      localStorage.setItem('diwan_recurring', JSON.stringify(updated))
    }

    return added
  } catch {
    return 0
  }
}

export function useRecurring() {
  useEffect(() => {
    // شغّل عند فتح التطبيق
    const added = processRecurringExpenses()
    if (added > 0) {
      console.log(`✅ تمت إضافة ${added} مصروف متكرر`)
    }
  }, [])
}
