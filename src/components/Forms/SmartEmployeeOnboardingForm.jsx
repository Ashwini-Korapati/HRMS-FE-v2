import React, { useState } from "react"
import {
	User,
	Briefcase,
	Shield ,
	CheckCircle2,
	ChevronLeft,
	ChevronRight,
	ChevronDown,
} from "lucide-react"

const DESIGNATIONS = [
	{ id: "JR-ENG", name: "Junior Engineer" },
	{ id: "ENG", name: "Engineer" },
	{ id: "SR-ENG", name: "Senior Engineer" },
	{ id: "MGR", name: "Manager" },
]

const DEPARTMENTS = [
	{ id: "ENG", name: "Engineering" },
	{ id: "HR", name: "Human Resources" },
	{ id: "SAL", name: "Sales" },
	{ id: "FIN", name: "Finance" },
]

const MANAGERS = [
	{ id: "U1001", name: "Priya Kumar" },
	{ id: "U1002", name: "John Carter" },
	{ id: "U1003", name: "Alex Chen" },
]

const LOCALES = ["en-US", "en-GB", "de-DE", "fr-FR", "hi-IN"]
const TIMEZONES = ["UTC", "America/New_York", "Europe/Berlin", "Asia/Kolkata", "Asia/Singapore"]

const blankForm = {
	firstName: "",
	lastName: "",
	email: "",
	phone: "",
	designationId: "",
	departmentId: "",
	managerId: "",
	avatar: "",
	dateOfBirth: "",
	gender: "",
	address: "",
	emergencyContact: { name: "", phone: "", relation: "" },
	joiningDate: "",
	exitDate: "",
	salary: "",
	settings: { locale: "", tz: "" },
}

const stepDefs = [
	{ key: "personal", label: "Personal", icon: User },
	{ key: "employment", label: "Employment", icon: Briefcase },
	{ key: "emergency", label: "Emergency & Settings", icon: Shield  },
	{ key: "review", label: "Review", icon: CheckCircle2 },
]

function Input({ label, error, required, className = "", ...props }) {
	return (
		<label className="flex flex-col gap-1">
			<span className="text-xs text-neutral-400">
				{label} {required && <span className="text-rose-400">*</span>}
			</span>
			<input
				{...props}
				className={`w-full bg-white dark:bg-neutral-800/80 border rounded-xl px-3 py-2 text-neutral-900 dark:text-neutral-200 placeholder-force-white outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40 border-neutral-300 dark:border-neutral-700 ${
					error ? "border-rose-600 focus:ring-rose-500/30" : ""
				} ${className}`}
			/>
			{error && <span className="text-[11px] text-rose-400">{error}</span>}
		</label>
	)
}

function Select({ label, error, required, children, className = "", disabled, ...props }) {
	return (
		<label className="flex flex-col gap-1">
			<span className="text-xs text-neutral-400">
				{label} {required && <span className="text-rose-400">*</span>}
			</span>
			<div className="relative">
				<select
					{...props}
					disabled={disabled}
					className={`w-full bg-white dark:bg-neutral-800/80 border rounded-xl px-3 pr-9 py-2 text-neutral-900 dark:text-neutral-200 placeholder-force-white outline-none appearance-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40 border-neutral-300 dark:border-neutral-700 ${
						error ? "border-rose-600 focus:ring-rose-500/30" : ""
					} ${disabled ? "opacity-60 cursor-not-allowed" : ""} ${className}`}
				>
					{children}
				</select>
				<ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
			</div>
			{error && <span className="text-[11px] text-rose-400">{error}</span>}
		</label>
	)
}

function TextArea({ label, error, required, className = "", disabled, ...props }) {
	return (
		<label className="flex flex-col gap-1">
			<span className="text-xs text-neutral-400">
				{label} {required && <span className="text-rose-400">*</span>}
			</span>
			<textarea
				{...props}
				disabled={disabled}
				className={`w-full bg-white dark:bg-neutral-800/80 border rounded-xl px-3 py-2 text-neutral-900 dark:text-neutral-200 placeholder-force-white outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40 border-neutral-300 dark:border-neutral-700 ${
					error ? "border-rose-600 focus:ring-rose-500/30" : ""
				} ${disabled ? "opacity-60 cursor-not-allowed" : ""} ${className}`}
			/>
			{error && <span className="text-[11px] text-rose-400">{error}</span>}
		</label>
	)
}

const emailRe = /.+@.+\..+/
const isPhone = (v) => v && v.replace(/\D/g, "").length >= 10
const isNumber = (v) => /^\d+(\.\d+)?$/.test(v)

