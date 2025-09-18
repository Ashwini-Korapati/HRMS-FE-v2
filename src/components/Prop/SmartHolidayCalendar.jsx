import React, { useMemo, useState } from "react"
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react"

// Types (informal):
// Event = { date: string (YYYY-MM-DD), title: string, type: 'paid' | 'birthday' }

const fmtDateKey = (d) => d.toISOString().slice(0, 10)

const addMonths = (date, months) => {
	const d = new Date(date)
	d.setDate(1)
	d.setMonth(d.getMonth() + months)
	return d
}

const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate()

const monthMatrix = (year, month) => {
	// Build a 6x7 grid starting on Sunday
	const firstOfMonth = new Date(year, month, 1)
	const startDay = firstOfMonth.getDay() // 0..6 (Sun..Sat)
	const totalDays = daysInMonth(year, month)

	// Previous month's tail
	const prevMonth = month === 0 ? 11 : month - 1
	const prevYear = month === 0 ? year - 1 : year
	const prevDays = daysInMonth(prevYear, prevMonth)

	const cells = []
	// Fill previous month days
	for (let i = startDay - 1; i >= 0; i--) {
		const date = new Date(prevYear, prevMonth, prevDays - i)
		cells.push({ date, inCurrentMonth: false })
	}
	// Fill current month days
	for (let d = 1; d <= totalDays; d++) {
		const date = new Date(year, month, d)
		cells.push({ date, inCurrentMonth: true })
	}
	// Fill next month head
	while (cells.length % 7 !== 0) {
		const last = cells[cells.length - 1].date
		const date = new Date(last)
		date.setDate(date.getDate() + 1)
		cells.push({ date, inCurrentMonth: false })
	}
	// Ensure 6 rows
	while (cells.length < 42) {
		const last = cells[cells.length - 1].date
		const date = new Date(last)
		date.setDate(date.getDate() + 1)
		cells.push({ date, inCurrentMonth: false })
	}
	return cells
}

const monthLabel = (d) => d.toLocaleString(undefined, { month: "long", year: "numeric" })
const weekdayShort = ["S", "M", "T", "W", "T", "F", "S"]

