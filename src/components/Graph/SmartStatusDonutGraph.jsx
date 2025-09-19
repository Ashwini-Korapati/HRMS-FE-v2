import React, { useMemo } from 'react'

/* SmartStatusDonutGraph
 * props:
 *   data: Record<string, number>  // e.g. { PLANNING: 2, ACTIVE: 5 }
 *   size?: number (px)
 *   strokeWidth?: number
 *   colors?: Record<status, color>
 */
export default function SmartStatusDonutGraph({ data = {}, size = 160, strokeWidth = 16, colors }) {
  const entries = Object.entries(data).filter(([,v]) => typeof v === 'number')
  const total = entries.reduce((a,[,v]) => a + v, 0)
  const palette = colors || {
    PLANNING: '#fbbf24',
    ACTIVE: '#10b981',
    ON_HOLD: '#e879f9',
    COMPLETED: '#0ea5e9',
    CANCELLED: '#f87171',
    DEFAULT: '#fb923c'
  }

  const slices = useMemo(() => {
    if (!total) return []
    let acc = 0
    return entries.map(([k,v]) => {
      const frac = v / total
      const start = acc
      acc += frac
      return { key: k, value: v, frac, start }
    })
  }, [entries, total])

  const radius = (size - strokeWidth) / 2
  const circ = 2 * Math.PI * radius

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size }}> 
      <svg width={size} height={size} className="block">
        <g transform={`translate(${size/2},${size/2})`}>
          {/* track */}
          <circle r={radius} fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth={strokeWidth} />
          {total === 0 && (
            <text textAnchor="middle" dominantBaseline="middle" className="fill-neutral-400 text-[10px]">No Data</text>
          )}
          {total > 0 && slices.map(s => {
            const dash = s.frac * circ
            const gap = circ - dash
            const rot = s.start * 360 - 90
            const color = palette[s.key] || palette.DEFAULT
            return (
              <circle
                key={s.key}
                r={radius}
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${dash} ${gap}`}
                strokeDashoffset={circ/4}
                transform={`rotate(${rot})`}
                strokeLinecap="butt"
                className="transition-all"
              />
            )
          })}
          {total > 0 && (
            <text textAnchor="middle" dominantBaseline="middle" className="fill-neutral-700 dark:fill-neutral-200 font-semibold">
              <tspan x="0" dy="-2" className="text-xs font-semibold">{total}</tspan>
              <tspan x="0" dy="10" className="text-[8px] font-normal fill-neutral-500 dark:fill-neutral-400">Projects</tspan>
            </text>
          )}
        </g>
      </svg>
      <div className="mt-3 w-full flex flex-col gap-1">
        {entries.length === 0 && <div className="text-[10px] text-neutral-500">No statuses</div>}
        {entries.map(([k,v]) => {
          const color = palette[k] || palette.DEFAULT
          const perc = total ? ((v/total)*100).toFixed(0) : 0
          return (
            <div key={k} className="flex items-center justify-between text-[10px]">
              <span className="flex items-center gap-1 truncate"><span className="w-2 h-2 rounded-sm" style={{ background: color }}></span>{k}</span>
              <span className="tabular-nums text-neutral-600 dark:text-neutral-300">{v} <span className="opacity-60">({perc}%)</span></span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
