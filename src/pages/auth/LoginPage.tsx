
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
    ArrowLeft,
    ArrowRight,
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
        <div className="relative min-h-screen overflow-hidden bg-[#f7f7f5] text-zinc-950">

            {/* =========================================================
                BACKGROUND
            ========================================================== */}

            <div
                className="pointer-events-none absolute inset-0 opacity-[0.035]"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, #111 1px, transparent 1px),
                        linear-gradient(to bottom, #111 1px, transparent 1px)
                    `,
                    backgroundSize: '72px 72px',
                }}
            />

            <div className="pointer-events-none absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-violet-200/30 blur-[130px]" />

            <div className="pointer-events-none absolute -bottom-40 -right-40 h-[520px] w-[520px] rounded-full bg-fuchsia-200/25 blur-[130px]" />

            {/* =========================================================
                PAGE
            ========================================================== */}

            <div className="relative flex min-h-screen items-center justify-center px-5 py-8 sm:px-8">

                <div className="w-full max-w-6xl">

                    {/* =================================================
                        TOP META
                    ================================================= */}

                    <div className="mb-5 flex items-center justify-between">

                        <div className="flex items-center gap-3">
                            <span className="font-mono text-[9px] font-medium uppercase tracking-[0.22em] text-zinc-400">
                                39Production
                            </span>

                            <span className="h-px w-8 bg-zinc-300" />

                            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-400">
                                Internal Access
                            </span>
                        </div>

                        <span className="hidden font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-400 sm:block">
                            SYS / 01
                        </span>

                    </div>

                    {/* =================================================
                        MAIN FRAME
                    ================================================= */}

                    <main className="overflow-hidden border border-zinc-200 bg-white shadow-[0_25px_80px_-45px_rgba(0,0,0,0.35)]">

                        <div className="grid lg:grid-cols-[1.15fr_0.85fr]">

                            {/* =================================================
                                LEFT — BRAND / INTRO
                            ================================================= */}

                            <section className="relative flex min-h-[620px] flex-col border-b border-zinc-200 p-7 sm:p-10 lg:border-b-0 lg:border-r lg:p-14">

                                {/* Decorative editorial lines */}

                                <div className="pointer-events-none absolute right-0 top-0 h-full w-px bg-zinc-100" />

                                <div className="pointer-events-none absolute bottom-0 left-0 h-px w-1/2 bg-gradient-to-r from-violet-300/50 to-transparent" />

                                <div className="pointer-events-none absolute right-10 top-10 h-32 w-32 border border-violet-100" />

                                <div className="pointer-events-none absolute right-16 top-16 h-20 w-20 border border-fuchsia-100" />

                                <div className="relative z-10 flex h-full flex-col">

                                    {/* LOGO */}

                                    <div>
                                        <Logo
                                            size="lg"
                                            showSubtext
                                        />
                                    </div>

                                    {/* MAIN COPY */}

                                    <div className="my-auto max-w-xl py-20">

                                        <div className="flex items-center gap-3">
                                            <span className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-violet-600">
                                                Management System
                                            </span>

                                            <span className="h-px w-8 bg-violet-200" />
                                        </div>

                                        <h1 className="mt-6 max-w-lg text-4xl font-semibold leading-[0.95] tracking-[-0.055em] text-zinc-950 sm:text-5xl lg:text-6xl">
                                            The work behind
                                            <span className="block text-violet-600">
                                                the work.
                                            </span>
                                        </h1>

                                        <p className="mt-7 max-w-lg text-sm leading-7 text-zinc-500 sm:text-base">
                                            A dedicated workspace for managing
                                            39Production — from projects and
                                            services to digital products,
                                            entertainment, orders, and internal
                                            operations.
                                        </p>

                                        {/* INDEX */}

                                        <div className="mt-10 grid max-w-lg grid-cols-2 border-l border-t border-zinc-200 sm:grid-cols-4">

                                            <div className="border-b border-r border-zinc-200 p-3.5">
                                                <span className="font-mono text-[9px] text-zinc-400">
                                                    01
                                                </span>

                                                <p className="mt-2 text-xs font-medium text-zinc-700">
                                                    Projects
                                                </p>
                                            </div>

                                            <div className="border-b border-r border-zinc-200 p-3.5">
                                                <span className="font-mono text-[9px] text-zinc-400">
                                                    02
                                                </span>

                                                <p className="mt-2 text-xs font-medium text-zinc-700">
                                                    Services
                                                </p>
                                            </div>

                                            <div className="border-b border-r border-zinc-200 p-3.5">
                                                <span className="font-mono text-[9px] text-zinc-400">
                                                    03
                                                </span>

                                                <p className="mt-2 text-xs font-medium text-zinc-700">
                                                    Products
                                                </p>
                                            </div>

                                            <div className="border-b border-zinc-200 p-3.5">
                                                <span className="font-mono text-[9px] text-zinc-400">
                                                    04
                                                </span>

                                                <p className="mt-2 text-xs font-medium text-zinc-700">
                                                    Operations
                                                </p>
                                            </div>

                                        </div>
                                    </div>

                                    {/* BOTTOM */}

                                    <div className="flex flex-col gap-3 border-t border-zinc-200 pt-5 sm:flex-row sm:items-end sm:justify-between">

                                        <div>
                                            <p className="max-w-md text-[11px] leading-5 text-zinc-400">
                                                Creating Digital Works.
                                                Producing Stories.
                                                Sharing Gratitude.
                                            </p>
                                        </div>

                                        <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-400">
                                            Private Workspace
                                        </p>

                                    </div>

                                </div>
                            </section>

                            {/* =================================================
                                RIGHT — LOGIN
                            ================================================= */}

                            <section className="relative flex min-h-[620px] flex-col justify-center bg-zinc-950 px-7 py-10 text-white sm:px-10 lg:px-12">

                                {/* Dark grid */}

                                <div
                                    className="pointer-events-none absolute inset-0 opacity-[0.045]"
                                    style={{
                                        backgroundImage: `
                                            linear-gradient(to right, #fff 1px, transparent 1px),
                                            linear-gradient(to bottom, #fff 1px, transparent 1px)
                                        `,
                                        backgroundSize: '48px 48px',
                                    }}
                                />

                                {/* Accent glow */}

                                <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-violet-600/10 blur-[100px]" />

                                <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-fuchsia-600/10 blur-[100px]" />

                                {/* Accent line */}

                                <div className="pointer-events-none absolute right-8 top-0 h-40 w-px bg-gradient-to-b from-violet-500/50 to-transparent" />

                                <div className="relative z-10 mx-auto w-full max-w-sm">

                                    {/* HEADER */}

                                    <div className="mb-9">

                                        <div className="mb-5 flex items-center justify-between">

                                            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-violet-400">
                                                Admin / Sign In
                                            </span>

                                            <span className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-600">
                                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                                Online
                                            </span>

                                        </div>

                                        <h2 className="text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
                                            Welcome back.
                                        </h2>

                                        <p className="mt-3 max-w-sm text-sm leading-6 text-zinc-500">
                                            Sign in to access the
                                            39Production management
                                            workspace.
                                        </p>

                                    </div>

                                    {/* FORM */}

                                    <form
                                        onSubmit={handleSubmit}
                                        className="space-y-6"
                                    >

                                        {/* EMAIL */}

                                        <div>
                                            <label
                                                htmlFor="email"
                                                className="mb-2 block font-mono text-[9px] font-medium uppercase tracking-[0.18em] text-zinc-500"
                                            >
                                                Email Address
                                            </label>

                                            <div className="group relative">

                                                <Mail className="absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600 transition-colors group-focus-within:text-violet-400" />

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
                                                    className="w-full border-b border-zinc-700 bg-transparent py-3.5 pl-7 pr-2 text-sm text-white outline-none transition-all placeholder:text-zinc-700 focus:border-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
                                                />

                                            </div>
                                        </div>

                                        {/* PASSWORD */}

                                        <div>
                                            <label
                                                htmlFor="password"
                                                className="mb-2 block font-mono text-[9px] font-medium uppercase tracking-[0.18em] text-zinc-500"
                                            >
                                                Password
                                            </label>

                                            <div className="group relative">

                                                <LockKeyhole className="absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600 transition-colors group-focus-within:text-violet-400" />

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
                                                    className="w-full border-b border-zinc-700 bg-transparent py-3.5 pl-7 pr-9 text-sm text-white outline-none transition-all placeholder:text-zinc-700 focus:border-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
                                                />

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setShowPassword(
                                                            (value) => !value,
                                                        )
                                                    }
                                                    disabled={loading}
                                                    className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-600 transition-colors hover:text-zinc-300 disabled:opacity-50"
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
                                            <div className="border border-red-500/20 bg-red-500/[0.07] px-4 py-3">

                                                <p className="text-xs leading-5 text-red-300">
                                                    {error}
                                                </p>

                                            </div>
                                        )}

                                        {/* SUBMIT */}

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="group relative inline-flex w-full items-center justify-between overflow-hidden border border-violet-500 bg-violet-600 px-4 py-3.5 text-sm font-semibold text-white transition-all hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
                                        >

                                            <span>
                                                {loading
                                                    ? 'Signing In...'
                                                    : 'Sign In'}
                                            </span>

                                            <span className="flex h-6 w-6 items-center justify-center border border-white/20 bg-white/10 transition-transform duration-300 group-hover:translate-x-0.5">

                                                {loading ? (
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                ) : (
                                                    <ArrowRight className="h-3.5 w-3.5" />
                                                )}

                                            </span>

                                        </button>

                                    </form>

                                    {/* FOOTER */}

                                    <div className="mt-8 border-t border-white/10 pt-6">

                                        <Link
                                            to="/"
                                            className="group inline-flex items-center gap-2 text-xs text-zinc-600 transition-colors hover:text-zinc-300"
                                        >
                                            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />

                                            Back to website
                                        </Link>

                                    </div>

                                    {/* STATUS */}

                                    <div className="mt-10 flex items-center justify-between border-t border-white/[0.06] pt-4">

                                        <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-zinc-700">
                                            Authorized Personnel Only
                                        </span>

                                        <span className="font-mono text-[8px] text-zinc-700">
                                            39P / SECURE
                                        </span>

                                    </div>

                                </div>
                            </section>

                        </div>
                    </main>

                    {/* =================================================
                        PAGE FOOTER
                    ================================================= */}

                    <div className="mt-5 flex flex-col gap-2 text-center sm:flex-row sm:items-center sm:justify-between">

                        <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-zinc-400">
                            39Production · Internal Management System
                        </p>

                        <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-zinc-400">
                            © {new Date().getFullYear()}
                        </p>

                    </div>

                </div>
            </div>
        </div>
    )
}
