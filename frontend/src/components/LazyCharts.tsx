import { lazy, Suspense } from 'react'

const RechartsBundle = lazy(() =>
  import('recharts').then(mod => ({
    default: ({ type, data, height, colors }: any) => {
      const {
        LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
        BarChart, Bar,
        PieChart, Pie, Cell,
      } = mod

      if (type === 'pie') {
        const palette = colors || ['#d4af37', '#22c55e', '#3b82f6', '#8b5cf6', '#ef4444', '#ec4899']
        return (
          <ResponsiveContainer width="100%" height={height || 240}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
              >
                {data.map((_: any, i: number) => (
                  <Cell key={i} fill={palette[i % palette.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )
      }

      if (type === 'bar') {
        return (
          <ResponsiveContainer width="100%" height={height || 240}>
            <BarChart data={data}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#d4af37" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )
      }

      if (type === 'line') {
        return (
          <ResponsiveContainer width="100%" height={height || 240}>
            <LineChart data={data}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#d4af37" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        )
      }

      return null
    },
  }))
)

interface LazyChartProps {
  type: 'line' | 'bar' | 'pie'
  data: any[]
  height?: number
  colors?: string[]
}

export function LazyChart({ type, data, height, colors }: LazyChartProps) {
  return (
    <Suspense
      fallback={
        <div
          style={{
            height: height || 240,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 16,
            color: '#d4af37',
            fontFamily: 'Cairo, sans-serif',
            fontSize: 13,
          }}
        >
          جارٍ تحميل الرسم البياني...
        </div>
      }
    >
      <RechartsBundle type={type} data={data} height={height} colors={colors} />
    </Suspense>
  )
}
