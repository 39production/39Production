import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
    ArrowRight,
    ArrowUpRight,
    Briefcase,
    Clock3,
    Package,
    Sparkles,
    Tag,
} from 'lucide-react'

const API_BASE_URL =
    'https://39production-api.39production.workers.dev'

interface Product {
    id: number
    name: string
    category: string
    description: string
    price: number
    stock: number
    status: string
    image_url?: string | null
}

interface Service {
    id: number
    name: string
    description: string
    price: number
    status: string
    image_url?: string | null
    pricing_type?: string | null
}

interface Promotion {
    id: number
    title: string
    code: string
    description: string
    discount_type: 'Percentage' | 'Fixed'
    discount_value: number
    target_type: 'Product' | 'Service'
    product_id: number | null
    service_id: number | null
    start_date: string
    end_date: string
    status:
    | 'Active'
    | 'Scheduled'
    | 'Expired'
    | 'Draft'
}

interface ApiResponse<T> {
    success: boolean
    data: T
    message?: string
}

interface PromotionTarget {
    promotion: Promotion
    target: Product | Service
    isProduct: boolean
}

function formatPrice(price: number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(price)
}

function formatDate(date: string) {
    const parsed = new Date(date)

    if (Number.isNaN(parsed.getTime())) {
        return date
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'Asia/Jakarta',
    }).format(parsed)
}

function getDiscountText(promotion: Promotion) {
    if (promotion.discount_type === 'Percentage') {
        return `${promotion.discount_value}% OFF`
    }

    return `${formatPrice(promotion.discount_value)} OFF`
}

function getDiscountAmount(
    promotion: Promotion,
    price: number,
) {
    if (promotion.discount_type === 'Percentage') {
        return Math.round(
            price * (promotion.discount_value / 100),
        )
    }

    return Math.min(
        promotion.discount_value,
        price,
    )
}

function isActivePromotion(
    promotion: Promotion,
) {
    if (promotion.status !== 'Active') {
        return false
    }

    const now = new Date()

    const start = new Date(
        promotion.start_date,
    )

    const end = new Date(
        promotion.end_date,
    )

    return (
        !Number.isNaN(start.getTime()) &&
        !Number.isNaN(end.getTime()) &&
        now >= start &&
        now <= end
    )
}

function isFixedPriceService(
    service: Service,
) {
    const pricingType =
        service.pricing_type
            ?.trim()
            .toLowerCase()

    if (!pricingType) {
        return false
    }

    return (
        pricingType === 'fixed' ||
        pricingType === 'fixed price' ||
        pricingType === 'fixed_price'
    )
}