export default function SmartHolidayCalendar({
	className = "",
	events: inputEvents,
}) {
	const today = useMemo(() => new Date(), [])
	const [mode, setMode] = useState("calendar") // 'calendar' | 'list'
	const [baseOffset, setBaseOffset] = useState(0) // months from current

	// Demo events if none provided
	const events = useMemo(() => {
		if (Array.isArray(inputEvents) && inputEvents.length) return inputEvents
		const now = new Date()
		const y = now.getFullYear()
		const m = now.getMonth()
		const pad = (n) => String(n).padStart(2, "0")
		const make = (Y, M, D, type, title) => ({
			date: `${Y}-${pad(M + 1)}-${pad(D)}`,
			type,
			title,
		})
		return [
			make(y, m, 5, "paid", "Founders Day"),
			make(y, m, 12, "birthday", "Alex's Birthday"),
			make(y, m, 26, "paid", "Company Holiday"),
			make(y, (m + 1) % 12, 1, "paid", "Festival"),
			make(y, (m + 1) % 12, 9, "birthday", "Priya's Birthday"),
			make(y, (m + 1) % 12, 23, "paid", "Regional Holiday"),
		]
	}, [inputEvents])

	// Map events by date key
	const eventsByDay = useMemo(() => {
		const map = new Map()
		for (const e of events) {
			map.set(e.date, [...(map.get(e.date) || []), e])
		}
		return map
	}, [events])

	const baseDate = useMemo(() => addMonths(new Date(today.getFullYear(), today.getMonth(), 1), baseOffset), [today, baseOffset])
	const nextDate = useMemo(() => addMonths(baseDate, 1), [baseDate])

	const monthsToRender = [baseDate, nextDate]

	const pickDayStyle = (date, inCurrentMonth) => {
		const key = fmtDateKey(date)
		const dayEvents = eventsByDay.get(key) || []
		const isWeekend = date.getDay() === 0 || date.getDay() === 6
		const isToday = fmtDateKey(date) === fmtDateKey(today)

		// Priority: birthday > paid > weekend > normal
		const hasBirthday = dayEvents.some((e) => e.type === "birthday")
		const hasPaid = dayEvents.some((e) => e.type === "paid")

		let cls = ""
		if (!inCurrentMonth) {
			cls = "text-neutral-600"
		} else if (hasBirthday) {
			cls = "bg-rose-900/30 ring-1 ring-rose-600 text-rose-300"
		} else if (hasPaid) {
			cls = "bg-cyan-900/30 ring-1 ring-cyan-600 text-cyan-300"
		} else if (isWeekend) {
			cls = "bg-neutral-800/70 text-neutral-300"
		} else {
			cls = "text-neutral-300"
		}
		if (isToday && inCurrentMonth) {
			cls += " shadow-[0_0_0_2px_rgba(34,197,235,0.35)]"
		}
		return { cls, dayEvents }
	}

	const renderMonth = (date, key) => {
		const year = date.getFullYear()
		const month = date.getMonth()
		const cells = monthMatrix(year, month)
		return (
			<div key={key} className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-3">
				<div className="flex items-center justify-between mb-2">
					<h3 className="text-neutral-200 text-sm font-medium">{monthLabel(date)}</h3>
					<div className="flex items-center gap-2 text-[10px] text-neutral-400">
						<span className="w-2 h-2 rounded-full bg-cyan-500"></span>
						<span>Paid</span>
						<span className="w-2 h-2 rounded-full bg-rose-500 ml-3"></span>
						<span>Birthday</span>
						<span className="w-2 h-2 rounded-full bg-neutral-600 ml-3"></span>
						<span>Weekend</span>
					</div>
				</div>

				<div className="grid grid-cols-7 gap-1 text-[11px] text-neutral-500 mb-1">
					{weekdayShort.map((d) => (
						<div key={d} className="h-6 grid place-items-center">{d}</div>
					))}
				</div>
				<div className="grid grid-cols-7 gap-1">
					{cells.map(({ date: d, inCurrentMonth }, idx) => {
						const { cls, dayEvents } = pickDayStyle(d, inCurrentMonth)
						return (
							<div key={idx} className="aspect-square">
								<div
									className={`w-full h-full rounded-lg grid place-items-center border border-neutral-800/60 transition-colors duration-200 ${cls}`}
									title={dayEvents.map((e) => e.title).join(", ")}
								>
									<div className="flex items-center gap-1">
										<span className="text-[12px] leading-none">{d.getDate()}</span>
										<div className="flex gap-0.5">
											{dayEvents.slice(0, 2).map((e, i) => (
												<span
													key={i}
													className={`w-1.5 h-1.5 rounded-full ${
														e.type === "birthday" ? "bg-rose-500" : e.type === "paid" ? "bg-cyan-500" : "bg-neutral-500"
													}`}
												/>
											))}
										</div>
									</div>
								</div>
							</div>
						)
					})}
				</div>
			</div>
		)
	}

	const renderList = () => {
		// List only "paid" holidays for the two rendered months
		const monthsKeys = monthsToRender.map((d) => [d.getFullYear(), d.getMonth()].join("-"))
		const isInRenderedMonths = (d) => monthsKeys.includes([d.getFullYear(), d.getMonth()].join("-"))

		const paidHolidays = events
			.filter((e) => e.type === "paid")
			.map((e) => ({ ...e, _date: new Date(e.date) }))
			.filter((e) => isInRenderedMonths(e._date))
			.sort((a, b) => a._date - b._date)

		return (
			<div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-3 no-scrollbar max-h-[360px] overflow-y-auto animate-fade-in">
				{paidHolidays.length === 0 && (
					<div className="text-neutral-400 text-sm">No paid holidays in this period.</div>
				)}
				<ul className="divide-y divide-neutral-800">
					{paidHolidays.map((e, idx) => (
						<li key={idx} className="py-2 flex items-center gap-3">
							<div className="w-9 h-9 rounded-lg bg-cyan-900/40 border border-cyan-700 text-cyan-300 grid place-items-center">
								<CalendarDays size={16} />
							</div>
							<div className="flex-1 min-w-0">
								<div className="text-neutral-200 text-sm">{e.title}</div>
								<div className="text-neutral-500 text-xs">
									{e._date.toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
								</div>
							</div>
							<span className="text-[10px] text-cyan-300 bg-cyan-900/30 border border-cyan-700 px-2 py-0.5 rounded-full">Paid</span>
						</li>
					))}
				</ul>
			</div>
		)
	}

	return (
		<section className={`bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 ${className}`}>
			{/* Header */}
			<div className="flex items-center justify-between mb-3">
				<div className="flex items-center gap-2">
					<div className="inline-flex p-0.5 bg-neutral-800 border border-neutral-700 rounded-xl">
						<button
							className={`px-3 py-1.5 text-xs rounded-[10px] transition-all ${
								mode === "calendar"
									? "bg-neutral-700 text-white shadow-inner"
									: "text-neutral-400 hover:text-neutral-200"
							}`}
							onClick={() => setMode("calendar")}
						>
							Calendar
						</button>
						<button
							className={`px-3 py-1.5 text-xs rounded-[10px] transition-all ${
								mode === "list" ? "bg-neutral-700 text-white shadow-inner" : "text-neutral-400 hover:text-neutral-200"
							}`}
							onClick={() => setMode("list")}
						>
							List
						</button>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<button
						aria-label="Previous"
						onClick={() => setBaseOffset((v) => v - 1)}
						className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 grid place-items-center text-neutral-300 hover:text-white transition-colors"
					>
						<ChevronLeft size={16} />
					</button>
					<button
						aria-label="Next"
						onClick={() => setBaseOffset((v) => v + 1)}
						className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 grid place-items-center text-neutral-300 hover:text-white transition-colors"
					>
						<ChevronRight size={16} />
					</button>
				</div>
			</div>

			{/* Body */}
			{mode === "calendar" ? (
				<div className="grid md:grid-cols-2 gap-3 animate-slide-up">
					{monthsToRender.map((d, i) => renderMonth(d, i))}
				</div>
			) : (
				renderList()
			)}

			{/* Legend for quick reference (for calendar mode on small screens) */}
			{mode === "calendar" && (
				<div className="mt-3 flex items-center gap-3 text-[11px] text-neutral-400 md:hidden">
					<span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-500"></span> Paid</span>
					<span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Birthday</span>
					<span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-neutral-600"></span> Weekend</span>
				</div>
			)}
		</section>
	)
}

