import {
    CheckCircle2,
    Clock3,
    Download,
    Eye,
    Loader2,
    MessageCircle,
    Package,
    RefreshCw,
    Search,
    ShieldCheck,
    ShoppingBag,
    Wallet,
    X,
} from 'lucide-react'
import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react'
import { authenticatedFetch } from '@/lib/auth'

const API_BASE_URL = 'https://39production-api.39production.workers.dev'

type OrderStatus =
    | 'Pending'
    | 'Processing'
    | 'Completed'
    | 'WaitingFinalPayment'
    | 'PaidFull'
    | 'Cancelled'

type PaymentStatus =
    | 'UNPAID'
    | 'PROOF_SUBMITTED'
    | 'DP_PAID'
    | 'PARTIALLY_PAID'
    | 'PAID'
    | 'FAILED'
    | 'EXPIRED'
    | string

interface Order {
    id: number
    orderNumber: string
    customer: string
    email: string
    phone: string
    item: string
    productId: number | null
    serviceId: number | null
    type: 'Service' | 'Product'
    quantity: number
    unitPrice: number
    total: number
    originalTotal: number
    discountAmount: number
    finalTotal: number
    dpAmount: number
    paidAmount: number
    remainingAmount: number
    paymentStatus: PaymentStatus
    paymentMethod: string
    hasPaymentProof: boolean
    paymentProofUploadedAt: string | null
    dpPaidAt: string | null
    finalPaidAt: string | null
    date: string
    status: OrderStatus
}

type ThemeMode = 'dark' | 'light'

const allowedStatuses: OrderStatus[] = [
    'Pending',
    'Processing',
    'WaitingFinalPayment',
    'Completed',
    'Cancelled',
]

function useAdminTheme(): ThemeMode {
    const [theme, setTheme] = useState<ThemeMode>(() => {
        if (typeof window === 'undefined') return 'dark'
        return window.localStorage.getItem('39production_admin_theme') === 'light'
            ? 'light'
            : 'dark'
    })

    useEffect(() => {
        const syncTheme = () => {
            const datasetTheme = document.documentElement.dataset.adminTheme
            if (datasetTheme === 'light' || datasetTheme === 'dark') {
                setTheme(datasetTheme)
                return
            }
            setTheme(
                window.localStorage.getItem('39production_admin_theme') === 'light'
                    ? 'light'
                    : 'dark',
            )
        }

        syncTheme()
        const observer = new MutationObserver(syncTheme)
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-admin-theme'],
        })
        window.addEventListener('storage', syncTheme)

        return () => {
            observer.disconnect()
            window.removeEventListener('storage', syncTheme)
        }
    }, [])

    return theme
}

function formatCurrency(value: number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number.isFinite(value) ? value : 0)
}

function formatDate(value?: string | null) {
    if (!value) return '-'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '-'
    return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(date)
}

function toNumber(value: unknown, fallback = 0) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
}

function normalizeStatus(value: unknown): OrderStatus {
    return allowedStatuses.includes(value as OrderStatus)
        ? (value as OrderStatus)
        : 'Pending'
}

