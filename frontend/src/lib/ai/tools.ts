// ═══════════════════════════════════════════════════════
// Diwan AI — Tools (Read-only access to user data)
// ═══════════════════════════════════════════════════════

export interface Expense {
  id: string
  amount: number
  category: string
  note: string
  date: string
}

export interface Income {
  id: string
  amount: number
  category: string
  note: string
  date: string
}

export interface Debt {
  id: string
  personName: string
  amount: number
  type: 'owed_to_me' | 'i_owe'
  note: string
  date: string
}

// ═══ Read from localStorage ═══
function getData<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

// ═══ Date helpers ═══
function getPeriodRange(period: 'today' | 'week' | 'month' | 'year'): { start: Date; end: Date } {
  const now = new Date()
  const end = new Date(now)
  let start = new Date(now)

  switch (period) {
    case 'today':
      start.setHours(0, 0, 0, 0)
      break
    case 'week':
      start.setDate(now.getDate() - 7)
      break
    case 'month':
      start = new Date(now.getFullYear(), now.getMonth(), 1)
      break
    case 'year':
      start = new Date(now.getFullYear(), 0, 1)
      break
  }
  return { start, end }
}

// ═══ TOOL: getExpenses ═══
export function getExpenses(params: { period?: string }): {
  total: number
  count: number
  period: string
  byCategory: { category: string; amount: number; count: number }[]
} {
  const period = (params.period || 'month') as 'today' | 'week' | 'month' | 'year'
  const { start, end } = getPeriodRange(period)
  const expenses = getData<Expense>('diwan_expenses')

  const filtered = expenses.filter((e) => {
    const d = new Date(e.date)
    return d >= start && d <= end
  })

  const byCategory: Record<string, { amount: number; count: number }> = {}
  let total = 0

  for (const e of filtered) {
    total += e.amount
    if (!byCategory[e.category]) byCategory[e.category] = { amount: 0, count: 0 }
    byCategory[e.category].amount += e.amount
    byCategory[e.category].count += 1
  }

  return {
    total,
    count: filtered.length,
    period,
    byCategory: Object.entries(byCategory).map(([category, data]) => ({
      category,
      amount: data.amount,
      count: data.count,
    })),
  }
}

// ═══ TOOL: getIncomes ═══
export function getIncomes(params: { period?: string }) {
  const period = (params.period || 'month') as 'today' | 'week' | 'month' | 'year'
  const { start, end } = getPeriodRange(period)
  const incomes = getData<Income>('diwan_incomes')

  const filtered = incomes.filter((i) => {
    const d = new Date(i.date)
    return d >= start && d <= end
  })

  const byCategory: Record<string, { amount: number; count: number }> = {}
  let total = 0

  for (const i of filtered) {
    total += i.amount
    if (!byCategory[i.category]) byCategory[i.category] = { amount: 0, count: 0 }
    byCategory[i.category].amount += i.amount
    byCategory[i.category].count += 1
  }

  return {
    total,
    count: filtered.length,
    period,
    byCategory: Object.entries(byCategory).map(([category, data]) => ({
      category,
      amount: data.amount,
      count: data.count,
    })),
  }
}

// ═══ TOOL: getDebts ═══
export function getDebts(params: { type?: string }) {
  const type = params.type || 'all'
  const debts = getData<Debt>('diwan_debts')

  let filtered = debts
  if (type === 'owed_to_me') filtered = debts.filter((d) => d.type === 'owed_to_me')
  if (type === 'i_owe') filtered = debts.filter((d) => d.type === 'i_owe')

  const total = filtered.reduce((s, d) => s + d.amount, 0)

  return {
    total,
    count: filtered.length,
    type,
    list: filtered.map((d) => ({
      personName: d.personName,
      amount: d.amount,
      type: d.type,
    })),
  }
}

// ═══ TOOL: getMarkets ═══
export async function getMarkets() {
  try {
    // Get cached from markets page
    const cached = localStorage.getItem('diwan_markets_cache')
    if (cached) {
      const data = JSON.parse(cached)
      return {
        source: 'cache',
        updatedAt: new Date(data.updatedAt).toISOString(),
        items: data.items.map((i: any) => ({
          name: i.name,
          price: i.price,
          currency: i.currency,
          change: i.change,
          category: i.category,
        })),
      }
    }

    return { source: 'none', items: [] }
  } catch {
    return { source: 'error', items: [] }
  }
}

// ═══ TOOL: getSummary ═══
export function getSummary() {
  const expenses = getExpenses({ period: 'month' })
  const incomes = getIncomes({ period: 'month' })
  const debts = getDebts({ type: 'all' })
  const owedToMe = getDebts({ type: 'owed_to_me' })
  const iOwe = getDebts({ type: 'i_owe' })

  const balance = incomes.total - expenses.total

  return {
    month: {
      income: incomes.total,
      expense: expenses.total,
      balance,
    },
    debts: {
      owedToMe: owedToMe.total,
      iOwe: iOwe.total,
      netWorth: owedToMe.total - iOwe.total,
      totalCount: debts.count,
    },
  }
}

// ═══ Tool definitions for Gemini ═══
export const TOOL_DEFINITIONS = [
  {
    name: 'getExpenses',
    description: 'احصل على ملخص المصاريف لفترة محددة. استخدم هذا عندما يسأل المستخدم عن مصاريفه.',
    parameters: {
      type: 'object',
      properties: {
        period: {
          type: 'string',
          description: 'الفترة: today, week, month, year',
          enum: ['today', 'week', 'month', 'year'],
        },
      },
      required: [],
    },
  },
  {
    name: 'getIncomes',
    description: 'احصل على ملخص الدخل لفترة محددة.',
    parameters: {
      type: 'object',
      properties: {
        period: {
          type: 'string',
          description: 'الفترة: today, week, month, year',
          enum: ['today', 'week', 'month', 'year'],
        },
      },
      required: [],
    },
  },
  {
    name: 'getDebts',
    description: 'احصل على قائمة الديون. استخدم هذا عندما يسأل عن الديون.',
    parameters: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          description: 'النوع: owed_to_me (لي), i_owe (عليّ), all (الكل)',
          enum: ['owed_to_me', 'i_owe', 'all'],
        },
      },
      required: [],
    },
  },
  {
    name: 'getMarkets',
    description: 'احصل على أسعار العملات والمعادن. استخدم هذا عندما يسأل عن الدولار أو الذهب.',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'getSummary',
    description: 'احصل على ملخص شامل (مصاريف + دخل + ديون). استخدم هذا لسؤال "كيف حالي" أو "ملخص".',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
]

// ═══ Execute tool by name ═══
export async function executeTool(name: string, args: any): Promise<any> {
  switch (name) {
    case 'getExpenses':
      return getExpenses(args)
    case 'getIncomes':
      return getIncomes(args)
    case 'getDebts':
      return getDebts(args)
    case 'getMarkets':
      return await getMarkets()
    case 'getSummary':
      return getSummary()
    default:
      return { error: `Unknown tool: ${name}` }
  }
}
