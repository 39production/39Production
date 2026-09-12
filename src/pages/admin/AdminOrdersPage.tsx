import {
    Edit,
    Package,
    Plus,
    Search,
    ShoppingBag,
    Trash2,
    X,
    Loader2,
    RefreshCw,
} from 'lucide-react'
import {
    FormEvent,
    useEffect,
    useMemo,
    useState,
} from 'react'
import { authenticatedFetch } from '@/lib/auth'

const API_BASE_URL =
    'https://39production-api.39production.workers.dev'

interface Order {
    id: number
    orderNumber: string
    customer: string
    email: string
    phone: string
    item: string
    productId: number
    type: 'Service' | 'Product'
    quantity: number
    unitPrice: number
    total: number
    date: string
    status:
    | 'Pending'
    | 'Processing'
    | 'Completed'
    | 'Cancelled'
}

interface Product {
    id: number
    name: string
    category: string
    description: string
    price: number
    stock: number
    status: 'Published' | 'Draft'
}

type OrderStatus =
    | 'Pending'
    | 'Processing'
    | 'Completed'
    | 'Cancelled'

const emptyForm = {
    customer: '',
    email: '',
    phone: '',
    productId: '',
    quantity: '1',
    status: 'Pending' as OrderStatus,
}

function formatCurrency(value: number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value)
}

