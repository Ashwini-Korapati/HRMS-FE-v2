import React from "react"
import { Users, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react"

export function SecondaryHorizantalCard({
	title = "Active Users",
	value = "1,284",
	delta = "+2.1%",
	trend = "up",
	icon: Icon = Users,
	className = "",
}) {
	const TrendIcon = trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : Minus
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
			className={`w-full max-w-md h-28 rounded-2xl backdrop-blur-lg border border-white/30 dark:border-orange-500 p-4 flex items-center gap-4 transition-shadow duration-300 shadow-none hover:shadow-[0_16px_48px_-12px_rgba(249,115,22,0.45)] dark:hover:shadow-[0_16px_48px_-12px_rgba(251,146,60,0.55)] ${className}`}
		>
			<div className="w-11 h-11 rounded-xl bg-white text-orange-700 ring-1 ring-orange-200 dark:bg-neutral-800 dark:text-cyan-400 dark:ring-neutral-700 grid place-items-center">
				<Icon size={20} />
			</div>
			<div className="flex-1">
				<div className="text-muted dark:text-neutral-400 text-[11px] tracking-wider uppercase">{title}</div>
				<div className="text-strong dark:text-white text-xl font-semibold leading-tight">{value}</div>
			</div>
			<div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg ${trendBg} ${trendColor} text-xs font-medium`}>
				<TrendIcon size={14} />
				{delta}
			</div>
		</div>
	)
}

export default SecondaryHorizantalCard
