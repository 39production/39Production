import { useEffect, useMemo, useState } from 'react'
import {
    Activity,
    AlertTriangle,
    CheckCircle2,
    Clock3,
    Eye,
    Filter,
    Search,
    ShieldCheck,
    X,
} from 'lucide-react'
import { get, formatDate } from '@/utils/businessApi'

interface Log {
    id: number
    actor: string
    action: string
    module: string
    entity_type: string
    target: string
    level: 'Info' | 'Warning' | 'Critical'
    description: string
    before_json?: string
    after_json?: string
    timestamp: string
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
    placeholder: string
}

function useAdminTheme() {
    const readTheme = (): AdminTheme =>
        document.documentElement.dataset.adminTheme === 'light'
            ? 'light'
            : 'dark'

    const [theme, setTheme] = useState<AdminTheme>(readTheme)

    useEffect(() => {
        const syncTheme = () => setTheme(readTheme())

        syncTheme()

        const observer = new MutationObserver(syncTheme)

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-admin-theme'],
        })

        return () => observer.disconnect()
    }, [])

    return theme
}

function getThemeTokens(theme: AdminTheme): ThemeTokens {
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
            placeholder: 'placeholder:text-neutral-400',
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
        placeholder: 'placeholder:text-white/25',
    }
}

function getLevelClasses(
    level: Log['level'],
    theme: AdminTheme,
) {
    if (level === 'Critical') {
        return theme === 'light'
            ? 'bg-red-50 text-red-700'
            : 'bg-red-500/10 text-red-400'
    }

    if (level === 'Warning') {
        return theme === 'light'
            ? 'bg-amber-50 text-amber-700'
            : 'bg-amber-500/10 text-amber-400'
    }

    return theme === 'light'
        ? 'bg-emerald-50 text-emerald-700'
        : 'bg-emerald-500/10 text-emerald-400'
}

function getLevelDot(level: Log['level']) {
    if (level === 'Critical') return 'bg-red-500'
    if (level === 'Warning') return 'bg-amber-500'
    return 'bg-emerald-500'
}

function getLevelIcon(level: Log['level']) {
    if (level === 'Critical') return AlertTriangle
    if (level === 'Warning') return Clock3
    return CheckCircle2
}

