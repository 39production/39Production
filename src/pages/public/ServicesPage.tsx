import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  Code2,
  Gamepad2,
  Layers3,
  Loader2,
  MonitorPlay,
  MoveUpRight,
  Palette,
  PenTool,
  Sparkles,
  Tag,
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

const serviceIcons = [
  Code2,
  Layers3,
  Palette,
  PenTool,
  MonitorPlay,
  Gamepad2,
  Sparkles,
]

const categoryColors: Record<string, string> = {
  Development: 'bg-violet-50 text-violet-700 border-violet-200',
  Design: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
  Multimedia: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Entertainment: 'bg-violet-50 text-violet-700 border-violet-200',
  Creative: 'bg-purple-50 text-purple-700 border-purple-200',
}

function formatPrice(price: number | null) {
  if (price === null || Number.isNaN(price)) {
    return null
  }

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(price)
}

function isPromotionValid(promotion: Promotion) {
  if (promotion.status !== 'Active') {
    return false
  }

  const now = new Date()
  const start = new Date(promotion.start_date)
  const end = new Date(promotion.end_date)

  return now >= start && now <= end
}

function getServicePromotion(
  service: Service,
  promotions: Promotion[],
) {
  return promotions.find(
    (promotion) =>
      promotion.target_type === 'Service' &&
      promotion.service_id === service.id &&
      isPromotionValid(promotion),
  )
}

function calculateDiscount(
  service: Service,
  promotion?: Promotion,
) {
  if (!promotion) {
    return null
  }

  if (
    service.pricing_type !== 'fixed' ||
    service.price === null
  ) {
    return null
  }

  if (promotion.discount_type === 'Percentage') {
    return Math.max(
      0,
      service.price -
      service.price * (promotion.discount_value / 100),
    )
  }

  return Math.max(
    0,
    service.price - promotion.discount_value,
  )
}

function getDiscountLabel(promotion: Promotion) {
  if (promotion.discount_type === 'Percentage') {
    return `-${promotion.discount_value}%`
  }

  return `-${formatPrice(promotion.discount_value)}`
}

function getPricingLabel(service: Service) {
  switch (service.pricing_type) {
    case 'starting_from':
      return 'Starting From'
    case 'custom_quote':
      return 'Custom Quote'
    default:
      return 'Fixed Price'
  }
}

function getPricingText(service: Service) {
  switch (service.pricing_type) {
    case 'starting_from':
      return (
        formatPrice(service.starting_price) ??
        'Discuss your needs'
      )

    case 'custom_quote':
      return 'Let’s discuss'

    default:
      return formatPrice(service.price) ?? 'Contact us'
  }
}

function getPricingBadgeClass(
  pricingType: ServicePricingType,
) {
  switch (pricingType) {
    case 'starting_from':
      return 'border-violet-200 bg-violet-50 text-violet-700'

    case 'custom_quote':
      return 'border-violet-200 bg-violet-50 text-violet-700'

    default:
      return 'border-violet-200 bg-violet-50 text-violet-700'
  }
}

