import React, { useEffect, useMemo, useState } from "react"

// Full pie chart (no hole) with animated sweep and gradient fills
export default function SmartPieGraph({
  title = "Pie Distribution",
  className = "",
  size = 220,
  data = [
    { label: "Engineering", value: 45, from: "#22d3ee", to: "#34d399" },
    { label: "HR", value: 15, from: "#f59e0b", to: "#ef4444" },
    { label: "Sales", value: 20, from: "#8b5cf6", to: "#22d3ee" },
    { label: "Finance", value: 20, from: "#ef4444", to: "#8b5cf6" },
  ],
  animate = true,
}) {
  const r = size / 2
  const cx = r
  const cy = r
  const total = Math.max(1, data.reduce((s, d) => s + (d.value || 0), 0))
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!animate) {
      setProgress(1)
      return
    }
    let raf
    const start = performance.now()
    const dur = 900
    const tick = (t) => {
      const p = Math.min(1, (t - start) / dur)
      const eased = 1 - Math.pow(1 - p, 3)
      setProgress(eased)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [animate])

  const grads = useMemo(
    () =>
      data.map((d, i) => ({
        id: `pie-grad-${i}-${Math.random().toString(36).slice(2)}`,
        from: d.from,
        to: d.to,
      })),
    [data]
  )

  let angleAcc = -Math.PI / 2 // start at top

  function arcPath(cx, cy, r, start, end) {
    const x1 = cx + r * Math.cos(start)
    const y1 = cy + r * Math.sin(start)
    const x2 = cx + r * Math.cos(end)
    const y2 = cy + r * Math.sin(end)
    const largeArc = end - start > Math.PI ? 1 : 0
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`
  }

  return (
    <section className={`bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 ${className}`}>
      <div className="text-sm text-neutral-300 mb-3">{title}</div>
      <div className="flex items-center gap-4">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
          <defs>
            {grads.map((g) => (
              <linearGradient key={g.id} id={g.id} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={g.from} />
                <stop offset="100%" stopColor={g.to} />
              </linearGradient>
            ))}
          </defs>
          {data.map((d, i) => {
            const angle = (d.value / total) * 2 * Math.PI * progress
            const start = angleAcc
            const end = angleAcc + angle
            angleAcc += (d.value / total) * 2 * Math.PI
            return <path key={i} d={arcPath(cx, cy, r, start, end)} fill={`url(#${grads[i].id})`} />
          })}
        </svg>
        <div className="grid grid-cols-1 gap-2 text-xs text-neutral-300">
          {data.map((d, i) => (
            <div key={i} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded"
                style={{ background: `linear-gradient(90deg, ${d.from}, ${d.to})` }}
              />
              <span className="truncate">{d.label}</span>
              <span className="text-neutral-500">{Math.round((d.value / total) * 100)}%</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
