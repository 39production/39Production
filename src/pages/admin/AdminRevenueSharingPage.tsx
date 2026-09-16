import {
    useEffect,
    useState,
    type ComponentType,
    type FormEvent,
} from 'react'
import {
    Calculator,
    CheckCircle2,
    Clock3,
    FileCheck2,
    Plus,
    ShieldCheck,
    Users,
    X,
    WalletCards,
} from 'lucide-react'
import {
    get,
    post,
    put,
    formatCurrency,
} from '@/utils/businessApi'

interface Member {
    member_id: number
    name: string
    role: string
    percentage: number
    amount: number
}

interface Distribution {
    id: number
    code: string
    project_id: number
    project_code: string
    project_name: string
    revenue: number
    costs: number
    profit: number
    reserve_percentage: number
    reserve: number
    distributable: number
    status: string
    members: Member[]
}

interface Project {
    id: number
    name: string
}

interface CreateDistributionPayload {
    project_id: number
    reserve_percentage: number
}

type AdminTheme = 'dark' | 'light'

interface ThemeTokens {
    page: string
    surface: string
    elevated: string
    input: string
    border: string
    textPrimary: string
    textSecondary: string
    textMuted: string
    hover: string
}

interface StatProps {
    icon: ComponentType<{
        className?: string
    }>
    label: string
    value: string | number
    theme: AdminTheme
}

function useAdminTheme() {
    const readTheme = (): AdminTheme =>
        document.documentElement.dataset.adminTheme ===
            'light'
            ? 'light'
            : 'dark'

    const [theme, setTheme] =
        useState<AdminTheme>(readTheme)

    useEffect(() => {
        const syncTheme = () => {
            setTheme(readTheme())
        }

        syncTheme()

        const observer =
            new MutationObserver(syncTheme)

        observer.observe(
            document.documentElement,
            {
                attributes: true,
                attributeFilter: ['data-admin-theme'],
            },
        )

        return () =>
            observer.disconnect()
    }, [])

    return theme
}

function getThemeTokens(
    theme: AdminTheme,
): ThemeTokens {
    if (theme === 'light') {
        return {
            page: 'bg-[#f7f7fa]',
            surface: 'bg-white',
            elevated: 'bg-neutral-50',
            input: 'bg-white',
            border: 'border-neutral-200',
            textPrimary: 'text-neutral-900',
            textSecondary: 'text-neutral-600',
            textMuted: 'text-neutral-500',
            hover: 'hover:bg-neutral-50',
        }
    }

    return {
        page: 'bg-[#0b0b0f]',
        surface: 'bg-[#15151b]',
        elevated: 'bg-[#1b1b22]',
        input: 'bg-[#0f0f13]',
        border: 'border-white/[0.08]',
        textPrimary: 'text-white',
        textSecondary: 'text-white/70',
        textMuted: 'text-white/45',
        hover: 'hover:bg-white/[0.04]',
    }
}

function statusClasses(
    status: string,
    theme: AdminTheme,
) {
    if (status === 'Pending Approval') {
        return theme === 'light'
            ? 'bg-amber-50 text-amber-700'
            : 'bg-amber-500/10 text-amber-400'
    }

    if (status === 'Approved') {
        return theme === 'light'
            ? 'bg-blue-50 text-blue-700'
            : 'bg-blue-500/10 text-blue-400'
    }

    if (status === 'Paid') {
        return theme === 'light'
            ? 'bg-emerald-50 text-emerald-700'
            : 'bg-emerald-500/10 text-emerald-400'
    }

    return theme === 'light'
        ? 'bg-neutral-100 text-neutral-600'
        : 'bg-white/[0.06] text-white/60'
}

function statusDotClass(
    status: string,
) {
    if (status === 'Pending Approval') {
        return 'bg-amber-500'
    }

    if (status === 'Approved') {
        return 'bg-blue-500'
    }

    if (status === 'Paid') {
        return 'bg-emerald-500'
    }

    return 'bg-neutral-400'
}

function getDistributionMetrics(
    distribution: Distribution,
) {
    return [
        {
            label: 'Revenue',
            value: distribution.revenue,
        },
        {
            label: 'Project Costs',
            value: distribution.costs,
        },
        {
            label: 'Net Profit',
            value: distribution.profit,
        },
        {
            label: `Reserve (${distribution.reserve_percentage}%)`,
            value: distribution.reserve,
        },
        {
            label: 'Distributable',
            value: distribution.distributable,
        },
    ] as const
}

