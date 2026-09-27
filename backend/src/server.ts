// ==========================================
// ديوان — Backend API (محصّن + Email فقط)
// ==========================================

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { z } from 'zod'
import 'dotenv/config'

const app = express()
const PORT = parseInt(process.env.PORT || '3000')
const HOST = process.env.HOST || 'localhost'
const NODE_ENV = process.env.NODE_ENV || 'development'

// ==========================================
// 1. Security Headers
// ==========================================
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}))

// ==========================================
// 2. CORS
// ==========================================
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim())

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('غير مسموح'))
    }
  },
  credentials: true,
}))

// ==========================================
// 3. Body Parser
// ==========================================
app.use(express.json({ limit: '1mb' }))

// ==========================================
// 4. Rate Limiting
// ==========================================
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'طلبات كثيرة جداً' },
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'محاولات كثيرة — حاول لاحقاً' },
})

app.use('/api/', generalLimiter)
app.use('/api/auth/', authLimiter)

// ==========================================
// 5. Validation Schemas (Email فقط)
// ==========================================
const EmailSchema = z.object({
  email: z.string().email('إيميل غير صحيح'),
  name: z.string().min(2).max(100).optional(),
  password: z.string().min(6, 'كلمة المرور 6 أحرف على الأقل').optional(),
})

const ExpenseSchema = z.object({
  amount: z.number().positive(),
  category: z.string().min(1),
  note: z.string().max(500).optional(),
  email: z.string().email(),
})

const ProductSchema = z.object({
  name: z.string().min(1).max(100),
  price: z.number().positive(),
  cost: z.number().nonnegative(),
  stock: z.number().int().nonnegative(),
  category: z.string(),
})

// ==========================================
// 6. Health Check
// ==========================================
app.get('/api/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'diwan-api', 
    version: '1.2.0',
    env: NODE_ENV,
    host: HOST,
    auth: 'email-only',
    timestamp: new Date().toISOString(),
  })
})

// ==========================================
// 7. Auth Endpoints (Email)
// ==========================================
app.post('/api/auth/register', (req, res) => {
  const result = EmailSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({ 
      message: result.error.issues[0]?.message || 'بيانات غير صحيحة' 
    })
  }

  const { email, name } = result.data
  console.log(`👤 مستخدم جديد: ${email} (${name || 'بدون اسم'})`)

  res.json({ 
    success: true, 
    message: 'تم إنشاء الحساب',
    user: { email, name }
  })
})

app.post('/api/auth/login', (req, res) => {
  const result = EmailSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({ 
      message: result.error.issues[0]?.message || 'بيانات غير صحيحة' 
    })
  }

  const { email } = result.data
  console.log(`🔐 تسجيل دخول: ${email}`)

  res.json({ 
    success: true, 
    message: 'تم تسجيل الدخول',
    user: { email }
  })
})

// ==========================================
// 8. Expenses
// ==========================================
interface Expense {
  id: string
  amount: number
  category: string
  note: string
  date: string
  email: string
}

let expenses: Expense[] = []

app.get('/api/expenses', (req, res) => {
  const { email } = req.query
  const filtered = email 
    ? expenses.filter(e => e.email === email)
    : expenses
  res.json({ expenses: filtered })
})

app.post('/api/expenses', (req, res) => {
  const result = ExpenseSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({ 
      message: result.error.issues[0]?.message || 'بيانات غير صحيحة' 
    })
  }

  const { amount, category, note, email } = result.data

  const expense: Expense = {
    id: Date.now().toString(),
    amount,
    category,
    note: note || '',
    date: new Date().toISOString(),
    email,
  }

  expenses.push(expense)
  console.log(`💸 مصروف: ${amount} — ${category} (${email})`)
  res.json({ success: true, expense })
})

app.delete('/api/expenses/:id', (req, res) => {
  const { id } = req.params
  expenses = expenses.filter(e => e.id !== id)
  res.json({ success: true })
})

app.get('/api/expenses/stats/:email', (req, res) => {
  const { email } = req.params
  const userExpenses = expenses.filter(e => e.email === email)

  const now = new Date()
  const today = now.toDateString()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const todayTotal = userExpenses
    .filter(e => new Date(e.date).toDateString() === today)
    .reduce((s, e) => s + e.amount, 0)

  const monthTotal = userExpenses
    .filter(e => new Date(e.date) >= monthStart)
    .reduce((s, e) => s + e.amount, 0)

  const byCategory = userExpenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount
    return acc
  }, {} as Record<string, number>)

  res.json({
    todayTotal,
    monthTotal,
    byCategory,
    totalExpenses: userExpenses.length,
  })
})

// ==========================================
// 9. Products
// ==========================================
interface Product {
  id: string
  name: string
  price: number
  cost: number
  stock: number
  category: string
}

let products: Product[] = []

app.get('/api/products', (_req, res) => {
  res.json({ products })
})

app.post('/api/products', (req, res) => {
  const result = ProductSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({ 
      message: result.error.issues[0]?.message || 'بيانات غير صحيحة' 
    })
  }

  const product: Product = {
    id: Date.now().toString(),
    ...result.data,
  }

  products.push(product)
  res.json({ success: true, product })
})

// ==========================================
// 10. Sales
// ==========================================
app.get('/api/sales', (_req, res) => {
  res.json({ 
    sales: [
      { id: '1', amount: 1240, date: new Date().toISOString() }
    ]
  })
})

// ==========================================
// 11. Error Handler
// ==========================================
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('❌ Server Error:', err.message)
  res.status(500).json({ 
    message: NODE_ENV === 'production' 
      ? 'حدث خطأ في السيرفر' 
      : err.message 
  })
})

// ==========================================
// 12. 404
// ==========================================
app.use((_req, res) => {
  res.status(404).json({ message: 'المسار غير موجود' })
})

// ==========================================
// 13. Start
// ==========================================
app.listen(PORT, HOST, () => {
  console.log('')
  console.log('🚀 ديوان API يعمل')
  console.log(`📍 http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`)
  console.log(`📊 Health: http://localhost:${PORT}/api/health`)
  console.log(`🔒 Env: ${NODE_ENV}`)
  console.log(`🛡️ Host: ${HOST} ${HOST === '0.0.0.0' ? '⚠️' : '✅'}`)
  console.log(`🌍 CORS: ${allowedOrigins.join(', ')}`)
  console.log(`📧 Auth: Email-only`)
  console.log('')
})

export default app
