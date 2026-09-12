
// ============================================================
// PromotionsSection.tsx
// ============================================================

import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
    ArrowRight,
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

    // Service tertentu menggunakan Request Quote,
    // sehingga harga yang tersimpan bukan harga final.
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

function getDiscountText(
    promotion: Promotion,
) {
    if (
        promotion.discount_type ===
        'Percentage'
    ) {
        return `${promotion.discount_value}% OFF`
    }

    return `${formatPrice(
        promotion.discount_value,
    )} OFF`
}

function getDiscountAmount(
    promotion: Promotion,
    price: number,
) {
    if (
        promotion.discount_type ===
        'Percentage'
    ) {
        return Math.round(
            price *
            (promotion.discount_value / 100),
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
                        promotion.target_type ===
                            'Product'
                            ? products.find(
                                (item) =>
                                    item.id ===
                                    promotion.product_id &&
                                    item.status ===
                                    'Published' &&
                                    item.stock > 0,
                            )
                            : undefined

                    const service =
                        promotion.target_type ===
                            'Service'
                            ? services.find(
                                (item) =>
                                    item.id ===
                                    promotion.service_id &&
                                    item.status ===
                                    'Published',
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
     * Tidak menampilkan section kalau memang
     * belum ada promo aktif yang valid.
     */
    if (
        !loading &&
        activePromotions.length === 0
    ) {
        return null
    }

    return (
        <section className="relative overflow-hidden py-24 lg:py-32">
            {/* =====================================================
                BACKGROUND
            ====================================================== */}
            <div className="absolute inset-0 bg-gradient-to-b from-brand-primary/[0.03] via-transparent to-brand-accent/[0.03]" />

            <div className="pointer-events-none absolute -left-32 top-1/3 h-96 w-96 rounded-full bg-brand-primary/[0.05] blur-3xl" />

            <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-brand-accent/[0.05] blur-3xl" />

            <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
                {/* =================================================
                    HEADER
                ================================================== */}
                <div className="max-w-3xl">
                    <div className="inline-flex items-center gap-2 rounded-full border border-brand-primary/20 bg-brand-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-brand-primary">
                        <Sparkles className="h-4 w-4" />
                        Special Offers
                    </div>

                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl lg:text-5xl">
                        Limited Offers.
                        <br />
                        <span className="text-brand-primary">
                            More Value.
                        </span>
                    </h2>

                    <p className="mt-4 max-w-2xl text-base leading-7 text-text-muted sm:text-lg">
                        Penawaran pilihan yang sedang
                        aktif dari 39Production. Gunakan
                        kesempatan ini sebelum periode
                        promo berakhir.
                    </p>
                </div>

                {/* =================================================
                    CONTENT
                ================================================== */}
                {loading ? (
                    <div className="mt-12 grid gap-6 md:grid-cols-2">
                        {[1, 2].map((item) => (
                            <div
                                key={item}
                                className="h-[520px] animate-pulse rounded-3xl border border-border-default bg-bg-surface"
                            />
                        ))}
                    </div>
                ) : (
                    <div className="mt-12 grid gap-6 md:grid-cols-2">
                        {activePromotions
                            .slice(0, 4)
                            .map(
                                ({
                                    promotion,
                                    target,
                                    isProduct,
                                }) => {
                                    const product =
                                        isProduct
                                            ? (target as Product)
                                            : null

                                    const service =
                                        !isProduct
                                            ? (target as Service)
                                            : null

                                    /*
                                     * Product:
                                     * harga promo dapat dihitung langsung.
                                     *
                                     * Service:
                                     * hanya hitung harga promo apabila
                                     * service memang Fixed Price.
                                     *
                                     * Quote-based service tidak boleh
                                     * dianggap mempunyai harga final.
                                     */
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
                                            className="group relative overflow-hidden rounded-3xl border border-border-default bg-bg-surface transition-all duration-300 hover:-translate-y-1 hover:border-brand-primary/30 hover:shadow-xl hover:shadow-brand-primary/10"
                                        >
                                            {/* =================================================
                                                IMAGE
                                            ================================================== */}
                                            <div className="relative h-56 overflow-hidden bg-bg-base sm:h-64">
                                                {target.image_url ? (
                                                    <img
                                                        src={
                                                            target.image_url
                                                        }
                                                        alt={
                                                            target.name
                                                        }
                                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center bg-brand-primary/[0.04]">
                                                        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
                                                            {isProduct ? (
                                                                <Package className="h-9 w-9" />
                                                            ) : (
                                                                <Briefcase className="h-9 w-9" />
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Image overlay */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                                                {/* Discount badge */}
                                                <div className="absolute right-4 top-4">
                                                    <span className="inline-flex rounded-full bg-brand-accent px-4 py-2 text-sm font-bold text-white shadow-lg">
                                                        {getDiscountText(
                                                            promotion,
                                                        )}
                                                    </span>
                                                </div>

                                                {/* Target type badge */}
                                                <div className="absolute bottom-4 left-4">
                                                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/50 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                                                        {isProduct ? (
                                                            <Package className="h-3.5 w-3.5" />
                                                        ) : (
                                                            <Briefcase className="h-3.5 w-3.5" />
                                                        )}

                                                        {isProduct
                                                            ? 'Digital Product'
                                                            : 'Creative Service'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* =================================================
                                                BODY
                                            ================================================== */}
                                            <div className="relative p-6 sm:p-8">
                                                <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-brand-primary/10 blur-3xl transition-transform duration-500 group-hover:scale-125" />

                                                <div className="relative">
                                                    {/* =============================================
                                                        PRODUCT / SERVICE
                                                    ============================================== */}
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                                                                {isProduct ? (
                                                                    <Package className="h-5 w-5" />
                                                                ) : (
                                                                    <Briefcase className="h-5 w-5" />
                                                                )}
                                                            </div>

                                                            <div>
                                                                <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                                                                    {isProduct
                                                                        ? 'Product'
                                                                        : 'Service'}
                                                                </p>

                                                                <p className="mt-1 text-sm font-semibold text-text-primary">
                                                                    {
                                                                        target.name
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* =============================================
                                                        PROMOTION
                                                    ============================================== */}
                                                    <div className="mt-7">
                                                        <div className="flex items-center gap-2 text-xs font-medium text-brand-primary">
                                                            <Tag className="h-3.5 w-3.5" />

                                                            {
                                                                promotion.code
                                                            }
                                                        </div>

                                                        <h3 className="mt-3 text-2xl font-bold text-text-primary">
                                                            {
                                                                promotion.title
                                                            }
                                                        </h3>

                                                        {promotion.description && (
                                                            <p className="mt-3 line-clamp-2 text-sm leading-6 text-text-muted">
                                                                {
                                                                    promotion.description
                                                                }
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* =============================================
                                                        PRICE / QUOTE
                                                    ============================================== */}
                                                    <div className="mt-6 rounded-2xl border border-border-default bg-bg-base/50 p-4">
                                                        {canCalculatePrice ? (
                                                            <div className="flex items-end justify-between gap-4">
                                                                <div>
                                                                    <p className="text-xs text-text-muted line-through">
                                                                        {formatPrice(
                                                                            target.price,
                                                                        )}
                                                                    </p>

                                                                    <p className="mt-1 text-xl font-bold text-text-primary">
                                                                        {formatPrice(
                                                                            finalPrice!,
                                                                        )}
                                                                    </p>
                                                                </div>

                                                                <p className="text-xs text-text-muted">
                                                                    After discount
                                                                </p>
                                                            </div>
                                                        ) : (
                                                            <div>
                                                                <div className="flex items-center justify-between gap-4">
                                                                    <div>
                                                                        <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                                                                            Special offer
                                                                        </p>

                                                                        <p className="mt-1 text-lg font-bold text-text-primary">
                                                                            Custom Quote
                                                                        </p>
                                                                    </div>

                                                                    <span className="rounded-xl bg-brand-primary/10 px-3 py-2 text-xs font-semibold text-brand-primary">
                                                                        {getDiscountText(
                                                                            promotion,
                                                                        )}
                                                                    </span>
                                                                </div>

                                                                <p className="mt-3 text-xs leading-5 text-text-muted">
                                                                    Harga final
                                                                    menyesuaikan
                                                                    kebutuhan
                                                                    dan scope
                                                                    project.
                                                                    Diskon
                                                                    akan
                                                                    diperhitungkan
                                                                    dalam
                                                                    quotation.
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* =============================================
                                                        FOOTER
                                                    ============================================== */}
                                                    <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                                        <div className="flex items-center gap-2 text-xs text-text-muted">
                                                            <Clock3 className="h-4 w-4 shrink-0" />

                                                            <span>
                                                                Until{' '}
                                                                {formatDate(
                                                                    promotion.end_date,
                                                                )}
                                                            </span>
                                                        </div>

                                                        <Link
                                                            to={
                                                                detailUrl
                                                            }
                                                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-text-primary px-5 py-3 text-sm font-semibold text-bg-base transition-all hover:opacity-90"
                                                        >
                                                            {ctaLabel}

                                                            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
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
                        <div className="mt-8 flex items-center gap-2 text-xs text-text-muted">
                            <Sparkles className="h-3.5 w-3.5 text-brand-primary" />

                            <span>
                                Promo dapat berubah atau berakhir
                                sesuai periode yang ditentukan.
                            </span>
                        </div>
                    )}
            </div>
        </section>
    )
}