import { useEffect, useMemo, useState } from 'react'
import {
    Plus,
    Search,
    FolderKanban,
    Clock3,
    CheckCircle2,
    AlertCircle,
    MoreHorizontal,
    Pencil,
    X,
    Users,
} from 'lucide-react'
import {
    get,
    post,
    put,
    formatCurrency,
    formatDate,
} from '@/utils/businessApi'

type Status =
    | 'Planning'
    | 'In Progress'
    | 'Revision'
    | 'Completed'
    | 'Cancelled'

interface Member {
    id: number
    name: string
    role: string
    contribution_percent: number
    status?: string
}

interface Project {
    id: number
    code: string
    name: string
    customer: string
    value: number
    status: Status
    deadline: string
    type?: string
    team: Member[]
}

const styles: Record<Status, string> = {
    Planning: 'bg-blue-500/10 text-blue-400',
    'In Progress': 'bg-purple-500/10 text-purple-400',
    Revision: 'bg-orange-500/10 text-orange-400',
    Completed: 'bg-green-500/10 text-green-400',
    Cancelled: 'bg-red-500/10 text-red-400',
}

export function AdminProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([])
    const [members, setMembers] = useState<Member[]>([])
    const [search, setSearch] = useState('')
    const [status, setStatus] = useState<'All' | Status>('All')
    const [show, setShow] = useState(false)
    const [editing, setEditing] = useState<Project | null>(null)
    const [menu, setMenu] = useState<number | null>(null)
    const [loading, setLoading] = useState(true)

    const load = async () => {
        setLoading(true)

        try {
            const [p, m] = await Promise.all([
                get<{ data: Project[] }>('/api/admin/projects'),
                get<{ data: Member[] }>('/api/admin/members'),
            ])

            setProjects(p.data)
            setMembers(m.data)
        } catch (e) {
            alert(
                e instanceof Error
                    ? e.message
                    : 'Failed to load projects',
            )
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        load()
    }, [])

    const filtered = useMemo(() => {
        return projects.filter(
            (p) =>
                (p.name + ' ' + p.code + ' ' + p.customer)
                    .toLowerCase()
                    .includes(search.toLowerCase()) &&
                (status === 'All' || p.status === status),
        )
    }, [projects, search, status])

    const save = async (v: any) => {
        try {
            if (editing) {
                await put(`/api/admin/projects/${editing.id}`, v)
            } else {
                await post('/api/admin/projects', v)
            }

            setShow(false)
            setEditing(null)
            await load()
        } catch (e) {
            alert(
                e instanceof Error
                    ? e.message
                    : 'Failed to save project',
            )
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h2 className="text-2xl font-bold text-text-primary">
                        Projects
                    </h2>

                    <p className="mt-1 text-sm text-text-muted">
                        Track production projects, team assignments, and
                        project value.
                    </p>
                </div>

                <button
                    onClick={() => {
                        setEditing(null)
                        setShow(true)
                    }}
                    className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white"
                >
                    <Plus className="h-4 w-4" />
                    New Project
                </button>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Stat
                    icon={FolderKanban}
                    label="Total Projects"
                    value={projects.length}
                />

                <Stat
                    icon={Clock3}
                    label="Active"
                    value={
                        projects.filter(
                            (p) =>
                                p.status === 'In Progress' ||
                                p.status === 'Revision',
                        ).length
                    }
                />

                <Stat
                    icon={CheckCircle2}
                    label="Completed"
                    value={
                        projects.filter(
                            (p) => p.status === 'Completed',
                        ).length
                    }
                />

                <Stat
                    icon={AlertCircle}
                    label="Project Value"
                    value={formatCurrency(
                        projects.reduce(
                            (s, p) => s + p.value,
                            0,
                        ),
                    )}
                />
            </div>

            {/* Filters */}
            <div className="rounded-xl border border-border-default bg-bg-surface p-4">
                <div className="flex flex-col gap-3 md:flex-row">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />

                        <input
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            placeholder="Search project..."
                            className="w-full rounded-lg border border-border-default bg-bg-base py-2.5 pl-10 pr-4 text-sm text-text-primary"
                        />
                    </div>

                    <select
                        value={status}
                        onChange={(e) =>
                            setStatus(e.target.value as 'All' | Status)
                        }
                        className="rounded-lg border border-border-default bg-bg-base px-4 py-2.5 text-sm text-text-primary"
                    >
                        <option value="All">All</option>

                        {Object.keys(styles).map((x) => (
                            <option key={x} value={x}>
                                {x}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Projects Table */}
            <div className="overflow-hidden rounded-xl border border-border-default bg-bg-surface">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[950px]">
                        <thead>
                            <tr className="border-b border-border-default bg-bg-elevated/50">
                                {[
                                    'Project',
                                    'Customer',
                                    'Value',
                                    'Team',
                                    'Status',
                                    'Deadline',
                                    'Action',
                                ].map((h) => (
                                    <th
                                        key={h}
                                        className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-text-muted"
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
                                        className="p-12 text-center text-sm text-text-muted"
                                    >
                                        Loading...
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((p) => (
                                    <tr
                                        key={p.id}
                                        className="border-b border-border-default last:border-0 hover:bg-bg-elevated/30"
                                    >
                                        {/* Project */}
                                        <td className="px-5 py-4">
                                            <p className="font-medium text-text-primary">
                                                {p.name}
                                            </p>

                                            <p className="text-xs text-text-muted">
                                                {p.code}
                                            </p>
                                        </td>

                                        {/* Customer */}
                                        <td className="px-5 py-4 text-sm text-text-secondary">
                                            {p.customer}
                                        </td>

                                        {/* Value */}
                                        <td className="px-5 py-4 text-sm font-medium text-text-primary">
                                            {formatCurrency(p.value)}
                                        </td>

                                        {/* Team */}
                                        <td className="px-5 py-4">
                                            <div className="flex -space-x-2">
                                                {p.team?.map((m) => (
                                                    <div
                                                        title={`${m.name} ${m.contribution_percent}%`}
                                                        key={m.id}
                                                        className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-bg-surface bg-brand-primary/20 text-[10px] font-semibold text-brand-primary"
                                                    >
                                                        {m.name
                                                            .split(' ')
                                                            .map((x) => x[0])
                                                            .join('')
                                                            .slice(0, 2)}
                                                    </div>
                                                ))}
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="px-5 py-4">
                                            <span
                                                className={`rounded-full px-2.5 py-1 text-xs font-medium ${styles[p.status]}`}
                                            >
                                                {p.status}
                                            </span>
                                        </td>

                                        {/* Deadline */}
                                        <td className="px-5 py-4 text-sm text-text-secondary">
                                            {formatDate(p.deadline)}
                                        </td>

                                        {/* Action */}
                                        <td className="relative px-5 py-4">
                                            <button
                                                onClick={() =>
                                                    setMenu(
                                                        menu === p.id
                                                            ? null
                                                            : p.id,
                                                    )
                                                }
                                                className="rounded-lg p-2 text-text-muted hover:bg-bg-elevated"
                                            >
                                                <MoreHorizontal className="h-4 w-4" />
                                            </button>

                                            {menu === p.id && (
                                                <div className="absolute right-5 top-12 z-20 w-32 rounded-lg border border-border-default bg-bg-surface p-1 shadow-xl">
                                                    <button
                                                        onClick={() => {
                                                            setEditing(p)
                                                            setShow(true)
                                                            setMenu(null)
                                                        }}
                                                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-text-secondary hover:bg-bg-elevated"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                        Edit
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
                    <div className="p-12 text-center text-sm text-text-muted">
                        No projects found.
                    </div>
                )}
            </div>

            {/* Modal */}
            {show && (
                <ProjectModal
                    project={editing}
                    members={members}
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
}: {
    icon: any
    label: string
    value: any
}) {
    return (
        <div className="rounded-xl border border-border-default bg-bg-surface p-5">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-text-muted">
                        {label}
                    </p>

                    <p className="mt-2 text-xl font-bold text-text-primary">
                        {value}
                    </p>
                </div>

                <div className="rounded-lg bg-brand-primary/10 p-3 text-brand-primary">
                    <Icon className="h-5 w-5" />
                </div>
            </div>
        </div>
    )
}

function ProjectModal({
    project,
    members,
    onClose,
    onSave,
}: {
    project: Project | null
    members: Member[]
    onClose: () => void
    onSave: (v: any) => void
}) {
    const [v, setV] = useState<any>({
        name: project?.name || '',
        customer: project?.customer || '',
        value: project?.value || '',
        deadline: project?.deadline || '',
        status: project?.status || 'Planning',
        type: project?.type || 'Custom',
        member_ids:
            project?.team?.map((m) => m.id) || [],
        contributions:
            project?.team?.map(
                (m) => m.contribution_percent,
            ) || [],
    })

    const toggle = (id: number) => {
        const i = v.member_ids.indexOf(id)

        if (i >= 0) {
            setV({
                ...v,
                member_ids: v.member_ids.filter(
                    (x: number) => x !== id,
                ),
                contributions: v.contributions.filter(
                    (_: any, j: number) => j !== i,
                ),
            })
        } else {
            setV({
                ...v,
                member_ids: [...v.member_ids, id],
                contributions: [
                    ...v.contributions,
                    0,
                ],
            })
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border-default bg-bg-surface shadow-2xl">
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-border-default p-5">
                    <h3 className="font-semibold text-text-primary">
                        {project
                            ? 'Edit Project'
                            : 'New Project'}
                    </h3>

                    <button onClick={onClose}>
                        <X className="h-5 w-5 text-text-muted" />
                    </button>
                </div>

                {/* Form */}
                <form
                    onSubmit={(e) => {
                        e.preventDefault()

                        const total =
                            v.contributions.reduce(
                                (s: number, n: number) =>
                                    s + Number(n || 0),
                                0,
                            )

                        if (
                            !v.name ||
                            !v.customer ||
                            !v.value ||
                            !v.deadline ||
                            Math.abs(total - 100) > 0.01
                        ) {
                            return alert(
                                'Project member contribution must total exactly 100%.',
                            )
                        }

                        onSave({
                            ...v,
                            value: Number(v.value),
                        })
                    }}
                    className="space-y-4 p-5"
                >
                    {[
                        ['Project name', 'name', 'text'],
                        ['Customer', 'customer', 'text'],
                        ['Project value', 'value', 'number'],
                        ['Deadline', 'deadline', 'date'],
                        ['Type', 'type', 'text'],
                    ].map(([l, k, t]) => (
                        <label
                            key={k}
                            className="block"
                        >
                            <span className="mb-1.5 block text-xs font-medium text-text-secondary">
                                {l}
                            </span>

                            <input
                                required
                                type={t}
                                value={v[k]}
                                onChange={(e) =>
                                    setV({
                                        ...v,
                                        [k]: e.target.value,
                                    })
                                }
                                className="w-full rounded-lg border border-border-default bg-bg-base px-3 py-2.5 text-sm text-text-primary"
                            />
                        </label>
                    ))}

                    {/* Status */}
                    <label className="block">
                        <span className="mb-1.5 block text-xs font-medium text-text-secondary">
                            Status
                        </span>

                        <select
                            value={v.status}
                            onChange={(e) =>
                                setV({
                                    ...v,
                                    status: e.target.value,
                                })
                            }
                            className="w-full rounded-lg border border-border-default bg-bg-base px-3 py-2.5 text-sm text-text-primary"
                        >
                            {Object.keys(styles).map((x) => (
                                <option key={x} value={x}>
                                    {x}
                                </option>
                            ))}
                        </select>
                    </label>

                    {/* Team */}
                    <div>
                        <div className="mb-2 flex items-center justify-between">
                            <span className="text-xs font-medium text-text-secondary">
                                Team & contribution
                            </span>

                            <Users className="h-4 w-4 text-text-muted" />
                        </div>

                        <div className="space-y-2">
                            {members
                                .filter(
                                    (m) => m.status !== 'Inactive',
                                )
                                .map((m) => {
                                    const i =
                                        v.member_ids.indexOf(m.id)

                                    return (
                                        <div
                                            key={m.id}
                                            className="flex items-center gap-3 rounded-lg border border-border-default bg-bg-base p-3"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={i >= 0}
                                                onChange={() =>
                                                    toggle(m.id)
                                                }
                                            />

                                            <span className="flex-1 text-sm text-text-primary">
                                                {m.name}
                                            </span>

                                            {i >= 0 && (
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="100"
                                                    value={
                                                        v.contributions[i]
                                                    }
                                                    onChange={(e) => {
                                                        const c = [
                                                            ...v.contributions,
                                                        ]

                                                        c[i] = Number(
                                                            e.target.value,
                                                        )

                                                        setV({
                                                            ...v,
                                                            contributions: c,
                                                        })
                                                    }}
                                                    className="w-20 rounded border border-border-default bg-bg-surface px-2 py-1 text-sm text-text-primary"
                                                />
                                            )}

                                            <span className="text-xs text-text-muted">
                                                %
                                            </span>
                                        </div>
                                    )
                                })}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-border-default px-4 py-2.5 text-sm text-text-secondary"
                        >
                            Cancel
                        </button>

                        <button className="rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white">
                            Save Project
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}