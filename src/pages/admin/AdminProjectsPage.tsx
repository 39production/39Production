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

type ThemeMode = 'dark' | 'light'

/* =========================================================
   THEME HOOK
========================================================= */

function useAdminTheme(): ThemeMode {
    const [theme, setTheme] =
        useState<ThemeMode>(() => {
            if (
                typeof window ===
                'undefined'
            ) {
                return 'dark'
            }

            const stored =
                window.localStorage.getItem(
                    '39production_admin_theme',
                )

            return stored === 'light'
                ? 'light'
                : 'dark'
        })

    useEffect(() => {
        const syncTheme = () => {
            const datasetTheme =
                document.documentElement
                    .dataset.adminTheme

            if (
                datasetTheme === 'light' ||
                datasetTheme === 'dark'
            ) {
                setTheme(
                    datasetTheme,
                )

                return
            }

            const stored =
                window.localStorage.getItem(
                    '39production_admin_theme',
                )

            setTheme(
                stored === 'light'
                    ? 'light'
                    : 'dark',
            )
        }

        syncTheme()

        const observer =
            new MutationObserver(
                syncTheme,
            )

        observer.observe(
            document.documentElement,
            {
                attributes: true,
                attributeFilter: [
                    'data-admin-theme',
                ],
            },
        )

        const handleStorage =
            () => {
                syncTheme()
            }

        window.addEventListener(
            'storage',
            handleStorage,
        )

        return () => {
            observer.disconnect()

            window.removeEventListener(
                'storage',
                handleStorage,
            )
        }
    }, [])

    return theme
}

/* =========================================================
   STATUS STYLES
========================================================= */

const statusStyles = (
    status: Status,
    isDark: boolean,
) => {
    if (status === 'Planning') {
        return isDark
            ? 'bg-blue-500/10 text-blue-400'
            : 'bg-blue-50 text-blue-700'
    }

    if (
        status === 'In Progress'
    ) {
        return isDark
            ? 'bg-violet-500/10 text-violet-400'
            : 'bg-violet-50 text-violet-700'
    }

    if (status === 'Revision') {
        return isDark
            ? 'bg-amber-500/10 text-amber-400'
            : 'bg-amber-50 text-amber-700'
    }

    if (status === 'Completed') {
        return isDark
            ? 'bg-emerald-500/10 text-emerald-400'
            : 'bg-emerald-50 text-emerald-700'
    }

    return isDark
        ? 'bg-red-500/10 text-red-400'
        : 'bg-red-50 text-red-700'
}

/* =========================================================
   PAGE
========================================================= */