function getStepErrors(step, f) {
	const errors = {}
	if (step === 0) {
		if (!f.firstName) errors.firstName = "Required"
		if (!f.lastName) errors.lastName = "Required"
		if (!f.email || !emailRe.test(f.email)) errors.email = "Invalid email"
		if (!isPhone(f.phone)) errors.phone = "Invalid phone"
		if (!f.dateOfBirth) errors.dateOfBirth = "Required"
		if (!f.gender) errors.gender = "Required"
		if (!f.avatar) errors.avatar = "Required"
		if (!f.address) errors.address = "Required"
	} else if (step === 1) {
		if (!f.designationId) errors.designationId = "Required"
		if (!f.departmentId) errors.departmentId = "Required"
		if (!f.managerId) errors.managerId = "Required"
		if (!f.joiningDate) errors.joiningDate = "Required"
		if (!f.salary || !isNumber(f.salary)) errors.salary = "Invalid"
		// exitDate optional
	} else if (step === 2) {
		if (!f.emergencyContact?.name) errors.ec_name = "Required"
		if (!isPhone(f.emergencyContact?.phone || "")) errors.ec_phone = "Invalid phone"
		if (!f.emergencyContact?.relation) errors.ec_relation = "Required"
		if (!f.settings?.locale) errors.locale = "Required"
		if (!f.settings?.tz) errors.tz = "Required"
	}
	return errors
}

function isStepValid(step, f) {
	return Object.keys(getStepErrors(step, f)).length === 0
}