export function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [activeFilter, setActiveFilter] = useState('All')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    async function fetchServices() {
      try {
        setIsLoading(true)
        setError('')

        const [servicesResponse, promotionsResponse] =
          await Promise.all([
            fetch(`${API_BASE_URL}/api/services`, {
              cache: 'no-store',
            }),
            fetch(`${API_BASE_URL}/api/promotions`, {
              cache: 'no-store',
            }),
          ])

        if (!servicesResponse.ok) {
          throw new Error('Failed to load services')
        }

        const servicesJson = await servicesResponse.json()

        const normalizedServices: Service[] = (
          servicesJson?.data ?? []
        )
          .map((service: any) => ({
            ...service,

            pricing_type:
              service.pricing_type ??
              (service.price !== null
                ? 'fixed'
                : 'custom_quote'),

            price:
              service.price !== null &&
                service.price !== undefined
                ? Number(service.price)
                : null,

            starting_price:
              service.starting_price !== null &&
                service.starting_price !== undefined
                ? Number(service.starting_price)
                : null,
          }))
          .filter(
            (service: Service) =>
              service.status === 'Active',
          )

        let normalizedPromotions: Promotion[] = []

        if (promotionsResponse.ok) {
          const promotionsJson =
            await promotionsResponse.json()

          normalizedPromotions =
            promotionsJson?.data ?? []
        }

        if (!mounted) {
          return
        }

        setServices(normalizedServices)
        setPromotions(normalizedPromotions)
      } catch (err) {
        console.error(err)

        if (!mounted) {
          return
        }

        setError(
          'Unable to load our services right now. Please try again.',
        )
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    fetchServices()

    return () => {
      mounted = false
    }
  }, [])

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(
        services
          .map((service) => service.category)
          .filter(Boolean),
      ),
    )

    return ['All', ...uniqueCategories]
  }, [services])

  const filteredServices = useMemo(() => {
    if (activeFilter === 'All') {
      return services
    }

    return services.filter(
      (service) => service.category === activeFilter,
    )
  }, [services, activeFilter])

  const hasActiveServicePromotion = promotions.some(
    (promotion) =>
      promotion.target_type === 'Service' &&
      isPromotionValid(promotion),
  )

  return (
    <section className="relative isolate min-h-screen overflow-hidden bg-white text-zinc-950">
      {/* Background grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-70"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(24,24,27,0.035) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(24,24,27,0.035) 1px, transparent 1px)
          `,
          backgroundSize: '72px 72px',
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[8%] top-[16%] h-2 w-2 rounded-full bg-violet-600"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[13%] top-[38%] h-1.5 w-1.5 rounded-full bg-violet-500"
      />

      <div className="relative mx-auto max-w-[1600px] px-5 pb-20 pt-28 sm:px-8 sm:pt-32 lg:px-12 lg:pb-28 lg:pt-18">
        {/* Top editorial line */}
        <div className="mb-12 flex items-center justify-between border-b border-black/10 pb-5 sm:mb-16">
          <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.24em] text-zinc-500 sm:text-xs">
            <span className="text-zinc-950">
              39Production
            </span>

            <span className="h-1 w-1 rounded-full bg-violet-600" />

            <span>Services</span>
          </div>

          <div className="hidden items-center gap-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400 sm:flex">
            <span>Digital</span>
            <span>/</span>
            <span>Creative</span>
            <span>/</span>
            <span>Entertainment</span>
          </div>
        </div>

        {/* Hero */}
        <div className="relative grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end lg:gap-16">
          <div>
            <div className="mb-7 flex items-center gap-3">
              <span className="inline-flex items-center gap-2 border border-violet-200 bg-violet-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-violet-700">
                <Sparkles className="h-3.5 w-3.5" />
                What We Build
              </span>

              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                07 Disciplines
              </span>
            </div>

            <h1 className="max-w-5xl text-[clamp(3.5rem,8vw,8rem)] font-black leading-[0.82] tracking-[-0.065em]">
              <span className="block text-zinc-950">
                Build
              </span>

              <span className="block text-zinc-300">
                what matters.
              </span>
            </h1>

            <div className="mt-8 max-w-2xl border-l-2 border-violet-600 pl-5">
              <p className="text-base leading-7 text-zinc-600 sm:text-lg">
                From digital products to creative experiences,
                we bring different disciplines into one
                production team.
              </p>
            </div>
          </div>

          <div className="relative lg:pb-2">
            <div className="absolute -right-2 -top-8 hidden text-[9rem] font-black leading-none tracking-[-0.08em] text-zinc-100 lg:block">
              39
            </div>

            <div className="relative border-t border-black/10 pt-5">
              <div className="flex items-start justify-between gap-8">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                    Production Philosophy
                  </p>

                  <p className="mt-3 max-w-md text-sm leading-6 text-zinc-600">
                    Strategy, design, technology and
                    entertainment can work together under
                    one roof.
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <span className="text-3xl font-black tracking-[-0.04em] text-violet-600">
                    {services.length
                      .toString()
                      .padStart(2, '0')}
                  </span>

                  <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.16em] text-zinc-400">
                    Active Services
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Category navigation */}
        <div className="mt-20 border-y border-black/10 py-4 sm:mt-24">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-3 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
              Explore
            </span>

            {categories.map((category) => {
              const isActive =
                activeFilter === category

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() =>
                    setActiveFilter(category)
                  }
                  className={`
                    group relative px-4 py-2 text-xs font-bold
                    transition-all duration-300
                    ${isActive
                      ? 'bg-violet-600 text-white'
                      : 'text-zinc-500 hover:bg-violet-50 hover:text-violet-700'
                    }
                  `}
                >
                  {category}

                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-violet-600" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Section heading */}
        <div className="mt-14 flex flex-col justify-between gap-6 sm:mt-16 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-600">
                01
              </span>

              <span className="h-px w-10 bg-violet-600" />

              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                Our Capabilities
              </span>
            </div>

            <h2 className="text-3xl font-black tracking-[-0.04em] sm:text-5xl">
              Different disciplines.
              <span className="ml-2 text-zinc-300">
                One team.
              </span>
            </h2>
          </div>

          <Link
            to="/contact"
            className="group inline-flex w-fit items-center gap-3 border-b border-black pb-2 text-xs font-bold uppercase tracking-[0.16em] text-zinc-950 transition-colors hover:border-violet-600 hover:text-violet-600"
          >
            Discuss a Project
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
          </Link>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="mt-10 flex min-h-[300px] items-center justify-center border border-black/10 bg-neutral-50">
            <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
              <Loader2 className="h-4 w-4 animate-spin text-violet-600" />
              Loading services
            </div>
          </div>
        )}

        {/* Error */}
        {!isLoading && error && (
          <div className="mt-10 border border-red-200 bg-red-50 px-6 py-5 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Empty */}
        {!isLoading &&
          !error &&
          filteredServices.length === 0 && (
            <div className="mt-10 border border-black/10 bg-neutral-50 px-6 py-20 text-center">
              <Briefcase className="mx-auto h-7 w-7 text-violet-600" />

              <h3 className="mt-5 text-xl font-black tracking-tight">
                No services found
              </h3>

              <p className="mt-2 text-sm text-zinc-500">
                Try another category.
              </p>
            </div>
          )}

        {/* Services */}
        {!isLoading &&
          !error &&
          filteredServices.length > 0 && (
            <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-12">
              {filteredServices.map(
                (service, index) => {
                  const Icon =
                    serviceIcons[
                    index % serviceIcons.length
                    ]

                  const promotion =
                    getServicePromotion(
                      service,
                      promotions,
                    )

                  const discountedPrice =
                    calculateDiscount(
                      service,
                      promotion,
                    )

                  const isLarge =
                    index % 5 === 0

                  return (
                    <article
                      key={service.id}
                      className={`
                        group relative overflow-hidden
                        border border-black/10
                        bg-white
                        transition-all duration-500
                        hover:-translate-y-1
                        hover:border-violet-300
                        hover:shadow-[0_18px_50px_rgba(124,58,237,0.10)]
                        ${isLarge
                          ? 'md:min-h-[390px] lg:col-span-7'
                          : 'md:min-h-[390px] lg:col-span-5'
                        }
                      `}
                    >
                      {/* Accent */}
                      <div className="absolute inset-x-0 top-0 h-1 bg-violet-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                      {/* Image */}
                      {service.image_url ? (
                        <div
                          className={`
                            absolute inset-0 overflow-hidden
                            ${isLarge
                              ? 'lg:w-[48%]'
                              : 'lg:w-[42%]'
                            }
                          `}
                        >
                          <img
                            src={service.image_url}
                            alt={service.name}
                            className="h-full w-full object-cover grayscale transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
                          />

                          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/0 to-white lg:from-transparent lg:via-transparent" />

                          <div className="absolute left-5 top-5 border border-white/30 bg-black/70 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
                            39Production
                          </div>
                        </div>
                      ) : null}

                      <div
                        className={`
                          relative flex h-full flex-col
                          ${service.image_url
                            ? 'lg:ml-[42%] lg:min-h-[390px]'
                            : ''
                          }
                          ${isLarge &&
                            service.image_url
                            ? 'lg:ml-[48%]'
                            : ''
                          }
                          ${service.image_url
                            ? 'p-7 lg:p-8'
                            : 'p-7 sm:p-8'
                          }
                        `}
                      >
                        {/* Top */}
                        <div className="flex items-start justify-between gap-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center border border-violet-200 bg-violet-50 text-violet-600 transition-all duration-300 group-hover:bg-violet-600 group-hover:text-white">
                              <Icon className="h-5 w-5" />
                            </div>

                            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">
                              {String(index + 1).padStart(
                                2,
                                '0',
                              )}
                            </span>
                          </div>

                          <ArrowUpRight className="h-5 w-5 text-zinc-300 transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-violet-600" />
                        </div>

                        {/* Main */}
                        <div className="mt-8">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`
                                border px-2.5 py-1 text-[9px]
                                font-bold uppercase tracking-[0.14em]
                                ${categoryColors[
                                service.category
                                ] ??
                                'border-zinc-200 bg-zinc-50 text-zinc-600'
                                }
                              `}
                            >
                              {service.category}
                            </span>

                            <span
                              className={`
                                border px-2.5 py-1 text-[9px]
                                font-bold uppercase tracking-[0.14em]
                                ${getPricingBadgeClass(
                                service.pricing_type,
                              )}
                              `}
                            >
                              {getPricingLabel(
                                service,
                              )}
                            </span>
                          </div>

                          <h3 className="mt-5 text-2xl font-black leading-[1] tracking-[-0.045em] sm:text-3xl">
                            {service.name}
                          </h3>

                          <p className="mt-4 max-w-xl text-sm leading-6 text-zinc-500">
                            {service.description}
                          </p>
                        </div>

                        {/* Promotion */}
                        {promotion && (
                          <div className="mt-6 border border-violet-200 bg-violet-50 p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex gap-3">
                                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center bg-violet-600 text-white">
                                  <Tag className="h-3.5 w-3.5" />
                                </div>

                                <div>
                                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-violet-700">
                                    {promotion.title}
                                  </p>

                                  <p className="mt-1 text-xs text-violet-700/70">
                                    Code:{' '}
                                    <span className="font-bold">
                                      {promotion.code}
                                    </span>
                                  </p>
                                </div>
                              </div>

                              <span className="shrink-0 text-sm font-black text-violet-700">
                                {getDiscountLabel(
                                  promotion,
                                )}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Bottom */}
                        <div className="mt-auto pt-8">
                          <div className="mb-5 flex items-end justify-between gap-5 border-t border-black/10 pt-5">
                            <div>
                              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-zinc-400">
                                {promotion &&
                                  discountedPrice !== null
                                  ? 'Promotion Price'
                                  : getPricingLabel(
                                    service,
                                  )}
                              </p>

                              <div className="mt-1 flex flex-wrap items-baseline gap-2">
                                {promotion &&
                                  discountedPrice !==
                                  null ? (
                                  <>
                                    <span className="text-xl font-black tracking-tight text-violet-600">
                                      {formatPrice(
                                        discountedPrice,
                                      )}
                                    </span>

                                    <span className="text-xs text-zinc-400 line-through">
                                      {formatPrice(
                                        service.price,
                                      )}
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-xl font-black tracking-tight">
                                    {getPricingText(
                                      service,
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>

                            <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-zinc-400">
                              Available
                            </span>
                          </div>

                          <Link
                            to={`/services/${service.id}`}
                            className="group/link flex items-center justify-between border border-black bg-black px-5 py-3.5 text-xs font-bold uppercase tracking-[0.14em] text-white transition-all duration-300 hover:border-violet-600 hover:bg-violet-600"
                          >
                            <span>View Detail</span>

                            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/link:translate-x-1" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  )
                },
              )}
            </div>
          )}

        {/* Promotion note */}
        {!isLoading &&
          !error &&
          hasActiveServicePromotion && (
            <div className="mt-10 grid border border-violet-200 bg-violet-50 lg:grid-cols-[auto_1fr_auto]">
              <div className="flex items-center justify-center bg-violet-600 p-5 text-white">
                <Tag className="h-5 w-5" />
              </div>

              <div className="px-6 py-5">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-violet-700">
                  Current Offers
                </p>

                <p className="mt-1 text-sm leading-6 text-violet-900/80">
                  Selected services currently have active
                  promotional offers. Check each service
                  for its available code and terms.
                </p>
              </div>

              <div className="flex items-center px-6 pb-5 lg:pb-0">
                <Link
                  to="/promotions"
                  className="group inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-violet-700"
                >
                  View Promotions
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          )}

        {/* CTA */}
        <div className="relative mt-24 overflow-hidden bg-black px-7 py-12 text-white sm:px-10 lg:mt-28 lg:px-14 lg:py-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-[-3rem] top-1/2 -translate-y-1/2 text-[15rem] font-black leading-none tracking-[-0.12em] text-white/[0.035]"
          >
            39
          </div>

          <div
            aria-hidden="true"
            className="absolute right-8 top-8 h-2 w-2 rounded-full bg-violet-500"
          />

          <div className="relative grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <div className="mb-5 flex items-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-400">
                  39Production
                </span>

                <span className="h-px w-10 bg-violet-500" />

                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
                  Start Something Worth Making
                </span>
              </div>

              <h2 className="max-w-4xl text-4xl font-black leading-[0.95] tracking-[-0.05em] sm:text-6xl lg:text-7xl">
                Have something
                <span className="block text-violet-400">
                  different in mind?
                </span>
              </h2>

              <p className="mt-6 max-w-xl text-sm leading-6 text-white/55 sm:text-base">
                Tell us what you want to build. We’ll help
                shape the idea, define the scope and find
                the right production approach.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link
                to="/contact"
                className="group inline-flex items-center justify-center gap-3 bg-violet-600 px-6 py-4 text-xs font-black uppercase tracking-[0.14em] text-white transition-all duration-300 hover:bg-violet-500"
              >
                Start a Project
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
              </Link>

              <Link
                to="/portfolio"
                className="group inline-flex items-center justify-center gap-3 border border-white/15 px-6 py-4 text-xs font-black uppercase tracking-[0.14em] text-white/75 transition-all duration-300 hover:border-violet-400 hover:text-violet-300"
              >
                See Our Work
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>

        {/* Signature */}
        <div className="mt-7 flex flex-col justify-between gap-3 border-t border-black/10 pt-5 text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400 sm:flex-row sm:items-center">
          <span>
            39Production / Digital / Creative / Entertainment
          </span>

          <span className="inline-flex items-center gap-2">
            Creating Digital Works
            <MoveUpRight className="h-3 w-3 text-violet-600" />
          </span>
        </div>
      </div>

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            scroll-behavior: auto !important;
            transition-duration: 0.01ms !important;
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
          }
        }
      `}</style>
    </section>
  )
}