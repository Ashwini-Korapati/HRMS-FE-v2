import React, { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
	User,
	Briefcase,
	Shield,
	CheckCircle2,
	ChevronLeft,
	ChevronRight,
	ChevronDown,
} from "lucide-react"
import { 
    selectDepartments, 
    fetchDepartments 
} from "../../Redux/Public/departmentSlice"
import { 
    selectDesignations, 
    fetchDesignations 
} from "../../Redux/Public/designationSlice"
import {
	selectOnboardingStatus,
	selectOnboardingError,
	onboardEmployee,
} from '../../Redux/Public/onboardinguserSlice'

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
	address: { line1: "", city: "", state: "", postalCode: "", country: "" },
	emergencyContact: { 
        name: "", 
        phone: "", 
        relation: "",
        email: "" 
    },
	joiningDate: "",
	exitDate: "",
	salary: "",
	settings: { language: "", timezone: "" },
}

const stepDefs = [
	{ key: "personal", label: "Personal", icon: User },
	{ key: "employment", label: "Employment", icon: Briefcase },
	{ key: "emergency", label: "Emergency & Settings", icon: Shield },
	{ key: "review", label: "Review", icon: CheckCircle2 },
]

function Input({ label, error, required, className = "", ...props }) {
	return (
		<label className="flex flex-col gap-1.5 w-full">
			<span className="text-sm font-medium text-gray-800">
				{label} {required && <span className="text-rose-500">*</span>}
			</span>
			<input
				{...props}
				className={`w-full bg-white border rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-500 
                outline-none transition-all duration-200 
                focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 
                ${error 
                    ? "border-rose-500 focus:ring-rose-500/30" 
                    : "border-gray-300 hover:border-orange-500/50"
                } ${className}`}
			/>
			{error && <span className="text-xs text-rose-500 mt-0.5">{error}</span>}
		</label>
	)
}

function Select({ label, error, required, children, className = "", disabled, ...props }) {
	return (
		<label className="flex flex-col gap-1.5 w-full">
			<span className="text-sm font-medium text-gray-800">
				{label} {required && <span className="text-rose-500">*</span>}
			</span>
			<div className="relative">
				<select
					{...props}
					disabled={disabled}
					className={`w-full bg-white border rounded-lg px-4 py-2.5 text-gray-900 
                    placeholder-gray-500 outline-none appearance-none transition-all duration-200 
                    focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500
                    ${error 
                        ? "border-rose-500 focus:ring-rose-500/30" 
                        : "border-gray-300 hover:border-orange-500/50"
                    } ${disabled ? "opacity-60 cursor-not-allowed text-gray-700" : "text-gray-900"} ${className}`}
				>
					{children}
				</select>
				<ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
			</div>
			{error && <span className="text-xs text-rose-500 mt-0.5">{error}</span>}
		</label>
	)
}

function TextArea({ label, error, required, className = "", disabled, ...props }) {
	return (
		<label className="flex flex-col gap-1">
			<span className="text-xs text-gray-700">
				{label} {required && <span className="text-rose-500">*</span>}
			</span>
			<textarea
				{...props}
				disabled={disabled}
				className={`w-full bg-white border rounded-xl px-3 py-2 text-gray-900 placeholder-gray-500 outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40 border-gray-300 ${
					error ? "border-rose-600 focus:ring-rose-500/30" : ""
				} ${disabled ? "opacity-60 cursor-not-allowed" : ""} ${className}`}
			/>
			{error && <span className="text-[11px] text-rose-500">{error}</span>}
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
		if (!f.address?.line1) errors.address_line1 = "Required"
		if (!f.address?.city) errors.address_city = "Required"
		if (!f.address?.state) errors.address_state = "Required"
		if (!f.address?.postalCode) errors.address_postalCode = "Required"
		if (!f.address?.country) errors.address_country = "Required"
	} else if (step === 1) {
		if (!f.designationId) errors.designationId = "Required"
		if (!f.departmentId) errors.departmentId = "Required"
		if (!f.managerId) errors.managerId = "Required"
		if (!f.joiningDate) errors.joiningDate = "Required"
		if (!f.salary || !isNumber(f.salary)) errors.salary = "Invalid"
	} else if (step === 2) {
		if (!f.emergencyContact?.name) errors.ec_name = "Required"
		if (!isPhone(f.emergencyContact?.phone || "")) errors.ec_phone = "Invalid phone"
		if (!f.emergencyContact?.relation) errors.ec_relation = "Required"
		if (!f.emergencyContact?.email || !emailRe.test(f.emergencyContact?.email)) errors.ec_email = "Invalid email"
		if (!f.settings?.language) errors.language = "Required"
		if (!f.settings?.timezone) errors.timezone = "Required"
	}
	return errors
}

