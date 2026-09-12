
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
     * Promotion hanya berlaku untuk service
     * dengan fixed price.
     *
     * Starting From dan Custom Quote belum
     * memiliki harga final sehingga promo tidak
     * dihitung di halaman listing.
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
        return 'border-brand-primary/20 bg-brand-primary/10 text-brand-primary'

      case 'starting_from':
        return 'border-cyan-400/20 bg-cyan-400/10 text-cyan-400'

      case 'custom_quote':
        return 'border-brand-accent/20 bg-brand-accent/10 text-brand-accent'

      default:
        return 'border-brand-primary/20 bg-brand-primary/10 text-brand-primary'
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
    <section className="relative isolate min-h-screen overflow-hidden bg-bg-base">
      {/* =====================================================
          BACKGROUND
      ====================================================== */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-bg-base via-bg-base to-bg-surface" />

        <div className="absolute -left-48 top-0 h-[520px] w-[520px] rounded-full bg-brand-primary/12 blur-[150px]" />

        <div className="absolute -right-48 top-[30%] h-[500px] w-[500px] rounded-full bg-brand-accent/10 blur-[150px]" />

        <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-secondary/8 blur-[140px]" />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(139, 92, 246, 0.8) 1px, transparent 1px),
              linear-gradient(90deg, rgba(139, 92, 246, 0.8) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_15%,rgba(5,5,10,0.75)_100%)]" />

        <div className="absolute left-0 right-0 top-[20%] h-px bg-gradient-to-r from-transparent via-brand-primary/30 to-transparent animate-[services-scan_9s_ease-in-out_infinite]" />

        <div className="absolute left-[12%] top-[25%] h-1.5 w-1.5 rounded-full bg-brand-primary shadow-[0_0_18px_rgba(139,92,246,0.9)] animate-[services-float_6s_ease-in-out_infinite]" />

        <div
          className="absolute left-[25%] top-[72%] h-1 w-1 rounded-full bg-brand-accent shadow-[0_0_18px_rgba(236,72,153,0.9)] animate-[services-float_7s_ease-in-out_infinite]"
          style={{
            animationDelay: '1s',
          }}
        />

        <div
          className="absolute right-[18%] top-[18%] h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_18px_rgba(34,211,238,0.9)] animate-[services-float_8s_ease-in-out_infinite]"
          style={{
            animationDelay: '2s',
          }}
        />
      </div>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-28 sm:px-6 lg:px-8">
        {/* ===================================================
            PAGE INTRO
        ==================================================== */}
        <div className="mb-10 max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-primary/30 bg-brand-primary/10 px-4 py-2 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-primary opacity-75" />

              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-primary" />
            </span>

            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">
              Creative Technology Studio
            </span>
          </div>

          <h1 className="font-display text-4xl font-bold leading-[0.95] tracking-tight text-text-primary sm:text-5xl md:text-6xl">
            <span className="gradient-text">
              Build
            </span>{' '}
            What Matters
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-text-secondary sm:text-base">
            We combine technology, design, and
            creative production to transform ideas
            into digital products, experiences, and
            stories built to make an impact.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-border-default bg-bg-surface/60 px-3.5 py-2 text-xs text-text-muted backdrop-blur-md">
              <Code2 className="h-3.5 w-3.5 text-brand-primary" />
              Creative Technology
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-border-default bg-bg-surface/60 px-3.5 py-2 text-xs text-text-muted backdrop-blur-md">
              <Wand2 className="h-3.5 w-3.5 text-brand-accent" />
              Creative Production
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-border-default bg-bg-surface/60 px-3.5 py-2 text-xs text-text-muted backdrop-blur-md">
              <Briefcase className="h-3.5 w-3.5 text-cyan-400" />
              Digital Solutions
            </div>
          </div>
        </div>

        {/* ===================================================
            LOADING
        ==================================================== */}
        {loading && (
          <div className="flex min-h-[280px] items-center justify-center">
            <div className="rounded-2xl border border-border-default bg-bg-surface/70 px-6 py-4 shadow-xl backdrop-blur-xl">
              <div className="flex items-center gap-3 text-sm text-text-muted">
                <Loader2 className="h-5 w-5 animate-spin text-brand-primary" />
                Loading services...
              </div>
            </div>
          </div>
        )}

        {/* ===================================================
            ERROR
        ==================================================== */}
        {!loading && error && (
          <div className="max-w-xl rounded-2xl border border-red-500/20 bg-red-500/5 p-6 backdrop-blur-md">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
                <Briefcase className="h-5 w-5" />
              </div>

              <div>
                <h2 className="font-semibold text-text-primary">
                  Unable to load services
                </h2>

                <p className="mt-1 text-sm text-red-400">
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
            <div className="rounded-2xl border border-border-default bg-bg-surface/60 p-10 text-center backdrop-blur-md">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
                <Briefcase className="h-7 w-7" />
              </div>

              <h2 className="mt-4 text-lg font-semibold text-text-primary">
                No services available
              </h2>

              <p className="mt-2 text-sm text-text-muted">
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
              <div className="mb-6 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-primary">
                    What we build
                  </p>

                  <h2 className="mt-1 text-2xl font-bold tracking-tight text-text-primary">
                    Our Capabilities
                  </h2>
                </div>

                <div className="hidden items-center gap-2 rounded-full border border-border-default bg-bg-surface/60 px-3 py-1.5 text-xs text-text-muted backdrop-blur-md sm:flex">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-primary" />

                  {services.length}{' '}
                  {services.length === 1
                    ? 'Service'
                    : 'Services'}
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {services.map((service) => {
                  const promotion =
                    getServicePromotion(
                      service.id,
                    )

                  /*
                   * Promo hanya digunakan untuk
                   * fixed price.
                   */
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
                   * Jangan tampilkan promo pada
                   * starting_from / custom_quote.
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
                      className="group relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-bg-surface/65 shadow-xl shadow-black/10 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-brand-primary/35 hover:bg-bg-surface/85 hover:shadow-[0_20px_60px_rgba(139,92,246,0.12)]"
                    >
                      {/* Card glow */}
                      <div className="pointer-events-none absolute -right-20 -top-20 z-20 h-40 w-40 rounded-full bg-brand-primary/10 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                      {/* Top line */}
                      <div className="absolute inset-x-6 top-0 z-30 h-px bg-gradient-to-r from-transparent via-brand-primary/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                      {/* =================================================
                          SERVICE IMAGE
                      ================================================== */}
                      <div className="relative aspect-[16/9] w-full overflow-hidden bg-bg-elevated">
                        {service.image_url ? (
                          <>
                            <img
                              src={
                                service.image_url
                              }
                              alt={service.name}
                              loading="lazy"
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                              onError={(
                                event,
                              ) => {
                                event.currentTarget.style.display =
                                  'none'
                              }}
                            />

                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-primary/10 via-transparent to-brand-accent/10 opacity-60" />
                          </>
                        ) : (
                          <>
                            <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/20 via-bg-surface to-brand-accent/10" />

                            <div
                              className="absolute inset-0 opacity-[0.05]"
                              style={{
                                backgroundImage: `
                                  linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px),
                                  linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)
                                `,
                                backgroundSize:
                                  '32px 32px',
                              }}
                            />

                            <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2">
                              <div className="absolute -inset-8 rounded-full bg-brand-primary/20 blur-2xl" />

                              <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-brand-primary/30 bg-bg-elevated/80 shadow-2xl backdrop-blur-xl">
                                <Briefcase className="h-9 w-9 text-brand-primary" />
                              </div>
                            </div>
                          </>
                        )}

                        {/* Category */}
                        <div className="absolute bottom-4 left-4">
                          <span className="inline-flex rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-md">
                            {service.category}
                          </span>
                        </div>

                        {/* Pricing Type */}
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
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-green-400/20 bg-green-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-green-400 backdrop-blur-md">
                                <Tag className="h-3 w-3" />

                                {getDiscountLabel(
                                  promotion,
                                )}
                              </span>
                            </div>
                          )}
                      </div>

                      {/* =================================================
                          CARD CONTENT
                      ================================================== */}
                      <div className="relative p-5">
                        <h3 className="line-clamp-1 font-display text-xl font-semibold text-text-primary transition-colors group-hover:text-brand-primary">
                          {service.name}
                        </h3>

                        <p className="mt-2 line-clamp-3 min-h-[60px] text-sm leading-5 text-text-muted">
                          {service.description}
                        </p>

                        {/* Promotion */}
                        {showPromotion &&
                          promotion && (
                            <div className="relative mt-4 rounded-xl border border-green-400/15 bg-green-400/5 p-3">
                              <div className="flex items-start gap-2.5">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-green-400/10 text-green-400">
                                  <Tag className="h-3.5 w-3.5" />
                                </div>

                                <div className="min-w-0">
                                  <p className="truncate text-xs font-semibold text-green-400">
                                    {
                                      promotion.title
                                    }
                                  </p>

                                  <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-green-300/65">
                                    {
                                      promotion.description
                                    }
                                  </p>

                                  <p className="mt-1.5 font-mono text-[9px] uppercase tracking-wider text-green-300/50">
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
                        <div className="relative mt-5 flex items-end justify-between gap-3 border-t border-white/8 pt-4">
                          <div>
                            {/* ==========================================
                                FIXED PRICE
                            =========================================== */}
                            {service.pricing_type ===
                              'fixed' && (
                                <>
                                  {showPromotion &&
                                    finalPrice !==
                                    null ? (
                                    <>
                                      <p className="text-[10px] text-text-muted line-through">
                                        {formatPrice(
                                          service.price,
                                        )}
                                      </p>

                                      <p className="mt-0.5 text-lg font-bold text-green-400">
                                        {formatPrice(
                                          finalPrice,
                                        )}
                                      </p>
                                    </>
                                  ) : (
                                    <p className="text-lg font-semibold text-text-primary">
                                      {getPricingText(
                                        service,
                                      )}
                                    </p>
                                  )}
                                </>
                              )}

                            {/* ==========================================
                                STARTING FROM
                            =========================================== */}
                            {service.pricing_type ===
                              'starting_from' && (
                                <div>
                                  <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-cyan-400/70">
                                    Starting from
                                  </p>

                                  <p className="mt-0.5 text-lg font-bold text-cyan-400">
                                    {formatPrice(
                                      service.starting_price,
                                    )}
                                  </p>
                                </div>
                              )}

                            {/* ==========================================
                                CUSTOM QUOTE
                            =========================================== */}
                            {service.pricing_type ===
                              'custom_quote' && (
                                <div>
                                  <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-brand-accent/70">
                                    Pricing
                                  </p>

                                  <p className="mt-0.5 text-lg font-bold text-brand-accent">
                                    Custom Quote
                                  </p>
                                </div>
                              )}
                          </div>

                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-primary">
                            View Detail

                            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                          </span>
                        </div>

                        <Sparkles className="pointer-events-none absolute bottom-5 right-5 h-3 w-3 text-brand-primary/0 transition-all duration-300 group-hover:text-brand-primary/30" />
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
            <div className="relative mt-7 overflow-hidden rounded-2xl border border-brand-primary/20 bg-brand-primary/5 p-4 backdrop-blur-md sm:p-5">
              <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-brand-primary/10 blur-3xl" />

              <div className="relative flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-brand-primary/15 bg-brand-primary/10 text-brand-primary">
                  <Tag className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-text-primary">
                    Active promotions are
                    automatically applied
                  </p>

                  <p className="mt-1 text-xs leading-5 text-text-muted">
                    No promo code is required.
                    Eligible fixed-price
                    services will have their
                    promotions applied automatically
                    when you place an order.
                  </p>
                </div>
              </div>
            </div>
          )}
      </div>

      {/* =====================================================
          ANIMATIONS
      ====================================================== */}
      <style>{`
        @keyframes services-float {
          0%,
          100% {
            transform: translateY(0) translateX(0);
          }

          50% {
            transform: translateY(-14px) translateX(5px);
          }
        }

        @keyframes services-scan {
          0%,
          100% {
            transform: translateY(-120px);
            opacity: 0;
          }

          20% {
            opacity: 1;
          }

          50% {
            opacity: 0.35;
          }

          80% {
            opacity: 1;
          }

          100% {
            transform: translateY(600px);
            opacity: 0;
          }
        }

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