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
import { useEffect, useMemo, useState } from 'react'
import { authenticatedFetch } from '@/lib/auth'

const API_BASE_URL = 'https://39production-api.39production.workers.dev'
const PUBLIC_SITE_BASE_URL = 'https://39production.github.io/39Production'

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
    pricing_type?: 'fixed' | 'starting_from' | 'custom_quote' | null
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
    data?: Quote & { public_token?: string }
}

function formatCurrency(value: number | null | undefined) {
    if (value === null || value === undefined || Number.isNaN(Number(value))) return '-'
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(value))
}

function formatDate(value?: string | null) {
    if (!value) return '-'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '-'
    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(date)
}

function normalizePhone(value: string) {
    const digits = value.replace(/\D/g, '')
    if (digits.startsWith('0')) return `62${digits.slice(1)}`
    if (digits.startsWith('62')) return digits
    return digits
}

function statusClasses(status: QuoteStatus) {
    switch (status) {
        case 'Pending':
            return 'border-amber-400/20 bg-amber-400/10 text-amber-300'
        case 'Reviewing':
            return 'border-blue-400/20 bg-blue-400/10 text-blue-300'
        case 'Quoted':
            return 'border-purple-400/20 bg-purple-400/10 text-purple-300'
        case 'Accepted':
            return 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
        case 'Rejected':
            return 'border-red-400/20 bg-red-400/10 text-red-300'
        default:
            return 'border-zinc-400/20 bg-zinc-400/10 text-zinc-300'
    }
}

function statusIcon(status: QuoteStatus) {
    if (status === 'Accepted') return <CheckCircle2 className="h-3.5 w-3.5" />
    if (status === 'Pending' || status === 'Reviewing') return <Clock3 className="h-3.5 w-3.5" />
    return <FileText className="h-3.5 w-3.5" />
}

