import React from "react"
import { CalendarDays, TrendingUp, TrendingDown, Minus } from "lucide-react"

export function SecondaryPortraitCards({
	title = "Meetings",
	value = "12",
	subtitle = "scheduled",
	delta = "+0%",
	trend = "neutral",
	icon: Icon = CalendarDays,
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
			className={`w-[200px] h-[150px] rounded-2xl backdrop-blur-lg border border-white/30 dark:border-orange-500 p-4 flex flex-col gap-3 transition-shadow duration-300 shadow-none hover:shadow-[0_16px_48px_-12px_rgba(249,115,22,0.45)] dark:hover:shadow-[0_16px_48px_-12px_rgba(251,146,60,0.55)] ${className}`}
		>
			<div className="flex items-center gap-3">
				<div className="w-9 h-9 rounded-lg bg-white text-orange-700 ring-1 ring-orange-200 dark:bg-neutral-800 dark:text-cyan-400 dark:ring-neutral-700 grid place-items-center">
					<Icon size={16} />
				</div>
				<span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg ${trendBg} ${trendColor} text-[10px] font-medium`}>
					<TrendIcon size={12} />
					{delta}
				</span>
			</div>
			<div>
				<div className="text-strong dark:text-white text-xl font-semibold leading-tight">{value}</div>
				<div className="text-muted dark:text-neutral-400 text-xs">{title}</div>
				<div className="text-subtle dark:text-neutral-400 text-[11px]">{subtitle}</div>
			</div>
		</div>
	)
}

export default SecondaryPortraitCards
