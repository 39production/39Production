import { useEffect, useState } from 'react'
import {
  Briefcase,
  ArrowRight,
  Loader2,
  Tag,
  Sparkles,
  Code2,
  Wand2,
} from 'lucide-react'
import { Link } from 'react-router-dom'

type ServicePricingType =
  | 'fixed'
  | 'starting_from'
  | 'custom_quote'

interface Service {
  id: number
  name: string
  category: string
  description: string
  price: number | null
  pricing_type: ServicePricingType
  starting_price: number | null
  status: 'Active' | 'Draft'
  image_url?: string | null
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

const API_BASE_URL =
  'https://39production-api.39production.workers.dev'

export function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [promotionLoading, setPromotionLoading] =
    useState(true)
  const [error, setError] = useState('')

  const formatPrice = (
    price: number | null | undefined,
  ) => {
    if (
      price === null ||
      price === undefined ||
      Number.isNaN(price)
    ) {
      return '-'
    }

    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(price)
  }

  const isPromotionValid = (
    promotion: Promotion,
  ) => {
    const today = new Intl.DateTimeFormat(
      'en-CA',
      {
        timeZone: 'Asia/Jakarta',
      },
    ).format(new Date())

    return (
      promotion.status === 'Active' &&
      promotion.start_date <= today &&
      promotion.end_date >= today
    )
  }

  const getServicePromotion = (
    serviceId: number,
  ) => {
    return (
      promotions
        .filter(
          (promotion) =>
            promotion.target_type === 'Service' &&
            Number(promotion.service_id) ===
            Number(serviceId) &&
            isPromotionValid(promotion),
        )
        .sort((a, b) => b.id - a.id)[0] ??
      null
    )
  }

  const calculateDiscount = (
    service: Service,
    promotion: Promotion | null,
  ) => {
    /*
     * Promotion hanya berlaku untuk fixed price.
     *
     * Starting From dan Custom Quote tidak
     * mempunyai harga final sehingga promo
     * tidak dihitung di halaman listing.
     */
    if (
      !promotion ||
      service.pricing_type !== 'fixed' ||
      service.price === null ||
      service.price === undefined
    ) {
      return 0
    }

    if (
      promotion.discount_type ===
      'Percentage'
    ) {
      return Math.min(
        service.price,
        Math.round(
          service.price *
          (Number(
            promotion.discount_value,
          ) / 100),
        ),
      )
    }

    return Math.min(
      service.price,
      Number(promotion.discount_value),
    )
  }

  const getDiscountLabel = (
    promotion: Promotion,
  ) => {
    if (
      promotion.discount_type ===
      'Percentage'
    ) {
      return `${promotion.discount_value}% OFF`
    }

    return `Save ${formatPrice(
      Number(promotion.discount_value),
    )}`
  }

  const getPricingLabel = (
    service: Service,
  ) => {
    switch (service.pricing_type) {
      case 'fixed':
        return 'Fixed Price'

      case 'starting_from':
        return 'Starting From'

      case 'custom_quote':
        return 'Custom Quote'

      default:
        return 'Fixed Price'
    }
  }

  const getPricingText = (
    service: Service,
  ) => {
    switch (service.pricing_type) {
      case 'fixed':
        return service.price !== null
          ? formatPrice(service.price)
          : 'Price not set'

      case 'starting_from':
        return service.starting_price !== null
          ? `From ${formatPrice(
            service.starting_price,
          )}`
          : 'Starting price not set'

      case 'custom_quote':
        return 'Custom Quote'

      default:
        return service.price !== null
          ? formatPrice(service.price)
          : 'Price not set'
    }
  }

  const getPricingBadgeClass = (
    service: Service,
  ) => {
    switch (service.pricing_type) {
      case 'fixed':
        return 'border-violet-200 bg-violet-50 text-violet-700'

      case 'starting_from':
        return 'border-cyan-200 bg-cyan-50 text-cyan-700'

      case 'custom_quote':
        return 'border-pink-200 bg-pink-50 text-pink-700'

      default:
        return 'border-violet-200 bg-violet-50 text-violet-700'
    }
  }

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(
          `${API_BASE_URL}/api/services`,
          {
            cache: 'no-store',
          },
        )

        if (!response.ok) {
          throw new Error(
            `Failed to fetch services (${response.status})`,
          )
        }

        const result =
          await response.json()

        if (
          result &&
          result.success === false
        ) {
          throw new Error(
            result.message ||
            'Failed to fetch services',
          )
        }

        const data =
          Array.isArray(result)
            ? result
            : Array.isArray(result?.data)
              ? result.data
              : Array.isArray(
                result?.services,
              )
                ? result.services
                : []

