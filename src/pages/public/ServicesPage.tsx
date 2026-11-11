import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, PointerEvent } from 'react'
import {
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  Check,
  Code2,
  Copy,
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
  Development:
    'bg-violet-50 text-violet-700 border-violet-200',
  Design:
    'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
  Multimedia:
    'bg-indigo-50 text-indigo-700 border-indigo-200',
  Entertainment:
    'bg-violet-50 text-violet-700 border-violet-200',
  Creative:
    'bg-purple-50 text-purple-700 border-purple-200',
}

const DEFAULT_MARQUEE = [
  'Web Development',
  'UI/UX Design',
  'Graphic Design',
  'Digital Illustration',
  'Animation',
  'Game Development',
  'Creative Production',
]

/* Pola lebar kartu di desktop (12 kolom): tiap baris selalu penuh */
const ROW_PATTERNS: number[][] = [
  [7, 5],
  [4, 4, 4],
  [5, 7],
]

const SPAN_CLASS: Record<number, string> = {
  12: 'lg:col-span-12',
  7: 'lg:col-span-7',
  6: 'lg:col-span-6',
  5: 'lg:col-span-5',
  4: 'lg:col-span-4',
}

/* Hitung lebar tiap kartu supaya baris terakhir tidak menyisakan ruang kosong */
function getSpans(total: number): number[] {
  const spans: number[] = []
  let row = 0

  while (spans.length < total) {
    const pattern = ROW_PATTERNS[row % ROW_PATTERNS.length]
    const remaining = total - spans.length

    if (remaining >= pattern.length) {
      spans.push(...pattern)
    } else if (remaining === 1) {
      spans.push(12)
    } else {
      spans.push(...Array(remaining).fill(Math.floor(12 / remaining)))
    }

    row += 1
  }

  return spans
}

const delay = (ms: number) =>
  ({ '--d': `${ms}ms` }) as CSSProperties

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
  return (
    promotions.find(
      (promotion) =>
        promotion.target_type === 'Service' &&
        Number(promotion.service_id) === Number(service.id) &&
        isPromotionValid(promotion),
    ) ?? null
  )
}

function calculateDiscount(
  service: Service,
  promotion?: Promotion | null,
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
      service.price *
      (Number(promotion.discount_value) / 100),
    )
  }

  return Math.max(
    0,
    service.price - Number(promotion.discount_value),
  )
}

function getDiscountLabel(promotion: Promotion) {
  if (promotion.discount_type === 'Percentage') {
    return `-${promotion.discount_value}%`
  }

  return `-${formatPrice(
    Number(promotion.discount_value),
  )}`
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
      return (
        formatPrice(service.price) ??
        'Contact us'
      )
  }
}

/* ------------------------------------------------------------------ */
/* Gambar dummy lokal (SVG) — dipakai bila image_url kosong / gagal    */
/* ------------------------------------------------------------------ */
function PlaceholderArt({ seed }: { seed: string }) {
  const variant =
    Array.from(seed).reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % 4
  const id = `sp-${variant}-${seed.replace(/[^a-z0-9]/gi, '').slice(0, 8)}`

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 400 240"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
    >
      <defs>
        <radialGradient id={`${id}-a`} cx="18%" cy="15%" r="70%">
          <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-b`} cx="92%" cy="95%" r="60%">
          <stop offset="0%" stopColor="#E78FBA" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#E78FBA" stopOpacity="0" />
        </radialGradient>
        <pattern id={`${id}-g`} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" fill="none" stroke="#fff" strokeOpacity="0.05" />
        </pattern>
      </defs>

      <rect width="400" height="240" fill="#0d0820" />
      <rect width="400" height="240" fill={`url(#${id}-a)`} />
      <rect width="400" height="240" fill={`url(#${id}-b)`} />
      <rect width="400" height="240" fill={`url(#${id}-g)`} />

      {variant === 0 && (
        <g className="sp-art-a">
          {[110, 76, 44].map((r, i) => (
            <circle key={r} cx="290" cy="100" r={r} fill="none" stroke="#fff" strokeOpacity={0.1 + i * 0.08} />
          ))}
          <circle cx="290" cy="100" r="18" fill="#7C3AED" />
          <circle cx="338" cy="52" r="5" fill="#E78FBA" />
          <rect x="36" y="150" width="110" height="6" fill="#fff" opacity="0.25" />
          <rect x="36" y="164" width="72" height="6" fill="#fff" opacity="0.15" />
        </g>
      )}

      {variant === 1 && (
        <g>
          {Array.from({ length: 14 }).map((_, i) => {
            const h = 36 + ((i * 53) % 100)
            return (
              <rect
                key={i}
                x={36 + i * 24}
                y={200 - h}
                width="13"
                height={h}
                fill={i % 5 === 0 ? '#E78FBA' : '#7C3AED'}
                opacity={0.35 + (i % 4) * 0.15}
                className="sp-art-bar"
                style={{ animationDelay: `${(i % 8) * 0.22}s` }}
              />
            )
          })}
          <rect x="36" y="206" width="330" height="1" fill="#fff" opacity="0.25" />
        </g>
      )}

      {variant === 2 && (
        <g className="sp-art-a">
          <rect x="52" y="40" width="296" height="150" fill="none" stroke="#fff" strokeOpacity="0.2" />
          <rect x="52" y="40" width="296" height="20" fill="#fff" opacity="0.08" />
          <circle cx="64" cy="50" r="3" fill="#E78FBA" />
          <rect x="66" y="74" width="116" height="56" fill="#7C3AED" opacity="0.75" />
          <rect x="194" y="74" width="138" height="26" fill="#fff" opacity="0.14" />
          <rect x="194" y="108" width="88" height="22" fill="#E78FBA" opacity="0.6" />
          <rect x="66" y="144" width="266" height="7" fill="#fff" opacity="0.16" />
          <rect x="66" y="159" width="180" height="7" fill="#fff" opacity="0.1" />
        </g>
      )}

      {variant === 3 && (
        <g className="sp-art-a">
          {Array.from({ length: 8 }).map((_, i) => (
            <path
              key={i}
              d={`M-20 ${150 + i * 10} C 80 ${90 + i * 6}, 180 ${200 - i * 6}, 420 ${110 + i * 9}`}
              fill="none"
              stroke={i % 3 === 0 ? '#E78FBA' : '#7C3AED'}
              strokeOpacity={0.25 + i * 0.08}
              strokeWidth="1.5"
            />
          ))}
          <circle cx="96" cy="70" r="28" fill="#7C3AED" opacity="0.85" />
          <circle cx="108" cy="62" r="28" fill="none" stroke="#fff" strokeOpacity="0.35" />
        </g>
      )}

      <text
        x="30"
        y="226"
        fill="none"
        stroke="#fff"
        strokeOpacity="0.28"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontSize="56"
        fontWeight="900"
        letterSpacing="-5"
      >
        39
      </text>
    </svg>
  )
}

