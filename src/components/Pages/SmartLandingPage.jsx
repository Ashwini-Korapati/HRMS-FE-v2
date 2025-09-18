import React, { useState, useEffect, useRef } from "react"
import { useNavigate } from 'react-router-dom'
import { isAuthenticated } from '../../auth/auth'
// Auth form now lives at /login route; no inline modal import needed
import { selectBasePath, selectIsAuthenticated } from '../../Redux/Public/authSlice'
import { useDispatch, useSelector } from 'react-redux'
import { fetchPlans, selectPlans, selectPlanStatus, selectPlansState } from '../../Redux/Public/plansSlice'
import { Check, X, Users, Briefcase, Clock, BarChart3, ShieldCheck, Settings, ArrowRight, Building2, Globe, Github, Twitter, Linkedin } from "lucide-react"


function formatPrice(p, currency) {
	if (p === 0) return "Free Trial"
	return new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "USD", maximumFractionDigits: 0 }).format(p)
}

const glass = "bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl"

// Feature, steps, testimonials, faq data
const featureList = [
	{ icon: Users, title: "Employee Hub", desc: "Unified profiles, onboarding, roles & lifecycle automation." },
	{ icon: Clock, title: "Attendance & Leave", desc: "Geo tagging, approvals & smart leave policies." },
	{ icon: Briefcase, title: "Projects & Tasks", desc: "Allocate work, track progress & workload health." },
	{ icon: BarChart3, title: "Analytics", desc: "Real‑time headcount, performance & cost dashboards." },
	{ icon: ShieldCheck, title: "Compliance", desc: "Audit logs, RBAC, data residency & SOC2 ready." },
	{ icon: Settings, title: "Automation", desc: "Policy-driven workflows & scheduled actions." }
]

const howItWorks = [
	{ step: 1, title: "Create Workspace", text: "Sign up & set your company basics in under 2 minutes." },
	{ step: 2, title: "Add People", text: "Bulk import or invite employees with role presets." },
	{ step: 3, title: "Activate Modules", text: "Toggle modules you need: attendance, payroll, performance." },
	{ step: 4, title: "Track & Optimize", text: "Use analytics to drive decisions & trigger automations." }
]

const testimonials = [
	{ name: "Sarah Chen", role: "People Ops Lead", company: "NovaSoft", quote: "We cut onboarding time by 62% and finally have reliable headcount analytics.", avatar: "SC" },
	{ name: "Michael Lee", role: "HR Director", company: "Orbit Labs", quote: "The automation rules saved our team hours every week.", avatar: "ML" },
	{ name: "Priya Nair", role: "COO", company: "GrowthForge", quote: "Clean UI, powerful insights. Adoption was instant across teams.", avatar: "PN" }
]

const faqs = [
	{ q: "Can I switch plans later?", a: "Yes, upgrades & downgrades apply prorated immediately without data loss." },
	{ q: "Is my data secure?", a: "We implement encryption at rest & in transit, role based access & audit trails." },
	{ q: "Do you offer discounts for startups?", a: "Yes, eligible startups get 30% off first year. Contact sales." },
	{ q: "How does the free trial work?", a: "Full access for 14 days. No credit card required." },
	{ q: "Do you have APIs?", a: "Yes, REST & webhooks. Advanced integrations on Growth and above." }
]

const footerLinks = {
	product: ["Features", "Pricing", "Security", "Roadmap"],
	company: ["About", "Blog", "Careers", "Press"],
	resources: ["Docs", "API", "Status", "Support"],
	legal: ["Privacy", "Terms", "DPA", "Cookies"],
}

