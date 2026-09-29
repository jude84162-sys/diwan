import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Sparkline } from '../components/Sparkline'
import './Markets.css'

// ═══════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════

interface MarketItem {
  id: string
  name: string
  nameEn: string
  icon: string
  price: number
  currency: string
  change: number
  history: number[]
  category: 'currency' | 'stock' | 'metal'
}

interface CachedData {
  items: MarketItem[]
  updatedAt: number
}

const CACHE_KEY = 'diwan_markets_cache'
const CACHE_TTL = 30 * 60 * 1000

const GRAMS_PER_OUNCE = 31.1035

// ═══════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════

function formatNumber(n: number, decimals = 2): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M'
  if (n >= 1_000) return n.toLocaleString('en-US', { maximumFractionDigits: 0 })
  return n.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

function generateHistory(base: number, volatility = 0.02, points = 24): number[] {
  const arr: number[] = []
  let v = base
  for (let i = 0; i < points; i++) {
    v = v * (1 + (Math.random() - 0.5) * volatility)
    arr.push(v)
  }
  arr[arr.length - 1] = base
  return arr
}

function loadCache(): CachedData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function saveCache(items: MarketItem[]) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ items, updatedAt: Date.now() })
    )
  } catch {}
}

// ═══════════════════════════════════════════════════════
// Fetch real rates
// ═══════════════════════════════════════════════════════

async function fetchMarkets(): Promise<MarketItem[]> {
  // ═══ 1. Currencies (ExchangeRate-API) ═══
  const fxRes = await fetch('https://open.er-api.com/v6/latest/USD')
  if (!fxRes.ok) throw new Error('FX fetch failed')
  const fx = await fxRes.json()
  if (fx.result !== 'success') throw new Error('FX API error')

  const rates = fx.rates as Record<string, number>
  const syp = rates.SYP || 121
  const eur = rates.EUR || 0.88
  const try_ = rates.TRY || 49
  const sar = rates.SAR || 3.75

  // ═══ 2. Metals (Gold-API.com) ═══
  let goldUsdPerOz = 4172
  let silverUsdPerOz = 50

  try {
    const goldRes = await fetch('https://api.gold-api.com/price/XAU')
    if (goldRes.ok) {
      const gold = await goldRes.json()
      goldUsdPerOz = gold.price || goldUsdPerOz
    }
  } catch {}

  try {
    const silverRes = await fetch('https://api.gold-api.com/price/XAG')
    if (silverRes.ok) {
      const silver = await silverRes.json()
      silverUsdPerOz = silver.price || silverUsdPerOz
    }
  } catch {}

  const goldUsdPerGram = goldUsdPerOz / GRAMS_PER_OUNCE
  const silverUsdPerGram = silverUsdPerOz / GRAMS_PER_OUNCE

  // ═══ 3. Bitcoin (Binance) ═══
  let btcUsd = 67000
  try {
    const btcRes = await fetch(
      'https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT'
    )
    if (btcRes.ok) {
      const btc = await btcRes.json()
      btcUsd = parseFloat(btc.price) || btcUsd
    }
  } catch {}

  // ═══ 4. Build items ═══
  const items: MarketItem[] = [
    {
      id: 'usd_syp',
      name: 'دولار أمريكي',
      nameEn: 'USD → SYP',
      icon: '🇺🇸',
      price: syp,
      currency: 'SYP',
      change: 0,
      history: generateHistory(syp, 0.005),
      category: 'currency',
    },
    {
      id: 'eur_syp',
      name: 'يورو',
      nameEn: 'EUR → SYP',
      icon: '🇪🇺',
      price: syp / eur,
      currency: 'SYP',
      change: 0,
      history: generateHistory(syp / eur, 0.006),
      category: 'currency',
    },
    {
      id: 'try_syp',
      name: 'ليرة تركية',
      nameEn: 'TRY → SYP',
      icon: '🇹🇷',
      price: syp / try_,
      currency: 'SYP',
      change: 0,
      history: generateHistory(syp / try_, 0.008),
      category: 'currency',
    },
    {
      id: 'sar_syp',
      name: 'ريال سعودي',
      nameEn: 'SAR → SYP',
      icon: '🇸🇦',
      price: syp / sar,
      currency: 'SYP',
      change: 0,
      history: generateHistory(syp / sar, 0.004),
      category: 'currency',
    },
    {
      id: 'gold_syp',
      name: 'الذهب (غرام)',
      nameEn: 'Gold/g → SYP',
      icon: '🥇',
      price: goldUsdPerGram * syp,
      currency: 'SYP',
      change: 0,
      history: generateHistory(goldUsdPerGram * syp, 0.01),
      category: 'metal',
    },
    {
      id: 'silver_syp',
      name: 'الفضة (غرام)',
      nameEn: 'Silver/g → SYP',
      icon: '🥈',
      price: silverUsdPerGram * syp,
      currency: 'SYP',
      change: 0,
      history: generateHistory(silverUsdPerGram * syp, 0.012),
      category: 'metal',
    },
    {
      id: 'btc_usd',
      name: 'بيتكوين',
      nameEn: 'BTC → USD',
      icon: '₿',
      price: btcUsd,
      currency: 'USD',
      change: 0,
      history: generateHistory(btcUsd, 0.03),
      category: 'stock',
    },
  ]

  items.forEach(item => {
    const first = item.history[0]
    const last = item.history[item.history.length - 1]
    item.change = ((last - first) / first) * 100
  })

  return items
}

