import React, { useEffect, useMemo, useState } from "react"

// Donut chart with animated segment sweep and gradient strokes
export default function SmartDonutGraph({
  title = "Donut Breakdown",
  className = "",
  size = 200,
  thickness = 18,
  data = [
    { label: "A", value: 30, from: "#22d3ee", to: "#8b5cf6" },
    { label: "B", value: 20, from: "#34d399", to: "#22d3ee" },
    { label: "C", value: 25, from: "#f59e0b", to: "#ef4444" },
    { label: "D", value: 25, from: "#ef4444", to: "#8b5cf6" },
  ],
  showLegend = true,
  animate = true,
}) {
  const r = (size - thickness) / 2
  const cx = size / 2
  const cy = size / 2
  const C = 2 * Math.PI * r
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
      // easeOutCubic
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
        id: `donut-grad-${i}-${Math.random().toString(36).slice(2)}`,
        from: d.from,
        to: d.to,
      })),
    [data]
  )

  let offset = 0

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

          {/* Track */}
          <g transform={`rotate(-90 ${cx} ${cy})`}>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#262626" strokeWidth={thickness} />

            {data.map((d, i) => {
              const len = (d.value / total) * C
              const seg = Math.max(0, len - 2) // tiny gap
              const dashArray = `${seg * progress} ${C}`
              const dashOffset = C - offset
              offset += len
              return (
                <circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill="none"
                  stroke={`url(#${grads[i].id})`}
                  strokeWidth={thickness}
                  strokeLinecap="round"
                  strokeDasharray={dashArray}
                  strokeDashoffset={dashOffset}
                />
              )
            })}
          </g>
        </svg>

        {showLegend && (
          <div className="grid grid-cols-1 gap-2 text-xs text-neutral-300">
            {data.map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded"
                  style={{
                    background: `linear-gradient(90deg, ${d.from}, ${d.to})`,
                  }}
                />
                <span className="truncate">{d.label}</span>
                <span className="text-neutral-500">{Math.round((d.value / total) * 100)}%</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
