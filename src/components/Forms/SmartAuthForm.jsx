import React, { useState } from "react";
import { Mail, Lock, User, ChevronRight } from "lucide-react";

export default function SmartAuthForm({
  className = "",
  onSignIn,
  onSignUp,
  onResetPassword,
}) {
  const [mode, setMode] = useState("signin"); // 'signin' | 'signup'
  const [showReset, setShowReset] = useState(false);

  const [signin, setSignin] = useState({
    email: "",
    password: "",
    remember: true,
  });
  const [signup, setSignup] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [resetEmail, setResetEmail] = useState("");

  const handleSignIn = (e) => {
    e.preventDefault();
    onSignIn?.(signin);
  };
  const handleSignUp = (e) => {
    e.preventDefault();
    onSignUp?.(signup);
  };
  const handleReset = (e) => {
    e.preventDefault();
    onResetPassword?.(resetEmail);
  };

  return (
    <section
      className={`bg-transparent border border-orange-500/50 rounded-2xl p-4 ${className}`}
    >
      {/* Switcher */}
      <div className="flex items-center justify-between mb-4">
        <div className="inline-flex p-0.5 bg-neutral-800 border border-neutral-700 rounded-xl">
          <button
            className={`px-3 py-1.5 text-xs rounded-[10px] transition-all ${
              mode === "signin"
                ? "bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/60"
                : "text-neutral-500 dark:text-neutral-400 hover:text-orange-600 dark:hover:text-orange-400"
            }`}
            onClick={() => {
              setMode("signin");
              setShowReset(false);
            }}
          >
            Sign In
          </button>
          <button
            className={`px-3 py-1.5 text-xs rounded-[10px] transition-all ${
              mode === "signup"
                ? "bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/60"
                : "text-neutral-500 dark:text-neutral-400 hover:text-orange-600 dark:hover:text-orange-400"
            }`}
            onClick={() => {
              setMode("signup");
              setShowReset(false);
            }}
          >
            Sign Up
          </button>
        </div>
      </div>

      {/* Body */}
      {mode === "signin" ? (
        <form onSubmit={handleSignIn} className="space-y-3 animate-slide-up">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-neutral-400">Email</span>
            <div className="relative">
              <Mail
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500/70 dark:text-orange-400/70"
              />
              <input
                type="email"
                value={signin.email}
                onChange={(e) =>
                  setSignin({ ...signin, email: e.target.value })
                }
                className="w-full bg-neutral-800/80 border border-neutral-700 rounded-xl pl-9 pr-3 py-2 text-neutral-200 placeholder-neutral-500 outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40"
                placeholder="you@example.com"
                required
              />
            </div>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs text-neutral-400">Password</span>
            <div className="relative">
              <Lock
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500/70 dark:text-orange-400/70"
              />
              <input
                type="password"
                value={signin.password}
                onChange={(e) =>
                  setSignin({ ...signin, password: e.target.value })
                }
                className="w-full bg-neutral-800/80 border border-neutral-700 rounded-xl pl-9 pr-3 py-2 text-neutral-200 placeholder-neutral-500 outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40"
                placeholder="••••••••"
                required
              />
            </div>
          </label>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs text-neutral-400">
              <input
                type="checkbox"
                checked={signin.remember}
                onChange={(e) =>
                  setSignin({ ...signin, remember: e.target.checked })
                }
                className="accent-cyan-600"
              />
              Remember me
            </label>
            <button
              type="button"
              className="text-xs text-cyan-400 hover:text-cyan-300"
              onClick={() => setShowReset((s) => !s)}
            >
              Forgot password?
            </button>
          </div>

          {showReset && (
            <div className="rounded-xl border border-orange-500/40 bg-transparent p-3 animate-fade-in">
              <div className="text-xs text-neutral-400 mb-2">
                Reset password
              </div>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Mail
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500/70 dark:text-orange-400/70"
                  />
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full bg-neutral-800/80 border border-neutral-700 rounded-xl pl-9 pr-3 py-2 text-neutral-200 placeholder-neutral-500 outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40"
                    placeholder="you@example.com"
                  />
                </div>
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border bg-neutral-800 text-neutral-300 hover:text-white transition-colors border-neutral-700"
                >
                  Send <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          <div className="pt-1">
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-orange-600 bg-orange-500/90 hover:bg-orange-500 text-white shadow-sm"
            >
              Sign In
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSignUp} className="space-y-3 animate-slide-up">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-neutral-400">Full name</span>
            <div className="relative">
              <User
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
              />
              <input
                value={signup.name}
                onChange={(e) => setSignup({ ...signup, name: e.target.value })}
                className="w-full bg-neutral-800/80 border border-neutral-700 rounded-xl pl-9 pr-3 py-2 text-neutral-200 placeholder-neutral-500 outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40"
                placeholder="Alice Johnson"
                required
              />
            </div>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-neutral-400">Email</span>
            <div className="relative">
              <Mail
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500/70 dark:text-orange-400/70"
              />
              <input
                type="email"
                value={signup.email}
                onChange={(e) =>
                  setSignup({ ...signup, email: e.target.value })
                }
                className="w-full bg-neutral-800/80 border border-neutral-700 rounded-xl pl-9 pr-3 py-2 text-neutral-200 placeholder-neutral-500 outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40"
                placeholder="you@example.com"
                required
              />
            </div>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-neutral-400">Password</span>
            <div className="relative">
              <Lock
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500/70 dark:text-orange-400/70"
              />
              <input
                type="password"
                value={signup.password}
                onChange={(e) =>
                  setSignup({ ...signup, password: e.target.value })
                }
                className="w-full bg-neutral-800/80 border border-neutral-700 rounded-xl pl-9 pr-3 py-2 text-neutral-200 placeholder-neutral-500 outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40"
                placeholder="••••••••"
                required
              />
            </div>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-neutral-400">Confirm password</span>
            <div className="relative">
              <Lock
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500/70 dark:text-orange-400/70"
              />
              <input
                type="password"
                value={signup.confirm}
                onChange={(e) =>
                  setSignup({ ...signup, confirm: e.target.value })
                }
                className="w-full bg-neutral-800/80 border border-neutral-700 rounded-xl pl-9 pr-3 py-2 text-neutral-200 placeholder-neutral-500 outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40"
                placeholder="••••••••"
                required
              />
            </div>
          </label>

          <div className="pt-1">
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-orange-600 bg-orange-500/90 hover:bg-orange-500 text-white shadow-sm"
            >
              Create account
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