export function AdminQuotesPage() {
    const [quotes, setQuotes] = useState<Quote[]>([])
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState<'All' | QuoteStatus>('All')
    const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
    const [finalPrice, setFinalPrice] = useState('')
    const [status, setStatus] = useState<QuoteStatus>('Pending')
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [publicToken, setPublicToken] = useState('')

    async function fetchQuotes() {
        try {
            setLoading(true)
            setError('')
            const response = await authenticatedFetch(`${API_BASE_URL}/api/quotes`, {
                method: 'GET',
                cache: 'no-store',
            })
            const result: QuoteResponse = await response.json()
            if (!response.ok || !result.success) {
                throw new Error(result.message || `Failed to load quotes (${response.status})`)
            }
            const data = Array.isArray(result.data) ? result.data : []
            setQuotes(data)
        } catch (err) {
            console.error('Fetch quotes error:', err)
            setError(err instanceof Error ? err.message : 'Failed to load quotes.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        void fetchQuotes()
    }, [])

    const filteredQuotes = useMemo(() => {
        const keyword = search.trim().toLowerCase()
        return quotes.filter((quote) => {
            const matchesSearch =
                !keyword ||
                quote.quote_number.toLowerCase().includes(keyword) ||
                quote.customer_name.toLowerCase().includes(keyword) ||
                quote.customer_email.toLowerCase().includes(keyword) ||
                quote.service_name.toLowerCase().includes(keyword) ||
                quote.project_name.toLowerCase().includes(keyword)
            const matchesStatus = statusFilter === 'All' || quote.status === statusFilter
            return matchesSearch && matchesStatus
        })
    }, [quotes, search, statusFilter])

    const pendingCount = quotes.filter((quote) => quote.status === 'Pending').length
    const reviewingCount = quotes.filter((quote) => quote.status === 'Reviewing').length
    const quotedCount = quotes.filter((quote) => quote.status === 'Quoted').length
    const acceptedCount = quotes.filter((quote) => quote.status === 'Accepted').length

    function openQuote(quote: Quote) {
        setSelectedQuote(quote)
        setFinalPrice(quote.proposed_price ? String(quote.proposed_price) : '')
        setStatus(quote.status)
        setPublicToken('')
        setError('')
        setSuccess('')
    }

    function closeQuote() {
        if (submitting) return
        setSelectedQuote(null)
        setPublicToken('')
        setError('')
    }

    async function updateQuote(nextStatus?: QuoteStatus) {
        if (!selectedQuote) return

        const numericPrice = finalPrice.trim() ? Number(finalPrice.replace(/[^0-9]/g, '')) : null
        const effectiveStatus = nextStatus || status

        if (effectiveStatus === 'Quoted' && (!numericPrice || numericPrice <= 0)) {
            setError('Masukkan harga final terlebih dahulu sebelum membuat quotation.')
            return
        }

        let whatsappWindow: Window | null = null

        // Buka tab kosong sebelum await agar browser tidak memblokir popup.
        // Setelah quote berhasil dibuat, URL WhatsApp customer akan diisi.
        if (effectiveStatus === 'Quoted') {
            whatsappWindow = window.open('about:blank', '_blank')
        }

        try {
            setSubmitting(true)
            setError('')
            setSuccess('')

            const response = await authenticatedFetch(
                `${API_BASE_URL}/api/quotes/${selectedQuote.id}`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        proposed_price: numericPrice,
                        status: effectiveStatus,
                    }),
                },
            )

            const result: UpdateResponse = await response.json()
            if (!response.ok || !result.success || !result.data) {
                throw new Error(result.message || `Failed to update quote (${response.status})`)
            }

            setQuotes((current) =>
                current.map((item) => (item.id === result.data!.id ? result.data! : item)),
            )
            setSelectedQuote(result.data)
            setStatus(result.data.status)
            setFinalPrice(result.data.proposed_price ? String(result.data.proposed_price) : '')

            if (result.data.public_token) {
                setPublicToken(result.data.public_token)
            }

            if (effectiveStatus === 'Quoted') {
                if (!result.data.public_token) {
                    if (whatsappWindow) whatsappWindow.close()
                    setError(
                        'Quote tersimpan sebagai Quoted, tetapi public_token tidak diterima dari Worker. Pastikan Worker API terbaru sudah di-deploy.',
                    )
                    return
                }

                setPublicToken(result.data.public_token)
                const quoteUrl = getQuoteUrl(result.data.public_token)
                const price = Number(result.data.proposed_price || numericPrice || 0)
                const dp = Number(result.data.dp_amount || Math.ceil(price / 2))
                const phone = normalizePhone(result.data.customer_phone || selectedQuote.customer_phone)
                const message = [
                    `Halo ${result.data.customer_name || selectedQuote.customer_name},`,
                    '',
                    'Terima kasih sudah menghubungi 39Production.',
                    `Quotation untuk project *${result.data.project_name || selectedQuote.project_name}* sudah siap.`,
                    '',
                    `Layanan: ${result.data.service_name || selectedQuote.service_name}`,
                    `Total: ${formatCurrency(price)}`,
                    `DP: ${formatCurrency(dp)}`,
                    '',
                    'Silakan buka link berikut untuk melihat detail quotation, menerima deal, dan melanjutkan pembayaran DP:',
                    quoteUrl,
                    '',
                    'Terima kasih.',
                    '39Production',
                ].join('\n')

                const whatsappUrl = phone
                    ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
                    : ''

                if (whatsappUrl) {
                    if (whatsappWindow) {
                        whatsappWindow.location.href = whatsappUrl
                    } else {
                        window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
                    }
                } else if (whatsappWindow) {
                    whatsappWindow.close()
                }

                setSuccess('Quotation berhasil dibuat dan WhatsApp customer sudah disiapkan dengan link quotation.')
            } else {
                if (whatsappWindow) whatsappWindow.close()
                setSuccess('Quote berhasil diperbarui.')
            }
        } catch (err) {
            if (whatsappWindow) whatsappWindow.close()
            console.error('Update quote error:', err)
            setError(err instanceof Error ? err.message : 'Failed to update quote.')
        } finally {
            setSubmitting(false)
        }
    }

    function getQuoteUrl(token = publicToken) {
        if (!token) return ''
        return `${PUBLIC_SITE_BASE_URL}/quote/${encodeURIComponent(token)}`
    }

    function sendWhatsApp() {
        if (!selectedQuote || !publicToken) {
            setError('Buat atau update quotation ke status Quoted terlebih dahulu agar link publik tersedia.')
            return
        }

        const quoteUrl = getQuoteUrl()
        const price = Number(selectedQuote.proposed_price || finalPrice || 0)
        const dp = Number(selectedQuote.dp_amount || Math.ceil(price / 2))

        const message = [
            `Halo ${selectedQuote.customer_name},`,
            '',
            'Terima kasih sudah menghubungi 39Production.',
            `Quotation untuk project *${selectedQuote.project_name}* sudah siap.`,
            '',
            `Layanan: ${selectedQuote.service_name}`,
            `Total: ${formatCurrency(price)}`,
            `DP: ${formatCurrency(dp)}`,
            '',
            'Silakan buka link berikut untuk melihat detail quotation, menerima deal, dan melanjutkan pembayaran DP:',
            quoteUrl,
            '',
            'Terima kasih.',
            '39Production',
        ].join('\n')

        const phone = normalizePhone(selectedQuote.customer_phone)
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
    }

    async function copyQuoteLink() {
        const url = getQuoteUrl()
        if (!url) return
        try {
            await navigator.clipboard.writeText(url)
            setSuccess('Link quotation berhasil disalin.')
        } catch {
            setError('Browser tidak mengizinkan penyalinan otomatis. Silakan salin link secara manual.')
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-brand-primary/20 bg-brand-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-primary">
                        <FileText className="h-3.5 w-3.5" />
                        Service Quotes
                    </div>
                    <h1 className="font-display text-2xl font-bold text-text-primary">Quotation Management</h1>
                    <p className="mt-1 max-w-2xl text-sm text-text-muted">
                        Kelola request layanan non-fixed, masukkan harga final hasil negosiasi, lalu kirim quotation ke customer.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => void fetchQuotes()}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-border-default bg-bg-surface px-4 py-2.5 text-sm font-semibold text-text-primary transition hover:border-brand-primary/30 hover:bg-bg-surface/80 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard label="Pending" value={pendingCount} description="Request baru" />
                <StatCard label="Reviewing" value={reviewingCount} description="Sedang dinegosiasikan" />
                <StatCard label="Quoted" value={quotedCount} description="Menunggu customer" />
                <StatCard label="Accepted" value={acceptedCount} description="Deal diterima" />
            </div>

            {error && !selectedQuote && (
                <Alert type="error" message={error} />
            )}
            {success && !selectedQuote && (
                <Alert type="success" message={success} />
            )}

            <div className="rounded-2xl border border-border-default bg-bg-surface p-4 sm:p-5">
                <div className="flex flex-col gap-3 lg:flex-row">
                    <div className="relative flex-1">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Cari quote, customer, layanan, project..."
                            className="h-11 w-full rounded-xl border border-border-default bg-bg-page pl-10 pr-4 text-sm text-text-primary outline-none transition placeholder:text-text-muted focus:border-brand-primary/50"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value as 'All' | QuoteStatus)}
                        className="h-11 rounded-xl border border-border-default bg-bg-page px-4 text-sm text-text-primary outline-none focus:border-brand-primary/50"
                    >
                        <option value="All">Semua Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Reviewing">Reviewing</option>
                        <option value="Quoted">Quoted</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Expired">Expired</option>
                    </select>
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border-default bg-bg-surface">
                {loading ? (
                    <div className="flex min-h-64 items-center justify-center">
                        <Loader2 className="h-7 w-7 animate-spin text-brand-primary" />
                    </div>
                ) : filteredQuotes.length === 0 ? (
                    <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
                        <div className="mb-4 rounded-2xl border border-border-default bg-bg-page p-4">
                            <FileText className="h-7 w-7 text-text-muted" />
                        </div>
                        <h3 className="font-display text-base font-semibold text-text-primary">Belum ada quotation request</h3>
                        <p className="mt-1 max-w-md text-sm text-text-muted">
                            Request dari layanan Starting From dan Custom Quote akan muncul di sini.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px]">
                            <thead>
                                <tr className="border-b border-border-default text-left text-xs uppercase tracking-wider text-text-muted">
                                    <th className="px-5 py-4 font-semibold">Quote</th>
                                    <th className="px-5 py-4 font-semibold">Customer</th>
                                    <th className="px-5 py-4 font-semibold">Service / Project</th>
                                    <th className="px-5 py-4 font-semibold">Price</th>
                                    <th className="px-5 py-4 font-semibold">Status</th>
                                    <th className="px-5 py-4 font-semibold">Date</th>
                                    <th className="px-5 py-4 text-right font-semibold">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-default">
                                {filteredQuotes.map((quote) => (
                                    <tr key={quote.id} className="transition hover:bg-bg-page/50">
                                        <td className="px-5 py-4">
                                            <p className="font-mono text-xs font-semibold text-text-primary">{quote.quote_number}</p>
                                        </td>
                                        <td className="px-5 py-4">
                                            <p className="text-sm font-semibold text-text-primary">{quote.customer_name}</p>
                                            <p className="mt-1 text-xs text-text-muted">{quote.customer_email}</p>
                                        </td>
                                        <td className="px-5 py-4">
                                            <p className="text-sm font-semibold text-text-primary">{quote.service_name}</p>
                                            <p className="mt-1 text-xs text-text-muted">{quote.project_name}</p>
                                        </td>
                                        <td className="px-5 py-4 text-sm font-semibold text-text-primary">
                                            {quote.proposed_price ? formatCurrency(quote.proposed_price) : 'Belum ditentukan'}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${statusClasses(quote.status)}`}>
                                                {statusIcon(quote.status)}
                                                {quote.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-text-muted">{formatDate(quote.created_at)}</td>
                                        <td className="px-5 py-4 text-right">
                                            <button
                                                type="button"
                                                onClick={() => openQuote(quote)}
                                                className="inline-flex items-center gap-1.5 rounded-lg border border-border-default bg-bg-page px-3 py-2 text-xs font-semibold text-text-primary transition hover:border-brand-primary/30 hover:text-brand-primary"
                                            >
                                                Detail
                                                <ChevronRight className="h-3.5 w-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {selectedQuote && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-md">
                    <button type="button" aria-label="Close" className="fixed inset-0 cursor-default" onClick={closeQuote} />

                    <div className="relative my-8 w-full max-w-5xl overflow-hidden rounded-3xl border border-border-default bg-bg-surface shadow-2xl">
                        <div className="h-1 bg-gradient-to-r from-brand-primary via-purple-500 to-brand-accent" />

                        <div className="flex items-start justify-between gap-5 border-b border-border-default p-6">
                            <div>
                                <p className="font-mono text-xs font-semibold text-brand-primary">{selectedQuote.quote_number}</p>
                                <h2 className="mt-1 font-display text-xl font-bold text-text-primary">{selectedQuote.project_name}</h2>
                                <p className="mt-1 text-sm text-text-muted">{selectedQuote.service_name} · {selectedQuote.customer_name}</p>
                            </div>
                            <button type="button" onClick={closeQuote} className="rounded-xl border border-border-default p-2 text-text-muted transition hover:bg-bg-page hover:text-text-primary">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="grid max-h-[75vh] overflow-y-auto lg:grid-cols-[1.15fr_0.85fr]">
                            <div className="space-y-6 p-6 lg:border-r lg:border-border-default">
                                <Section title="Customer">
                                    <InfoRow label="Nama" value={selectedQuote.customer_name} />
                                    <InfoRow label="Email" value={selectedQuote.customer_email} />
                                    <InfoRow label="WhatsApp" value={selectedQuote.customer_phone} />
                                </Section>

                                <Section title="Project Request">
                                    <InfoRow label="Layanan" value={selectedQuote.service_name} />
                                    <InfoRow label="Kategori" value={selectedQuote.service_category || '-'} />
                                    <InfoRow label="Budget" value={selectedQuote.budget_range || 'Tidak disebutkan'} />
                                    <InfoRow label="Deadline" value={formatDate(selectedQuote.deadline)} />
                                    <div className="mt-4 rounded-xl border border-border-default bg-bg-page p-4">
                                        <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Deskripsi Project</p>
                                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-text-primary">{selectedQuote.project_description}</p>
                                    </div>
                                    {selectedQuote.additional_requirements && (
                                        <div className="mt-3 rounded-xl border border-border-default bg-bg-page p-4">
                                            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Additional Requirements</p>
                                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-text-primary">{selectedQuote.additional_requirements}</p>
                                        </div>
                                    )}
                                    {selectedQuote.reference_url && (
                                        <a href={selectedQuote.reference_url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-brand-primary hover:underline">
                                            Open reference
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                    )}
                                </Section>
                            </div>

                            <div className="space-y-5 bg-bg-page/40 p-6">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Negotiation Result</p>
                                    <p className="mt-1 text-sm text-text-muted">Harga di bawah adalah harga final hasil kesepakatan dengan customer.</p>
                                </div>

                                <label className="block">
                                    <span className="mb-2 block text-sm font-semibold text-text-primary">Harga Final</span>
                                    <div className="relative">
                                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-muted">Rp</span>
                                        <input
                                            value={finalPrice}
                                            onChange={(event) => setFinalPrice(event.target.value.replace(/\D/g, ''))}
                                            inputMode="numeric"
                                            placeholder="Contoh: 2500000"
                                            className="h-12 w-full rounded-xl border border-border-default bg-bg-surface pl-10 pr-4 text-sm font-semibold text-text-primary outline-none focus:border-brand-primary/50"
                                        />
                                    </div>
                                </label>

                                <label className="block">
                                    <span className="mb-2 block text-sm font-semibold text-text-primary">Status</span>
                                    <select
                                        value={status}
                                        onChange={(event) => setStatus(event.target.value as QuoteStatus)}
                                        className="h-12 w-full rounded-xl border border-border-default bg-bg-surface px-4 text-sm text-text-primary outline-none focus:border-brand-primary/50"
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Reviewing">Reviewing</option>
                                        <option value="Quoted">Quoted</option>
                                        <option value="Accepted">Accepted</option>
                                        <option value="Rejected">Rejected</option>
                                        <option value="Expired">Expired</option>
                                    </select>
                                </label>

                                {selectedQuote.proposed_price && (
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="rounded-xl border border-border-default bg-bg-surface p-4">
                                            <p className="text-xs text-text-muted">DP (50%)</p>
                                            <p className="mt-1 text-sm font-bold text-text-primary">{formatCurrency(selectedQuote.dp_amount)}</p>
                                        </div>
                                        <div className="rounded-xl border border-border-default bg-bg-surface p-4">
                                            <p className="text-xs text-text-muted">Sisa</p>
                                            <p className="mt-1 text-sm font-bold text-text-primary">{formatCurrency(selectedQuote.remaining_amount)}</p>
                                        </div>
                                    </div>
                                )}

                                {error && <Alert type="error" message={error} />}
                                {success && <Alert type="success" message={success} />}

                                <button
                                    type="button"
                                    onClick={() => void updateQuote(status)}
                                    disabled={submitting}
                                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-primary to-brand-accent px-4 text-sm font-bold text-white shadow-lg shadow-brand-primary/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                    Simpan Quote
                                </button>

                                <div className="border-t border-border-default pt-5">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                                                Customer Quotation Link
                                            </p>
                                            <p className="mt-1 text-xs leading-5 text-text-muted">
                                                Link ini membawa customer langsung ke halaman quotation publik untuk melihat detail,
                                                menerima deal, dan melanjutkan pembayaran DP.
                                            </p>
                                        </div>

                                        {publicToken && (
                                            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                                                <CheckCircle2 className="h-3 w-3" />
                                                Published
                                            </span>
                                        )}
                                    </div>

                                    {publicToken ? (
                                        <div className="mt-4 space-y-3">
                                            <div>
                                                <label className="mb-2 block text-xs font-semibold text-text-muted">
                                                    Public Quote Page
                                                </label>
                                                <div className="flex gap-2">
                                                    <input
                                                        readOnly
                                                        value={getQuoteUrl()}
                                                        className="h-11 min-w-0 flex-1 rounded-xl border border-border-default bg-bg-surface px-3 text-xs text-text-primary outline-none"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => void copyQuoteLink()}
                                                        className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl border border-border-default bg-bg-surface px-3 text-xs font-semibold text-text-primary transition hover:border-brand-primary/30 hover:text-brand-primary"
                                                    >
                                                        <Copy className="h-3.5 w-3.5" />
                                                        Copy
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                                <a
                                                    href={getQuoteUrl()}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-brand-primary/20 bg-brand-primary/10 text-sm font-bold text-brand-primary transition hover:bg-brand-primary/15"
                                                >
                                                    <ExternalLink className="h-4 w-4" />
                                                    Buka Quote Page
                                                </a>
                                                <button
                                                    type="button"
                                                    onClick={sendWhatsApp}
                                                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-sm font-bold text-emerald-300 transition hover:bg-emerald-400/15"
                                                >
                                                    <MessageCircle className="h-4 w-4" />
                                                    Kirim via WhatsApp
                                                </button>
                                            </div>

                                            <div className="rounded-xl border border-border-default bg-bg-surface p-4">
                                                <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                                                    Pesan WhatsApp
                                                </p>
                                                <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-text-muted">
                                                    {(() => {
                                                        const price = Number(
                                                            selectedQuote.proposed_price || finalPrice || 0,
                                                        )
                                                        const dp = Number(
                                                            selectedQuote.dp_amount || Math.ceil(price / 2),
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
                                                        ].join('\n')
                                                    })()}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mt-4 rounded-xl border border-dashed border-border-default bg-bg-surface p-4">
                                            <div className="flex items-start gap-3">
                                                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-text-muted" />
                                                <div>
                                                    <p className="text-sm font-semibold text-text-primary">
                                                        Quotation belum diterbitkan
                                                    </p>
                                                    <p className="mt-1 text-xs leading-5 text-text-muted">
                                                        Masukkan harga final, pilih status{' '}
                                                        <strong className="text-text-primary">Quoted</strong>,
                                                        lalu klik <strong className="text-text-primary">Simpan Quote</strong>.
                                                        Setelah berhasil, sistem akan membuat link quotation publik untuk customer.
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

function StatCard({ label, value, description }: { label: string; value: number; description: string }) {
    return (
        <div className="rounded-xl border border-border-default bg-bg-surface p-5">
            <p className="text-sm text-text-muted">{label}</p>
            <p className="mt-2 font-display text-2xl font-bold text-text-primary">{value}</p>
            <p className="mt-1 text-xs text-text-muted">{description}</p>
        </div>
    )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section>
            <h3 className="mb-3 font-display text-sm font-semibold text-text-primary">{title}</h3>
            <div className="rounded-2xl border border-border-default bg-bg-page p-4">{children}</div>
        </section>
    )
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex gap-4 border-b border-border-default py-2.5 last:border-0 last:pb-0 first:pt-0">
            <span className="w-24 shrink-0 text-xs text-text-muted">{label}</span>
            <span className="min-w-0 flex-1 break-words text-sm font-medium text-text-primary">{value}</span>
        </div>
    )
}

function Alert({ type, message }: { type: 'error' | 'success'; message: string }) {
    return (
        <div className={`rounded-xl border px-4 py-3 text-sm ${type === 'error' ? 'border-red-400/20 bg-red-400/10 text-red-300' : 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300'}`}>
            {message}
        </div>
    )
}
