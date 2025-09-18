import React, { useEffect, useMemo, useState } from "react"

// Semi-donut gauge (0-100%) with animated sweep and gradient stroke
export default function SmartSemiDonutGraph({
	title = "Completion",
	className = "",
	size = 220,
	thickness = 18,
	value = 72, // percentage 0..100
	from = "#22d3ee",
	to = "#8b5cf6",
	track = "#262626",
	animate = true,
}) {
	const r = (size - thickness) / 2
	const cx = size / 2
	const cy = size / 2
	const semiCirc = Math.PI * r

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

		const gradId = useMemo(() => `semi-grad-${Math.random().toString(36).slice(2)}` , [])
	const dash = (Math.max(0, Math.min(100, value)) / 100) * semiCirc * progress

	return (
		<section className={`bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 ${className}`}>
			<div className="text-sm text-neutral-300 mb-3">{title}</div>
			<div className="flex items-center justify-center">
				<svg width={size} height={size/1.6} viewBox={`0 0 ${size} ${size/1.6}`}>
					<defs>
						<linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
							<stop offset="0%" stopColor={from} />
							<stop offset="100%" stopColor={to} />
						</linearGradient>
					</defs>
					<g transform={`translate(0, ${thickness/2})`}>
						{/* Track arc */}
						<path
							d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
							fill="none"
							stroke={track}
							strokeWidth={thickness}
							strokeLinecap="round"
						/>
						{/* Value arc drawn as stroked circle with dash on half circumference */}
						<g transform={`rotate(180 ${cx} ${cy})`}>
							<circle
								cx={cx}
								cy={cy}
								r={r}
								fill="none"
								stroke={`url(#${gradId})`}
								strokeWidth={thickness}
								strokeLinecap="round"
								strokeDasharray={`${semiCirc} ${Math.PI * r}`}
								strokeDashoffset={semiCirc - dash}
							/>
						</g>
					</g>
					<text x="50%" y="85%" textAnchor="middle" className="fill-white" style={{fontSize:14}}>
						{Math.round(value)}%
					</text>
				</svg>
			</div>
		</section>
	)
}
