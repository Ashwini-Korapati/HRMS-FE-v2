import React, { useMemo, useState } from 'react'

/**
 * SmartLineGraph
 * props:
 *  data: Array<{ label: string, value: number }>
 *  height?: number
 *  stroke?: string (tailwind color or hex)
 *  fillFrom?: string gradient start color
 *  fillTo?: string gradient end color
 *  className?: string
 */
export default function SmartLineGraph({ data = [], height = 140, stroke = '#fb923c', fillFrom = 'rgba(251,146,60,0.35)', fillTo = 'rgba(251,146,60,0.05)', className = '' }) {
  const [hover, setHover] = useState(null)

  const { pathD, areaD, points, min, max } = useMemo(() => {
    if (!data.length) return { pathD: '', areaD: '', points: [], min: 0, max: 0 }
    const values = data.map(d => d.value)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const pad = (max - min) * 0.1 || 1
    const adjMin = min - pad
    const adjMax = max + pad
    const w = Math.max(data.length - 1, 1)
    const pts = data.map((d, i) => {
      const x = data.length === 1 ? 0 : (i / w)
      const yNorm = (d.value - adjMin) / (adjMax - adjMin)
      const y = 1 - yNorm
      return { x, y, label: d.label, value: d.value }
    })
    const toCoord = p => `${(p.x * 100).toFixed(3)},${(p.y * 100).toFixed(3)}`
    const d = pts.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${toCoord(p)}`).join(' ')
    const area = d + ` L ${(pts[pts.length - 1].x * 100).toFixed(3)},100 L 0,100 Z`
    return { pathD: d, areaD: area, points: pts, min: adjMin, max: adjMax }
  }, [data])

  const gradientId = useMemo(() => 'grad-' + Math.random().toString(36).slice(2, 9), [])

  return (
    <div className={`relative ${className}`} style={{ height }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={fillFrom} />
            <stop offset="100%" stopColor={fillTo} />
          </linearGradient>
        </defs>
        {areaD && <path d={areaD} fill={`url(#${gradientId})`} opacity={0.9} />}
        {pathD && <path d={pathD} fill="none" stroke={stroke} strokeWidth={1.2} strokeLinejoin="round" strokeLinecap="round" />}
        {points.map((p, idx) => (
          <g key={idx} transform={`translate(${p.x * 100},${p.y * 100})`}>
            <circle
              r={hover === idx ? 2.8 : 1.8}
              fill={stroke}
              className="cursor-pointer transition-all"
              onMouseEnter={() => setHover(idx)}
              onMouseLeave={() => setHover(null)}
            />
          </g>
        ))}
      </svg>
      {/* Axis / labels */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between text-[9px] text-neutral-400 font-mono">
        <div>{max !== min ? max.toFixed(0) : max.toFixed(0)}</div>
        <div>{min.toFixed(0)}</div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[9px] text-neutral-400 font-mono mt-1 pointer-events-none">
        {points.map((p, i) => (
          <span key={i} className="truncate max-w-[60px]">{p.label}</span>
        ))}
      </div>
      {hover != null && points[hover] && (
        <div className="absolute -translate-x-1/2 -translate-y-full px-2 py-1 rounded-md bg-neutral-900/90 text-[10px] text-neutral-100 shadow border border-neutral-700"
          style={{ left: `${points[hover].x * 100}%`, top: `${points[hover].y * 100}%` }}>
          <div className="font-semibold">{points[hover].value}</div>
          <div className="opacity-70">{points[hover].label}</div>
        </div>
      )}
    </div>
  )
}
