import { useEffect, useState } from 'react'
import {
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    Clock3,
    FileText,
    Loader2,
    Mail,
    Phone,
    ShieldCheck,
    Sparkles,
    User,
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

const API_BASE_URL =
    'https://39production-api.39production.workers.dev'

interface PublicQuote {
    id: string
    service_id?: number

    quote_number?: string
    status?: string

    customer_name?: string
    customer_email?: string
    customer_phone?: string

    service_name?: string
    project_name?: string
    project_description?: string
    additional_requirements?: string
    deadline?: string

    pricing_type?: 'fixed' | 'starting_from' | 'custom_quote'

    proposed_price?: number | null
    dp_amount?: number | null
    remaining_amount?: number | null

    expires_at?: string | null
    created_at?: string | null
}

interface QuoteResponse {
    success?: boolean
    data?: PublicQuote
    message?: string
}

interface AcceptResponse {
    success?: boolean
    message?: string
    data?: {
        quote?: PublicQuote
        order_id?: string
        checkout_url?: string
    }
}

interface PaymentData {
    payment_reference: string
    partner_reference_no?: string
    payment_method?: string
    payment_stage?: string
    status?: string

    subtotal?: number
    discount_amount?: number
    final_amount?: number
    dp_amount?: number
    remaining_amount?: number

    qr_content?: string
    qr_url?: string | null
    qr_image?: string | null

    expires_at?: string
}

interface PaymentResponse {
    success?: boolean
    message?: string
    data?: PaymentData
}

interface PaymentStatusResponse {
    success?: boolean
    message?: string
    data?: {
        payment_reference?: string
        status?: string
        payment_status?: string

        order_id?: number | string | null
        order_number?: string | null

        amount?: number | null
        final_amount?: number | null
        dp_amount?: number | null
        remaining_amount?: number | null
    }
}

interface CreatedOrder {
    order_id?: number | string
    order_number?: string
    status?: string
    total_amount?: number
    paid_amount?: number
    remaining_amount?: number
}

function formatRupiah(value?: number | null) {
    if (
        value === null ||
        value === undefined ||
        Number.isNaN(Number(value))
    ) {
        return '-'
    }

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(value))
}

function formatDate(value?: string | null) {
    if (!value) return '-'

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
        return value
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    }).format(date)
}

function getPricingLabel(
    pricingType?: PublicQuote['pricing_type'],
) {
    switch (pricingType) {
        case 'starting_from':
            return 'Starting From'

        case 'custom_quote':
            return 'Custom Quote'

        default:
            return 'Fixed Price'
    }
}

