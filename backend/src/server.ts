// ==========================================
// ديوان — Backend API (محصّن)
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
// 1. Security Headers (Helmet)
// ==========================================
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}))

// ==========================================
// 2. CORS محمي
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
      console.warn(`⚠️ CORS blocked: ${origin}`)
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
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '15') * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  message: { message: 'طلبات كثيرة جداً — حاول لاحقاً' },
  standardHeaders: true,
  legacyHeaders: false,
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: 'محاولات كثيرة — حاول بعد 15 دقيقة' },
})

app.use('/api/', generalLimiter)
app.use('/api/auth/', authLimiter)

// ==========================================
// 5. Validation Schemas
// ==========================================
const PhoneSchema = z.object({
  phone: z.string().min(10).max(15).regex(/^\d+$/),
  name: z.string().optional(),
  isSignup: z.boolean().optional(),
})

const ExpenseSchema = z.object({
  amount: z.number().positive(),
  category: z.string().min(1),
  note: z.string().max(500).optional(),
  phone: z.string().min(10),
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
    version: '1.1.0',
    env: NODE_ENV,
    host: HOST,
    timestamp: new Date().toISOString(),
  })
})

// ==========================================
// 7. Auth Endpoints
// ==========================================
app.post('/api/auth/send-otp', (req, res) => {
  const result = PhoneSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({ 
      message: result.error.issues?.[0]?.message || 'بيانات غير صحيحة' 
    })
  }

  const { phone, name, isSignup } = result.data
  const otp = Math.floor(100000 + Math.random() * 900000).toString()

  console.log(`📱 OTP لـ ${phone}: ${otp}`)
  if (isSignup) console.log(`👤 حساب جديد: ${name}`)

  res.json({ 
    success: true, 
    message: 'تم إرسال رمز التحقق',
    ...(NODE_ENV === 'development' && { otp })
  })
})

app.post('/api/auth/verify-otp', (req, res) => {
  const { phone, otp } = req.body

  if (!phone || !otp) {
    return res.status(400).json({ message: 'بيانات ناقصة' })
  }

  if (otp !== '123456' && otp.length !== 6) {
    return res.status(400).json({ message: 'رمز غير صحيح' })
  }

  res.json({
    success: true,
    token: 'demo-token-' + Date.now(),
    user: { phone }
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
  phone: string
}

let expenses: Expense[] = []

app.get('/api/expenses', (req, res) => {
  const { phone } = req.query
  const filtered = phone 
    ? expenses.filter(e => e.phone === phone)
    : expenses
  res.json({ expenses: filtered })
})

app.post('/api/expenses', (req, res) => {
  const result = ExpenseSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({ 
      message: result.error.issues?.[0]?.message || 'بيانات غير صحيحة' 
    })
  }

  const { amount, category, note, phone } = result.data

  const expense: Expense = {
    id: Date.now().toString(),
    amount,
    category,
    note: note || '',
    date: new Date().toISOString(),
    phone,
  }

  expenses.push(expense)
  console.log(`💸 مصروف جديد: ${amount} — ${category}`)
  res.json({ success: true, expense })
})

app.delete('/api/expenses/:id', (req, res) => {
  const { id } = req.params
  expenses = expenses.filter(e => e.id !== id)
  res.json({ success: true })
})

app.get('/api/expenses/stats/:phone', (req, res) => {
  const { phone } = req.params
  const userExpenses = expenses.filter(e => e.phone === phone)

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
      message: result.error.issues?.[0]?.message || 'بيانات غير صحيحة' 
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
// 12. 404 Handler
// ==========================================
app.use((_req, res) => {
  res.status(404).json({ message: 'المسار غير موجود' })
})

// ==========================================
// 13. Start Server (محصّن)
// ==========================================
// ⚠️ HOST:
//   • 'localhost' → فقط الجهاز نفسه (آمن، للإنتاج)
//   • '0.0.0.0'   → كل الشبكة (للتطوير على الجوال)
// ==========================================
app.listen(PORT, HOST, () => {
  console.log('')
  console.log('🚀 ديوان API يعمل')
  console.log(`📍 http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`)
  
  if (HOST === '0.0.0.0') {
    // اعرض IP المحلي
    console.log(`🌐 للشبكة المحلية: http://<YOUR_IP>:${PORT}`)
  }
  
  console.log(`📊 Health: http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}/api/health`)
  console.log(`🔒 Env: ${NODE_ENV}`)
  console.log(`🛡️ Host: ${HOST} ${HOST === '0.0.0.0' ? '⚠️ (مفتوح للشبكة)' : '✅ (آمن)'}`)
  console.log(`🌍 CORS: ${allowedOrigins.join(', ')}`)
  console.log(`⏱️ Rate Limit: ${process.env.RATE_LIMIT_MAX || 100}/${process.env.RATE_LIMIT_WINDOW || 15}min`)
  console.log('')
})

export default app
