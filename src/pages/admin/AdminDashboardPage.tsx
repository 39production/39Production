import {
    useEffect,
    useState,
} from 'react'

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

type ThemeMode = 'dark' | 'light'

/*
 * ============================================================
 * THEME HOOK
 * ============================================================
 */

function useAdminTheme(): ThemeMode {
    const [
        theme,
        setTheme,
    ] = useState<ThemeMode>(() => {
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
            const nextTheme =
                document.documentElement
                    .dataset.adminTheme

            if (
                nextTheme === 'light' ||
                nextTheme === 'dark'
            ) {
                setTheme(nextTheme)
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

/*
 * ============================================================
 * DASHBOARD
 * ============================================================
 */

export function AdminDashboardPage() {
    const navigate =
        useNavigate()

    const theme =
        useAdminTheme()

    const isDark =
        theme === 'dark'

    const [
        orders,
        setOrders,
    ] = useState<Order[]>([])

    const [
        services,
        setServices,
    ] = useState<Service[]>([])

    const [
        products,
        setProducts,
    ] = useState<Product[]>([])

    const [
        portfolio,
        setPortfolio,
    ] = useState<Portfolio[]>([])

    const [
        loading,
        setLoading,
    ] = useState(true)

    const [
        error,
        setError,
    ] = useState<
        string | null
    >(null)

    /*
     * ==========================================================
     * FETCH DASHBOARD DATA
     * ==========================================================
     */

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

                if (
                    !ordersResponse.ok
                ) {
                    throw new Error(
                        `Failed to fetch orders (${ordersResponse.status}).`,
                    )
                }

                if (
                    !servicesResponse.ok
                ) {
                    throw new Error(
                        `Failed to fetch services (${servicesResponse.status}).`,
                    )
                }

                if (
                    !productsResponse.ok
                ) {
                    throw new Error(
                        `Failed to fetch products (${productsResponse.status}).`,
                    )
                }

                if (
                    !portfolioResponse.ok
                ) {
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

                if (
                    !ordersResult.success
                ) {
                    throw new Error(
                        ordersResult.message ||
                        'Failed to fetch orders.',
                    )
                }

                if (
                    !servicesResult.success
                ) {
                    throw new Error(
                        servicesResult.message ||
                        'Failed to fetch services.',
                    )
                }

                if (
                    !productsResult.success
                ) {
                    throw new Error(
                        productsResult.message ||
                        'Failed to fetch products.',
                    )
                }

                if (
                    !portfolioResult.success
                ) {
                    throw new Error(
                        portfolioResult.message ||
                        'Failed to fetch portfolio.',
                    )
                }

                if (!mounted) {
                    return
                }

                setOrders(
                    Array.isArray(
                        ordersResult.data,
                    )
                        ? ordersResult.data
                        : [],
                )

                setServices(
                    Array.isArray(
                        servicesResult.data,
                    )
                        ? servicesResult.data
                        : [],
                )

                setProducts(
                    Array.isArray(
                        productsResult.data,
                    )
                        ? productsResult.data
                        : [],
                )

                setPortfolio(
                    Array.isArray(
                        portfolioResult.data,
                    )
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

    /*
     * ==========================================================
     * STATISTICS
     * ==========================================================
     */

    const totalOrders =
        orders.length

    const totalServices =
        services.length

    const totalProducts =
        products.length

    const totalPortfolio =
        portfolio.length

    const pendingOrders =
        orders.filter(
            (order) =>
                order.status
                    .toLowerCase() ===
                'pending',
        ).length

    const completedOrders =
        orders.filter(
            (order) =>
                order.status
                    .toLowerCase() ===
                'completed',
        ).length

    const totalRevenue =
        orders.reduce(
            (total, order) =>
                total +
                Number(
                    order.total_price || 0,
                ),
            0,
        )

    /*
     * ==========================================================
     * FORMATTERS
     * ==========================================================
     */

    const formatCurrency = (
        value: number,
    ) => {
        return new Intl.NumberFormat(
            'id-ID',
            {
                style: 'currency',
                currency: 'IDR',
                maximumFractionDigits: 0,
            },
        ).format(value)
    }

    const formatDate = (
        value: string,
    ) => {
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

    /*
     * ==========================================================
     * THEME TOKENS
     * ==========================================================
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

    const cardBorder =
        isDark
            ? 'border-white/[0.08]'
            : 'border-neutral-200'

    const divider =
        isDark
            ? 'border-white/[0.06]'
            : 'border-neutral-100'

    /*
     * ==========================================================
     * LOADING
     * ==========================================================
     */

    if (loading) {
        return (
            <div
                className={`
          flex
          min-h-[60vh]
          items-center
          justify-center
          ${pageText}
        `}
            >
                <div
                    className={`
            flex
            items-center
            gap-3
            text-sm

            ${secondaryText}
          `}
                >
                    <Loader2 className="h-5 w-5 animate-spin text-violet-500" />

                    <span>
                        Loading dashboard...
                    </span>
                </div>
            </div>
        )
    }

    /*
     * ==========================================================
     * ERROR
     * ==========================================================
     */

    if (error) {
        return (
            <div
                className={`
          space-y-6
          ${pageText}
        `}
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
                        Workspace
                    </p>

                    <h1
                        className="
              mt-1
              text-2xl
              font-bold
              tracking-[-0.03em]
            "
                    >
                        Dashboard
                    </h1>

                    <p
                        className={`
              mt-1
              text-sm
              ${secondaryText}
            `}
                    >
                        Overview of your
                        39Production system.
                    </p>
                </div>

                <div
                    className={`
            rounded-2xl
            border
            p-6
            ${cardBg}
            ${cardBorder}
          `}
                >
                    <div className="flex items-start gap-4">
                        <div
                            className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-red-500/10
                text-red-500
              "
                        >
                            <TrendingUp className="h-5 w-5" />
                        </div>

                        <div>
                            <h2 className="font-semibold">
                                Failed to load dashboard
                            </h2>

                            <p
                                className={`
                  mt-1
                  text-sm
                  ${secondaryText}
                `}
                            >
                                {error}
                            </p>

                            <button
                                type="button"
                                onClick={() =>
                                    window.location.reload()
                                }
                                className="
                  mt-4
                  inline-flex
                  items-center
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
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    /*
     * ==========================================================
     * DASHBOARD
     * ==========================================================
     */

    return (
        <div
            className={`
        space-y-8
        ${pageText}
      `}
        >
            {/* ======================================================
          PAGE INTRO
      ====================================================== */}
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
                    <p
                        className="
              text-[10px]
              font-bold
              uppercase
              tracking-[0.18em]
              text-violet-500
            "
                    >
                        Workspace
                    </p>

                    <h1
                        className="
              mt-1
              text-2xl
              font-bold
              tracking-[-0.035em]
              sm:text-3xl
            "
                    >
                        Dashboard
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
                        Overview of your
                        39Production system,
                        orders, content, and
                        current business activity.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() =>
                        navigate('/admin/orders')
                    }
                    className="
            inline-flex
            w-fit
            items-center
            gap-2
            rounded-xl
            border
            border-violet-500/20
            bg-violet-500/10
            px-4
            py-2.5
            text-sm
            font-semibold
            text-violet-500
            transition-all
            hover:-translate-y-0.5
            hover:bg-violet-500/15
          "
                >
                    View Orders

                    <ArrowRight className="h-4 w-4" />
                </button>
            </div>

            {/* ======================================================
          PRIMARY METRICS
      ====================================================== */}
            <div
                className="
          grid
          gap-4
          sm:grid-cols-2
          xl:grid-cols-4
        "
            >
                {/* Orders */}
                <div
                    className={`
            group
            rounded-2xl
            border
            p-5
            transition-all
            duration-200
            hover:-translate-y-0.5
            hover:shadow-lg

            ${cardBg}
            ${cardBorder}

            ${isDark
                            ? 'hover:shadow-black/20'
                            : 'hover:shadow-neutral-200/70'
                        }
          `}
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <p
                                className={`
                  text-sm
                  ${secondaryText}
                `}
                            >
                                Total Orders
                            </p>

                            <p
                                className="
                  mt-3
                  text-3xl
                  font-bold
                  tracking-[-0.04em]
                "
                            >
                                {totalOrders}
                            </p>
                        </div>

                        <div
                            className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-violet-500/10
                text-violet-500
                transition-transform
                duration-200
                group-hover:scale-105
              "
                        >
                            <ShoppingBag className="h-5 w-5" />
                        </div>
                    </div>

                    <div
                        className={`
              mt-5
              border-t
              pt-3
              text-xs

              ${divider}
              ${mutedText}
            `}
                    >
                        All orders recorded by system
                    </div>
                </div>

                {/* Services */}
                <div
                    className={`
            group
            rounded-2xl
            border
            p-5
            transition-all
            duration-200
            hover:-translate-y-0.5
            hover:shadow-lg

            ${cardBg}
            ${cardBorder}

            ${isDark
                            ? 'hover:shadow-black/20'
                            : 'hover:shadow-neutral-200/70'
                        }
          `}
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <p
                                className={`
                  text-sm
                  ${secondaryText}
                `}
                            >
                                Services
                            </p>

                            <p
                                className="
                  mt-3
                  text-3xl
                  font-bold
                  tracking-[-0.04em]
                "
                            >
                                {totalServices}
                            </p>
                        </div>

                        <div
                            className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-fuchsia-500/10
                text-fuchsia-500
                transition-transform
                duration-200
                group-hover:scale-105
              "
                        >
                            <Briefcase className="h-5 w-5" />
                        </div>
                    </div>

                    <div
                        className={`
              mt-5
              border-t
              pt-3
              text-xs

              ${divider}
              ${mutedText}
            `}
                    >
                        Services available on platform
                    </div>
                </div>

                {/* Products */}
                <div
                    className={`
            group
            rounded-2xl
            border
            p-5
            transition-all
            duration-200
            hover:-translate-y-0.5
            hover:shadow-lg

            ${cardBg}
            ${cardBorder}

            ${isDark
                            ? 'hover:shadow-black/20'
                            : 'hover:shadow-neutral-200/70'
                        }
          `}
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <p
                                className={`
                  text-sm
                  ${secondaryText}
                `}
                            >
                                Products
                            </p>

                            <p
                                className="
                  mt-3
                  text-3xl
                  font-bold
                  tracking-[-0.04em]
                "
                            >
                                {totalProducts}
                            </p>
                        </div>

                        <div
                            className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-pink-500/10
                text-pink-500
                transition-transform
                duration-200
                group-hover:scale-105
              "
                        >
                            <Package className="h-5 w-5" />
                        </div>
                    </div>

                    <div
                        className={`
              mt-5
              border-t
              pt-3
              text-xs

              ${divider}
              ${mutedText}
            `}
                    >
                        Digital products in catalog
                    </div>
                </div>

                {/* Portfolio */}
                <div
                    className={`
            group
            rounded-2xl
            border
            p-5
            transition-all
            duration-200
            hover:-translate-y-0.5
            hover:shadow-lg

            ${cardBg}
            ${cardBorder}

            ${isDark
                            ? 'hover:shadow-black/20'
                            : 'hover:shadow-neutral-200/70'
                        }
          `}
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <p
                                className={`
                  text-sm
                  ${secondaryText}
                `}
                            >
                                Portfolio
                            </p>

                            <p
                                className="
                  mt-3
                  text-3xl
                  font-bold
                  tracking-[-0.04em]
                "
                            >
                                {totalPortfolio}
                            </p>
                        </div>

                        <div
                            className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-violet-500/10
                text-violet-500
                transition-transform
                duration-200
                group-hover:scale-105
              "
                        >
                            <FolderKanban className="h-5 w-5" />
                        </div>
                    </div>

                    <div
                        className={`
              mt-5
              border-t
              pt-3
              text-xs

              ${divider}
              ${mutedText}
            `}
                    >
                        Published creative works
                    </div>
                </div>
            </div>

            {/* ======================================================
          BUSINESS SUMMARY
      ====================================================== */}
            <div
                className="
          grid
          gap-4
          lg:grid-cols-3
        "
            >
                {/* Revenue */}
                <div
                    className={`
            rounded-2xl
            border
            p-5
            ${cardBg}
            ${cardBorder}
          `}
                >
                    <div className="flex items-center justify-between">
                        <p
                            className={`
                text-sm
                ${secondaryText}
              `}
                        >
                            Total Revenue
                        </p>

                        <div
                            className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-lg
                bg-emerald-500/10
                text-emerald-500
              "
                        >
                            <TrendingUp className="h-4 w-4" />
                        </div>
                    </div>

                    <p
                        className="
              mt-3
              text-2xl
              font-bold
              tracking-[-0.03em]
            "
                    >
                        {formatCurrency(
                            totalRevenue,
                        )}
                    </p>

                    <p
                        className={`
              mt-2
              text-xs
              ${mutedText}
            `}
                    >
                        Combined value of recorded orders
                    </p>
                </div>

                {/* Pending */}
                <div
                    className={`
            rounded-2xl
            border
            p-5
            ${cardBg}
            ${cardBorder}
          `}
                >
                    <div className="flex items-center justify-between">
                        <p
                            className={`
                text-sm
                ${secondaryText}
              `}
                        >
                            Pending Orders
                        </p>

                        <div
                            className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-lg
                bg-amber-500/10
                text-amber-500
              "
                        >
                            <ShoppingBag className="h-4 w-4" />
                        </div>
                    </div>

                    <p
                        className="
              mt-3
              text-2xl
              font-bold
              tracking-[-0.03em]
            "
                    >
                        {pendingOrders}
                    </p>

                    <p
                        className={`
              mt-2
              text-xs
              ${mutedText}
            `}
                    >
                        Orders currently awaiting action
                    </p>
                </div>

                {/* Completed */}
                <div
                    className={`
            rounded-2xl
            border
            p-5
            ${cardBg}
            ${cardBorder}
          `}
                >
                    <div className="flex items-center justify-between">
                        <p
                            className={`
                text-sm
                ${secondaryText}
              `}
                        >
                            Completed Orders
                        </p>

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
                            <FolderKanban className="h-4 w-4" />
                        </div>
                    </div>

                    <p
                        className="
              mt-3
              text-2xl
              font-bold
              tracking-[-0.03em]
            "
                    >
                        {completedOrders}
                    </p>

                    <p
                        className={`
              mt-2
              text-xs
              ${mutedText}
            `}
                    >
                        Orders successfully completed
                    </p>
                </div>
            </div>

            {/* ======================================================
          RECENT ORDERS
      ====================================================== */}
            <div
                className={`
          overflow-hidden
          rounded-2xl
          border

          ${cardBg}
          ${cardBorder}
        `}
            >
                {/* Header */}
                <div
                    className={`
            flex
            flex-col
            gap-4
            border-b
            px-5
            py-5
            sm:flex-row
            sm:items-center
            sm:justify-between

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
                            Activity
                        </p>

                        <h2
                            className="
                mt-1
                text-base
                font-semibold
              "
                        >
                            Recent Orders
                        </h2>

                        <p
                            className={`
                mt-1
                text-xs
                ${mutedText}
              `}
                        >
                            Latest orders received by
                            the system.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                '/admin/orders',
                            )
                        }
                        className="
              inline-flex
              items-center
              gap-2
              text-sm
              font-semibold
              text-violet-500
              transition-all
              hover:gap-2.5
            "
                    >
                        View all

                        <ArrowRight className="h-4 w-4" />
                    </button>
                </div>

                {/* Empty state */}
                {orders.length ===
                    0 ? (
                    <div className="flex min-h-44 items-center justify-center px-5">
                        <div className="text-center">
                            <div
                                className={`
                  mx-auto
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-xl

                  ${isDark
                                        ? 'bg-white/[0.04] text-white/30'
                                        : 'bg-neutral-100 text-neutral-400'
                                    }
                `}
                            >
                                <ShoppingBag className="h-5 w-5" />
                            </div>

                            <p
                                className="
                  mt-4
                  text-sm
                  font-semibold
                "
                            >
                                No orders yet
                            </p>

                            <p
                                className={`
                  mt-1
                  text-xs
                  ${mutedText}
                `}
                            >
                                Orders will appear here
                                once customers place them.
                            </p>
                        </div>
                    </div>
                ) : (
                    /* ==================================================
                       TABLE
                    ================================================== */
                    <div className="overflow-x-auto">
                        <table
                            className="
                w-full
                min-w-[760px]
              "
                        >
                            <thead>
                                <tr
                                    className={`
                    border-b
                    text-left

                    ${divider}
                  `}
                                >
                                    <th
                                        className={`
                      px-5
                      py-3.5
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.12em]

                      ${mutedText}
                    `}
                                    >
                                        Order
                                    </th>

                                    <th
                                        className={`
                      px-5
                      py-3.5
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
                      py-3.5
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.12em]

                      ${mutedText}
                    `}
                                    >
                                        Service
                                    </th>

                                    <th
                                        className={`
                      px-5
                      py-3.5
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.12em]

                      ${mutedText}
                    `}
                                    >
                                        Total
                                    </th>

                                    <th
                                        className={`
                      px-5
                      py-3.5
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
                      py-3.5
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.12em]

                      ${mutedText}
                    `}
                                    >
                                        Date
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {orders
                                    .slice(0, 5)
                                    .map(
                                        (order) => {
                                            const normalizedStatus =
                                                order.status
                                                    .toLowerCase()
                                                    .replace(
                                                        /[_-]/g,
                                                        ' ',
                                                    )

                                            const statusStyles =
                                                normalizedStatus ===
                                                    'completed'
                                                    ? isDark
                                                        ? 'bg-emerald-500/10 text-emerald-400'
                                                        : 'bg-emerald-50 text-emerald-700'
                                                    : normalizedStatus ===
                                                        'pending'
                                                        ? isDark
                                                            ? 'bg-amber-500/10 text-amber-400'
                                                            : 'bg-amber-50 text-amber-700'
                                                        : normalizedStatus ===
                                                            'cancelled'
                                                            ? isDark
                                                                ? 'bg-red-500/10 text-red-400'
                                                                : 'bg-red-50 text-red-700'
                                                            : isDark
                                                                ? 'bg-white/[0.05] text-white/55'
                                                                : 'bg-neutral-100 text-neutral-600'

                                            return (
                                                <tr
                                                    key={
                                                        order.id
                                                    }
                                                    className={`
                            border-b
                            transition-colors
                            last:border-b-0

                            ${divider}

                            ${isDark
                                                            ? 'hover:bg-white/[0.02]'
                                                            : 'hover:bg-neutral-50/80'
                                                        }
                          `}
                                                >
                                                    {/* Order */}
                                                    <td className="px-5 py-4">
                                                        <p
                                                            className="
                                text-sm
                                font-semibold
                              "
                                                        >
                                                            {
                                                                order.order_number
                                                            }
                                                        </p>
                                                    </td>

                                                    {/* Customer */}
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div
                                                                className={`
                                  flex
                                  h-8
                                  w-8
                                  shrink-0
                                  items-center
                                  justify-center
                                  rounded-lg

                                  ${isDark
                                                                        ? 'bg-white/[0.05] text-white/45'
                                                                        : 'bg-neutral-100 text-neutral-500'
                                                                    }
                                `}
                                                            >
                                                                <Users className="h-4 w-4" />
                                                            </div>

                                                            <div className="min-w-0">
                                                                <p
                                                                    className="
                                    truncate
                                    text-sm
                                    font-medium
                                  "
                                                                >
                                                                    {
                                                                        order.customer_name
                                                                    }
                                                                </p>

                                                                {order.customer_email && (
                                                                    <p
                                                                        className={`
                                      mt-0.5
                                      truncate
                                      text-xs

                                      ${mutedText}
                                    `}
                                                                    >
                                                                        {
                                                                            order.customer_email
                                                                        }
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Service */}
                                                    <td
                                                        className={`
                              px-5
                              py-4
                              text-sm

                              ${secondaryText}
                            `}
                                                    >
                                                        {
                                                            order.service_name ||
                                                            '-'
                                                        }
                                                    </td>

                                                    {/* Total */}
                                                    <td className="px-5 py-4">
                                                        <p
                                                            className="
                                text-sm
                                font-semibold
                              "
                                                        >
                                                            {formatCurrency(
                                                                Number(
                                                                    order.total_price ||
                                                                    0,
                                                                ),
                                                            )}
                                                        </p>
                                                    </td>

                                                    {/* Status */}
                                                    <td className="px-5 py-4">
                                                        <span
                                                            className={`
                                inline-flex
                                rounded-full
                                px-2.5
                                py-1
                                text-[11px]
                                font-semibold
                                capitalize

                                ${statusStyles}
                              `}
                                                        >
                                                            {
                                                                order.status
                                                            }
                                                        </span>
                                                    </td>

                                                    {/* Date */}
                                                    <td
                                                        className={`
                              px-5
                              py-4
                              text-sm

                              ${mutedText}
                            `}
                                                    >
                                                        {formatDate(
                                                            order.created_at,
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        },
                                    )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
