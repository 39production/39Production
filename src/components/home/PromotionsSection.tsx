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

function getPromotionAccent(
    index: number,
) {
    const accents = [
        {
            badge:
                'border-violet-100 bg-violet-50 text-violet-700',
            dot: 'bg-violet-500',
            soft: 'bg-violet-50',
            icon: 'text-violet-600',
        },
        {
            badge:
                'border-pink-100 bg-pink-50 text-pink-700',
            dot: 'bg-pink-500',
            soft: 'bg-pink-50',
            icon: 'text-pink-600',
        },
        {
            badge:
                'border-purple-100 bg-purple-50 text-purple-700',
            dot: 'bg-purple-500',
            soft: 'bg-purple-50',
            icon: 'text-purple-600',
        },
        {
            badge:
                'border-fuchsia-100 bg-fuchsia-50 text-fuchsia-700',
            dot: 'bg-fuchsia-500',
            soft: 'bg-fuchsia-50',
            icon: 'text-fuchsia-600',
        },
    ]

    return accents[index % accents.length]
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
        <section
            id="promotions"
            className="relative isolate overflow-hidden bg-white py-20 sm:py-24 lg:py-32"
        >
            {/* =========================================================
          BACKGROUND
      ========================================================== */}

            <div className="pointer-events-none absolute inset-0 -z-20 overflow-hidden">
                <div className="promotionGlow promotionGlowOne absolute -left-40 top-[12%] h-[420px] w-[420px] rounded-full" />

                <div className="promotionGlow promotionGlowTwo absolute -right-40 top-[48%] h-[460px] w-[460px] rounded-full" />

                <div className="promotionGlow promotionGlowThree absolute bottom-[-180px] left-[35%] h-[420px] w-[420px] rounded-full" />
            </div>

            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                <div className="promotionLightLine promotionLightLineOne absolute left-[-20%] top-[28%] h-px w-[140%]" />

                <div className="promotionLightLine promotionLightLineTwo absolute left-[-20%] top-[74%] h-px w-[140%]" />
            </div>

            {/* =========================================================
          CONTENT
      ========================================================== */}

            <div className="mx-auto max-w-[1240px] px-5 sm:px-8 lg:px-10">
                {/* =======================================================
            HEADER
        ======================================================== */}

                <div className="mx-auto max-w-3xl text-center">
                    <div className="promotionEyebrow mb-5 inline-flex items-center gap-2 rounded-full border border-pink-100 bg-pink-50 px-4 py-2">
                        <Tag className="h-3.5 w-3.5 text-pink-600" />

                        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-pink-700 sm:text-[11px]">
                            SPECIAL OFFERS
                        </span>
                    </div>

                    <h2 className="text-3xl font-semibold leading-[1.12] tracking-tight text-neutral-950 sm:text-4xl lg:text-5xl">
                        Limited offers.
                        <span className="block bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                            More value.
                        </span>
                    </h2>

                    <p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-neutral-500 sm:text-base sm:leading-7">
                        Penawaran pilihan yang sedang aktif dari 39Production. Gunakan
                        kesempatan ini sebelum periode promo berakhir.
                    </p>
                </div>

                {/* =======================================================
            INTRO
        ======================================================== */}

                <div className="mx-auto mt-12 max-w-[1180px] rounded-[24px] border border-neutral-200 bg-neutral-50/80 p-5 sm:mt-14 sm:p-6 lg:p-7">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-4">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-pink-600 shadow-sm ring-1 ring-pink-100">
                                <Sparkles
                                    className="h-5 w-5"
                                    strokeWidth={1.8}
                                />
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-neutral-900">
                                    Current promotions
                                </p>

                                <p className="mt-1 max-w-2xl text-sm leading-6 text-neutral-500">
                                    Semua promo di bawah ini berasal dari katalog yang aktif.
                                    Product dihitung langsung berdasarkan harga, sedangkan
                                    service dengan Request Quote akan tetap menggunakan
                                    quotation.
                                </p>
                            </div>
                        </div>

                        <Link
                            to="/products"
                            className="group inline-flex shrink-0 items-center justify-center gap-2 text-sm font-semibold text-neutral-700 transition-colors duration-300 hover:text-violet-600"
                        >
                            Explore products
                            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </Link>
                    </div>
                </div>

                {/* =======================================================
            CONTENT
        ======================================================== */}

                {loading ? (
                    <div className="mt-8 grid gap-5 md:grid-cols-2">
                        {[1, 2].map((item) => (
                            <div
                                key={item}
                                className="overflow-hidden rounded-[24px] border border-neutral-200 bg-white"
                            >
                                <div className="h-56 animate-pulse bg-neutral-100 sm:h-64" />

                                <div className="space-y-4 p-5 sm:p-7">
                                    <div className="h-4 w-28 animate-pulse rounded-full bg-neutral-100" />

                                    <div className="h-7 w-3/4 animate-pulse rounded bg-neutral-100" />

                                    <div className="h-3 w-full animate-pulse rounded bg-neutral-100" />

                                    <div className="h-16 animate-pulse rounded-2xl bg-neutral-100" />

                                    <div className="h-10 animate-pulse rounded-full bg-neutral-100" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="mt-8 grid gap-5 md:grid-cols-2">
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
                                    const product = isProduct
                                        ? (target as Product)
                                        : null

                                    const service = !isProduct
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

                                    const accent =
                                        getPromotionAccent(index)

                                    return (
                                        <article
                                            key={promotion.id}
                                            className="promotionCard group relative overflow-hidden rounded-[24px] border border-neutral-200 bg-white transition-all duration-500 hover:-translate-y-1 hover:border-violet-200 hover:shadow-[0_20px_50px_rgba(15,23,42,0.08)]"
                                        >
                                            {/* =================================================
                          IMAGE
                      ================================================== */}

                                            <div className="relative aspect-[16/8] overflow-hidden bg-neutral-100 sm:aspect-[16/9]">
                                                {target.image_url ? (
                                                    <img
                                                        src={target.image_url}
                                                        alt={target.name}
                                                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045]"
                                                        loading="lazy"
                                                        decoding="async"
                                                        onError={(
                                                            event,
                                                        ) => {
                                                            event.currentTarget.style.display =
                                                                'none'
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-pink-50">
                                                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-violet-600 shadow-sm ring-1 ring-neutral-200 transition-transform duration-500 group-hover:scale-105">
                                                            {isProduct ? (
                                                                <Package className="h-7 w-7" />
                                                            ) : (
                                                                <Briefcase className="h-7 w-7" />
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Image readability */}
                                                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent" />

                                                {/* Discount */}
                                                <div className="absolute right-4 top-4">
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-pink-500 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-pink-500/20">
                                                        <Sparkles className="h-3.5 w-3.5" />

                                                        {getDiscountText(
                                                            promotion,
                                                        )}
                                                    </span>
                                                </div>

                                                {/* Target type */}
                                                <div className="absolute bottom-4 left-4">
                                                    <span className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/90 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-700 shadow-sm backdrop-blur-sm">
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

                                            <div className="p-5 sm:p-7">
                                                {/* Target */}
                                                <div className="flex items-start gap-3">
                                                    <div
                                                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accent.soft} ${accent.icon}`}
                                                    >
                                                        {isProduct ? (
                                                            <Package className="h-5 w-5" />
                                                        ) : (
                                                            <Briefcase className="h-5 w-5" />
                                                        )}
                                                    </div>

                                                    <div className="min-w-0">
                                                        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
                                                            {isProduct
                                                                ? 'Product'
                                                                : 'Service'}
                                                        </p>

                                                        <p className="mt-1 line-clamp-1 text-sm font-semibold text-neutral-900">
                                                            {target.name}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Promotion */}
                                                <div className="mt-6">
                                                    <div
                                                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${accent.badge}`}
                                                    >
                                                        <Tag className="h-3 w-3" />

                                                        {promotion.code}
                                                    </div>

                                                    <h3 className="mt-4 text-2xl font-semibold tracking-tight text-neutral-950">
                                                        {promotion.title}
                                                    </h3>

                                                    {promotion.description && (
                                                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-neutral-500">
                                                            {
                                                                promotion.description
                                                            }
                                                        </p>
                                                    )}
                                                </div>

                                                {/* =================================================
                            PRICE
                        ================================================== */}

                                                <div className="mt-6 rounded-[18px] border border-neutral-200 bg-neutral-50/80 p-4 sm:p-5">
                                                    {canCalculatePrice ? (
                                                        <div className="flex items-end justify-between gap-4">
                                                            <div>
                                                                <p className="text-xs text-neutral-400 line-through">
                                                                    {formatPrice(
                                                                        target.price,
                                                                    )}
                                                                </p>

                                                                <p className="mt-1 text-2xl font-bold tracking-tight text-neutral-950">
                                                                    {formatPrice(
                                                                        finalPrice!,
                                                                    )}
                                                                </p>
                                                            </div>

                                                            <div className="text-right">
                                                                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                                                                    You save
                                                                </p>

                                                                <p className="mt-1 text-sm font-semibold text-pink-600">
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
                                                                    <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-neutral-400">
                                                                        Special offer
                                                                    </p>

                                                                    <p className="mt-1 text-xl font-bold tracking-tight text-neutral-950">
                                                                        Custom Quote
                                                                    </p>
                                                                </div>

                                                                <span className="rounded-xl bg-pink-50 px-3 py-2 text-xs font-semibold text-pink-700">
                                                                    {getDiscountText(
                                                                        promotion,
                                                                    )}
                                                                </span>
                                                            </div>

                                                            <p className="mt-3 text-xs leading-5 text-neutral-500">
                                                                Harga final menyesuaikan
                                                                kebutuhan dan scope
                                                                project. Diskon akan
                                                                diperhitungkan dalam
                                                                quotation.
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* =================================================
                            FOOTER
                        ================================================== */}

                                                <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                                                        <Clock3 className="h-4 w-4 shrink-0 text-neutral-400" />

                                                        <span>
                                                            Until{' '}
                                                            {formatDate(
                                                                promotion.end_date,
                                                            )}
                                                        </span>
                                                    </div>

                                                    <Link
                                                        to={detailUrl}
                                                        className="group/cta inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-neutral-950 px-5 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-violet-600 hover:shadow-lg hover:shadow-violet-100 sm:w-auto"
                                                    >
                                                        {ctaLabel}

                                                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/cta:translate-x-1" />
                                                    </Link>
                                                </div>
                                            </div>

                                            {/* Hover shine */}
                                            <div className="promotionShine pointer-events-none absolute inset-y-0 left-0 w-[30%] -translate-x-[180%] bg-gradient-to-r from-transparent via-white/35 to-transparent skew-x-[-18deg]" />
                                        </article>
                                    )
                                },
                            )}
                    </div>
                )}

                {/* =======================================================
            BOTTOM NOTE
        ======================================================== */}

                {!loading &&
                    activePromotions.length > 0 && (
                        <div className="mt-8 flex flex-col gap-2 border-t border-neutral-200 pt-6 text-xs text-neutral-400 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-3.5 w-3.5 text-violet-500" />

                                <span>
                                    Promo dapat berubah atau berakhir sesuai
                                    periode yang ditentukan.
                                </span>
                            </div>

                            <Link
                                to="/contact"
                                className="font-semibold text-violet-600 transition-colors hover:text-violet-700"
                            >
                                Need a custom offer?
                            </Link>
                        </div>
                    )}
            </div>

            {/* =========================================================
          ANIMATIONS
      ========================================================== */}

            <style>{`
        .promotionGlow {
          filter: blur(90px);
          opacity: 0.4;
        }

        .promotionGlowOne {
          background: rgba(139, 92, 246, 0.045);
          animation: promotionGlowOne 16s ease-in-out infinite;
        }

        .promotionGlowTwo {
          background: rgba(236, 72, 153, 0.035);
          animation: promotionGlowTwo 19s ease-in-out infinite;
        }

        .promotionGlowThree {
          background: rgba(99, 102, 241, 0.03);
          animation: promotionGlowThree 18s ease-in-out infinite;
        }

        .promotionLightLine {
          background: linear-gradient(
            to right,
            transparent,
            rgba(139, 92, 246, 0.07),
            transparent
          );

          opacity: 0.45;
          animation: promotionLineMove 11s ease-in-out infinite;
        }

        .promotionLightLineTwo {
          background: linear-gradient(
            to right,
            transparent,
            rgba(236, 72, 153, 0.06),
            transparent
          );

          animation-delay: 4s;
        }

        .promotionEyebrow {
          animation: promotionEyebrowIn 0.7s ease-out both;
        }

        .promotionShine {
          opacity: 0;
          transition:
            transform 1s cubic-bezier(0.16, 1, 0.3, 1),
            opacity 0.3s ease;
        }

        .promotionCard:hover .promotionShine {
          opacity: 1;
          transform: translateX(400%);
        }

        @keyframes promotionEyebrowIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes promotionGlowOne {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }

          50% {
            transform: translate3d(45px, 30px, 0);
          }
        }

        @keyframes promotionGlowTwo {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }

          50% {
            transform: translate3d(-45px, -30px, 0);
          }
        }

        @keyframes promotionGlowThree {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }

          50% {
            transform: translate3d(35px, -30px, 0);
          }
        }

        @keyframes promotionLineMove {
          0%,
          100% {
            transform: translateX(-3%);
            opacity: 0.15;
          }

          50% {
            transform: translateX(3%);
            opacity: 0.5;
          }
        }

        @media (max-width: 640px) {
          .promotionGlow {
            opacity: 0.28;
          }

          .promotionLightLine {
            opacity: 0.2;
          }

          .promotionShine {
            display: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .promotionGlow,
          .promotionLightLine,
          .promotionEyebrow {
            animation: none !important;
          }

          .promotionShine {
            display: none;
          }
        }
      `}</style>
        </section>
    )
}