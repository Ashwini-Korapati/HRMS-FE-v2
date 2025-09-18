import React from "react"
import { BarChart3, TrendingUp, TrendingDown, Minus } from "lucide-react"

export function PrimaryPortraitCards({
	title = "Revenue",
	subtitle = "QTD",
	value = "$42.3k",
	delta = "+1.2%",
	trend = "up", // 'up' | 'down' | 'neutral'
	icon: Icon = BarChart3,
	className = "",
}) {
	const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus
	const trendColor =
		trend === "up"
			? "text-emerald-700 dark:text-emerald-400"
			: trend === "down"
			? "text-rose-700 dark:text-rose-400"
			: "text-muted dark:text-neutral-400"
	const trendBg =
		trend === "up"
			? "bg-emerald-100/70 dark:bg-emerald-500/10"
			: trend === "down"
			? "bg-rose-100/70 dark:bg-rose-500/10"
			: "bg-neutral-200/70 dark:bg-neutral-500/10"

	return (
		<div
			className={`w-[260px] h-[180px] rounded-2xl backdrop-blur-lg border border-white/30 dark:border-orange-500 p-5 flex flex-col gap-4 transition-shadow duration-300 shadow-none hover:shadow-[0_16px_48px_-12px_rgba(249,115,22,0.45)] dark:hover:shadow-[0_16px_48px_-12px_rgba(251,146,60,0.55)] ${className}`}
		>
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 rounded-xl bg-white text-orange-700 ring-1 ring-orange-200 dark:bg-neutral-800 dark:text-cyan-400 dark:ring-neutral-700 grid place-items-center">
						<Icon size={18} />
					</div>
					<div className="text-muted dark:text-neutral-400 text-xs tracking-wider uppercase">{title}</div>
				</div>
				<span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg ${trendBg} ${trendColor} text-[10px] font-medium`}>
					<TrendIcon size={12} />
					{delta}
				</span>
			</div>
			<div>
				<div className="text-strong dark:text-white text-2xl font-semibold leading-tight">{value}</div>
				<div className="text-subtle dark:text-neutral-400 text-xs">{subtitle}</div>
			</div>
		</div>
	)
}

export default PrimaryPortraitCards
