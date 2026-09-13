import { useEffect, useMemo, useState } from 'react'
import {
    WalletCards,
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    ArrowDownRight,
    Plus,
    Search,
    MoreHorizontal,
    Pencil,
    Trash2,
    X,
    Receipt,
    CircleDollarSign,
    PiggyBank,
    Calculator,
} from 'lucide-react'
import {
    del,
    get,
    post,
    put,
    formatCurrency,
    formatDate,
} from '@/utils/businessApi'

type Type = 'Revenue' | 'Expense'
type Status = 'Completed' | 'Pending' | 'Cancelled'

interface Tx {
    id: number
    code: string
    date: string
    description: string
    category: string
    type: Type
    amount: number
    status: Status
    project_id?: number
    project?: string
}

interface Project {
    id: number
    name: string
}

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
    tableHeader: string
    dropdown: string
    placeholder: string
}

function useAdminTheme() {
    const getTheme = (): 'dark' | 'light' => {
        return document.documentElement.dataset.adminTheme === 'light'
            ? 'light'
            : 'dark'
    }

    const [theme, setTheme] = useState<'dark' | 'light'>(getTheme)

    useEffect(() => {
        const updateTheme = () => setTheme(getTheme())

        updateTheme()

        const observer = new MutationObserver(updateTheme)

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-admin-theme'],
        })

        return () => observer.disconnect()
    }, [])

    return theme
}

function getThemeTokens(theme: 'dark' | 'light'): ThemeTokens {
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
            tableHeader: 'bg-neutral-50',
            dropdown: 'bg-white',
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
        tableHeader: 'bg-white/[0.02]',
        dropdown: 'bg-[#17171d]',
        placeholder: 'placeholder:text-white/25',
    }
}