export function QuotePage() {
    const { token } =
        useParams<{ token: string }>()

    const [quote, setQuote] =
        useState<PublicQuote | null>(null)

    const [loading, setLoading] =
        useState(true)

    const [accepting, setAccepting] =
        useState(false)

    const [isSubmitting, setIsSubmitting] =
        useState(false)

    const [error, setError] =
        useState('')

    const [accepted, setAccepted] =
        useState(false)

    const [showCheckout, setShowCheckout] =
        useState(false)

    const [paymentData, setPaymentData] =
        useState<PaymentData | null>(null)

    const [createdOrder, setCreatedOrder] =
        useState<CreatedOrder | null>(null)

    /*
     * ============================================================
     * FETCH PUBLIC QUOTE
     * ============================================================
     */

    useEffect(() => {
        const fetchQuote = async () => {
            if (!token) {
                setError('Link quotation tidak valid.')
                setLoading(false)
                return
            }

            try {
                setLoading(true)
                setError('')

                const response = await fetch(
                    `${API_BASE_URL}/api/quotes/public/${encodeURIComponent(
                        token,
                    )}`,
                )

                const result: QuoteResponse =
                    await response.json()

                if (!response.ok) {
                    throw new Error(
                        result.message ||
                        'Quotation tidak ditemukan atau link sudah tidak berlaku.',
                    )
                }

                if (!result.data) {
                    throw new Error(
                        'Data quotation tidak tersedia.',
                    )
                }

                setQuote(result.data)

                if (
                    result.data.status === 'Accepted'
                ) {
                    setAccepted(true)
                }
            } catch (err) {
                console.error(err)

                setError(
                    err instanceof Error
                        ? err.message
                        : 'Gagal mengambil quotation.',
                )
            } finally {
                setLoading(false)
            }
        }

        void fetchQuote()
    }, [token])

    /*
     * ============================================================
     * ACCEPT DEAL
     * ============================================================
     */

    const handleAccept = async () => {
        if (!token || !quote) return

        try {
            setAccepting(true)
            setError('')

            const response = await fetch(
                `${API_BASE_URL}/api/quotes/public/${encodeURIComponent(
                    token,
                )}/accept`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
            )

            const result: AcceptResponse =
                await response.json()

            if (!response.ok) {
                throw new Error(
                    result.message ||
                    'Quotation gagal diterima.',
                )
            }

            setAccepted(true)

            const acceptedQuote =
                result.data?.quote

            if (acceptedQuote) {
                setQuote((current) => {
                    if (!current) {
                        return acceptedQuote
                    }

                    return {
                        ...current,
                        ...acceptedQuote,
                        id:
                            acceptedQuote.id ||
                            current.id,
                        status: 'Accepted',
                    }
                })
            } else {
                setQuote((current) => {
                    if (!current) return current

                    return {
                        ...current,
                        status: 'Accepted',
                    }
                })
            }

            setShowCheckout(true)
        } catch (err) {
            console.error(err)

            setError(
                err instanceof Error
                    ? err.message
                    : 'Gagal menerima quotation.',
            )
        } finally {
            setAccepting(false)
        }
    }

    /*
     * ============================================================
     * CREATE DP PAYMENT
     * ============================================================
     */

    const handleCreatePayment = async () => {
        if (!quote) return

        if (!quote.service_id) {
            setError(
                'Service ID quotation tidak tersedia.',
            )
            return
        }

        if (
            !quote.proposed_price ||
            Number(quote.proposed_price) <= 0
        ) {
            setError(
                'Harga quotation tidak valid.',
            )
            return
        }

        if (
            !quote.dp_amount ||
            Number(quote.dp_amount) <= 0
        ) {
            setError(
                'Nominal DP quotation tidak valid.',
            )
            return
        }

        if (quote.status !== 'Accepted') {
            setError(
                'Quotation harus diterima terlebih dahulu sebelum melakukan pembayaran.',
            )
            return
        }

        try {
            setIsSubmitting(true)
            setError('')

            const response = await fetch(
                `${API_BASE_URL}/api/payments/create`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        type: 'Service',

                        product_id: null,

                        service_id: Number(
                            quote.service_id,
                        ),

                        quote_id: Number(quote.id),

                        customer_name:
                            quote.customer_name ?? '',

                        customer_email:
                            quote.customer_email ?? '',

                        customer_phone:
                            quote.customer_phone ?? '',

                        quantity: 1,
                    }),
                },
            )

            const result: PaymentResponse =
                await response.json()

            if (!response.ok) {
                throw new Error(
                    result.message ||
                    'Gagal membuat pembayaran DP.',
                )
            }

            if (
                !result.data?.payment_reference
            ) {
                throw new Error(
                    'Payment reference tidak ditemukan.',
                )
            }

            setPaymentData(result.data)
        } catch (err) {
            console.error(err)

            setError(
                err instanceof Error
                    ? err.message
                    : 'Gagal membuat pembayaran.',
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    /*
     * ============================================================
     * PAYMENT STATUS POLLING
     * ============================================================
     */

    useEffect(() => {
        if (!paymentData?.payment_reference) {
            return
        }

        if (createdOrder) {
            return
        }

        let cancelled = false

        let intervalId:
            | ReturnType<typeof setInterval>
            | null = null

        const checkPayment = async () => {
            try {
                const response = await fetch(
                    `${API_BASE_URL}/api/payments/${encodeURIComponent(
                        paymentData.payment_reference,
                    )}/status`,
                )

                const result: PaymentStatusResponse =
                    await response.json()

                if (!response.ok || cancelled) {
                    return
                }

                const status = (
                    result.data?.status ||
                    result.data?.payment_status ||
                    ''
                ).toUpperCase()

                if (
                    status === 'PAID' ||
                    status === 'SUCCESS'
                ) {
                    setCreatedOrder({
                        order_id:
                            result.data?.order_id ??
                            undefined,

                        order_number:
                            result.data?.order_number ??
                            undefined,

                        status,

                        total_amount:
                            result.data?.amount ??
                            result.data?.final_amount ??
                            paymentData.final_amount ??
                            quote?.proposed_price ??
                            undefined,

                        paid_amount:
                            result.data?.dp_amount ??
                            paymentData.dp_amount ??
                            quote?.dp_amount ??
                            undefined,

                        remaining_amount:
                            result.data?.remaining_amount ??
                            paymentData.remaining_amount ??
                            quote?.remaining_amount ??
                            undefined,
                    })

                    if (intervalId) {
                        clearInterval(intervalId)
                        intervalId = null
                    }
                }
            } catch (err) {
                console.error(
                    'Payment status error:',
                    err,
                )
            }
        }

        void checkPayment()

        intervalId = setInterval(() => {
            void checkPayment()
        }, 5000)

        return () => {
            cancelled = true

            if (intervalId) {
                clearInterval(intervalId)
            }
        }
    }, [
        paymentData,
        createdOrder,
        quote,
    ])

    /*
     * ============================================================
     * LOADING
     * ============================================================
     */

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-white">
                <div className="text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-purple-200 bg-purple-50">
                        <Loader2 className="h-7 w-7 animate-spin text-purple-600" />
                    </div>

                    <p className="mt-4 text-sm text-zinc-500">
                        Memuat quotation...
                    </p>
                </div>
            </div>
        )
    }

    /*
     * ============================================================
     * ERROR / NOT FOUND
     * ============================================================
     */

    if (error && !quote) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-white px-6">
                <div className="w-full max-w-lg text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-red-200 bg-red-50">
                        <FileText className="h-7 w-7 text-red-600" />
                    </div>

                    <h1 className="mt-6 text-2xl font-semibold text-zinc-950">
                        Quotation Tidak Ditemukan
                    </h1>

                    <p className="mt-3 text-sm leading-6 text-zinc-500">
                        {error ||
                            'Quotation ini mungkin sudah tidak tersedia atau link yang digunakan tidak valid.'}
                    </p>

                    <Link
                        to="/"
                        className="mt-7 inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
                    >
                        Kembali ke Website
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        )
    }

    if (!quote) {
        return null
    }

    /*
     * ============================================================
     * PAGE
     * ============================================================
     */

    return (
        <div className="min-h-screen bg-white text-zinc-900">
            {/* HEADER */}
            <header className="border-b border-zinc-200 bg-white">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 lg:px-8">
                    <Link
                        to="/"
                        className="flex items-center gap-2 text-sm font-semibold text-zinc-950"
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-950 text-white">
                            <Sparkles className="h-4 w-4" />
                        </div>

                        39Production
                    </Link>

                    <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                        Secure Quotation
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-6 py-10 lg:px-8 lg:py-16">
                {/* BACK */}
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-purple-600"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to 39Production
                </Link>

                {/* HEADING */}
                <div className="mt-8">
                    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                        <div>
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-medium text-purple-700">
                                <FileText className="h-3.5 w-3.5" />
                                Quotation
                            </div>

                            <h1 className="text-3xl font-bold tracking-tight text-zinc-950 md:text-4xl">
                                Project Quotation
                            </h1>

                            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
                                Review the quotation details below. If
                                everything is correct, you can accept the
                                deal and continue to payment.
                            </p>
                        </div>

                        <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                            <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                                Quote Number
                            </p>

                            <p className="mt-1 font-mono text-sm font-medium text-purple-700">
                                {quote.quote_number ?? quote.id}
                            </p>
                        </div>
                    </div>
                </div>

                {/* ERROR */}
                {error && (
                    <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                        {error}
                    </div>
                )}

                {/* STATUS */}
                <div className="mt-8">
                    {accepted ? (
                        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

                            <div>
                                <p className="text-sm font-semibold text-emerald-700">
                                    Quotation Accepted
                                </p>

                                <p className="mt-1 text-sm leading-6 text-emerald-700/80">
                                    Deal telah disetujui. Kamu dapat
                                    melanjutkan ke proses pembayaran DP.
                                </p>
                            </div>
                        </div>
                    ) : quote.status !== 'Quoted' ? (
                        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                            <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

                            <div>
                                <p className="text-sm font-semibold text-amber-700">
                                    Quotation Belum Siap
                                </p>

                                <p className="mt-1 text-sm leading-6 text-amber-700/80">
                                    Status quotation saat ini:{' '}
                                    <span className="font-medium">
                                        {quote.status ?? '-'}
                                    </span>
                                </p>
                            </div>
                        </div>
                    ) : null}
                </div>

                <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
                    {/* MAIN */}
                    <div className="space-y-6">
                        {/* CUSTOMER */}
                        <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-100 bg-purple-50">
                                    <User className="h-5 w-5 text-purple-600" />
                                </div>

                                <div>
                                    <h2 className="text-sm font-semibold text-zinc-950">
                                        Customer
                                    </h2>

                                    <p className="text-xs text-zinc-400">
                                        Contact information
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 grid gap-5 sm:grid-cols-3">
                                <div>
                                    <p className="text-xs text-zinc-400">
                                        Name
                                    </p>

                                    <p className="mt-1 text-sm font-medium text-zinc-800">
                                        {quote.customer_name ?? '-'}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-zinc-400">
                                        Email
                                    </p>

                                    <div className="mt-1 flex items-start gap-2">
                                        <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-400" />

                                        <p className="break-all text-sm text-zinc-700">
                                            {quote.customer_email ?? '-'}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs text-zinc-400">
                                        WhatsApp
                                    </p>

                                    <div className="mt-1 flex items-start gap-2">
                                        <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-400" />

                                        <p className="text-sm text-zinc-700">
                                            {quote.customer_phone ?? '-'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* PROJECT */}
                        <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
                            <div>
                                <p className="text-xs font-medium text-purple-600">
                                    {quote.service_name ?? 'Service'}
                                </p>

                                <h2 className="mt-1 text-xl font-semibold text-zinc-950">
                                    {quote.project_name ?? 'Project'}
                                </h2>
                            </div>

                            <div className="mt-6">
                                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                                    Project Description
                                </p>

                                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-zinc-600">
                                    {quote.project_description || '-'}
                                </p>
                            </div>

                            {quote.additional_requirements && (
                                <div className="mt-6 border-t border-zinc-100 pt-6">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                                        Additional Requirements
                                    </p>

                                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-zinc-600">
                                        {quote.additional_requirements}
                                    </p>
                                </div>
                            )}

                            <div className="mt-6 grid gap-5 border-t border-zinc-100 pt-6 sm:grid-cols-2">
                                <div>
                                    <p className="text-xs text-zinc-400">
                                        Deadline
                                    </p>

                                    <p className="mt-1 text-sm font-medium text-zinc-800">
                                        {quote.deadline || '-'}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-zinc-400">
                                        Quotation Created
                                    </p>

                                    <p className="mt-1 text-sm font-medium text-zinc-800">
                                        {formatDate(quote.created_at)}
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* PRICING */}
                    <aside className="lg:sticky lg:top-6 lg:self-start">
                        <div className="overflow-hidden rounded-3xl border border-purple-200 bg-white shadow-lg shadow-purple-100/40">
                            <div className="border-b border-purple-100 bg-gradient-to-br from-purple-50 via-white to-pink-50 p-6">
                                <p className="text-xs font-semibold uppercase tracking-wider text-purple-600">
                                    Final Quotation
                                </p>

                                <p className="mt-3 text-3xl font-bold tracking-tight text-zinc-950">
                                    {formatRupiah(
                                        quote.proposed_price,
                                    )}
                                </p>

                                <p className="mt-2 text-xs text-zinc-500">
                                    {getPricingLabel(
                                        quote.pricing_type,
                                    )}
                                </p>
                            </div>

                            <div className="space-y-5 p-6">
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-sm text-zinc-500">
                                        Total Project
                                    </span>

                                    <span className="text-sm font-semibold text-zinc-900">
                                        {formatRupiah(
                                            quote.proposed_price,
                                        )}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-sm text-zinc-500">
                                        DP
                                    </span>

                                    <span className="text-sm font-semibold text-zinc-900">
                                        {formatRupiah(
                                            quote.dp_amount,
                                        )}
                                    </span>
                                </div>

                                <div className="border-t border-zinc-100 pt-5">
                                    <div className="flex items-center justify-between gap-4">
                                        <span className="text-sm text-zinc-500">
                                            Remaining
                                        </span>

                                        <span className="text-base font-bold text-zinc-950">
                                            {formatRupiah(
                                                quote.remaining_amount,
                                            )}
                                        </span>
                                    </div>
                                </div>

                                {quote.expires_at && (
                                    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                                        <div className="flex items-center gap-2">
                                            <Clock3 className="h-4 w-4 text-zinc-400" />

                                            <div>
                                                <p className="text-[11px] text-zinc-400">
                                                    Quotation expires
                                                </p>

                                                <p className="mt-0.5 text-xs font-medium text-zinc-700">
                                                    {formatDate(
                                                        quote.expires_at,
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {!accepted &&
                                    quote.status === 'Quoted' && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                void handleAccept()
                                            }
                                            disabled={accepting}
                                            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {accepting ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Accepting...
                                                </>
                                            ) : (
                                                <>
                                                    Accept Deal
                                                    <ArrowRight className="h-4 w-4" />
                                                </>
                                            )}
                                        </button>
                                    )}

                                {accepted &&
                                    !paymentData &&
                                    !createdOrder && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setError('')
                                                setShowCheckout(true)
                                            }}
                                            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 text-sm font-semibold text-white transition hover:bg-purple-700"
                                        >
                                            Continue to Checkout
                                            <ArrowRight className="h-4 w-4" />
                                        </button>
                                    )}

                                <p className="text-center text-[11px] leading-5 text-zinc-400">
                                    Dengan menerima quotation ini, kamu
                                    menyetujui harga final yang telah
                                    dinegosiasikan dengan 39Production.
                                </p>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>

            {/* ============================================================
          CHECKOUT MODAL
      ============================================================ */}

            {showCheckout && (
                <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/50 p-4 backdrop-blur-sm">
                    <div className="flex min-h-full items-center justify-center">
                        <div
                            className="fixed inset-0"
                            onClick={() => {
                                if (
                                    !isSubmitting &&
                                    !paymentData &&
                                    !createdOrder
                                ) {
                                    setShowCheckout(false)
                                }
                            }}
                        />

                        <div className="relative my-4 w-full max-w-xl overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl sm:my-8">
                            {/* TOP ACCENT */}
                            <div className="h-1 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500" />

                            {/* HEADER */}
                            <div className="border-b border-zinc-200 p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-purple-600">
                                            DP Payment
                                        </p>

                                        <h2 className="mt-2 text-2xl font-bold tracking-tight text-zinc-950">
                                            {createdOrder
                                                ? 'Order Berhasil'
                                                : paymentData
                                                    ? 'Scan QRIS'
                                                    : 'Checkout Quotation'}
                                        </h2>
                                    </div>

                                    {!paymentData &&
                                        !createdOrder &&
                                        !isSubmitting && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowCheckout(false)
                                                }
                                                className="rounded-xl border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-500 transition hover:border-zinc-300 hover:text-zinc-900"
                                            >
                                                Close
                                            </button>
                                        )}
                                </div>
                            </div>

                            {/* CONTENT */}
                            <div className="max-h-[calc(100dvh-8rem)] overflow-y-auto overscroll-contain p-6">
                                {/* ORDER SUCCESS */}
                                {createdOrder ? (
                                    <div className="text-center">
                                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50">
                                            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                                        </div>

                                        <h3 className="mt-5 text-xl font-semibold text-zinc-950">
                                            Pembayaran Berhasil
                                        </h3>

                                        <p className="mt-2 text-sm leading-6 text-zinc-500">
                                            DP quotation berhasil diverifikasi
                                            dan order kamu sudah dibuat.
                                        </p>

                                        {createdOrder.order_number && (
                                            <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                                                <p className="text-xs text-zinc-400">
                                                    Order Number
                                                </p>

                                                <p className="mt-1 font-mono text-sm font-semibold text-purple-700">
                                                    {createdOrder.order_number}
                                                </p>
                                            </div>
                                        )}

                                        <div className="mt-5 grid grid-cols-2 gap-3">
                                            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                                                <p className="text-xs text-zinc-400">
                                                    DP Paid
                                                </p>

                                                <p className="mt-1 text-sm font-semibold text-zinc-900">
                                                    {formatRupiah(
                                                        createdOrder.paid_amount,
                                                    )}
                                                </p>
                                            </div>

                                            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                                                <p className="text-xs text-zinc-400">
                                                    Remaining
                                                </p>

                                                <p className="mt-1 text-sm font-semibold text-zinc-900">
                                                    {formatRupiah(
                                                        createdOrder.remaining_amount,
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        {createdOrder.order_number && (
                                            <Link
                                                to={`/order/${encodeURIComponent(
                                                    createdOrder.order_number,
                                                )}`}
                                                className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 text-sm font-semibold text-white transition hover:bg-zinc-800"
                                            >
                                                Track Order
                                                <ArrowRight className="h-4 w-4" />
                                            </Link>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowCheckout(false)
                                            }
                                            className="mt-3 flex h-12 w-full items-center justify-center rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-700 transition hover:border-zinc-300 hover:text-zinc-950"
                                        >
                                            Selesai
                                        </button>
                                    </div>
                                ) : paymentData ? (
                                    /* QRIS */
                                    <div className="text-center">
                                        <p className="text-sm text-zinc-600">
                                            Scan QRIS berikut untuk membayar
                                            DP quotation.
                                        </p>

                                        <div className="mt-6 flex justify-center">
                                            {paymentData.qr_image ? (
                                                <div className="rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm">
                                                    <img
                                                        src={paymentData.qr_image}
                                                        alt="QRIS Payment"
                                                        className="h-64 w-64 object-contain"
                                                    />
                                                </div>
                                            ) : paymentData.qr_url ? (
                                                <div className="rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm">
                                                    <img
                                                        src={paymentData.qr_url}
                                                        alt="QRIS Payment"
                                                        className="h-64 w-64 object-contain"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 p-6">
                                                    <p className="text-xs text-zinc-400">
                                                        QRIS Content
                                                    </p>

                                                    <p className="mt-3 break-all text-xs leading-5 text-zinc-600">
                                                        {paymentData.qr_content}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-6 rounded-2xl border border-purple-200 bg-purple-50 p-5">
                                            <p className="text-xs text-zinc-500">
                                                Total Project
                                            </p>

                                            <p className="mt-1 text-lg font-semibold text-zinc-950">
                                                {formatRupiah(
                                                    paymentData.final_amount ??
                                                    quote.proposed_price,
                                                )}
                                            </p>

                                            <div className="mt-4 flex items-center justify-between border-t border-purple-200 pt-4">
                                                <span className="text-sm text-zinc-600">
                                                    DP
                                                </span>

                                                <span className="text-lg font-bold text-emerald-600">
                                                    {formatRupiah(
                                                        paymentData.dp_amount ??
                                                        quote.dp_amount,
                                                    )}
                                                </span>
                                            </div>

                                            <div className="mt-3 flex items-center justify-between">
                                                <span className="text-sm text-zinc-600">
                                                    Remaining
                                                </span>

                                                <span className="text-sm font-medium text-zinc-800">
                                                    {formatRupiah(
                                                        paymentData.remaining_amount ??
                                                        quote.remaining_amount,
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-zinc-500">
                                            <Loader2 className="h-3.5 w-3.5 animate-spin text-purple-600" />
                                            Menunggu pembayaran...
                                        </div>

                                        <p className="mt-3 text-[11px] leading-5 text-zinc-400">
                                            Jangan tutup halaman ini sampai
                                            pembayaran selesai diverifikasi.
                                        </p>
                                    </div>
                                ) : (
                                    /* CHECKOUT CONFIRMATION */
                                    <div>
                                        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
                                            <div className="flex items-center justify-between gap-4">
                                                <span className="text-sm text-zinc-500">
                                                    Service
                                                </span>

                                                <span className="max-w-[60%] text-right text-sm font-medium text-zinc-900">
                                                    {quote.service_name ?? '-'}
                                                </span>
                                            </div>

                                            <div className="mt-4 flex items-center justify-between">
                                                <span className="text-sm text-zinc-500">
                                                    Final Price
                                                </span>

                                                <span className="text-lg font-semibold text-zinc-950">
                                                    {formatRupiah(
                                                        quote.proposed_price,
                                                    )}
                                                </span>
                                            </div>

                                            <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-4">
                                                <span className="text-sm text-zinc-500">
                                                    DP Payment
                                                </span>

                                                <span className="text-lg font-bold text-emerald-600">
                                                    {formatRupiah(
                                                        quote.dp_amount,
                                                    )}
                                                </span>
                                            </div>

                                            <div className="mt-4 flex items-center justify-between">
                                                <span className="text-sm text-zinc-500">
                                                    Remaining
                                                </span>

                                                <span className="text-sm font-medium text-zinc-700">
                                                    {formatRupiah(
                                                        quote.remaining_amount,
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        {error && (
                                            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                                                {error}
                                            </div>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                void handleCreatePayment()
                                            }
                                            disabled={isSubmitting}
                                            className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-purple-600 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Membuat Pembayaran...
                                                </>
                                            ) : (
                                                <>
                                                    Bayar DP
                                                    <ArrowRight className="h-4 w-4" />
                                                </>
                                            )}
                                        </button>

                                        <p className="mt-4 text-center text-[11px] leading-5 text-zinc-400">
                                            Pembayaran DP menggunakan QRIS.
                                            Order akan dibuat setelah pembayaran
                                            berhasil diverifikasi.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}