export default function SmartEmployeeOnboardingForm({ initialData, onSubmit, className = "" }) {
	const [form, setForm] = useState(() => ({ ...blankForm, ...(initialData || {}) }))
	const [step, setStep] = useState(0)
	const [touched, setTouched] = useState({})
	const [submitted, setSubmitted] = useState(false)

	const completedMask = stepDefs.map((_, i) => isStepValid(i, form))
	const lastCompletedIndex = completedMask.reduce((acc, v, i) => (v ? i : acc), -1)

	const update = (path, value) => {
		setForm((prev) => {
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

	const markTouched = (key) => setTouched((t) => ({ ...t, [key]: true }))

	const goNext = () => {
		if (step < stepDefs.length - 1) setStep(step + 1)
	}
	const goPrev = () => setStep((s) => Math.max(0, s - 1))

	const handleSubmit = () => {
		if (!isStepValid(0, form) || !isStepValid(1, form) || !isStepValid(2, form)) return
		setSubmitted(true)
		onSubmit?.(form)
	}

	const HeaderStepper = () => (
		<div className="flex items-center justify-between gap-2">
			{stepDefs.map((s, i) => {
				const Icon = s.icon
				const isCurrent = i === step
				const isCompleted = completedMask[i]
				const clickable = i <= lastCompletedIndex + 1 && i <= step
				return (
					<button
						key={s.key}
						disabled={!clickable}
						onClick={() => clickable && setStep(i)}
						className={`flex-1 min-w-0 flex items-center gap-2 rounded-xl px-2 py-2 border transition-colors text-xs ${
							isCurrent
								? "border-orange-600 bg-orange-500/10 text-orange-600 dark:text-orange-400"
								: isCompleted
								? "border-orange-600/50 bg-transparent text-orange-500 dark:text-orange-400"
								: "border-neutral-800 bg-neutral-900/40 text-neutral-400"
						} ${!clickable ? "opacity-60 cursor-not-allowed" : "hover:border-orange-500/60"}`}
					>
						<span
							className={`w-7 h-7 grid place-items-center rounded-lg border ${
								isCurrent || isCompleted
									? "bg-neutral-900 border-orange-600 text-orange-500 dark:text-orange-400"
									: "bg-neutral-900 border-neutral-700 text-neutral-400"
							}`}
						>
							<Icon size={14} />
						</span>
						<span className="truncate">{s.label}</span>
					</button>
				)
			})}
		</div>
	)

	const PersonalStep = () => {
		const errs = getStepErrors(0, form)
		return (
			<div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-slide-up">
				<Input label="First name" value={form.firstName} onChange={(e) => update("firstName", e.target.value)} onBlur={() => markTouched("firstName")} error={touched.firstName && errs.firstName} required />
				<Input label="Last name" value={form.lastName} onChange={(e) => update("lastName", e.target.value)} onBlur={() => markTouched("lastName")} error={touched.lastName && errs.lastName} required />
				<Input label="Email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} onBlur={() => markTouched("email")} error={touched.email && errs.email} required />
				<Input label="Phone" type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} onBlur={() => markTouched("phone")} error={touched.phone && errs.phone} required />
				<Input label="Date of birth" type="date" value={form.dateOfBirth} onChange={(e) => update("dateOfBirth", e.target.value)} onBlur={() => markTouched("dateOfBirth")} error={touched.dateOfBirth && errs.dateOfBirth} required />
				<Select label="Gender" value={form.gender} onChange={(e) => update("gender", e.target.value)} onBlur={() => markTouched("gender")} error={touched.gender && errs.gender} required>
					<option value="">Select…</option>
					<option value="FEMALE">Female</option>
					<option value="MALE">Male</option>
					<option value="OTHER">Other</option>
				</Select>
				<Input label="Avatar URL" value={form.avatar} onChange={(e) => update("avatar", e.target.value)} onBlur={() => markTouched("avatar")} error={touched.avatar && errs.avatar} className="md:col-span-2" required />
				<TextArea label="Address" rows={3} value={form.address} onChange={(e) => update("address", e.target.value)} onBlur={() => markTouched("address")} error={touched.address && errs.address} className="md:col-span-2" required />
			</div>
		)
	}

	const EmploymentStep = () => {
		const errs = getStepErrors(1, form)
		return (
			<div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-slide-up">
				<Select
					label="Designation"
					value={form.designationId}
					onChange={(e) => update("designationId", e.target.value)}
					onBlur={() => markTouched("designationId")}
					error={touched.designationId && errs.designationId}
					required
				>
					<option value="">Select…</option>
					{DESIGNATIONS.map((d) => (
						<option key={d.id} value={d.id}>
							{d.name}
						</option>
					))}
				</Select>
				<Select
					label="Department"
					value={form.departmentId}
					onChange={(e) => update("departmentId", e.target.value)}
					onBlur={() => markTouched("departmentId")}
					error={touched.departmentId && errs.departmentId}
					required
				>
					<option value="">Select…</option>
					{DEPARTMENTS.map((d) => (
						<option key={d.id} value={d.id}>
							{d.name}
						</option>
					))}
				</Select>
				<Select
					label="Manager"
					value={form.managerId}
					onChange={(e) => update("managerId", e.target.value)}
					onBlur={() => markTouched("managerId")}
					error={touched.managerId && errs.managerId}
					required
				>
					<option value="">Select…</option>
					{MANAGERS.map((m) => (
						<option key={m.id} value={m.id}>
							{m.name}
						</option>
					))}
				</Select>
				<Input
					label="Joining date"
					type="date"
					value={form.joiningDate}
					onChange={(e) => update("joiningDate", e.target.value)}
					onBlur={() => markTouched("joiningDate")}
					error={touched.joiningDate && errs.joiningDate}
					required
				/>
				<Input
					label="Exit date (optional)"
					type="date"
					value={form.exitDate}
					onChange={(e) => update("exitDate", e.target.value)}
				/>
				<Input
					label="Salary"
					type="text"
					inputMode="decimal"
					value={form.salary}
					onChange={(e) => update("salary", e.target.value)}
					onBlur={() => markTouched("salary")}
					error={touched.salary && errs.salary}
					required
				/>
			</div>
		)
	}

	const EmergencyStep = () => {
		const errs = getStepErrors(2, form)
		return (
			<div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-slide-up">
				<Input
					label="Emergency contact name"
					value={form.emergencyContact.name}
					onChange={(e) => update(["emergencyContact", "name"], e.target.value)}
					onBlur={() => markTouched("ec_name")}
					error={touched.ec_name && errs.ec_name}
					required
				/>
				<Input
					label="Emergency contact phone"
					value={form.emergencyContact.phone}
					onChange={(e) => update(["emergencyContact", "phone"], e.target.value)}
					onBlur={() => markTouched("ec_phone")}
					error={touched.ec_phone && errs.ec_phone}
					required
				/>
				<Input
					label="Relation"
					value={form.emergencyContact.relation}
					onChange={(e) => update(["emergencyContact", "relation"], e.target.value)}
					onBlur={() => markTouched("ec_relation")}
					error={touched.ec_relation && errs.ec_relation}
					required
				/>
				<Select
					label="Locale"
					value={form.settings.locale}
					onChange={(e) => update(["settings", "locale"], e.target.value)}
					onBlur={() => markTouched("locale")}
					error={touched.locale && errs.locale}
					required
				>
					<option value="">Select…</option>
					{LOCALES.map((l) => (
						<option key={l} value={l}>
							{l}
						</option>
					))}
				</Select>
				<Select
					label="Timezone"
					value={form.settings.tz}
					onChange={(e) => update(["settings", "tz"], e.target.value)}
					onBlur={() => markTouched("tz")}
					error={touched.tz && errs.tz}
					required
				>
					<option value="">Select…</option>
					{TIMEZONES.map((t) => (
						<option key={t} value={t}>
							{t}
						</option>
					))}
				</Select>
			</div>
		)
	}

	const ReviewStep = () => (
		<div className="animate-scale-in">
			<div className="text-neutral-300 text-sm mb-3">Review the details before submission:</div>

			{/* Personal */}
			<div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-3 mb-3">
				<div className="text-neutral-400 text-xs mb-2">Personal</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
					<Input label="First name" value={form.firstName} readOnly disabled />
					<Input label="Last name" value={form.lastName} readOnly disabled />
					<Input label="Email" value={form.email} readOnly disabled />
					<Input label="Phone" value={form.phone} readOnly disabled />
					<Input label="Date of birth" value={form.dateOfBirth} readOnly disabled />
					<Select label="Gender" value={form.gender} disabled>
						<option value="">Select…</option>
						<option value="FEMALE">Female</option>
						<option value="MALE">Male</option>
						<option value="OTHER">Other</option>
					</Select>
					<Input label="Avatar URL" value={form.avatar} readOnly disabled className="md:col-span-2" />
					<TextArea label="Address" value={form.address} rows={3} disabled className="md:col-span-2" />
				</div>
			</div>

			{/* Employment */}
			<div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-3 mb-3">
				<div className="text-neutral-400 text-xs mb-2">Employment</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
					<Select label="Designation" value={form.designationId} disabled>
						<option value="">Select…</option>
						{DESIGNATIONS.map((d) => (
							<option key={d.id} value={d.id}>{d.name}</option>
						))}
					</Select>
					<Select label="Department" value={form.departmentId} disabled>
						<option value="">Select…</option>
						{DEPARTMENTS.map((d) => (
							<option key={d.id} value={d.id}>{d.name}</option>
						))}
					</Select>
					<Select label="Manager" value={form.managerId} disabled>
						<option value="">Select…</option>
						{MANAGERS.map((m) => (
							<option key={m.id} value={m.id}>{m.name}</option>
						))}
					</Select>
					<Input label="Joining date" value={form.joiningDate} readOnly disabled />
					<Input label="Exit date (optional)" value={form.exitDate} readOnly disabled />
					<Input label="Salary" value={form.salary} readOnly disabled />
				</div>
			</div>

			{/* Emergency & Settings */}
			<div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-3">
				<div className="text-neutral-400 text-xs mb-2">Emergency & Settings</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
					<Input label="Emergency contact name" value={form.emergencyContact.name} readOnly disabled />
					<Input label="Emergency contact phone" value={form.emergencyContact.phone} readOnly disabled />
					<Input label="Relation" value={form.emergencyContact.relation} readOnly disabled />
					<Select label="Locale" value={form.settings.locale} disabled>
						<option value="">Select…</option>
						{LOCALES.map((l) => (
							<option key={l} value={l}>{l}</option>
						))}
					</Select>
					<Select label="Timezone" value={form.settings.tz} disabled>
						<option value="">Select…</option>
						{TIMEZONES.map((t) => (
							<option key={t} value={t}>{t}</option>
						))}
					</Select>
				</div>
			</div>

			{submitted && (
				<div className="mt-3 text-orange-400 text-sm">Submitted! Check console for payload or handle via onSubmit prop.</div>
			)}
		</div>
	)

	return (
		<section className={`bg-transparent border border-orange-500/50 rounded-2xl p-4 ${className}`}>
			{/* Stepper */}
			<HeaderStepper />

			{/* Body */}
			<div className="mt-4">
				{step === 0 && <PersonalStep />}
				{step === 1 && <EmploymentStep />}
				{step === 2 && <EmergencyStep />}
				{step === 3 && <ReviewStep />}
			</div>

			{/* Footer actions */}
			<div className="mt-4 flex items-center justify-between">
				<button
					onClick={goPrev}
					disabled={step === 0}
					className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border bg-neutral-900/40 text-neutral-300 hover:text-white transition-colors ${
						step === 0 ? "opacity-60 cursor-not-allowed" : "hover:border-orange-500/60"
					} border-neutral-700`}
				>
					<ChevronLeft size={16} /> Back
				</button>

				{step < stepDefs.length - 1 ? (
					<button
						onClick={goNext}
						className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-orange-600 bg-orange-500/90 hover:bg-orange-500 text-white shadow-sm"
					>
						Next <ChevronRight size={16} />
					</button>
				) : (
					<button
						onClick={handleSubmit}
						disabled={!isStepValid(0, form) || !isStepValid(1, form) || !isStepValid(2, form)}
						className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border ${
							isStepValid(0, form) && isStepValid(1, form) && isStepValid(2, form)
								? "border-orange-600 bg-orange-500/90 hover:bg-orange-500 text-white shadow-sm"
								: "bg-neutral-800 text-neutral-400 border-neutral-700 opacity-60 cursor-not-allowed"
						}`}
					>
						Submit
					</button>
				)}
			</div>
		</section>
	)
}