function mapOrder(data: Record<string, unknown>): Order {
    const totalPrice = toNumber(data.total_price)
    const finalTotal = toNumber(data.final_total, totalPrice)
    const paidAmount = toNumber(data.paid_amount)
    const remainingAmount = toNumber(
        data.remaining_amount,
        Math.max(finalTotal - paidAmount, 0),
    )

    return {
        id: toNumber(data.id),
        orderNumber: String(data.order_number ?? ''),
        customer: String(data.customer_name ?? ''),
        email: String(data.customer_email ?? ''),
        phone: String(data.customer_phone ?? ''),
        item: String(data.product_name ?? ''),
        productId: data.product_id == null ? null : toNumber(data.product_id),
        serviceId: data.service_id == null ? null : toNumber(data.service_id),
        type: data.type === 'Service' ? 'Service' : 'Product',
        quantity: toNumber(data.quantity, 1),
        unitPrice: toNumber(data.unit_price),
        total: totalPrice,
        originalTotal: toNumber(data.original_total, totalPrice),
        discountAmount: toNumber(data.discount_amount),
        finalTotal,
        dpAmount: toNumber(data.dp_amount),
        paidAmount,
        remainingAmount,
        paymentStatus: String(data.payment_status ?? 'UNPAID'),
        paymentMethod: String(data.payment_method ?? '-'),
        hasPaymentProof: data.has_payment_proof === true ||
            data.has_payment_proof === 1 ||
            data.has_payment_proof === '1',
        paymentProofUploadedAt: data.payment_proof_uploaded_at
            ? String(data.payment_proof_uploaded_at)
            : null,
        dpPaidAt: data.dp_paid_at ? String(data.dp_paid_at) : null,
        finalPaidAt: data.final_paid_at ? String(data.final_paid_at) : null,
        date: String(data.created_at ?? ''),
        status: normalizeStatus(data.status),
    }
}

async function readApiResponse(response: Response) {
    const text = await response.text()
    let result: any = {}
    if (text) {
        try {
            result = JSON.parse(text)
        } catch {
            throw new Error('Server returned an invalid response.')
        }
    }

    if (!response.ok || result?.success === false) {
        throw new Error(
            result?.message ||
            result?.error ||
            `Request failed (${response.status}).`,
        )
    }
    return result
}

function getPaymentLabel(status: PaymentStatus) {
    const labels: Record<string, string> = {
        UNPAID: 'Belum dibayar',
        PROOF_SUBMITTED: 'Menunggu verifikasi',
        DP_PAID: 'DP terverifikasi',
        PARTIALLY_PAID: 'Dibayar sebagian',
        PAID: 'Lunas',
        FAILED: 'Gagal',
        EXPIRED: 'Kedaluwarsa',
    }
    return labels[status] ?? status
}

function paymentTone(status: PaymentStatus, isDark: boolean) {
    if (status === 'PAID' || status === 'DP_PAID') {
        return isDark
            ? 'bg-emerald-500/10 text-emerald-400'
            : 'bg-emerald-50 text-emerald-700'
    }
    if (status === 'PROOF_SUBMITTED') {
        return isDark
            ? 'bg-amber-500/10 text-amber-400'
            : 'bg-amber-50 text-amber-700'
    }
    return isDark
        ? 'bg-white/[0.06] text-white/55'
        : 'bg-neutral-100 text-neutral-600'
}

function orderTone(status: OrderStatus, isDark: boolean) {
    if (status === 'Completed' || status === 'PaidFull') {
        return isDark
            ? 'bg-emerald-500/10 text-emerald-400'
            : 'bg-emerald-50 text-emerald-700'
    }
    if (status === 'Cancelled') {
        return isDark
            ? 'bg-red-500/10 text-red-400'
            : 'bg-red-50 text-red-700'
    }
    if (status === 'Processing' || status === 'WaitingFinalPayment') {
        return isDark
            ? 'bg-blue-500/10 text-blue-400'
            : 'bg-blue-50 text-blue-700'
    }
    return isDark
        ? 'bg-amber-500/10 text-amber-400'
        : 'bg-amber-50 text-amber-700'
}

