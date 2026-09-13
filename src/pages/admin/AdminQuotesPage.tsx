import {
    CheckCircle2,
    ChevronRight,
    Clock3,
    Copy,
    ExternalLink,
    FileText,
    Loader2,
    MessageCircle,
    RefreshCw,
    Search,
    X,
} from 'lucide-react'
import {
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react'
import { authenticatedFetch } from '@/lib/auth'

const API_BASE_URL =
    'https://39production-api.39production.workers.dev'

const PUBLIC_SITE_BASE_URL =
    'https://39production.github.io/39Production'

type ThemeMode =
    | 'dark'
    | 'light'

type QuoteStatus =
    | 'Pending'
    | 'Reviewing'
    | 'Quoted'
    | 'Accepted'
    | 'Rejected'
    | 'Expired'

interface Quote {
    id: number
    quote_number: string
    service_id: number
    service_name: string
    service_category?: string | null
    service_description?: string | null
    pricing_type?:
    | 'fixed'
    | 'starting_from'
    | 'custom_quote'
    | null
    starting_price?: number | null
    customer_name: string
    customer_email: string
    customer_phone: string
    project_name: string
    project_description: string
    budget_range?: string | null
    deadline?: string | null
    reference_url?: string | null
    additional_requirements?: string | null
    proposed_price: number | null
    dp_amount: number | null
    remaining_amount: number | null
    status: QuoteStatus
    expires_at?: string | null
    created_at: string
    updated_at: string
}

interface QuoteResponse {
    success: boolean
    data?: Quote | Quote[]
    message?: string
}

interface UpdateResponse {
    success: boolean
    message?: string
    data?: Quote & {
        public_token?: string
    }
}

/* =========================================================
   THEME
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
   HELPERS
========================================================= */

function formatCurrency(
    value:
        | number
        | null
        | undefined,
) {
    if (
        value === null ||
        value === undefined ||
        Number.isNaN(
            Number(value),
        )
    ) {
        return '-'
    }

    return new Intl.NumberFormat(
        'id-ID',
        {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        },
    ).format(
        Number(value),
    )
}

function formatDate(
    value?: string | null,
) {
    if (!value) return '-'

    const date =
        new Date(value)

    if (
        Number.isNaN(
            date.getTime(),
        )
    ) {
        return '-'
    }

    return new Intl.DateTimeFormat(
        'id-ID',
        {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        },
    ).format(date)
}

function normalizePhone(
    value: string,
) {
    const digits =
        value.replace(
            /\D/g,
            '',
        )

    if (
        digits.startsWith(
            '0',
        )
    ) {
        return `62${digits.slice(
            1,
        )}`
    }

    if (
        digits.startsWith(
            '62',
        )
    ) {
        return digits
    }

    return digits
}

function statusClasses(
    status: QuoteStatus,
    isDark: boolean,
) {
    switch (status) {
        case 'Pending':
            return isDark
                ? 'border-amber-400/20 bg-amber-400/10 text-amber-300'
                : 'border-amber-200 bg-amber-50 text-amber-700'

        case 'Reviewing':
            return isDark
                ? 'border-blue-400/20 bg-blue-400/10 text-blue-300'
                : 'border-blue-200 bg-blue-50 text-blue-700'

        case 'Quoted':
            return isDark
                ? 'border-violet-400/20 bg-violet-400/10 text-violet-300'
                : 'border-violet-200 bg-violet-50 text-violet-700'

        case 'Accepted':
            return isDark
                ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
                : 'border-emerald-200 bg-emerald-50 text-emerald-700'

        case 'Rejected':
            return isDark
                ? 'border-red-400/20 bg-red-400/10 text-red-300'
                : 'border-red-200 bg-red-50 text-red-700'

        default:
            return isDark
                ? 'border-white/10 bg-white/[0.04] text-white/45'
                : 'border-neutral-200 bg-neutral-100 text-neutral-600'
    }
}

function statusIcon(
    status: QuoteStatus,
) {
    if (
        status ===
        'Accepted'
    ) {
        return (
            <CheckCircle2 className="h-3.5 w-3.5" />
        )
    }

    if (
        status ===
        'Pending' ||
        status ===
        'Reviewing'
    ) {
        return (
            <Clock3 className="h-3.5 w-3.5" />
        )
    }

    return (
        <FileText className="h-3.5 w-3.5" />
    )
}

/* =========================================================
   PAGE
========================================================= */

export function AdminQuotesPage() {
    const theme =
        useAdminTheme()

    const isDark =
        theme === 'dark'

    const [
        quotes,
        setQuotes,
    ] = useState<Quote[]>([])

    const [
        search,
        setSearch,
    ] = useState('')

    const [
        statusFilter,
        setStatusFilter,
    ] = useState<
        'All' | QuoteStatus
    >('All')

    const [
        selectedQuote,
        setSelectedQuote,
    ] = useState<Quote | null>(
        null,
    )

    const [
        finalPrice,
        setFinalPrice,
    ] = useState('')

    const [
        status,
        setStatus,
    ] =
        useState<QuoteStatus>(
            'Pending',
        )

    const [
        loading,
        setLoading,
    ] = useState(true)

    const [
        submitting,
        setSubmitting,
    ] = useState(false)

    const [
        error,
        setError,
    ] = useState('')

    const [
        success,
        setSuccess,
    ] = useState('')

    const [
        publicToken,
        setPublicToken,
    ] = useState('')

    /* =====================================================
       THEME TOKENS
    ===================================================== */

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

    const pageBg = isDark
        ? 'bg-[#0b0b0f]'
        : 'bg-[#f7f7fa]'

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

    /* =====================================================
       FETCH
    ===================================================== */

    async function fetchQuotes() {
        try {
            setLoading(true)
            setError('')

            const response =
                await authenticatedFetch(
                    `${API_BASE_URL}/api/quotes`,
                    {
                        method: 'GET',
                        cache: 'no-store',
                    },
                )

            const result: QuoteResponse =
                await response.json()

            if (
                !response.ok ||
                !result.success
            ) {
                throw new Error(
                    result.message ||
                    `Failed to load quotes (${response.status})`,
                )
            }

            const data =
                Array.isArray(
                    result.data,
                )
                    ? result.data
                    : []

            setQuotes(data)
        } catch (err) {
            console.error(
                'Fetch quotes error:',
                err,
            )

            setError(
                err instanceof
                    Error
                    ? err.message
                    : 'Failed to load quotes.',
            )
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        void fetchQuotes()
    }, [])

    /* =====================================================
       FILTER
    ===================================================== */

    const filteredQuotes =
        useMemo(() => {
            const keyword =
                search
                    .trim()
                    .toLowerCase()

            return quotes.filter(
                (quote) => {
                    const matchesSearch =
                        !keyword ||
                        quote.quote_number
                            .toLowerCase()
                            .includes(
                                keyword,
                            ) ||
                        quote.customer_name
                            .toLowerCase()
                            .includes(
                                keyword,
                            ) ||
                        quote.customer_email
                            .toLowerCase()
                            .includes(
                                keyword,
                            ) ||
                        quote.service_name
                            .toLowerCase()
                            .includes(
                                keyword,
                            ) ||
                        quote.project_name
                            .toLowerCase()
                            .includes(
                                keyword,
                            )

                    const matchesStatus =
                        statusFilter ===
                        'All' ||
                        quote.status ===
                        statusFilter

                    return (
                        matchesSearch &&
                        matchesStatus
                    )
                },
            )
        }, [
            quotes,
            search,
            statusFilter,
        ])

    const pendingCount =
        quotes.filter(
            (quote) =>
                quote.status ===
                'Pending',
        ).length

    const reviewingCount =
        quotes.filter(
            (quote) =>
                quote.status ===
                'Reviewing',
        ).length

    const quotedCount =
        quotes.filter(
            (quote) =>
                quote.status ===
                'Quoted',
        ).length

    const acceptedCount =
        quotes.filter(
            (quote) =>
                quote.status ===
                'Accepted',
        ).length

    /* =====================================================
       OPEN / CLOSE
    ===================================================== */

    function openQuote(
        quote: Quote,
    ) {
        setSelectedQuote(
            quote,
        )

        setFinalPrice(
            quote.proposed_price
                ? String(
                    quote.proposed_price,
                )
                : '',
        )

        setStatus(
            quote.status,
        )

        setPublicToken('')
        setError('')
        setSuccess('')
    }

    function closeQuote() {
        if (submitting) {
            return
        }

        setSelectedQuote(null)
        setPublicToken('')
        setError('')
    }

    /* =====================================================
       UPDATE QUOTE
    ===================================================== */

    async function updateQuote(
        nextStatus?: QuoteStatus,
    ) {
        if (!selectedQuote) {
            return
        }

        const numericPrice =
            finalPrice.trim()
                ? Number(
                    finalPrice.replace(
                        /[^0-9]/g,
                        '',
                    ),
                )
                : null

        const effectiveStatus =
            nextStatus || status

        if (
            effectiveStatus ===
            'Quoted' &&
            (!numericPrice ||
                numericPrice <= 0)
        ) {
            setError(
                'Masukkan harga final terlebih dahulu sebelum membuat quotation.',
            )

            return
        }

        let whatsappWindow:
            | Window
            | null = null

        if (
            effectiveStatus ===
            'Quoted'
        ) {
            whatsappWindow =
                window.open(
                    'about:blank',
                    '_blank',
                )
        }

        try {
            setSubmitting(true)
            setError('')
            setSuccess('')

            const response =
                await authenticatedFetch(
                    `${API_BASE_URL}/api/quotes/${selectedQuote.id}`,
                    {
                        method: 'PUT',
                        headers: {
                            'Content-Type':
                                'application/json',
                        },
                        body: JSON.stringify(
                            {
                                proposed_price:
                                    numericPrice,
                                status:
                                    effectiveStatus,
                            },
                        ),
                    },
                )

            const result: UpdateResponse =
                await response.json()

            if (
                !response.ok ||
                !result.success ||
                !result.data
            ) {
                throw new Error(
                    result.message ||
                    `Failed to update quote (${response.status})`,
                )
            }

            setQuotes(
                (current) =>
                    current.map(
                        (
                            item,
                        ) =>
                            item.id ===
                                result.data!
                                    .id
                                ? result.data!
                                : item,
                    ),
            )

            setSelectedQuote(
                result.data,
            )

            setStatus(
                result.data.status,
            )

            setFinalPrice(
                result.data
                    .proposed_price
                    ? String(
                        result.data
                            .proposed_price,
                    )
                    : '',
            )

            if (
                result.data
                    .public_token
            ) {
                setPublicToken(
                    result.data
                        .public_token,
                )
            }

            if (
                effectiveStatus ===
                'Quoted'
            ) {
                if (
                    !result.data
                        .public_token
                ) {
                    if (
                        whatsappWindow
                    ) {
                        whatsappWindow.close()
                    }

                    setError(
                        'Quote tersimpan sebagai Quoted, tetapi public_token tidak diterima dari Worker. Pastikan Worker API terbaru sudah di-deploy.',
                    )

                    return
                }

                setPublicToken(
                    result.data
                        .public_token,
                )

                const quoteUrl =
                    getQuoteUrl(
                        result.data
                            .public_token,
                    )

                const price =
                    Number(
                        result.data
                            .proposed_price ||
                        numericPrice ||
                        0,
                    )

                const dp =
                    Number(
                        result.data
                            .dp_amount ||
                        Math.ceil(
                            price /
                            2,
                        ),
                    )

                const phone =
                    normalizePhone(
                        result.data
                            .customer_phone ||
                        selectedQuote.customer_phone,
                    )

                const message = [
                    `Halo ${result.data
                        .customer_name ||
                    selectedQuote.customer_name
                    },`,
                    '',
                    'Terima kasih sudah menghubungi 39Production.',
                    `Quotation untuk project *${result.data
                        .project_name ||
                    selectedQuote.project_name
                    }* sudah siap.`,
                    '',
                    `Layanan: ${result.data
                        .service_name ||
                    selectedQuote.service_name
                    }`,
                    `Total: ${formatCurrency(
                        price,
                    )}`,
                    `DP: ${formatCurrency(
                        dp,
                    )}`,
                    '',
                    'Silakan buka link berikut untuk melihat detail quotation, menerima deal, dan melanjutkan pembayaran DP:',
                    quoteUrl,
                    '',
                    'Terima kasih.',
                    '39Production',
                ].join('\n')

                const whatsappUrl =
                    phone
                        ? `https://wa.me/${phone}?text=${encodeURIComponent(
                            message,
                        )}`
                        : ''

                if (
                    whatsappUrl
                ) {
                    if (
                        whatsappWindow
                    ) {
                        whatsappWindow.location.href =
                            whatsappUrl
                    } else {
                        window.open(
                            whatsappUrl,
                            '_blank',
                            'noopener,noreferrer',
                        )
                    }
                } else if (
                    whatsappWindow
                ) {
                    whatsappWindow.close()
                }

                setSuccess(
                    'Quotation berhasil dibuat dan WhatsApp customer sudah disiapkan dengan link quotation.',
                )
            } else {
                if (
                    whatsappWindow
                ) {
                    whatsappWindow.close()
                }

                setSuccess(
                    'Quote berhasil diperbarui.',
                )
            }
        } catch (err) {
            if (
                whatsappWindow
            ) {
                whatsappWindow.close()
            }

            console.error(
                'Update quote error:',
                err,
            )

            setError(
                err instanceof
                    Error
                    ? err.message
                    : 'Failed to update quote.',
            )
        } finally {
            setSubmitting(false)
        }
    }

    /* =====================================================
       PUBLIC URL
    ===================================================== */

    function getQuoteUrl(
        token = publicToken,
    ) {
        if (!token) {
            return ''
        }

        return `${PUBLIC_SITE_BASE_URL}/quote/${encodeURIComponent(
            token,
        )}`
    }

    /* =====================================================
       WHATSAPP
    ===================================================== */

    function sendWhatsApp() {
        if (
            !selectedQuote ||
            !publicToken
        ) {
            setError(
                'Buat atau update quotation ke status Quoted terlebih dahulu agar link publik tersedia.',
            )

            return
        }

        const quoteUrl =
            getQuoteUrl()

        const price =
            Number(
                selectedQuote.proposed_price ||
                finalPrice ||
                0,
            )

        const dp =
            Number(
                selectedQuote.dp_amount ||
                Math.ceil(
                    price / 2,
                ),
            )

        const message = [
            `Halo ${selectedQuote.customer_name},`,
            '',
            'Terima kasih sudah menghubungi 39Production.',
            `Quotation untuk project *${selectedQuote.project_name}* sudah siap.`,
            '',
            `Layanan: ${selectedQuote.service_name}`,
            `Total: ${formatCurrency(
                price,
            )}`,
            `DP: ${formatCurrency(
                dp,
            )}`,
            '',
            'Silakan buka link berikut untuk melihat detail quotation, menerima deal, dan melanjutkan pembayaran DP:',
            quoteUrl,
            '',
            'Terima kasih.',
            '39Production',
        ].join('\n')

        const phone =
            normalizePhone(
                selectedQuote.customer_phone,
            )

        window.open(
            `https://wa.me/${phone}?text=${encodeURIComponent(
                message,
            )}`,
            '_blank',
            'noopener,noreferrer',
        )
    }

    /* =====================================================
       COPY LINK
    ===================================================== */

    async function copyQuoteLink() {
        const url =
            getQuoteUrl()

        if (!url) {
            return
        }

        try {
            await navigator.clipboard.writeText(
                url,
            )

            setSuccess(
                'Link quotation berhasil disalin.',
            )
        } catch {
            setError(
                'Browser tidak mengizinkan penyalinan otomatis. Silakan salin link secara manual.',
            )
        }
    }

    return (
        <div
            className={`
                min-h-full
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
                    gap-4
                    lg:flex-row
                    lg:items-end
                    lg:justify-between
                "
            >
                <div>
                    <div
                        className={`
                            mb-3
                            inline-flex
                            items-center
                            gap-2
                            rounded-full
                            border
                            px-3
                            py-1.5
                            text-[10px]
                            font-bold
                            uppercase
                            tracking-[0.16em]

                            ${isDark
                                ? 'border-violet-400/20 bg-violet-500/10 text-violet-300'
                                : 'border-violet-200 bg-violet-50 text-violet-700'
                            }
                        `}
                    >
                        <FileText className="h-3.5 w-3.5" />

                        Service Quotes
                    </div>

                    <h1
                        className="
                            text-3xl
                            font-bold
                            tracking-[-0.035em]
                        "
                    >
                        Quotation Management
                    </h1>

                    <p
                        className={`
                            mt-2
                            max-w-2xl
                            text-sm
                            leading-6

                            ${secondaryText}
                        `}
                    >
                        Kelola request layanan
                        non-fixed, masukkan
                        harga final hasil
                        negosiasi, lalu kirim
                        quotation ke customer.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() =>
                        void fetchQuotes()
                    }
                    disabled={
                        loading
                    }
                    className={`
                        inline-flex
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        border
                        px-4
                        py-2.5
                        text-sm
                        font-semibold
                        transition-all
                        disabled:cursor-not-allowed
                        disabled:opacity-50

                        ${border}

                        ${isDark
                            ? 'bg-white/[0.02] text-white/65 hover:bg-white/[0.05] hover:text-white'
                            : 'bg-white text-neutral-700 hover:bg-neutral-50 hover:text-neutral-950'
                        }
                    `}
                >
                    <RefreshCw
                        className={`
                            h-4
                            w-4

                            ${loading
                                ? 'animate-spin'
                                : ''
                            }
                        `}
                    />

                    Refresh
                </button>
            </div>

            {/* =================================================
                STATS
            ================================================= */}
            <div
                className="
                    grid
                    grid-cols-2
                    gap-4
                    lg:grid-cols-4
                "
            >
                <StatCard
                    label="Pending"
                    value={
                        pendingCount
                    }
                    description="Request baru"
                    isDark={
                        isDark
                    }
                    accent="amber"
                />

                <StatCard
                    label="Reviewing"
                    value={
                        reviewingCount
                    }
                    description="Sedang dinegosiasikan"
                    isDark={
                        isDark
                    }
                    accent="blue"
                />

                <StatCard
                    label="Quoted"
                    value={
                        quotedCount
                    }
                    description="Menunggu customer"
                    isDark={
                        isDark
                    }
                    accent="violet"
                />

                <StatCard
                    label="Accepted"
                    value={
                        acceptedCount
                    }
                    description="Deal diterima"
                    isDark={
                        isDark
                    }
                    accent="green"
                />
            </div>

            {error &&
                !selectedQuote && (
                    <Alert
                        type="error"
                        message={error}
                        isDark={
                            isDark
                        }
                    />
                )}

            {success &&
                !selectedQuote && (
                    <Alert
                        type="success"
                        message={success}
                        isDark={
                            isDark
                        }
                    />
                )}

            {/* =================================================
                SEARCH + FILTER
            ================================================= */}
            <div
                className={`
                    rounded-2xl
                    border
                    p-4
                    sm:p-5

                    ${cardBg}
                    ${border}
                `}
            >
                <div className="flex flex-col gap-3 lg:flex-row">
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
                            placeholder="Cari quote, customer, layanan, project..."
                            className={`
                                h-11
                                w-full
                                rounded-xl
                                border
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
                            statusFilter
                        }
                        onChange={(
                            event,
                        ) =>
                            setStatusFilter(
                                event
                                    .target
                                    .value as
                                | 'All'
                                | QuoteStatus,
                            )
                        }
                        className={`
                            h-11
                            rounded-xl
                            border
                            px-4
                            text-sm
                            outline-none

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
                            Semua Status
                        </option>

                        <option value="Pending">
                            Pending
                        </option>

                        <option value="Reviewing">
                            Reviewing
                        </option>

                        <option value="Quoted">
                            Quoted
                        </option>

                        <option value="Accepted">
                            Accepted
                        </option>

                        <option value="Rejected">
                            Rejected
                        </option>

                        <option value="Expired">
                            Expired
                        </option>
                    </select>
                </div>
            </div>

            {/* =================================================
                TABLE
            ================================================= */}
            <div
                className={`
                    overflow-hidden
                    rounded-2xl
                    border

                    ${cardBg}
                    ${border}
                `}
            >
                {loading ? (
                    <div className="flex min-h-64 items-center justify-center">
                        <Loader2 className="h-7 w-7 animate-spin text-violet-500" />
                    </div>
                ) : filteredQuotes.length ===
                    0 ? (
                    <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
                        <div
                            className={`
                                mb-4
                                flex
                                h-12
                                w-12
                                items-center
                                justify-center
                                rounded-xl

                                ${isDark
                                    ? 'bg-white/[0.04] text-white/30'
                                    : 'bg-neutral-100 text-neutral-400'
                                }
                            `}
                        >
                            <FileText className="h-6 w-6" />
                        </div>

                        <h3 className="font-semibold">
                            Belum ada quotation
                            request
                        </h3>

                        <p
                            className={`
                                mt-1
                                max-w-md
                                text-sm
                                ${mutedText}
                            `}
                        >
                            Request dari layanan
                            Starting From dan
                            Custom Quote akan
                            muncul di sini.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px]">
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
                                <tr className="text-left">
                                    <th
                                        className={`
                                            px-5
                                            py-4
                                            text-[10px]
                                            font-bold
                                            uppercase
                                            tracking-[0.12em]

                                            ${mutedText}
                                        `}
                                    >
                                        Quote
                                    </th>

                                    <th
                                        className={`
                                            px-5
                                            py-4
                                            text-[10px]
                                            font-bold
                                            uppercase
                                            tracking-[0.12em]

                                            ${mutedText}
                                        `}
                                    >
                                        Customer
                                    </th>

                                    <th
                                        className={`
                                            px-5
                                            py-4
                                            text-[10px]
                                            font-bold
                                            uppercase
                                            tracking-[0.12em]

                                            ${mutedText}
                                        `}
                                    >
                                        Service /
                                        Project
                                    </th>

                                    <th
                                        className={`
                                            px-5
                                            py-4
                                            text-[10px]
                                            font-bold
                                            uppercase
                                            tracking-[0.12em]

                                            ${mutedText}
                                        `}
                                    >
                                        Price
                                    </th>

                                    <th
                                        className={`
                                            px-5
                                            py-4
                                            text-[10px]
                                            font-bold
                                            uppercase
                                            tracking-[0.12em]

                                            ${mutedText}
                                        `}
                                    >
                                        Status
                                    </th>

                                    <th
                                        className={`
                                            px-5
                                            py-4
                                            text-[10px]
                                            font-bold
                                            uppercase
                                            tracking-[0.12em]

                                            ${mutedText}
                                        `}
                                    >
                                        Date
                                    </th>

                                    <th
                                        className={`
                                            px-5
                                            py-4
                                            text-right
                                            text-[10px]
                                            font-bold
                                            uppercase
                                            tracking-[0.12em]

                                            ${mutedText}
                                        `}
                                    >
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredQuotes.map(
                                    (
                                        quote,
                                    ) => (
                                        <tr
                                            key={
                                                quote.id
                                            }
                                            className={`
                                                border-b
                                                transition-colors
                                                last:border-b-0

                                                ${divider}
                                                ${hoverRow}
                                            `}
                                        >
                                            <td className="px-5 py-4">
                                                <p
                                                    className={`
                                                        font-mono
                                                        text-xs
                                                        font-semibold

                                                        ${isDark
                                                            ? 'text-violet-300'
                                                            : 'text-violet-700'
                                                        }
                                                    `}
                                                >
                                                    {
                                                        quote.quote_number
                                                    }
                                                </p>
                                            </td>

                                            <td className="px-5 py-4">
                                                <p className="text-sm font-semibold">
                                                    {
                                                        quote.customer_name
                                                    }
                                                </p>

                                                <p
                                                    className={`
                                                        mt-1
                                                        text-xs

                                                        ${mutedText}
                                                    `}
                                                >
                                                    {
                                                        quote.customer_email
                                                    }
                                                </p>
                                            </td>

                                            <td className="px-5 py-4">
                                                <p className="text-sm font-semibold">
                                                    {
                                                        quote.service_name
                                                    }
                                                </p>

                                                <p
                                                    className={`
                                                        mt-1
                                                        text-xs

                                                        ${mutedText}
                                                    `}
                                                >
                                                    {
                                                        quote.project_name
                                                    }
                                                </p>
                                            </td>

                                            <td className="px-5 py-4">
                                                <p className="text-sm font-semibold">
                                                    {quote.proposed_price
                                                        ? formatCurrency(
                                                            quote.proposed_price,
                                                        )
                                                        : 'Belum ditentukan'}
                                                </p>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span
                                                    className={`
                                                        inline-flex
                                                        items-center
                                                        gap-1.5
                                                        rounded-full
                                                        border
                                                        px-2.5
                                                        py-1
                                                        text-[11px]
                                                        font-bold

                                                        ${statusClasses(
                                                        quote.status,
                                                        isDark,
                                                    )}
                                                    `}
                                                >
                                                    {statusIcon(
                                                        quote.status,
                                                    )}

                                                    {
                                                        quote.status
                                                    }
                                                </span>
                                            </td>

                                            <td
                                                className={`
                                                    px-5
                                                    py-4
                                                    text-sm

                                                    ${mutedText}
                                                `}
                                            >
                                                {formatDate(
                                                    quote.created_at,
                                                )}
                                            </td>

                                            <td className="px-5 py-4 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openQuote(
                                                            quote,
                                                        )
                                                    }
                                                    className={`
                                                        inline-flex
                                                        items-center
                                                        gap-1.5
                                                        rounded-lg
                                                        border
                                                        px-3
                                                        py-2
                                                        text-xs
                                                        font-semibold
                                                        transition-all

                                                        ${border}

                                                        ${isDark
                                                            ? 'bg-white/[0.02] text-white/65 hover:border-violet-400/30 hover:text-violet-300'
                                                            : 'bg-white text-neutral-700 hover:border-violet-300 hover:text-violet-700'
                                                        }
                                                    `}
                                                >
                                                    Detail

                                                    <ChevronRight className="h-3.5 w-3.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ),
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* =================================================
                DETAIL MODAL
            ================================================= */}
            {selectedQuote && (
                <div
                    className="
                        fixed
                        inset-0
                        z-50
                        flex
                        items-center
                        justify-center
                        overflow-y-auto
                        bg-black/60
                        p-4
                        backdrop-blur-md
                    "
                >
                    <button
                        type="button"
                        aria-label="Close quotation"
                        className="
                            fixed
                            inset-0
                            cursor-default
                        "
                        onClick={
                            closeQuote
                        }
                    />

                    <div
                        className={`
                            relative
                            my-8
                            w-full
                            max-w-5xl
                            overflow-hidden
                            rounded-3xl
                            border
                            shadow-2xl

                            ${cardBg}
                            ${border}
                        `}
                    >
                        <div
                            className="
                                h-1
                                bg-gradient-to-r
                                from-violet-600
                                via-fuchsia-500
                                to-pink-500
                            "
                        />

                        {/* Modal Header */}
                        <div
                            className={`
                                flex
                                items-start
                                justify-between
                                gap-5
                                border-b
                                p-6

                                ${divider}
                            `}
                        >
                            <div>
                                <p
                                    className="
                                        font-mono
                                        text-xs
                                        font-semibold
                                        text-violet-500
                                    "
                                >
                                    {
                                        selectedQuote.quote_number
                                    }
                                </p>

                                <h2
                                    className="
                                        mt-1
                                        text-xl
                                        font-bold
                                        tracking-[-0.025em]
                                    "
                                >
                                    {
                                        selectedQuote.project_name
                                    }
                                </h2>

                                <p
                                    className={`
                                        mt-1
                                        text-sm

                                        ${mutedText}
                                    `}
                                >
                                    {
                                        selectedQuote.service_name
                                    }

                                    {' · '}

                                    {
                                        selectedQuote.customer_name
                                    }
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={
                                    closeQuote
                                }
                                className={`
                                    rounded-xl
                                    border
                                    p-2
                                    transition-colors

                                    ${border}

                                    ${isDark
                                        ? 'text-white/40 hover:bg-white/[0.04] hover:text-white'
                                        : 'text-neutral-400 hover:bg-neutral-50 hover:text-neutral-950'
                                    }
                                `}
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div
                            className={`
                                grid
                                max-h-[75vh]
                                overflow-y-auto
                                lg:grid-cols-[1.15fr_0.85fr]

                                ${isDark
                                    ? 'bg-[#0f0f13]/40'
                                    : 'bg-neutral-50/60'
                                }
                            `}
                        >
                            {/* =================================================
                                LEFT
                            ================================================= */}
                            <div
                                className={`
                                    space-y-6
                                    p-6
                                    lg:border-r

                                    ${divider}
                                `}
                            >
                                <Section
                                    title="Customer"
                                    isDark={
                                        isDark
                                    }
                                >
                                    <InfoRow
                                        label="Nama"
                                        value={
                                            selectedQuote.customer_name
                                        }
                                        isDark={
                                            isDark
                                        }
                                    />

                                    <InfoRow
                                        label="Email"
                                        value={
                                            selectedQuote.customer_email
                                        }
                                        isDark={
                                            isDark
                                        }
                                    />

                                    <InfoRow
                                        label="WhatsApp"
                                        value={
                                            selectedQuote.customer_phone
                                        }
                                        isDark={
                                            isDark
                                        }
                                    />
                                </Section>

                                <Section
                                    title="Project Request"
                                    isDark={
                                        isDark
                                    }
                                >
                                    <InfoRow
                                        label="Layanan"
                                        value={
                                            selectedQuote.service_name
                                        }
                                        isDark={
                                            isDark
                                        }
                                    />

                                    <InfoRow
                                        label="Kategori"
                                        value={
                                            selectedQuote.service_category ||
                                            '-'
                                        }
                                        isDark={
                                            isDark
                                        }
                                    />

                                    <InfoRow
                                        label="Budget"
                                        value={
                                            selectedQuote.budget_range ||
                                            'Tidak disebutkan'
                                        }
                                        isDark={
                                            isDark
                                        }
                                    />

                                    <InfoRow
                                        label="Deadline"
                                        value={formatDate(
                                            selectedQuote.deadline,
                                        )}
                                        isDark={
                                            isDark
                                        }
                                    />

                                    <div
                                        className={`
                                            mt-4
                                            rounded-xl
                                            border
                                            p-4

                                            ${border}

                                            ${isDark
                                                ? 'bg-[#0f0f13]'
                                                : 'bg-white'
                                            }
                                        `}
                                    >
                                        <p
                                            className={`
                                                text-[10px]
                                                font-bold
                                                uppercase
                                                tracking-[0.12em]

                                                ${mutedText}
                                            `}
                                        >
                                            Deskripsi
                                            Project
                                        </p>

                                        <p
                                            className={`
                                                mt-2
                                                whitespace-pre-wrap
                                                text-sm
                                                leading-6

                                                ${pageText}
                                            `}
                                        >
                                            {
                                                selectedQuote.project_description
                                            }
                                        </p>
                                    </div>

                                    {selectedQuote.additional_requirements && (
                                        <div
                                            className={`
                                                mt-3
                                                rounded-xl
                                                border
                                                p-4

                                                ${border}

                                                ${isDark
                                                    ? 'bg-[#0f0f13]'
                                                    : 'bg-white'
                                                }
                                            `}
                                        >
                                            <p
                                                className={`
                                                    text-[10px]
                                                    font-bold
                                                    uppercase
                                                    tracking-[0.12em]

                                                    ${mutedText}
                                                `}
                                            >
                                                Additional
                                                Requirements
                                            </p>

                                            <p
                                                className={`
                                                    mt-2
                                                    whitespace-pre-wrap
                                                    text-sm
                                                    leading-6

                                                    ${pageText}
                                                `}
                                            >
                                                {
                                                    selectedQuote.additional_requirements
                                                }
                                            </p>
                                        </div>
                                    )}

                                    {selectedQuote.reference_url && (
                                        <a
                                            href={
                                                selectedQuote.reference_url
                                            }
                                            target="_blank"
                                            rel="noreferrer"
                                            className="
                                                mt-3
                                                inline-flex
                                                items-center
                                                gap-2
                                                text-sm
                                                font-semibold
                                                text-violet-500
                                                hover:underline
                                            "
                                        >
                                            Open reference

                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                    )}
                                </Section>
                            </div>

                            {/* =================================================
                                RIGHT
                            ================================================= */}
                            <div
                                className={`
                                    space-y-5
                                    p-6

                                    ${isDark
                                        ? 'bg-[#0b0b0f]/25'
                                        : 'bg-white/50'
                                    }
                                `}
                            >
                                <div>
                                    <p
                                        className="
                                            text-[10px]
                                            font-bold
                                            uppercase
                                            tracking-[0.12em]
                                            text-violet-500
                                        "
                                    >
                                        Negotiation Result
                                    </p>

                                    <p
                                        className={`
                                            mt-1
                                            text-sm
                                            ${mutedText}
                                        `}
                                    >
                                        Harga di bawah
                                        adalah harga
                                        final hasil
                                        kesepakatan
                                        dengan
                                        customer.
                                    </p>
                                </div>

                                {/* Final Price */}
                                <label className="block">
                                    <span
                                        className={`
                                            mb-2
                                            block
                                            text-sm
                                            font-semibold

                                            ${pageText}
                                        `}
                                    >
                                        Harga Final
                                    </span>

                                    <div className="relative">
                                        <span
                                            className={`
                                                pointer-events-none
                                                absolute
                                                left-3
                                                top-1/2
                                                -translate-y-1/2
                                                text-sm

                                                ${mutedText}
                                            `}
                                        >
                                            Rp
                                        </span>

                                        <input
                                            value={
                                                finalPrice
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                setFinalPrice(
                                                    event.target.value.replace(
                                                        /\D/g,
                                                        '',
                                                    ),
                                                )
                                            }
                                            inputMode="numeric"
                                            placeholder="Contoh: 2500000"
                                            className={`
                                                h-12
                                                w-full
                                                rounded-xl
                                                border
                                                pl-10
                                                pr-4
                                                text-sm
                                                font-semibold
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
                                    </div>
                                </label>

                                {/* Status */}
                                <label className="block">
                                    <span
                                        className={`
                                            mb-2
                                            block
                                            text-sm
                                            font-semibold

                                            ${pageText}
                                        `}
                                    >
                                        Status
                                    </span>

                                    <select
                                        value={
                                            status
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            setStatus(
                                                event
                                                    .target
                                                    .value as QuoteStatus,
                                            )
                                        }
                                        className={`
                                            h-12
                                            w-full
                                            rounded-xl
                                            border
                                            px-4
                                            text-sm
                                            outline-none

                                            ${border}
                                            ${inputBg}
                                            ${pageText}

                                            ${isDark
                                                ? 'focus:border-violet-500/50'
                                                : 'focus:border-violet-400'
                                            }
                                        `}
                                    >
                                        <option value="Pending">
                                            Pending
                                        </option>

                                        <option value="Reviewing">
                                            Reviewing
                                        </option>

                                        <option value="Quoted">
                                            Quoted
                                        </option>

                                        <option value="Accepted">
                                            Accepted
                                        </option>

                                        <option value="Rejected">
                                            Rejected
                                        </option>

                                        <option value="Expired">
                                            Expired
                                        </option>
                                    </select>
                                </label>

                                {/* DP / Remaining */}
                                {selectedQuote.proposed_price && (
                                    <div className="grid grid-cols-2 gap-3">
                                        <AmountCard
                                            label="DP (50%)"
                                            value={formatCurrency(
                                                selectedQuote.dp_amount,
                                            )}
                                            isDark={
                                                isDark
                                            }
                                        />

                                        <AmountCard
                                            label="Sisa"
                                            value={formatCurrency(
                                                selectedQuote.remaining_amount,
                                            )}
                                            isDark={
                                                isDark
                                            }
                                        />
                                    </div>
                                )}

                                {error && (
                                    <Alert
                                        type="error"
                                        message={
                                            error
                                        }
                                        isDark={
                                            isDark
                                        }
                                    />
                                )}

                                {success && (
                                    <Alert
                                        type="success"
                                        message={
                                            success
                                        }
                                        isDark={
                                            isDark
                                        }
                                    />
                                )}

                                {/* Save */}
                                <button
                                    type="button"
                                    onClick={() =>
                                        void updateQuote(
                                            status,
                                        )
                                    }
                                    disabled={
                                        submitting
                                    }
                                    className="
                                        inline-flex
                                        h-12
                                        w-full
                                        items-center
                                        justify-center
                                        gap-2
                                        rounded-xl
                                        bg-gradient-to-r
                                        from-violet-600
                                        via-fuchsia-600
                                        to-pink-500
                                        px-4
                                        text-sm
                                        font-bold
                                        text-white
                                        shadow-lg
                                        shadow-violet-500/15
                                        transition-all
                                        hover:-translate-y-0.5
                                        disabled:cursor-not-allowed
                                        disabled:opacity-50
                                    "
                                >
                                    {submitting ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <CheckCircle2 className="h-4 w-4" />
                                    )}

                                    Simpan Quote
                                </button>

                                {/* =================================================
                                    PUBLIC QUOTATION
                                ================================================= */}
                                <div
                                    className={`
                                        border-t
                                        pt-5

                                        ${divider}
                                    `}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p
                                                className="
                                                    text-[10px]
                                                    font-bold
                                                    uppercase
                                                    tracking-[0.12em]
                                                    text-violet-500
                                                "
                                            >
                                                Customer
                                                Quotation
                                                Link
                                            </p>

                                            <p
                                                className={`
                                                    mt-1
                                                    text-xs
                                                    leading-5

                                                    ${mutedText}
                                                `}
                                            >
                                                Link ini membawa
                                                customer langsung
                                                ke halaman
                                                quotation publik
                                                untuk melihat
                                                detail, menerima
                                                deal, dan
                                                melanjutkan
                                                pembayaran DP.
                                            </p>
                                        </div>

                                        {publicToken && (
                                            <span
                                                className={`
                                                    inline-flex
                                                    shrink-0
                                                    items-center
                                                    gap-1.5
                                                    rounded-full
                                                    border
                                                    px-2.5
                                                    py-1
                                                    text-[10px]
                                                    font-bold
                                                    uppercase
                                                    tracking-wider

                                                    ${isDark
                                                        ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
                                                        : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                                    }
                                                `}
                                            >
                                                <CheckCircle2 className="h-3 w-3" />

                                                Published
                                            </span>
                                        )}
                                    </div>

                                    {publicToken ? (
                                        <div className="mt-4 space-y-3">
                                            {/* Link */}
                                            <div>
                                                <label
                                                    className={`
                                                        mb-2
                                                        block
                                                        text-xs
                                                        font-semibold

                                                        ${mutedText}
                                                    `}
                                                >
                                                    Public Quote
                                                    Page
                                                </label>

                                                <div className="flex gap-2">
                                                    <input
                                                        readOnly
                                                        value={getQuoteUrl()}
                                                        className={`
                                                            h-11
                                                            min-w-0
                                                            flex-1
                                                            rounded-xl
                                                            border
                                                            px-3
                                                            text-xs
                                                            outline-none

                                                            ${border}
                                                            ${inputBg}
                                                            ${pageText}
                                                        `}
                                                    />

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            void copyQuoteLink()
                                                        }
                                                        className={`
                                                            inline-flex
                                                            h-11
                                                            shrink-0
                                                            items-center
                                                            gap-2
                                                            rounded-xl
                                                            border
                                                            px-3
                                                            text-xs
                                                            font-semibold
                                                            transition-colors

                                                            ${border}

                                                            ${isDark
                                                                ? 'bg-white/[0.02] text-white/65 hover:bg-white/[0.05] hover:text-white'
                                                                : 'bg-white text-neutral-700 hover:bg-neutral-50 hover:text-neutral-950'
                                                            }
                                                        `}
                                                    >
                                                        <Copy className="h-3.5 w-3.5" />

                                                        Copy
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Buttons */}
                                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                                <a
                                                    href={getQuoteUrl()}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="
                                                        inline-flex
                                                        h-11
                                                        items-center
                                                        justify-center
                                                        gap-2
                                                        rounded-xl
                                                        border
                                                        border-violet-500/20
                                                        bg-violet-500/10
                                                        text-sm
                                                        font-bold
                                                        text-violet-500
                                                        transition
                                                        hover:bg-violet-500/15
                                                    "
                                                >
                                                    <ExternalLink className="h-4 w-4" />

                                                    Buka Quote
                                                    Page
                                                </a>

                                                <button
                                                    type="button"
                                                    onClick={
                                                        sendWhatsApp
                                                    }
                                                    className={`
                                                        inline-flex
                                                        h-11
                                                        items-center
                                                        justify-center
                                                        gap-2
                                                        rounded-xl
                                                        border
                                                        text-sm
                                                        font-bold
                                                        transition

                                                        ${isDark
                                                            ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/15'
                                                            : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                                        }
                                                    `}
                                                >
                                                    <MessageCircle className="h-4 w-4" />

                                                    Kirim via
                                                    WhatsApp
                                                </button>
                                            </div>

                                            {/* WhatsApp Preview */}
                                            <div
                                                className={`
                                                    rounded-xl
                                                    border
                                                    p-4

                                                    ${border}

                                                    ${isDark
                                                        ? 'bg-[#0f0f13]'
                                                        : 'bg-white'
                                                    }
                                                `}
                                            >
                                                <p
                                                    className={`
                                                        text-[10px]
                                                        font-bold
                                                        uppercase
                                                        tracking-[0.12em]

                                                        ${mutedText}
                                                    `}
                                                >
                                                    Pesan
                                                    WhatsApp
                                                </p>

                                                <p
                                                    className={`
                                                        mt-2
                                                        whitespace-pre-wrap
                                                        text-xs
                                                        leading-5

                                                        ${secondaryText}
                                                    `}
                                                >
                                                    {(() => {
                                                        const price =
                                                            Number(
                                                                selectedQuote.proposed_price ||
                                                                finalPrice ||
                                                                0,
                                                            )

                                                        const dp =
                                                            Number(
                                                                selectedQuote.dp_amount ||
                                                                Math.ceil(
                                                                    price /
                                                                    2,
                                                                ),
                                                            )

                                                        return [
                                                            `Halo ${selectedQuote.customer_name},`,
                                                            '',
                                                            'Terima kasih sudah menghubungi 39Production.',
                                                            '',
                                                            `Quotation untuk project *${selectedQuote.project_name}* sudah siap.`,
                                                            '',
                                                            `Layanan: ${selectedQuote.service_name}`,
                                                            `Total: ${formatCurrency(price)}`,
                                                            `DP: ${formatCurrency(dp)}`,
                                                            '',
                                                            'Silakan buka link berikut untuk melihat detail quotation, menerima deal, dan melanjutkan pembayaran DP:',
                                                            '',
                                                            getQuoteUrl(),
                                                            '',
                                                            'Jika sudah sesuai, silakan lanjutkan melalui halaman quotation tersebut.',
                                                            '',
                                                            'Terima kasih.',
                                                            '39Production',
                                                        ].join(
                                                            '\n',
                                                        )
                                                    })()}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            className={`
                                                mt-4
                                                rounded-xl
                                                border
                                                border-dashed
                                                p-4

                                                ${border}

                                                ${isDark
                                                    ? 'bg-[#0f0f13]'
                                                    : 'bg-white'
                                                }
                                            `}
                                        >
                                            <div className="flex items-start gap-3">
                                                <FileText
                                                    className={`
                                                        mt-0.5
                                                        h-4
                                                        w-4
                                                        shrink-0

                                                        ${mutedText}
                                                    `}
                                                />

                                                <div>
                                                    <p className="text-sm font-semibold">
                                                        Quotation
                                                        belum
                                                        diterbitkan
                                                    </p>

                                                    <p
                                                        className={`
                                                            mt-1
                                                            text-xs
                                                            leading-5

                                                            ${mutedText}
                                                        `}
                                                    >
                                                        Masukkan
                                                        harga
                                                        final,
                                                        pilih
                                                        status{' '}
                                                        <strong
                                                            className={
                                                                pageText
                                                            }
                                                        >
                                                            Quoted
                                                        </strong>
                                                        ,
                                                        lalu klik{' '}
                                                        <strong
                                                            className={
                                                                pageText
                                                            }
                                                        >
                                                            Simpan
                                                            Quote
                                                        </strong>
                                                        .
                                                        Setelah
                                                        berhasil,
                                                        sistem
                                                        akan
                                                        membuat
                                                        link
                                                        quotation
                                                        publik
                                                        untuk
                                                        customer.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
    label,
    value,
    description,
    isDark,
    accent,
}: {
    label: string
    value: number
    description: string
    isDark: boolean
    accent:
    | 'violet'
    | 'blue'
    | 'green'
    | 'amber'
}) {
    const iconClass =
        accent === 'amber'
            ? isDark
                ? 'bg-amber-500/10 text-amber-400'
                : 'bg-amber-50 text-amber-600'
            : accent === 'blue'
                ? isDark
                    ? 'bg-blue-500/10 text-blue-400'
                    : 'bg-blue-50 text-blue-600'
                : accent ===
                    'green'
                    ? isDark
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-emerald-50 text-emerald-600'
                    : isDark
                        ? 'bg-violet-500/10 text-violet-400'
                        : 'bg-violet-50 text-violet-600'

    return (
        <div
            className={`
                rounded-2xl
                border
                p-5

                ${isDark
                    ? 'border-white/[0.08] bg-[#15151b]'
                    : 'border-neutral-200 bg-white'
                }
            `}
        >
            <div className="flex items-start justify-between gap-3">
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

                    <p
                        className={`
                            mt-1
                            text-xs

                            ${isDark
                                ? 'text-white/25'
                                : 'text-neutral-400'
                            }
                        `}
                    >
                        {description}
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
                    <FileText className="h-5 w-5" />
                </div>
            </div>
        </div>
    )
}

/* =========================================================
   SECTION
========================================================= */

function Section({
    title,
    children,
    isDark,
}: {
    title: string
    children: ReactNode
    isDark: boolean
}) {
    return (
        <section>
            <h3 className="mb-3 text-sm font-semibold">
                {title}
            </h3>

            <div
                className={`
                    rounded-2xl
                    border
                    p-4

                    ${isDark
                        ? 'border-white/[0.08] bg-[#0f0f13]'
                        : 'border-neutral-200 bg-white'
                    }
                `}
            >
                {children}
            </div>
        </section>
    )
}

/* =========================================================
   INFO ROW
========================================================= */

function InfoRow({
    label,
    value,
    isDark,
}: {
    label: string
    value: string
    isDark: boolean
}) {
    return (
        <div
            className={`
                flex
                gap-4
                border-b
                py-2.5
                last:border-0
                last:pb-0
                first:pt-0

                ${isDark
                    ? 'border-white/[0.06]'
                    : 'border-neutral-100'
                }
            `}
        >
            <span
                className={`
                    w-24
                    shrink-0
                    text-xs

                    ${isDark
                        ? 'text-white/30'
                        : 'text-neutral-400'
                    }
                `}
            >
                {label}
            </span>

            <span
                className="
                    min-w-0
                    flex-1
                    break-words
                    text-sm
                    font-medium
                "
            >
                {value}
            </span>
        </div>
    )
}

/* =========================================================
   AMOUNT CARD
========================================================= */

function AmountCard({
    label,
    value,
    isDark,
}: {
    label: string
    value: string
    isDark: boolean
}) {
    return (
        <div
            className={`
                rounded-xl
                border
                p-4

                ${isDark
                    ? 'border-white/[0.08] bg-[#15151b]'
                    : 'border-neutral-200 bg-white'
                }
            `}
        >
            <p
                className={`
                    text-xs

                    ${isDark
                        ? 'text-white/30'
                        : 'text-neutral-400'
                    }
                `}
            >
                {label}
            </p>

            <p
                className="
                    mt-1
                    text-sm
                    font-bold
                "
            >
                {value}
            </p>
        </div>
    )
}

/* =========================================================
   ALERT
========================================================= */

function Alert({
    type,
    message,
    isDark,
}: {
    type:
    | 'error'
    | 'success'
    message: string
    isDark: boolean
}) {
    return (
        <div
            className={`
                rounded-xl
                border
                px-4
                py-3
                text-sm

                ${type ===
                    'error'
                    ? isDark
                        ? 'border-red-400/20 bg-red-400/10 text-red-300'
                        : 'border-red-200 bg-red-50 text-red-700'
                    : isDark
                        ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
                        : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                }
            `}
        >
            {message}
        </div>
    )
}