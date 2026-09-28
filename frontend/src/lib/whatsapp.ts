import { getCurrency } from './currencies'

interface DebtReminderParams {
  name: string
  amount: number
  paid: number
  currency: string
  dueDate?: string
}

export function sendDebtReminder({ name, amount, paid, currency, dueDate }: DebtReminderParams) {
  const remaining = amount - paid
  const currencyData = getCurrency(currency)
  const formatMoney = (n: number) => 
    `${n.toLocaleString('en-US', { maximumFractionDigits: currencyData.decimals })} ${currencyData.symbol}`

  let message = `مرحباً ${name} 👋\n\n`
  message += `نود تذكيركم بالدفعة المتبقية:\n\n`
  message += `💰 المبلغ: ${formatMoney(remaining)}\n`

  if (paid > 0) {
    message += `💵 مدفوع: ${formatMoney(paid)}\n`
    message += `📊 الإجمالي: ${formatMoney(amount)}\n`
  }

  if (dueDate) {
    const date = new Date(dueDate).toLocaleDateString('ar-SA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    message += `📅 تاريخ الاستحقاق: ${date}\n`
  }

  message += `\nشكراً لتعاملكم معنا 💚`
  message += `\n\n— ديوان | دفترك الذكي`
  message += `\n🔗 diwan.dpdns.org`

  const encoded = encodeURIComponent(message)
  return `https://wa.me/?text=${encoded}`
}