export function AdminRevenueSharingPage() {
    const theme = useAdminTheme()
    const c = getThemeTokens(theme)

    const [d, setD] =
        useState<Distribution[]>([])

    const [projects, setProjects] =
        useState<Project[]>([])

    const [show, setShow] =
        useState(false)

    const [loading, setLoading] =
        useState(true)

    const load = async () => {
        setLoading(true)

        try {
            const [a, b] =
                await Promise.all([
                    get<{
                        data: Distribution[]
                    }>(
                        '/api/admin/revenue-sharing',
                    ),
                    get<{
                        data: Project[]
                    }>(
                        '/api/admin/projects',
                    ),
                ])

            setD(a.data || [])
            setProjects(b.data || [])
        } catch (e) {
            alert(
                e instanceof Error
                    ? e.message
                    : 'Failed to load revenue sharing',
            )
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        load()
    }, [])

    const approve = async (
        id: number,
    ) => {
        try {
            await put(
                `/api/admin/revenue-sharing/${id}?action=approve`,
                {},
            )

            await load()
        } catch (e) {
            alert(
                e instanceof Error
                    ? e.message
                    : 'Failed to approve',
            )
        }
    }

    const pay = async (
        id: number,
    ) => {
        try {
            await put(
                `/api/admin/revenue-sharing/${id}?action=pay`,
                {},
            )

            await load()
        } catch (e) {
            alert(
                e instanceof Error
                    ? e.message
                    : 'Failed to pay',
            )
        }
    }

    return (
        <div
            className={[
                'min-h-full space-y-6',
                c.page,
            ].join(' ')}
        >
            {/* HEADER */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <p
                        className={[
                            'text-sm',
                            c.textMuted,
                        ].join(' ')}
                    >
                        Business Management
                    </p>

                    <h2
                        className={[
                            'mt-1 text-2xl font-bold',
                            c.textPrimary,
                        ].join(' ')}
                    >
                        Revenue Sharing
                    </h2>

                    <p
                        className={[
                            'mt-1 max-w-2xl text-sm',
                            c.textMuted,
                        ].join(' ')}
                    >
                        Calculate project profit and
                        distribute it based on agreed
                        contribution rules.
                    </p>
                </div>

                <button
                    onClick={() => setShow(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500"
                >
                    <Plus className="h-4 w-4" />
                    New Distribution
                </button>
            </div>

            {/* STATS */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Stat
                    icon={Calculator}
                    label="Distributable"
                    value={formatCurrency(
                        d.reduce(
                            (sum, item) =>
                                sum +
                                Number(
                                    item.distributable || 0,
                                ),
                            0,
                        ),
                    )}
                    theme={theme}
                />

                <Stat
                    icon={Clock3}
                    label="Pending Approval"
                    value={
                        d.filter(
                            (item) =>
                                item.status ===
                                'Pending Approval',
                        ).length
                    }
                    theme={theme}
                />

                <Stat
                    icon={CheckCircle2}
                    label="Approved / Paid"
                    value={
                        d.filter(
                            (item) =>
                                item.status ===
                                'Approved' ||
                                item.status === 'Paid',
                        ).length
                    }
                    theme={theme}
                />

                <Stat
                    icon={ShieldCheck}
                    label="Controlled Records"
                    value={d.length}
                    theme={theme}
                />
            </div>

            {/* PRINCIPLE */}
            <div
                className={[
                    'rounded-xl border border-violet-500/20 p-5',
                    theme === 'light'
                        ? 'bg-violet-50'
                        : 'bg-violet-500/[0.06]',
                ].join(' ')}
            >
                <div className="flex gap-3">
                    <div className="shrink-0 rounded-lg bg-violet-500/10 p-2 text-violet-500">
                        <ShieldCheck className="h-5 w-5" />
                    </div>

                    <div>
                        <h3
                            className={[
                                'font-semibold',
                                c.textPrimary,
                            ].join(' ')}
                        >
                            Distribution principle
                        </h3>

                        <p
                            className={[
                                'mt-1 text-sm leading-6',
                                c.textSecondary,
                            ].join(' ')}
                        >
                            Revenue is calculated from
                            completed finance transactions,
                            then project costs, net profit,
                            company reserve, and member
                            contribution percentages are
                            applied.
                        </p>
                    </div>
                </div>
            </div>

            {/* DISTRIBUTIONS */}
            <div className="space-y-4">
                {loading ? (
                    <div
                        className={[
                            'rounded-xl border p-12 text-center text-sm',
                            c.border,
                            c.surface,
                            c.textMuted,
                        ].join(' ')}
                    >
                        Loading...
                    </div>
                ) : d.length === 0 ? (
                    <div
                        className={[
                            'rounded-xl border p-12 text-center',
                            c.border,
                            c.surface,
                        ].join(' ')}
                    >
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-violet-500/10 text-violet-500">
                            <Calculator className="h-5 w-5" />
                        </div>

                        <h3
                            className={[
                                'mt-4 font-semibold',
                                c.textPrimary,
                            ].join(' ')}
                        >
                            No revenue distributions yet
                        </h3>

                        <p
                            className={[
                                'mx-auto mt-1 max-w-md text-sm',
                                c.textMuted,
                            ].join(' ')}
                        >
                            Create a distribution record
                            from a project to calculate its
                            profit allocation.
                        </p>

                        <button
                            onClick={() => setShow(true)}
                            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500"
                        >
                            <Plus className="h-4 w-4" />
                            New Distribution
                        </button>
                    </div>
                ) : (
                    d.map((x) => (
                        <div
                            key={x.id}
                            className={[
                                'overflow-hidden rounded-xl border',
                                c.border,
                                c.surface,
                            ].join(' ')}
                        >
                            {/* CARD HEADER */}
                            <div
                                className={[
                                    'flex flex-col justify-between gap-4 border-b p-5 md:flex-row md:items-center',
                                    c.border,
                                ].join(' ')}
                            >
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-violet-500">
                                        {x.code}
                                    </p>

                                    <h3
                                        className={[
                                            'mt-1 font-semibold',
                                            c.textPrimary,
                                        ].join(' ')}
                                    >
                                        {x.project_code} —{' '}
                                        {x.project_name}
                                    </h3>
                                </div>

                                <span
                                    className={[
                                        'inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
                                        statusClasses(
                                            x.status,
                                            theme,
                                        ),
                                    ].join(' ')}
                                >
                                    <span
                                        className={[
                                            'h-1.5 w-1.5 rounded-full',
                                            statusDotClass(
                                                x.status,
                                            ),
                                        ].join(' ')}
                                    />

                                    {x.status}
                                </span>
                            </div>

                            {/* FINANCIAL METRICS */}
                            <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-5">
                                {getDistributionMetrics(
                                    x,
                                ).map(
                                    ({
                                        label,
                                        value,
                                    }) => (
                                        <div
                                            key={label}
                                            className={[
                                                'rounded-lg border p-4',
                                                c.border,
                                                c.elevated,
                                            ].join(' ')}
                                        >
                                            <p
                                                className={[
                                                    'text-xs',
                                                    c.textMuted,
                                                ].join(' ')}
                                            >
                                                {label}
                                            </p>

                                            <p
                                                className={[
                                                    'mt-2 text-sm font-bold',
                                                    c.textPrimary,
                                                ].join(' ')}
                                            >
                                                {formatCurrency(
                                                    Number(value),
                                                )}
                                            </p>
                                        </div>
                                    ),
                                )}
                            </div>

                            {/* MEMBERS */}
                            <div
                                className={[
                                    'border-t',
                                    c.border,
                                ].join(' ')}
                            >
                                <div className="flex items-center gap-2 px-5 py-4">
                                    <Users
                                        className={[
                                            'h-4 w-4',
                                            c.textMuted,
                                        ].join(' ')}
                                    />

                                    <h4
                                        className={[
                                            'text-sm font-semibold',
                                            c.textPrimary,
                                        ].join(' ')}
                                    >
                                        Distribution Members
                                    </h4>
                                </div>

                                {x.members.length === 0 ? (
                                    <div
                                        className={[
                                            'border-t px-5 py-5 text-sm',
                                            c.border,
                                            c.textMuted,
                                        ].join(' ')}
                                    >
                                        No distribution members
                                        assigned.
                                    </div>
                                ) : (
                                    x.members.map((m) => (
                                        <div
                                            key={m.member_id}
                                            className={[
                                                'flex flex-col gap-3 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between',
                                                c.border,
                                            ].join(' ')}
                                        >
                                            <div className="min-w-0">
                                                <p
                                                    className={[
                                                        'text-sm font-medium',
                                                        c.textPrimary,
                                                    ].join(' ')}
                                                >
                                                    {m.name}
                                                </p>

                                                <p
                                                    className={[
                                                        'mt-1 text-xs',
                                                        c.textMuted,
                                                    ].join(' ')}
                                                >
                                                    {m.role} ·{' '}
                                                    {m.percentage}%
                                                </p>
                                            </div>

                                            <p className="font-semibold text-violet-500">
                                                {formatCurrency(
                                                    Number(
                                                        m.amount,
                                                    ),
                                                )}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* PENDING */}
                            {x.status ===
                                'Pending Approval' && (
                                    <div
                                        className={[
                                            'flex flex-col gap-3 border-t p-5 sm:flex-row sm:items-center sm:justify-between',
                                            c.border,
                                        ].join(' ')}
                                    >
                                        <p
                                            className={[
                                                'text-xs',
                                                c.textMuted,
                                            ].join(' ')}
                                        >
                                            Review the calculated
                                            allocation before approving
                                            it.
                                        </p>

                                        <button
                                            onClick={() =>
                                                approve(x.id)
                                            }
                                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-500 transition hover:bg-emerald-500/15"
                                        >
                                            <FileCheck2 className="h-4 w-4" />
                                            Approve Distribution
                                        </button>
                                    </div>
                                )}

                            {/* APPROVED */}
                            {x.status ===
                                'Approved' && (
                                    <div
                                        className={[
                                            'flex flex-col gap-3 border-t p-5 sm:flex-row sm:items-center sm:justify-between',
                                            c.border,
                                        ].join(' ')}
                                    >
                                        <p
                                            className={[
                                                'text-xs',
                                                c.textMuted,
                                            ].join(' ')}
                                        >
                                            The distribution is approved
                                            and ready to be marked as
                                            paid.
                                        </p>

                                        <button
                                            onClick={() =>
                                                pay(x.id)
                                            }
                                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-500/10 px-4 py-2.5 text-sm font-semibold text-violet-500 transition hover:bg-violet-500/15"
                                        >
                                            <WalletCards className="h-4 w-4" />
                                            Mark Paid
                                        </button>
                                    </div>
                                )}
                        </div>
                    ))
                )}
            </div>

            {/* MODAL */}
            {show && (
                <DistributionModal
                    projects={projects}
                    theme={theme}
                    onClose={() =>
                        setShow(false)
                    }
                    onSave={async (
                        payload,
                    ) => {
                        try {
                            await post(
                                '/api/admin/revenue-sharing',
                                payload,
                            )

                            setShow(false)
                            await load()
                        } catch (e) {
                            alert(
                                e instanceof Error
                                    ? e.message
                                    : 'Failed to create distribution',
                            )
                        }
                    }}
                />
            )}
        </div>
    )
}

function Stat({
    icon: Icon,
    label,
    value,
    theme,
}: StatProps) {
    const c =
        getThemeTokens(theme)

    return (
        <div
            className={[
                'rounded-xl border p-5 transition hover:-translate-y-0.5',
                c.border,
                c.surface,
            ].join(' ')}
        >
            <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                    <p
                        className={[
                            'text-sm',
                            c.textMuted,
                        ].join(' ')}
                    >
                        {label}
                    </p>

                    <p
                        className={[
                            'mt-2 truncate text-xl font-bold',
                            c.textPrimary,
                        ].join(' ')}
                    >
                        {value}
                    </p>
                </div>

                <div className="shrink-0 rounded-lg bg-violet-500/10 p-3 text-violet-500">
                    <Icon className="h-5 w-5" />
                </div>
            </div>
        </div>
    )
}

function DistributionModal({
    projects,
    theme,
    onClose,
    onSave,
}: {
    projects: Project[]
    theme: AdminTheme
    onClose: () => void
    onSave: (
        payload: CreateDistributionPayload,
    ) => Promise<void> | void
}) {
    const c =
        getThemeTokens(theme)

    const [projectId, setProjectId] =
        useState('')

    const [reservePercentage, setReservePercentage] =
        useState('20')

    const [
        submitting,
        setSubmitting,
    ] = useState(false)

    const [
        formError,
        setFormError,
    ] = useState('')

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault()
        setFormError('')

        const numericProjectId =
            Number(projectId)

        const numericReserve =
            Number(
                reservePercentage,
            )

        if (
            !projectId ||
            !Number.isFinite(
                numericProjectId,
            )
        ) {
            setFormError(
                'Please select a project.',
            )
            return
        }

        if (
            !Number.isFinite(
                numericReserve,
            ) ||
            numericReserve < 0 ||
            numericReserve > 100
        ) {
            setFormError(
                'Company reserve must be between 0% and 100%.',
            )
            return
        }

        try {
            setSubmitting(true)

            await onSave({
                project_id:
                    numericProjectId,
                reserve_percentage:
                    numericReserve,
            })
        } catch (error) {
            setFormError(
                error instanceof Error
                    ? error.message
                    : 'Failed to create distribution.',
            )
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div
                className={[
                    'w-full max-w-lg overflow-hidden rounded-2xl border shadow-2xl',
                    c.border,
                    c.surface,
                ].join(' ')}
            >
                {/* HEADER */}
                <div
                    className={[
                        'flex items-center justify-between border-b p-5',
                        c.border,
                    ].join(' ')}
                >
                    <div>
                        <h3
                            className={[
                                'font-semibold',
                                c.textPrimary,
                            ].join(' ')}
                        >
                            New Revenue Distribution
                        </h3>

                        <p
                            className={[
                                'mt-1 text-xs',
                                c.textMuted,
                            ].join(' ')}
                        >
                            Create a project-based profit
                            distribution record.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className={[
                            'rounded-lg p-2 transition disabled:cursor-not-allowed disabled:opacity-50',
                            c.textMuted,
                            c.hover,
                        ].join(' ')}
                        aria-label="Close modal"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* FORM */}
                <form
                    onSubmit={handleSubmit}
                    className="space-y-5 p-5"
                >
                    {formError && (
                        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-400">
                            {formError}
                        </div>
                    )}

                    <label className="block">
                        <span
                            className={[
                                'mb-1.5 block text-xs',
                                c.textSecondary,
                            ].join(' ')}
                        >
                            Project
                        </span>

                        <select
                            required
                            value={projectId}
                            onChange={(event) =>
                                setProjectId(
                                    event.target.value,
                                )
                            }
                            disabled={submitting}
                            className={[
                                'w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/10 disabled:cursor-not-allowed disabled:opacity-60',
                                c.border,
                                c.input,
                                c.textPrimary,
                            ].join(' ')}
                        >
                            <option value="">
                                Select project
                            </option>

                            {projects.map((project) => (
                                <option
                                    key={project.id}
                                    value={project.id}
                                >
                                    {project.name}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="block">
                        <span
                            className={[
                                'mb-1.5 block text-xs',
                                c.textSecondary,
                            ].join(' ')}
                        >
                            Company Reserve %
                        </span>

                        <div className="relative">
                            <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                value={reservePercentage}
                                onChange={(event) =>
                                    setReservePercentage(
                                        event.target.value,
                                    )
                                }
                                disabled={submitting}
                                className={[
                                    'w-full rounded-lg border px-3 py-2.5 pr-10 text-sm outline-none transition focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/10 disabled:cursor-not-allowed disabled:opacity-60',
                                    c.border,
                                    c.input,
                                    c.textPrimary,
                                ].join(' ')}
                            />

                            <span
                                className={[
                                    'pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm',
                                    c.textMuted,
                                ].join(' ')}
                            >
                                %
                            </span>
                        </div>
                    </label>

                    {/* INFO */}
                    <div
                        className={[
                            'rounded-lg border p-4',
                            c.border,
                            theme === 'light'
                                ? 'bg-amber-50'
                                : 'bg-amber-500/[0.06]',
                        ].join(' ')}
                    >
                        <div className="flex gap-3">
                            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />

                            <p
                                className={[
                                    'text-xs leading-5',
                                    c.textMuted,
                                ].join(' ')}
                            >
                                Revenue and costs are read
                                from completed Finance
                                transactions. Member
                                percentages are read from
                                the selected project's
                                assignment.
                            </p>
                        </div>
                    </div>

                    {/* FOOTER */}
                    <div
                        className={[
                            'flex justify-end gap-3 border-t pt-4',
                            c.border,
                        ].join(' ')}
                    >
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className={[
                                'rounded-lg border px-4 py-2.5 text-sm transition disabled:cursor-not-allowed disabled:opacity-50',
                                c.border,
                                c.textSecondary,
                                c.hover,
                            ].join(' ')}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {submitting && (
                                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                            )}

                            {submitting
                                ? 'Creating...'
                                : 'Create Distribution'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
