import React, { useMemo, useState } from "react"
import {
	Building2,
	Mail,
	Phone,
	MapPin,
	Link as LinkIcon,
	User,
		Lock,
	CreditCard,
	ChevronDown,
	CheckCircle2,
} from "lucide-react"

const defaultData = {
	company: {
		name: "Acme Corp",
		email: "krishnanord@gmail.com",
		phone: "7397482029",
		address: "100 Main St, City, Country",
		website: "https://acmecorp.example",
		taxId: "TAX-123456",
		timezone: "UTC",
		workingDays: [1, 2, 3, 4, 5],
		workingHours: { start: "09:00", end: "18:00" },
	},
	admin: {
		firstName: "Krishna",
		lastName: "Admin",
		email: "krishnanord@gmail.com",
		phone: "+1-555-0101",
		password: "Str0ngP@ssw0rd!",
		dateOfBirth: "1990-01-01",
		gender: "FEMALE",
	},
	planId: "6e84b541-ed6c-4740-a01d-43b62f891815",
	trialDays: 0,
	metadata: {
		paymentTransactionId: "txn_123456789",
		paymentStatus: "PAID",
		gateway: "MANUAL",
	},
}

const PLANS = [
	{ id: "6e84b541-ed6c-4740-a01d-43b62f891815", name: "Pro (Monthly)" },
	{ id: "85f4c5b6-7a61-4c9b-8b91-2a2f7c1d0f11", name: "Starter (Free)" },
	{ id: "92bb6f13-824a-4f31-a55e-0c2fa8f8e922", name: "Business (Annual)" },
]

const WEEKDAYS = [
	{ val: 0, label: "Sun" },
	{ val: 1, label: "Mon" },
	{ val: 2, label: "Tue" },
	{ val: 3, label: "Wed" },
	{ val: 4, label: "Thu" },
	{ val: 5, label: "Fri" },
	{ val: 6, label: "Sat" },
]

const TIMEZONES = ["UTC", "America/New_York", "Europe/Berlin", "Asia/Kolkata", "Asia/Singapore"]

const years = (() => {
	const now = new Date().getFullYear()
	const min = 1950
	const arr = []
	for (let y = now - 16; y >= min; y--) arr.push(y) // at least 16 years old
	return arr
})()
const months = [
	{ val: 1, label: "Jan" },
	{ val: 2, label: "Feb" },
	{ val: 3, label: "Mar" },
	{ val: 4, label: "Apr" },
	{ val: 5, label: "May" },
	{ val: 6, label: "Jun" },
	{ val: 7, label: "Jul" },
	{ val: 8, label: "Aug" },
	{ val: 9, label: "Sep" },
	{ val: 10, label: "Oct" },
	{ val: 11, label: "Nov" },
	{ val: 12, label: "Dec" },
]

function daysInMonth(y, m) {
	return new Date(y, m, 0).getDate()
}

function Label({ children }) {
	return <span className="text-xs text-neutral-400">{children}</span>
}

function Input({ icon: Icon, label, className = "", ...props }) {
	return (
		<label className="flex flex-col gap-1">
			<Label>{label}</Label>
			<div className="relative">
				{Icon && <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />}
				<input
					{...props}
					className={`w-full bg-white dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 rounded-xl ${Icon ? "pl-9" : "pl-3"} pr-3 py-2 text-neutral-900 dark:text-neutral-200 placeholder-neutral-500 outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/40 ${className}`}
				/>
			</div>
		</label>
	)
}

function Select({ label, children, className = "", multiple, ...props }) {
	return (
		<label className="flex flex-col gap-1">
			<Label>{label}</Label>
			<div className="relative">
				<select
					{...props}
					multiple={multiple}
					className={`w-full bg-white dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 rounded-xl ${multiple ? "pl-3 pr-3" : "pl-3 pr-9"} py-2 text-neutral-900 dark:text-neutral-200 outline-none appearance-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/40 ${className}`}
				>
					{children}
				</select>
				{!multiple && (
					<ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
				)}
			</div>
		</label>
	)
}

function timeOptions() {
	const arr = []
	for (let h = 0; h < 24; h++) {
		for (let m = 0; m < 60; m += 30) {
			const hh = String(h).padStart(2, "0")
			const mm = String(m).padStart(2, "0")
			arr.push(`${hh}:${mm}`)
		}
	}
	return arr
}

