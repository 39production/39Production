import { useEffect, useState } from 'react'
import {
    ArrowRight,
    Briefcase,
    FolderKanban,
    Loader2,
    Package,
    ShoppingBag,
    TrendingUp,
    Users,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { authenticatedFetch } from '@/lib/auth'

const API_BASE_URL =
    'https://39production-api.39production.workers.dev'

interface Order {
    id: number
    order_number: string
    customer_name: string
    customer_email?: string
    service_name?: string
    total_price: number
    status: string
    created_at: string
}

interface Service {
    id: number
    name: string
    price?: number
    status?: string
}

interface Product {
    id: number
    name: string
    price?: number
    stock?: number
    status?: string
}

interface Portfolio {
    id: number
    title: string
    category?: string
    status?: string
}

interface ApiResponse<T> {
    success: boolean
    data?: T
    message?: string
}

export function AdminDashboardPage() {
    const navigate = useNavigate()

    const [orders, setOrders] = useState<Order[]>([])
    const [services, setServices] = useState<Service[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [portfolio, setPortfolio] = useState<Portfolio[]>([])

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let mounted = true

        async function fetchDashboardData() {
            try {
                setLoading(true)
                setError(null)

                const [
                    ordersResponse,
                    servicesResponse,
                    productsResponse,
                    portfolioResponse,
                ] = await Promise.all([
                    authenticatedFetch(
                        `${API_BASE_URL}/api/orders`,
                        {
                            cache: 'no-store',
                        },
                    ),

                    fetch(
                        `${API_BASE_URL}/api/services`,
                        {
                            cache: 'no-store',
                        },
                    ),

                    fetch(
                        `${API_BASE_URL}/api/products`,
                        {
                            cache: 'no-store',
                        },
                    ),

                    fetch(
                        `${API_BASE_URL}/api/portfolio`,
                        {
                            cache: 'no-store',
                        },
                    ),
                ])

                if (!ordersResponse.ok) {
                    throw new Error(
                        `Failed to fetch orders (${ordersResponse.status}).`,
                    )
                }

                if (!servicesResponse.ok) {
                    throw new Error(
                        `Failed to fetch services (${servicesResponse.status}).`,
                    )
                }

                if (!productsResponse.ok) {
                    throw new Error(
                        `Failed to fetch products (${productsResponse.status}).`,
                    )
                }

                if (!portfolioResponse.ok) {
                    throw new Error(
                        `Failed to fetch portfolio (${portfolioResponse.status}).`,
                    )
                }

                const ordersResult =
                    (await ordersResponse.json()) as ApiResponse<
                        Order[]
                    >

                const servicesResult =
                    (await servicesResponse.json()) as ApiResponse<
                        Service[]
                    >

                const productsResult =
                    (await productsResponse.json()) as ApiResponse<
                        Product[]
                    >

                const portfolioResult =
                    (await portfolioResponse.json()) as ApiResponse<
                        Portfolio[]
                    >

                if (!ordersResult.success) {
                    throw new Error(
                        ordersResult.message ||
                        'Failed to fetch orders.',
                    )
                }

                if (!servicesResult.success) {
                    throw new Error(
                        servicesResult.message ||
                        'Failed to fetch services.',
                    )
                }

                if (!productsResult.success) {
                    throw new Error(
                        productsResult.message ||
                        'Failed to fetch products.',
                    )
                }

                if (!portfolioResult.success) {
                    throw new Error(
                        portfolioResult.message ||
                        'Failed to fetch portfolio.',
                    )
                }

                if (!mounted) {
                    return
                }

                setOrders(
                    Array.isArray(ordersResult.data)
                        ? ordersResult.data
                        : [],
                )

                setServices(
                    Array.isArray(servicesResult.data)
                        ? servicesResult.data
                        : [],
                )

                setProducts(
                    Array.isArray(productsResult.data)
                        ? productsResult.data
                        : [],
                )

                setPortfolio(
                    Array.isArray(portfolioResult.data)
                        ? portfolioResult.data
                        : [],
                )
            } catch (err) {
                console.error(
                    'Dashboard fetch error:',
                    err,
                )

                if (!mounted) {
                    return
                }

                setError(
                    err instanceof Error
                        ? err.message
                        : 'Failed to fetch dashboard data.',
                )
            } finally {
                if (mounted) {
                    setLoading(false)
                }
            }
        }

        fetchDashboardData()

        return () => {
            mounted = false
        }
    }, [])

    const totalOrders = orders.length
    const totalServices = services.length
    const totalProducts = products.length
    const totalPortfolio = portfolio.length

    const pendingOrders = orders.filter(
        (order) =>
            order.status.toLowerCase() === 'pending',
    ).length

    const completedOrders = orders.filter(
        (order) =>
            order.status.toLowerCase() === 'completed',
    ).length

    const totalRevenue = orders.reduce(
        (total, order) =>
            total + Number(order.total_price || 0),
        0,
    )

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat(
            'id-ID',
            {
                style: 'currency',
                currency: 'IDR',
                maximumFractionDigits: 0,
            },
        ).format(value)
    }

    const formatDate = (value: string) => {
        const date = new Date(value)

        if (Number.isNaN(date.getTime())) {
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

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="flex items-center gap-3 text-text-muted">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Loading dashboard...</span>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="font-display text-2xl font-bold text-text-primary">
                        Dashboard
                    </h1>
                    <p className="mt-1 text-sm text-text-muted">
                        Overview of your 39Production system.
                    </p>
                </div>

                <div className="rounded-xl border border-border-default bg-bg-surface p-6">
                    <div className="flex items-start gap-4">
                        <div className="rounded-lg bg-red-500/10 p-3 text-red-400">
                            <TrendingUp className="h-5 w-5" />
                        </div>

                        <div>
                            <h2 className="font-semibold text-text-primary">
                                Failed to load dashboard
                            </h2>

                            <p className="mt-1 text-sm text-text-muted">
                                {error}
                            </p>

                            <button
                                type="button"
                                onClick={() =>
                                    window.location.reload()
                                }
                                className="mt-4 rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="font-display text-2xl font-bold text-text-primary">
                    Dashboard
                </h1>

                <p className="mt-1 text-sm text-text-muted">
                    Overview of your 39Production system.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl border border-border-default bg-bg-surface p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-text-muted">
                                Total Orders
                            </p>

                            <p className="mt-2 text-2xl font-bold text-text-primary">
                                {totalOrders}
                            </p>
                        </div>

                        <div className="rounded-lg bg-brand-primary/10 p-3 text-brand-primary">
                            <ShoppingBag className="h-5 w-5" />
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-border-default bg-bg-surface p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-text-muted">
                                Services
                            </p>

                            <p className="mt-2 text-2xl font-bold text-text-primary">
                                {totalServices}
                            </p>
                        </div>

                        <div className="rounded-lg bg-brand-secondary/10 p-3 text-brand-secondary">
                            <Briefcase className="h-5 w-5" />
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-border-default bg-bg-surface p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-text-muted">
                                Products
                            </p>

                            <p className="mt-2 text-2xl font-bold text-text-primary">
                                {totalProducts}
                            </p>
                        </div>

                        <div className="rounded-lg bg-brand-accent/10 p-3 text-brand-accent">
                            <Package className="h-5 w-5" />
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-border-default bg-bg-surface p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-text-muted">
                                Portfolio
                            </p>

                            <p className="mt-2 text-2xl font-bold text-text-primary">
                                {totalPortfolio}
                            </p>
                        </div>

                        <div className="rounded-lg bg-brand-primary/10 p-3 text-brand-primary">
                            <FolderKanban className="h-5 w-5" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-border-default bg-bg-surface p-5">
                    <p className="text-sm text-text-muted">
                        Total Revenue
                    </p>

                    <p className="mt-2 text-xl font-bold text-text-primary">
                        {formatCurrency(totalRevenue)}
                    </p>
                </div>

                <div className="rounded-xl border border-border-default bg-bg-surface p-5">
                    <p className="text-sm text-text-muted">
                        Pending Orders
                    </p>

                    <p className="mt-2 text-xl font-bold text-text-primary">
                        {pendingOrders}
                    </p>
                </div>

                <div className="rounded-xl border border-border-default bg-bg-surface p-5">
                    <p className="text-sm text-text-muted">
                        Completed Orders
                    </p>

                    <p className="mt-2 text-xl font-bold text-text-primary">
                        {completedOrders}
                    </p>
                </div>
            </div>

            <div className="rounded-xl border border-border-default bg-bg-surface">
                <div className="flex items-center justify-between border-b border-border-default px-5 py-4">
                    <div>
                        <h2 className="font-semibold text-text-primary">
                            Recent Orders
                        </h2>

                        <p className="mt-1 text-xs text-text-muted">
                            Latest orders received by the system.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            navigate('/admin/orders')
                        }
                        className="flex items-center gap-2 text-sm font-medium text-brand-primary transition hover:opacity-80"
                    >
                        View all
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </div>

                {orders.length === 0 ? (
                    <div className="flex min-h-40 items-center justify-center px-5">
                        <div className="text-center">
                            <ShoppingBag className="mx-auto h-8 w-8 text-text-muted" />

                            <p className="mt-3 text-sm font-medium text-text-primary">
                                No orders yet
                            </p>

                            <p className="mt-1 text-xs text-text-muted">
                                Orders will appear here once customers place them.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[700px]">
                            <thead>
                                <tr className="border-b border-border-default text-left">
                                    <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-text-muted">
                                        Order
                                    </th>

                                    <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-text-muted">
                                        Customer
                                    </th>

                                    <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-text-muted">
                                        Service
                                    </th>

                                    <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-text-muted">
                                        Total
                                    </th>

                                    <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-text-muted">
                                        Status
                                    </th>

                                    <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-text-muted">
                                        Date
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {orders
                                    .slice(0, 5)
                                    .map((order) => (
                                        <tr
                                            key={order.id}
                                            className="border-b border-border-default last:border-b-0"
                                        >
                                            <td className="px-5 py-4 text-sm font-medium text-text-primary">
                                                {order.order_number}
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-bg-elevated text-text-muted">
                                                        <Users className="h-4 w-4" />
                                                    </div>

                                                    <div>
                                                        <p className="text-sm font-medium text-text-primary">
                                                            {
                                                                order.customer_name
                                                            }
                                                        </p>

                                                        {order.customer_email && (
                                                            <p className="text-xs text-text-muted">
                                                                {
                                                                    order.customer_email
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4 text-sm text-text-secondary">
                                                {order.service_name ||
                                                    '-'}
                                            </td>

                                            <td className="px-5 py-4 text-sm font-medium text-text-primary">
                                                {formatCurrency(
                                                    Number(
                                                        order.total_price ||
                                                        0,
                                                    ),
                                                )}
                                            </td>

                                            <td className="px-5 py-4">
                                                <span className="inline-flex rounded-full bg-bg-elevated px-2.5 py-1 text-xs font-medium text-text-secondary">
                                                    {
                                                        order.status
                                                    }
                                                </span>
                                            </td>

                                            <td className="px-5 py-4 text-sm text-text-muted">
                                                {formatDate(
                                                    order.created_at,
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}