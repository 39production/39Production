import {
    FormEvent,
    useState,
} from 'react'
import {
    Link,
    useLocation,
    useNavigate,
} from 'react-router-dom'
import {
    Eye,
    EyeOff,
    LockKeyhole,
    Loader2,
    Mail,
} from 'lucide-react'
import { Logo } from '@/components/common/Logo'
import { login } from '@/lib/auth'

export function LoginPage() {
    const navigate = useNavigate()
    const location = useLocation()

    const [email, setEmail] =
        useState('')

    const [password, setPassword] =
        useState('')

    const [showPassword, setShowPassword] =
        useState(false)

    const [loading, setLoading] =
        useState(false)

    const [error, setError] =
        useState('')

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault()

        setError('')

        const trimmedEmail =
            email.trim().toLowerCase()

        if (!trimmedEmail || !password) {
            setError(
                'Please enter your email and password.',
            )
            return
        }

        if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                trimmedEmail,
            )
        ) {
            setError(
                'Please enter a valid email address.',
            )
            return
        }

        try {
            setLoading(true)

            await login(
                trimmedEmail,
                password,
            )

            const state = location.state as
                | {
                    from?: string
                }
                | null

            const destination =
                state?.from &&
                    state.from.startsWith('/admin')
                    ? state.from
                    : '/admin/dashboard'

            navigate(destination, {
                replace: true,
            })
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'Failed to sign in.',
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative min-h-screen overflow-hidden bg-zinc-100">
            {/* ======================================================
          LIGHT OUTER ENVIRONMENT
      ======================================================= */}

            <div className="pointer-events-none absolute inset-0">
                {/* Soft purple glow */}
                <div className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-purple-200/60 blur-[120px]" />

                {/* Soft pink glow */}
                <div className="absolute -bottom-40 -right-40 h-[520px] w-[520px] rounded-full bg-pink-200/50 blur-[120px]" />

                {/* Central transition glow */}
                <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-200/20 blur-[130px]" />
            </div>

            {/* ======================================================
          CYBER GRID — VERY SUBTLE
      ======================================================= */}

            <div
                className="pointer-events-none absolute inset-0 opacity-[0.22]"
                style={{
                    backgroundImage:
                        'linear-gradient(to right, rgba(124,58,237,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(124,58,237,0.06) 1px, transparent 1px)',
                    backgroundSize: '56px 56px',
                    maskImage:
                        'radial-gradient(circle at center, black 0%, transparent 72%)',
                    WebkitMaskImage:
                        'radial-gradient(circle at center, black 0%, transparent 72%)',
                }}
            />

            <div className="relative flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
                <div className="w-full max-w-6xl">
                    {/* ==================================================
              MAIN SHELL
          =================================================== */}

                    <div className="relative overflow-hidden rounded-[2rem] border border-zinc-200 bg-white/90 shadow-[0_30px_90px_-30px_rgba(0,0,0,0.25)] backdrop-blur-xl">
                        {/* Transition glow between light and dark */}
                        <div className="pointer-events-none absolute left-[42%] top-1/2 hidden h-[700px] w-[180px] -translate-y-1/2 rounded-full bg-purple-500/15 blur-[80px] lg:block" />

                        <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
                            {/* =================================================
                  LEFT — LIGHT / BRAND
              ================================================== */}

                            <section className="relative overflow-hidden bg-white p-8 sm:p-10 lg:min-h-[700px] lg:p-12">
                                {/* Light decorative glow */}
                                <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-purple-100/80 blur-3xl" />

                                <div className="pointer-events-none absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-pink-100/70 blur-3xl" />

                                {/* Decorative diagonal shape */}
                                <div className="pointer-events-none absolute right-[-120px] top-1/3 h-[420px] w-[420px] rotate-12 rounded-[5rem] border border-purple-100/70" />

                                <div className="relative z-10 flex h-full flex-col">
                                    {/* LOGO */}
                                    <div>
                                        <Logo
                                            size="lg"
                                            showSubtext
                                        />
                                    </div>

                                    {/* MAIN BRAND COPY */}
                                    <div className="my-auto max-w-xl py-16">
                                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-purple-600">
                                            Creative Technology Studio
                                        </p>

                                        <h1 className="mt-5 text-4xl font-bold leading-[1.05] tracking-tight text-zinc-950 sm:text-5xl xl:text-6xl">
                                            Welcome to the
                                            <span className="block bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                                                creative side.
                                            </span>
                                        </h1>

                                        <p className="mt-6 max-w-lg text-base leading-8 text-zinc-600">
                                            Manage the work behind 39Production —
                                            from digital products and services to
                                            entertainment projects, orders, and
                                            internal operations.
                                        </p>

                                        {/* Capability chips */}
                                        <div className="mt-8 flex flex-wrap gap-2">
                                            <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-600">
                                                Technology
                                            </span>

                                            <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-600">
                                                Design
                                            </span>

                                            <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-600">
                                                Entertainment
                                            </span>

                                            <span className="rounded-full border border-purple-100 bg-purple-50 px-3 py-1.5 text-xs font-medium text-purple-700">
                                                39Production
                                            </span>
                                        </div>
                                    </div>

                                    {/* BOTTOM */}
                                    <div className="border-t border-zinc-100 pt-5">
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                            <p className="text-xs leading-5 text-zinc-400">
                                                Creating Digital Works. Producing Stories.
                                                Sharing Gratitude.
                                            </p>

                                            <p className="text-xs font-medium text-zinc-500">
                                                Internal Workspace
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* =================================================
                  RIGHT — DARK CYBER LOGIN
              ================================================== */}

                            <section className="relative overflow-hidden bg-[#09090B] text-white lg:min-h-[700px]">
                                {/* Cyber ambient */}
                                <div className="pointer-events-none absolute inset-0">
                                    {/* Purple glow */}
                                    <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-purple-600/20 blur-[90px]" />

                                    {/* Pink glow */}
                                    <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-pink-600/12 blur-[90px]" />

                                    {/* Center glow */}
                                    <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/8 blur-[100px]" />

                                    {/* Grid */}
                                    <div
                                        className="absolute inset-0 opacity-[0.18]"
                                        style={{
                                            backgroundImage:
                                                'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
                                            backgroundSize: '48px 48px',
                                            maskImage:
                                                'linear-gradient(to bottom, black, transparent 85%)',
                                            WebkitMaskImage:
                                                'linear-gradient(to bottom, black, transparent 85%)',
                                        }}
                                    />

                                    {/* Large ring */}
                                    <div className="absolute right-[-150px] top-[-150px] h-[420px] w-[420px] rounded-full border border-purple-400/10" />

                                    <div className="absolute right-[-100px] top-[-100px] h-[320px] w-[320px] rounded-full border border-pink-400/10" />

                                    {/* Vertical light streak */}
                                    <div className="absolute right-24 top-0 h-full w-px bg-gradient-to-b from-transparent via-purple-500/20 to-transparent" />
                                </div>

                                <div className="relative z-10 flex h-full flex-col justify-center p-7 sm:p-10 lg:p-12">
                                    <div className="mx-auto w-full max-w-md">
                                        {/* TOP LABEL */}
                                        <div className="mb-8 flex items-center justify-between">
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-purple-300">
                                                    Admin Access
                                                </p>

                                                <p className="mt-1 text-[11px] text-zinc-600">
                                                    39Production Management System
                                                </p>
                                            </div>

                                            <div className="hidden h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(74,222,128,0.8)] sm:block" />
                                        </div>

                                        {/* LOGIN CARD */}
                                        <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
                                            <div className="mb-8">
                                                <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-600">
                                                    Secure Sign In
                                                </p>

                                                <h2 className="mt-3 text-3xl font-bold tracking-tight text-white">
                                                    Welcome Back
                                                </h2>

                                                <p className="mt-2 text-sm leading-6 text-zinc-500">
                                                    Sign in to access your 39Production
                                                    admin workspace.
                                                </p>
                                            </div>

                                            <form
                                                onSubmit={handleSubmit}
                                                className="space-y-5"
                                            >
                                                {/* EMAIL */}
                                                <div>
                                                    <label
                                                        htmlFor="email"
                                                        className="mb-2 block text-sm font-medium text-zinc-300"
                                                    >
                                                        Email
                                                    </label>

                                                    <div className="group relative">
                                                        <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600 transition-colors group-focus-within:text-purple-400" />

                                                        <input
                                                            id="email"
                                                            type="email"
                                                            autoComplete="email"
                                                            value={email}
                                                            onChange={(event) =>
                                                                setEmail(
                                                                    event.target.value,
                                                                )
                                                            }
                                                            placeholder="admin@example.com"
                                                            disabled={loading}
                                                            className="w-full rounded-xl border border-white/10 bg-black/30 py-3.5 pl-10 pr-4 text-sm text-white outline-none transition-all placeholder:text-zinc-700 focus:border-purple-500/60 focus:bg-black/40 focus:ring-2 focus:ring-purple-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                                                        />
                                                    </div>
                                                </div>

                                                {/* PASSWORD */}
                                                <div>
                                                    <label
                                                        htmlFor="password"
                                                        className="mb-2 block text-sm font-medium text-zinc-300"
                                                    >
                                                        Password
                                                    </label>

                                                    <div className="group relative">
                                                        <LockKeyhole className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600 transition-colors group-focus-within:text-purple-400" />

                                                        <input
                                                            id="password"
                                                            type={
                                                                showPassword
                                                                    ? 'text'
                                                                    : 'password'
                                                            }
                                                            autoComplete="current-password"
                                                            value={password}
                                                            onChange={(event) =>
                                                                setPassword(
                                                                    event.target.value,
                                                                )
                                                            }
                                                            placeholder="Enter your password"
                                                            disabled={loading}
                                                            className="w-full rounded-xl border border-white/10 bg-black/30 py-3.5 pl-10 pr-11 text-sm text-white outline-none transition-all placeholder:text-zinc-700 focus:border-purple-500/60 focus:bg-black/40 focus:ring-2 focus:ring-purple-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                                                        />

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setShowPassword(
                                                                    (value) => !value,
                                                                )
                                                            }
                                                            disabled={loading}
                                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-600 transition-colors hover:text-zinc-300 disabled:opacity-50"
                                                            aria-label={
                                                                showPassword
                                                                    ? 'Hide password'
                                                                    : 'Show password'
                                                            }
                                                        >
                                                            {showPassword ? (
                                                                <EyeOff className="h-4 w-4" />
                                                            ) : (
                                                                <Eye className="h-4 w-4" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* ERROR */}
                                                {error && (
                                                    <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-300">
                                                        {error}
                                                    </div>
                                                )}

                                                {/* SIGN IN */}
                                                <button
                                                    type="submit"
                                                    disabled={loading}
                                                    className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-purple-900/20 transition-all hover:-translate-y-0.5 hover:from-violet-500 hover:to-purple-500 hover:shadow-purple-500/20 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                                                >
                                                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                                                    <span className="relative flex items-center gap-2">
                                                        {loading && (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        )}

                                                        {loading
                                                            ? 'Signing In...'
                                                            : 'Sign In'}
                                                    </span>
                                                </button>
                                            </form>

                                            {/* FOOTER */}
                                            <div className="mt-7 border-t border-white/[0.06] pt-6 text-center">
                                                <Link
                                                    to="/"
                                                    className="text-sm text-zinc-600 transition-colors hover:text-purple-300"
                                                >
                                                    ← Back to website
                                                </Link>
                                            </div>
                                        </div>

                                        {/* STATUS */}
                                        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-zinc-700">
                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                            Secure internal access
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>

                    {/* COPYRIGHT */}
                    <p className="mt-5 text-center text-xs text-zinc-400">
                        39Production · Internal Management System
                    </p>
                </div>
            </div>
        </div>
    )
}