function isStepValid(step, f) {
	return Object.keys(getStepErrors(step, f)).length === 0
}

export default function SmartEmployeeOnboardingForm({ initialData = {}, onSubmit, className = "" }) {
    const dispatch = useDispatch()
    const departments = useSelector(selectDepartments)
    const designations = useSelector(selectDesignations)
    const onboardingStatus = useSelector(selectOnboardingStatus)
    const onboardingError = useSelector(selectOnboardingError)

    useEffect(() => {
        dispatch(fetchDepartments())
        dispatch(fetchDesignations())
    }, [dispatch])

    const [form, setForm] = useState(() => ({ ...blankForm, ...initialData }))
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

	// const handleSubmit = async () => {
    //     try {
    //         // Transform the form data to match API payload structure
    //         const formData = {
    //             firstName: form.firstName,
    //             lastName: form.lastName,
    //             email: form.email,
    //             phone: form.phone,
    //             role: "USER", // Default role as per your payload
    //             joiningDate: new Date(form.joiningDate).toISOString(),
    //             salary: parseFloat(form.salary),
    //             address: `${form.address.line1}, ${form.address.city}, ${form.address.state} ${form.address.postalCode}, ${form.address.country}`,
    //             dateOfBirth: new Date(form.dateOfBirth).toISOString(),
    //             gender: form.gender,
    //             emergencyContact: {
    //                 name: form.emergencyContact.name,
    //                 relationship: form.emergencyContact.relation,
    //                 phone: form.emergencyContact.phone,
    //                 email: form.emergencyContact.email
    //             },
    //             departmentId: form.departmentId,
    //             designationId: form.designationId
    //         }

    //         // Add optional fields if they exist
    //         if (form.exitDate) {
    //             formData.exitDate = new Date(form.exitDate).toISOString();
    //         }

    //         setSubmitted(true);
    //         await dispatch(onboardEmployee(formData)).unwrap();
    //         setStep(3); // Move to review step
    //     } catch (error) {
    //         console.error('Onboarding failed:', error);
    //     }
    // }

	const handleSubmit = async () => {
    try {
        // Helper function to validate and format dates
        const formatDateForAPI = (dateString) => {
            if (!dateString) return null;
            
            // Check if the date is in YYYY-MM-DD format (from date inputs)
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
                const date = new Date(dateString + 'T00:00:00.000Z');
                return !isNaN(date.getTime()) ? date.toISOString() : null;
            }
            
            // For other formats, try direct conversion
            const date = new Date(dateString);
            return !isNaN(date.getTime()) ? date.toISOString() : null;
        };

        // Transform the form data to match API payload structure
        const formData = {
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            role: "USER",
            joiningDate: formatDateForAPI(form.joiningDate),
            salary: parseFloat(form.salary) || 0,
            address: `${form.address.line1}, ${form.address.city}, ${form.address.state} ${form.address.postalCode}, ${form.address.country}`.trim(),
            dateOfBirth: formatDateForAPI(form.dateOfBirth),
            gender: form.gender,
            emergencyContact: {
                name: form.emergencyContact.name.trim(),
                relationship: form.emergencyContact.relation.trim(),
                phone: form.emergencyContact.phone.trim(),
                email: form.emergencyContact.email.trim()
            },
            departmentId: form.departmentId,
            designationId: form.designationId
        }

        // Add exit date only if provided and valid
        const exitDate = formatDateForAPI(form.exitDate);
        if (exitDate) {
            formData.exitDate = exitDate;
        }

        // Validate required fields
        if (!formData.joiningDate) {
            throw new Error('Joining date is required and must be valid');
        }

        if (!formData.dateOfBirth) {
            throw new Error('Date of birth is required and must be valid');
        }

        console.log('Submitting employee data:', formData);

        setSubmitted(true);
        await dispatch(onboardEmployee(formData)).unwrap();
        setStep(3);
    } catch (error) {
        console.error('Onboarding failed:', error);
        // You can also set an error state to display to the user
    }
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
								? "border-orange-600 bg-orange-500/10 text-orange-600"
								: isCompleted
								? "border-orange-600/50 bg-transparent text-orange-500"
								: "border-gray-300 bg-gray-50 text-gray-500"
						} ${!clickable ? "opacity-60 cursor-not-allowed" : "hover:border-orange-500/60"}`}
					>
						<span
							className={`w-7 h-7 grid place-items-center rounded-lg border ${
								isCurrent || isCompleted
									? "bg-white border-orange-600 text-orange-500"
									: "bg-white border-gray-300 text-gray-400"
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
					<option value="Male">Male</option>
					<option value="Female">Female</option>
					<option value="Other">Other</option>
				</Select>
				<Input label="Avatar URL" value={form.avatar} onChange={(e) => update("avatar", e.target.value)} onBlur={() => markTouched("avatar")} error={touched.avatar && errs.avatar} className="md:col-span-2" required />
				<Input label="Address Line 1" value={form.address.line1} onChange={(e) => update(["address", "line1"], e.target.value)} onBlur={() => markTouched("address_line1")} error={touched.address_line1 && errs.address_line1} className="md:col-span-2" required />
				<Input label="City" value={form.address.city} onChange={(e) => update(["address", "city"], e.target.value)} onBlur={() => markTouched("address_city")} error={touched.address_city && errs.address_city} required />
				<Input label="State" value={form.address.state} onChange={(e) => update(["address", "state"], e.target.value)} onBlur={() => markTouched("address_state")} error={touched.address_state && errs.address_state} required />
				<Input label="Postal Code" value={form.address.postalCode} onChange={(e) => update(["address", "postalCode"], e.target.value)} onBlur={() => markTouched("address_postalCode")} error={touched.address_postalCode && errs.address_postalCode} required />
				<Input label="Country" value={form.address.country} onChange={(e) => update(["address", "country"], e.target.value)} onBlur={() => markTouched("address_country")} error={touched.address_country && errs.address_country} required />
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
					className="text-gray-900"
				>
					<option value="">Select…</option>
					{designations.map((d) => (
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
					className="text-gray-900"
				>
					<option value="">Select…</option>
					{departments.map((d) => (
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
					className="text-gray-900"
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
					label="Relationship"
					value={form.emergencyContact.relation}
					onChange={(e) => update(["emergencyContact", "relation"], e.target.value)}
					onBlur={() => markTouched("ec_relation")}
					error={touched.ec_relation && errs.ec_relation}
					required
				/>
				<Input
					label="Emergency contact email"
					type="email"
					value={form.emergencyContact.email}
					onChange={(e) => update(["emergencyContact", "email"], e.target.value)}
					onBlur={() => markTouched("ec_email")}
					error={touched.ec_email && errs.ec_email}
					required
					className="md:col-span-2"
				/>
				<Select
					label="Language"
					value={form.settings.language}
					onChange={(e) => update(["settings", "language"], e.target.value)}
					onBlur={() => markTouched("language")}
					error={touched.language && errs.language}
					required
					className="text-gray-900"
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
					value={form.settings.timezone}
					onChange={(e) => update(["settings", "timezone"], e.target.value)}
					onBlur={() => markTouched("timezone")}
					error={touched.timezone && errs.timezone}
					required
					className="text-gray-900"
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
			<div className="text-gray-700 text-sm mb-3">Review the details before submission:</div>

			{/* Personal */}
			<div className="bg-gray-50 border border-gray-200 rounded-xl p-3 mb-3">
				<div className="text-gray-600 text-xs mb-2">Personal</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
					<Input label="First name" value={form.firstName} readOnly disabled />
					<Input label="Last name" value={form.lastName} readOnly disabled />
					<Input label="Email" value={form.email} readOnly disabled />
					<Input label="Phone" value={form.phone} readOnly disabled />
					<Input label="Date of birth" value={form.dateOfBirth} readOnly disabled />
					<Select label="Gender" value={form.gender} disabled>
						<option value="">Select…</option>
						<option value="Male">Male</option>
						<option value="Female">Female</option>
						<option value="Other">Other</option>
					</Select>
					<Input label="Avatar URL" value={form.avatar} readOnly disabled className="md:col-span-2" />
					<Input 
						label="Address" 
						value={[
							form.address.line1,
							form.address.city,
							form.address.state,
							form.address.postalCode,
							form.address.country
						].filter(Boolean).join(', ')} 
						readOnly 
						disabled 
						className="md:col-span-2" 
					/>
				</div>
			</div>

			{/* Employment */}
			<div className="bg-gray-50 border border-gray-200 rounded-xl p-3 mb-3">
				<div className="text-gray-600 text-xs mb-2">Employment</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
					<Select label="Designation" value={form.designationId} disabled className="text-gray-900">
						<option value="">Select…</option>
						{designations.map((d) => (
							<option key={d.id} value={d.id}>{d.name}</option>
						))}
					</Select>
					<Select label="Department" value={form.departmentId} disabled className="text-gray-900">
						<option value="">Select…</option>
						{departments.map((d) => (
							<option key={d.id} value={d.id}>{d.name}</option>
						))}
					</Select>
					<Select label="Manager" value={form.managerId} disabled className="text-gray-900">
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
			<div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
				<div className="text-gray-600 text-xs mb-2">Emergency & Settings</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
					<Input label="Emergency contact name" value={form.emergencyContact.name} readOnly disabled />
					<Input label="Emergency contact phone" value={form.emergencyContact.phone} readOnly disabled />
					<Input label="Relationship" value={form.emergencyContact.relation} readOnly disabled />
					<Input label="Emergency contact email" value={form.emergencyContact.email} readOnly disabled />
					<Select label="Language" value={form.settings.language} disabled className="text-gray-900">
						<option value="">Select…</option>
						{LOCALES.map((l) => (
							<option key={l} value={l}>{l}</option>
						))}
					</Select>
					<Select label="Timezone" value={form.settings.timezone} disabled className="text-gray-900">
						<option value="">Select…</option>
						{TIMEZONES.map((t) => (
							<option key={t} value={t}>{t}</option>
						))}
					</Select>
				</div>
			</div>

			{submitted && (
				<div className="mt-3 text-orange-600 text-sm">Submitted! Check console for payload or handle via onSubmit prop.</div>
			)}
		</div>
	)

	return (
		<section className={`bg-white border border-orange-500/30 rounded-2xl p-6 shadow-xl ${className}`}>
			{/* Stepper */}
			<HeaderStepper />

			{/* Form content */}
			<div className="mt-6">
				{step === 0 && <PersonalStep />}
				{step === 1 && <EmploymentStep />}
				{step === 2 && <EmergencyStep />}
				{step === 3 && <ReviewStep />}
			</div>

			{/* Status message */}
			{submitted && onboardingStatus !== 'idle' && (
				<div className={`mt-4 p-3 rounded-lg text-sm ${
					onboardingStatus === 'loading' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
					onboardingStatus === 'succeeded' ? 'bg-green-50 text-green-700 border border-green-200' :
					'bg-rose-50 text-rose-700 border border-rose-200'
				}`}>
					{onboardingStatus === 'loading' && 'Submitting employee data...'}
					{onboardingStatus === 'succeeded' && 'Employee onboarded successfully!'}
					{onboardingStatus === 'failed' && `Error: ${onboardingError || 'Failed to onboard employee'}`}
				</div>
			)}

			{/* Actions */}
			<div className="mt-6 flex items-center justify-between">
				<button
					onClick={goPrev}
					disabled={step === 0 || onboardingStatus === 'loading'}
					className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${
						step === 0 ? "opacity-50 cursor-not-allowed bg-gray-100 text-gray-400" : 
						"bg-gray-100 text-gray-700 hover:bg-gray-200"
					}`}
				>
					<ChevronLeft size={16} /> Back
				</button>

				{step < stepDefs.length - 1 ? (
					<button
						onClick={goNext}
						className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-orange-600 hover:bg-orange-500 text-white transition-all duration-200"
					>
						Next <ChevronRight size={16} />
					</button>
				) : (
					<button
						onClick={handleSubmit}
						disabled={onboardingStatus === 'loading'}
						className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
							onboardingStatus === 'loading'
								? "bg-gray-100 text-gray-400 opacity-50 cursor-not-allowed"
								: "bg-orange-600 hover:bg-orange-500 text-white"
						}`}
					>
						{onboardingStatus === 'loading' ? 'Submitting...' : 'Submit'}
					</button>
				)}
			</div>
		</section>
	)
}