function PlanCard({ plan, delay = 0 }) {
	const modules = plan.features?.modules || {}
	const limits = plan.features?.limits || {}
	const support = plan.features?.support || {}
	const entries = Object.entries(modules)
	return (
		<div
			className={`${glass} p-5 flex flex-col gap-4 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4)] animate-scale-in`}
			style={{ animationDelay: `${delay}ms` }}
		>
			<div className="flex items-start justify-between gap-2">
				<div>
					<h3 className="text-lg font-semibold text-white tracking-tight">{plan.name}</h3>
					<p className="text-xs text-neutral-300 mt-0.5 leading-relaxed max-w-[240px]">{plan.description}</p>
				</div>
				<div className="text-right">
					<div className="text-sm font-medium text-cyan-300">{formatPrice(plan.price, plan.currency)}</div>
					{plan.price !== 0 && <div className="text-[10px] text-neutral-400">per month</div>}
				</div>
			</div>
			<div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-neutral-300">
				<div><span className="text-neutral-400">Employees:</span> {plan.maxEmployees === null ? "Unlimited" : plan.maxEmployees}</div>
				<div><span className="text-neutral-400">Departments:</span> {limits.departments ?? "-"}</div>
				<div><span className="text-neutral-400">Projects:</span> {limits.projects ?? "-"}</div>
				<div><span className="text-neutral-400">Storage:</span> {limits.storage ?? "-"}</div>
			</div>
			<div className="pt-1">
				<div className="text-[10px] uppercase tracking-wide text-neutral-400 mb-1">Modules</div>
				<ul className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
					{entries.map(([k, v]) => (
						<li key={k} className="flex items-center gap-1 text-neutral-300">
							{v ? <Check size={12} className="text-emerald-400" /> : <X size={12} className="text-neutral-600" />}
							<span className={!v ? "line-through opacity-50" : ""}>{k}</span>
						</li>
					))}
				</ul>
			</div>
			<div className="mt-auto flex flex-col gap-1 text-[11px] text-neutral-300">
				<div><span className="text-neutral-400">Support SLA:</span> {support.sla || "-"}</div>
				<div><span className="text-neutral-400">Priority:</span> {support.priority || "-"}</div>
				<div><span className="text-neutral-400">Channels:</span> {(support.channels || []).join(", ")}</div>
			</div>
			<div className="pt-2">
				<button
					className="w-full inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-500 via-rose-500 to-fuchsia-600 hover:from-orange-400 hover:via-rose-400 hover:to-fuchsia-500 transition-all shadow hover:shadow-lg active:scale-[0.97]"
				>
					{plan.price === 0 ? "Start Trial" : "Get Started"}
				</button>
			</div>
		</div>
	)
}