export function AdminProjectsPage() {
    const theme =
        useAdminTheme()

    const isDark =
        theme === 'dark'

    const [projects, setProjects] =
        useState<Project[]>([])

    const [members, setMembers] =
        useState<Member[]>([])

    const [search, setSearch] =
        useState('')

    const [status, setStatus] =
        useState<'All' | Status>(
            'All',
        )

    const [show, setShow] =
        useState(false)

    const [editing, setEditing] =
        useState<Project | null>(
            null,
        )

    const [menu, setMenu] =
        useState<number | null>(
            null,
        )

    const [loading, setLoading] =
        useState(true)

    /*
     * =======================================================
     * THEME TOKENS
     * =======================================================
     */

    const pageText = isDark
        ? 'text-white'
        : 'text-neutral-950'

    const secondaryText =
        isDark
            ? 'text-white/55'
            : 'text-neutral-600'

    const mutedText = isDark
        ? 'text-white/30'
        : 'text-neutral-400'

    const cardBg = isDark
        ? 'bg-[#15151b]'
        : 'bg-white'

    const inputBg = isDark
        ? 'bg-[#0f0f13]'
        : 'bg-neutral-50'

    const border = isDark
        ? 'border-white/[0.08]'
        : 'border-neutral-200'

    const divider = isDark
        ? 'border-white/[0.06]'
        : 'border-neutral-100'

    const rowHover = isDark
        ? 'hover:bg-white/[0.02]'
        : 'hover:bg-neutral-50/80'

    /*
     * =======================================================
     * LOAD
     * =======================================================
     */

    const load = async () => {
        setLoading(true)

        try {
            const [p, m] =
                await Promise.all([
                    get<{
                        data: Project[]
                    }>(
                        '/api/admin/projects',
                    ),

                    get<{
                        data: Member[]
                    }>(
                        '/api/admin/members',
                    ),
                ])

            setProjects(
                Array.isArray(
                    p.data,
                )
                    ? p.data
                    : [],
            )

            setMembers(
                Array.isArray(
                    m.data,
                )
                    ? m.data
                    : [],
            )
        } catch (e) {
            alert(
                e instanceof
                    Error
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

    /*
     * =======================================================
     * FILTER
     * =======================================================
     */

    const filtered =
        useMemo(() => {
            const query =
                search
                    .toLowerCase()
                    .trim()

            return projects.filter(
                (p) =>
                    (
                        p.name +
                        ' ' +
                        p.code +
                        ' ' +
                        p.customer
                    )
                        .toLowerCase()
                        .includes(
                            query,
                        ) &&
                    (
                        status ===
                        'All' ||
                        p.status ===
                        status
                    ),
            )
        }, [
            projects,
            search,
            status,
        ])

    /*
     * =======================================================
     * SAVE
     * =======================================================
     */

    const save = async (
        value: any,
    ) => {
        try {
            if (editing) {
                await put(
                    `/api/admin/projects/${editing.id}`,
                    value,
                )
            } else {
                await post(
                    '/api/admin/projects',
                    value,
                )
            }

            setShow(false)
            setEditing(null)
            setMenu(null)

            await load()
        } catch (e) {
            alert(
                e instanceof
                    Error
                    ? e.message
                    : 'Failed to save project',
            )
        }
    }

    /*
     * =======================================================
     * STATS
     * =======================================================
     */

    const activeProjects =
        projects.filter(
            (p) =>
                p.status ===
                'In Progress' ||
                p.status ===
                'Revision',
        ).length

    const completedProjects =
        projects.filter(
            (p) =>
                p.status ===
                'Completed',
        ).length

    const totalProjectValue =
        projects.reduce(
            (
                total,
                project,
            ) =>
                total +
                Number(
                    project.value ||
                    0,
                ),
            0,
        )

    return (
        <div
            className={`
                space-y-8
                ${pageText}
            `}
        >
            {/* =================================================
                HEADER
            ================================================= */}
            <div
                className="
                    flex
                    flex-col
                    justify-between
                    gap-4
                    sm:flex-row
                    sm:items-end
                "
            >
                <div>
                    <p
                        className="
                            text-[10px]
                            font-bold
                            uppercase
                            tracking-[0.18em]
                            text-violet-500
                        "
                    >
                        Business
                    </p>

                    <h2
                        className="
                            mt-1
                            text-3xl
                            font-bold
                            tracking-[-0.035em]
                        "
                    >
                        Projects
                    </h2>

                    <p
                        className={`
                            mt-2
                            max-w-2xl
                            text-sm
                            leading-6

                            ${secondaryText}
                        `}
                    >
                        Track production
                        projects, team
                        assignments, and
                        project value.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => {
                        setEditing(
                            null,
                        )

                        setShow(true)
                    }}
                    className="
                        inline-flex
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        bg-violet-600
                        px-4
                        py-2.5
                        text-sm
                        font-semibold
                        text-white
                        shadow-[0_8px_24px_rgba(124,58,237,0.18)]
                        transition-all
                        hover:-translate-y-0.5
                        hover:bg-violet-700
                    "
                >
                    <Plus className="h-4 w-4" />

                    New Project
                </button>
            </div>

            {/* =================================================
                STATS
            ================================================= */}
            <div
                className="
                    grid
                    gap-4
                    sm:grid-cols-2
                    lg:grid-cols-4
                "
            >
                <Stat
                    icon={FolderKanban}
                    label="Total Projects"
                    value={
                        projects.length
                    }
                    isDark={isDark}
                    accent="violet"
                />

                <Stat
                    icon={Clock3}
                    label="Active"
                    value={
                        activeProjects
                    }
                    isDark={isDark}
                    accent="blue"
                />

                <Stat
                    icon={
                        CheckCircle2
                    }
                    label="Completed"
                    value={
                        completedProjects
                    }
                    isDark={isDark}
                    accent="green"
                />

                <Stat
                    icon={
                        AlertCircle
                    }
                    label="Project Value"
                    value={formatCurrency(
                        totalProjectValue,
                    )}
                    isDark={isDark}
                    accent="amber"
                />
            </div>

            {/* =================================================
                FILTERS
            ================================================= */}
            <div
                className={`
                    rounded-2xl
                    border
                    p-5

                    ${cardBg}
                    ${border}
                `}
            >
                <div className="grid gap-4 md:grid-cols-[1fr_220px]">
                    <div className="relative">
                        <Search
                            className={`
                                absolute
                                left-3
                                top-1/2
                                h-4
                                w-4
                                -translate-y-1/2

                                ${mutedText}
                            `}
                        />

                        <input
                            value={
                                search
                            }
                            onChange={(
                                event,
                            ) =>
                                setSearch(
                                    event
                                        .target
                                        .value,
                                )
                            }
                            placeholder="Search project, code, or customer..."
                            className={`
                                w-full
                                rounded-xl
                                border
                                py-3
                                pl-10
                                pr-4
                                text-sm
                                outline-none
                                transition-colors

                                ${border}
                                ${inputBg}
                                ${pageText}

                                ${isDark
                                    ? 'placeholder:text-white/25 focus:border-violet-500/50'
                                    : 'placeholder:text-neutral-400 focus:border-violet-400'
                                }
                            `}
                        />
                    </div>

                    <select
                        value={
                            status
                        }
                        onChange={(
                            event,
                        ) =>
                            setStatus(
                                event.target
                                    .value as
                                | 'All'
                                | Status,
                            )
                        }
                        className={`
                            rounded-xl
                            border
                            px-4
                            py-3
                            text-sm
                            outline-none
                            transition-colors

                            ${border}
                            ${inputBg}
                            ${pageText}

                            ${isDark
                                ? 'focus:border-violet-500/50'
                                : 'focus:border-violet-400'
                            }
                        `}
                    >
                        <option value="All">
                            All Status
                        </option>

                        {Object.keys(
                            statusStylesMap,
                        ).map(
                            (
                                value,
                            ) => (
                                <option
                                    key={
                                        value
                                    }
                                    value={
                                        value
                                    }
                                >
                                    {
                                        value
                                    }
                                </option>
                            ),
                        )}
                    </select>
                </div>
            </div>

            {/* =================================================
                PROJECTS TABLE
            ================================================= */}
            <div
                className={`
                    overflow-visible
                    rounded-2xl
                    border

                    ${cardBg}
                    ${border}
                `}
            >
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[950px]">
                        <thead
                            className={`
                                border-b

                                ${divider}

                                ${isDark
                                    ? 'bg-white/[0.02]'
                                    : 'bg-neutral-50'
                                }
                            `}
                        >
                            <tr>
                                {[
                                    'Project',
                                    'Customer',
                                    'Value',
                                    'Team',
                                    'Status',
                                    'Deadline',
                                    'Action',
                                ].map(
                                    (
                                        heading,
                                    ) => (
                                        <th
                                            key={
                                                heading
                                            }
                                            className={`
                                                px-5
                                                py-4
                                                text-left
                                                text-[10px]
                                                font-bold
                                                uppercase
                                                tracking-[0.12em]

                                                ${mutedText}
                                            `}
                                        >
                                            {
                                                heading
                                            }
                                        </th>
                                    ),
                                )}
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan={
                                            7
                                        }
                                        className={`
                                            p-16
                                            text-center
                                            text-sm

                                            ${mutedText}
                                        `}
                                    >
                                        <div className="flex items-center justify-center gap-3">
                                            <div
                                                className="
                                                    h-4
                                                    w-4
                                                    animate-spin
                                                    rounded-full
                                                    border-2
                                                    border-violet-500
                                                    border-t-transparent
                                                "
                                            />

                                            Loading
                                            projects...
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map(
                                    (
                                        project,
                                    ) => (
                                        <tr
                                            key={
                                                project.id
                                            }
                                            className={`
                                                border-b
                                                transition-colors
                                                last:border-0

                                                ${divider}
                                                ${rowHover}
                                            `}
                                        >
                                            {/* Project */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-start gap-3">
                                                    <div
                                                        className="
                                                            mt-0.5
                                                            flex
                                                            h-9
                                                            w-9
                                                            shrink-0
                                                            items-center
                                                            justify-center
                                                            rounded-lg
                                                            bg-violet-500/10
                                                            text-violet-500
                                                        "
                                                    >
                                                        <FolderKanban className="h-4 w-4" />
                                                    </div>

                                                    <div>
                                                        <p className="font-semibold">
                                                            {
                                                                project.name
                                                            }
                                                        </p>

                                                        <p
                                                            className={`
                                                                mt-0.5
                                                                text-xs

                                                                ${mutedText}
                                                            `}
                                                        >
                                                            {
                                                                project.code
                                                            }
                                                        </p>

                                                        {project.type && (
                                                            <span
                                                                className={`
                                                                    mt-2
                                                                    inline-flex
                                                                    rounded-full
                                                                    px-2
                                                                    py-0.5
                                                                    text-[10px]
                                                                    font-medium

                                                                    ${isDark
                                                                        ? 'bg-white/[0.05] text-white/45'
                                                                        : 'bg-neutral-100 text-neutral-500'
                                                                    }
                                                                `}
                                                            >
                                                                {
                                                                    project.type
                                                                }
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Customer */}
                                            <td
                                                className={`
                                                    px-5
                                                    py-4
                                                    text-sm

                                                    ${secondaryText}
                                                `}
                                            >
                                                {
                                                    project.customer
                                                }
                                            </td>

                                            {/* Value */}
                                            <td className="px-5 py-4">
                                                <p className="text-sm font-semibold">
                                                    {formatCurrency(
                                                        project.value,
                                                    )}
                                                </p>
                                            </td>

                                            {/* Team */}
                                            <td className="px-5 py-4">
                                                {project.team &&
                                                    project
                                                        .team
                                                        .length >
                                                    0 ? (
                                                    <div className="flex items-center">
                                                        <div className="flex -space-x-2">
                                                            {project.team
                                                                .slice(
                                                                    0,
                                                                    4,
                                                                )
                                                                .map(
                                                                    (
                                                                        member,
                                                                    ) => (
                                                                        <div
                                                                            title={`${member.name} ${member.contribution_percent}%`}
                                                                            key={
                                                                                member.id
                                                                            }
                                                                            className={`
                                                                                flex
                                                                                h-8
                                                                                w-8
                                                                                items-center
                                                                                justify-center
                                                                                rounded-full
                                                                                border-2
                                                                                text-[10px]
                                                                                font-bold

                                                                                ${isDark
                                                                                    ? 'border-[#15151b] bg-violet-500/15 text-violet-300'
                                                                                    : 'border-white bg-violet-50 text-violet-700'
                                                                                }
                                                                            `}
                                                                        >
                                                                            {member.name
                                                                                .split(
                                                                                    ' ',
                                                                                )
                                                                                .map(
                                                                                    (
                                                                                        part,
                                                                                    ) =>
                                                                                        part[0],
                                                                                )
                                                                                .join(
                                                                                    '',
                                                                                )
                                                                                .slice(
                                                                                    0,
                                                                                    2,
                                                                                )}
                                                                        </div>
                                                                    ),
                                                                )}
                                                        </div>

                                                        {project
                                                            .team
                                                            .length >
                                                            4 && (
                                                                <span
                                                                    className={`
                                                                    ml-2
                                                                    text-xs

                                                                    ${mutedText}
                                                                `}
                                                                >
                                                                    +
                                                                    {project
                                                                        .team
                                                                        .length -
                                                                        4}
                                                                </span>
                                                            )}
                                                    </div>
                                                ) : (
                                                    <span
                                                        className={`
                                                            text-xs

                                                            ${mutedText}
                                                        `}
                                                    >
                                                        No team
                                                    </span>
                                                )}
                                            </td>

                                            {/* Status */}
                                            <td className="px-5 py-4">
                                                <span
                                                    className={`
                                                        inline-flex
                                                        rounded-full
                                                        px-2.5
                                                        py-1
                                                        text-xs
                                                        font-semibold

                                                        ${statusStyles(
                                                        project.status,
                                                        isDark,
                                                    )}
                                                    `}
                                                >
                                                    {
                                                        project.status
                                                    }
                                                </span>
                                            </td>

                                            {/* Deadline */}
                                            <td
                                                className={`
                                                    px-5
                                                    py-4
                                                    text-sm

                                                    ${secondaryText}
                                                `}
                                            >
                                                {formatDate(
                                                    project.deadline,
                                                )}
                                            </td>

                                            {/* Action */}
                                            <td className="relative px-5 py-4">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setMenu(
                                                            menu ===
                                                                project.id
                                                                ? null
                                                                : project.id,
                                                        )
                                                    }
                                                    className={`
                                                        rounded-lg
                                                        border
                                                        p-2
                                                        transition-all

                                                        ${border}

                                                        ${isDark
                                                            ? 'text-white/45 hover:bg-white/[0.05] hover:text-white'
                                                            : 'text-neutral-400 hover:bg-neutral-50 hover:text-neutral-950'
                                                        }
                                                    `}
                                                    aria-label={`Actions for ${project.name}`}
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </button>

                                                {menu ===
                                                    project.id && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                aria-label="Close project actions"
                                                                className="
                                                                fixed
                                                                inset-0
                                                                z-10
                                                                cursor-default
                                                            "
                                                                onClick={() =>
                                                                    setMenu(
                                                                        null,
                                                                    )
                                                                }
                                                            />

                                                            <div
                                                                className={`
                                                                absolute
                                                                right-5
                                                                top-12
                                                                z-20
                                                                w-36
                                                                rounded-xl
                                                                border
                                                                p-1
                                                                shadow-2xl

                                                                ${cardBg}
                                                                ${border}
                                                            `}
                                                            >
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setEditing(
                                                                            project,
                                                                        )
                                                                        setShow(
                                                                            true,
                                                                        )
                                                                        setMenu(
                                                                            null,
                                                                        )
                                                                    }}
                                                                    className={`
                                                                    flex
                                                                    w-full
                                                                    items-center
                                                                    gap-2
                                                                    rounded-lg
                                                                    px-3
                                                                    py-2
                                                                    text-sm
                                                                    transition-colors

                                                                    ${isDark
                                                                            ? 'text-white/65 hover:bg-white/[0.05] hover:text-white'
                                                                            : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-950'
                                                                        }
                                                                `}
                                                                >
                                                                    <Pencil className="h-4 w-4" />

                                                                    Edit
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}
                                            </td>
                                        </tr>
                                    ),
                                )
                            )}
                        </tbody>
                    </table>
                </div>

                {!loading &&
                    !filtered.length && (
                        <div
                            className={`
                                border-t
                                p-12
                                text-center
                                text-sm

                                ${divider}
                                ${mutedText}
                            `}
                        >
                            No projects
                            found.
                        </div>
                    )}
            </div>

            {/* =================================================
                MODAL
            ================================================= */}
            {show && (
                <ProjectModal
                    project={editing}
                    members={members}
                    isDark={isDark}
                    onClose={() => {
                        setShow(
                            false,
                        )

                        setEditing(
                            null,
                        )
                    }}
                    onSave={save}
                />
            )}
        </div>
    )
}