export function AdminAuditLogPage() {
    const theme = useAdminTheme()
    const c = getThemeTokens(theme)

    const [logs, setLogs] = useState<Log[]>([])
    const [search, setSearch] = useState('')
    const [level, setLevel] =
        useState<'All' | Log['level']>('All')
    const [detail, setDetail] = useState<Log | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            setLoading(true)

            try {
                const response = await get<{ data: Log[] }>(
                    '/api/admin/audit-logs',
                )

                setLogs(response.data || [])
            } catch (e) {
                alert(
                    e instanceof Error
                        ? e.message
                        : 'Failed to load audit logs',
                )
            } finally {
                setLoading(false)
            }
        }

        load()
    }, [])

    const filtered = useMemo(() => {
        const q = search.toLowerCase().trim()

        return logs.filter((l) => {
            const matchesSearch =
                !q ||
                (
                    l.actor +
                    ' ' +
                    l.action +
                    ' ' +
                    l.module +
                    ' ' +
                    l.target +
                    ' ' +
                    l.description
                )
                    .toLowerCase()
                    .includes(q)

            const matchesLevel =
                level === 'All' || l.level === level

            return matchesSearch && matchesLevel
        })
    }, [logs, search, level])

    return (
        <div className={`min-h-full space-y-6 ${c.page}`}>
            <div>
                <h2
                    className={`text-2xl font-bold ${c.textPrimary}`}
                >
                    Audit Log
                </h2>

                <p
                    className={`mt-1 text-sm ${c.textMuted}`}
                >
                    Immutable activity history for important business and system actions.
                </p>
            </div>

            <div
                className={`rounded-xl border border-emerald-500/20 ${theme === 'light'
                        ? 'bg-emerald-50'
                        : 'bg-emerald-500/[0.05]'
                    } p-5`}
            >
                <div className="flex gap-3">
                    <div className="shrink-0 rounded-lg bg-emerald-500/10 p-2 text-emerald-500">
                        <ShieldCheck className="h-5 w-5" />
                    </div>

                    <div>
                        <h3
                            className={`font-semibold ${c.textPrimary}`}
                        >
                            Audit protection
                        </h3>

                        <p
                            className={`mt-1 text-sm leading-6 ${c.textSecondary}`}
                        >
                            Financial transactions, revenue distribution, member changes, project changes, document generation, and approvals create server-side audit records.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Stat
                    icon={Activity}
                    label="Total Events"
                    value={logs.length}
                    theme={theme}
                />

                <Stat
                    icon={CheckCircle2}
                    label="Info"
                    value={
                        logs.filter(
                            (x) => x.level === 'Info',
                        ).length
                    }
                    theme={theme}
                />

                <Stat
                    icon={Clock3}
                    label="Warnings"
                    value={
                        logs.filter(
                            (x) => x.level === 'Warning',
                        ).length
                    }
                    theme={theme}
                />

                <Stat
                    icon={AlertTriangle}
                    label="Critical"
                    value={
                        logs.filter(
                            (x) => x.level === 'Critical',
                        ).length
                    }
                    theme={theme}
                />
            </div>

            <div
                className={`rounded-xl border ${c.border} ${c.surface} p-4`}
            >
                <div className="flex flex-col gap-3 md:flex-row">
                    <div className="relative flex-1">
                        <Search
                            className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${c.textMuted}`}
                        />

                        <input
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            placeholder="Search audit activity..."
                            className={`w-full rounded-lg border ${c.border} ${c.input} ${c.textPrimary} ${c.placeholder} py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/10`}
                        />
                    </div>

                    <div className="relative">
                        <Filter
                            className={`pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${c.textMuted}`}
                        />

                        <select
                            value={level}
                            onChange={(e) =>
                                setLevel(
                                    e.target.value as
                                    | 'All'
                                    | Log['level'],
                                )
                            }
                            className={`w-full appearance-none rounded-lg border ${c.border} ${c.input} ${c.textPrimary} px-4 py-2.5 pl-10 pr-9 text-sm outline-none transition focus:border-violet-500/60 md:w-auto`}
                        >
                            <option value="All">
                                All Levels
                            </option>
                            <option value="Info">Info</option>
                            <option value="Warning">
                                Warning
                            </option>
                            <option value="Critical">
                                Critical
                            </option>
                        </select>
                    </div>
                </div>
            </div>

            <div
                className={`overflow-hidden rounded-xl border ${c.border} ${c.surface}`}
            >
                <div
                    className={`border-b ${c.border} px-5 py-4`}
                >
                    <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-violet-500/10 p-1.5 text-violet-500">
                            <Activity className="h-4 w-4" />
                        </div>

                        <div>
                            <h3
                                className={`text-sm font-semibold ${c.textPrimary}`}
                            >
                                Activity History
                            </h3>

                            {!loading && (
                                <p
                                    className={`mt-0.5 text-xs ${c.textMuted}`}
                                >
                                    {filtered.length} event
                                    {filtered.length === 1
                                        ? ''
                                        : 's'} displayed
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div
                    className={`divide-y ${c.border}`}
                >
                    {loading ? (
                        <div
                            className={`p-12 text-center text-sm ${c.textMuted}`}
                        >
                            Loading audit activity...
                        </div>
                    ) : (
                        filtered.map((l) => {
                            const Icon =
                                getLevelIcon(l.level)

                            return (
                                <div
                                    key={l.id}
                                    className={`flex gap-4 px-5 py-5 ${c.hover} transition-colors`}
                                >
                                    <div
                                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${l.level === 'Critical'
                                                ? 'bg-red-500/10 text-red-500'
                                                : l.level === 'Warning'
                                                    ? 'bg-amber-500/10 text-amber-500'
                                                    : 'bg-violet-500/10 text-violet-500'
                                            }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-col justify-between gap-2 sm:flex-row">
                                            <div className="min-w-0">
                                                <p
                                                    className={`text-sm font-medium ${c.textPrimary}`}
                                                >
                                                    {l.action}
                                                </p>

                                                <p
                                                    className={`mt-1 truncate text-xs ${c.textMuted}`}
                                                >
                                                    {l.actor ||
                                                        'System'}{' '}
                                                    · {l.module} ·{' '}
                                                    {l.target || '-'}
                                                </p>
                                            </div>

                                            <span
                                                className={`shrink-0 text-xs ${c.textMuted}`}
                                            >
                                                {formatDate(
                                                    l.timestamp,
                                                )}
                                            </span>
                                        </div>

                                        <p
                                            className={`mt-3 text-sm leading-6 ${c.textSecondary}`}
                                        >
                                            {l.description}
                                        </p>

                                        <div className="mt-3 flex flex-wrap items-center gap-2">
                                            <span
                                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${getLevelClasses(
                                                    l.level,
                                                    theme,
                                                )}`}
                                            >
                                                <span
                                                    className={`h-1.5 w-1.5 rounded-full ${getLevelDot(
                                                        l.level,
                                                    )}`}
                                                />

                                                {l.level}
                                            </span>

                                            {l.entity_type && (
                                                <span
                                                    className={`inline-flex rounded-full border ${c.border} ${c.elevated} px-2.5 py-1 text-[11px] font-medium ${c.textMuted}`}
                                                >
                                                    {l.entity_type}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setDetail(l)}
                                        title="View details"
                                        className={`hidden h-fit shrink-0 rounded-lg p-2 ${c.textMuted} ${c.hover} transition sm:block`}
                                    >
                                        <Eye className="h-4 w-4" />
                                    </button>
                                </div>
                            )
                        })
                    )}
                </div>

                {!loading && !filtered.length && (
                    <div className="p-12 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-violet-500/10 text-violet-500">
                            <Activity className="h-5 w-5" />
                        </div>

                        <p
                            className={`mt-4 text-sm font-medium ${c.textPrimary}`}
                        >
                            No audit activity found.
                        </p>

                        <p
                            className={`mt-1 text-xs ${c.textMuted}`}
                        >
                            Try changing the search or level filter.
                        </p>
                    </div>
                )}
            </div>

            {detail && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
                    <div
                        className={`max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl border ${c.border} ${c.surface} shadow-2xl`}
                    >
                        <div
                            className={`flex items-start justify-between gap-4 border-b ${c.border} p-5`}
                        >
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h3
                                        className={`font-semibold ${c.textPrimary}`}
                                    >
                                        {detail.action}
                                    </h3>

                                    <span
                                        className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-medium ${getLevelClasses(
                                            detail.level,
                                            theme,
                                        )}`}
                                    >
                                        <span
                                            className={`h-1.5 w-1.5 rounded-full ${getLevelDot(
                                                detail.level,
                                            )}`}
                                        />
                                        {detail.level}
                                    </span>
                                </div>

                                <p
                                    className={`mt-1 text-xs ${c.textMuted}`}
                                >
                                    {detail.actor || 'System'} ·{' '}
                                    {detail.module} ·{' '}
                                    {detail.target || '-'}
                                </p>

                                <p
                                    className={`mt-1 text-xs ${c.textMuted}`}
                                >
                                    {formatDate(
                                        detail.timestamp,
                                    )}
                                </p>
                            </div>

                            <button
                                onClick={() => setDetail(null)}
                                className={`shrink-0 rounded-lg p-2 ${c.textMuted} ${c.hover} transition`}
                                aria-label="Close details"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-5 p-5">
                            <DetailSection
                                label="Description"
                                theme={theme}
                            >
                                <p
                                    className={`text-sm leading-6 ${c.textPrimary}`}
                                >
                                    {detail.description}
                                </p>
                            </DetailSection>

                            <DetailSection
                                label="Before"
                                theme={theme}
                            >
                                <JsonPreview
                                    value={detail.before_json}
                                    theme={theme}
                                />
                            </DetailSection>

                            <DetailSection
                                label="After"
                                theme={theme}
                            >
                                <JsonPreview
                                    value={detail.after_json}
                                    theme={theme}
                                />
                            </DetailSection>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function DetailSection({
    label,
    theme,
    children,
}: {
    label: string
    theme: AdminTheme
    children: React.ReactNode
}) {
    const c = getThemeTokens(theme)

    return (
        <div>
            <p
                className={`mb-2 text-xs font-medium uppercase tracking-wider ${c.textMuted}`}
            >
                {label}
            </p>

            {children}
        </div>
    )
}

function JsonPreview({
    value,
    theme,
}: {
    value?: string
    theme: AdminTheme
}) {
    const c = getThemeTokens(theme)

    let output = value || '-'

    if (value) {
        try {
            output = JSON.stringify(
                JSON.parse(value),
                null,
                2,
            )
        } catch {
            output = value
        }
    }

    return (
        <pre
            className={`max-h-72 overflow-auto rounded-lg border ${c.border} ${c.input} p-4 text-xs leading-5 ${c.textSecondary}`}
        >
            {output}
        </pre>
    )
}

function Stat({
    icon: Icon,
    label,
    value,
    theme,
}: {
    icon: any
    label: string
    value: number
    theme: AdminTheme
}) {
    const c = getThemeTokens(theme)

    return (
        <div
            className={`rounded-xl border ${c.border} ${c.surface} p-5 transition hover:-translate-y-0.5`}
        >
            <div className="flex items-center justify-between gap-4">
                <div>
                    <p
                        className={`text-sm ${c.textMuted}`}
                    >
                        {label}
                    </p>

                    <p
                        className={`mt-2 text-2xl font-bold ${c.textPrimary}`}
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
