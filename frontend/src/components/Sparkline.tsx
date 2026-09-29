interface SparklineProps {
  data: number[]
  color?: string
  width?: number
  height?: number
  strokeWidth?: number
}

export function Sparkline({
  data,
  color = '#22c55e',
  width = 80,
  height = 28,
  strokeWidth = 1.5,
}: SparklineProps) {
  if (!data || data.length < 2) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((v - min) / range) * height
    return `${x.toFixed(2)},${y.toFixed(2)}`
  })

  const path = `M ${points.join(' L ')}`
  const areaPath = `${path} L ${width},${height} L 0,${height} Z`

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ display: 'block', overflow: 'visible' }}
    >
      {/* Fill area */}
      <path d={areaPath} fill={color} opacity={0.15} />
      {/* Line */}
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Last point dot */}
      <circle
        cx={width}
        cy={height - ((data[data.length - 1] - min) / range) * height}
        r={2.5}
        fill={color}
      />
    </svg>
  )
}