export function AdminOrdersPage() {
    const theme = useAdminTheme()
    const isDark = theme === 'dark'

    const [orders, setOrders] = useState<Order[]>([])
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('All')
    const [paymentFilter, setPaymentFilter] = useState('All')
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [error, setError] = useState('')
    const [successMessage, setSuccessMessage] = useState('')
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [updatingStatus, setUpdatingStatus] = useState(false)
    const [verifyingOrder, setVerifyingOrder] = useState<string | null>(null)
    const [downloadingProof, setDownloadingProof] = useState(false)

    const pageText = isDark ? 'text-white' : 'text-neutral-950'
    const secondaryText = isDark ? 'text-white/55' : 'text-neutral-600'
    const mutedText = isDark ? 'text-white/35' : 'text-neutral-400'
    const cardBg = isDark ? 'bg-[#15151b]' : 'bg-white'
    const inputBg = isDark ? 'bg-[#0f0f13]' : 'bg-neutral-50'
    const pageSurface = isDark ? 'bg-[#0b0b0f]' : 'bg-[#f7f7fa]'
    const border = isDark ? 'border-white/[0.08]' : 'border-neutral-200'
    const divider = isDark ? 'border-white/[0.06]' : 'border-neutral-100'
    const hoverRow = isDark ? 'hover:bg-white/[0.025]' : 'hover:bg-neutral-50'

    const fetchOrders = useCallback(async (silent = false) => {
        try {
            if (silent) setRefreshing(true)
            else setLoading(true)
            setError('')

            const response = await authenticatedFetch(
                `${API_BASE_URL}/api/orders`,
                { method: 'GET', cache: 'no-store' },
            )
            const result = await readApiResponse(response)
            const rows = Array.isArray(result?.data)
                ? result.data
                : Array.isArray(result?.orders)
                    ? result.orders
                    : []

            setOrders(rows.map((row: Record<string, unknown>) => mapOrder(row)))
        } catch (err) {
            console.error('Fetch orders error:', err)
            setError(err instanceof Error ? err.message : 'Gagal memuat pesanan.')
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [])

    useEffect(() => {
        void fetchOrders()
    }, [fetchOrders])

    useEffect(() => {
        if (!selectedOrder) return
        const refreshed = orders.find((order) => order.id === selectedOrder.id)
        if (refreshed) setSelectedOrder(refreshed)
    }, [orders, selectedOrder?.id])

    const filteredOrders = useMemo(() => {
        const keyword = search.trim().toLowerCase()
        return orders.filter((order) => {
            const matchesSearch = !keyword || [
                order.orderNumber,
                order.customer,
                order.email,
                order.phone,
                order.item,
            ].some((value) => value.toLowerCase().includes(keyword))

            const matchesStatus = statusFilter === 'All' || order.status === statusFilter
            const matchesPayment = paymentFilter === 'All' || order.paymentStatus === paymentFilter
            return matchesSearch && matchesStatus && matchesPayment
        })
    }, [orders, search, statusFilter, paymentFilter])

    const stats = useMemo(() => ({
        total: orders.length,
        needsReview: orders.filter((order) => order.paymentStatus === 'PROOF_SUBMITTED').length,
        dpPaid: orders.filter((order) => order.paymentStatus === 'DP_PAID').length,
        processing: orders.filter((order) => order.status === 'Processing').length,
        completed: orders.filter((order) => order.status === 'Completed' || order.status === 'PaidFull').length,
        revenue: orders.reduce((sum, order) => sum + order.paidAmount, 0),
    }), [orders])

    async function handleVerifyDp(order: Order) {
        const confirmed = window.confirm(
            `Verifikasi pembayaran DP untuk ${order.orderNumber} sebesar ${formatCurrency(order.dpAmount)}? Pastikan bukti transfer sudah diperiksa.`,
        )
        if (!confirmed) return

        try {
            setVerifyingOrder(order.orderNumber)
            setError('')
            setSuccessMessage('')

            const response = await authenticatedFetch(
                `${API_BASE_URL}/api/admin/orders/${encodeURIComponent(order.orderNumber)}/verify-payment`,
                { method: 'PUT' },
            )
            const result = await readApiResponse(response)

            setSuccessMessage(result?.message || `DP ${order.orderNumber} berhasil diverifikasi.`)
            await fetchOrders(true)
        } catch (err) {
            console.error('Verify DP error:', err)
            setError(err instanceof Error ? err.message : 'Gagal memverifikasi pembayaran DP.')
        } finally {
            setVerifyingOrder(null)
        }
    }

    async function handleDownloadProof(order: Order) {
        try {
            setDownloadingProof(true)
            setError('')

            const response = await authenticatedFetch(
                `${API_BASE_URL}/api/admin/orders/${encodeURIComponent(order.orderNumber)}/payment-proof`,
                { method: 'GET', cache: 'no-store' },
            )

            if (!response.ok) {
                await readApiResponse(response)
                return
            }

            const blob = await response.blob()
            const objectUrl = URL.createObjectURL(blob)
            const anchor = document.createElement('a')
            anchor.href = objectUrl
            anchor.download = `payment-proof-${order.orderNumber}`
            document.body.appendChild(anchor)
            anchor.click()
            anchor.remove()
            URL.revokeObjectURL(objectUrl)
        } catch (err) {
            console.error('Download payment proof error:', err)
            setError(err instanceof Error ? err.message : 'Gagal membuka bukti pembayaran.')
        } finally {
            setDownloadingProof(false)
        }
    }

    async function handleStatusChange(order: Order, nextStatus: OrderStatus) {
        if (nextStatus === order.status) return

        if (nextStatus === 'Processing' && order.paymentStatus !== 'DP_PAID' && order.paymentStatus !== 'PAID') {
            setError('Pesanan hanya dapat diproses setelah pembayaran DP diverifikasi.')
            return
        }

        if (nextStatus === 'Completed' && order.remainingAmount > 0) {
            setError('Pesanan belum dapat diselesaikan karena masih ada sisa pembayaran.')
            return
        }

        if (nextStatus === 'Cancelled') {
            const confirmed = window.confirm(`Batalkan pesanan ${order.orderNumber}?`)
            if (!confirmed) return
        }

        try {
            setUpdatingStatus(true)
            setError('')
            setSuccessMessage('')

            const response = await authenticatedFetch(
                `${API_BASE_URL}/api/orders/${order.id}`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: nextStatus }),
                },
            )
            const result = await readApiResponse(response)
            setSuccessMessage(result?.message || 'Status pesanan berhasil diperbarui.')
            await fetchOrders(true)
        } catch (err) {
            console.error('Update order status error:', err)
            setError(err instanceof Error ? err.message : 'Gagal memperbarui status pesanan.')
        } finally {
            setUpdatingStatus(false)
        }
    }

    function openWhatsApp(order: Order) {
        const phone = order.phone.replace(/\D/g, '').replace(/^0/, '62')
        if (!phone) {
            setError('Nomor WhatsApp pelanggan belum tersedia.')
            return
        }
        const message = [
            `Halo ${order.customer}, kami dari 39Production.`,
            '',
            `Kami menghubungi terkait pesanan ${order.orderNumber} (${order.item}).`,
            `Total pesanan: ${formatCurrency(order.finalTotal)}.`,
            `DP yang perlu dibayarkan: ${formatCurrency(order.dpAmount)}.`,
            'Silakan konfirmasi apabila detail pesanan sudah sesuai. Kami akan mengirimkan instruksi pembayaran DP.',
        ].join('\n')
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
    }

    const statusOptions = (order: Order) => {
        const options: OrderStatus[] = ['Pending', 'Cancelled']
        if (order.paymentStatus === 'DP_PAID' || order.paymentStatus === 'PAID') {
            options.push('Processing')
            if (order.remainingAmount > 0) options.push('WaitingFinalPayment')
        }
        if (order.remainingAmount <= 0 && order.paidAmount > 0) {
            options.push('Completed')
        }
        return Array.from(new Set(options))
    }

    return (
        <div className={`min-h-full space-y-7 rounded-2xl ${pageSurface} ${pageText}`}>
            <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-500">
                        Business / Transactions
                    </p>
                    <h1 className="mt-1 text-3xl font-bold tracking-[-0.035em]">Orders</h1>
                    <p className={`mt-2 max-w-2xl text-sm ${secondaryText}`}>
                        Pantau pesanan pelanggan, verifikasi bukti pembayaran DP, dan kelola progres pengerjaan.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => void fetchOrders(true)}
                    disabled={loading || refreshing}
                    className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${border} ${secondaryText} ${hoverRow}`}
                >
                    <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </header>

            {error && (
                <div role="alert" className="flex items-start justify-between gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">
                    <span>{error}</span>
                    <button type="button" onClick={() => setError('')} aria-label="Tutup pesan error">
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}
            {successMessage && (
                <div role="status" className="flex items-start justify-between gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600">
                    <span>{successMessage}</span>
                    <button type="button" onClick={() => setSuccessMessage('')} aria-label="Tutup pesan">
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <StatCard label="Total Orders" value={String(stats.total)} icon={<ShoppingBag className="h-5 w-5" />} isDark={isDark} />
                <StatCard label="Perlu Verifikasi" value={String(stats.needsReview)} icon={<Clock3 className="h-5 w-5" />} isDark={isDark} accent="amber" />
                <StatCard label="DP Terverifikasi" value={String(stats.dpPaid)} icon={<ShieldCheck className="h-5 w-5" />} isDark={isDark} accent="green" />
                <StatCard label="Sedang Diproses" value={String(stats.processing)} icon={<Package className="h-5 w-5" />} isDark={isDark} accent="blue" />
                <StatCard label="Selesai" value={String(stats.completed)} icon={<CheckCircle2 className="h-5 w-5" />} isDark={isDark} accent="green" />
                <StatCard label="Pembayaran Diterima" value={formatCurrency(stats.revenue)} icon={<Wallet className="h-5 w-5" />} isDark={isDark} />
            </section>

            <section className={`rounded-2xl border p-4 md:p-5 ${cardBg} ${border}`}>
                <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_220px]">
                    <div className="relative">
                        <Search className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${mutedText}`} />
                        <input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Cari nomor order, pelanggan, email, atau item..."
                            className={`w-full rounded-xl border py-3 pl-10 pr-4 text-sm outline-none focus:border-violet-500 ${border} ${inputBg} ${pageText}`}
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value)}
                        className={`rounded-xl border px-4 py-3 text-sm outline-none focus:border-violet-500 ${border} ${inputBg} ${pageText}`}
                    >
                        <option value="All">Semua status pesanan</option>
                        {allowedStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                    <select
                        value={paymentFilter}
                        onChange={(event) => setPaymentFilter(event.target.value)}
                        className={`rounded-xl border px-4 py-3 text-sm outline-none focus:border-violet-500 ${border} ${inputBg} ${pageText}`}
                    >
                        <option value="All">Semua status pembayaran</option>
                        {['UNPAID', 'PROOF_SUBMITTED', 'DP_PAID', 'PARTIALLY_PAID', 'PAID', 'FAILED', 'EXPIRED'].map((status) => (
                            <option key={status} value={status}>{getPaymentLabel(status)}</option>
                        ))}
                    </select>
                </div>
            </section>

            <section className={`overflow-hidden rounded-2xl border ${cardBg} ${border}`}>
                <div className={`flex flex-col gap-1 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between ${divider}`}>
                    <div>
                        <h2 className="font-semibold">Daftar Pesanan</h2>
                        <p className={`mt-1 text-xs ${mutedText}`}>{filteredOrders.length} dari {orders.length} pesanan</p>
                    </div>
                    <p className={`text-xs ${mutedText}`}>Data terbaru ditampilkan terlebih dahulu</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1120px] text-left text-sm">
                        <thead className={isDark ? 'bg-white/[0.025]' : 'bg-neutral-50'}>
                            <tr>
                                {['Pesanan', 'Pelanggan', 'Item', 'Total / DP', 'Pembayaran', 'Status', 'Aksi'].map((heading) => (
                                    <th key={heading} className={`px-5 py-4 text-[11px] font-bold uppercase tracking-wider ${mutedText}`}>{heading}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} className={`px-5 py-16 text-center ${secondaryText}`}>
                                    <Loader2 className="mx-auto mb-3 h-5 w-5 animate-spin text-violet-500" />
                                    Memuat pesanan...
                                </td></tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr><td colSpan={7} className={`px-5 py-16 text-center ${mutedText}`}>
                                    {orders.length === 0 ? 'Belum ada pesanan.' : 'Tidak ada pesanan yang sesuai dengan filter.'}
                                </td></tr>
                            ) : filteredOrders.map((order) => (
                                <tr key={order.id} className={`border-t transition-colors ${divider} ${hoverRow}`}>
                                    <td className="px-5 py-4">
                                        <p className="font-semibold">{order.orderNumber || `Order #${order.id}`}</p>
                                        <p className={`mt-1 text-xs ${mutedText}`}>{formatDate(order.date)}</p>
                                    </td>
                                    <td className="px-5 py-4">
                                        <p className="font-medium">{order.customer || '-'}</p>
                                        <p className={`mt-1 text-xs ${mutedText}`}>{order.email || '-'}</p>
                                    </td>
                                    <td className="px-5 py-4">
                                        <p className="max-w-[220px] truncate font-medium">{order.item || '-'}</p>
                                        <p className={`mt-1 text-xs ${mutedText}`}>{order.type} · Qty {order.quantity}</p>
                                    </td>
                                    <td className="px-5 py-4">
                                        <p className="font-semibold">{formatCurrency(order.finalTotal)}</p>
                                        <p className={`mt-1 text-xs ${mutedText}`}>DP {formatCurrency(order.dpAmount)}</p>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${paymentTone(order.paymentStatus, isDark)}`}>
                                            {getPaymentLabel(order.paymentStatus)}
                                        </span>
                                        {order.hasPaymentProof && <p className="mt-1 text-[11px] text-emerald-500">Bukti tersedia</p>}
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${orderTone(order.status, isDark)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedOrder(order)}
                                                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold ${border} ${secondaryText} ${hoverRow}`}
                                            >
                                                <Eye className="h-3.5 w-3.5" /> Detail
                                            </button>
                                            {order.paymentStatus === 'PROOF_SUBMITTED' && (
                                                <button
                                                    type="button"
                                                    onClick={() => void handleVerifyDp(order)}
                                                    disabled={verifyingOrder === order.orderNumber}
                                                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                                                >
                                                    {verifyingOrder === order.orderNumber
                                                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                        : <ShieldCheck className="h-3.5 w-3.5" />}
                                                    Verifikasi DP
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {selectedOrder && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-3 py-5 backdrop-blur-sm"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget && !updatingStatus) setSelectedOrder(null)
                    }}
                >
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="order-detail-title"
                        className={`max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border shadow-2xl ${cardBg} ${border}`}
                    >
                        <div className={`sticky top-0 z-10 flex items-center justify-between border-b px-5 py-4 ${cardBg} ${divider}`}>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-violet-500">Order detail</p>
                                <h2 id="order-detail-title" className="mt-1 text-xl font-bold">{selectedOrder.orderNumber}</h2>
                            </div>
                            <button type="button" onClick={() => setSelectedOrder(null)} className={`rounded-lg p-2 ${secondaryText} ${hoverRow}`} aria-label="Tutup detail">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-6 p-5">
                            <div className="grid gap-3 sm:grid-cols-2">
                                <DetailField label="Nama pelanggan" value={selectedOrder.customer} isDark={isDark} />
                                <DetailField label="Email" value={selectedOrder.email} isDark={isDark} />
                                <DetailField label="Nomor telepon" value={selectedOrder.phone || '-'} isDark={isDark} />
                                <DetailField label="Tanggal pesanan" value={formatDate(selectedOrder.date)} isDark={isDark} />
                                <DetailField label="Item" value={`${selectedOrder.item} (${selectedOrder.type})`} isDark={isDark} />
                                <DetailField label="Metode pembayaran" value={selectedOrder.paymentMethod} isDark={isDark} />
                            </div>

                            <div className={`rounded-xl border p-4 ${border} ${isDark ? 'bg-white/[0.02]' : 'bg-neutral-50'}`}>
                                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
                                    <Wallet className="h-4 w-4 text-violet-500" /> Ringkasan pembayaran
                                </h3>
                                <div className="space-y-3 text-sm">
                                    <MoneyRow label="Subtotal awal" value={formatCurrency(selectedOrder.originalTotal)} isDark={isDark} />
                                    {selectedOrder.discountAmount > 0 && (
                                        <MoneyRow label="Diskon" value={`- ${formatCurrency(selectedOrder.discountAmount)}`} isDark={isDark} />
                                    )}
                                    <MoneyRow label="Total pesanan" value={formatCurrency(selectedOrder.finalTotal)} isDark={isDark} strong />
                                    <MoneyRow label="DP yang harus dibayar" value={formatCurrency(selectedOrder.dpAmount)} isDark={isDark} />
                                    <MoneyRow label="Sudah dibayar" value={formatCurrency(selectedOrder.paidAmount)} isDark={isDark} />
                                    <MoneyRow label="Sisa pembayaran" value={formatCurrency(selectedOrder.remainingAmount)} isDark={isDark} strong />
                                </div>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${paymentTone(selectedOrder.paymentStatus, isDark)}`}>
                                        {getPaymentLabel(selectedOrder.paymentStatus)}
                                    </span>
                                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${orderTone(selectedOrder.status, isDark)}`}>
                                        {selectedOrder.status}
                                    </span>
                                </div>
                            </div>

                            <div className={`rounded-xl border p-4 ${border}`}>
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h3 className="text-sm font-semibold">Bukti pembayaran DP</h3>
                                        <p className={`mt-1 text-xs ${mutedText}`}>
                                            {selectedOrder.hasPaymentProof
                                                ? `Dikirim ${formatDate(selectedOrder.paymentProofUploadedAt)}`
                                                : 'Pelanggan belum mengunggah bukti pembayaran.'}
                                        </p>
                                    </div>
                                    {selectedOrder.hasPaymentProof && (
                                        <button
                                            type="button"
                                            onClick={() => void handleDownloadProof(selectedOrder)}
                                            disabled={downloadingProof}
                                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-violet-500/30 px-3 py-2 text-xs font-semibold text-violet-500 hover:bg-violet-500/10 disabled:opacity-50"
                                        >
                                            {downloadingProof
                                                ? <Loader2 className="h-4 w-4 animate-spin" />
                                                : <Download className="h-4 w-4" />}
                                            Unduh bukti
                                        </button>
                                    )}
                                </div>
                                {selectedOrder.paymentStatus === 'PROOF_SUBMITTED' && (
                                    <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs leading-relaxed text-amber-600">
                                        Periksa nominal, nama pengirim, tanggal, dan tujuan transfer pada bukti sebelum menekan tombol verifikasi.
                                    </div>
                                )}
                                {selectedOrder.paymentStatus === 'PROOF_SUBMITTED' && (
                                    <button
                                        type="button"
                                        onClick={() => void handleVerifyDp(selectedOrder)}
                                        disabled={verifyingOrder === selectedOrder.orderNumber}
                                        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                                    >
                                        {verifyingOrder === selectedOrder.orderNumber
                                            ? <Loader2 className="h-4 w-4 animate-spin" />
                                            : <ShieldCheck className="h-4 w-4" />}
                                        Verifikasi pembayaran DP
                                    </button>
                                )}
                            </div>

                            <div className={`rounded-xl border p-4 ${border}`}>
                                <div className="mb-3 flex items-center justify-between gap-3">
                                    <div>
                                        <h3 className="text-sm font-semibold">Progres pesanan</h3>
                                        <p className={`mt-1 text-xs ${mutedText}`}>Status proses diperbarui setelah pembayaran diverifikasi.</p>
                                    </div>
                                </div>
                                <label htmlFor="order-status-update" className={`mb-2 block text-xs font-semibold ${secondaryText}`}>Status pesanan</label>
                                <select
                                    id="order-status-update"
                                    value={selectedOrder.status}
                                    disabled={updatingStatus || selectedOrder.status === 'Cancelled'}
                                    onChange={(event) => void handleStatusChange(selectedOrder, event.target.value as OrderStatus)}
                                    className={`w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-violet-500 disabled:opacity-50 ${border} ${inputBg} ${pageText}`}
                                >
                                    {!statusOptions(selectedOrder).includes(selectedOrder.status) && (
                                        <option value={selectedOrder.status}>{selectedOrder.status}</option>
                                    )}
                                    {statusOptions(selectedOrder).map((status) => <option key={status} value={status}>{status}</option>)}
                                </select>
                                {selectedOrder.remainingAmount > 0 && selectedOrder.paymentStatus === 'DP_PAID' && (
                                    <p className={`mt-2 text-xs ${mutedText}`}>
                                        Sisa pembayaran {formatCurrency(selectedOrder.remainingAmount)} masih perlu diselesaikan sebelum pesanan dapat ditandai selesai.
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                                <button
                                    type="button"
                                    onClick={() => openWhatsApp(selectedOrder)}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 px-4 py-2.5 text-sm font-semibold text-emerald-600 hover:bg-emerald-500/10"
                                >
                                    <MessageCircle className="h-4 w-4" /> Hubungi pelanggan
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedOrder(null)}
                                    className={`rounded-xl border px-4 py-2.5 text-sm font-semibold ${border} ${secondaryText} ${hoverRow}`}
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            )}
        </div>
    )
}