function ServiceImage({
  src,
  alt,
  seed,
}: {
  src?: string | null
  alt: string
  seed: string
}) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div role="img" aria-label={alt} className="absolute inset-0 overflow-hidden bg-[#0d0820]">
        <PlaceholderArt seed={seed} />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      onLoad={(e) => {
        if (e.currentTarget.naturalWidth === 0) setFailed(true)
      }}
      className="sp-kb absolute inset-0 h-full w-full object-cover"
    />
  )
}

/* ------------------------------------------------------------------ */
/* Kartu service — tilt 3D mengikuti kursor                            */
/* ------------------------------------------------------------------ */
function ServiceCard({
  service,
  index,
  promotion,
  wide,
  copied,
  onCopy,
}: {
  service: Service
  index: number
  promotion: Promotion | null
  wide: boolean
  copied: boolean
  onCopy: (code: string) => void
}) {
  const ref = useRef<HTMLElement | null>(null)
  const Icon = serviceIcons[index % serviceIcons.length]
  const discountedPrice = calculateDiscount(service, promotion)
  const hasPromoPrice = promotion && discountedPrice !== null

  const onMove = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType === 'touch') return
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    el.style.setProperty('--ry', `${((x - 0.5) * 9).toFixed(2)}deg`)
    el.style.setProperty('--rx', `${((0.5 - y) * 9).toFixed(2)}deg`)
    el.style.setProperty('--gx', `${(x * 100).toFixed(1)}%`)
    el.style.setProperty('--gy', `${(y * 100).toFixed(1)}%`)
  }

  const onLeave = () => {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--ry', '0deg')
    el.style.setProperty('--rx', '0deg')
  }

  return (
    <article
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="sp-card group relative flex h-full flex-col overflow-hidden border border-black/10 bg-white transition-[border-color,box-shadow] duration-500 hover:border-violet-400 hover:shadow-[8px_8px_0_0_rgba(124,58,237,0.9)]"
    >
      {/* Aksen atas */}
      <div className="absolute left-0 top-0 z-30 h-0.5 w-0 bg-violet-600 transition-all duration-700 group-hover:w-full" />

      {/* Glare */}
      <div className="sp-glare pointer-events-none absolute inset-0 z-20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Gambar */}
      <div
        className={`relative shrink-0 overflow-hidden bg-[#0d0820] ${wide ? 'h-36 sm:h-44 lg:h-56' : 'h-36 sm:h-40 lg:h-44'
          }`}
      >
        <ServiceImage
          src={service.image_url}
          alt={`${service.name} service by 39Production`}
          seed={service.name}
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/20" />
        <div className="sp-shine pointer-events-none absolute inset-y-0 -left-1/2 z-10 w-1/3 -skew-x-12 bg-white/20 opacity-0" />

        <div className="absolute left-3 top-3 z-10 flex items-center gap-2 sm:left-4 sm:top-4">
          <div className="flex h-9 w-9 items-center justify-center border border-white/30 bg-black/30 text-white backdrop-blur-sm transition-all duration-300 group-hover:border-violet-500 group-hover:bg-violet-600 sm:h-10 sm:w-10">
            <Icon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" strokeWidth={1.7} />
          </div>
          <span className="font-mono text-[10px] font-bold tracking-[0.16em] text-white/80">
            {String(index + 1).padStart(2, '0')}
          </span>
        </div>

        <span
          className={`absolute right-3 top-3 z-10 border px-2 py-1 text-[8px] font-bold uppercase tracking-[0.14em] sm:right-4 sm:top-4 sm:text-[9px] ${categoryColors[service.category] ??
            'border-zinc-200 bg-zinc-50 text-zinc-600'
            }`}
        >
          {service.category}
        </span>

        <div className="absolute bottom-3 left-3 z-10 border border-white/25 bg-black/55 px-2 py-1 font-mono text-[8px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-sm sm:bottom-4 sm:left-4">
          {getPricingLabel(service)}
        </div>

        {promotion && (
          <div className="sp-stamp absolute bottom-3 right-3 z-10 bg-violet-600 px-2.5 py-1.5 text-xs font-black tracking-tight text-white shadow-[4px_4px_0_0_rgba(0,0,0,0.85)] sm:bottom-4 sm:right-4 sm:text-sm">
            {getDiscountLabel(promotion)}
          </div>
        )}
      </div>

      {/* Isi */}
      <div className="relative flex flex-1 flex-col p-4 sm:p-5">
        <h3 className="text-lg font-black leading-[1.05] tracking-[-0.04em] text-zinc-950 transition-transform duration-500 group-hover:translate-x-1 sm:text-2xl">
          {service.name}
        </h3>

        <p className="mt-2 line-clamp-3 text-[12px] leading-5 text-zinc-500 sm:mt-3 sm:text-sm sm:leading-6">
          {service.description}
        </p>

        {/* Kupon promo */}
        {promotion && (
          <button
            type="button"
            onClick={() => onCopy(promotion.code)}
            className="mt-3 flex w-full items-center justify-between gap-3 border border-dashed border-violet-400 bg-violet-50 px-3 py-2.5 text-left transition-colors hover:bg-violet-100 sm:mt-4"
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center bg-violet-600 text-white">
                <Tag className="h-3 w-3" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[8px] font-black uppercase tracking-[0.14em] text-violet-700 sm:text-[9px]">
                  {promotion.title}
                </span>
                <span className="block truncate font-mono text-[10px] font-bold text-violet-700/80">
                  {promotion.code}
                </span>
              </span>
            </span>

            <span className="flex shrink-0 items-center gap-1 text-[8px] font-bold uppercase tracking-[0.14em] text-violet-700">
              {copied ? (
                <>
                  <Check className="h-3 w-3" /> Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" /> Copy
                </>
              )}
            </span>
          </button>
        )}

        {/* Harga + CTA */}
        <div className="mt-auto pt-4 sm:pt-5">
          <div className="mb-3 flex items-end justify-between gap-3 border-t border-black/10 pt-3 sm:mb-4 sm:pt-4">
            <div className="min-w-0">
              <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-zinc-400 sm:text-[9px]">
                {hasPromoPrice ? 'Promotion Price' : getPricingLabel(service)}
              </p>

              <div className="mt-1 flex flex-wrap items-baseline gap-x-2">
                {hasPromoPrice ? (
                  <>
                    <span className="text-lg font-black tracking-tight text-violet-600 sm:text-xl">
                      {formatPrice(discountedPrice)}
                    </span>
                    <span className="text-[10px] text-zinc-400 line-through sm:text-xs">
                      {formatPrice(service.price)}
                    </span>
                  </>
                ) : (
                  <span className="text-lg font-black tracking-tight sm:text-xl">
                    {getPricingText(service)}
                  </span>
                )}
              </div>
            </div>

            <span className="flex shrink-0 items-center gap-1.5 text-[8px] font-bold uppercase tracking-[0.16em] text-zinc-400 sm:text-[9px]">
              <span className="sp-blink h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Available
            </span>
          </div>

          <Link
            to={`/services/${service.id}`}
            className="group/link relative flex items-center justify-between overflow-hidden border border-black bg-black px-4 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-white transition-all duration-300 hover:border-violet-600 hover:bg-violet-600 sm:px-5 sm:py-3.5 sm:text-xs"
          >
            <span>View Detail</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/link:translate-x-1" />
          </Link>
        </div>
      </div>
    </article>
  )
}