export default function SmartSubscriptionForm({ className = "", initial = defaultData, onSubmit }) {
	const [data, setData] = useState(initial)
	const [section, setSection] = useState("company") // 'company' | 'admin' | 'plan' | 'review'

	const update = (path, value) => {
		setData((prev) => {
			const next = { ...prev }
			const segs = Array.isArray(path) ? path : [path]
			let cur = next
			for (let i = 0; i < segs.length - 1; i++) {
				const k = segs[i]
				cur[k] = { ...(cur[k] || {}) }
				cur = cur[k]
			}
			cur[segs[segs.length - 1]] = value
			return next
		})
	}

	const dob = useMemo(() => {
		const v = data.admin.dateOfBirth || "1990-01-01"
		const [y, m, d] = v.split("-").map((x) => parseInt(x, 10))
		return { y, m, d }
	}, [data.admin.dateOfBirth])

	const dayCount = useMemo(() => (dob.y && dob.m ? daysInMonth(dob.y, dob.m) : 31), [dob])
	const timeOpts = useMemo(() => timeOptions(), [])

	const CompanySection = () => (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-slide-up">
			<Input label="Company name" icon={Building2} value={data.company.name} onChange={(e) => update(["company", "name"], e.target.value)} />
			<Input label="Company email" icon={Mail} value={data.company.email} onChange={(e) => update(["company", "email"], e.target.value)} />
			<Input label="Phone" icon={Phone} value={data.company.phone} onChange={(e) => update(["company", "phone"], e.target.value)} />
			<Input label="Address" icon={MapPin} value={data.company.address} onChange={(e) => update(["company", "address"], e.target.value)} />
			<Input label="Website" icon={LinkIcon} value={data.company.website} onChange={(e) => update(["company", "website"], e.target.value)} />
			<Input label="Tax ID" icon={CreditCard} value={data.company.taxId} onChange={(e) => update(["company", "taxId"], e.target.value)} />

			<Select label="Timezone">
				{TIMEZONES.map((tz) => (
					<option key={tz} value={tz} selected={data.company.timezone === tz}>
						{tz}
					</option>
				))}
			</Select>

			{/* Working days (multi-select) */}
			<Select label="Working days" multiple onChange={(e) => {
				const opts = Array.from(e.target.selectedOptions).map((o) => parseInt(o.value, 10))
				update(["company", "workingDays"], opts)
			}}>
				{WEEKDAYS.map((d) => (
					<option key={d.val} value={d.val} selected={data.company.workingDays.includes(d.val)}>
						{d.label}
					</option>
				))}
			</Select>

			{/* Working hours */}
			<div className="grid grid-cols-2 gap-3 md:col-span-2">
				<Select label="Start time" onChange={(e) => update(["company", "workingHours", "start"], e.target.value)}>
					{timeOpts.map((t) => (
						<option key={t} value={t} selected={data.company.workingHours.start === t}>
							{t}
						</option>
					))}
				</Select>
				<Select label="End time" onChange={(e) => update(["company", "workingHours", "end"], e.target.value)}>
					{timeOpts.map((t) => (
						<option key={t} value={t} selected={data.company.workingHours.end === t}>
							{t}
						</option>
					))}
				</Select>
			</div>
		</div>
	)

	const AdminSection = () => (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-slide-up">
			<Input label="First name" icon={User} value={data.admin.firstName} onChange={(e) => update(["admin", "firstName"], e.target.value)} />
			<Input label="Last name" icon={User} value={data.admin.lastName} onChange={(e) => update(["admin", "lastName"], e.target.value)} />
			<Input label="Email" icon={Mail} value={data.admin.email} onChange={(e) => update(["admin", "email"], e.target.value)} />
			<Input label="Phone" icon={Phone} value={data.admin.phone} onChange={(e) => update(["admin", "phone"], e.target.value)} />
			<Input label="Password" type="password" icon={Lock} value={data.admin.password} onChange={(e) => update(["admin", "password"], e.target.value)} />

			{/* Smart date of birth dropdowns */}
			<div className="grid grid-cols-3 gap-3 md:col-span-2">
				<Select label="Year" onChange={(e) => update(["admin", "dateOfBirth"], `${e.target.value}-${String(dob.m).padStart(2, "0")}-${String(Math.min(dob.d || 1, daysInMonth(parseInt(e.target.value,10), dob.m))).padStart(2, "0")}`)}>
					{years.map((y) => (
						<option key={y} value={y} selected={dob.y === y}>
							{y}
						</option>
					))}
				</Select>
				<Select label="Month" onChange={(e) => update(["admin", "dateOfBirth"], `${dob.y}-${String(e.target.value).padStart(2, "0")}-${String(Math.min(dob.d || 1, daysInMonth(dob.y, parseInt(e.target.value,10)))).padStart(2, "0")}`)}>
					{months.map((m) => (
						<option key={m.val} value={m.val} selected={dob.m === m.val}>
							{m.label}
						</option>
					))}
				</Select>
				<Select label="Day" onChange={(e) => update(["admin", "dateOfBirth"], `${dob.y}-${String(dob.m).padStart(2, "0")}-${String(e.target.value).padStart(2, "0")}`)}>
					{Array.from({ length: dayCount }, (_, i) => i + 1).map((d) => (
						<option key={d} value={d} selected={dob.d === d}>
							{d}
						</option>
					))}
				</Select>
			</div>

			{/* Gender dropdown */}
			<Select label="Gender" onChange={(e) => update(["admin", "gender"], e.target.value)}>
				<option value="FEMALE" selected={data.admin.gender === "FEMALE"}>Female</option>
				<option value="MALE" selected={data.admin.gender === "MALE"}>Male</option>
				<option value="OTHER" selected={data.admin.gender === "OTHER"}>Other</option>
			</Select>
		</div>
	)

	const PlanSection = () => (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-slide-up">
			<Select label="Plan" onChange={(e) => update("planId", e.target.value)}>
				{PLANS.map((p) => (
					<option key={p.id} value={p.id} selected={data.planId === p.id}>
						{p.name}
					</option>
				))}
			</Select>
			<Input label="Trial days" type="number" min={0} value={data.trialDays} onChange={(e) => update("trialDays", parseInt(e.target.value || "0", 10))} />
			<Input label="Payment Txn ID" value={data.metadata.paymentTransactionId} onChange={(e) => update(["metadata", "paymentTransactionId"], e.target.value)} />
			<Select label="Payment status" onChange={(e) => update(["metadata", "paymentStatus"], e.target.value)}>
				{[
					{ v: "PAID", l: "Paid" },
					{ v: "PENDING", l: "Pending" },
					{ v: "FAILED", l: "Failed" },
				].map((o) => (
					<option key={o.v} value={o.v} selected={data.metadata.paymentStatus === o.v}>
						{o.l}
					</option>
				))}
			</Select>
			<Select label="Gateway" onChange={(e) => update(["metadata", "gateway"], e.target.value)}>
				{[
					{ v: "MANUAL", l: "Manual" },
					{ v: "STRIPE", l: "Stripe" },
					{ v: "RAZORPAY", l: "Razorpay" },
				].map((o) => (
					<option key={o.v} value={o.v} selected={data.metadata.gateway === o.v}>
						{o.l}
					</option>
				))}
			</Select>
		</div>
	)

	const ReviewSection = () => (
		<div className="animate-scale-in">
			<div className="text-neutral-300 text-sm mb-2">Review subscription payload:</div>
			<pre className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-3 text-[12px] overflow-auto max-h-64 no-scrollbar text-neutral-300">
				{JSON.stringify(data, null, 2)}
			</pre>
		</div>
	)

	return (
		<section className={`bg-transparent border border-orange-500/50 rounded-2xl p-4 ${className}`}>
			{/* Section switcher (no validations) */}
			<div className="flex items-center justify-between gap-2 mb-3">
				{[
					{ k: "company", l: "Company", icon: Building2 },
					{ k: "admin", l: "Admin", icon: User },
					{ k: "plan", l: "Plan & Billing", icon: CreditCard },
					{ k: "review", l: "Review", icon: CheckCircle2 },
				].map((s) => {
					const Icon = s.icon
					const isCurrent = section === s.k
					return (
						<button
							key={s.k}
							onClick={() => setSection(s.k)}
							className={`flex-1 min-w-0 flex items-center gap-2 rounded-xl px-2 py-2 border transition-colors text-xs ${
								isCurrent
									? "border-orange-600 bg-orange-500/10 text-orange-600 dark:text-orange-400"
									: "border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:border-orange-500/60"
							}`}
						>
							<span
								className={`w-7 h-7 grid place-items-center rounded-lg border ${
									isCurrent
										? "bg-neutral-900 border-orange-600 text-orange-500 dark:text-orange-400"
										: "bg-neutral-900 border-neutral-700 text-neutral-400"
								}`}
							>
								<Icon size={14} />
							</span>
							<span className="truncate">{s.l}</span>
						</button>
					)
				})}
			</div>

			{/* Body */}
			{section === "company" && <CompanySection />}
			{section === "admin" && <AdminSection />}
			{section === "plan" && <PlanSection />}
			{section === "review" && <ReviewSection />}

			{/* Footer */}
			<div className="mt-4 flex items-center justify-end">
				<button
					onClick={() => onSubmit?.(data)}
					className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-orange-600 bg-orange-500/90 hover:bg-orange-500 text-white shadow-sm"
				>
					Create subscription
				</button>
			</div>
		</section>
	)
}

