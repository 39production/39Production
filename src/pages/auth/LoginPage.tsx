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
        <div className="flex min-h-screen items-center justify-center bg-bg-base px-4 py-12">
            <div className="w-full max-w-md">
                <div className="mb-8 flex justify-center">
                    <Logo
                        size="lg"
                        showSubtext
                    />
                </div>

                <div className="rounded-2xl border border-border-default bg-bg-surface p-8">
                    <div className="mb-8 text-center">
                        <h1 className="font-display text-3xl font-bold text-text-primary">
                            Welcome Back
                        </h1>

                        <p className="mt-2 text-sm text-text-secondary">
                            Sign in to your 39Production account
                        </p>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >
                        <div>
                            <label
                                htmlFor="email"
                                className="mb-2 block text-sm font-medium text-text-primary"
                            >
                                Email
                            </label>

                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />

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
                                    className="w-full rounded-lg border border-border-default bg-bg-base py-3 pl-10 pr-4 text-sm text-text-primary outline-none transition focus:border-brand-primary disabled:cursor-not-allowed disabled:opacity-60"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="mb-2 block text-sm font-medium text-text-primary"
                            >
                                Password
                            </label>

                            <div className="relative">
                                <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />

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
                                    className="w-full rounded-lg border border-border-default bg-bg-base py-3 pl-10 pr-11 text-sm text-text-primary outline-none transition focus:border-brand-primary disabled:cursor-not-allowed disabled:opacity-60"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(
                                            (value) => !value,
                                        )
                                    }
                                    disabled={loading}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted transition-colors hover:text-text-primary disabled:opacity-50"
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

                        {error && (
                            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-secondary disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading && (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            )}

                            {loading
                                ? 'Signing In...'
                                : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link
                            to="/"
                            className="text-sm text-text-muted transition-colors hover:text-text-primary"
                        >
                            ← Back to website
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}