function DetailField({ label, value, isDark }: { label: string; value: string; isDark: boolean }) {
    return (
        <div className={`min-w-0 rounded-xl border p-3 ${isDark ? 'border-white/[0.07] bg-white/[0.02]' : 'border-neutral-200 bg-white'}`}>
            <p className={`text-[11px] ${isDark ? 'text-white/40' : 'text-neutral-400'}`}>{label}</p>
            <p className={`mt-1 break-words text-sm font-medium ${isDark ? 'text-white' : 'text-neutral-900'}`}>{value || '-'}</p>
        </div>
    )
}

function MoneyRow({ label, value, isDark, strong = false }: { label: string; value: string; isDark: boolean; strong?: boolean }) {
    return (
        <div className="flex items-center justify-between gap-4">
            <span className={isDark ? 'text-white/55' : 'text-neutral-600'}>{label}</span>
            <span className={strong ? 'font-bold' : 'font-medium'}>{value}</span>
        </div>
    )
}

function StatCard({
    label,
    value,
    icon,
    isDark,
    accent = 'violet',
}: {
    label: string
    value: string
    icon: React.ReactNode
    isDark: boolean
    accent?: 'violet' | 'amber' | 'blue' | 'green'
}) {
    const accentClass = accent === 'amber'
        ? isDark ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-600'
        : accent === 'blue'
            ? isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'
            : accent === 'green'
                ? isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
                : isDark ? 'bg-violet-500/10 text-violet-400' : 'bg-violet-50 text-violet-600'

    return (
        <div className={`rounded-2xl border p-5 transition hover:-translate-y-0.5 ${isDark ? 'border-white/[0.08] bg-[#15151b]' : 'border-neutral-200 bg-white'}`}>
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className={`text-sm ${isDark ? 'text-white/55' : 'text-neutral-600'}`}>{label}</p>
                    <p className="mt-3 truncate text-xl font-bold tracking-tight">{value}</p>
                </div>
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accentClass}`}>{icon}</div>
            </div>
            <div className={`mt-5 border-t pt-3 text-[11px] ${isDark ? 'border-white/[0.06] text-white/25' : 'border-neutral-100 text-neutral-400'}`}>
                39Production workspace
            </div>
        </div>
    )
}