        const normalizedServices =
          data.map(
            (service: Service) => ({
              ...service,

              /*
               * Backward compatibility:
               * service lama yang belum mempunyai
               * pricing_type dianggap fixed.
               */
              pricing_type:
                service.pricing_type ||
                'fixed',

              price:
                service.price !==
                  undefined &&
                  service.price !== null
                  ? Number(service.price)
                  : null,

              starting_price:
                service.starting_price !==
                  undefined &&
                  service.starting_price !== null
                  ? Number(
                    service.starting_price,
                  )
                  : null,
            }),
          )

        setServices(
          normalizedServices.filter(
            (service: Service) =>
              service.status === 'Active',
          ),
        )
      } catch (err) {
        console.error(
          'Error fetching services:',
          err,
        )

        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load services. Please try again later.',
        )
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [])

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        setPromotionLoading(true)

        const response = await fetch(
          `${API_BASE_URL}/api/promotions`,
          {
            cache: 'no-store',
          },
        )

        if (!response.ok) {
          setPromotions([])
          return
        }

        const result =
          await response.json()

        const data =
          Array.isArray(result)
            ? result
            : Array.isArray(result?.data)
              ? result.data
              : []

        setPromotions(data)
      } catch (err) {
        console.error(
          'Fetch promotions error:',
          err,
        )

        setPromotions([])
      } finally {
        setPromotionLoading(false)
      }
    }

    fetchPromotions()
  }, [])

  return (
    <section className="relative isolate min-h-screen overflow-hidden bg-white">
      {/* =====================================================
          BACKGROUND
      ====================================================== */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-neutral-50" />

        <div className="absolute -left-56 top-0 h-[420px] w-[420px] rounded-full bg-violet-100/60 blur-[120px]" />

        <div className="absolute -right-56 top-[28%] h-[420px] w-[420px] rounded-full bg-pink-100/50 blur-[120px]" />

        <div className="absolute bottom-[15%] left-[35%] h-[320px] w-[320px] rounded-full bg-fuchsia-100/30 blur-[110px]" />
      </div>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6 sm:pb-20 sm:pt-28 lg:px-8 lg:pb-24">
        {/* ===================================================
            PAGE INTRO
        ==================================================== */}
        <div className="mb-10 max-w-3xl sm:mb-12">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3.5 py-2 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-500 opacity-60" />

              <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-600" />
            </span>

            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-violet-700 sm:text-xs">
              Creative Technology Studio
            </span>
          </div>

          <h1 className="text-4xl font-black leading-[0.98] tracking-[-0.04em] text-neutral-950 sm:text-5xl md:text-6xl">
            <span className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-500 bg-clip-text text-transparent">
              Build
            </span>{' '}
            What Matters
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-neutral-600 sm:text-base sm:leading-8">
            We combine technology, design, and
            creative production to transform ideas
            into digital products, experiences, and
            stories built to make an impact.
          </p>

          {/* Capability pills */}
          <div className="mt-6 flex flex-wrap gap-2.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3.5 py-2 text-xs font-medium text-neutral-600 shadow-sm">
              <Code2 className="h-3.5 w-3.5 text-violet-600" />
              Creative Technology
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3.5 py-2 text-xs font-medium text-neutral-600 shadow-sm">
              <Wand2 className="h-3.5 w-3.5 text-pink-600" />
              Creative Production
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3.5 py-2 text-xs font-medium text-neutral-600 shadow-sm">
              <Briefcase className="h-3.5 w-3.5 text-cyan-600" />
              Digital Solutions
            </div>
          </div>
        </div>

        {/* ===================================================
            LOADING
        ==================================================== */}
        {loading && (
          <div className="flex min-h-[280px] items-center justify-center">
            <div className="rounded-2xl border border-neutral-200 bg-white px-6 py-5 shadow-[0_15px_45px_rgba(0,0,0,0.05)]">
              <div className="flex items-center gap-3 text-sm text-neutral-500">
                <Loader2 className="h-5 w-5 animate-spin text-violet-600" />
                Loading services...
              </div>
            </div>
          </div>
        )}

        {/* ===================================================
            ERROR
        ==================================================== */}
        {!loading && error && (
          <div className="max-w-xl rounded-2xl border border-red-200 bg-red-50 p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                <Briefcase className="h-5 w-5" />
              </div>

              <div>
                <h2 className="font-semibold text-neutral-900">
                  Unable to load services
                </h2>

                <p className="mt-1 text-sm leading-6 text-red-600">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================
            EMPTY
        ==================================================== */}
        {!loading &&
          !error &&
          services.length === 0 && (
            <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-[0_15px_50px_rgba(0,0,0,0.04)] sm:p-10">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                <Briefcase className="h-7 w-7" />
              </div>

              <h2 className="mt-4 text-lg font-semibold text-neutral-900">
                No services available
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
                Our service catalog is currently
                being updated. Please check back
                soon.
              </p>
            </div>
          )}

        {/* ===================================================
            SERVICE GRID
        ==================================================== */}
        {!loading &&
          !error &&
          services.length > 0 && (
            <>
              <div className="mb-6 flex items-end justify-between gap-4 sm:mb-7">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-violet-600">
                    What we build
                  </p>

                  <h2 className="mt-1 text-2xl font-bold tracking-tight text-neutral-950 sm:text-3xl">
                    Our Capabilities
                  </h2>
                </div>

                <div className="hidden items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-500 shadow-sm sm:flex">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />

                  {services.length}{' '}
                  {services.length === 1
                    ? 'Service'
                    : 'Services'}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
                {services.map((service) => {
                  const promotion =
                    getServicePromotion(
                      service.id,
                    )

                  const hasFixedPricing =
                    service.pricing_type ===
                    'fixed' &&
                    service.price !== null &&
                    service.price !==
                    undefined

                  const discount =
                    hasFixedPricing
                      ? calculateDiscount(
                        service,
                        promotion,
                      )
                      : 0

                  const finalPrice =
                    hasFixedPricing &&
                      service.price !== null
                      ? service.price - discount
                      : null

                  /*
                   * Promo hanya tampil untuk
                   * fixed pricing.
                   */
                  const showPromotion =
                    Boolean(
                      promotion &&
                      hasFixedPricing,
                    )

                  return (
                    <Link
                      key={service.id}
                      to={`/services/${service.id}`}
                      className="
                        group
                        relative
                        flex
                        h-full
                        flex-col
                        overflow-hidden
                        rounded-[1.5rem]
                        border
                        border-neutral-200
                        bg-white
                        shadow-[0_10px_35px_rgba(0,0,0,0.045)]
                        transition-all
                        duration-300
                        hover:-translate-y-1
                        hover:border-violet-200
                        hover:shadow-[0_20px_55px_rgba(124,58,237,0.10)]
                      "
                    >
                      {/* Top hover line */}
                      <div className="absolute inset-x-6 top-0 z-20 h-px bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                      {/* =================================================
                          IMAGE
                      ================================================== */}
                      <div className="relative aspect-[16/9] w-full overflow-hidden bg-neutral-100">
                        {service.image_url ? (
                          <>
                            <img
                              src={
                                service.image_url
                              }
                              alt={service.name}
                              loading="lazy"
                              className="
                                h-full
                                w-full
                                object-cover
                                transition-transform
                                duration-500
                                group-hover:scale-[1.04]
                              "
                              onError={(
                                event,
                              ) => {
                                event.currentTarget.style.display =
                                  'none'
                              }}
                            />

                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-neutral-950/55 via-transparent to-transparent" />

                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-pink-500/10 opacity-70" />
                          </>
                        ) : (
                          <>
                            <div className="absolute inset-0 bg-gradient-to-br from-violet-100 via-white to-pink-100" />

                            <div
                              className="absolute inset-0 opacity-[0.06]"
                              style={{
                                backgroundImage: `
                                  linear-gradient(rgba(124, 58, 237, 0.7) 1px, transparent 1px),
                                  linear-gradient(90deg, rgba(124, 58, 237, 0.7) 1px, transparent 1px)
                                `,
                                backgroundSize:
                                  '30px 30px',
                              }}
                            />

                            <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2">
                              <div className="absolute -inset-8 rounded-full bg-violet-200/50 blur-2xl" />

                              <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-violet-200 bg-white/90 text-violet-600 shadow-xl backdrop-blur-md">
                                <Briefcase className="h-9 w-9" />
                              </div>
                            </div>
                          </>
                        )}

                        {/* Category */}
                        <div className="absolute bottom-4 left-4">
                          <span className="inline-flex rounded-full border border-white/25 bg-black/45 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-white backdrop-blur-md">
                            {service.category}
                          </span>
                        </div>

                        {/* Pricing */}
                        <div className="absolute left-4 top-4">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide backdrop-blur-md ${getPricingBadgeClass(
                              service,
                            )}`}
                          >
                            {getPricingLabel(
                              service,
                            )}
                          </span>
                        </div>

                        {/* Promotion */}
                        {showPromotion &&
                          promotion && (
                            <div className="absolute right-4 top-4">
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-green-700 shadow-sm backdrop-blur-md">
                                <Tag className="h-3 w-3" />

                                {getDiscountLabel(
                                  promotion,
                                )}
                              </span>
                            </div>
                          )}
                      </div>

                      {/* =================================================
                          CONTENT
                      ================================================== */}
                      <div className="flex flex-1 flex-col p-5 sm:p-6">
                        <h3 className="line-clamp-2 text-lg font-bold leading-6 text-neutral-950 transition-colors group-hover:text-violet-700 sm:text-xl">
                          {service.name}
                        </h3>

                        <p className="mt-2 line-clamp-3 min-h-[66px] text-sm leading-6 text-neutral-500">
                          {service.description}
                        </p>

                        {/* Promotion box */}
                        {showPromotion &&
                          promotion && (
                            <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3.5">
                              <div className="flex items-start gap-2.5">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-700">
                                  <Tag className="h-3.5 w-3.5" />
                                </div>

                                <div className="min-w-0">
                                  <p className="truncate text-xs font-semibold text-green-800">
                                    {
                                      promotion.title
                                    }
                                  </p>

                                  <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-green-700/80">
                                    {
                                      promotion.description
                                    }
                                  </p>

                                  <p className="mt-1.5 font-mono text-[9px] uppercase tracking-wider text-green-700/60">
                                    Code:{' '}
                                    {
                                      promotion.code
                                    }
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                        {/* =================================================
                            FOOTER
                        ================================================== */}
                        <div className="mt-auto pt-5">
                          <div className="flex items-end justify-between gap-4 border-t border-neutral-100 pt-4">
                            <div className="min-w-0">
                              {/* Fixed */}
                              {service.pricing_type ===
                                'fixed' && (
                                  <>
                                    {showPromotion &&
                                      finalPrice !==
                                      null ? (
                                      <>
                                        <p className="text-[10px] font-medium text-neutral-400 line-through">
                                          {formatPrice(
                                            service.price,
                                          )}
                                        </p>

                                        <p className="mt-0.5 text-lg font-bold text-green-600 sm:text-xl">
                                          {formatPrice(
                                            finalPrice,
                                          )}
                                        </p>
                                      </>
                                    ) : (
                                      <p className="text-lg font-bold text-neutral-950 sm:text-xl">
                                        {getPricingText(
                                          service,
                                        )}
                                      </p>
                                    )}
                                  </>
                                )}

                              {/* Starting From */}
                              {service.pricing_type ===
                                'starting_from' && (
                                  <div>
                                    <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-cyan-700">
                                      Starting from
                                    </p>

                                    <p className="mt-0.5 text-lg font-bold text-cyan-700 sm:text-xl">
                                      {formatPrice(
                                        service.starting_price,
                                      )}
                                    </p>
                                  </div>
                                )}

                              {/* Custom Quote */}
                              {service.pricing_type ===
                                'custom_quote' && (
                                  <div>
                                    <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-pink-600">
                                      Pricing
                                    </p>

                                    <p className="mt-0.5 text-lg font-bold text-pink-600 sm:text-xl">
                                      Custom Quote
                                    </p>
                                  </div>
                                )}
                            </div>

                            <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold text-violet-700 transition-colors group-hover:text-violet-800 sm:text-sm">
                              View Detail

                              <ArrowRight
                                className="
                                  h-3.5
                                  w-3.5
                                  transition-transform
                                  duration-300
                                  group-hover:translate-x-1
                                "
                              />
                            </span>
                          </div>

                          <Sparkles className="pointer-events-none absolute bottom-5 right-5 h-3 w-3 text-violet-600/0 transition-all duration-300 group-hover:text-violet-600/30" />
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </>
          )}

        {/* ===================================================
            PROMOTION INFO
        ==================================================== */}
        {!promotionLoading &&
          services.length > 0 &&
          promotions.some(
            (promotion) =>
              promotion.target_type ===
              'Service' &&
              isPromotionValid(promotion),
          ) && (
            <div className="relative mt-7 overflow-hidden rounded-2xl border border-violet-200 bg-violet-50/70 p-4 sm:mt-8 sm:p-5">
              <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 rounded-full bg-violet-200/50 blur-3xl" />

              <div className="relative flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-violet-200 bg-white text-violet-700 shadow-sm">
                  <Tag className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-neutral-900">
                    Active promotions are
                    automatically applied
                  </p>

                  <p className="mt-1 max-w-3xl text-xs leading-5 text-neutral-500 sm:text-sm">
                    No promo code is required.
                    Eligible fixed-price services
                    will have their promotions
                    applied automatically when
                    you place an order.
                  </p>
                </div>
              </div>
            </div>
          )}
      </div>

      {/* =====================================================
          LIGHTWEIGHT ANIMATION
      ====================================================== */}
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </section>
  )
}