/* ============================================================
   PAGE
============================================================ */
export function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [activeFilter, setActiveFilter] = useState('All')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [reduceMotion, setReduceMotion] = useState(false)

  const sectionRef = useRef<HTMLElement | null>(null)
  const stageRef = useRef<HTMLDivElement | null>(null)

  /*
   * ============================================================
   * SEO
   * ============================================================
   */

  useEffect(() => {
    const title =
      'Digital & Creative Services | 39Production'

    const description =
      'Explore 39Production services across web development, UI/UX design, multimedia, creative production, game development and entertainment.'

    const canonicalUrl =
      `${window.location.origin}${window.location.pathname}`

    document.title = title

    const setMeta = (
      attribute: 'name' | 'property',
      key: string,
      content: string,
    ) => {
      let element = document.head.querySelector(
        `meta[${attribute}="${key}"]`,
      ) as HTMLMetaElement | null

      if (!element) {
        element = document.createElement('meta')
        element.setAttribute(attribute, key)
        document.head.appendChild(element)
      }

      element.setAttribute('content', content)
    }

    const setLink = (
      rel: string,
      href: string,
    ) => {
      let element = document.head.querySelector(
        `link[rel="${rel}"]`,
      ) as HTMLLinkElement | null

      if (!element) {
        element = document.createElement('link')
        element.setAttribute('rel', rel)
        document.head.appendChild(element)
      }

      element.setAttribute('href', href)
    }

    setMeta('name', 'description', description)
    setMeta(
      'name',
      'keywords',
      '39Production, web development, UI UX design, graphic design, multimedia production, animation, game development, creative production, entertainment',
    )
    setMeta('name', 'robots', 'index, follow')
    setMeta('name', 'author', '39Production')
    setMeta('name', 'theme-color', '#ffffff')
    setMeta('property', 'og:type', 'website')
    setMeta('property', 'og:title', title)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:url', canonicalUrl)
    setMeta('property', 'og:site_name', '39Production')
    setMeta('property', 'og:locale', 'en_US')
    setMeta('name', 'twitter:card', 'summary_large_image')
    setMeta('name', 'twitter:title', title)
    setMeta('name', 'twitter:description', description)
    setLink('canonical', canonicalUrl)

    /*
     * Organization schema
     */

    document.head
      .querySelector('script[data-seo="organization-schema"]')
      ?.remove()

    const organizationSchema = document.createElement('script')
    organizationSchema.type = 'application/ld+json'
    organizationSchema.setAttribute('data-seo', 'organization-schema')
    organizationSchema.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: '39Production',
      url: window.location.origin,
      description:
        'Creative digital production house and entertainment production platform.',
    })
    document.head.appendChild(organizationSchema)

    /*
     * Collection page schema
     */

    document.head
      .querySelector('script[data-seo="services-page"]')
      ?.remove()

    const schema = document.createElement('script')
    schema.type = 'application/ld+json'
    schema.setAttribute('data-seo', 'services-page')
    schema.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: title,
      description,
      url: canonicalUrl,
      isPartOf: {
        '@type': 'WebSite',
        name: '39Production',
        url: window.location.origin,
      },
      about: {
        '@type': 'Organization',
        name: '39Production',
        description:
          'Creative digital production house and entertainment production platform.',
      },
      mainEntity: {
        '@type': 'ItemList',
        name: '39Production Services',
        itemListElement: services.map((service, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'Service',
            name: service.name,
            description: service.description,
            serviceType: service.category,
            provider: {
              '@type': 'Organization',
              name: '39Production',
            },
            url: `${window.location.origin}/services/${service.id}`,
          },
        })),
      },
    })
    document.head.appendChild(schema)

    return () => {
      document.title = '39Production'

      document
        .querySelector('script[data-seo="services-page"]')
        ?.remove()

      document
        .querySelector('script[data-seo="organization-schema"]')
        ?.remove()
    }
  }, [services])

  /*
   * ============================================================
   * FETCH SERVICES + PROMOTIONS
   * ============================================================
   */

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
            (service: Service) => service.status === 'Active',
          )

        let normalizedPromotions: Promotion[] = []

        if (promotionsResponse.ok) {
          const promotionsJson = await promotionsResponse.json()

          normalizedPromotions = promotionsJson?.data ?? []
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

  /*
   * ============================================================
   * CATEGORIES + FILTER
   * ============================================================
   */

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

  const activePromoCount = promotions.filter(
    (promotion) =>
      promotion.target_type === 'Service' &&
      isPromotionValid(promotion),
  ).length

  const spans = useMemo(
    () => getSpans(filteredServices.length),
    [filteredServices.length],
  )

  const marqueeItems = useMemo(() => {
    const names = Array.from(
      new Set(services.map((service) => service.name)),
    )
    return names.length >= 3 ? names : DEFAULT_MARQUEE
  }, [services])

  const countByCategory = (category: string) =>
    category === 'All'
      ? services.length
      : services.filter((service) => service.category === category).length

  /*
   * ============================================================
   * MOTION
   * ============================================================
   */

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduceMotion(mq.matches)

    const onChange = (e: MediaQueryListEvent) =>
      setReduceMotion(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  /* Reveal on scroll — dijalankan ulang saat data / filter berubah */
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const items = section.querySelectorAll(
      '[data-reveal]:not(.is-visible)',
    )

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px -4% 0px' },
    )

    items.forEach((item) => observer.observe(item))
    return () => observer.disconnect()
  }, [isLoading, error, activeFilter, services.length])

  const onStageMove = (e: PointerEvent<HTMLDivElement>) => {
    if (reduceMotion || e.pointerType === 'touch') return
    const el = stageRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    el.style.setProperty('--ry', `${(x * 16).toFixed(2)}deg`)
    el.style.setProperty('--rx', `${(-y * 12).toFixed(2)}deg`)
  }

  const onStageLeave = () => {
    const el = stageRef.current
    if (!el) return
    el.style.setProperty('--ry', '0deg')
    el.style.setProperty('--rx', '0deg')
  }

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
    } catch {
      // Clipboard bisa diblokir; tetap tampilkan status.
    }

    setCopiedCode(code)
    window.setTimeout(() => {
      setCopiedCode((current) => (current === code ? null : current))
    }, 1800)
  }

  return (
    <section
      ref={sectionRef}
      className="sp relative isolate min-h-screen overflow-hidden bg-white text-zinc-950"
    >
      {/* Background */}
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
        className="sp-float pointer-events-none absolute left-[8%] top-[16%] h-2 w-2 rounded-full bg-violet-600"
      />

      <div
        aria-hidden="true"
        className="sp-float pointer-events-none absolute right-[13%] top-[38%] h-1.5 w-1.5 rounded-full bg-violet-500"
        style={{ animationDelay: '-3s' }}
      />

      <div className="relative mx-auto max-w-[1600px] px-5 pb-14 pt-[76px] sm:px-8 sm:pb-20 sm:pt-[88px] lg:px-12 lg:pb-24 lg:pt-[92px]">
        {/* Top editorial line */}
        <div
          className="sp-in mb-8 flex items-center justify-between border-b border-black/10 pb-4 sm:mb-12 sm:pb-5"
          style={delay(0)}
        >
          <div className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-[0.24em] text-zinc-500 sm:text-xs">
            <span className="text-zinc-950">39Production</span>
            <span className="sp-blink h-1 w-1 rounded-full bg-violet-600" />
            <span>Services</span>
          </div>

          <div className="hidden items-center gap-4 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400 sm:flex">
            <span>Digital</span>
            <span>/</span>
            <span>Creative</span>
            <span>/</span>
            <span>Entertainment</span>
          </div>
        </div>

        {/* ============================ HERO ============================ */}
        <div className="relative grid items-center gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          <div className="relative z-10">
            <div
              className="sp-in mb-5 flex flex-wrap items-center gap-3 sm:mb-6"
              style={delay(80)}
            >
              <span className="inline-flex items-center gap-2 border border-violet-200 bg-violet-50 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-violet-700 sm:text-[10px]">
                <Sparkles className="h-3.5 w-3.5" />
                What We Build
              </span>

              <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400 sm:text-[10px]">
                07 Disciplines
              </span>
            </div>

            <h1 className="max-w-5xl text-[clamp(3rem,8vw,7.6rem)] font-black leading-[0.86] tracking-[-0.065em]">
              <span className="block overflow-hidden pb-[0.05em]">
                <span className="sp-up block text-zinc-950" style={delay(160)}>
                  Build
                </span>
              </span>
              <span className="block overflow-hidden pb-[0.05em]">
                <span className="sp-up block text-zinc-300" style={delay(260)}>
                  <span className="relative inline-block">
                    what matters.
                    <span
                      aria-hidden="true"
                      className="sp-draw absolute bottom-[0.02em] left-0 right-0 h-[0.07em] bg-violet-600"
                    />
                  </span>
                </span>
              </span>
            </h1>

            <div
              className="sp-in mt-6 max-w-2xl border-l-2 border-violet-600 pl-4 sm:mt-8 sm:pl-5"
              style={delay(380)}
            >
              <p className="text-sm leading-6 text-zinc-600 sm:text-base sm:leading-7 lg:text-lg">
                From digital products to creative experiences, we bring
                different disciplines into one production team.
              </p>
            </div>

            {/* Statistik */}
            <div
              className="sp-in mt-6 grid max-w-xl grid-cols-3 border-t border-black/10 sm:mt-8"
              style={delay(460)}
            >
              {[
                {
                  value: services.length,
                  label: 'Active Services',
                },
                {
                  value: Math.max(categories.length - 1, 0),
                  label: 'Categories',
                },
                {
                  value: activePromoCount,
                  label: 'Live Offers',
                },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  className={`pt-3 ${i > 0 ? 'border-l border-black/10 pl-4' : ''
                    }`}
                >
                  <p className="font-mono text-2xl font-black tracking-[-0.05em] text-violet-600 sm:text-3xl">
                    {String(stat.value).padStart(2, '0')}
                  </p>
                  <p className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.16em] text-zinc-400 sm:text-[9px]">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ---------------- STAGE 3D ---------------- */}
          <div
            ref={stageRef}
            onPointerMove={onStageMove}
            onPointerLeave={onStageLeave}
            className="sp-in sp-stage relative h-[290px] sm:h-[380px] lg:h-[480px]"
            style={delay(200)}
          >
            <div className="sp-tilt absolute inset-0">
              {/* Bingkai */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 border border-black/[0.07]"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-3 font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-400"
              >
                Fig.39 / Layers
              </span>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute bottom-3 right-3 font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-400"
              >
                Strategy → Design → Build
              </span>

              {/* Tumpukan layer isometrik */}
              <div
                aria-hidden="true"
                className="absolute left-1/2 top-1/2 -ml-[85px] -mt-[60px] sm:-ml-[110px] sm:-mt-[70px] lg:-ml-[140px] lg:-mt-[90px]"
              >
                <div className="sp-iso">
                  <span className="sp-shadow" />
                  <div className="sp-layer" style={{ ['--i' as string]: 0 }}>
                    <em>Entertainment</em>
                  </div>
                  <div className="sp-layer" style={{ ['--i' as string]: 1 }}>
                    <em>Creative</em>
                  </div>
                  <div className="sp-layer" style={{ ['--i' as string]: 2 }}>
                    <em>Design</em>
                  </div>
                  <div className="sp-layer" style={{ ['--i' as string]: 3 }}>
                    <em>Digital</em>
                    <strong>39</strong>
                  </div>
                </div>
              </div>

              {/* Kubus */}
              <div
                aria-hidden="true"
                className="sp-z-a pointer-events-none absolute right-[6%] top-[9%]"
              >
                <div className="sp-float-slow">
                  <div className="sp-cube">
                    <i className="sp-f1">39</i>
                    <i className="sp-f2" />
                    <i className="sp-f3">P</i>
                    <i className="sp-f4" />
                    <i className="sp-f5" />
                    <i className="sp-f6" />
                  </div>
                </div>
              </div>

              {/* Bola */}
              <div
                aria-hidden="true"
                className="sp-z-b pointer-events-none absolute left-[7%] top-[22%]"
              >
                <div className="sp-float" style={{ animationDelay: '-2s' }}>
                  <div className="sp-sphere" />
                </div>
              </div>

              {/* Kartu harga melayang */}
              <div
                aria-hidden="true"
                className="sp-z-c pointer-events-none absolute bottom-[8%] left-[4%]"
              >
                <div className="sp-float" style={{ animationDelay: '-3.5s' }}>
                  <div className="sp-plane border border-black bg-white px-3 py-2.5 shadow-[8px_8px_0_0_rgba(124,58,237,0.9)] sm:px-4 sm:py-3">
                    <p className="font-mono text-[7px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                      Ready to order
                    </p>
                    <div className="mt-1 flex items-end gap-2">
                      <span className="font-mono text-xl font-black tracking-[-0.05em] text-violet-600 sm:text-2xl">
                        {String(services.length).padStart(2, '0')}
                      </span>
                      <span className="pb-1 text-[9px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                        services
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Equalizer */}
              <div
                aria-hidden="true"
                className="sp-z-c pointer-events-none absolute bottom-[10%] right-[6%] flex h-8 items-end gap-[3px]"
              >
                {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                  <span
                    key={i}
                    className="sp-eq w-[3px] bg-violet-600"
                    style={{ height: '100%', animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ============================ MARQUEE ============================ */}
        <div
          aria-hidden="true"
          className="sp-in mt-8 overflow-hidden border-y border-black/10 py-2.5 sm:mt-12"
          style={delay(520)}
        >
          <div className="sp-marquee flex w-max items-center gap-8 whitespace-nowrap">
            {[0, 1].map((copy) => (
              <div key={copy} className="flex items-center gap-8">
                {[...marqueeItems, ...marqueeItems].map((item, i) => (
                  <span key={`${copy}-${i}`} className="flex items-center gap-8">
                    <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-400">
                      {item}
                    </span>
                    <span className="h-1 w-1 bg-violet-600" />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ======================= SECTION HEADING ======================= */}
        <div
          data-reveal
          className="sp-rv mt-10 flex flex-col justify-between gap-4 sm:mt-14 sm:flex-row sm:items-end"
        >
          <div>
            <div className="mb-3 flex items-center gap-3">
              <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-violet-600 sm:text-[10px]">
                01
              </span>

              <span className="h-px w-8 bg-violet-600 sm:w-10" />

              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400 sm:text-[10px]">
                Our Capabilities
              </span>
            </div>

            <h2 className="text-3xl font-black tracking-[-0.045em] sm:text-5xl">
              Different disciplines.
              <span className="ml-2 text-zinc-300">One team.</span>
            </h2>
          </div>

          <Link
            to="/contact"
            className="group inline-flex w-fit items-center gap-3 border-b border-black pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-950 transition-colors hover:border-violet-600 hover:text-violet-600 sm:text-xs"
          >
            Discuss a Project

            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Category navigation */}
        <div
          data-reveal
          className="sp-rv mt-5 border-y border-black/10 py-3 sm:mt-6 sm:py-4"
        >
          <div className="sp-scroll flex items-center gap-2 overflow-x-auto pb-1">
            <span className="mr-2 shrink-0 text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400 sm:mr-3 sm:text-[10px]">
              Explore
            </span>

            {categories.map((category) => {
              const isActive = activeFilter === category

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveFilter(category)}
                  className={`relative flex shrink-0 items-center gap-2 px-3.5 py-2 text-[10px] font-bold transition-all duration-300 sm:px-4 sm:text-xs ${isActive
                    ? 'bg-violet-600 text-white'
                    : 'text-zinc-500 hover:bg-violet-50 hover:text-violet-700'
                    }`}
                >
                  {category}

                  <span
                    className={`font-mono text-[9px] ${isActive ? 'text-white/70' : 'text-zinc-400'
                      }`}
                  >
                    {String(countByCategory(category)).padStart(2, '0')}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="mt-5 sm:mt-6">
            <div className="mb-3 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500 sm:text-xs">
              <Loader2 className="h-4 w-4 animate-spin text-violet-600" />
              Loading services
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="sp-skeleton h-[300px] border border-black/10 bg-neutral-50 sm:h-[380px]"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {!isLoading && error && (
          <div className="mt-5 border border-red-200 bg-red-50 px-5 py-5 text-sm text-red-700 sm:mt-6 sm:px-6">
            {error}
          </div>
        )}

        {/* Empty */}
        {!isLoading &&
          !error &&
          filteredServices.length === 0 && (
            <div className="mt-5 border border-black/10 bg-neutral-50 px-6 py-14 text-center sm:mt-6 sm:py-16">
              <Briefcase className="mx-auto h-7 w-7 text-violet-600" />

              <h3 className="mt-5 text-xl font-black tracking-tight">
                No services found
              </h3>

              <p className="mt-2 text-sm text-zinc-500">
                Try another category.
              </p>
            </div>
          )}

        {/* ========================== SERVICES ========================== */}
        {!isLoading &&
          !error &&
          filteredServices.length > 0 && (
            <div
              key={activeFilter}
              className="mt-5 grid grid-cols-1 gap-3 sm:mt-6 sm:grid-cols-2 sm:gap-4 lg:grid-cols-12"
            >
              {filteredServices.map((service, index) => {
                const span = spans[index]
                const isLastOdd =
                  index === filteredServices.length - 1 &&
                  filteredServices.length % 2 === 1

                return (
                  <div
                    key={service.id}
                    data-reveal
                    style={delay((index % 3) * 90)}
                    className={`sp-rv h-full ${SPAN_CLASS[span]} ${isLastOdd ? 'sm:col-span-2' : ''
                      }`}
                  >
                    <ServiceCard
                      service={service}
                      index={index}
                      promotion={getServicePromotion(service, promotions)}
                      wide={span >= 6}
                      copied={
                        copiedCode ===
                        getServicePromotion(service, promotions)?.code
                      }
                      onCopy={copyCode}
                    />
                  </div>
                )
              })}
            </div>
          )}

        {/* Promotion note */}
        {!isLoading &&
          !error &&
          hasActiveServicePromotion && (
            <div
              data-reveal
              className="sp-rv mt-6 grid border border-violet-200 bg-violet-50 sm:mt-8 lg:grid-cols-[auto_1fr_auto]"
            >
              <div className="relative flex items-center justify-center overflow-hidden bg-violet-600 p-4 text-white sm:p-5">
                <span className="sp-shine-loop pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/25" />
                <Tag className="relative h-5 w-5" />
              </div>

              <div className="px-5 py-4 sm:px-6 sm:py-5">
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-violet-700 sm:text-[10px]">
                  Current Offers
                </p>

                <p className="mt-1 text-xs leading-5 text-violet-900/80 sm:text-sm sm:leading-6">
                  Selected services currently have active promotional offers.
                  Check each service for its available code and terms.
                </p>
              </div>

              <div className="flex items-center px-5 pb-4 sm:px-6 lg:pb-0">
                <Link
                  to="/promotions"
                  className="group inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-violet-700 sm:text-xs"
                >
                  View Promotions

                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          )}

        {/* ============================ CTA ============================ */}
        <div
          data-reveal
          className="sp-rv relative mt-12 overflow-hidden bg-black px-6 py-9 text-white sm:mt-20 sm:px-10 sm:py-12 lg:px-14 lg:py-14"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-[-3rem] top-1/2 -translate-y-1/2 text-[10rem] font-black leading-none tracking-[-0.12em] text-white/[0.035] sm:text-[15rem]"
          >
            39
          </div>

          {/* Kubus 3D pada CTA */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-8 top-8 hidden lg:block"
            style={{ perspective: '800px' }}
          >
            <div className="sp-float-slow">
              <div className="sp-cube sp-cube-dark">
                <i className="sp-f1">39</i>
                <i className="sp-f2" />
                <i className="sp-f3">P</i>
                <i className="sp-f4" />
                <i className="sp-f5" />
                <i className="sp-f6" />
              </div>
            </div>
          </div>

          <div className="relative grid gap-7 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-10">
            <div>
              <div className="mb-5 flex flex-wrap items-center gap-3">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-violet-400 sm:text-[10px]">
                  39Production
                </span>

                <span className="h-px w-8 bg-violet-500 sm:w-10" />

                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/35 sm:text-[10px]">
                  Start Something Worth Making
                </span>
              </div>

              <h2 className="max-w-4xl text-3xl font-black leading-[0.95] tracking-[-0.05em] sm:text-6xl lg:text-7xl">
                Have something
                <span className="block text-violet-400">
                  different in mind?
                </span>
              </h2>

              <p className="mt-5 max-w-xl text-xs leading-6 text-white/55 sm:mt-6 sm:text-base">
                Tell us what you want to build. We’ll help shape the idea,
                define the scope and find the right production approach.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 sm:flex-row lg:flex-col">
              <Link
                to="/contact"
                className="group relative inline-flex items-center justify-center gap-3 overflow-hidden bg-violet-600 px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.14em] text-white transition-all duration-300 hover:bg-violet-500 sm:px-6 sm:py-4 sm:text-xs"
              >
                <span className="sp-shine-loop pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/20" />
                <span className="relative">Start a Project</span>

                <ArrowUpRight className="relative h-4 w-4 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
              </Link>

              <Link
                to="/portfolio"
                className="group inline-flex items-center justify-center gap-3 border border-white/15 px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.14em] text-white/75 transition-all duration-300 hover:border-violet-400 hover:text-violet-300 sm:px-6 sm:py-4 sm:text-xs"
              >
                See Our Work

                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>

        {/* Signature */}
        <div className="mt-6 flex flex-col justify-between gap-3 border-t border-black/10 pt-5 text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-400 sm:mt-7 sm:flex-row sm:items-center sm:text-[9px]">
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
        .sp .sp-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        .sp .sp-scroll::-webkit-scrollbar { display: none; }

        /* ---------- Reveal ---------- */
        @keyframes sp-in {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .sp .sp-in {
          opacity: 0;
          animation: sp-in .85s cubic-bezier(.22,1,.36,1) var(--d, 0ms) forwards;
        }

        .sp .sp-rv {
          opacity: 0;
          transform: translate3d(0, 28px, 0);
          transition:
            opacity .85s cubic-bezier(.2,.7,.2,1) var(--d, 0ms),
            transform .85s cubic-bezier(.2,.7,.2,1) var(--d, 0ms);
        }
        .sp .sp-rv.is-visible { opacity: 1; transform: none; }

        @keyframes sp-up {
          from { transform: translateY(105%); }
          to   { transform: translateY(0); }
        }
        .sp .sp-up {
          transform: translateY(105%);
          animation: sp-up .95s cubic-bezier(.22,1,.36,1) var(--d, 0ms) forwards;
        }
        @keyframes sp-draw { to { transform: scaleX(1); } }
        .sp .sp-draw {
          transform: scaleX(0);
          transform-origin: left;
          animation: sp-draw .9s cubic-bezier(.77,0,.18,1) 1.1s forwards;
        }

        /* ---------- Floating ---------- */
        @keyframes sp-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        .sp .sp-float { animation: sp-float 6s ease-in-out infinite; }
        .sp .sp-float-slow { animation: sp-float 9s ease-in-out infinite; }

        @keyframes sp-blink { 0%,100% { opacity: 1; } 50% { opacity: .25; } }
        .sp .sp-blink { animation: sp-blink 2s ease-in-out infinite; }

        @keyframes sp-marquee { to { transform: translateX(-50%); } }
        .sp .sp-marquee { animation: sp-marquee 42s linear infinite; }

        /* ---------- Stage 3D ---------- */
        .sp .sp-stage { perspective: 1100px; }
        .sp .sp-tilt {
          transform-style: preserve-3d;
          transform: rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg));
          transition: transform .35s cubic-bezier(.22,1,.36,1);
        }
        .sp .sp-z-a { transform: translateZ(90px); }
        .sp .sp-z-b { transform: translateZ(120px); }
        .sp .sp-z-c { transform: translateZ(60px); }

        /* Tumpukan layer isometrik */
        .sp .sp-iso {
          --size: 170px;
          position: relative;
          width: var(--size);
          height: var(--size);
          transform-style: preserve-3d;
          transform: rotateX(58deg) rotateZ(-38deg);
        }
        @media (min-width: 640px) { .sp .sp-iso { --size: 220px; } }
        @media (min-width: 1024px) { .sp .sp-iso { --size: 280px; } }

        .sp .sp-layer {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          padding: 10px;
          border: 1.5px solid #111;
          background: rgba(255, 255, 255, .78);
          backdrop-filter: blur(1px);
          transform: translateZ(calc(var(--i) * 34px));
          animation: sp-layer 5.5s ease-in-out infinite alternate;
          animation-delay: calc(var(--i) * -.7s);
        }
        .sp .sp-layer em {
          font-style: normal;
          font-family: ui-monospace, monospace;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: .18em;
          text-transform: uppercase;
          color: #111;
        }
        .sp .sp-layer strong {
          position: absolute;
          right: 12px; top: 6px;
          font-size: 44px;
          font-weight: 900;
          letter-spacing: -.08em;
          color: transparent;
          -webkit-text-stroke: 1.5px #7C3AED;
        }
        .sp .sp-layer:nth-of-type(2) { background: #111; border-color: #111; }
        .sp .sp-layer:nth-of-type(2) em { color: #fff; }
        .sp .sp-layer:nth-of-type(3) { background: rgba(124, 58, 237, .88); border-color: #7C3AED; }
        .sp .sp-layer:nth-of-type(3) em { color: #fff; }
        .sp .sp-layer:nth-of-type(4) { background: rgba(231, 143, 186, .88); border-color: #E78FBA; }
        @keyframes sp-layer {
          from { transform: translateZ(calc(var(--i) * 26px)); }
          to   { transform: translateZ(calc(var(--i) * 58px)); }
        }
        .sp .sp-shadow {
          position: absolute;
          inset: 0;
          background: rgba(124, 58, 237, .18);
          filter: blur(14px);
          transform: translateZ(-10px) scale(1.05);
        }

        /* Kubus */
        .sp .sp-cube {
          --s: 50px;
          position: relative;
          width: var(--s);
          height: var(--s);
          transform-style: preserve-3d;
          animation: sp-cube 16s linear infinite;
        }
        @media (min-width: 640px) { .sp .sp-cube { --s: 66px; } }
        @media (min-width: 1024px) { .sp .sp-cube { --s: 84px; } }
        @keyframes sp-cube {
          from { transform: rotateX(-24deg) rotateY(0deg); }
          to   { transform: rotateX(-24deg) rotateY(360deg); }
        }
        .sp .sp-cube i {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-style: normal;
          font-weight: 900;
          font-size: calc(var(--s) * .34);
          letter-spacing: -.06em;
          color: #7C3AED;
          border: 1.5px solid rgba(124, 58, 237, .85);
          background: rgba(124, 58, 237, .1);
        }
        .sp .sp-cube .sp-f1 { transform: translateZ(calc(var(--s) / 2)); background: rgba(255,255,255,.78); }
        .sp .sp-cube .sp-f2 { transform: rotateY(90deg) translateZ(calc(var(--s) / 2)); background: rgba(231,143,186,.4); }
        .sp .sp-cube .sp-f3 { transform: rotateY(180deg) translateZ(calc(var(--s) / 2)); background: rgba(255,255,255,.78); }
        .sp .sp-cube .sp-f4 { transform: rotateY(-90deg) translateZ(calc(var(--s) / 2)); background: rgba(124,58,237,.24); }
        .sp .sp-cube .sp-f5 { transform: rotateX(90deg) translateZ(calc(var(--s) / 2)); background: rgba(231,143,186,.5); }
        .sp .sp-cube .sp-f6 { transform: rotateX(-90deg) translateZ(calc(var(--s) / 2)); background: rgba(124,58,237,.32); }
        .sp .sp-cube-dark { --s: 76px; }
        .sp .sp-cube-dark i { color: #E78FBA; border-color: rgba(231,143,186,.7); background: rgba(124,58,237,.28); }

        /* Bola */
        .sp .sp-sphere {
          width: 32px; height: 32px;
          border-radius: 9999px;
          background: radial-gradient(circle at 30% 28%, #fbd5e6 0%, #E78FBA 38%, #7C3AED 100%);
          box-shadow: 0 14px 22px -8px rgba(124, 58, 237, .55);
        }
        @media (min-width: 640px) { .sp .sp-sphere { width: 44px; height: 44px; } }
        @media (min-width: 1024px) { .sp .sp-sphere { width: 58px; height: 58px; } }

        .sp .sp-plane { transform: rotateY(16deg) rotateX(6deg); }

        @keyframes sp-eq { 0%,100% { transform: scaleY(.3); } 50% { transform: scaleY(1); } }
        .sp .sp-eq { transform-origin: bottom; animation: sp-eq 1.1s ease-in-out infinite; }

        @media (max-width: 1023px) {
          .sp .sp-z-a, .sp .sp-z-b, .sp .sp-z-c { transform: translateZ(30px); }
        }

        /* ---------- Kartu ---------- */
        .sp .sp-card {
          transform: perspective(1000px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg));
          transition:
            transform .3s cubic-bezier(.22,1,.36,1),
            border-color .5s, box-shadow .5s;
          will-change: transform;
        }
        .sp .sp-glare {
          background: radial-gradient(
            260px circle at var(--gx, 50%) var(--gy, 0%),
            rgba(124, 58, 237, .12),
            transparent 65%
          );
        }

        @keyframes sp-kb {
          from { transform: scale(1); }
          to   { transform: scale(1.08); }
        }
        .sp .sp-kb { animation: sp-kb 14s ease-in-out infinite alternate; }

        @keyframes sp-shine {
          0% { left: -50%; opacity: 0; }
          30% { opacity: 1; }
          100% { left: 130%; opacity: 0; }
        }
        .sp .group:hover .sp-shine { animation: sp-shine .9s ease-out; }
        .sp .sp-shine-loop { animation: sp-shine 3.4s ease-in-out infinite; }

        @keyframes sp-stamp {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(2deg) translateY(-2px); }
        }
        .sp .sp-stamp { animation: sp-stamp 3.2s ease-in-out infinite; }

        @keyframes sp-art-drift {
          from { transform: translate3d(0, 0, 0); }
          to   { transform: translate3d(8px, -8px, 0); }
        }
        .sp .sp-art-a { animation: sp-art-drift 9s ease-in-out infinite alternate; }

        @keyframes sp-art-bar { 0%,100% { transform: scaleY(.55); } 50% { transform: scaleY(1); } }
        .sp .sp-art-bar {
          transform-box: fill-box;
          transform-origin: bottom;
          animation: sp-art-bar 2.4s ease-in-out infinite;
        }

        @keyframes sp-skeleton {
          0%, 100% { opacity: .55; }
          50% { opacity: 1; }
        }
        .sp .sp-skeleton { animation: sp-skeleton 1.4s ease-in-out infinite; }

        @media (prefers-reduced-motion: reduce) {
          .sp *, .sp *::before, .sp *::after {
            scroll-behavior: auto !important;
            transition-duration: 0.01ms !important;
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
          }
          .sp .sp-in, .sp .sp-rv, .sp .sp-up {
            opacity: 1 !important;
            transform: none !important;
          }
          .sp .sp-draw { transform: scaleX(1) !important; }
          .sp .sp-tilt, .sp .sp-card { transform: none !important; }
        }
      `}</style>
    </section>
  )
}

export default ServicesPage