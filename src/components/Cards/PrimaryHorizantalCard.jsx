import React from "react";
import { Activity, TrendingUp, TrendingDown, Minus } from "lucide-react";

export function PrimaryHorizantalCard({
  title = "Performance",
  subtitle = "This month",
  value = "$12.7k",
  delta = "+3.9%",
  trend = "up", // 'up' | 'down' | 'neutral'
  icon: Icon = Activity,
  className = "",
}) {
  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor =
    trend === "up"
      ? "text-emerald-700 dark:text-emerald-400"
      : trend === "down"
      ? "text-rose-700 dark:text-rose-400"
      : "text-[var(--text-muted)] dark:text-neutral-400";
  const trendBg =
    trend === "up"
      ? "bg-emerald-100/70 dark:bg-emerald-500/10"
      : trend === "down"
      ? "bg-rose-100/70 dark:bg-rose-500/10"
      : "bg-neutral-200/70 dark:bg-neutral-500/10";

  return (
    <div
      className={`w-full max-w-xl h-48 rounded-2xl 
  backdrop-blur-lg border border-white/30 dark:border-orange-500 
  p-6 flex items-center gap-4 
  transition-shadow duration-300 shadow-none
  hover:shadow-[0_16px_48px_-12px_rgba(249,115,22,0.45)] dark:hover:shadow-[0_16px_48px_-12px_rgba(251,146,60,0.55)]
  ${className}`}
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white text-orange-700 ring-1 ring-orange-200 dark:bg-neutral-800 dark:text-cyan-400 dark:ring-neutral-700">
        <Icon size={20} />
      </div>

      <div className="ml-4 flex-1">
  <div className="text-muted dark:text-neutral-400 text-xs tracking-wider uppercase">
          {title}
        </div>
  <div className="text-strong dark:text-white text-2xl font-semibold leading-tight">
          {value}
        </div>
  <div className="text-subtle dark:text-neutral-400 text-xs">
          {subtitle}
        </div>
      </div>

      <div
        className={`ml-4 inline-flex items-center gap-1 px-2 py-1 rounded-lg ${trendBg} ${trendColor} text-xs font-medium`}
      >
  <TrendIcon size={14} />
  <span className="leading-none">{delta}</span>
      </div>
    </div>
  );
}

export default PrimaryHorizantalCard;
