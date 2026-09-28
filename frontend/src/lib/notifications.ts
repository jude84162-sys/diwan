export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false

  const result = await Notification.requestPermission()
  return result === 'granted'
}

export function sendNotification(title: string, body: string, tag?: string) {
  if (!('Notification' in window)) return
  if (Notification.permission !== 'granted') return

  try {
    new Notification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: tag || 'diwan',
      lang: 'ar',
      dir: 'rtl',
    })
  } catch (err) {
    console.warn('Notification failed:', err)
  }
}

export function scheduleNotifications() {
  if (Notification.permission !== 'granted') return

  // تحقق من الميزانية كل ساعة
  setInterval(() => {
    checkBudgets()
  }, 60 * 60 * 1000)

  // تحقق من الديون كل يوم
  setInterval(() => {
    checkDebts()
  }, 24 * 60 * 60 * 1000)
}

function checkBudgets() {
  try {
    const budgets = JSON.parse(localStorage.getItem('diwan_budgets') || '[]')
    const expenses = JSON.parse(localStorage.getItem('diwan_expenses') || '[]')
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    for (const b of budgets) {
      const spent = expenses
        .filter((e: any) => e.category === b.category && new Date(e.date) >= monthStart)
        .reduce((s: number, e: any) => s + e.amount, 0)

      const percent = (spent / b.limit) * 100

      if (percent >= 100) {
        sendNotification(
          '🚨 تجاوزت الميزانية!',
          `تجاوزت ميزانية "${b.category}" بنسبة ${percent.toFixed(0)}%`,
          `budget-${b.id}`
        )
      } else if (percent >= 80) {
        sendNotification(
          '⚠️ اقتربت من الحد!',
          `وصلت إلى ${percent.toFixed(0)}% من ميزانية "${b.category}"`,
          `budget-${b.id}`
        )
      }
    }
  } catch {}
}

function checkDebts() {
  try {
    const debts = JSON.parse(localStorage.getItem('diwan_debts') || '[]')
    const now = new Date()

    for (const d of debts) {
      if (d.type !== 'owed' || d.paid >= d.amount) continue
      if (!d.dueDate) continue

      const due = new Date(d.dueDate)
      const daysLeft = Math.floor((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      if (daysLeft === 0) {
        sendNotification(
          '📅 دين مستحق اليوم',
          `${d.person} — المتبقي: ${(d.amount - d.paid).toLocaleString()}`,
          `debt-${d.id}`
        )
      } else if (daysLeft === 1) {
        sendNotification(
          '⏰ تذكير: دين غداً',
          `${d.person} — يستحق غداً`,
          `debt-${d.id}`
        )
      }
    }
  } catch {}
}