export function PromotionsSection() {
    const [promotions, setPromotions] =
        useState<Promotion[]>([])

    const [products, setProducts] =
        useState<Product[]>([])

    const [services, setServices] =
        useState<Service[]>([])

    const [loading, setLoading] =
        useState(true)

    useEffect(() => {
        let mounted = true

        async function loadData() {
            try {
                setLoading(true)

                const [
                    promotionsResponse,
                    productsResponse,
                    servicesResponse,
                ] = await Promise.all([
                    fetch(
                        `${API_BASE_URL}/api/promotions`,
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
                        `${API_BASE_URL}/api/services`,
                        {
                            cache: 'no-store',
                        },
                    ),
                ])

                if (
                    !promotionsResponse.ok ||
                    !productsResponse.ok ||
                    !servicesResponse.ok
                ) {
                    throw new Error(
                        'Failed to load promotion data.',
                    )
                }

                const promotionsResult =
                    (await promotionsResponse.json()) as ApiResponse<
                        Promotion[]
                    >

                const productsResult =
                    (await productsResponse.json()) as ApiResponse<
                        Product[]
                    >

                const servicesResult =
                    (await servicesResponse.json()) as ApiResponse<
                        Service[]
                    >

                if (!mounted) {
                    return
                }

                setPromotions(
                    promotionsResult.success
                        ? promotionsResult.data ?? []
                        : [],
                )

                setProducts(
                    productsResult.success
                        ? productsResult.data ?? []
                        : [],
                )

                setServices(
                    servicesResult.success
                        ? servicesResult.data ?? []
                        : [],
                )
            } catch (error) {
                console.error(
                    'Load promotions error:',
                    error,
                )

                if (mounted) {
                    setPromotions([])
                    setProducts([])
                    setServices([])
                }
            } finally {
                if (mounted) {
                    setLoading(false)
                }
            }
        }

        loadData()

        return () => {
            mounted = false
        }
    }, [])

    const activePromotions =
        useMemo<PromotionTarget[]>(() => {
            return promotions
                .filter(isActivePromotion)
                .map((promotion) => {
                    const product =
                        promotion.target_type === 'Product'
                            ? products.find(
                                (item) =>
                                    item.id ===
                                    promotion.product_id &&
                                    item.status === 'Published' &&
                                    item.stock > 0,
                            )
                            : undefined

                    const service =
                        promotion.target_type === 'Service'
                            ? services.find(
                                (item) =>
                                    item.id ===
                                    promotion.service_id &&
                                    item.status === 'Published',
                            )
                            : undefined

                    const target =
                        product ?? service

                    if (!target) {
                        return null
                    }

                    return {
                        promotion,
                        target,
                        isProduct:
                            promotion.target_type ===
                            'Product',
                    }
                })
                .filter(
                    (
                        item,
                    ): item is PromotionTarget =>
                        item !== null,
                )
        }, [
            promotions,
            products,
            services,
        ])

    /*
     * Promo tidak ditampilkan apabila tidak ada
     * promo aktif yang memiliki target valid.
     */
    if (
        !loading &&
        activePromotions.length === 0
    ) {
        return null
    }

    return (
        <section
            id="promotions"
            aria-labelledby="promotions-section-title"
            className="relative overflow-hidden bg-white text-zinc-950"
        >
            {/* =====================================================
          BACKGROUND
      ====================================================== */}

            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
            >
                <div
                    className="absolute inset-0 opacity-[0.018]"
                    style={{
                        backgroundImage:
                            'linear-gradient(to right, #111 1px, transparent 1px), linear-gradient(to bottom, #111 1px, transparent 1px)',
                        backgroundSize: '100px 100px',
                    }}
                />

                <div className="absolute right-[8%] top-[18%] h-2 w-2 rounded-full bg-[#7C3AED]" />

                <div className="absolute bottom-[20%] left-[5%] h-1.5 w-1.5 rounded-full bg-[#7C3AED]" />
            </div>

            <div className="relative mx-auto max-w-[1600px] px-6 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24 xl:px-16">
                {/* =================================================
            SECTION LABEL
        ================================================== */}

                <div className="mb-12 border-t border-black/10 pt-4 sm:mb-14">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#7C3AED]" />

                            <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-neutral-500 sm:text-[10px]">
                                39Production / Special Offers
                            </span>
                        </div>

                        <span className="font-mono text-[9px] font-medium tracking-[0.16em] text-neutral-400 sm:text-[10px]">
                            39 / 06
                        </span>
                    </div>
                </div>

                {/* =================================================
            HEADER
        ================================================== */}

                <div className="grid gap-8 lg:grid-cols-[0.68fr_1.32fr] lg:items-end lg:gap-16">
                    <div className="max-w-md">
                        <div className="flex items-center gap-3">
                            <Tag
                                className="h-4 w-4 text-[#7C3AED]"
                                strokeWidth={1.7}
                            />

                            <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#7C3AED]">
                                Current Promotions
                            </span>
                        </div>

                        <p className="mt-5 text-sm font-medium leading-7 text-neutral-600 sm:text-[15px] sm:leading-7">
                            Penawaran pilihan dari katalog 39Production
                            yang sedang aktif. Setiap promo memiliki
                            periode dan ketentuan yang berbeda.
                        </p>

                        <div className="mt-6 flex items-center gap-3">
                            <span className="h-px w-10 bg-[#7C3AED]" />

                            <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                                Limited / Selected / Active
                            </span>
                        </div>
                    </div>

                    <div className="max-w-5xl">
                        <h2
                            id="promotions-section-title"
                            className="text-[clamp(2.6rem,4.8vw,5rem)] font-black leading-[0.9] tracking-[-0.065em] text-black"
                        >
                            Limited offers.
                            <span className="block text-neutral-300">
                                More value.
                            </span>
                        </h2>

                        <p className="mt-6 max-w-2xl text-sm font-medium leading-7 text-neutral-500 sm:text-[15px]">
                            Temukan promo yang sedang tersedia untuk
                            digital products maupun creative services
                            sebelum periode penawarannya berakhir.
                        </p>
                    </div>
                </div>

                {/* =================================================
            INFO STRIP
        ================================================== */}

                <div className="mt-12 border-y border-black/10 py-5 sm:mt-14">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-4">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-black/10 text-[#7C3AED]">
                                <Sparkles
                                    className="h-4 w-4"
                                    strokeWidth={1.7}
                                />
                            </div>

                            <div>
                                <p className="text-sm font-bold tracking-[-0.02em] text-black">
                                    Current promotions
                                </p>

                                <p className="mt-1 max-w-2xl text-xs font-medium leading-6 text-neutral-500 sm:text-sm">
                                    Product menggunakan harga promo yang
                                    dapat dihitung langsung. Service berbasis
                                    quotation tetap mengikuti proses request
                                    quote.
                                </p>
                            </div>
                        </div>

                        <Link
                            to="/products"
                            className="group inline-flex w-fit shrink-0 items-center gap-2 text-[9px] font-bold uppercase tracking-[0.16em] text-black transition-colors duration-300 hover:text-[#7C3AED]"
                        >
                            Explore Products

                            <ArrowRight
                                size={14}
                                className="transition-transform duration-300 group-hover:translate-x-1"
                            />
                        </Link>
                    </div>
                </div>

                {/* =================================================
            LOADING
        ================================================== */}

                {loading && (
                    <div className="mt-10 grid gap-6 md:grid-cols-2">
                        {[1, 2].map((item) => (
                            <div
                                key={item}
                                className="overflow-hidden border border-black/10 bg-white"
                            >
                                <div className="aspect-[16/9] animate-pulse bg-neutral-100" />

                                <div className="space-y-5 p-6 sm:p-7">
                                    <div className="h-3 w-24 animate-pulse bg-neutral-100" />

                                    <div className="h-7 w-3/4 animate-pulse bg-neutral-100" />

                                    <div className="h-4 w-full animate-pulse bg-neutral-100" />

                                    <div className="h-20 animate-pulse bg-neutral-100" />

                                    <div className="h-11 animate-pulse rounded-full bg-neutral-100" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* =================================================
            PROMOTION CARDS
        ================================================== */}

                {!loading &&
                    activePromotions.length > 0 && (
                        <div className="mt-10 grid gap-6 md:grid-cols-2">
                            {activePromotions
                                .slice(0, 4)
                                .map(
                                    (
                                        {
                                            promotion,
                                            target,
                                            isProduct,
                                        },
                                        index,
                                    ) => {
                                        const product =
                                            isProduct
                                                ? (target as Product)
                                                : null

                                        const service =
                                            !isProduct
                                                ? (target as Service)
                                                : null

                                        const serviceIsFixed =
                                            service
                                                ? isFixedPriceService(
                                                    service,
                                                )
                                                : false

                                        const canCalculatePrice =
                                            isProduct ||
                                            serviceIsFixed

                                        const discount =
                                            canCalculatePrice
                                                ? getDiscountAmount(
                                                    promotion,
                                                    target.price,
                                                )
                                                : 0

                                        const finalPrice =
                                            canCalculatePrice
                                                ? Math.max(
                                                    0,
                                                    target.price -
                                                    discount,
                                                )
                                                : null

                                        const detailUrl =
                                            isProduct
                                                ? `/products/${target.id}`
                                                : `/services/${target.id}`

                                        const ctaLabel =
                                            isProduct
                                                ? 'View Product'
                                                : serviceIsFixed
                                                    ? 'View Offer'
                                                    : 'Request Quote'

                                        return (
                                            <article
                                                key={promotion.id}
                                                className="group relative overflow-hidden border border-black/10 bg-white transition-all duration-500 hover:-translate-y-1 hover:border-black/20 hover:shadow-[0_20px_45px_rgba(15,23,42,0.07)]"
                                            >
                                                {/* =========================================
                            IMAGE
                        ========================================== */}

                                                <div className="relative aspect-[16/9] overflow-hidden bg-neutral-100">
                                                    {target.image_url ? (
                                                        <img
                                                            src={
                                                                target.image_url
                                                            }
                                                            alt={target.name}
                                                            loading="lazy"
                                                            decoding="async"
                                                            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
                                                            onError={(
                                                                event,
                                                            ) => {
                                                                event.currentTarget.style.display =
                                                                    'none'
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
                                                            <div className="flex h-16 w-16 items-center justify-center border border-black/10 bg-white text-[#7C3AED]">
                                                                {isProduct ? (
                                                                    <Package
                                                                        className="h-7 w-7"
                                                                        strokeWidth={
                                                                            1.5
                                                                        }
                                                                    />
                                                                ) : (
                                                                    <Briefcase
                                                                        className="h-7 w-7"
                                                                        strokeWidth={
                                                                            1.5
                                                                        }
                                                                    />
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Image overlay */}

                                                    <div
                                                        aria-hidden="true"
                                                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent"
                                                    />

                                                    {/* Discount */}

                                                    <div className="absolute right-4 top-4">
                                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#7C3AED] px-3.5 py-2 text-[9px] font-bold uppercase tracking-[0.12em] text-white">
                                                            <Sparkles
                                                                className="h-3 w-3"
                                                                strokeWidth={
                                                                    1.8
                                                                }
                                                            />

                                                            {getDiscountText(
                                                                promotion,
                                                            )}
                                                        </span>
                                                    </div>

                                                    {/* Target */}

                                                    <div className="absolute bottom-4 left-4">
                                                        <span className="inline-flex items-center gap-2 border border-white/30 bg-black/65 px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur-sm">
                                                            {isProduct ? (
                                                                <Package
                                                                    className="h-3 w-3"
                                                                    strokeWidth={
                                                                        1.8
                                                                    }
                                                                />
                                                            ) : (
                                                                <Briefcase
                                                                    className="h-3 w-3"
                                                                    strokeWidth={
                                                                        1.8
                                                                    }
                                                                />
                                                            )}

                                                            {isProduct
                                                                ? 'Digital Product'
                                                                : 'Creative Service'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* =========================================
                            BODY
                        ========================================== */}

                                                <div className="p-6 sm:p-7">
                                                    {/* Product / Service */}

                                                    <div className="flex items-start justify-between gap-5">
                                                        <div className="min-w-0">
                                                            <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#7C3AED]">
                                                                {isProduct
                                                                    ? 'Digital Product'
                                                                    : 'Creative Service'}
                                                            </p>

                                                            <h3 className="mt-2 line-clamp-1 text-xl font-black tracking-[-0.04em] text-black sm:text-2xl">
                                                                {target.name}
                                                            </h3>
                                                        </div>

                                                        <span className="shrink-0 font-mono text-[8px] font-bold tracking-[0.16em] text-neutral-300">
                                                            {String(
                                                                index + 1,
                                                            ).padStart(2, '0')}
                                                        </span>
                                                    </div>

                                                    {/* Promotion */}

                                                    <div className="mt-6 border-t border-black/10 pt-5">
                                                        <div className="flex items-center gap-2">
                                                            <Tag
                                                                className="h-3.5 w-3.5 text-[#7C3AED]"
                                                                strokeWidth={
                                                                    1.8
                                                                }
                                                            />

                                                            <span className="text-[9px] font-bold uppercase tracking-[0.17em] text-[#7C3AED]">
                                                                {promotion.code}
                                                            </span>
                                                        </div>

                                                        <p className="mt-3 text-lg font-black tracking-[-0.035em] text-black sm:text-xl">
                                                            {promotion.title}
                                                        </p>

                                                        {promotion.description && (
                                                            <p className="mt-2 line-clamp-3 text-xs font-medium leading-6 text-neutral-500 sm:text-sm">
                                                                {
                                                                    promotion.description
                                                                }
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* =========================================
                              PRICE
                          ========================================== */}

                                                    <div className="mt-6 border-y border-black/10 py-5">
                                                        {canCalculatePrice ? (
                                                            <div className="flex items-end justify-between gap-4">
                                                                <div>
                                                                    <p className="text-xs font-medium text-neutral-400 line-through">
                                                                        {formatPrice(
                                                                            target.price,
                                                                        )}
                                                                    </p>

                                                                    <p className="mt-1 text-2xl font-black tracking-[-0.04em] text-black">
                                                                        {formatPrice(
                                                                            finalPrice!,
                                                                        )}
                                                                    </p>
                                                                </div>

                                                                <div className="text-right">
                                                                    <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-neutral-400">
                                                                        You Save
                                                                    </p>

                                                                    <p className="mt-1 text-sm font-bold text-[#7C3AED]">
                                                                        {formatPrice(
                                                                            discount,
                                                                        )}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div>
                                                                <div className="flex items-start justify-between gap-4">
                                                                    <div>
                                                                        <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-neutral-400">
                                                                            Special Offer
                                                                        </p>

                                                                        <p className="mt-1 text-xl font-black tracking-[-0.035em] text-black">
                                                                            Custom Quote
                                                                        </p>
                                                                    </div>

                                                                    <span className="shrink-0 rounded-full bg-[#7C3AED]/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-[#7C3AED]">
                                                                        {getDiscountText(
                                                                            promotion,
                                                                        )}
                                                                    </span>
                                                                </div>

                                                                <p className="mt-3 text-xs font-medium leading-5 text-neutral-500">
                                                                    Harga final menyesuaikan
                                                                    kebutuhan dan scope project.
                                                                    Diskon akan diperhitungkan
                                                                    dalam quotation.
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* =========================================
                              FOOTER
                          ========================================== */}

                                                    <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                                        <div className="flex items-center gap-2 text-[10px] font-medium text-neutral-500">
                                                            <Clock3
                                                                className="h-3.5 w-3.5 shrink-0 text-neutral-400"
                                                                strokeWidth={
                                                                    1.8
                                                                }
                                                            />

                                                            <span>
                                                                Until{' '}
                                                                {formatDate(
                                                                    promotion.end_date,
                                                                )}
                                                            </span>
                                                        </div>

                                                        <Link
                                                            to={detailUrl}
                                                            className="group/cta inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full bg-black px-5 py-3 text-[9px] font-bold uppercase tracking-[0.14em] text-white transition-all duration-300 hover:bg-[#7C3AED] sm:w-auto"
                                                        >
                                                            {ctaLabel}

                                                            <ArrowRight
                                                                size={14}
                                                                className="transition-transform duration-300 group-hover/cta:translate-x-1"
                                                            />
                                                        </Link>
                                                    </div>
                                                </div>

                                                {/* Hover accent */}

                                                <div
                                                    aria-hidden="true"
                                                    className="pointer-events-none absolute bottom-0 left-0 h-0.5 w-0 bg-[#7C3AED] transition-all duration-500 group-hover:w-full"
                                                />
                                            </article>
                                        )
                                    },
                                )}
                        </div>
                    )}

                {/* =================================================
            BOTTOM NOTE
        ================================================== */}

                {!loading &&
                    activePromotions.length > 0 && (
                        <div className="mt-10 flex flex-col gap-4 border-t border-black/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-start gap-3">
                                <Sparkles
                                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#7C3AED]"
                                    strokeWidth={1.8}
                                />

                                <p className="text-[10px] font-medium leading-5 text-neutral-400 sm:text-xs">
                                    Promo dapat berubah atau berakhir
                                    sesuai periode yang ditentukan.
                                </p>
                            </div>

                            <Link
                                to="/contact"
                                className="group inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.16em] text-black transition-colors duration-300 hover:text-[#7C3AED]"
                            >
                                Need a custom offer?

                                <ArrowRight
                                    size={13}
                                    className="transition-transform duration-300 group-hover:translate-x-1"
                                />
                            </Link>
                        </div>
                    )}

                {/* =================================================
            FOOTER LINE
        ================================================== */}

                <div className="mt-8 flex items-center justify-between border-t border-black/10 pt-4">
                    <span className="font-mono text-[8px] font-bold tracking-[0.18em] text-neutral-400">
                        SPECIAL OFFERS
                    </span>

                    <span className="hidden text-[8px] font-semibold uppercase tracking-[0.18em] text-neutral-400 sm:block">
                        Products / Services / Promotions
                    </span>

                    <ArrowUpRight
                        size={13}
                        className="text-neutral-400"
                    />
                </div>
            </div>
        </section>
    )
}