/* =========================================================
   STATUS MAP FOR SELECT
========================================================= */

const statusStylesMap: Record<
    Status,
    true
> = {
    Planning: true,
    'In Progress': true,
    Revision: true,
    Completed: true,
    Cancelled: true,
}

/* =========================================================
   STAT
========================================================= */

function Stat({
    icon: Icon,
    label,
    value,
    isDark,
    accent = 'violet',
}: {
    icon: any
    label: string
    value: any
    isDark: boolean
    accent?:
    | 'violet'
    | 'blue'
    | 'green'
    | 'amber'
}) {
    const accentClass =
        accent === 'blue'
            ? isDark
                ? 'bg-blue-500/10 text-blue-400'
                : 'bg-blue-50 text-blue-600'
            : accent === 'green'
                ? isDark
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-emerald-50 text-emerald-600'
                : accent === 'amber'
                    ? isDark
                        ? 'bg-amber-500/10 text-amber-400'
                        : 'bg-amber-50 text-amber-600'
                    : isDark
                        ? 'bg-violet-500/10 text-violet-400'
                        : 'bg-violet-50 text-violet-600'

    return (
        <div
            className={`
                rounded-2xl
                border
                p-5
                transition-all
                duration-200
                hover:-translate-y-0.5
                hover:shadow-lg

                ${isDark
                    ? 'border-white/[0.08] bg-[#15151b] hover:shadow-black/20'
                    : 'border-neutral-200 bg-white hover:shadow-neutral-200/70'
                }
            `}
        >
            <div className="flex items-center justify-between">
                <div>
                    <p
                        className={`
                            text-sm

                            ${isDark
                                ? 'text-white/55'
                                : 'text-neutral-600'
                            }
                        `}
                    >
                        {label}
                    </p>

                    <p
                        className="
                            mt-2
                            text-2xl
                            font-bold
                            tracking-[-0.035em]
                        "
                    >
                        {value}
                    </p>
                </div>

                <div
                    className={`
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-xl

                        ${accentClass}
                    `}
                >
                    <Icon className="h-5 w-5" />
                </div>
            </div>

            <div
                className={`
                    mt-5
                    border-t
                    pt-3
                    text-[11px]

                    ${isDark
                        ? 'border-white/[0.06] text-white/25'
                        : 'border-neutral-100 text-neutral-400'
                    }
                `}
            >
                39Production workspace
            </div>
        </div>
    )
}