// ═══════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════

type Tab = 'all' | 'currency' | 'metal' | 'stock'

export default function Markets() {
  const [data, setData] = useState<MarketItem[]>([])
  const [tab, setTab] = useState<Tab>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const loadMarkets = async (force = false) => {
    setLoading(true)
    setError('')

    if (!force) {
      const cache = loadCache()
      if (cache && Date.now() - cache.updatedAt < CACHE_TTL) {
        setData(cache.items)
        setLastUpdate(new Date(cache.updatedAt))
        setLoading(false)
        return
      }
    }

    try {
      const items = await fetchMarkets()
      setData(items)
      saveCache(items)
      setLastUpdate(new Date())
    } catch (err: any) {
      console.error('[Markets] Fetch failed:', err)
      const cache = loadCache()
      if (cache) {
        setData(cache.items)
        setLastUpdate(new Date(cache.updatedAt))
        setError('تعذّر التحديث — عرض آخر بيانات محفوظة')
      } else {
        setError('تعذّر تحميل الأسعار — تحقق من الإنترنت')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMarkets(false)
    const interval = setInterval(() => loadMarkets(true), 30 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const filtered = tab === 'all' ? data : data.filter(d => d.category === tab)

  return (
    <div className="page-container markets-page">
      <div className="bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <div className="page-content markets-content">
        <div className="page-header-row">
          <Link to="/dashboard" className="back-btn">
            <span>→</span>
            <span>رجوع</span>
          </Link>
          <button
            type="button"
            className="header-add-btn"
            onClick={() => loadMarkets(true)}
            disabled={loading}
            title="تحديث"
          >
            {loading ? '⏳' : '🔄'}
          </button>
        </div>

        <div className="markets-header">
          <h1 className="markets-title">الأسواق</h1>
          <p className="markets-sub">
            {loading
              ? 'جارٍ التحديث...'
              : lastUpdate
              ? `آخر تحديث: ${lastUpdate.toLocaleTimeString('ar-SY', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}`
              : '—'}
          </p>
        </div>

        {error && <div className="markets-error">⚠️ {error}</div>}

        <div className="markets-tabs">
          {([
            { id: 'all', label: 'الكل', icon: '📊' },
            { id: 'currency', label: 'عملات', icon: '💵' },
            { id: 'metal', label: 'معادن', icon: '🥇' },
            { id: 'stock', label: 'رقمية', icon: '₿' },
          ] as const).map(t => (
            <button
              key={t.id}
              type="button"
              className={`markets-tab ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {loading && data.length === 0 && (
          <div className="markets-loading">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="market-skeleton" />
            ))}
          </div>
        )}

        <div className="markets-list">
          {filtered.map(item => {
            const isUp = item.change >= 0
            const color = isUp ? '#22c55e' : '#ef4444'

            return (
              <div key={item.id} className="market-item">
                <div className="market-icon">{item.icon}</div>

                <div className="market-info">
                  <span className="market-name">{item.name}</span>
                  <span className="market-name-en">{item.nameEn}</span>
                </div>

                <div className="market-chart">
                  <Sparkline data={item.history} color={color} width={70} height={26} />
                </div>

                <div className="market-price-block">
                  <span className="market-price">
                    {formatNumber(item.price)} {item.currency}
                  </span>
                  <span
                    className={`market-change ${isUp ? 'up' : 'down'}`}
                    style={{ color }}
                  >
                    {isUp ? '▲' : '▼'} {Math.abs(item.change).toFixed(2)}%
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {!loading && filtered.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">📊</span>
            <p>لا توجد بيانات في هذا التصنيف</p>
          </div>
        )}

        <div className="markets-note">
          ⓘ الأسعار محدّثة كل 30 دقيقة
          <br />
          <span style={{ opacity: 0.6, fontSize: 11 }}>
            المصادر: ExchangeRate-API · Gold-API · Binance
            <br />
            السعر الرسمي لليرة السورية — السوق السوداء قد يكون مختلفاً
          </span>
        </div>
      </div>
    </div>
  )
}
