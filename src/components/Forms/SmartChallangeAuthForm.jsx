import React, { useMemo, useState, useEffect } from "react"
import { Mail, Lock, Building2, ChevronRight } from "lucide-react"
import { useDispatch, useSelector } from 'react-redux'
import { fetchLoginChallenge, selectAuthChallengeState, resetChallenge } from '../../Redux/Public/authChallengeSlice'
import { loginWithPassword, exchangeToken, selectBasePath, selectIsAuthenticated, selectAuthRoutes, selectAuthUser } from '../../Redux/Public/authSlice'
import { useNavigate, useLocation } from 'react-router-dom'

function isEmail(v) {
	return /.+@.+\..+/.test(v || "")
}

function titleCase(s) {
	return (s || "").charAt(0).toUpperCase() + (s || "").slice(1).toLowerCase()
}

function deriveCompanyFromEmail(email) {
	const m = String(email || "").split("@")[1]
	if (!m) return ""
	const parts = m.split(".").filter(Boolean)
	if (parts.length >= 2) return titleCase(parts[parts.length - 2])
	if (parts.length === 1) return titleCase(parts[0])
	return ""
}

export default function SmartChallangeAuthForm({
	className = "",
	initialEmail = "",
	company: companyProp,
	onSubmit, // ({ email, password, remember })
	onEmailEntered, // (email)
	passwordOnly = false,
}) {
	const [step, setStep] = useState(passwordOnly ? 1 : 0) // 0: Email, 1: Password
	const [email, setEmail] = useState(initialEmail)
	const [password, setPassword] = useState("")
	const [remember, setRemember] = useState(true)
	const dispatch = useDispatch()
	const challenge = useSelector(selectAuthChallengeState)

	const emailValid = isEmail(email)
	const derivedCompany = useMemo(() => companyProp || deriveCompanyFromEmail(email), [companyProp, email])

	const canGoPassword = passwordOnly || (challenge.status === 'succeeded' && !!challenge.loginUrl)
	const navigate = useNavigate()
	const location = useLocation()

	const goNext = () => {
		if (!emailValid || challenge.status === 'loading') return
		// eslint-disable-next-line no-console
		console.debug('[AuthForm] requesting challenge', { email })
		dispatch(fetchLoginChallenge({ email }))
		onEmailEntered?.(email)
	}

	// Navigate to external loginUrl path (strip origin) then show password step
	useEffect(() => {
		if (!passwordOnly && challenge.status === 'succeeded' && challenge.loginUrl) {
			try {
				const url = new URL(challenge.loginUrl)
				const pathWithQuery = url.pathname + url.search
				// eslint-disable-next-line no-console
				console.debug('[AuthForm] challenge succeeded navigate to loginUrl path', { loginUrl: challenge.loginUrl, derived: pathWithQuery })
				if (location.pathname + location.search !== pathWithQuery) {
					navigate(pathWithQuery, { replace: true })
				}
				setStep(1)
			} catch (e) {
				// eslint-disable-next-line no-console
				console.warn('[AuthForm] invalid challenge loginUrl', e)
			}
		}
	}, [challenge.status, challenge.loginUrl, passwordOnly, navigate, location.pathname, location.search])

	// Reset challenge if email changes while on step 0 (not in passwordOnly mode)
	useEffect(() => {
		if (!passwordOnly && step === 0) dispatch(resetChallenge())
	}, [email, step, dispatch, passwordOnly])

	const basePath = useSelector(selectBasePath)
	const authed = useSelector(selectIsAuthenticated)
	const routes = useSelector(selectAuthRoutes)
	const authUser = useSelector(selectAuthUser)

	// Navigate after authentication when basePath becomes available
	useEffect(() => {
		if (authed) {
			let target = ''
			if (basePath) {
				target = `${basePath}/overview`
			} else if ((authUser?.role === 'SUPER_ADMIN' || authUser?.role === 'IT') && routes?.length) {
				// derive from first route url
				try {
					const first = routes[0]
					const p = new URL(first.url || first.path, window.location.origin).pathname
					// trim any trailing slash
					target = p.replace(/\/$/, '')
				} catch {
					// fallback overview
					target = '/platform/overview'
				}
			}
			if (target) {
				// eslint-disable-next-line no-console
				console.debug('[AuthForm] authenticated navigate', { target, basePath, role: authUser?.role })
				navigate(target, { replace: true })
			}
		}
	}, [authed, basePath, routes, authUser, navigate])

	const submit = async (e) => {
		e.preventDefault()
		if (challenge.loginChallenge) {
			// eslint-disable-next-line no-console
			console.debug('[AuthForm] submitting password', { email })
			const result = await dispatch(loginWithPassword({
				login_challenge: challenge.loginChallenge,
				email,
				password,
				remember_me: remember
			}))
			if (loginWithPassword.fulfilled.match(result)) {
				const code = result.payload.authorizationCode
				// eslint-disable-next-line no-console
				console.debug('[AuthForm] loginWithPassword fulfilled', { code, redirectUrl: result.payload.redirectUrl })
				if (code) {
					await dispatch(exchangeToken({ code }))
					// eslint-disable-next-line no-console
					console.debug('[AuthForm] exchangeToken dispatched', { code })
					// Navigation handled by auth state effect
					return
				}
			}
			return
		}
		onSubmit?.({ email, password, remember })
	}

	// Guard: if passwordOnly but we lack an email context, send back to /login
	useEffect(() => {
		if (passwordOnly && !email) {
			navigate('/login', { replace: true })
		}
	}, [passwordOnly, email, navigate])

	return (
		<section className={`auth-card border border-orange-500/40 rounded-2xl p-5 shadow-sm ${className}`}>
			<div className="auth-stable-height flex flex-col md:flex-row md:items-stretch gap-8">
				{/* Form Column */}
				<div className="flex-1">
			{/* Switcher */}
		{/* hjnbhjnbh */}
			<div className="flex items-center justify-between mb-4">
				<div className="inline-flex p-0.5 bg-white border border-orange-500/40 rounded-xl">
					<button
						className={`px-3 py-1.5 text-xs rounded-[10px] transition-all ${
							step === 0
								? "bg-orange-500/15 text-orange-600 border border-orange-500/60"
								: "text-neutral-500 hover:text-orange-600"
						}`}
						onClick={() => !passwordOnly && setStep(0)}
					>
						Email
					</button>
					<button
						disabled={!canGoPassword}
						className={`px-3 py-1.5 text-xs rounded-[10px] transition-all ${
							step === 1
								? "bg-orange-500/15 text-orange-600 border border-orange-500/60"
								: canGoPassword ? "text-neutral-500 hover:text-orange-600" : "text-neutral-400 cursor-not-allowed"
						}`}
						onClick={() => canGoPassword && setStep(1)}
					>
						Password
					</button>
				</div>
			</div>

			{/* Step Body */}
			{step === 0 && !passwordOnly ? (
				<div className="space-y-3 animate-slide-up">
					<label className="flex flex-col gap-1">
						<span className="text-xs text-neutral-400">Work email</span>
						<div className="relative">
							<Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500/70" />
							<input
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="w-full bg-white border border-neutral-300 rounded-xl pl-9 pr-3 py-2 text-neutral-900 placeholder:text-neutral-400 outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/40"
								placeholder="you@company.com"
							/>
						</div>
					</label>

					<div className="pt-1">
						<button
							onClick={goNext}
							disabled={!emailValid || challenge.status === 'loading'}
							className={`w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl border ${
								emailValid && challenge.status !== 'loading'
									? "border-orange-600 bg-orange-500/90 hover:bg-orange-500 text-white shadow-sm"
									: "bg-neutral-200 text-neutral-400 border-neutral-300 opacity-60 cursor-not-allowed"
							}`}
						>
							{challenge.status === 'loading' ? 'Processing...' : 'Continue'} <ChevronRight size={14} />
						</button>
						{challenge.status === 'failed' && (
							<div className="text-[11px] text-rose-500 pt-1">{challenge.error || 'Access denied'}</div>
						)}
						{challenge.status === 'succeeded' && (
							<div className="text-[11px] text-emerald-500 pt-1">Challenge OK. Proceed to password.</div>
						)}
					</div>
				</div>
			) : (
				// Password step
				<form onSubmit={submit} className="space-y-3 animate-slide-up">
					{/* Context header */}
					<div className="rounded-xl border border-orange-200 bg-white/70 backdrop-blur px-4 py-3">
						<div className="flex items-center justify-between text-sm text-neutral-600">
							<div className="flex items-center gap-2">
								<span className="auth-company-badge">
									<Building2 size={14} className="text-orange-700" />
									{(challenge.company?.name) || derivedCompany || "Your Company"}
								</span>
							</div>
							<button type="button" className="text-xs text-orange-600 hover:text-orange-500" onClick={() => passwordOnly ? navigate('/login') : setStep(0)}>
								Change email
							</button>
						</div>
						<div className="text-[11px] tracking-wide text-neutral-400 mt-1">{email}</div>
					</div>

					<label className="flex flex-col gap-1">
						<span className="text-xs text-neutral-400">Password</span>
						<div className="relative">
							<Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500/70" />
							<input
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="w-full bg-white border border-neutral-300 rounded-xl pl-9 pr-3 py-2 text-neutral-900 placeholder:text-neutral-400 outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/40"
								placeholder="••••••••"
								required
							/>
						</div>
					</label>

					<label className="flex items-center gap-2 text-xs text-neutral-400">
						<input type="checkbox" className="accent-orange-500" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
						Remember me
					</label>

					<div className="pt-1">
						<button
							type="submit"
							className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-orange-600 bg-orange-500/90 hover:bg-orange-500 text-white shadow-sm"
						>
							Sign in
						</button>
					</div>
				</form>
			)}
				</div>

				{/* Illustration Column */}
				<div className="hidden md:flex md:w-1/2 lg:w-[45%] items-center justify-center relative">
					<img
						src={process.env.PUBLIC_URL + '/Asset/table-w-422_h-402.svg'}
						alt="Illustration"
						className="w-full h-auto max-w-sm drop-shadow-lg select-none pointer-events-none"
						loading="lazy"
					/>
					{/* Decorative gradient / optional */}
					<div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-orange-500/5 via-transparent to-transparent pointer-events-none" />
				</div>
			</div>
		</section>
	)
}