function formatDate(date: string) {
    if (!date) return '-'

    const parsedDate = new Date(date)

    if (Number.isNaN(parsedDate.getTime())) {
        return '-'
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(parsedDate)
}

function getDateOnly(date?: string) {
    if (!date) {
        return new Date().toISOString().split('T')[0]
    }

    const parsedDate = new Date(date)

    if (Number.isNaN(parsedDate.getTime())) {
        return new Date().toISOString().split('T')[0]
    }

    return parsedDate.toISOString().split('T')[0]
}

function mapOrder(data: any): Order {
    return {
        id: Number(data.id),
        orderNumber: String(data.order_number ?? ''),
        customer: String(data.customer_name ?? ''),
        email: String(data.customer_email ?? ''),
        phone: String(data.customer_phone ?? ''),
        item: String(data.product_name ?? ''),
        productId: Number(data.product_id ?? 0),
        type:
            data.type === 'Service'
                ? 'Service'
                : 'Product',
        quantity: Number(data.quantity ?? 0),
        unitPrice: Number(data.unit_price ?? 0),
        total: Number(data.total_price ?? 0),
        date: getDateOnly(data.created_at),
        status:
            data.status === 'Processing'
                ? 'Processing'
                : data.status === 'Completed'
                    ? 'Completed'
                    : data.status === 'Cancelled'
                        ? 'Cancelled'
                        : 'Pending',
    }
}

export function AdminOrdersPage() {
    const [orders, setOrders] =
        useState<Order[]>([])

    const [products, setProducts] =
        useState<Product[]>([])

    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] =
        useState('All')
    const [typeFilter, setTypeFilter] =
        useState('All')

    const [isModalOpen, setIsModalOpen] =
        useState(false)

    const [editingOrder, setEditingOrder] =
        useState<Order | null>(null)

    const [form, setForm] =
        useState(emptyForm)

    const [error, setError] =
        useState('')

    const [loading, setLoading] =
        useState(true)

    const [productsLoading, setProductsLoading] =
        useState(false)

    const [submitting, setSubmitting] =
        useState(false)

    const [deletingId, setDeletingId] =
        useState<number | null>(null)

    const [successMessage, setSuccessMessage] =
        useState('')

    /* =====================================================
       FETCH ORDERS
    ===================================================== */

    async function fetchOrders() {
        try {
            setLoading(true)
            setError('')

            const response = await authenticatedFetch(
                `${API_BASE_URL}/api/orders`,
                {
                    cache: 'no-store',
                },
            )

            const result = await response.json()

            if (!response.ok) {
                throw new Error(
                    result?.message ||
                    `Failed to load orders (${response.status})`,
                )
            }

            const data = Array.isArray(result)
                ? result
                : Array.isArray(result?.data)
                    ? result.data
                    : Array.isArray(result?.orders)
                        ? result.orders
                        : []

            setOrders(data.map(mapOrder))
        } catch (err) {
            console.error(
                'Fetch orders error:',
                err,
            )

            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to load orders.',
            )
        } finally {
            setLoading(false)
        }
    }

    /* =====================================================
       FETCH PRODUCTS
    ===================================================== */

    async function fetchProducts() {
        try {
            setProductsLoading(true)

            const response = await fetch(
                `${API_BASE_URL}/api/products`,
            )

            const result = await response.json()

            if (!response.ok) {
                throw new Error(
                    result?.message ||
                    `Failed to load products (${response.status})`,
                )
            }

            const data = Array.isArray(result)
                ? result
                : Array.isArray(result?.data)
                    ? result.data
                    : Array.isArray(result?.products)
                        ? result.products
                        : []

            const publishedProducts =
                data.filter(
                    (product: Product) =>
                        product.status === 'Published',
                )

            setProducts(publishedProducts)
        } catch (err) {
            console.error(
                'Fetch products error:',
                err,
            )
        } finally {
            setProductsLoading(false)
        }
    }

    useEffect(() => {
        fetchOrders()
        fetchProducts()
    }, [])

    /* =====================================================
       FILTER
    ===================================================== */

    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            const searchValue =
                search.toLowerCase().trim()

            const matchesSearch =
                order.orderNumber
                    .toLowerCase()
                    .includes(searchValue) ||
                order.customer
                    .toLowerCase()
                    .includes(searchValue) ||
                order.email
                    .toLowerCase()
                    .includes(searchValue) ||
                order.item
                    .toLowerCase()
                    .includes(searchValue)

            const matchesStatus =
                statusFilter === 'All' ||
                order.status === statusFilter

            const matchesType =
                typeFilter === 'All' ||
                order.type === typeFilter

            return (
                matchesSearch &&
                matchesStatus &&
                matchesType
            )
        })
    }, [
        orders,
        search,
        statusFilter,
        typeFilter,
    ])

    /* =====================================================
       STATS
    ===================================================== */

    const pendingCount = orders.filter(
        (order) =>
            order.status === 'Pending',
    ).length

    const processingCount = orders.filter(
        (order) =>
            order.status === 'Processing',
    ).length

    const completedCount = orders.filter(
        (order) =>
            order.status === 'Completed',
    ).length

    const totalRevenue = orders
        .filter(
            (order) =>
                order.status !== 'Cancelled',
        )
        .reduce(
            (total, order) =>
                total + order.total,
            0,
        )

    /* =====================================================
       SELECTED PRODUCT
    ===================================================== */

    const selectedProduct = useMemo(() => {
        const productId =
            Number(form.productId)

        return products.find(
            (product) =>
                product.id === productId,
        )
    }, [
        form.productId,
        products,
    ])

    const calculatedTotal =
        selectedProduct
            ? selectedProduct.price *
            Number(form.quantity || 0)
            : 0

    /* =====================================================
       MODAL
    ===================================================== */

    function openAddModal() {
        setEditingOrder(null)
        setForm({
            ...emptyForm,
            productId:
                products.length > 0
                    ? String(products[0].id)
                    : '',
        })
        setError('')
        setSuccessMessage('')
        setIsModalOpen(true)
    }

    function openEditModal(
        order: Order,
    ) {
        setEditingOrder(order)

        setForm({
            customer: order.customer,
            email: order.email,
            phone: order.phone,
            productId:
                order.productId
                    ? String(order.productId)
                    : '',
            quantity: String(order.quantity),
            status: order.status,
        })

        setError('')
        setSuccessMessage('')
        setIsModalOpen(true)
    }

    function closeModal() {
        if (submitting) return

        setIsModalOpen(false)
        setEditingOrder(null)
        setForm(emptyForm)
        setError('')
    }

    /* =====================================================
       SUBMIT
    ===================================================== */

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault()

        setError('')
        setSuccessMessage('')

        const customer =
            form.customer.trim()

        const email =
            form.email.trim().toLowerCase()

        const phone =
            form.phone.trim()

        const productId =
            Number(form.productId)

        const quantity =
            Number(form.quantity)

        /* =========================
           VALIDATION
        ========================= */

        if (!customer) {
            setError(
                'Customer name is required.',
            )
            return
        }

        if (!email) {
            setError(
                'Customer email is required.',
            )
            return
        }

        if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                email,
            )
        ) {
            setError(
                'Please enter a valid customer email.',
            )
            return
        }

        if (!phone) {
            setError(
                'Customer phone number is required.',
            )
            return
        }

        if (
            !Number.isInteger(productId) ||
            productId <= 0
        ) {
            setError(
                'Please select a product.',
            )
            return
        }

        if (
            !Number.isInteger(quantity) ||
            quantity <= 0
        ) {
            setError(
                'Please enter a valid quantity.',
            )
            return
        }

        if (!selectedProduct) {
            setError(
                'Selected product was not found.',
            )
            return
        }

        if (
            quantity >
            selectedProduct.stock
        ) {
            setError(
                `Only ${selectedProduct.stock} item(s) available.`,
            )
            return
        }

        try {
            setSubmitting(true)

            /* =========================
               EDIT STATUS ONLY
            ========================= */

            if (editingOrder) {
                const response =
                    await authenticatedFetch(
                        `${API_BASE_URL}/api/orders/${editingOrder.id}`,
                        {
                            method: 'PUT',
                            headers: {
                                'Content-Type':
                                    'application/json',
                            },
                            body: JSON.stringify({
                                status:
                                    form.status,
                            }),
                        },
                    )

                const result =
                    await response.json()

                if (!response.ok) {
                    throw new Error(
                        result?.message ||
                        `Failed to update order (${response.status})`,
                    )
                }

                setSuccessMessage(
                    'Order status updated successfully.',
                )

                closeModal()

                await fetchOrders()

                return
            }

            /* =========================
               CREATE ORDER
            ========================= */

            const response =
                await authenticatedFetch(
                    `${API_BASE_URL}/api/orders`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type':
                                'application/json',
                        },
                        body: JSON.stringify({
                            product_id:
                                productId,
                            customer_name:
                                customer,
                            customer_email:
                                email,
                            customer_phone:
                                phone,
                            quantity,
                        }),
                    },
                )

            const result =
                await response.json()

            if (!response.ok) {
                throw new Error(
                    result?.message ||
                    `Failed to create order (${response.status})`,
                )
            }

            setSuccessMessage(
                'Order created successfully.',
            )

            closeModal()

            await fetchOrders()
            await fetchProducts()
        } catch (err) {
            console.error(
                'Submit order error:',
                err,
            )

            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to save order.',
            )
        } finally {
            setSubmitting(false)
        }
    }

    /* =====================================================
       DELETE
    ===================================================== */

    async function handleDelete(
        id: number,
    ) {
        const order =
            orders.find(
                (item) =>
                    item.id === id,
            )

        if (!order) return

        const confirmed =
            window.confirm(
                `Are you sure you want to delete "${order.orderNumber}"?`,
            )

        if (!confirmed) return

        try {
            setDeletingId(id)
            setError('')
            setSuccessMessage('')

            const response =
                await authenticatedFetch(
                    `${API_BASE_URL}/api/orders/${id}`,
                    {
                        method: 'DELETE',
                    },
                )

            const result =
                await response.json()

            if (!response.ok) {
                throw new Error(
                    result?.message ||
                    `Failed to delete order (${response.status})`,
                )
            }

            setOrders(
                (current) =>
                    current.filter(
                        (item) =>
                            item.id !== id,
                    ),
            )

            setSuccessMessage(
                'Order deleted successfully.',
            )
        } catch (err) {
            console.error(
                'Delete order error:',
                err,
            )

            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to delete order.',
            )
        } finally {
            setDeletingId(null)
        }
    }

    /* =====================================================
       REFRESH
    ===================================================== */

    async function handleRefresh() {
        setSuccessMessage('')
        setError('')

        await Promise.all([
            fetchOrders(),
            fetchProducts(),
        ])
    }

    return (
        <div className="space-y-8">
            {/* =================================================
               HEADER
            ================================================= */}

            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                    <p className="text-sm text-text-muted">
                        Admin Panel
                    </p>

                    <h1 className="mt-1 font-display text-3xl font-bold text-text-primary">
                        Orders
                    </h1>

                    <p className="mt-2 text-sm text-text-secondary">
                        Manage customer orders and order status.
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={
                            handleRefresh
                        }
                        disabled={loading}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-border-default px-4 py-2.5 text-sm font-semibold text-text-secondary transition-colors hover:bg-bg-base hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <RefreshCw
                            className={`h-4 w-4 ${loading
                                ? 'animate-spin'
                                : ''
                                }`}
                        />
                        Refresh
                    </button>

                    <button
                        type="button"
                        onClick={
                            openAddModal
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-secondary"
                    >
                        <Plus className="h-4 w-4" />
                        Add Order
                    </button>
                </div>
            </div>

            {/* =================================================
               ALERTS
            ================================================= */}

            {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-400">
                    {error}
                </div>
            )}

            {successMessage && (
                <div className="rounded-xl border border-green-500/20 bg-green-500/10 px-5 py-4 text-sm text-green-400">
                    {successMessage}
                </div>
            )}

            {/* =================================================
               STATS
            ================================================= */}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                <StatCard
                    label="Total Orders"
                    value={String(
                        orders.length,
                    )}
                />

                <StatCard
                    label="Pending"
                    value={String(
                        pendingCount,
                    )}
                />

                <StatCard
                    label="Processing"
                    value={String(
                        processingCount,
                    )}
                />

                <StatCard
                    label="Completed"
                    value={String(
                        completedCount,
                    )}
                />

                <StatCard
                    label="Revenue"
                    value={formatCurrency(
                        totalRevenue,
                    )}
                />
            </div>

            {/* =================================================
               SEARCH & FILTERS
            ================================================= */}

            <div className="rounded-xl border border-border-default bg-bg-surface p-5">
                <div className="grid gap-4 md:grid-cols-[1fr_200px_200px]">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />

                        <input
                            type="text"
                            value={search}
                            onChange={(
                                event,
                            ) =>
                                setSearch(
                                    event
                                        .target
                                        .value,
                                )
                            }
                            placeholder="Search orders..."
                            className="w-full rounded-lg border border-border-default bg-bg-base py-3 pl-10 pr-4 text-sm text-text-primary outline-none transition focus:border-brand-primary"
                        />
                    </div>

                    <select
                        value={
                            typeFilter
                        }
                        onChange={(
                            event,
                        ) =>
                            setTypeFilter(
                                event
                                    .target
                                    .value,
                            )
                        }
                        className="rounded-lg border border-border-default bg-bg-base px-4 py-3 text-sm text-text-primary outline-none focus:border-brand-primary"
                    >
                        <option value="All">
                            All Types
                        </option>

                        <option value="Service">
                            Service
                        </option>

                        <option value="Product">
                            Product
                        </option>
                    </select>

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
                                    .value,
                            )
                        }
                        className="rounded-lg border border-border-default bg-bg-base px-4 py-3 text-sm text-text-primary outline-none focus:border-brand-primary"
                    >
                        <option value="All">
                            All Status
                        </option>

                        <option value="Pending">
                            Pending
                        </option>

                        <option value="Processing">
                            Processing
                        </option>

                        <option value="Completed">
                            Completed
                        </option>

                        <option value="Cancelled">
                            Cancelled
                        </option>
                    </select>
                </div>
            </div>

            {/* =================================================
               ORDERS TABLE
            ================================================= */}

            <div className="overflow-hidden rounded-xl border border-border-default bg-bg-surface">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1250px] text-left text-sm">
                        <thead className="border-b border-border-default bg-bg-base">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-text-primary">
                                    Order
                                </th>

                                <th className="px-6 py-4 font-semibold text-text-primary">
                                    Customer
                                </th>

                                <th className="px-6 py-4 font-semibold text-text-primary">
                                    Item
                                </th>

                                <th className="px-6 py-4 font-semibold text-text-primary">
                                    Type
                                </th>

                                <th className="px-6 py-4 font-semibold text-text-primary">
                                    Qty
                                </th>

                                <th className="px-6 py-4 font-semibold text-text-primary">
                                    Total
                                </th>

                                <th className="px-6 py-4 font-semibold text-text-primary">
                                    Date
                                </th>

                                <th className="px-6 py-4 font-semibold text-text-primary">
                                    Status
                                </th>

                                <th className="px-6 py-4 font-semibold text-text-primary">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan={9}
                                        className="px-6 py-16 text-center"
                                    >
                                        <div className="flex items-center justify-center gap-3 text-text-muted">
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            <span>
                                                Loading orders...
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                <>
                                    {filteredOrders.map(
                                        (
                                            order,
                                        ) => (
                                            <tr
                                                key={
                                                    order.id
                                                }
                                                className="border-b border-border-default last:border-0"
                                            >
                                                {/* Order */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="rounded-lg bg-brand-primary/10 p-2 text-brand-primary">
                                                            <ShoppingBag className="h-5 w-5" />
                                                        </div>

                                                        <div>
                                                            <p className="font-medium text-text-primary">
                                                                {
                                                                    order.orderNumber
                                                                }
                                                            </p>

                                                            <p className="text-xs text-text-muted">
                                                                ID #
                                                                {
                                                                    order.id
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Customer */}
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="font-medium text-text-primary">
                                                            {
                                                                order.customer
                                                            }
                                                        </p>

                                                        <p className="mt-1 text-xs text-text-muted">
                                                            {
                                                                order.email
                                                            }
                                                        </p>

                                                        {order.phone && (
                                                            <p className="mt-1 text-xs text-text-muted">
                                                                {
                                                                    order.phone
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Item */}
                                                <td className="px-6 py-4">
                                                    <p className="max-w-xs text-text-secondary">
                                                        {
                                                            order.item
                                                        }
                                                    </p>

                                                    {order.unitPrice >
                                                        0 && (
                                                            <p className="mt-1 text-xs text-text-muted">
                                                                {formatCurrency(
                                                                    order.unitPrice,
                                                                )}{' '}
                                                                / item
                                                            </p>
                                                        )}
                                                </td>

                                                {/* Type */}
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-bg-base px-3 py-1 text-xs font-medium text-text-secondary">
                                                        <Package className="h-3.5 w-3.5" />
                                                        {
                                                            order.type
                                                        }
                                                    </span>
                                                </td>

                                                {/* Quantity */}
                                                <td className="px-6 py-4 text-text-secondary">
                                                    {
                                                        order.quantity
                                                    }
                                                </td>

                                                {/* Total */}
                                                <td className="px-6 py-4 font-medium text-text-primary">
                                                    {formatCurrency(
                                                        order.total,
                                                    )}
                                                </td>

                                                {/* Date */}
                                                <td className="px-6 py-4 text-text-secondary">
                                                    {formatDate(
                                                        order.date,
                                                    )}
                                                </td>

                                                {/* Status */}
                                                <td className="px-6 py-4">
                                                    <StatusBadge
                                                        status={
                                                            order.status
                                                        }
                                                    />
                                                </td>

                                                {/* Actions */}
                                                <td className="px-6 py-4">
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openEditModal(
                                                                    order,
                                                                )
                                                            }
                                                            className="rounded-lg border border-border-default p-2 text-text-muted transition-colors hover:text-text-primary"
                                                            title="Edit order"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    order.id,
                                                                )
                                                            }
                                                            disabled={
                                                                deletingId ===
                                                                order.id
                                                            }
                                                            className="rounded-lg border border-border-default p-2 text-red-400 transition-colors hover:bg-red-400/10 disabled:cursor-not-allowed disabled:opacity-50"
                                                            title="Delete order"
                                                        >
                                                            {deletingId ===
                                                                order.id ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="h-4 w-4" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ),
                                    )}

                                    {filteredOrders.length ===
                                        0 && (
                                            <tr>
                                                <td
                                                    colSpan={
                                                        9
                                                    }
                                                    className="px-6 py-16 text-center text-sm text-text-muted"
                                                >
                                                    No orders found.
                                                </td>
                                            </tr>
                                        )}
                                </>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* =================================================
               MODAL
            ================================================= */}

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
                    <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-border-default bg-bg-surface shadow-2xl">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-border-default px-6 py-5">
                            <div>
                                <h2 className="font-display text-xl font-bold text-text-primary">
                                    {editingOrder
                                        ? 'Edit Order'
                                        : 'Add Order'}
                                </h2>

                                <p className="mt-1 text-sm text-text-muted">
                                    {editingOrder
                                        ? 'Update order status.'
                                        : 'Create a new product order.'}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={
                                    closeModal
                                }
                                disabled={
                                    submitting
                                }
                                className="rounded-lg p-2 text-text-muted transition-colors hover:bg-bg-base hover:text-text-primary disabled:opacity-50"
                                aria-label="Close modal"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Form */}
                        <form
                            onSubmit={
                                handleSubmit
                            }
                        >
                            <div className="space-y-5 px-6 py-6">
                                {error && (
                                    <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                                        {
                                            error
                                        }
                                    </div>
                                )}

                                {/* Customer */}
                                <div className="grid gap-5 md:grid-cols-2">
                                    <div>
                                        <label
                                            htmlFor="order-customer"
                                            className="mb-2 block text-sm font-medium text-text-primary"
                                        >
                                            Customer
                                        </label>

                                        <input
                                            id="order-customer"
                                            type="text"
                                            value={
                                                form.customer
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                setForm(
                                                    (
                                                        current,
                                                    ) => ({
                                                        ...current,
                                                        customer:
                                                            event
                                                                .target
                                                                .value,
                                                    }),
                                                )
                                            }
                                            placeholder="e.g. John Doe"
                                            disabled={
                                                submitting
                                            }
                                            className="w-full rounded-lg border border-border-default bg-bg-base px-4 py-3 text-sm text-text-primary outline-none focus:border-brand-primary disabled:opacity-50"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="order-email"
                                            className="mb-2 block text-sm font-medium text-text-primary"
                                        >
                                            Customer Email
                                        </label>

                                        <input
                                            id="order-email"
                                            type="email"
                                            value={
                                                form.email
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                setForm(
                                                    (
                                                        current,
                                                    ) => ({
                                                        ...current,
                                                        email: event
                                                            .target
                                                            .value,
                                                    }),
                                                )
                                            }
                                            placeholder="customer@example.com"
                                            disabled={
                                                submitting
                                            }
                                            className="w-full rounded-lg border border-border-default bg-bg-base px-4 py-3 text-sm text-text-primary outline-none focus:border-brand-primary disabled:opacity-50"
                                        />
                                    </div>
                                </div>

                                {/* Phone */}
                                <div>
                                    <label
                                        htmlFor="order-phone"
                                        className="mb-2 block text-sm font-medium text-text-primary"
                                    >
                                        Customer Phone
                                    </label>

                                    <input
                                        id="order-phone"
                                        type="tel"
                                        value={
                                            form.phone
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            setForm(
                                                (
                                                    current,
                                                ) => ({
                                                    ...current,
                                                    phone: event
                                                        .target
                                                        .value,
                                                }),
                                            )
                                        }
                                        placeholder="e.g. 081234567890"
                                        disabled={
                                            submitting
                                        }
                                        className="w-full rounded-lg border border-border-default bg-bg-base px-4 py-3 text-sm text-text-primary outline-none focus:border-brand-primary disabled:opacity-50"
                                    />
                                </div>

                                {/* Product */}
                                <div>
                                    <label
                                        htmlFor="order-product"
                                        className="mb-2 block text-sm font-medium text-text-primary"
                                    >
                                        Product
                                    </label>

                                    <select
                                        id="order-product"
                                        value={
                                            form.productId
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            setForm(
                                                (
                                                    current,
                                                ) => ({
                                                    ...current,
                                                    productId:
                                                        event
                                                            .target
                                                            .value,
                                                }),
                                            )
                                        }
                                        disabled={
                                            submitting ||
                                            productsLoading ||
                                            Boolean(
                                                editingOrder,
                                            )
                                        }
                                        className="w-full rounded-lg border border-border-default bg-bg-base px-4 py-3 text-sm text-text-primary outline-none focus:border-brand-primary disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="">
                                            {productsLoading
                                                ? 'Loading products...'
                                                : 'Select product'}
                                        </option>

                                        {products.map(
                                            (
                                                product,
                                            ) => (
                                                <option
                                                    key={
                                                        product.id
                                                    }
                                                    value={
                                                        product.id
                                                    }
                                                >
                                                    {
                                                        product.name
                                                    }{' '}
                                                    —{' '}
                                                    {formatCurrency(
                                                        product.price,
                                                    )}{' '}
                                                    — Stock:{' '}
                                                    {
                                                        product.stock
                                                    }
                                                </option>
                                            ),
                                        )}
                                    </select>

                                    {!editingOrder &&
                                        products.length ===
                                        0 &&
                                        !productsLoading && (
                                            <p className="mt-2 text-xs text-red-400">
                                                No published products are available.
                                            </p>
                                        )}
                                </div>

                                {/* Quantity */}
                                <div className="grid gap-5 md:grid-cols-2">
                                    <div>
                                        <label
                                            htmlFor="order-quantity"
                                            className="mb-2 block text-sm font-medium text-text-primary"
                                        >
                                            Quantity
                                        </label>

                                        <input
                                            id="order-quantity"
                                            type="number"
                                            min="1"
                                            max={
                                                selectedProduct?.stock ||
                                                undefined
                                            }
                                            step="1"
                                            value={
                                                form.quantity
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                setForm(
                                                    (
                                                        current,
                                                    ) => ({
                                                        ...current,
                                                        quantity:
                                                            event
                                                                .target
                                                                .value,
                                                    }),
                                                )
                                            }
                                            disabled={
                                                submitting
                                            }
                                            className="w-full rounded-lg border border-border-default bg-bg-base px-4 py-3 text-sm text-text-primary outline-none focus:border-brand-primary disabled:opacity-50"
                                        />

                                        {selectedProduct && (
                                            <p className="mt-2 text-xs text-text-muted">
                                                {
                                                    selectedProduct.stock
                                                }{' '}
                                                item(s) available
                                            </p>
                                        )}
                                    </div>

                                    {/* Total */}
                                    <div>
                                        <label
                                            htmlFor="order-total"
                                            className="mb-2 block text-sm font-medium text-text-primary"
                                        >
                                            Total Amount
                                        </label>

                                        <div
                                            id="order-total"
                                            className="flex min-h-[46px] items-center rounded-lg border border-border-default bg-bg-base px-4 py-3 text-sm font-semibold text-text-primary"
                                        >
                                            {formatCurrency(
                                                calculatedTotal,
                                            )}
                                        </div>

                                        <p className="mt-2 text-xs text-text-muted">
                                            Calculated automatically from product price.
                                        </p>
                                    </div>
                                </div>

                                {/* Status */}
                                <div>
                                    <label
                                        htmlFor="order-status"
                                        className="mb-2 block text-sm font-medium text-text-primary"
                                    >
                                        Status
                                    </label>

                                    <select
                                        id="order-status"
                                        value={
                                            form.status
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            setForm(
                                                (
                                                    current,
                                                ) => ({
                                                    ...current,
                                                    status: event
                                                        .target
                                                        .value as OrderStatus,
                                                }),
                                            )
                                        }
                                        disabled={
                                            submitting
                                        }
                                        className="w-full rounded-lg border border-border-default bg-bg-base px-4 py-3 text-sm text-text-primary outline-none focus:border-brand-primary disabled:opacity-50"
                                    >
                                        <option value="Pending">
                                            Pending
                                        </option>

                                        <option value="Processing">
                                            Processing
                                        </option>

                                        <option value="Completed">
                                            Completed
                                        </option>

                                        <option value="Cancelled">
                                            Cancelled
                                        </option>
                                    </select>
                                </div>

                                {/* Info */}
                                {!editingOrder && (
                                    <div className="rounded-lg border border-brand-primary/20 bg-brand-primary/5 px-4 py-3 text-sm text-text-secondary">
                                        When the order is created, the product stock will automatically be reduced by the selected quantity.
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="flex justify-end gap-3 border-t border-border-default px-6 py-5">
                                <button
                                    type="button"
                                    onClick={
                                        closeModal
                                    }
                                    disabled={
                                        submitting
                                    }
                                    className="rounded-lg border border-border-default px-5 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-base hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        submitting ||
                                        (
                                            !editingOrder &&
                                            products.length ===
                                            0
                                        )
                                    }
                                    className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-secondary disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />

                                            {editingOrder
                                                ? 'Saving...'
                                                : 'Creating...'}
                                        </>
                                    ) : (
                                        <>
                                            {editingOrder
                                                ? 'Save Changes'
                                                : 'Create Order'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({
    status,
}: {
    status: Order['status']
}) {
    const statusClass =
        status === 'Pending'
            ? 'bg-yellow-400/10 text-yellow-400'
            : status === 'Processing'
                ? 'bg-blue-400/10 text-blue-400'
                : status === 'Completed'
                    ? 'bg-green-400/10 text-green-400'
                    : 'bg-red-400/10 text-red-400'

    return (
        <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${statusClass}`}
        >
            {status}
        </span>
    )
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
    label,
    value,
}: {
    label: string
    value: string
}) {
    return (
        <div className="rounded-xl border border-border-default bg-bg-surface p-5">
            <div className="mb-3 flex items-center gap-2 text-brand-primary">
                <ShoppingBag className="h-5 w-5" />

                <span className="text-sm">
                    {label}
                </span>
            </div>

            <p className="text-2xl font-bold text-text-primary">
                {value}
            </p>
        </div>
    )
}