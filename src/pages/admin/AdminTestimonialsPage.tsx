
import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react'
import {
    Check,
    CheckCircle2,
    Clock3,
    Eye,
    MessageSquareQuote,
    RefreshCw,
    Search,
    Star,
    Trash2,
    X,
    XCircle,
} from 'lucide-react'

import {
    API_ENDPOINTS,
    apiDelete,
    apiGet,
    apiRequest,
    getAuthHeaders,
} from '@/utils/constants'


// ============================================================
// TYPES
// ============================================================

type TestimonialStatus =
    | 'Pending'
    | 'Published'
    | 'Rejected'

interface Testimonial {
    id: number
    name: string
    role: string
    company: string
    rating: number
    content: string
    project: string
    status: TestimonialStatus
    is_featured: number | boolean
    created_at: string
    updated_at: string
}

type FilterStatus =
    | 'All'
    | TestimonialStatus


// ============================================================
// HELPERS
// ============================================================

function isFeatured(
    testimonial: Testimonial,
): boolean {
    return (
        testimonial.is_featured === 1 ||
        testimonial.is_featured === true
    )
}


function formatDate(
    value: string,
): string {
    if (!value) {
        return '-'
    }

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
        return value
    }

    return new Intl.DateTimeFormat(
        'id-ID',
        {
            dateStyle: 'medium',
            timeStyle: 'short',
        },
    ).format(date)
}


function getStatusClasses(
    status: TestimonialStatus,
): string {
    if (status === 'Published') {
        return 'border-emerald-200 bg-emerald-50 text-emerald-700'
    }

    if (status === 'Rejected') {
        return 'border-red-200 bg-red-50 text-red-700'
    }

    return 'border-amber-200 bg-amber-50 text-amber-700'
}


function normalizeTestimonials(
    result: unknown,
): Testimonial[] {
    if (Array.isArray(result)) {
        return result as Testimonial[]
    }

    if (
        typeof result === 'object' &&
        result !== null
    ) {
        const payload =
            result as {
                data?: unknown
                testimonials?: unknown
            }

        if (Array.isArray(payload.data)) {
            return payload.data as Testimonial[]
        }

        if (
            Array.isArray(
                payload.testimonials,
            )
        ) {
            return payload.testimonials as Testimonial[]
        }
    }

    return []
}


// ============================================================
// COMPONENT
// ============================================================

