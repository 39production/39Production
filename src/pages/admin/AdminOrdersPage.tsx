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

type ThemeMode = 'dark' | 'light'

const emptyForm = {
    customer: '',
    email: '',
    phone: '',
    productId: '',
    quantity: '1',
    status: 'Pending' as OrderStatus,
}

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
   FORMATTERS
========================================================= */

function formatCurrency(
    value: number,
) {
    return new Intl.NumberFormat(
        'id-ID',
        {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        },
    ).format(value)
}

function formatDate(
    date: string,
) {
    if (!date) return '-'

    const parsedDate =
        new Date(date)

    if (
        Number.isNaN(
            parsedDate.getTime(),
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
    ).format(parsedDate)
}

function getDateOnly(
    date?: string,
) {
    if (!date) {
        return new Date()
            .toISOString()
            .split('T')[0]
    }

    const parsedDate =
        new Date(date)

    if (
        Number.isNaN(
            parsedDate.getTime(),
        )
    ) {
        return new Date()
            .toISOString()
            .split('T')[0]
    }

    return parsedDate
        .toISOString()
        .split('T')[0]
}

function mapOrder(
    data: any,
): Order {
    return {
        id: Number(
            data.id,
        ),

        orderNumber: String(
            data.order_number ??
            '',
        ),

        customer: String(
            data.customer_name ??
            '',
        ),

        email: String(
            data.customer_email ??
            '',
        ),

        phone: String(
            data.customer_phone ??
            '',
        ),

        item: String(
            data.product_name ??
            '',
        ),

        productId: Number(
            data.product_id ??
            0,
        ),

        type:
            data.type ===
                'Service'
                ? 'Service'
                : 'Product',

        quantity: Number(
            data.quantity ??
            0,
        ),

        unitPrice: Number(
            data.unit_price ??
            0,
        ),

        total: Number(
            data.total_price ??
            0,
        ),

        date: getDateOnly(
            data.created_at,
        ),

        status:
            data.status ===
                'Processing'
                ? 'Processing'
                : data.status ===
                    'Completed'
                    ? 'Completed'
                    : data.status ===
                        'Cancelled'
                        ? 'Cancelled'
                        : 'Pending',
    }
}

/* =========================================================
   PAGE
========================================================= */

export function AdminOrdersPage() {
    const theme =
        useAdminTheme()

    const isDark =
        theme === 'dark'

    const [orders, setOrders] =
        useState<Order[]>([])

    const [
        products,
        setProducts,
    ] =
        useState<Product[]>([])

    const [
        search,
        setSearch,
    ] = useState('')

    const [
        statusFilter,
        setStatusFilter,
    ] = useState('All')

    const [
        typeFilter,
        setTypeFilter,
    ] = useState('All')

    const [
        isModalOpen,
        setIsModalOpen,
    ] = useState(false)

    const [
        editingOrder,
        setEditingOrder,
    ] =
        useState<Order | null>(
            null,
        )

    const [
        form,
        setForm,
    ] = useState(emptyForm)

    const [
        error,
        setError,
    ] = useState('')

    const [
        loading,
        setLoading,
    ] = useState(true)

    const [
        productsLoading,
        setProductsLoading,
    ] = useState(false)

    const [
        submitting,
        setSubmitting,
    ] = useState(false)

    const [
        deletingId,
        setDeletingId,
    ] = useState<number | null>(
        null,
    )

    const [
        successMessage,
        setSuccessMessage,
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

    const inputBg = isDark
        ? 'bg-[#0f0f13]'
        : 'bg-neutral-50'

    const pageSurface =
        isDark
            ? 'bg-[#0b0b0f]'
            : 'bg-[#f7f7fa]'

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
       FETCH ORDERS
    ===================================================== */

    async function fetchOrders() {
        try {
            setLoading(true)
            setError('')

            const response =
                await authenticatedFetch(
                    `${API_BASE_URL}/api/orders`,
                    {
                        cache: 'no-store',
                    },
                )

            const result =
                await response.json()

            if (!response.ok) {
                throw new Error(
                    result?.message ||
                    `Failed to load orders (${response.status})`,
                )
            }

            const data =
                Array.isArray(result)
                    ? result
                    : Array.isArray(
                        result?.data,
                    )
                        ? result.data
                        : Array.isArray(
                            result?.orders,
                        )
                            ? result.orders
                            : []

            setOrders(
                data.map(
                    mapOrder,
                ),
            )
        } catch (err) {
            console.error(
                'Fetch orders error:',
                err,
            )

            setError(
                err instanceof
                    Error
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
            setProductsLoading(
                true,
            )

            const response =
                await fetch(
                    `${API_BASE_URL}/api/products`,
                )

            const result =
                await response.json()

            if (!response.ok) {
                throw new Error(
                    result?.message ||
                    `Failed to load products (${response.status})`,
                )
            }

            const data =
                Array.isArray(result)
                    ? result
                    : Array.isArray(
                        result?.data,
                    )
                        ? result.data
                        : Array.isArray(
                            result?.products,
                        )
                            ? result.products
                            : []

            const publishedProducts =
                data.filter(
                    (
                        product: Product,
                    ) =>
                        product.status ===
                        'Published',
                )

            setProducts(
                publishedProducts,
            )
        } catch (err) {
            console.error(
                'Fetch products error:',
                err,
            )
        } finally {
            setProductsLoading(
                false,
            )
        }
    }

    useEffect(() => {
        fetchOrders()
        fetchProducts()
    }, [])

    /* =====================================================
       FILTER
    ===================================================== */

    const filteredOrders =
        useMemo(() => {
            return orders.filter(
                (order) => {
                    const searchValue =
                        search
                            .toLowerCase()
                            .trim()

                    const matchesSearch =
                        order.orderNumber
                            .toLowerCase()
                            .includes(
                                searchValue,
                            ) ||
                        order.customer
                            .toLowerCase()
                            .includes(
                                searchValue,
                            ) ||
                        order.email
                            .toLowerCase()
                            .includes(
                                searchValue,
                            ) ||
                        order.item
                            .toLowerCase()
                            .includes(
                                searchValue,
                            )

                    const matchesStatus =
                        statusFilter ===
                        'All' ||
                        order.status ===
                        statusFilter

                    const matchesType =
                        typeFilter ===
                        'All' ||
                        order.type ===
                        typeFilter

                    return (
                        matchesSearch &&
                        matchesStatus &&
                        matchesType
                    )
                },
            )
        }, [
            orders,
            search,
            statusFilter,
            typeFilter,
        ])

    /* =====================================================
       STATS
    ===================================================== */

    const pendingCount =
        orders.filter(
            (order) =>
                order.status ===
                'Pending',
        ).length

    const processingCount =
        orders.filter(
            (order) =>
                order.status ===
                'Processing',
        ).length

    const completedCount =
        orders.filter(
            (order) =>
                order.status ===
                'Completed',
        ).length

    const totalRevenue =
        orders
            .filter(
                (order) =>
                    order.status !==
                    'Cancelled',
            )
            .reduce(
                (
                    total,
                    order,
                ) =>
                    total +
                    order.total,
                0,
            )

    /* =====================================================
       SELECTED PRODUCT
    ===================================================== */

    const selectedProduct =
        useMemo(() => {
            const productId =
                Number(
                    form.productId,
                )

            return products.find(
                (product) =>
                    product.id ===
                    productId,
            )
        }, [
            form.productId,
            products,
        ])

    const calculatedTotal =
        selectedProduct
            ? selectedProduct.price *
            Number(
                form.quantity ||
                0,
            )
            : 0

    /* =====================================================
       MODAL
    ===================================================== */

    function openAddModal() {
        setEditingOrder(
            null,
        )

        setForm({
            ...emptyForm,
            productId:
                products.length >
                    0
                    ? String(
                        products[0]
                            .id,
                    )
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
            customer:
                order.customer,
            email: order.email,
            phone: order.phone,
            productId:
                order.productId
                    ? String(
                        order.productId,
                    )
                    : '',
            quantity:
                String(
                    order.quantity,
                ),
            status:
                order.status,
        })

        setError('')
        setSuccessMessage('')
        setIsModalOpen(true)
    }

    function closeModal() {
        if (submitting) {
            return
        }

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
            form.email
                .trim()
                .toLowerCase()

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
            !Number.isInteger(
                productId,
            ) ||
            productId <= 0
        ) {
            setError(
                'Please select a product.',
            )
            return
        }

        if (
            !Number.isInteger(
                quantity,
            ) ||
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
                            body: JSON.stringify(
                                {
                                    status:
                                        form.status,
                                },
                            ),
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
                        body: JSON.stringify(
                            {
                                product_id:
                                    productId,
                                customer_name:
                                    customer,
                                customer_email:
                                    email,
                                customer_phone:
                                    phone,
                                quantity,
                            },
                        ),
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
                err instanceof
                    Error
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

        if (!order) {
            return
        }

        const confirmed =
            window.confirm(
                `Are you sure you want to delete "${order.orderNumber}"?`,
            )

        if (!confirmed) {
            return
        }

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
                            item.id !==
                            id,
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
                err instanceof
                    Error
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
        <div
            className={`
                space-y-8
                ${pageSurface}
                ${pageText}
            `}
        >
            {/* =================================================
               HEADER
            ================================================= */}

            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
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

                    <h1
                        className="
                            mt-1
                            text-3xl
                            font-bold
                            tracking-[-0.035em]
                        "
                    >
                        Orders
                    </h1>

                    <p
                        className={`
                            mt-2
                            text-sm
                            ${secondaryText}
                        `}
                    >
                        Manage customer orders
                        and order status.
                    </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                        type="button"
                        onClick={
                            handleRefresh
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
                            ${secondaryText}

                            ${isDark
                                ? 'bg-white/[0.02] hover:bg-white/[0.05] hover:text-white'
                                : 'bg-white hover:bg-neutral-50 hover:text-neutral-950'
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

                    <button
                        type="button"
                        onClick={
                            openAddModal
                        }
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
                        Add Order
                    </button>
                </div>
            </div>

            {/* =================================================
               ALERTS
            ================================================= */}

            {error && (
                <div
                    className="
                        rounded-xl
                        border
                        border-red-500/20
                        bg-red-500/10
                        px-5
                        py-4
                        text-sm
                        text-red-500
                    "
                >
                    {error}
                </div>
            )}

            {successMessage && (
                <div
                    className="
                        rounded-xl
                        border
                        border-emerald-500/20
                        bg-emerald-500/10
                        px-5
                        py-4
                        text-sm
                        text-emerald-500
                    "
                >
                    {successMessage}
                </div>
            )}

            {/* =================================================
               STATS
            ================================================= */}

            <div
                className="
                    grid
                    grid-cols-1
                    gap-4
                    sm:grid-cols-2
                    lg:grid-cols-3
                    xl:grid-cols-5
                "
            >
                <StatCard
                    label="Total Orders"
                    value={String(
                        orders.length,
                    )}
                    isDark={isDark}
                    icon={
                        <ShoppingBag className="h-5 w-5" />
                    }
                />

                <StatCard
                    label="Pending"
                    value={String(
                        pendingCount,
                    )}
                    isDark={isDark}
                    icon={
                        <ShoppingBag className="h-5 w-5" />
                    }
                    accent="amber"
                />

                <StatCard
                    label="Processing"
                    value={String(
                        processingCount,
                    )}
                    isDark={isDark}
                    icon={
                        <RefreshCw className="h-5 w-5" />
                    }
                    accent="blue"
                />

                <StatCard
                    label="Completed"
                    value={String(
                        completedCount,
                    )}
                    isDark={isDark}
                    icon={
                        <Package className="h-5 w-5" />
                    }
                    accent="green"
                />

                <StatCard
                    label="Revenue"
                    value={formatCurrency(
                        totalRevenue,
                    )}
                    isDark={isDark}
                    icon={
                        <TrendingUpIcon />
                    }
                    accent="violet"
                />
            </div>

            {/* =================================================
               SEARCH & FILTERS
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
                <div className="grid gap-4 md:grid-cols-[1fr_200px_200px]">
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
                            type="text"
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
                            placeholder="Search order, customer, email, or item..."
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

            <div
                className={`
                    overflow-hidden
                    rounded-2xl
                    border

                    ${cardBg}
                    ${border}
                `}
            >
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1250px] text-left text-sm">
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
                                <th
                                    className={`
                                        px-6
                                        py-4
                                        text-xs
                                        font-bold
                                        uppercase
                                        tracking-[0.08em]

                                        ${mutedText}
                                    `}
                                >
                                    Order
                                </th>

                                <th
                                    className={`
                                        px-6
                                        py-4
                                        text-xs
                                        font-bold
                                        uppercase
                                        tracking-[0.08em]

                                        ${mutedText}
                                    `}
                                >
                                    Customer
                                </th>

                                <th
                                    className={`
                                        px-6
                                        py-4
                                        text-xs
                                        font-bold
                                        uppercase
                                        tracking-[0.08em]

                                        ${mutedText}
                                    `}
                                >
                                    Item
                                </th>

                                <th
                                    className={`
                                        px-6
                                        py-4
                                        text-xs
                                        font-bold
                                        uppercase
                                        tracking-[0.08em]

                                        ${mutedText}
                                    `}
                                >
                                    Type
                                </th>

                                <th
                                    className={`
                                        px-6
                                        py-4
                                        text-xs
                                        font-bold
                                        uppercase
                                        tracking-[0.08em]

                                        ${mutedText}
                                    `}
                                >
                                    Qty
                                </th>

                                <th
                                    className={`
                                        px-6
                                        py-4
                                        text-xs
                                        font-bold
                                        uppercase
                                        tracking-[0.08em]

                                        ${mutedText}
                                    `}
                                >
                                    Total
                                </th>

                                <th
                                    className={`
                                        px-6
                                        py-4
                                        text-xs
                                        font-bold
                                        uppercase
                                        tracking-[0.08em]

                                        ${mutedText}
                                    `}
                                >
                                    Date
                                </th>

                                <th
                                    className={`
                                        px-6
                                        py-4
                                        text-xs
                                        font-bold
                                        uppercase
                                        tracking-[0.08em]

                                        ${mutedText}
                                    `}
                                >
                                    Status
                                </th>

                                <th
                                    className={`
                                        px-6
                                        py-4
                                        text-xs
                                        font-bold
                                        uppercase
                                        tracking-[0.08em]

                                        ${mutedText}
                                    `}
                                >
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan={
                                            9
                                        }
                                        className="px-6 py-16 text-center"
                                    >
                                        <div
                                            className={`
                                                flex
                                                items-center
                                                justify-center
                                                gap-3
                                                text-sm

                                                ${secondaryText}
                                            `}
                                        >
                                            <Loader2 className="h-5 w-5 animate-spin text-violet-500" />

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
                                                className={`
                                                    border-b
                                                    transition-colors
                                                    last:border-b-0

                                                    ${divider}
                                                    ${hoverRow}
                                                `}
                                            >
                                                {/* Order */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className="
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
                                                            <ShoppingBag className="h-4 w-4" />
                                                        </div>

                                                        <div>
                                                            <p className="font-semibold">
                                                                {
                                                                    order.orderNumber
                                                                }
                                                            </p>

                                                            <p
                                                                className={`
                                                                    mt-0.5
                                                                    text-xs

                                                                    ${mutedText}
                                                                `}
                                                            >
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
                                                        <p className="font-medium">
                                                            {
                                                                order.customer
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
                                                                order.email
                                                            }
                                                        </p>

                                                        {order.phone && (
                                                            <p
                                                                className={`
                                                                    mt-1
                                                                    text-xs

                                                                    ${mutedText}
                                                                `}
                                                            >
                                                                {
                                                                    order.phone
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Item */}
                                                <td className="px-6 py-4">
                                                    <p
                                                        className={`
                                                            max-w-xs

                                                            ${secondaryText}
                                                        `}
                                                    >
                                                        {
                                                            order.item
                                                        }
                                                    </p>

                                                    {order.unitPrice >
                                                        0 && (
                                                            <p
                                                                className={`
                                                                mt-1
                                                                text-xs

                                                                ${mutedText}
                                                            `}
                                                            >
                                                                {formatCurrency(
                                                                    order.unitPrice,
                                                                )}{' '}
                                                                / item
                                                            </p>
                                                        )}
                                                </td>

                                                {/* Type */}
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`
                                                            inline-flex
                                                            items-center
                                                            gap-1.5
                                                            rounded-full
                                                            px-3
                                                            py-1
                                                            text-xs
                                                            font-medium

                                                            ${isDark
                                                                ? 'bg-white/[0.05] text-white/55'
                                                                : 'bg-neutral-100 text-neutral-600'
                                                            }
                                                        `}
                                                    >
                                                        <Package className="h-3.5 w-3.5" />

                                                        {
                                                            order.type
                                                        }
                                                    </span>
                                                </td>

                                                {/* Quantity */}
                                                <td
                                                    className={`
                                                        px-6
                                                        py-4

                                                        ${secondaryText}
                                                    `}
                                                >
                                                    {
                                                        order.quantity
                                                    }
                                                </td>

                                                {/* Total */}
                                                <td className="px-6 py-4">
                                                    <span className="font-semibold">
                                                        {formatCurrency(
                                                            order.total,
                                                        )}
                                                    </span>
                                                </td>

                                                {/* Date */}
                                                <td
                                                    className={`
                                                        px-6
                                                        py-4

                                                        ${secondaryText}
                                                    `}
                                                >
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
                                                        isDark={
                                                            isDark
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
                                                            className={`
                                                                rounded-lg
                                                                border
                                                                p-2
                                                                text-red-500
                                                                transition-all
                                                                hover:bg-red-500/10
                                                                disabled:cursor-not-allowed
                                                                disabled:opacity-50

                                                                ${border}
                                                            `}
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
                                                    className={`
                                                    px-6
                                                    py-16
                                                    text-center
                                                    text-sm

                                                    ${mutedText}
                                                `}
                                                >
                                                    No orders
                                                    found.
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
                <div
                    className="
                        fixed
                        inset-0
                        z-50
                        flex
                        items-center
                        justify-center
                        bg-black/60
                        px-4
                        py-6
                        backdrop-blur-sm
                    "
                >
                    <div
                        className={`
                            max-h-[90vh]
                            w-full
                            max-w-3xl
                            overflow-y-auto
                            rounded-2xl
                            border
                            shadow-2xl

                            ${cardBg}
                            ${border}
                        `}
                    >
                        {/* Modal Header */}
                        <div
                            className={`
                                flex
                                items-center
                                justify-between
                                border-b
                                px-6
                                py-5

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
                                    Orders
                                </p>

                                <h2
                                    className="
                                        mt-1
                                        text-xl
                                        font-bold
                                        tracking-[-0.02em]
                                    "
                                >
                                    {editingOrder
                                        ? 'Edit Order'
                                        : 'Add Order'}
                                </h2>

                                <p
                                    className={`
                                        mt-1
                                        text-sm

                                        ${mutedText}
                                    `}
                                >
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
                                className={`
                                    rounded-lg
                                    p-2
                                    transition-colors
                                    disabled:opacity-50

                                    ${secondaryText}
                                    ${hoverRow}
                                `}
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
                                            className={`
                                                mb-2
                                                block
                                                text-sm
                                                font-semibold

                                                ${pageText}
                                            `}
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
                                            className={`
                                                w-full
                                                rounded-xl
                                                border
                                                px-4
                                                py-3
                                                text-sm
                                                outline-none
                                                transition-colors
                                                disabled:opacity-50

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

                                    <div>
                                        <label
                                            htmlFor="order-email"
                                            className={`
                                                mb-2
                                                block
                                                text-sm
                                                font-semibold

                                                ${pageText}
                                            `}
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
                                            className={`
                                                w-full
                                                rounded-xl
                                                border
                                                px-4
                                                py-3
                                                text-sm
                                                outline-none
                                                transition-colors
                                                disabled:opacity-50

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
                                </div>

                                {/* Phone */}
                                <div>
                                    <label
                                        htmlFor="order-phone"
                                        className={`
                                            mb-2
                                            block
                                            text-sm
                                            font-semibold

                                            ${pageText}
                                        `}
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
                                        className={`
                                            w-full
                                            rounded-xl
                                            border
                                            px-4
                                            py-3
                                            text-sm
                                            outline-none
                                            transition-colors
                                            disabled:opacity-50

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

                                {/* Product */}
                                <div>
                                    <label
                                        htmlFor="order-product"
                                        className={`
                                            mb-2
                                            block
                                            text-sm
                                            font-semibold

                                            ${pageText}
                                        `}
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
                                        className={`
                                            w-full
                                            rounded-xl
                                            border
                                            px-4
                                            py-3
                                            text-sm
                                            outline-none
                                            transition-colors
                                            disabled:cursor-not-allowed
                                            disabled:opacity-50

                                            ${border}
                                            ${inputBg}
                                            ${pageText}

                                            ${isDark
                                                ? 'focus:border-violet-500/50'
                                                : 'focus:border-violet-400'
                                            }
                                        `}
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
                                            <p className="mt-2 text-xs text-red-500">
                                                No published
                                                products are
                                                available.
                                            </p>
                                        )}
                                </div>

                                {/* Quantity */}
                                <div className="grid gap-5 md:grid-cols-2">
                                    <div>
                                        <label
                                            htmlFor="order-quantity"
                                            className={`
                                                mb-2
                                                block
                                                text-sm
                                                font-semibold

                                                ${pageText}
                                            `}
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
                                            className={`
                                                w-full
                                                rounded-xl
                                                border
                                                px-4
                                                py-3
                                                text-sm
                                                outline-none
                                                transition-colors
                                                disabled:opacity-50

                                                ${border}
                                                ${inputBg}
                                                ${pageText}

                                                ${isDark
                                                    ? 'focus:border-violet-500/50'
                                                    : 'focus:border-violet-400'
                                                }
                                            `}
                                        />

                                        {selectedProduct && (
                                            <p
                                                className={`
                                                    mt-2
                                                    text-xs

                                                    ${mutedText}
                                                `}
                                            >
                                                {
                                                    selectedProduct.stock
                                                }{' '}
                                                item(s)
                                                available
                                            </p>
                                        )}
                                    </div>

                                    {/* Total */}
                                    <div>
                                        <label
                                            htmlFor="order-total"
                                            className={`
                                                mb-2
                                                block
                                                text-sm
                                                font-semibold

                                                ${pageText}
                                            `}
                                        >
                                            Total Amount
                                        </label>

                                        <div
                                            id="order-total"
                                            className={`
                                                flex
                                                min-h-[46px]
                                                items-center
                                                rounded-xl
                                                border
                                                px-4
                                                py-3
                                                text-sm
                                                font-semibold

                                                ${border}
                                                ${inputBg}
                                                ${pageText}
                                            `}
                                        >
                                            {formatCurrency(
                                                calculatedTotal,
                                            )}
                                        </div>

                                        <p
                                            className={`
                                                mt-2
                                                text-xs

                                                ${mutedText}
                                            `}
                                        >
                                            Calculated
                                            automatically
                                            from product
                                            price.
                                        </p>
                                    </div>
                                </div>

                                {/* Status */}
                                <div>
                                    <label
                                        htmlFor="order-status"
                                        className={`
                                            mb-2
                                            block
                                            text-sm
                                            font-semibold

                                            ${pageText}
                                        `}
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
                                                    status:
                                                        event
                                                            .target
                                                            .value as OrderStatus,
                                                }),
                                            )
                                        }
                                        disabled={
                                            submitting
                                        }
                                        className={`
                                            w-full
                                            rounded-xl
                                            border
                                            px-4
                                            py-3
                                            text-sm
                                            outline-none
                                            transition-colors
                                            disabled:opacity-50

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
                                    <div
                                        className={`
                                            rounded-xl
                                            border
                                            border-violet-500/20
                                            px-4
                                            py-3
                                            text-sm

                                            ${isDark
                                                ? 'bg-violet-500/[0.05] text-white/55'
                                                : 'bg-violet-50 text-neutral-600'
                                            }
                                        `}
                                    >
                                        When the
                                        order is
                                        created,
                                        product stock
                                        will
                                        automatically
                                        be reduced by
                                        the selected
                                        quantity.
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div
                                className={`
                                    flex
                                    justify-end
                                    gap-3
                                    border-t
                                    px-6
                                    py-5

                                    ${divider}
                                `}
                            >
                                <button
                                    type="button"
                                    onClick={
                                        closeModal
                                    }
                                    disabled={
                                        submitting
                                    }
                                    className={`
                                        rounded-xl
                                        border
                                        px-5
                                        py-2.5
                                        text-sm
                                        font-medium
                                        transition-colors
                                        disabled:cursor-not-allowed
                                        disabled:opacity-50

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
                                        submitting ||
                                        (!editingOrder &&
                                            products.length ===
                                            0)
                                    }
                                    className="
                                        inline-flex
                                        items-center
                                        gap-2
                                        rounded-xl
                                        bg-violet-600
                                        px-5
                                        py-2.5
                                        text-sm
                                        font-semibold
                                        text-white
                                        transition-all
                                        hover:bg-violet-700
                                        disabled:cursor-not-allowed
                                        disabled:opacity-50
                                    "
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
   TRENDING ICON
========================================================= */

function TrendingUpIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
        >
            <path
                d="M3 17L9 11L13 15L21 7"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            <path
                d="M15 7H21V13"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({
    status,
    isDark,
}: {
    status: Order['status']
    isDark: boolean
}) {
    const statusClass =
        status === 'Pending'
            ? isDark
                ? 'bg-amber-500/10 text-amber-400'
                : 'bg-amber-50 text-amber-700'
            : status ===
                'Processing'
                ? isDark
                    ? 'bg-blue-500/10 text-blue-400'
                    : 'bg-blue-50 text-blue-700'
                : status ===
                    'Completed'
                    ? isDark
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-emerald-50 text-emerald-700'
                    : isDark
                        ? 'bg-red-500/10 text-red-400'
                        : 'bg-red-50 text-red-700'

    return (
        <span
            className={`
                inline-flex
                rounded-full
                px-3
                py-1
                text-xs
                font-semibold
                ${statusClass}
            `}
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
    icon,
    isDark,
    accent = 'violet',
}: {
    label: string
    value: string
    icon: React.ReactNode
    isDark: boolean
    accent?:
    | 'violet'
    | 'amber'
    | 'blue'
    | 'green'
}) {
    const accentClass =
        accent === 'amber'
            ? isDark
                ? 'bg-amber-500/10 text-amber-400'
                : 'bg-amber-50 text-amber-600'
            : accent === 'blue'
                ? isDark
                    ? 'bg-blue-500/10 text-blue-400'
                    : 'bg-blue-50 text-blue-600'
                : accent === 'green'
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
                            mt-3
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
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl

                        ${accentClass}
                    `}
                >
                    {icon}
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