/* =========================================================
   PROJECT MODAL
========================================================= */

function ProjectModal({
    project,
    members,
    isDark,
    onClose,
    onSave,
}: {
    project: Project | null
    members: Member[]
    isDark: boolean
    onClose: () => void
    onSave: (value: any) => void
}) {
    const cardBg = isDark
        ? 'bg-[#15151b]'
        : 'bg-white'

    const inputBg = isDark
        ? 'bg-[#0f0f13]'
        : 'bg-neutral-50'

    const pageText = isDark
        ? 'text-white'
        : 'text-neutral-950'

    const secondaryText =
        isDark
            ? 'text-white/55'
            : 'text-neutral-600'

    const mutedText = isDark
        ? 'text-white/30'
        : 'text-neutral-400'

    const border = isDark
        ? 'border-white/[0.08]'
        : 'border-neutral-200'

    const divider = isDark
        ? 'border-white/[0.06]'
        : 'border-neutral-100'

    const [v, setV] =
        useState<any>({
            name:
                project?.name ||
                '',

            customer:
                project?.customer ||
                '',

            value:
                project?.value ||
                '',

            deadline:
                project?.deadline ||
                '',

            status:
                project?.status ||
                'Planning',

            type:
                project?.type ||
                'Custom',

            member_ids:
                project?.team?.map(
                    (member) =>
                        member.id,
                ) || [],

            contributions:
                project?.team?.map(
                    (member) =>
                        member.contribution_percent,
                ) || [],
        })

    const toggle = (
        id: number,
    ) => {
        const index =
            v.member_ids.indexOf(
                id,
            )

        if (index >= 0) {
            setV({
                ...v,

                member_ids:
                    v.member_ids.filter(
                        (
                            memberId: number,
                        ) =>
                            memberId !==
                            id,
                    ),

                contributions:
                    v.contributions.filter(
                        (
                            _value: any,
                            itemIndex: number,
                        ) =>
                            itemIndex !==
                            index,
                    ),
            })
        } else {
            setV({
                ...v,

                member_ids: [
                    ...v.member_ids,
                    id,
                ],

                contributions: [
                    ...v.contributions,
                    0,
                ],
            })
        }
    }

    return (
        <div
            className="
                fixed
                inset-0
                z-[100]
                flex
                items-center
                justify-center
                bg-black/55
                p-4
                backdrop-blur-sm
            "
        >
            {/* Close backdrop */}
            <button
                type="button"
                className="
                    absolute
                    inset-0
                    cursor-default
                "
                onClick={onClose}
                aria-label="Close project modal"
            />

            <div
                className={`
                    relative
                    z-10
                    max-h-[90vh]
                    w-full
                    max-w-lg
                    overflow-y-auto
                    rounded-2xl
                    border
                    shadow-2xl

                    ${cardBg}
                    ${border}
                `}
            >
                {/* =================================================
                    MODAL HEADER
                ================================================= */}
                <div
                    className={`
                        flex
                        items-center
                        justify-between
                        border-b
                        p-5

                        ${divider}
                    `}
                >
                    <div>
                        <p
                            className="
                                text-[10px]
                                font-bold
                                uppercase
                                tracking-[0.16em]
                                text-violet-500
                            "
                        >
                            Project
                        </p>

                        <h3
                            className={`
                                mt-1
                                text-lg
                                font-bold
                                tracking-[-0.02em]

                                ${pageText}
                            `}
                        >
                            {project
                                ? 'Edit Project'
                                : 'New Project'}
                        </h3>

                        <p
                            className={`
                                mt-1
                                text-xs

                                ${mutedText}
                            `}
                        >
                            Manage
                            project
                            details,
                            status, and
                            team
                            allocation.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={
                            onClose
                        }
                        className={`
                            rounded-lg
                            p-2
                            transition-colors

                            ${secondaryText}

                            ${isDark
                                ? 'hover:bg-white/[0.05] hover:text-white'
                                : 'hover:bg-neutral-50 hover:text-neutral-950'
                            }
                        `}
                        aria-label="Close"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* =================================================
                    FORM
                ================================================= */}
                <form
                    onSubmit={(
                        event,
                    ) => {
                        event.preventDefault()

                        const total =
                            v.contributions.reduce(
                                (
                                    sum: number,
                                    number: number,
                                ) =>
                                    sum +
                                    Number(
                                        number ||
                                        0,
                                    ),
                                0,
                            )

                        if (
                            !v.name ||
                            !v.customer ||
                            !v.value ||
                            !v.deadline ||
                            Math.abs(
                                total -
                                100,
                            ) >
                            0.01
                        ) {
                            alert(
                                'Project member contribution must total exactly 100%.',
                            )

                            return
                        }

                        onSave({
                            ...v,
                            value:
                                Number(
                                    v.value,
                                ),
                        })
                    }}
                    className="space-y-5 p-5"
                >
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <div
                            className={`
                                text-xs
                                font-bold
                                uppercase
                                tracking-[0.12em]

                                ${mutedText}
                            `}
                        >
                            Project Information
                        </div>

                        {[
                            [
                                'Project name',
                                'name',
                                'text',
                            ],
                            [
                                'Customer',
                                'customer',
                                'text',
                            ],
                            [
                                'Project value',
                                'value',
                                'number',
                            ],
                            [
                                'Deadline',
                                'deadline',
                                'date',
                            ],
                            [
                                'Type',
                                'type',
                                'text',
                            ],
                        ].map(
                            ([
                                label,
                                key,
                                inputType,
                            ]) => (
                                <label
                                    key={
                                        key
                                    }
                                    className="block"
                                >
                                    <span
                                        className={`
                                            mb-1.5
                                            block
                                            text-xs
                                            font-semibold

                                            ${secondaryText}
                                        `}
                                    >
                                        {
                                            label
                                        }
                                    </span>

                                    <input
                                        required
                                        type={
                                            inputType
                                        }
                                        value={
                                            v[
                                            key
                                            ]
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            setV(
                                                {
                                                    ...v,
                                                    [key]:
                                                        event
                                                            .target
                                                            .value,
                                                },
                                            )
                                        }
                                        className={`
                                            w-full
                                            rounded-xl
                                            border
                                            px-3
                                            py-2.5
                                            text-sm
                                            outline-none
                                            transition-colors

                                            ${border}
                                            ${inputBg}
                                            ${pageText}

                                            ${isDark
                                                ? 'placeholder:text-white/25 focus:border-violet-500/50'
                                                : 'placeholder:text-neutral-400 focus:border-violet-400'
                                            }
                                        `}
                                    />
                                </label>
                            ),
                        )}

                        {/* Status */}
                        <label className="block">
                            <span
                                className={`
                                    mb-1.5
                                    block
                                    text-xs
                                    font-semibold

                                    ${secondaryText}
                                `}
                            >
                                Status
                            </span>

                            <select
                                value={
                                    v.status
                                }
                                onChange={(
                                    event,
                                ) =>
                                    setV(
                                        {
                                            ...v,
                                            status:
                                                event
                                                    .target
                                                    .value,
                                        },
                                    )
                                }
                                className={`
                                    w-full
                                    rounded-xl
                                    border
                                    px-3
                                    py-2.5
                                    text-sm
                                    outline-none
                                    transition-colors

                                    ${border}
                                    ${inputBg}
                                    ${pageText}

                                    ${isDark
                                        ? 'focus:border-violet-500/50'
                                        : 'focus:border-violet-400'
                                    }
                                `}
                            >
                                {Object.keys(
                                    statusStylesMap,
                                ).map(
                                    (
                                        value,
                                    ) => (
                                        <option
                                            key={
                                                value
                                            }
                                            value={
                                                value
                                            }
                                        >
                                            {
                                                value
                                            }
                                        </option>
                                    ),
                                )}
                            </select>
                        </label>
                    </div>

                    {/* =================================================
                        TEAM
                    ================================================= */}
                    <div>
                        <div className="mb-3 flex items-center justify-between">
                            <div>
                                <p
                                    className={`
                                        text-sm
                                        font-semibold

                                        ${pageText}
                                    `}
                                >
                                    Team & contribution
                                </p>

                                <p
                                    className={`
                                        mt-1
                                        text-xs

                                        ${mutedText}
                                    `}
                                >
                                    Allocate 100%
                                    across
                                    assigned
                                    members.
                                </p>
                            </div>

                            <div
                                className="
                                    flex
                                    h-8
                                    w-8
                                    items-center
                                    justify-center
                                    rounded-lg
                                    bg-violet-500/10
                                    text-violet-500
                                "
                            >
                                <Users className="h-4 w-4" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            {members
                                .filter(
                                    (
                                        member,
                                    ) =>
                                        member.status !==
                                        'Inactive',
                                )
                                .map(
                                    (
                                        member,
                                    ) => {
                                        const index =
                                            v.member_ids.indexOf(
                                                member.id,
                                            )

                                        const selected =
                                            index >=
                                            0

                                        return (
                                            <div
                                                key={
                                                    member.id
                                                }
                                                className={`
                                                    flex
                                                    items-center
                                                    gap-3
                                                    rounded-xl
                                                    border
                                                    p-3

                                                    ${border}

                                                    ${isDark
                                                        ? 'bg-[#0f0f13]'
                                                        : 'bg-neutral-50'
                                                    }
                                                `}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        selected
                                                    }
                                                    onChange={() =>
                                                        toggle(
                                                            member.id,
                                                        )
                                                    }
                                                    className="
                                                        h-4
                                                        w-4
                                                        accent-violet-600
                                                    "
                                                />

                                                <div className="min-w-0 flex-1">
                                                    <p
                                                        className="
                                                            truncate
                                                            text-sm
                                                            font-medium
                                                        "
                                                    >
                                                        {
                                                            member.name
                                                        }
                                                    </p>

                                                    <p
                                                        className={`
                                                            mt-0.5
                                                            truncate
                                                            text-xs

                                                            ${mutedText}
                                                        `}
                                                    >
                                                        {
                                                            member.role
                                                        }
                                                    </p>
                                                </div>

                                                {selected && (
                                                    <>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            value={
                                                                v
                                                                    .contributions[
                                                                index
                                                                ]
                                                            }
                                                            onChange={(
                                                                event,
                                                            ) => {
                                                                const contributions =
                                                                    [
                                                                        ...v.contributions,
                                                                    ]

                                                                contributions[
                                                                    index
                                                                ] =
                                                                    Number(
                                                                        event
                                                                            .target
                                                                            .value,
                                                                    )

                                                                setV(
                                                                    {
                                                                        ...v,
                                                                        contributions,
                                                                    },
                                                                )
                                                            }}
                                                            className={`
                                                                w-20
                                                                rounded-lg
                                                                border
                                                                px-2
                                                                py-1.5
                                                                text-center
                                                                text-sm
                                                                outline-none

                                                                ${border}
                                                                ${inputBg}
                                                                ${pageText}
                                                            `}
                                                        />

                                                        <span
                                                            className={`
                                                                text-xs
                                                                ${mutedText}
                                                            `}
                                                        >
                                                            %
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        )
                                    },
                                )}
                        </div>

                        {/* Contribution summary */}
                        <div
                            className={`
                                mt-3
                                flex
                                items-center
                                justify-between
                                rounded-xl
                                border
                                px-4
                                py-3

                                ${border}

                                ${Math.abs(
                                v.contributions.reduce(
                                    (
                                        sum: number,
                                        number: number,
                                    ) =>
                                        sum +
                                        Number(
                                            number ||
                                            0,
                                        ),
                                    0,
                                ) -
                                100,
                            ) <
                                    0.01
                                    ? isDark
                                        ? 'bg-emerald-500/[0.05]'
                                        : 'bg-emerald-50'
                                    : isDark
                                        ? 'bg-amber-500/[0.05]'
                                        : 'bg-amber-50'
                                }
                            `}
                        >
                            <span
                                className={`
                                    text-xs
                                    font-medium

                                    ${secondaryText}
                                `}
                            >
                                Total contribution
                            </span>

                            <span
                                className={`
                                    text-sm
                                    font-bold

                                    ${Math.abs(
                                    v.contributions.reduce(
                                        (
                                            sum: number,
                                            number: number,
                                        ) =>
                                            sum +
                                            Number(
                                                number ||
                                                0,
                                            ),
                                        0,
                                    ) -
                                    100,
                                ) <
                                        0.01
                                        ? 'text-emerald-500'
                                        : 'text-amber-500'
                                    }
                                `}
                            >
                                {v.contributions.reduce(
                                    (
                                        sum: number,
                                        number: number,
                                    ) =>
                                        sum +
                                        Number(
                                            number ||
                                            0,
                                        ),
                                    0,
                                )}
                                %
                            </span>
                        </div>
                    </div>

                    {/* =================================================
                        ACTIONS
                    ================================================= */}
                    <div
                        className={`
                            flex
                            justify-end
                            gap-3
                            border-t
                            pt-5

                            ${divider}
                        `}
                    >
                        <button
                            type="button"
                            onClick={
                                onClose
                            }
                            className={`
                                rounded-xl
                                border
                                px-4
                                py-2.5
                                text-sm
                                font-medium
                                transition-colors

                                ${border}

                                ${isDark
                                    ? 'text-white/60 hover:bg-white/[0.045] hover:text-white'
                                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-950'
                                }
                            `}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="
                                rounded-xl
                                bg-violet-600
                                px-4
                                py-2.5
                                text-sm
                                font-semibold
                                text-white
                                transition-all
                                hover:bg-violet-700
                                active:scale-[0.98]
                            "
                        >
                            Save Project
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