export function AdminTestimonialsPage() {
    const [
        testimonials,
        setTestimonials,
    ] = useState<Testimonial[]>([])

    const [
        loading,
        setLoading,
    ] = useState(true)

    const [
        refreshing,
        setRefreshing,
    ] = useState(false)

    const [
        actionId,
        setActionId,
    ] = useState<number | null>(null)

    const [
        error,
        setError,
    ] = useState('')

    const [
        success,
        setSuccess,
    ] = useState('')

    const [
        filter,
        setFilter,
    ] = useState<FilterStatus>('All')

    const [
        search,
        setSearch,
    ] = useState('')

    const [
        selected,
        setSelected,
    ] = useState<Testimonial | null>(null)


    // ========================================================
    // FETCH TESTIMONIALS
    // ========================================================

    const fetchTestimonials =
        useCallback(
            async (
                showRefresh = false,
            ) => {
                try {
                    if (showRefresh) {
                        setRefreshing(true)
                    } else {
                        setLoading(true)
                    }

                    setError('')

                    /*
                     * IMPORTANT:
                     *
                     * Jangan mengambil token dari localStorage
                     * secara manual di halaman ini.
                     *
                     * getAuthHeaders() menggunakan:
                     *
                     * 39production_admin_token
                     *
                     * dan menghasilkan:
                     *
                     * Authorization: Bearer <token>
                     */

                    const result =
                        await apiGet<unknown>(
                            API_ENDPOINTS.admin.testimonials,
                        )

                    const data =
                        normalizeTestimonials(
                            result,
                        )

                    setTestimonials(data)
                } catch (err) {
                    console.error(
                        'Fetch testimonials error:',
                        err,
                    )

                    const message =
                        err instanceof Error
                            ? err.message
                            : 'Failed to fetch testimonials.'

                    setError(message)
                } finally {
                    setLoading(false)
                    setRefreshing(false)
                }
            },
            [],
        )


    // ========================================================
    // INITIAL LOAD
    // ========================================================

    useEffect(() => {
        void fetchTestimonials()
    }, [fetchTestimonials])


    // ========================================================
    // SUCCESS MESSAGE
    // ========================================================

    useEffect(() => {
        if (!success) {
            return
        }

        const timeout =
            window.setTimeout(() => {
                setSuccess('')
            }, 3000)

        return () =>
            window.clearTimeout(timeout)
    }, [success])


    // ========================================================
    // COUNTS
    // ========================================================

    const counts = useMemo(() => {
        return {
            all: testimonials.length,

            pending:
                testimonials.filter(
                    (item) =>
                        item.status === 'Pending',
                ).length,

            published:
                testimonials.filter(
                    (item) =>
                        item.status === 'Published',
                ).length,

            rejected:
                testimonials.filter(
                    (item) =>
                        item.status === 'Rejected',
                ).length,

            featured:
                testimonials.filter(
                    (item) =>
                        isFeatured(item),
                ).length,
        }
    }, [testimonials])


    // ========================================================
    // FILTER
    // ========================================================

    const filteredTestimonials =
        useMemo(() => {
            const keyword =
                search
                    .trim()
                    .toLowerCase()

            return testimonials.filter(
                (item) => {
                    const matchesStatus =
                        filter === 'All' ||
                        item.status === filter

                    if (!matchesStatus) {
                        return false
                    }

                    if (!keyword) {
                        return true
                    }

                    return [
                        item.name,
                        item.role,
                        item.company,
                        item.project,
                        item.content,
                    ]
                        .filter(
                            (
                                value,
                            ): value is string =>
                                Boolean(value),
                        )
                        .some(
                            (value) =>
                                value
                                    .toLowerCase()
                                    .includes(
                                        keyword,
                                    ),
                        )
                },
            )
        }, [
            testimonials,
            filter,
            search,
        ])


    // ========================================================
    // UPDATE TESTIMONIAL
    // ========================================================

    async function updateTestimonial(
        id: number,
        payload: {
            status?: TestimonialStatus
            is_featured?: boolean
        },
        successMessage: string,
    ) {
        try {
            setActionId(id)
            setError('')

            const result =
                await apiRequest<unknown>(
                    `${API_ENDPOINTS.admin.testimonials}/${id}`,
                    {
                        method: 'PATCH',
                        headers:
                            getAuthHeaders(
                                true,
                            ),
                        body:
                            JSON.stringify(
                                payload,
                            ),
                    },
                )

            /*
             * Backend may return the updated
             * testimonial. We don't depend on it
             * because the local state can be
             * updated safely from the payload.
             */

            void result

            setTestimonials(
                (current) =>
                    current.map(
                        (item) =>
                            item.id === id
                                ? {
                                    ...item,

                                    ...(payload.status
                                        ? {
                                            status:
                                                payload.status,
                                        }
                                        : {}),

                                    ...(typeof payload.is_featured ===
                                        'boolean'
                                        ? {
                                            is_featured:
                                                payload.is_featured,
                                        }
                                        : {}),
                                }
                                : item,
                    ),
            )

            setSelected(
                (current) =>
                    current?.id === id
                        ? {
                            ...current,

                            ...(payload.status
                                ? {
                                    status:
                                        payload.status,
                                }
                                : {}),

                            ...(typeof payload.is_featured ===
                                'boolean'
                                ? {
                                    is_featured:
                                        payload.is_featured,
                                }
                                : {}),
                        }
                        : current,
            )

            setSuccess(
                successMessage,
            )
        } catch (err) {
            console.error(
                'Update testimonial error:',
                err,
            )

            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to update testimonial.',
            )
        } finally {
            setActionId(null)
        }
    }


    // ========================================================
    // DELETE TESTIMONIAL
    // ========================================================

    async function deleteTestimonial(
        testimonial: Testimonial,
    ) {
        const confirmed =
            window.confirm(
                `Delete testimonial from ${testimonial.name}? This action cannot be undone.`,
            )

        if (!confirmed) {
            return
        }

        try {
            setActionId(
                testimonial.id,
            )

            setError('')

            await apiDelete(
                `${API_ENDPOINTS.admin.testimonials}/${testimonial.id}`,
            )

            setTestimonials(
                (current) =>
                    current.filter(
                        (item) =>
                            item.id !==
                            testimonial.id,
                    ),
            )

            setSelected(null)

            setSuccess(
                'Testimonial deleted successfully.',
            )
        } catch (err) {
            console.error(
                'Delete testimonial error:',
                err,
            )

            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to delete testimonial.',
            )
        } finally {
            setActionId(null)
        }
    }


    // ========================================================
    // RENDER
    // ========================================================

    return (
        <div className="min-h-full bg-neutral-50 text-neutral-950">
            <div className="mx-auto max-w-[1600px] px-5 py-6 sm:px-7 lg:px-10 lg:py-8">

                {/* ==================================================
                    HEADER
                ================================================== */}

                <div className="flex flex-col gap-6 border-b border-neutral-200 pb-7 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <div className="mb-3 flex items-center gap-2">
                            <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-violet-600">
                                Content / Testimonials
                            </span>

                            <span className="h-1 w-1 rounded-full bg-neutral-300" />

                            <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-neutral-400">
                                Customer Voice
                            </span>
                        </div>

                        <h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                            Testimonials
                        </h1>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
                            Review customer testimonials before
                            publishing them across the 39Production
                            website.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            void fetchTestimonials(
                                true,
                            )
                        }
                        disabled={refreshing}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-800 shadow-sm transition hover:border-neutral-300 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <RefreshCw
                            className={
                                `h-4 w-4 ${refreshing
                                    ? 'animate-spin'
                                    : ''
                                }`
                            }
                        />

                        Refresh
                    </button>
                </div>


                {/* ==================================================
                    FEEDBACK
                ================================================== */}

                {error && (
                    <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        <XCircle className="mt-0.5 h-4 w-4 shrink-0" />

                        <div className="flex-1">
                            {error}
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                setError('')
                            }
                            className="text-red-500 hover:text-red-700"
                            aria-label="Dismiss error"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {success && (
                    <div className="mt-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        {success}
                    </div>
                )}


                {/* ==================================================
                    STATS
                ================================================== */}

                <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                    {[
                        {
                            label: 'All',
                            value: counts.all,
                            icon: MessageSquareQuote,
                            filter: 'All' as FilterStatus,
                        },
                        {
                            label: 'Pending',
                            value: counts.pending,
                            icon: Clock3,
                            filter: 'Pending' as FilterStatus,
                        },
                        {
                            label: 'Published',
                            value: counts.published,
                            icon: CheckCircle2,
                            filter: 'Published' as FilterStatus,
                        },
                        {
                            label: 'Rejected',
                            value: counts.rejected,
                            icon: XCircle,
                            filter: 'Rejected' as FilterStatus,
                        },
                        {
                            label: 'Featured',
                            value: counts.featured,
                            icon: Star,
                            filter: 'Published' as FilterStatus,
                        },
                    ].map((item) => {
                        const Icon =
                            item.icon

                        return (
                            <button
                                key={item.label}
                                type="button"
                                onClick={() =>
                                    setFilter(
                                        item.filter,
                                    )
                                }
                                className={`group rounded-2xl border bg-white p-5 text-left shadow-sm transition ${filter ===
                                    item.filter
                                    ? 'border-violet-300 ring-2 ring-violet-100'
                                    : 'border-neutral-200 hover:border-neutral-300'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600 transition group-hover:bg-violet-50 group-hover:text-violet-600">
                                        <Icon className="h-4 w-4" />
                                    </div>

                                    <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-neutral-400">
                                        {item.label}
                                    </span>
                                </div>

                                <p className="mt-5 text-2xl font-semibold tracking-tight">
                                    {item.value}
                                </p>
                            </button>
                        )
                    })}
                </div>


                {/* ==================================================
                    TOOLBAR
                ================================================== */}

                <div className="mt-7 flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
                    <div className="relative w-full lg:max-w-md">
                        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />

                        <input
                            type="search"
                            value={search}
                            onChange={(
                                event,
                            ) =>
                                setSearch(
                                    event.target.value,
                                )
                            }
                            placeholder="Search customer, company, project..."
                            className="h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-11 pr-4 text-sm outline-none transition focus:border-violet-300 focus:bg-white focus:ring-2 focus:ring-violet-100"
                        />
                    </div>

                    <div className="flex overflow-x-auto rounded-xl border border-neutral-200 bg-neutral-50 p-1">
                        {(
                            [
                                'All',
                                'Pending',
                                'Published',
                                'Rejected',
                            ] as FilterStatus[]
                        ).map(
                            (item) => (
                                <button
                                    key={item}
                                    type="button"
                                    onClick={() =>
                                        setFilter(
                                            item,
                                        )
                                    }
                                    className={`whitespace-nowrap rounded-lg px-4 py-2 text-xs font-medium transition ${filter ===
                                        item
                                        ? 'bg-white text-neutral-950 shadow-sm'
                                        : 'text-neutral-500 hover:text-neutral-900'
                                        }`}
                                >
                                    {item}
                                </button>
                            ),
                        )}
                    </div>
                </div>


                {/* ==================================================
                    CONTENT
                ================================================== */}

                <div className="mt-6 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                    {loading ? (
                        <div className="divide-y divide-neutral-100">
                            {Array.from({
                                length: 5,
                            }).map(
                                (
                                    _,
                                    index,
                                ) => (
                                    <div
                                        key={
                                            index
                                        }
                                        className="animate-pulse p-6"
                                    >
                                        <div className="h-4 w-48 rounded bg-neutral-100" />

                                        <div className="mt-3 h-3 w-80 rounded bg-neutral-100" />

                                        <div className="mt-5 h-12 w-full rounded bg-neutral-100" />
                                    </div>
                                ),
                            )}
                        </div>
                    ) : filteredTestimonials.length ===
                        0 ? (
                        <div className="flex min-h-[420px] flex-col items-center justify-center px-6 text-center">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400">
                                <MessageSquareQuote className="h-6 w-6" />
                            </div>

                            <h2 className="mt-5 text-lg font-semibold">
                                No testimonials found
                            </h2>

                            <p className="mt-2 max-w-md text-sm leading-6 text-neutral-500">
                                There are no testimonials matching
                                the current filter or search.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* ==================================================
                                DESKTOP
                            ================================================== */}

                            <div className="hidden overflow-x-auto lg:block">
                                <table className="w-full min-w-[1050px]">
                                    <thead>
                                        <tr className="border-b border-neutral-200 bg-neutral-50/80 text-left">
                                            <th className="px-6 py-4 font-mono text-[9px] font-medium uppercase tracking-[0.15em] text-neutral-400">
                                                Customer
                                            </th>

                                            <th className="px-6 py-4 font-mono text-[9px] font-medium uppercase tracking-[0.15em] text-neutral-400">
                                                Testimonial
                                            </th>

                                            <th className="px-6 py-4 font-mono text-[9px] font-medium uppercase tracking-[0.15em] text-neutral-400">
                                                Rating
                                            </th>

                                            <th className="px-6 py-4 font-mono text-[9px] font-medium uppercase tracking-[0.15em] text-neutral-400">
                                                Status
                                            </th>

                                            <th className="px-6 py-4 font-mono text-[9px] font-medium uppercase tracking-[0.15em] text-neutral-400">
                                                Submitted
                                            </th>

                                            <th className="px-6 py-4 text-right font-mono text-[9px] font-medium uppercase tracking-[0.15em] text-neutral-400">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-neutral-100">
                                        {filteredTestimonials.map(
                                            (
                                                testimonial,
                                            ) => {
                                                const busy =
                                                    actionId ===
                                                    testimonial.id

                                                return (
                                                    <tr
                                                        key={
                                                            testimonial.id
                                                        }
                                                        className="group transition hover:bg-neutral-50/70"
                                                    >
                                                        <td className="px-6 py-5 align-top">
                                                            <p className="font-medium text-neutral-950">
                                                                {
                                                                    testimonial.name
                                                                }
                                                            </p>

                                                            {(testimonial.role ||
                                                                testimonial.company) && (
                                                                    <p className="mt-1 text-xs text-neutral-500">
                                                                        {[
                                                                            testimonial.role,
                                                                            testimonial.company,
                                                                        ]
                                                                            .filter(
                                                                                Boolean,
                                                                            )
                                                                            .join(
                                                                                ' · ',
                                                                            )}
                                                                    </p>
                                                                )}

                                                            {testimonial.project && (
                                                                <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.12em] text-violet-600">
                                                                    {
                                                                        testimonial.project
                                                                    }
                                                                </p>
                                                            )}
                                                        </td>

                                                        <td className="max-w-[460px] px-6 py-5 align-top">
                                                            <p className="line-clamp-3 text-sm leading-6 text-neutral-600">
                                                                “
                                                                {
                                                                    testimonial.content
                                                                }
                                                                ”
                                                            </p>
                                                        </td>

                                                        <td className="px-6 py-5 align-top">
                                                            <div className="flex items-center gap-1">
                                                                {Array.from(
                                                                    {
                                                                        length: 5,
                                                                    },
                                                                ).map(
                                                                    (
                                                                        _,
                                                                        index,
                                                                    ) => (
                                                                        <Star
                                                                            key={
                                                                                index
                                                                            }
                                                                            className={`h-3.5 w-3.5 ${index <
                                                                                testimonial.rating
                                                                                ? 'fill-amber-400 text-amber-400'
                                                                                : 'text-neutral-200'
                                                                                }`}
                                                                        />
                                                                    ),
                                                                )}
                                                            </div>

                                                            <p className="mt-1 font-mono text-[9px] text-neutral-400">
                                                                {
                                                                    testimonial.rating
                                                                }
                                                                /5
                                                            </p>
                                                        </td>

                                                        <td className="px-6 py-5 align-top">
                                                            <span
                                                                className={`inline-flex items-center rounded-full border px-3 py-1.5 text-[10px] font-medium ${getStatusClasses(
                                                                    testimonial.status,
                                                                )}`}
                                                            >
                                                                {
                                                                    testimonial.status
                                                                }
                                                            </span>

                                                            {isFeatured(
                                                                testimonial,
                                                            ) && (
                                                                    <span className="mt-2 flex w-fit items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-violet-600">
                                                                        <Star className="h-3 w-3 fill-current" />
                                                                        Featured
                                                                    </span>
                                                                )}
                                                        </td>

                                                        <td className="px-6 py-5 align-top">
                                                            <p className="text-xs text-neutral-600">
                                                                {formatDate(
                                                                    testimonial.created_at,
                                                                )}
                                                            </p>
                                                        </td>

                                                        <td className="px-6 py-5 align-top">
                                                            <div className="flex justify-end gap-2">
                                                                <button
                                                                    type="button"
                                                                    title="View testimonial"
                                                                    onClick={() =>
                                                                        setSelected(
                                                                            testimonial,
                                                                        )
                                                                    }
                                                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-500 transition hover:border-neutral-300 hover:bg-neutral-100 hover:text-neutral-950"
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </button>

                                                                {testimonial.status ===
                                                                    'Pending' && (
                                                                        <>
                                                                            <button
                                                                                type="button"
                                                                                disabled={
                                                                                    busy
                                                                                }
                                                                                title="Approve"
                                                                                onClick={() =>
                                                                                    void updateTestimonial(
                                                                                        testimonial.id,
                                                                                        {
                                                                                            status: 'Published',
                                                                                        },
                                                                                        'Testimonial approved and published.',
                                                                                    )
                                                                                }
                                                                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100 disabled:opacity-50"
                                                                            >
                                                                                <Check className="h-4 w-4" />
                                                                            </button>

                                                                            <button
                                                                                type="button"
                                                                                disabled={
                                                                                    busy
                                                                                }
                                                                                title="Reject"
                                                                                onClick={() =>
                                                                                    void updateTestimonial(
                                                                                        testimonial.id,
                                                                                        {
                                                                                            status: 'Rejected',
                                                                                        },
                                                                                        'Testimonial rejected.',
                                                                                    )
                                                                                }
                                                                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                                                                            >
                                                                                <X className="h-4 w-4" />
                                                                            </button>
                                                                        </>
                                                                    )}

                                                                {testimonial.status ===
                                                                    'Published' && (
                                                                        <button
                                                                            type="button"
                                                                            disabled={
                                                                                busy
                                                                            }
                                                                            title={
                                                                                isFeatured(
                                                                                    testimonial,
                                                                                )
                                                                                    ? 'Remove featured'
                                                                                    : 'Set featured'
                                                                            }
                                                                            onClick={() =>
                                                                                void updateTestimonial(
                                                                                    testimonial.id,
                                                                                    {
                                                                                        is_featured:
                                                                                            !isFeatured(
                                                                                                testimonial,
                                                                                            ),
                                                                                    },
                                                                                    isFeatured(
                                                                                        testimonial,
                                                                                    )
                                                                                        ? 'Testimonial removed from featured.'
                                                                                        : 'Testimonial marked as featured.',
                                                                                )
                                                                            }
                                                                            className={`flex h-9 w-9 items-center justify-center rounded-lg border transition disabled:opacity-50 ${isFeatured(
                                                                                testimonial,
                                                                            )
                                                                                ? 'border-violet-200 bg-violet-50 text-violet-600 hover:bg-violet-100'
                                                                                : 'border-neutral-200 bg-white text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700'
                                                                                }`}
                                                                        >
                                                                            <Star
                                                                                className={`h-4 w-4 ${isFeatured(
                                                                                    testimonial,
                                                                                )
                                                                                    ? 'fill-current'
                                                                                    : ''
                                                                                    }`}
                                                                            />
                                                                        </button>
                                                                    )}

                                                                <button
                                                                    type="button"
                                                                    disabled={
                                                                        busy
                                                                    }
                                                                    title="Delete"
                                                                    onClick={() =>
                                                                        void deleteTestimonial(
                                                                            testimonial,
                                                                        )
                                                                    }
                                                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            },
                                        )}
                                    </tbody>
                                </table>
                            </div>


                            {/* ==================================================
                                MOBILE / TABLET
                            ================================================== */}

                            <div className="divide-y divide-neutral-100 lg:hidden">
                                {filteredTestimonials.map(
                                    (
                                        testimonial,
                                    ) => {
                                        const busy =
                                            actionId ===
                                            testimonial.id

                                        return (
                                            <article
                                                key={
                                                    testimonial.id
                                                }
                                                className="p-5 sm:p-6"
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="min-w-0">
                                                        <p className="font-semibold">
                                                            {
                                                                testimonial.name
                                                            }
                                                        </p>

                                                        {(testimonial.role ||
                                                            testimonial.company) && (
                                                                <p className="mt-1 text-xs text-neutral-500">
                                                                    {[
                                                                        testimonial.role,
                                                                        testimonial.company,
                                                                    ]
                                                                        .filter(
                                                                            Boolean,
                                                                        )
                                                                        .join(
                                                                            ' · ',
                                                                        )}
                                                                </p>
                                                            )}
                                                    </div>

                                                    <span
                                                        className={`shrink-0 rounded-full border px-2.5 py-1 text-[9px] font-medium ${getStatusClasses(
                                                            testimonial.status,
                                                        )}`}
                                                    >
                                                        {
                                                            testimonial.status
                                                        }
                                                    </span>
                                                </div>

                                                <div className="mt-4 flex items-center gap-1">
                                                    {Array.from(
                                                        {
                                                            length: 5,
                                                        },
                                                    ).map(
                                                        (
                                                            _,
                                                            index,
                                                        ) => (
                                                            <Star
                                                                key={
                                                                    index
                                                                }
                                                                className={`h-3.5 w-3.5 ${index <
                                                                    testimonial.rating
                                                                    ? 'fill-amber-400 text-amber-400'
                                                                    : 'text-neutral-200'
                                                                    }`}
                                                            />
                                                        ),
                                                    )}
                                                </div>

                                                <p className="mt-4 text-sm leading-6 text-neutral-600">
                                                    “
                                                    {
                                                        testimonial.content
                                                    }
                                                    ”
                                                </p>

                                                {testimonial.project && (
                                                    <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.12em] text-violet-600">
                                                        {
                                                            testimonial.project
                                                        }
                                                    </p>
                                                )}

                                                <div className="mt-5 flex flex-wrap items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setSelected(
                                                                testimonial,
                                                            )
                                                        }
                                                        className="inline-flex h-9 items-center gap-2 rounded-lg border border-neutral-200 px-3 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100"
                                                    >
                                                        <Eye className="h-3.5 w-3.5" />
                                                        View
                                                    </button>

                                                    {testimonial.status ===
                                                        'Pending' && (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    disabled={
                                                                        busy
                                                                    }
                                                                    onClick={() =>
                                                                        void updateTestimonial(
                                                                            testimonial.id,
                                                                            {
                                                                                status: 'Published',
                                                                            },
                                                                            'Testimonial approved and published.',
                                                                        )
                                                                    }
                                                                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                                                                >
                                                                    <Check className="h-3.5 w-3.5" />
                                                                    Approve
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    disabled={
                                                                        busy
                                                                    }
                                                                    onClick={() =>
                                                                        void updateTestimonial(
                                                                            testimonial.id,
                                                                            {
                                                                                status: 'Rejected',
                                                                            },
                                                                            'Testimonial rejected.',
                                                                        )
                                                                    }
                                                                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                                                                >
                                                                    <X className="h-3.5 w-3.5" />
                                                                    Reject
                                                                </button>
                                                            </>
                                                        )}

                                                    {testimonial.status ===
                                                        'Published' && (
                                                            <button
                                                                type="button"
                                                                disabled={
                                                                    busy
                                                                }
                                                                onClick={() =>
                                                                    void updateTestimonial(
                                                                        testimonial.id,
                                                                        {
                                                                            is_featured:
                                                                                !isFeatured(
                                                                                    testimonial,
                                                                                ),
                                                                        },
                                                                        isFeatured(
                                                                            testimonial,
                                                                        )
                                                                            ? 'Testimonial removed from featured.'
                                                                            : 'Testimonial marked as featured.',
                                                                    )
                                                                }
                                                                className={`inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-medium transition disabled:opacity-50 ${isFeatured(
                                                                    testimonial,
                                                                )
                                                                    ? 'border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100'
                                                                    : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-100'
                                                                    }`}
                                                            >
                                                                <Star
                                                                    className={`h-3.5 w-3.5 ${isFeatured(
                                                                        testimonial,
                                                                    )
                                                                        ? 'fill-current'
                                                                        : ''
                                                                        }`}
                                                                />

                                                                {isFeatured(
                                                                    testimonial,
                                                                )
                                                                    ? 'Featured'
                                                                    : 'Feature'}
                                                            </button>
                                                        )}

                                                    <button
                                                        type="button"
                                                        disabled={
                                                            busy
                                                        }
                                                        onClick={() =>
                                                            void deleteTestimonial(
                                                                testimonial,
                                                            )
                                                        }
                                                        className="inline-flex h-9 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-xs font-medium text-red-600 transition hover:border-red-200 hover:bg-red-50 disabled:opacity-50"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                        Delete
                                                    </button>
                                                </div>

                                                <p className="mt-4 font-mono text-[8px] uppercase tracking-[0.12em] text-neutral-400">
                                                    Submitted{' '}
                                                    {formatDate(
                                                        testimonial.created_at,
                                                    )}
                                                </p>
                                            </article>
                                        )
                                    },
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>


            {/* ============================================================
                DETAIL MODAL
            ============================================================ */}

            {selected && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-950/50 p-4 backdrop-blur-sm"
                    role="dialog"
                    aria-modal="true"
                    onMouseDown={(
                        event,
                    ) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            setSelected(null)
                        }
                    }}
                >
                    <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl">

                        <div className="flex items-start justify-between gap-4 border-b border-neutral-200 p-5 sm:p-6">
                            <div>
                                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-violet-600">
                                    Testimonial Detail
                                </p>

                                <h2 className="mt-2 text-xl font-semibold tracking-tight">
                                    {
                                        selected.name
                                    }
                                </h2>

                                {(selected.role ||
                                    selected.company) && (
                                        <p className="mt-1 text-sm text-neutral-500">
                                            {[
                                                selected.role,
                                                selected.company,
                                            ]
                                                .filter(
                                                    Boolean,
                                                )
                                                .join(
                                                    ' · ',
                                                )}
                                        </p>
                                    )}
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setSelected(null)
                                }
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 transition hover:bg-neutral-950 hover:text-white"
                                aria-label="Close testimonial detail"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>


                        <div className="max-h-[70vh] overflow-y-auto p-5 sm:p-6">

                            <div className="flex flex-wrap items-center gap-3">
                                <span
                                    className={`rounded-full border px-3 py-1.5 text-[10px] font-medium ${getStatusClasses(
                                        selected.status,
                                    )}`}
                                >
                                    {
                                        selected.status
                                    }
                                </span>

                                {isFeatured(
                                    selected,
                                ) && (
                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-[10px] font-medium text-violet-700">
                                            <Star className="h-3 w-3 fill-current" />
                                            Featured
                                        </span>
                                    )}
                            </div>


                            <div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 sm:p-6">
                                <div className="flex items-center gap-1">
                                    {Array.from(
                                        {
                                            length: 5,
                                        },
                                    ).map(
                                        (
                                            _,
                                            index,
                                        ) => (
                                            <Star
                                                key={
                                                    index
                                                }
                                                className={`h-4 w-4 ${index <
                                                    selected.rating
                                                    ? 'fill-amber-400 text-amber-400'
                                                    : 'text-neutral-200'
                                                    }`}
                                            />
                                        ),
                                    )}
                                </div>

                                <blockquote className="mt-5 text-lg font-medium leading-8 tracking-[-0.02em] text-neutral-800">
                                    “
                                    {
                                        selected.content
                                    }
                                    ”
                                </blockquote>
                            </div>


                            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                <div className="rounded-xl border border-neutral-200 p-4">
                                    <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-neutral-400">
                                        Project
                                    </p>

                                    <p className="mt-2 text-sm font-medium text-neutral-800">
                                        {
                                            selected.project ||
                                            '-'
                                        }
                                    </p>
                                </div>

                                <div className="rounded-xl border border-neutral-200 p-4">
                                    <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-neutral-400">
                                        Submitted
                                    </p>

                                    <p className="mt-2 text-sm font-medium text-neutral-800">
                                        {formatDate(
                                            selected.created_at,
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>


                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 bg-neutral-50 p-4 sm:p-5">

                            <div className="flex items-center gap-2">

                                {selected.status ===
                                    'Pending' && (
                                        <>
                                            <button
                                                type="button"
                                                disabled={
                                                    actionId ===
                                                    selected.id
                                                }
                                                onClick={() =>
                                                    void updateTestimonial(
                                                        selected.id,
                                                        {
                                                            status: 'Published',
                                                        },
                                                        'Testimonial approved and published.',
                                                    )
                                                }
                                                className="inline-flex h-10 items-center gap-2 rounded-lg bg-neutral-950 px-4 text-xs font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50"
                                            >
                                                <Check className="h-3.5 w-3.5" />
                                                Approve
                                            </button>

                                            <button
                                                type="button"
                                                disabled={
                                                    actionId ===
                                                    selected.id
                                                }
                                                onClick={() =>
                                                    void updateTestimonial(
                                                        selected.id,
                                                        {
                                                            status: 'Rejected',
                                                        },
                                                        'Testimonial rejected.',
                                                    )
                                                }
                                                className="inline-flex h-10 items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                                            >
                                                <XCircle className="h-3.5 w-3.5" />
                                                Reject
                                            </button>
                                        </>
                                    )}

                                {selected.status ===
                                    'Published' && (
                                        <button
                                            type="button"
                                            disabled={
                                                actionId ===
                                                selected.id
                                            }
                                            onClick={() =>
                                                void updateTestimonial(
                                                    selected.id,
                                                    {
                                                        is_featured:
                                                            !isFeatured(
                                                                selected,
                                                            ),
                                                    },
                                                    isFeatured(
                                                        selected,
                                                    )
                                                        ? 'Testimonial removed from featured.'
                                                        : 'Testimonial marked as featured.',
                                                )
                                            }
                                            className="inline-flex h-10 items-center gap-2 rounded-lg border border-violet-200 bg-violet-50 px-4 text-xs font-semibold text-violet-700 transition hover:bg-violet-100 disabled:opacity-50"
                                        >
                                            <Star
                                                className={`h-3.5 w-3.5 ${isFeatured(
                                                    selected,
                                                )
                                                    ? 'fill-current'
                                                    : ''
                                                    }`}
                                            />

                                            {isFeatured(
                                                selected,
                                            )
                                                ? 'Unfeature'
                                                : 'Feature'}
                                        </button>
                                    )}
                            </div>


                            <button
                                type="button"
                                disabled={
                                    actionId ===
                                    selected.id
                                }
                                onClick={() =>
                                    void deleteTestimonial(
                                        selected,
                                    )
                                }
                                className="inline-flex h-10 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 text-xs font-semibold text-red-600 transition hover:border-red-200 hover:bg-red-50 disabled:opacity-50"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}