export default function SmartLandingPage() {
	const [view, setView] = useState("home")
	// Removed modal-based login; we route to /login instead
	const dispatch = useDispatch()
	const plans = useSelector(selectPlans)
	const status = useSelector(selectPlanStatus)
	const { error, cacheSource } = useSelector(selectPlansState)
	const plansRef = useRef(null)
	const navigate = useNavigate()
	// legacy util (localstorage) for fallback plus redux selectors for authoritative state
	const authedLegacy = isAuthenticated()
	const authed = useSelector(selectIsAuthenticated) || authedLegacy
	const basePath = useSelector(selectBasePath)

	// Fetch plans when user switches to plans view (lazy) OR on mount if already on plans
	useEffect(() => {
		if (view === 'plans' && status === 'idle') {
			dispatch(fetchPlans())
		}
	}, [view, status, dispatch])

	// Optional: prefetch after short delay while on home
	useEffect(() => {
		const prefetchTimer = setTimeout(() => {
			if (status === 'idle') dispatch(fetchPlans())
		}, 1500)
		return () => clearTimeout(prefetchTimer)
	}, [status, dispatch])

	const goPlans = () => {
		setView("plans")
		requestAnimationFrame(() => {
			plansRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
		})
	}

	// When authenticated and user clicks login, navigate to overview
		const handleLoginClick = () => {
			if (authed && basePath) {
				navigate(`${basePath}/overview`)
				return
			}
			if (authed) {
				navigate('/overview')
				return
			}
			navigate('/login')
		}

		// Removed modal close effect (no modal now)

	return (
		<div className="min-h-screen w-full relative overflow-x-hidden text-white" style={{
			background: "radial-gradient(circle at 20% 20%, rgba(67,56,202,0.25), transparent 60%), radial-gradient(circle at 80% 60%, rgba(190,24,93,0.25), transparent 55%), linear-gradient(135deg,#040617 0%,#101230 55%,#050509 100%)"
		}}>
			{/* subtle animated orbs */}
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<div className="absolute -top-32 -left-32 w-72 h-72 bg-fuchsia-600/20 blur-[120px] animate-pulse" />
				<div className="absolute top-1/3 -right-32 w-80 h-80 bg-cyan-500/10 blur-[100px] animate-pulse" />
			</div>

			{/* Sticky nav */}
			<div className="sticky top-0 z-30 backdrop-blur-md bg-black/30 border-b border-white/10">
				<nav className="max-w-7xl mx-auto flex items-center gap-4 px-6 h-14">
					<span className="text-sm font-semibold tracking-wide bg-gradient-to-r from-orange-400 to-fuchsia-500 bg-clip-text text-transparent">SMART HR</span>
					<div className="ml-auto flex items-center gap-2 relative">
						{[
							{ key: "home", label: "Home" },
							{ key: "plans", label: "Plans" }
						].map(tab => {
							const active = view === tab.key
							return (
								<button
									key={tab.key}
									onClick={() => setView(tab.key)}
									className={`relative px-4 py-1.5 text-xs font-medium rounded-full transition-colors text-neutral-300 hover:text-white ${active ? "text-white" : ""}`}
								>
									{tab.label}
									{active && <span className="absolute left-1/2 -translate-x-1/2 -bottom-0.5 w-10 h-[3px] rounded-full bg-gradient-to-r from-orange-500 via-rose-500 to-fuchsia-600 shadow-[0_0_8px_rgba(236,72,153,0.6)]" />}
								</button>
							)
						})}
						<button
							onClick={handleLoginClick}
							className="ml-2 inline-flex items-center justify-center px-4 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-orange-500 via-rose-500 to-fuchsia-600 text-white shadow hover:from-orange-400 hover:via-rose-400 hover:to-fuchsia-500 transition-all"
						>
							{authed ? 'Dashboard' : 'Login'}
						</button>
						<button
							onClick={() => navigate('/platform/login')}
							className="inline-flex items-center justify-center px-4 py-1.5 rounded-full text-xs font-medium border border-orange-500/50 text-orange-300 hover:bg-orange-500/10 transition-colors"
						>
							Platform Login
						</button>
					</div>
				</nav>
			</div>

			{/* HOME VIEW CONTENT WITH MULTI SECTIONS */}
			{view === "home" && (
				<>
					{/* Hero */}
					<section className="relative max-w-7xl mx-auto px-6 pt-20 pb-28 animate-fade-in">
						<div className="grid lg:grid-cols-2 gap-12 items-center">
							<div className="max-w-xl">
								<h1 className="text-4xl sm:text-5xl font-semibold leading-tight tracking-tight bg-gradient-to-r from-white via-neutral-200 to-neutral-400 text-transparent bg-clip-text">
									Smart HR Management for Modern Teams
								</h1>
								<p className="mt-5 text-neutral-300 text-sm sm:text-base leading-relaxed">
									Streamline workforce, payroll, performance & compliance in one secure, intelligent platform.
								</p>
								<div className="mt-8 flex flex-wrap gap-4">
									<button onClick={goPlans} className="relative inline-flex items-center justify-center px-7 py-3 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-orange-500 via-rose-500 to-fuchsia-600 shadow-lg shadow-fuchsia-900/30 hover:shadow-fuchsia-800/40 hover:from-orange-400 hover:via-rose-400 hover:to-fuchsia-500 transition-all active:scale-[0.97]">
										View Plans
									</button>
									<button onClick={() => setView("plans")} className="inline-flex items-center justify-center px-7 py-3 rounded-xl text-sm font-medium text-neutral-200 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 transition-colors">
										Explore Features
									</button>
								</div>
							</div>
							<div className="relative h-72 sm:h-80 lg:h-96">
								<div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-orange-500/30 via-fuchsia-600/20 to-cyan-500/20 blur-3xl" />
								<div className={`relative w-full h-full ${glass} flex items-center justify-center border border-white/10 rounded-3xl bg-white/5 backdrop-blur-xl`}>
									<div className="text-center px-6">
										<div className="text-sm uppercase tracking-wider text-orange-300 mb-2">Snapshot</div>
										<p className="text-neutral-200 text-sm leading-relaxed max-w-sm">
											Making people operations measurable, automated & delightful.
										</p>
									</div>
								</div>
							</div>
						</div>
					</section>

					{/* Problem / Solution */}
					<section className="relative max-w-6xl mx-auto px-6 pb-28">
						<div className="grid md:grid-cols-2 gap-10 items-start">
							<div className="space-y-6">
								<h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">Tired of scattered spreadsheets & manual processes?</h2>
								<ul className="space-y-3 text-sm text-neutral-300">
									<li className="flex gap-2"><span className="text-rose-400">•</span> Onboarding steps lost in email threads</li>
									<li className="flex gap-2"><span className="text-rose-400">•</span> Attendance & leave records inconsistent</li>
									<li className="flex gap-2"><span className="text-rose-400">•</span> Payroll export chaos every month</li>
									<li className="flex gap-2"><span className="text-rose-400">•</span> No real-time view of workforce metrics</li>
								</ul>
							</div>
							<div className={`${glass} p-6 space-y-4 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]`}>
								<h3 className="text-xl font-semibold">We solve this with one platform</h3>
								<p className="text-sm text-neutral-300 leading-relaxed">Centralize employee data, automate routine approvals, surface insights instantly & stay compliant by design.</p>
								<div className="flex flex-wrap gap-2 pt-2">
									<span className="text-[11px] px-3 py-1 rounded-full bg-orange-500/15 text-orange-300 border border-orange-500/30">Faster Onboarding</span>
									<span className="text-[11px] px-3 py-1 rounded-full bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/30">Visibility</span>
									<span className="text-[11px] px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">Decision Intelligence</span>
								</div>
								<button onClick={goPlans} className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-white bg-gradient-to-r from-orange-500 via-rose-500 to-fuchsia-600 px-5 py-2 rounded-lg hover:from-orange-400 hover:via-rose-400 hover:to-fuchsia-500 transition-all shadow">
									Get Started <ArrowRight size={14} />
								</button>
							</div>
						</div>
					</section>

					{/* Key Features */}
					<section className="relative max-w-7xl mx-auto px-6 pb-28">
						<h2 className="text-3xl font-semibold tracking-tight mb-10 bg-gradient-to-r from-orange-400 via-rose-400 to-fuchsia-400 bg-clip-text text-transparent">Key Features</h2>
						<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
							{featureList.map((f, i) => (
								<div key={f.title} className={`${glass} p-5 flex flex-col gap-3 animate-scale-in`} style={{ animationDelay: `${i * 70}ms` }}>
									<span className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500/30 to-fuchsia-600/30 grid place-items-center text-orange-300"><f.icon size={18} /></span>
									<h3 className="text-sm font-medium">{f.title}</h3>
									<p className="text-xs text-neutral-300 leading-relaxed">{f.desc}</p>
								</div>
							))}
						</div>
					</section>

					{/* How it Works */}
					<section className="relative max-w-6xl mx-auto px-6 pb-28">
						<h2 className="text-3xl font-semibold tracking-tight mb-10">How It Works</h2>
						<div className="grid md:grid-cols-4 gap-6">
							{howItWorks.map((s, i) => (
								<div key={s.step} className={`${glass} p-5 flex flex-col gap-2 animate-scale-in`} style={{ animationDelay: `${i * 90}ms` }}>
									<div className="text-2xl font-semibold bg-gradient-to-r from-orange-400 to-fuchsia-500 bg-clip-text text-transparent">{s.step}</div>
									<h3 className="text-sm font-medium">{s.title}</h3>
									<p className="text-xs text-neutral-300 leading-relaxed">{s.text}</p>
								</div>
							))}
						</div>
					</section>

					{/* Testimonials */}
					<section className="relative max-w-7xl mx-auto px-6 pb-28">
						<h2 className="text-3xl font-semibold tracking-tight mb-10">Loved by modern HR & Ops teams</h2>
						<div className="grid md:grid-cols-3 gap-6">
							{testimonials.map((t, i) => (
								<div key={t.name} className={`${glass} p-5 flex flex-col gap-4 animate-scale-in`} style={{ animationDelay: `${i * 80}ms` }}>
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-fuchsia-600 grid place-items-center text-xs font-semibold">{t.avatar}</div>
										<div className="text-xs leading-tight">
											<div className="font-medium text-white">{t.name}</div>
											<div className="text-neutral-400">{t.role} • {t.company}</div>
										</div>
									</div>
									<p className="text-[11px] leading-relaxed text-neutral-300">“{t.quote}”</p>
								</div>
							))}
						</div>
					</section>

					{/* Request Demo */}
					<section className="relative max-w-4xl mx-auto px-6 pb-28">
						<div className={`${glass} p-8 md:p-10 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.6)]`}> 
							<h2 className="text-3xl font-semibold tracking-tight mb-4">Request a Demo</h2>
							<p className="text-sm text-neutral-300 mb-6 max-w-xl">See how Smart HR can streamline your people operations. Fill out the form & our team will reach out within 1 business day.</p>
							<form onSubmit={(e)=>{e.preventDefault(); alert('Demo request submitted')}} className="grid md:grid-cols-2 gap-4 text-sm">
								<label className="flex flex-col gap-1 col-span-2 md:col-span-1">
									<span className="text-neutral-400 text-xs">Name</span>
									<input required className="bg-white/5 border border-white/20 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-fuchsia-500/40" placeholder="Jane Doe" />
								</label>
								<label className="flex flex-col gap-1 col-span-2 md:col-span-1">
									<span className="text-neutral-400 text-xs">Work Email</span>
									<input required type="email" className="bg-white/5 border border-white/20 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-fuchsia-500/40" placeholder="you@company.com" />
								</label>
								<label className="flex flex-col gap-1 col-span-2 md:col-span-1">
									<span className="text-neutral-400 text-xs">Company</span>
									<input className="bg-white/5 border border-white/20 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-fuchsia-500/40" placeholder="Acme Inc" />
								</label>
								<label className="flex flex-col gap-1 col-span-2 md:col-span-1">
									<span className="text-neutral-400 text-xs">Employees</span>
									<select className="bg-white/5 border border-white/20 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-fuchsia-500/40">
										<option>1-10</option>
										<option>11-50</option>
										<option>51-200</option>
										<option>201-500</option>
										<option>500+</option>
									</select>
								</label>
								<label className="flex flex-col gap-1 col-span-2">
									<span className="text-neutral-400 text-xs">Message</span>
									<textarea rows={3} className="bg-white/5 border border-white/20 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-fuchsia-500/40 resize-none" placeholder="We need better onboarding + attendance..." />
								</label>
								<div className="col-span-2 pt-2">
									<button className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-orange-500 via-rose-500 to-fuchsia-600 hover:from-orange-400 hover:via-rose-400 hover:to-fuchsia-500 transition-all shadow active:scale-[0.97]">
										Submit Request <ArrowRight size={14} />
									</button>
								</div>
							</form>
						</div>
					</section>

					{/* FAQ */}
					<section className="relative max-w-5xl mx-auto px-6 pb-28">
						<h2 className="text-3xl font-semibold tracking-tight mb-10">Frequently Asked Questions</h2>
						<div className="space-y-4">
							{faqs.map((f, i) => (
								<details key={f.q} className={`${glass} p-4 group`}>
									<summary className="cursor-pointer text-sm font-medium flex items-center justify-between marker:hidden list-none">
										<span>{f.q}</span>
										<span className="text-xs text-neutral-400 group-open:rotate-90 transition-transform"><ArrowRight size={14} /></span>
									</summary>
									<p className="mt-2 text-xs text-neutral-300 leading-relaxed">{f.a}</p>
								</details>
							))}
						</div>
					</section>
				</>
			)}

			{/* Plans */}
			<section ref={plansRef} className={`relative max-w-7xl mx-auto px-6 pb-28 ${view === "plans" ? "animate-fade-in" : ""}`}>
				{view === "plans" && (
					<>
						<div className="mb-10 pt-16">
							<h2 className="text-3xl sm:text-4xl font-semibold tracking-tight bg-gradient-to-r from-orange-400 via-rose-400 to-fuchsia-400 bg-clip-text text-transparent">Choose your plan</h2>
							<p className="mt-3 text-neutral-300 text-sm max-w-2xl">Flexible pricing scales with your team. Upgrade anytime without losing data.</p>
						</div>
						<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 min-h-[200px]">
							{status === 'loading' && plans.length === 0 && Array.from({ length: 5 }).map((_, i) => (
								<div key={i} className={`${glass} p-5 animate-pulse flex flex-col gap-4`}> 
									<div className="h-4 w-24 bg-white/10 rounded" />
									<div className="h-3 w-40 bg-white/10 rounded" />
									<div className="mt-auto h-8 w-full bg-white/10 rounded" />
								</div>
							))}
							{status === 'failed' && (
								<div className="col-span-full text-sm text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-xl p-4">
									Failed to load plans{error ? `: ${error}` : ''}
								</div>
							)}
							{status === 'succeeded' && plans.length === 0 && (
								<div className="col-span-full text-sm text-neutral-300">No plans available.</div>
							)}
							{plans.map((p, i) => (
								<PlanCard key={p.id} plan={p} delay={i * 80} />
							))}
						</div>
						{status === 'succeeded' && cacheSource === 'cache' && (
							<p className="mt-4 text-[10px] text-neutral-500">Loaded from cache.</p>
						)}
					</>
				)}
			</section>

			{/* Footer */}
			<footer className="relative z-10 border-t border-white/10 py-16 text-[12px] text-neutral-400">
				<div className="max-w-7xl mx-auto px-6 grid md:grid-cols-5 gap-10">
					<div className="space-y-3">
						<div className="flex items-center gap-2 text-white text-sm font-semibold tracking-wide"><Building2 size={16} className="text-orange-400" /> Smart HR</div>
						<p className="text-xs leading-relaxed text-neutral-400 max-w-xs">Unified HR OS for scaling companies. Automate workflows & gain people clarity.</p>
						<div className="flex items-center gap-3 pt-1">
							<button type="button" aria-label="GitHub" className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 grid place-items-center text-neutral-300"><Github size={14} /></button>
							<button type="button" aria-label="Twitter" className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 grid place-items-center text-neutral-300"><Twitter size={14} /></button>
							<button type="button" aria-label="LinkedIn" className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 grid place-items-center text-neutral-300"><Linkedin size={14} /></button>
							<button type="button" aria-label="Website" className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 grid place-items-center text-neutral-300"><Globe size={14} /></button>
						</div>
					</div>
					<div className="grid grid-cols-2 md:grid-cols-4 md:col-span-4 gap-8 md:gap-12 text-xs">
						{Object.entries(footerLinks).map(([cat, links]) => (
							<div key={cat} className="space-y-3">
								<div className="font-semibold text-neutral-200 capitalize">{cat}</div>
								<ul className="space-y-1">
									{links.map(l => <li key={l}><button type="button" className="hover:text-white transition-colors text-left">{l}</button></li>)}
								</ul>
							</div>
						))}
					</div>
				</div>
				<div className="max-w-7xl mx-auto px-6 mt-10 pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
					<p className="text-[11px]">© {new Date().getFullYear()} Smart HR Platform. All rights reserved.</p>
					<p className="text-[11px] text-neutral-500">Made for people-first teams.</p>
				</div>
			</footer>

		{/* Auth Modal */}
		{/* Inline auth modal removed; /login handles auth form rendering */}
		</div>
	)
}