export function AdminFinancePage() {
    const theme = useAdminTheme()
    const c = getThemeTokens(theme)

    const [t, setT] = useState<Tx[]>([])
    const [projects, setProjects] = useState<Project[]>([])
    const [summary, setSummary] = useState<any>({
        revenue: 0,
        expense: 0,
        balance: 0,
        transactions: 0,
    })

    const [search, setSearch] = useState('')
    const [tf, setTf] = useState<'All' | Type>('All')
    const [sf, setSf] = useState<'All' | Status>('All')
    const [show, setShow] = useState(false)
    const [editing, setEditing] = useState<Tx | null>(null)
    const [menu, setMenu] = useState<number | null>(null)
    const [loading, setLoading] = useState(true)

    const load = async () => {
        setLoading(true)

        try {
            const [a, b, c] = await Promise.all([
                get<{ data: Tx[] }>('/api/admin/finance/transactions'),
                get<{ data: any }>('/api/admin/finance/summary'),
                get<{ data: Project[] }>('/api/admin/projects'),
            ])

            setT(a.data)
            setSummary(b.data)
            setProjects(c.data)
        } catch (e) {
            alert(e instanceof Error ? e.message : 'Failed to load finance')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        load()
    }, [])

    const filtered = useMemo(
        () =>
            t.filter(
                (x) =>
                    (
                        x.code +
                        ' ' +
                        x.description +
                        ' ' +
                        x.category +
                        ' ' +
                        (x.project || '')
                    )
                        .toLowerCase()
                        .includes(search.toLowerCase()) &&
                    (tf === 'All' || x.type === tf) &&
                    (sf === 'All' || x.status === sf),
            ),
        [t, search, tf, sf],
    )

    const save = async (v: any) => {
        try {
            if (editing) {
                await put(`/api/admin/finance/transactions/${editing.id}`, v)
            } else {
                await post('/api/admin/finance/transactions', v)
            }

            setShow(false)
            setEditing(null)
            await load()
        } catch (e) {
            alert(
                e instanceof Error ? e.message : 'Failed to save transaction',
            )
        }
    }

    const remove = async (id: number) => {
        if (!confirm('Delete transaction?')) return

        try {
            await del(`/api/admin/finance/transactions/${id}`)
            await load()
        } catch (e) {
            alert(
                e instanceof Error ? e.message : 'Failed to delete transaction',
            )
        }
    }

    return (
        <div className={`min-h-full space-y-6 ${c.page}`}>
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h2 className={`text-2xl font-bold ${c.textPrimary}`}>
                        Finance
                    </h2>

                    <p className={`mt-1 text-sm ${c.textMuted}`}>
                        Monitor revenue, expenses, cash flow, and financial transactions.
                    </p>
                </div>

                <button
                    onClick={() => {
                        setEditing(null)
                        setShow(true)
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
                >
                    <Plus className="h-4 w-4" />
                    Add Transaction
                </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Stat
                    icon={TrendingUp}
                    label="Total Revenue"
                    value={formatCurrency(summary.revenue)}
                    theme={theme}
                />

                <Stat
                    icon={TrendingDown}
                    label="Total Expense"
                    value={formatCurrency(summary.expense)}
                    theme={theme}
                />

                <Stat
                    icon={WalletCards}
                    label="Net Balance"
                    value={formatCurrency(summary.balance)}
                    theme={theme}
                />

                <Stat
                    icon={PiggyBank}
                    label="Transactions"
                    value={summary.transactions}
                    theme={theme}
                />
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <Flow
                    icon={CircleDollarSign}
                    label="Income"
                    value={summary.revenue}
                    theme={theme}
                />

                <Flow
                    icon={Receipt}
                    label="Expenses"
                    value={summary.expense}
                    theme={theme}
                />

                <Flow
                    icon={Calculator}
                    label="Net Result"
                    value={summary.balance}
                    theme={theme}
                />
            </div>

            <div
                className={`rounded-xl border ${c.border} ${c.surface} p-4`}
            >
                <div className="flex flex-col gap-3 lg:flex-row">
                    <div className="relative flex-1">
                        <Search
                            className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${c.textMuted}`}
                        />

                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search transaction..."
                            className={`w-full rounded-lg border ${c.border} ${c.input} ${c.textPrimary} ${c.placeholder} py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/10`}
                        />
                    </div>

                    <select
                        value={tf}
                        onChange={(e) =>
                            setTf(e.target.value as 'All' | Type)
                        }
                        className={`rounded-lg border ${c.border} ${c.input} ${c.textPrimary} px-4 py-2.5 text-sm outline-none transition focus:border-violet-500/60`}
                    >
                        <option value="All">All Types</option>
                        <option value="Revenue">Revenue</option>
                        <option value="Expense">Expense</option>
                    </select>

                    <select
                        value={sf}
                        onChange={(e) =>
                            setSf(e.target.value as 'All' | Status)
                        }
                        className={`rounded-lg border ${c.border} ${c.input} ${c.textPrimary} px-4 py-2.5 text-sm outline-none transition focus:border-violet-500/60`}
                    >
                        <option value="All">All Status</option>
                        <option value="Completed">Completed</option>
                        <option value="Pending">Pending</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            <div
                className={`overflow-hidden rounded-xl border ${c.border} ${c.surface}`}
            >
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1000px]">
                        <thead>
                            <tr
                                className={`border-b ${c.border} ${c.tableHeader}`}
                            >
                                {[
                                    'Transaction',
                                    'Date',
                                    'Category',
                                    'Type',
                                    'Amount',
                                    'Status',
                                    'Action',
                                ].map((h) => (
                                    <th
                                        key={h}
                                        className={`px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider ${c.textMuted}`}
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className={`p-12 text-center text-sm ${c.textMuted}`}
                                    >
                                        Loading...
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((x) => (
                                    <tr
                                        key={x.id}
                                        className={`border-b ${c.border} last:border-0 ${c.hover} transition-colors`}
                                    >
                                        <td className="px-5 py-4">
                                            <p
                                                className={`font-medium ${c.textPrimary}`}
                                            >
                                                {x.description}
                                            </p>

                                            <p className={`mt-1 text-xs ${c.textMuted}`}>
                                                {x.code}
                                                {x.project ? ` • ${x.project}` : ''}
                                            </p>
                                        </td>

                                        <td
                                            className={`px-5 py-4 text-sm ${c.textSecondary}`}
                                        >
                                            {formatDate(x.date)}
                                        </td>

                                        <td
                                            className={`px-5 py-4 text-sm ${c.textSecondary}`}
                                        >
                                            {x.category}
                                        </td>

                                        <td className="px-5 py-4">
                                            <span
                                                className={`inline-flex items-center gap-1 text-xs font-medium ${x.type === 'Revenue'
                                                        ? 'text-emerald-500'
                                                        : 'text-red-500'
                                                    }`}
                                            >
                                                {x.type === 'Revenue' ? (
                                                    <ArrowUpRight className="h-3.5 w-3.5" />
                                                ) : (
                                                    <ArrowDownRight className="h-3.5 w-3.5" />
                                                )}

                                                {x.type}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4">
                                            <span
                                                className={`text-sm font-semibold ${x.type === 'Revenue'
                                                        ? theme === 'light'
                                                            ? 'text-emerald-600'
                                                            : 'text-emerald-400'
                                                        : theme === 'light'
                                                            ? 'text-red-600'
                                                            : 'text-red-400'
                                                    }`}
                                            >
                                                {x.type === 'Expense' ? '-' : '+'}
                                                {formatCurrency(x.amount)}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4">
                                            <StatusBadge
                                                status={x.status}
                                                theme={theme}
                                            />
                                        </td>

                                        <td className="relative px-5 py-4">
                                            <button
                                                onClick={() =>
                                                    setMenu(menu === x.id ? null : x.id)
                                                }
                                                className={`rounded-lg p-2 ${c.textMuted} ${c.hover} transition`}
                                                aria-label={`Actions for ${x.description}`}
                                            >
                                                <MoreHorizontal className="h-4 w-4" />
                                            </button>

                                            {menu === x.id && (
                                                <div
                                                    className={`absolute right-5 top-12 z-20 w-40 rounded-lg border ${c.border} ${c.dropdown} p-1 shadow-2xl`}
                                                >
                                                    <button
                                                        onClick={() => {
                                                            setEditing(x)
                                                            setShow(true)
                                                            setMenu(null)
                                                        }}
                                                        className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm ${c.textSecondary} ${c.hover} transition`}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                        Edit
                                                    </button>

                                                    <button
                                                        onClick={() => {
                                                            remove(x.id)
                                                            setMenu(null)
                                                        }}
                                                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-500 transition hover:bg-red-500/10"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {!loading && !filtered.length && (
                    <div className={`p-12 text-center text-sm ${c.textMuted}`}>
                        No transactions found.
                    </div>
                )}
            </div>

            {show && (
                <TxModal
                    tx={editing}
                    projects={projects}
                    theme={theme}
                    onClose={() => {
                        setShow(false)
                        setEditing(null)
                    }}
                    onSave={save}
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
}: {
    icon: any
    label: string
    value: any
    theme: 'dark' | 'light'
}) {
    const c = getThemeTokens(theme)

    return (
        <div
            className={`rounded-xl border ${c.border} ${c.surface} p-5 transition hover:-translate-y-0.5`}
        >
            <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                    <p className={`text-sm ${c.textMuted}`}>{label}</p>

                    <p
                        className={`mt-2 truncate text-xl font-bold ${c.textPrimary}`}
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

function Flow({
    icon: Icon,
    label,
    value,
    theme,
}: {
    icon: any
    label: string
    value: number
    theme: 'dark' | 'light'
}) {
    const c = getThemeTokens(theme)

    return (
        <div
            className={`rounded-xl border ${c.border} ${c.surface} p-5`}
        >
            <div className="flex items-center gap-3">
                <div className="rounded-lg bg-violet-500/10 p-3 text-violet-500">
                    <Icon className="h-5 w-5" />
                </div>

                <div>
                    <p className={`text-sm ${c.textMuted}`}>{label}</p>

                    <p className={`mt-1 text-lg font-bold ${c.textPrimary}`}>
                        {formatCurrency(value)}
                    </p>
                </div>
            </div>
        </div>
    )
}

function StatusBadge({
    status,
    theme,
}: {
    status: Status
    theme: 'dark' | 'light'
}) {
    const styles: Record<
        Status,
        {
            dark: string
            light: string
            dot: string
        }
    > = {
        Completed: {
            dark: 'bg-emerald-500/10 text-emerald-400',
            light: 'bg-emerald-50 text-emerald-700',
            dot: 'bg-emerald-500',
        },
        Pending: {
            dark: 'bg-amber-500/10 text-amber-400',
            light: 'bg-amber-50 text-amber-700',
            dot: 'bg-amber-500',
        },
        Cancelled: {
            dark: 'bg-red-500/10 text-red-400',
            light: 'bg-red-50 text-red-700',
            dot: 'bg-red-500',
        },
    }

    const current = styles[status]

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${theme === 'light' ? current.light : current.dark
                }`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${current.dot}`} />
            {status}
        </span>
    )
}

function TxModal({
    tx,
    projects,
    theme,
    onClose,
    onSave,
}: {
    tx: Tx | null
    projects: Project[]
    theme: 'dark' | 'light'
    onClose: () => void
    onSave: (v: any) => void
}) {
    const c = getThemeTokens(theme)

    const [v, setV] = useState<any>({
        description: tx?.description || '',
        category: tx?.category || 'Project Revenue',
        type: tx?.type || 'Revenue',
        amount: tx?.amount || '',
        date:
            tx?.date ||
            new Date().toISOString().slice(0, 10),
        status: tx?.status || 'Completed',
        project_id: tx?.project_id || '',
    })

    const updateField = (key: string, value: any) => {
        setV((prev: any) => ({
            ...prev,
            [key]: value,
        }))
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div
                className={`w-full max-w-lg overflow-hidden rounded-2xl border ${c.border} ${c.surface} shadow-2xl`}
            >
                <div
                    className={`flex items-center justify-between border-b ${c.border} p-5`}
                >
                    <div>
                        <h3 className={`font-semibold ${c.textPrimary}`}>
                            {tx ? 'Edit Transaction' : 'Add Transaction'}
                        </h3>

                        <p className={`mt-1 text-xs ${c.textMuted}`}>
                            Manage financial transaction details.
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className={`rounded-lg p-2 ${c.textMuted} ${c.hover} transition`}
                        aria-label="Close modal"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form
                    onSubmit={(e) => {
                        e.preventDefault()

                        if (!v.description || Number(v.amount) <= 0) {
                            return
                        }

                        onSave({
                            ...v,
                            amount: Number(v.amount),
                            project_id: v.project_id || null,
                        })
                    }}
                    className="grid gap-4 p-5"
                >
                    <label>
                        <span className={`mb-1.5 block text-xs ${c.textSecondary}`}>
                            Description
                        </span>

                        <input
                            required
                            type="text"
                            value={v.description}
                            onChange={(e) =>
                                updateField('description', e.target.value)
                            }
                            placeholder="e.g. Client payment"
                            className={`w-full rounded-lg border ${c.border} ${c.input} ${c.textPrimary} ${c.placeholder} px-3 py-2.5 text-sm outline-none transition focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/10`}
                        />
                    </label>

                    <label>
                        <span className={`mb-1.5 block text-xs ${c.textSecondary}`}>
                            Category
                        </span>

                        <input
                            required
                            type="text"
                            value={v.category}
                            onChange={(e) =>
                                updateField('category', e.target.value)
                            }
                            placeholder="e.g. Project Revenue"
                            className={`w-full rounded-lg border ${c.border} ${c.input} ${c.textPrimary} ${c.placeholder} px-3 py-2.5 text-sm outline-none transition focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/10`}
                        />
                    </label>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <label>
                            <span className={`mb-1.5 block text-xs ${c.textSecondary}`}>
                                Amount
                            </span>

                            <input
                                required
                                min="1"
                                step="1"
                                type="number"
                                value={v.amount}
                                onChange={(e) =>
                                    updateField('amount', e.target.value)
                                }
                                placeholder="0"
                                className={`w-full rounded-lg border ${c.border} ${c.input} ${c.textPrimary} ${c.placeholder} px-3 py-2.5 text-sm outline-none transition focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/10`}
                            />
                        </label>

                        <label>
                            <span className={`mb-1.5 block text-xs ${c.textSecondary}`}>
                                Date
                            </span>

                            <input
                                required
                                type="date"
                                value={v.date}
                                onChange={(e) =>
                                    updateField('date', e.target.value)
                                }
                                className={`w-full rounded-lg border ${c.border} ${c.input} ${c.textPrimary} px-3 py-2.5 text-sm outline-none transition focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/10`}
                            />
                        </label>
                    </div>

                    <label>
                        <span className={`mb-1.5 block text-xs ${c.textSecondary}`}>
                            Type
                        </span>

                        <select
                            value={v.type}
                            onChange={(e) =>
                                updateField('type', e.target.value)
                            }
                            className={`w-full rounded-lg border ${c.border} ${c.input} ${c.textPrimary} px-3 py-2.5 text-sm outline-none transition focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/10`}
                        >
                            <option value="Revenue">Revenue</option>
                            <option value="Expense">Expense</option>
                        </select>
                    </label>

                    <label>
                        <span className={`mb-1.5 block text-xs ${c.textSecondary}`}>
                            Project
                        </span>

                        <select
                            value={v.project_id}
                            onChange={(e) =>
                                updateField('project_id', e.target.value)
                            }
                            className={`w-full rounded-lg border ${c.border} ${c.input} ${c.textPrimary} px-3 py-2.5 text-sm outline-none transition focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/10`}
                        >
                            <option value="">No project</option>

                            {projects.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label>
                        <span className={`mb-1.5 block text-xs ${c.textSecondary}`}>
                            Status
                        </span>

                        <select
                            value={v.status}
                            onChange={(e) =>
                                updateField('status', e.target.value)
                            }
                            className={`w-full rounded-lg border ${c.border} ${c.input} ${c.textPrimary} px-3 py-2.5 text-sm outline-none transition focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/10`}
                        >
                            <option value="Completed">Completed</option>
                            <option value="Pending">Pending</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </label>

                    <div
                        className={`mt-2 flex justify-end gap-3 border-t ${c.border} pt-4`}
                    >
                        <button
                            type="button"
                            onClick={onClose}
                            className={`rounded-lg border ${c.border} ${c.textSecondary} px-4 py-2.5 text-sm transition ${c.hover}`}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
                        >
                            Save Transaction
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}