import {
    useEffect,
    useMemo,
    useState,
} from 'react'

import {
    Plus,
    Search,
    Users,
    UserRound,
    Crown,
    BriefcaseBusiness,
    Mic2,
    MoreHorizontal,
    Pencil,
    Trash2,
    X,
    Power,
} from 'lucide-react'

import {
    del,
    get,
    post,
    put,
} from '@/utils/businessApi'

type Role =
    | 'Founder'
    | 'Co-Founder'
    | 'Team'
    | 'Talent'

type Status =
    | 'Active'
    | 'Inactive'

interface Member {
    id: number
    name: string
    role: Role
    position: string
    email: string
    status: Status
    joinedAt: string
}

type ThemeMode =
    | 'dark'
    | 'light'

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

            return stored ===
                'light'
                ? 'light'
                : 'dark'
        })

    useEffect(() => {
        const syncTheme =
            () => {
                const datasetTheme =
                    document
                        .documentElement
                        .dataset
                        .adminTheme

                if (
                    datasetTheme ===
                    'light' ||
                    datasetTheme ===
                    'dark'
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
   ROLE CONFIG
========================================================= */

const roleConfig = {
    Founder: {
        icon: Crown,
        dark:
            'bg-violet-500/10 text-violet-300',
        light:
            'bg-violet-50 text-violet-700',
    },

    'Co-Founder': {
        icon: Crown,
        dark:
            'bg-pink-500/10 text-pink-300',
        light:
            'bg-pink-50 text-pink-700',
    },

    Team: {
        icon: BriefcaseBusiness,
        dark:
            'bg-blue-500/10 text-blue-300',
        light:
            'bg-blue-50 text-blue-700',
    },

    Talent: {
        icon: Mic2,
        dark:
            'bg-cyan-500/10 text-cyan-300',
        light:
            'bg-cyan-50 text-cyan-700',
    },
} as const

/* =========================================================
   PAGE
========================================================= */

export function AdminMembersPage() {
    const theme =
        useAdminTheme()

    const isDark =
        theme === 'dark'

    const [
        members,
        setMembers,
    ] = useState<Member[]>([])

    const [
        search,
        setSearch,
    ] = useState('')

    const [
        roleFilter,
        setRoleFilter,
    ] = useState<
        'All' | Role
    >('All')

    const [
        show,
        setShow,
    ] = useState(false)

    const [
        editing,
        setEditing,
    ] =
        useState<Member | null>(
            null,
        )

    const [
        menu,
        setMenu,
    ] = useState<number | null>(
        null,
    )

    const [
        loading,
        setLoading,
    ] = useState(true)

    const [
        error,
        setError,
    ] = useState('')

    const [
        actionLoading,
        setActionLoading,
    ] = useState<number | null>(
        null,
    )

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

    const hoverRow = isDark
        ? 'hover:bg-white/[0.02]'
        : 'hover:bg-neutral-50/80'

    /*
     * =======================================================
     * LOAD
     * =======================================================
     */

    const load = async () => {
        try {
            setLoading(true)
            setError('')

            const response =
                await get<{
                    data: Member[]
                }>(
                    '/api/admin/members',
                )

            setMembers(
                Array.isArray(
                    response.data,
                )
                    ? response.data
                    : [],
            )
        } catch (errorValue) {
            setError(
                errorValue instanceof
                    Error
                    ? errorValue.message
                    : 'Failed to load members',
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
            const keyword =
                search
                    .toLowerCase()
                    .trim()

            return members.filter(
                (member) => {
                    const matchesSearch =
                        (
                            member.name +
                            ' ' +
                            member.email +
                            ' ' +
                            member.position
                        )
                            .toLowerCase()
                            .includes(
                                keyword,
                            )

                    const matchesRole =
                        roleFilter ===
                        'All' ||
                        member.role ===
                        roleFilter

                    return (
                        matchesSearch &&
                        matchesRole
                    )
                },
            )
        }, [
            members,
            search,
            roleFilter,
        ])

    /*
     * =======================================================
     * SAVE
     * =======================================================
     */

    const save = async (
        value: Member,
    ) => {
        try {
            if (editing) {
                await put(
                    `/api/admin/members/${value.id}`,
                    value,
                )
            } else {
                await post(
                    '/api/admin/members',
                    value,
                )
            }

            setShow(false)
            setEditing(null)

            await load()
        } catch (errorValue) {
            alert(
                errorValue instanceof
                    Error
                    ? errorValue.message
                    : 'Failed to save member',
            )
        }
    }

    /*
     * =======================================================
     * DELETE
     * =======================================================
     */

    const remove = async (
        id: number,
    ) => {
        const member =
            members.find(
                (item) =>
                    item.id ===
                    id,
            )

        if (!member) {
            return
        }

        const confirmed =
            window.confirm(
                `Hapus member "${member.name}"?`,
            )

        if (!confirmed) {
            return
        }

        try {
            setActionLoading(id)

            await del(
                `/api/admin/members/${id}`,
            )

            await load()
        } catch (errorValue) {
            alert(
                errorValue instanceof
                    Error
                    ? errorValue.message
                    : 'Failed to delete member',
            )
        } finally {
            setActionLoading(null)
        }
    }

    /*
     * =======================================================
     * TOGGLE
     * =======================================================
     */

    const toggle = async (
        member: Member,
    ) => {
        try {
            setActionLoading(
                member.id,
            )

            await put(
                `/api/admin/members/${member.id}`,
                {
                    status:
                        member.status ===
                            'Active'
                            ? 'Inactive'
                            : 'Active',
                },
            )

            await load()
        } catch (errorValue) {
            alert(
                errorValue instanceof
                    Error
                    ? errorValue.message
                    : 'Failed to update status',
            )
        } finally {
            setActionLoading(null)
        }
    }

    /*
     * =======================================================
     * STATS
     * =======================================================
     */

    const activeCount =
        members.filter(
            (member) =>
                member.status ===
                'Active',
        ).length

    const talentCount =
        members.filter(
            (member) =>
                member.role ===
                'Talent',
        ).length

    const foundingCount =
        members.filter(
            (member) =>
                member.role ===
                'Founder' ||
                member.role ===
                'Co-Founder',
        ).length

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
                        Members
                    </h2>

                    <p
                        className={`
                            mt-2
                            text-sm
                            leading-6

                            ${secondaryText}
                        `}
                    >
                        Manage founders,
                        team members,
                        and 39Production
                        talent.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => {
                        setEditing(
                            null,
                        )

                        setShow(
                            true,
                        )
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

                    Add Member
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
                    icon={
                        Users
                    }
                    label="Total Members"
                    value={
                        members.length
                    }
                    isDark={
                        isDark
                    }
                    accent="violet"
                />

                <Stat
                    icon={
                        UserRound
                    }
                    label="Active"
                    value={
                        activeCount
                    }
                    isDark={
                        isDark
                    }
                    accent="green"
                />

                <Stat
                    icon={
                        Mic2
                    }
                    label="Talent"
                    value={
                        talentCount
                    }
                    isDark={
                        isDark
                    }
                    accent="cyan"
                />

                <Stat
                    icon={
                        Crown
                    }
                    label="Founding Team"
                    value={
                        foundingCount
                    }
                    isDark={
                        isDark
                    }
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
                <div className="flex flex-col gap-3 md:flex-row">
                    <div className="relative flex-1">
                        <Search
                            className={`
                                pointer-events-none
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
                            placeholder="Search members, email, or position..."
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
                            roleFilter
                        }
                        onChange={(
                            event,
                        ) =>
                            setRoleFilter(
                                event
                                    .target
                                    .value as
                                | 'All'
                                | Role,
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
                            All Roles
                        </option>

                        <option value="Founder">
                            Founder
                        </option>

                        <option value="Co-Founder">
                            Co-Founder
                        </option>

                        <option value="Team">
                            Team
                        </option>

                        <option value="Talent">
                            Talent
                        </option>
                    </select>
                </div>
            </div>

            {/* =================================================
                ERROR
            ================================================= */}
            {error && (
                <div
                    className="
                        rounded-xl
                        border
                        border-red-500/20
                        bg-red-500/10
                        px-4
                        py-3
                        text-sm
                        text-red-500
                    "
                >
                    {error}
                </div>
            )}

            {/* =================================================
                TABLE
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
                    <table className="w-full min-w-[850px]">
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
                                    'Member',
                                    'Role',
                                    'Position',
                                    'Status',
                                    'Action',
                                ].map(
                                    (
                                        heading,
                                        index,
                                    ) => (
                                        <th
                                            key={
                                                heading
                                            }
                                            className={`
                                                px-5
                                                py-4
                                                text-[10px]
                                                font-bold
                                                uppercase
                                                tracking-[0.12em]

                                                ${mutedText}

                                                ${index ===
                                                    4
                                                    ? 'text-right'
                                                    : 'text-left'
                                                }
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
                                            5
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
                                            members...
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map(
                                    (
                                        member,
                                    ) => {
                                        const role =
                                            roleConfig[
                                            member
                                                .role
                                            ]

                                        const Icon =
                                            role.icon

                                        const processing =
                                            actionLoading ===
                                            member.id

                                        return (
                                            <tr
                                                key={
                                                    member.id
                                                }
                                                className={`
                                                    border-b
                                                    transition-colors
                                                    last:border-0

                                                    ${divider}
                                                    ${hoverRow}
                                                `}
                                            >
                                                {/* Member */}
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className={`
                                                                flex
                                                                h-10
                                                                w-10
                                                                shrink-0
                                                                items-center
                                                                justify-center
                                                                rounded-xl

                                                                ${isDark
                                                                    ? role.dark
                                                                    : role.light
                                                                }
                                                            `}
                                                        >
                                                            <Icon className="h-5 w-5" />
                                                        </div>

                                                        <div className="min-w-0">
                                                            <p
                                                                className="
                                                                    truncate
                                                                    font-semibold
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
                                                                    member.email
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Role */}
                                                <td className="px-5 py-4">
                                                    <span
                                                        className={`
                                                            inline-flex
                                                            rounded-full
                                                            px-2.5
                                                            py-1
                                                            text-xs
                                                            font-semibold

                                                            ${isDark
                                                                ? role.dark
                                                                : role.light
                                                            }
                                                        `}
                                                    >
                                                        {
                                                            member.role
                                                        }
                                                    </span>
                                                </td>

                                                {/* Position */}
                                                <td
                                                    className={`
                                                        px-5
                                                        py-4
                                                        text-sm

                                                        ${secondaryText}
                                                    `}
                                                >
                                                    {
                                                        member.position
                                                    }
                                                </td>

                                                {/* Status */}
                                                <td className="px-5 py-4">
                                                    <span
                                                        className={`
                                                            inline-flex
                                                            items-center
                                                            gap-2
                                                            text-xs
                                                            font-semibold

                                                            ${member.status ===
                                                                'Active'
                                                                ? 'text-emerald-500'
                                                                : mutedText
                                                            }
                                                        `}
                                                    >
                                                        <span
                                                            className={`
                                                                h-1.5
                                                                w-1.5
                                                                rounded-full

                                                                ${member.status ===
                                                                    'Active'
                                                                    ? 'bg-emerald-500'
                                                                    : isDark
                                                                        ? 'bg-white/20'
                                                                        : 'bg-neutral-300'
                                                                }
                                                            `}
                                                        />

                                                        {
                                                            member.status
                                                        }
                                                    </span>
                                                </td>

                                                {/* Action */}
                                                <td className="relative px-5 py-4 text-right">
                                                    <button
                                                        type="button"
                                                        disabled={
                                                            processing
                                                        }
                                                        onClick={() =>
                                                            setMenu(
                                                                menu ===
                                                                    member.id
                                                                    ? null
                                                                    : member.id,
                                                            )
                                                        }
                                                        className={`
                                                            rounded-lg
                                                            border
                                                            p-2
                                                            transition-all
                                                            disabled:cursor-not-allowed
                                                            disabled:opacity-50

                                                            ${border}

                                                            ${isDark
                                                                ? 'text-white/45 hover:bg-white/[0.05] hover:text-white'
                                                                : 'text-neutral-400 hover:bg-neutral-50 hover:text-neutral-950'
                                                            }
                                                        `}
                                                        aria-label={`Actions for ${member.name}`}
                                                    >
                                                        {processing ? (
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
                                                        ) : (
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        )}
                                                    </button>

                                                    {menu ===
                                                        member.id && (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    className="
                                                                    fixed
                                                                    inset-0
                                                                    z-10
                                                                    cursor-default
                                                                "
                                                                    aria-label="Close member actions"
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
                                                                    w-40
                                                                    rounded-xl
                                                                    border
                                                                    p-1
                                                                    text-left
                                                                    shadow-2xl

                                                                    ${cardBg}
                                                                    ${border}
                                                                `}
                                                                >
                                                                    {/* Edit */}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setEditing(
                                                                                member,
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

                                                                    {/* Toggle */}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setMenu(
                                                                                null,
                                                                            )

                                                                            void toggle(
                                                                                member,
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
                                                                        <Power className="h-4 w-4" />

                                                                        {member.status ===
                                                                            'Active'
                                                                            ? 'Deactivate'
                                                                            : 'Activate'}
                                                                    </button>

                                                                    {/* Delete */}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setMenu(
                                                                                null,
                                                                            )

                                                                            void remove(
                                                                                member.id,
                                                                            )
                                                                        }}
                                                                        className="
                                                                        flex
                                                                        w-full
                                                                        items-center
                                                                        gap-2
                                                                        rounded-lg
                                                                        px-3
                                                                        py-2
                                                                        text-sm
                                                                        text-red-500
                                                                        transition-colors
                                                                        hover:bg-red-500/10
                                                                    "
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />

                                                                        Delete
                                                                    </button>
                                                                </div>
                                                            </>
                                                        )}
                                                </td>
                                            </tr>
                                        )
                                    },
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
                            No members
                            found.
                        </div>
                    )}
            </div>

            {/* =================================================
                MODAL
            ================================================= */}
            {show && (
                <MemberModal
                    member={
                        editing
                    }
                    isDark={
                        isDark
                    }
                    onClose={() => {
                        setShow(
                            false,
                        )

                        setEditing(
                            null,
                        )
                    }}
                    onSave={
                        save
                    }
                />
            )}
        </div>
    )
}

/* =========================================================
   STAT
========================================================= */

function Stat({
    icon: Icon,
    label,
    value,
    isDark,
    accent,
}: {
    icon: any
    label: string
    value: number
    isDark: boolean
    accent:
    | 'violet'
    | 'green'
    | 'cyan'
    | 'amber'
}) {
    const iconClass =
        accent === 'green'
            ? isDark
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-emerald-50 text-emerald-600'
            : accent === 'cyan'
                ? isDark
                    ? 'bg-cyan-500/10 text-cyan-400'
                    : 'bg-cyan-50 text-cyan-600'
                : accent ===
                    'amber'
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

                        ${iconClass}
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
   MEMBER MODAL
========================================================= */

function MemberModal({
    member,
    isDark,
    onClose,
    onSave,
}: {
    member: Member | null
    isDark: boolean
    onClose: () => void
    onSave: (
        member: Member,
    ) => void
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

    const [
        value,
        setValue,
    ] = useState<any>(
        member || {
            name: '',
            role: 'Team',
            position: '',
            email: '',
            status: 'Active',
        },
    )

    const isValid =
        Boolean(
            value.name?.trim(),
        ) &&
        Boolean(
            value.email?.trim(),
        ) &&
        Boolean(
            value.position?.trim(),
        )

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
            {/* Backdrop */}
            <button
                type="button"
                className="
                    absolute
                    inset-0
                    cursor-default
                "
                aria-label="Close member modal"
                onClick={
                    onClose
                }
            />

            <div
                className={`
                    relative
                    z-10
                    w-full
                    max-w-lg
                    overflow-hidden
                    rounded-2xl
                    border
                    shadow-2xl

                    ${cardBg}
                    ${border}
                `}
            >
                {/* =================================================
                    HEADER
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
                            Team
                        </p>

                        <h3
                            className="
                                mt-1
                                text-lg
                                font-bold
                                tracking-[-0.02em]
                            "
                        >
                            {member
                                ? 'Edit Member'
                                : 'Add Member'}
                        </h3>

                        <p
                            className={`
                                mt-1
                                text-xs

                                ${mutedText}
                            `}
                        >
                            Manage internal
                            39Production
                            members.
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
                        aria-label="Close member modal"
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

                        if (
                            !isValid
                        ) {
                            return
                        }

                        onSave(
                            value,
                        )
                    }}
                    className="space-y-5 p-5"
                >
                    {/* Basic */}
                    <div
                        className={`
                            text-[10px]
                            font-bold
                            uppercase
                            tracking-[0.12em]

                            ${mutedText}
                        `}
                    >
                        Member Information
                    </div>

                    {/* Name */}
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
                            Name
                        </span>

                        <input
                            required
                            type="text"
                            value={
                                value.name
                            }
                            onChange={(
                                event,
                            ) =>
                                setValue(
                                    {
                                        ...value,
                                        name:
                                            event
                                                .target
                                                .value,
                                    },
                                )
                            }
                            placeholder="e.g. Hafiidh Rama"
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

                    {/* Position */}
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
                            Position
                        </span>

                        <input
                            required
                            type="text"
                            value={
                                value.position
                            }
                            onChange={(
                                event,
                            ) =>
                                setValue(
                                    {
                                        ...value,
                                        position:
                                            event
                                                .target
                                                .value,
                                    },
                                )
                            }
                            placeholder="e.g. Full-Stack Developer"
                            className={`
                                w-full
                                rounded-xl
                                border
                                px-3
                                py-2.5
                                text-sm
                                outline-none

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

                    {/* Email */}
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
                            Email
                        </span>

                        <input
                            required
                            type="email"
                            value={
                                value.email
                            }
                            onChange={(
                                event,
                            ) =>
                                setValue(
                                    {
                                        ...value,
                                        email:
                                            event
                                                .target
                                                .value,
                                    },
                                )
                            }
                            placeholder="member@example.com"
                            className={`
                                w-full
                                rounded-xl
                                border
                                px-3
                                py-2.5
                                text-sm
                                outline-none

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

                    {/* Role + Status */}
                    <div className="grid gap-4 sm:grid-cols-2">
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
                                Role
                            </span>

                            <select
                                value={
                                    value.role
                                }
                                onChange={(
                                    event,
                                ) =>
                                    setValue(
                                        {
                                            ...value,
                                            role:
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

                                    ${border}
                                    ${inputBg}
                                    ${pageText}
                                `}
                            >
                                <option value="Founder">
                                    Founder
                                </option>

                                <option value="Co-Founder">
                                    Co-Founder
                                </option>

                                <option value="Team">
                                    Team
                                </option>

                                <option value="Talent">
                                    Talent
                                </option>
                            </select>
                        </label>

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
                                    value.status
                                }
                                onChange={(
                                    event,
                                ) =>
                                    setValue(
                                        {
                                            ...value,
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

                                    ${border}
                                    ${inputBg}
                                    ${pageText}
                                `}
                            >
                                <option value="Active">
                                    Active
                                </option>

                                <option value="Inactive">
                                    Inactive
                                </option>
                            </select>
                        </label>
                    </div>

                    {/* Actions */}
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
                            disabled={
                                !isValid
                            }
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
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                            "
                        >
                            Save Member
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}