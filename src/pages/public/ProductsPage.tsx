import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, PointerEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ArrowUpRight,
  Loader2,
  Package,
  Tag,
  Sparkles,
} from 'lucide-react'

const API_BASE_URL =
  'https://39production-api.39production.workers.dev'

const SITE_URL = 'https://39production.digital'
const PAGE_URL = `${SITE_URL}/products`

interface Product {
  id: number
  name: string
  category: string
  description: string
  price: number
  stock: number
  status: 'Published' | 'Draft'
  image_url?: string | null
  created_at?: string
  updated_at?: string
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

/* =========================================================
   SEO
========================================================= */

function upsertMeta(
  selector: string,
  attributes: Record<string, string>,
) {
  let element = document.head.querySelector(
    selector,
  ) as HTMLMetaElement | null

  if (!element) {
    element = document.createElement('meta')

    Object.entries(attributes).forEach(
      ([key, value]) => {
        element?.setAttribute(key, value)
      },
    )

    element.dataset.seoPage = 'products'
    document.head.appendChild(element)
  } else {
    Object.entries(attributes).forEach(
      ([key, value]) => {
        element?.setAttribute(key, value)
      },
    )
  }

  return element
}

function upsertLink(
  selector: string,
  attributes: Record<string, string>,
) {
  let element = document.head.querySelector(
    selector,
  ) as HTMLLinkElement | null

  if (!element) {
    element = document.createElement('link')

    Object.entries(attributes).forEach(
      ([key, value]) => {
        element?.setAttribute(key, value)
      },
    )

    element.dataset.seoPage = 'products'
    document.head.appendChild(element)
  } else {
    Object.entries(attributes).forEach(
      ([key, value]) => {
        element?.setAttribute(key, value)
      },
    )
  }

  return element
}

function setProductsSEO(products: Product[]) {
  const title =
    'Digital Products & Creative Assets | 39Production'

  const description =
    'Explore digital products, creative assets, and production-ready digital works from 39Production for creators, brands, businesses, and modern digital experiences.'

  const keywords =
    'digital products, creative digital products, digital assets, creative assets, website templates, design assets, 39Production, digital production, creative production, Indonesia'

  document.title = title

  document.documentElement.lang = 'en'

  /* BASIC META */

  upsertMeta('meta[name="description"]', {
    name: 'description',
    content: description,
  })

  upsertMeta('meta[name="keywords"]', {
    name: 'keywords',
    content: keywords,
  })

  upsertMeta('meta[name="robots"]', {
    name: 'robots',
    content:
      'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
  })

  upsertMeta('meta[name="author"]', {
    name: 'author',
    content: '39Production',
  })

  upsertMeta('meta[name="application-name"]', {
    name: 'application-name',
    content: '39Production',
  })

  upsertMeta('meta[name="theme-color"]', {
    name: 'theme-color',
    content: '#ffffff',
  })

  /* CANONICAL */

  upsertLink('link[rel="canonical"]', {
    rel: 'canonical',
    href: PAGE_URL,
  })

  /* OPEN GRAPH */

  upsertMeta('meta[property="og:type"]', {
    property: 'og:type',
    content: 'website',
  })

  upsertMeta('meta[property="og:url"]', {
    property: 'og:url',
    content: PAGE_URL,
  })

  upsertMeta('meta[property="og:title"]', {
    property: 'og:title',
    content: title,
  })

  upsertMeta('meta[property="og:description"]', {
    property: 'og:description',
    content: description,
  })

  upsertMeta('meta[property="og:site_name"]', {
    property: 'og:site_name',
    content: '39Production',
  })

  upsertMeta('meta[property="og:locale"]', {
    property: 'og:locale',
    content: 'en_US',
  })

  upsertMeta('meta[property="og:image"]', {
    property: 'og:image',
    content: `${SITE_URL}/og-products.jpg`,
  })

  upsertMeta('meta[property="og:image:alt"]', {
    property: 'og:image:alt',
    content:
      '39Production digital products and creative assets',
  })

  /* TWITTER / X */

  upsertMeta('meta[name="twitter:card"]', {
    name: 'twitter:card',
    content: 'summary_large_image',
  })

  upsertMeta('meta[name="twitter:title"]', {
    name: 'twitter:title',
    content: title,
  })

  upsertMeta('meta[name="twitter:description"]', {
    name: 'twitter:description',
    content: description,
  })

  upsertMeta('meta[name="twitter:image"]', {
    name: 'twitter:image',
    content: `${SITE_URL}/og-products.jpg`,
  })

  /* JSON-LD */

  const existingSchema = document.head.querySelector(
    'script[data-seo-page="products"]',
  )

  if (existingSchema) {
    existingSchema.remove()
  }

  const itemList = products.map(
    (product, index) => {
      const productUrl =
        `${SITE_URL}/products/${product.id}`

      const item: Record<string, unknown> = {
        '@type': 'ListItem',
        position: index + 1,
        url: productUrl,
        name: product.name,
      }

      if (product.image_url) {
        item.image = product.image_url
      }

      return item
    },
  )

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description,
    url: PAGE_URL,
    isPartOf: {
      '@type': 'WebSite',
      name: '39Production',
      url: SITE_URL,
    },
    about: {
      '@type': 'Thing',
      name: 'Digital Products',
    },
    mainEntity: {
      '@type': 'ItemList',
      name: '39Production Digital Products',
      numberOfItems: products.length,
      itemListElement: itemList,
    },
  }

  const script =
    document.createElement('script')

  script.type = 'application/ld+json'
  script.dataset.seoPage = 'products'
  script.textContent = JSON.stringify(schema)

  document.head.appendChild(script)
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(price)
}

function isPromotionValid(p: Promotion) {
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
  }).format(new Date())

  return (
    p.status === 'Active' &&
    p.start_date <= today &&
    p.end_date >= today
  )
}

function getDiscount(
  product: Product,
  promotion: Promotion | null,
) {
  if (!promotion) {
    return 0
  }

  if (promotion.discount_type === 'Percentage') {
    return Math.min(
      product.price,
      Math.round(
        product.price *
        (Number(promotion.discount_value) / 100),
      ),
    )
  }

  return Math.min(
    product.price,
    Number(promotion.discount_value),
  )
}

function discountLabel(promotion: Promotion) {
  return promotion.discount_type === 'Percentage'
    ? `${promotion.discount_value}% OFF`
    : `Save ${formatPrice(
      Number(promotion.discount_value),
    )}`
}

/* ------------------------------------------------------------------ */
/* Gambar dummy lokal (SVG) — dipakai bila image_url kosong / gagal    */
/* ------------------------------------------------------------------ */
function PlaceholderArt({ seed }: { seed: string }) {
  const variant =
    Array.from(seed).reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % 4
  const id = `pp-${variant}-${seed.replace(/[^a-z0-9]/gi, '').slice(0, 8)}`

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 400 260"
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

      <rect width="400" height="260" fill="#0d0820" />
      <rect width="400" height="260" fill={`url(#${id}-a)`} />
      <rect width="400" height="260" fill={`url(#${id}-b)`} />
      <rect width="400" height="260" fill={`url(#${id}-g)`} />

      {variant === 0 && (
        <g className="pp-art-a">
          {[110, 76, 44].map((r, i) => (
            <circle key={r} cx="290" cy="110" r={r} fill="none" stroke="#fff" strokeOpacity={0.1 + i * 0.08} />
          ))}
          <circle cx="290" cy="110" r="18" fill="#7C3AED" />
          <circle cx="338" cy="60" r="5" fill="#E78FBA" />
          <rect x="36" y="160" width="110" height="6" fill="#fff" opacity="0.25" />
          <rect x="36" y="174" width="72" height="6" fill="#fff" opacity="0.15" />
        </g>
      )}

      {variant === 1 && (
        <g>
          {Array.from({ length: 14 }).map((_, i) => {
            const h = 36 + ((i * 53) % 110)
            return (
              <rect
                key={i}
                x={36 + i * 24}
                y={216 - h}
                width="13"
                height={h}
                fill={i % 5 === 0 ? '#E78FBA' : '#7C3AED'}
                opacity={0.35 + (i % 4) * 0.15}
                className="pp-art-bar"
                style={{ animationDelay: `${(i % 8) * 0.22}s` }}
              />
            )
          })}
          <rect x="36" y="222" width="330" height="1" fill="#fff" opacity="0.25" />
        </g>
      )}

      {variant === 2 && (
        <g className="pp-art-a">
          <rect x="52" y="44" width="296" height="160" fill="none" stroke="#fff" strokeOpacity="0.2" />
          <rect x="52" y="44" width="296" height="20" fill="#fff" opacity="0.08" />
          <circle cx="64" cy="54" r="3" fill="#E78FBA" />
          <rect x="66" y="78" width="116" height="60" fill="#7C3AED" opacity="0.75" />
          <rect x="194" y="78" width="138" height="28" fill="#fff" opacity="0.14" />
          <rect x="194" y="114" width="88" height="24" fill="#E78FBA" opacity="0.6" />
          <rect x="66" y="152" width="266" height="7" fill="#fff" opacity="0.16" />
          <rect x="66" y="167" width="180" height="7" fill="#fff" opacity="0.1" />
        </g>
      )}

      {variant === 3 && (
        <g className="pp-art-a">
          {Array.from({ length: 8 }).map((_, i) => (
            <path
              key={i}
              d={`M-20 ${160 + i * 10} C 80 ${100 + i * 6}, 180 ${210 - i * 6}, 420 ${120 + i * 9}`}
              fill="none"
              stroke={i % 3 === 0 ? '#E78FBA' : '#7C3AED'}
              strokeOpacity={0.25 + i * 0.08}
              strokeWidth="1.5"
            />
          ))}
          <circle cx="96" cy="76" r="28" fill="#7C3AED" opacity="0.85" />
          <circle cx="108" cy="68" r="28" fill="none" stroke="#fff" strokeOpacity="0.35" />
        </g>
      )}

      <text
        x="30"
        y="244"
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

function ProductImage({
  src,
  alt,
  seed,
  eager,
}: {
  src?: string | null
  alt: string
  seed: string
  eager: boolean
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
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setFailed(true)}
      onLoad={(e) => {
        if (e.currentTarget.naturalWidth === 0) setFailed(true)
      }}
      className="pp-kb absolute inset-0 h-full w-full object-cover"
    />
  )
}

/* ------------------------------------------------------------------ */
/* Kartu produk — tilt 3D mengikuti kursor                             */
/* ------------------------------------------------------------------ */
function ProductCard({
  product,
  index,
  promotion,
  wide,
}: {
  product: Product
  index: number
  promotion: Promotion | null
  wide: boolean
}) {
  const ref = useRef<HTMLAnchorElement | null>(null)

  const discount = getDiscount(product, promotion)
  const finalPrice = Math.max(0, product.price - discount)
  const isAvailable = product.stock > 0
  const isLow = isAvailable && product.stock <= 5

  const onMove = (e: PointerEvent<HTMLAnchorElement>) => {
    if (e.pointerType === 'touch') return
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    el.style.setProperty('--ry', `${((x - 0.5) * 8).toFixed(2)}deg`)
    el.style.setProperty('--rx', `${((0.5 - y) * 8).toFixed(2)}deg`)
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
    <Link
      ref={ref}
      to={`/products/${product.id}`}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="pp-card group relative flex h-full overflow-hidden border border-black/10 bg-white transition-[border-color,box-shadow] duration-500 hover:border-violet-400 hover:shadow-[8px_8px_0_0_rgba(124,58,237,0.9)] sm:flex-col"
    >
      {/* Aksen */}
      <div className="absolute left-0 top-0 z-30 h-0.5 w-0 bg-violet-600 transition-all duration-700 group-hover:w-full" />

      {/* Glare */}
      <div className="pp-glare pointer-events-none absolute inset-0 z-20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Visual */}
      <div
        className={`relative w-[112px] shrink-0 overflow-hidden bg-[#0d0820] sm:w-full ${wide ? 'sm:h-48 lg:h-60' : 'sm:h-44 lg:h-52'
          }`}
      >
        <ProductImage
          src={product.image_url}
          alt={`${product.name} — 39Production digital product`}
          seed={product.name}
          eager={index < 2}
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-black/15" />
        <div className="pp-shine pointer-events-none absolute inset-y-0 -left-1/2 z-10 w-1/3 -skew-x-12 bg-white/20 opacity-0" />

        <span className="absolute left-2.5 top-2.5 z-10 bg-black/65 px-2 py-1 font-mono text-[7px] font-black uppercase tracking-[0.14em] text-white backdrop-blur-sm sm:left-4 sm:top-4 sm:border sm:border-white/25 sm:px-3 sm:py-1.5 sm:text-[9px] sm:tracking-[0.18em]">
          <span className="hidden sm:inline">Product </span>
          {String(index + 1).padStart(2, '0')}
        </span>

        <span className="absolute bottom-4 left-4 z-10 hidden border border-white/25 bg-black/55 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-md sm:inline-flex">
          {product.category}
        </span>

        {promotion && (
          <span className="pp-stamp absolute bottom-2.5 left-2.5 z-10 inline-flex items-center gap-1 bg-violet-600 px-2 py-1 text-[7px] font-black uppercase tracking-[0.08em] text-white shadow-[3px_3px_0_0_rgba(0,0,0,0.85)] sm:bottom-auto sm:left-auto sm:right-4 sm:top-4 sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-[10px] sm:tracking-[0.12em]">
            <Tag className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            {discountLabel(promotion)}
          </span>
        )}

        <div className="absolute bottom-4 right-4 z-10 hidden h-10 w-10 items-center justify-center border border-white/25 bg-black/55 text-white backdrop-blur-md transition-all duration-300 group-hover:border-violet-400 group-hover:bg-violet-600 sm:flex">
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </div>
      </div>

      {/* Isi */}
      <div className="relative flex min-w-0 flex-1 flex-col justify-between p-3.5 sm:p-5 lg:p-6">
        <div className="min-w-0">
          <div className="flex items-center justify-between gap-3">
            <span className="truncate text-[8px] font-black uppercase tracking-[0.15em] text-violet-600 sm:text-[9px] sm:tracking-[0.2em]">
              <span className="sm:hidden">{product.category}</span>
              <span className="hidden sm:inline">Digital Product</span>
            </span>

            {isAvailable ? (
              <span
                className={`inline-flex shrink-0 items-center gap-1.5 text-[7px] font-bold uppercase tracking-[0.12em] sm:text-[9px] sm:tracking-[0.15em] ${isLow ? 'text-amber-600' : 'text-green-600'
                  }`}
              >
                <span
                  className={`pp-blink h-1.5 w-1.5 rounded-full ${isLow ? 'bg-amber-500' : 'bg-green-500'
                    }`}
                />
                {isLow ? `Only ${product.stock} left` : 'Available'}
              </span>
            ) : (
              <span className="shrink-0 text-[7px] font-bold uppercase tracking-[0.12em] text-red-500 sm:text-[9px] sm:tracking-[0.15em]">
                Out of Stock
              </span>
            )}
          </div>

          <h3 className="mt-1.5 line-clamp-2 pr-2 text-[15px] font-black leading-[1.05] tracking-[-0.035em] text-zinc-950 transition-all duration-500 group-hover:translate-x-1 group-hover:text-violet-700 sm:mt-3 sm:text-2xl sm:leading-[1] sm:tracking-[-0.045em]">
            {product.name}
          </h3>

          <p className="mt-1.5 line-clamp-1 text-[10px] leading-4 text-zinc-400 sm:mt-3 sm:line-clamp-3 sm:text-sm sm:leading-6 sm:text-zinc-500">
            {product.description}
          </p>
        </div>

        {/* Info promo (desktop) */}
        {promotion && (
          <div className="mt-4 hidden items-center justify-between gap-3 border border-dashed border-violet-400 bg-violet-50 px-3 py-2.5 sm:flex">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center bg-violet-600 text-white">
                <Tag className="h-3 w-3" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[9px] font-black uppercase tracking-[0.14em] text-violet-700">
                  {promotion.title}
                </span>
                <span className="block truncate font-mono text-[10px] font-bold text-violet-700/80">
                  Code: {promotion.code}
                </span>
              </span>
            </div>
          </div>
        )}

        {/* Harga */}
        <div className="mt-2 border-black/10 sm:mt-5 sm:border-t sm:pt-4">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="hidden text-[9px] font-bold uppercase tracking-[0.16em] text-zinc-400 sm:block">
                {promotion ? 'Promotional Price' : 'Product Price'}
              </p>

              {promotion ? (
                <div className="flex flex-wrap items-baseline gap-x-2 sm:mt-1">
                  <span className="text-[13px] font-black tracking-tight text-violet-600 sm:text-2xl">
                    {formatPrice(finalPrice)}
                  </span>
                  <span className="text-[8px] text-zinc-400 line-through sm:text-xs">
                    {formatPrice(product.price)}
                  </span>
                </div>
              ) : (
                <p className="text-[13px] font-black tracking-tight text-zinc-950 sm:mt-1 sm:text-2xl">
                  {formatPrice(product.price)}
                </p>
              )}
            </div>

            <span className="hidden items-center gap-2 border-b border-black pb-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-zinc-950 transition-colors group-hover:border-violet-600 group-hover:text-violet-600 sm:inline-flex">
              Explore Product
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </span>

            <span className="flex h-7 w-7 shrink-0 items-center justify-center border border-black/10 text-zinc-500 transition-all group-hover:border-violet-600 group-hover:bg-violet-600 group-hover:text-white sm:hidden">
              <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

/* ============================================================
   PAGE
============================================================ */
export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [promotionLoading, setPromotionLoading] =
    useState(true)
  const [error, setError] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')
  const [reduceMotion, setReduceMotion] = useState(false)

  const sectionRef = useRef<HTMLElement | null>(null)
  const stageRef = useRef<HTMLDivElement | null>(null)

  /* =========================================================
     SEO INITIALIZATION
  ========================================================= */

  useEffect(() => {
    setProductsSEO([])

    return () => {
      const seoElements =
        document.head.querySelectorAll(
          '[data-seo-page="products"]',
        )

      seoElements.forEach((element) =>
        element.remove(),
      )
    }
  }, [])

  /* =========================================================
     SEO UPDATE WHEN PRODUCTS ARE LOADED
  ========================================================= */

  useEffect(() => {
    if (!loading) {
      setProductsSEO(products)
    }
  }, [products, loading])

  /* =========================================================
     FETCH PRODUCTS
  ========================================================= */

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(
          `${API_BASE_URL}/api/products`,
          {
            cache: 'no-store',
          },
        )

        if (!response.ok) {
          throw new Error(
            `Failed to load products (${response.status})`,
          )
        }

        const result = await response.json()

        if (result?.success === false) {
          throw new Error(
            result.message ||
            'Failed to load products',
          )
        }

        const data = Array.isArray(result)
          ? result
          : Array.isArray(result?.data)
            ? result.data
            : Array.isArray(result?.products)
              ? result.products
              : []

        setProducts(
          data.filter(
            (p: Product) =>
              p.status === 'Published',
          ),
        )
      } catch (err) {
        console.error(
          'Fetch products error:',
          err,
        )

        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load products.',
        )
      } finally {
        setLoading(false)
      }
    }

    void run()
  }, [])

  /* =========================================================
     FETCH PROMOTIONS
  ========================================================= */

  useEffect(() => {
    const run = async () => {
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

        const result = await response.json()

        const data = Array.isArray(result)
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

    void run()
  }, [])

  const getProductPromotion = (id: number) =>
    promotions
      .filter(
        (p) =>
          p.target_type === 'Product' &&
          Number(p.product_id) === Number(id) &&
          isPromotionValid(p),
      )
      .sort((a, b) => b.id - a.id)[0] ?? null

  /* =========================================================
     TURUNAN DATA
  ========================================================= */

  const categories = useMemo(
    () => [
      'All',
      ...Array.from(
        new Set(
          products.map((p) => p.category).filter(Boolean),
        ),
      ),
    ],
    [products],
  )

  const visibleProducts = useMemo(
    () =>
      activeFilter === 'All'
        ? products
        : products.filter((p) => p.category === activeFilter),
    [products, activeFilter],
  )

  const spans = useMemo(
    () => getSpans(visibleProducts.length),
    [visibleProducts.length],
  )

  const countByCategory = (category: string) =>
    category === 'All'
      ? products.length
      : products.filter((p) => p.category === category).length

  const liveOffers = promotions.filter(
    (p) =>
      p.target_type === 'Product' && isPromotionValid(p),
  ).length

  const lowestPrice = products.length
    ? Math.min(...products.map((p) => p.price))
    : null

  const marqueeItems = useMemo(() => {
    const names = Array.from(
      new Set(products.map((p) => p.category).filter(Boolean)),
    )
    const base = [
      'Digital Products',
      'Creative Assets',
      'Ready to Use',
      'Made by 39Production',
    ]
    return [...names, ...base]
  }, [products])

  /* =========================================================
     MOTION
  ========================================================= */

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
  }, [loading, error, activeFilter, products.length, promotionLoading])

  const onStageMove = (e: PointerEvent<HTMLDivElement>) => {
    if (reduceMotion || e.pointerType === 'touch') return
    const el = stageRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    el.style.setProperty('--ry', `${(x * 18).toFixed(2)}deg`)
    el.style.setProperty('--rx', `${(-y * 12).toFixed(2)}deg`)
  }

  const onStageLeave = () => {
    const el = stageRef.current
    if (!el) return
    el.style.setProperty('--ry', '0deg')
    el.style.setProperty('--rx', '0deg')
  }

  return (
    <section
      ref={sectionRef}
      className="pp relative isolate min-h-screen overflow-hidden bg-white text-zinc-950"
    >
      {/* =====================================================
          BACKGROUND
      ====================================================== */}

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
        className="pp-float pointer-events-none absolute left-[8%] top-[18%] h-2 w-2 rounded-full bg-violet-600"
      />

      <div
        aria-hidden="true"
        className="pp-float pointer-events-none absolute right-[13%] top-[34%] h-1.5 w-1.5 rounded-full bg-violet-500"
        style={{ animationDelay: '-3s' }}
      />

      <div className="relative mx-auto max-w-[1600px] px-4 pb-14 pt-[76px] sm:px-8 sm:pb-20 sm:pt-[88px] lg:px-12 lg:pb-24 lg:pt-[92px]">
        {/* ===================================================
            TOP EDITORIAL LINE
        ==================================================== */}

        <div
          className="pp-in mb-8 flex items-center justify-between border-b border-black/10 pb-4 sm:mb-12 sm:pb-5"
          style={delay(0)}
        >
          <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.24em] text-zinc-500 sm:text-xs">
            <span className="text-zinc-950">39Production</span>
            <span className="pp-blink h-1 w-1 rounded-full bg-violet-600" />
            <span>Products</span>
          </div>

          <div className="hidden items-center gap-4 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400 sm:flex">
            <span>Digital</span>
            <span>/</span>
            <span>Creative</span>
            <span>/</span>
            <span>Ready to Use</span>
          </div>
        </div>

        {/* ===================================================
            HERO
        ==================================================== */}

        <div className="relative grid items-center gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          <div className="relative z-10">
            <div
              className="pp-in mb-5 flex flex-wrap items-center gap-3 sm:mb-6"
              style={delay(80)}
            >
              <span className="inline-flex items-center gap-2 border border-violet-200 bg-violet-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-violet-700">
                <Sparkles className="h-3.5 w-3.5" />
                Digital Marketplace
              </span>

              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                Ready to Explore
              </span>
            </div>

            <h1 className="max-w-5xl text-[clamp(3.1rem,8vw,7.6rem)] font-black leading-[0.86] tracking-[-0.065em]">
              <span className="block overflow-hidden pb-[0.05em]">
                <span className="pp-up block text-zinc-950" style={delay(160)}>
                  Built
                </span>
              </span>
              <span className="block overflow-hidden pb-[0.05em]">
                <span className="pp-up block text-zinc-300" style={delay(260)}>
                  <span className="relative inline-block">
                    to create.
                    <span
                      aria-hidden="true"
                      className="pp-draw absolute bottom-[0.02em] left-0 right-0 h-[0.07em] bg-violet-600"
                    />
                  </span>
                </span>
              </span>
            </h1>

            <div
              className="pp-in mt-6 max-w-2xl border-l-2 border-violet-600 pl-4 sm:mt-8 sm:pl-5"
              style={delay(380)}
            >
              <p className="text-sm leading-6 text-zinc-600 sm:text-lg sm:leading-7">
                Explore digital products crafted for creators, brands and
                modern digital experiences — ready to use, adapt and make
                your own.
              </p>
            </div>

            {/* Statistik */}
            <div
              className="pp-in mt-6 grid max-w-xl grid-cols-3 border-t border-black/10 sm:mt-8"
              style={delay(460)}
            >
              {[
                { value: products.length, label: 'Products' },
                {
                  value: Math.max(categories.length - 1, 0),
                  label: 'Categories',
                },
                { value: liveOffers, label: 'Live Offers' },
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
            className="pp-in pp-stage relative h-[290px] sm:h-[380px] lg:h-[480px]"
            style={delay(200)}
          >
            <div className="pp-tilt absolute inset-0">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 border border-black/[0.07]"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-3 font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-400"
              >
                Fig.39 / Package
              </span>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute bottom-3 right-3 font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-400"
              >
                Ready to use
              </span>

              {/* Kartu produk menyebar di belakang */}
              <div
                aria-hidden="true"
                className="pp-fan pointer-events-none absolute left-1/2 top-1/2"
              >
                <div className="pp-fc pp-fc1">
                  <i />
                  <b />
                  <b />
                </div>
                <div className="pp-fc pp-fc2">
                  <i />
                  <b />
                  <b />
                </div>
                <div className="pp-fc pp-fc3">
                  <i />
                  <b />
                  <b />
                </div>
              </div>

              {/* Kotak produk 3D */}
              <div
                aria-hidden="true"
                className="pp-z-a pointer-events-none absolute left-1/2 top-1/2"
              >
                <div className="pp-box-wrap">
                  <div className="pp-box">
                    <div className="pp-bf pp-bf-front">
                      <strong>39</strong>
                      <span>Digital Product</span>
                    </div>
                    <div className="pp-bf pp-bf-back" />
                    <div className="pp-bf pp-bf-right" />
                    <div className="pp-bf pp-bf-left" />
                    <div className="pp-bf pp-bf-top" />
                    <div className="pp-bf pp-bf-bottom" />
                  </div>
                </div>
              </div>

              {/* Kubus kecil */}
              <div
                aria-hidden="true"
                className="pp-z-b pointer-events-none absolute right-[7%] top-[9%]"
              >
                <div className="pp-float-slow">
                  <div className="pp-cube">
                    <i className="pp-f1">P</i>
                    <i className="pp-f2" />
                    <i className="pp-f3">39</i>
                    <i className="pp-f4" />
                    <i className="pp-f5" />
                    <i className="pp-f6" />
                  </div>
                </div>
              </div>

              {/* Bola */}
              <div
                aria-hidden="true"
                className="pp-z-c pointer-events-none absolute bottom-[18%] right-[10%]"
              >
                <div className="pp-float" style={{ animationDelay: '-2s' }}>
                  <div className="pp-sphere" />
                </div>
              </div>

              {/* Label harga melayang */}
              <div
                aria-hidden="true"
                className="pp-z-c pointer-events-none absolute bottom-[8%] left-[4%]"
              >
                <div className="pp-float" style={{ animationDelay: '-3.5s' }}>
                  <div className="pp-plane border border-black bg-white px-3 py-2.5 shadow-[8px_8px_0_0_rgba(124,58,237,0.9)] sm:px-4 sm:py-3">
                    <p className="font-mono text-[7px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                      {lowestPrice !== null ? 'Starting at' : 'Digital products'}
                    </p>
                    <p className="mt-1 font-mono text-base font-black tracking-[-0.04em] text-violet-600 sm:text-xl">
                      {lowestPrice !== null
                        ? formatPrice(lowestPrice)
                        : 'Coming soon'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Kilau */}
              {[
                ['12%', '16%'],
                ['84%', '48%'],
                ['26%', '72%'],
                ['70%', '14%'],
              ].map(([l, t], i) => (
                <span
                  key={i}
                  aria-hidden="true"
                  className="pp-twinkle pointer-events-none absolute h-1.5 w-1.5 bg-violet-600"
                  style={{ left: l, top: t, animationDelay: `${i * 0.6}s` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ===================================================
            MARQUEE
        ==================================================== */}

        <div
          aria-hidden="true"
          className="pp-in mt-8 overflow-hidden border-y border-black/10 py-2.5 sm:mt-12"
          style={delay(520)}
        >
          <div className="pp-marquee flex w-max items-center gap-8 whitespace-nowrap">
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

        {/* ===================================================
            COLLECTION HEADING
        ==================================================== */}

        <div
          data-reveal
          className="pp-rv mt-10 flex flex-col justify-between gap-4 sm:mt-14 sm:flex-row sm:items-end"
        >
          <div>
            <div className="mb-3 flex items-center gap-3">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-violet-600">
                03
              </span>

              <span className="h-px w-10 bg-violet-600" />

              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                The Collection
              </span>
            </div>

            <h2 className="text-3xl font-black tracking-[-0.045em] sm:text-5xl">
              What you can get.
            </h2>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">
            <span className="pp-blink h-1.5 w-1.5 rounded-full bg-violet-600" />

            {visibleProducts.length}{' '}
            {visibleProducts.length === 1 ? 'Product' : 'Products'}
          </div>
        </div>

        {/* Filter kategori */}
        {!loading && !error && categories.length > 2 && (
          <div
            data-reveal
            className="pp-rv mt-5 border-y border-black/10 py-3 sm:mt-6 sm:py-4"
          >
            <div className="pp-scroll flex items-center gap-2 overflow-x-auto pb-1">
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
                    className={`flex shrink-0 items-center gap-2 px-3.5 py-2 text-[10px] font-bold transition-all duration-300 sm:px-4 sm:text-xs ${isActive
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
        )}

        {/* ===================================================
            LOADING
        ==================================================== */}

        {loading && (
          <div className="mt-5 sm:mt-6">
            <div className="mb-3 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500 sm:text-xs">
              <Loader2 className="h-4 w-4 animate-spin text-violet-600" />
              Loading products
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="pp-skeleton h-[122px] border border-black/10 bg-neutral-50 sm:h-[380px]"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* ===================================================
            ERROR
        ==================================================== */}

        {!loading && error && (
          <div className="mt-5 border border-red-200 bg-red-50 px-5 py-5 text-sm text-red-700 sm:mt-6 sm:px-6">
            {error}
          </div>
        )}

        {/* ===================================================
            EMPTY
        ==================================================== */}

        {!loading &&
          !error &&
          visibleProducts.length === 0 && (
            <div className="mt-5 border border-black/10 bg-neutral-50 px-6 py-14 text-center sm:mt-6 sm:py-16">
              <Package className="mx-auto h-7 w-7 text-violet-600" />

              <h3 className="mt-5 text-xl font-black tracking-tight">
                The collection is coming together
              </h3>

              <p className="mt-2 text-sm text-zinc-500">
                New digital products will appear here as they are published.
              </p>
            </div>
          )}

        {/* ===================================================
            PRODUCTS
        ==================================================== */}

        {!loading &&
          !error &&
          visibleProducts.length > 0 && (
            <div
              key={activeFilter}
              className="mt-5 grid grid-cols-1 gap-3 sm:mt-6 sm:grid-cols-2 sm:gap-4 lg:grid-cols-12"
            >
              {visibleProducts.map((product, index) => {
                const span = spans[index]
                const isLastOdd =
                  index === visibleProducts.length - 1 &&
                  visibleProducts.length % 2 === 1

                return (
                  <div
                    key={product.id}
                    data-reveal
                    style={delay((index % 3) * 90)}
                    className={`pp-rv h-full ${SPAN_CLASS[span]} ${isLastOdd ? 'sm:col-span-2' : ''
                      }`}
                  >
                    <ProductCard
                      product={product}
                      index={index}
                      promotion={getProductPromotion(product.id)}
                      wide={span >= 6}
                    />
                  </div>
                )
              })}
            </div>
          )}

        {/* ===================================================
            PROMOTION NOTICE
        ==================================================== */}

        {!promotionLoading &&
          products.length > 0 &&
          promotions.some(
            (p) =>
              p.target_type === 'Product' &&
              isPromotionValid(p),
          ) && (
            <div
              data-reveal
              className="pp-rv mt-6 grid border border-violet-200 bg-violet-50 sm:mt-8 lg:grid-cols-[auto_1fr_auto]"
            >
              <div className="relative flex items-center justify-center overflow-hidden bg-violet-600 p-4 text-white sm:p-5">
                <span className="pp-shine-loop pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/25" />
                <Tag className="relative h-5 w-5" />
              </div>

              <div className="px-5 py-4 sm:px-6 sm:py-5">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-violet-700">
                  Current Offers
                </p>

                <p className="mt-1 text-xs leading-5 text-violet-900/80 sm:text-sm sm:leading-6">
                  Selected products currently have active promotional
                  offers. Eligible discounts are reflected directly in the
                  product pricing.
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

        {/* ===================================================
            CTA
        ==================================================== */}

        <div
          data-reveal
          className="pp-rv relative mt-12 overflow-hidden bg-black px-6 py-9 text-white sm:mt-20 sm:px-10 sm:py-12 lg:px-14 lg:py-14"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-[-3rem] top-1/2 hidden -translate-y-1/2 text-[15rem] font-black leading-none tracking-[-0.12em] text-white/[0.035] sm:block"
          >
            39
          </div>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-8 top-8 hidden lg:block"
            style={{ perspective: '800px' }}
          >
            <div className="pp-float-slow">
              <div className="pp-cube pp-cube-dark">
                <i className="pp-f1">39</i>
                <i className="pp-f2" />
                <i className="pp-f3">P</i>
                <i className="pp-f4" />
                <i className="pp-f5" />
                <i className="pp-f6" />
              </div>
            </div>
          </div>

          <div className="relative grid gap-7 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-10">
            <div>
              <div className="mb-5 flex flex-wrap items-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-400">
                  39Production
                </span>

                <span className="h-px w-10 bg-violet-500" />

                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
                  Need Something Custom?
                </span>
              </div>

              <h2 className="max-w-4xl text-3xl font-black leading-[0.95] tracking-[-0.05em] sm:text-6xl lg:text-7xl">
                Have something
                <span className="block text-violet-400">
                  different in mind?
                </span>
              </h2>

              <p className="mt-5 max-w-xl text-xs leading-6 text-white/55 sm:mt-6 sm:text-base">
                If you need something beyond the products in our collection,
                tell us what you want to build and we can create it with
                you.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 sm:flex-row lg:flex-col">
              <Link
                to="/contact"
                className="group relative inline-flex items-center justify-center gap-3 overflow-hidden bg-violet-600 px-6 py-4 text-xs font-black uppercase tracking-[0.14em] text-white transition-all duration-300 hover:bg-violet-500"
              >
                <span className="pp-shine-loop pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/20" />
                <span className="relative">Start a Project</span>

                <ArrowUpRight className="relative h-4 w-4 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
              </Link>

              <Link
                to="/services"
                className="group inline-flex items-center justify-center gap-3 border border-white/15 px-6 py-4 text-xs font-black uppercase tracking-[0.14em] text-white/75 transition-all duration-300 hover:border-violet-400 hover:text-violet-300"
              >
                Explore Services

                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>

        {/* ===================================================
            SIGNATURE
        ==================================================== */}

        <div className="mt-6 flex flex-col justify-between gap-3 border-t border-black/10 pt-5 text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400 sm:mt-7 sm:flex-row sm:items-center">
          <span>
            39Production / Digital / Creative / Entertainment
          </span>

          <span className="inline-flex items-center gap-2">
            Creating Digital Works

            <ArrowUpRight className="h-3 w-3 text-violet-600" />
          </span>
        </div>
      </div>

      <style>{`
        .pp .pp-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        .pp .pp-scroll::-webkit-scrollbar { display: none; }

        /* ---------- Reveal ---------- */
        @keyframes pp-in {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .pp .pp-in {
          opacity: 0;
          animation: pp-in .85s cubic-bezier(.22,1,.36,1) var(--d, 0ms) forwards;
        }

        .pp .pp-rv {
          opacity: 0;
          transform: translate3d(0, 28px, 0);
          transition:
            opacity .85s cubic-bezier(.2,.7,.2,1) var(--d, 0ms),
            transform .85s cubic-bezier(.2,.7,.2,1) var(--d, 0ms);
        }
        .pp .pp-rv.is-visible { opacity: 1; transform: none; }

        @keyframes pp-up {
          from { transform: translateY(105%); }
          to   { transform: translateY(0); }
        }
        .pp .pp-up {
          transform: translateY(105%);
          animation: pp-up .95s cubic-bezier(.22,1,.36,1) var(--d, 0ms) forwards;
        }
        @keyframes pp-draw { to { transform: scaleX(1); } }
        .pp .pp-draw {
          transform: scaleX(0);
          transform-origin: left;
          animation: pp-draw .9s cubic-bezier(.77,0,.18,1) 1.1s forwards;
        }

        /* ---------- Floating ---------- */
        @keyframes pp-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        .pp .pp-float { animation: pp-float 6s ease-in-out infinite; }
        .pp .pp-float-slow { animation: pp-float 9s ease-in-out infinite; }

        @keyframes pp-blink { 0%,100% { opacity: 1; } 50% { opacity: .25; } }
        .pp .pp-blink { animation: pp-blink 2s ease-in-out infinite; }

        @keyframes pp-twinkle {
          0%, 100% { opacity: .15; transform: scale(.6) rotate(45deg); }
          50% { opacity: 1; transform: scale(1) rotate(45deg); }
        }
        .pp .pp-twinkle { animation: pp-twinkle 3s ease-in-out infinite; }

        @keyframes pp-marquee { to { transform: translateX(-50%); } }
        .pp .pp-marquee { animation: pp-marquee 42s linear infinite; }

        /* ---------- Stage 3D ---------- */
        .pp .pp-stage { perspective: 1100px; }
        .pp .pp-tilt {
          transform-style: preserve-3d;
          transform: rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg));
          transition: transform .35s cubic-bezier(.22,1,.36,1);
        }
        .pp .pp-z-a { transform: translateZ(40px); }
        .pp .pp-z-b { transform: translateZ(100px); }
        .pp .pp-z-c { transform: translateZ(70px); }

        /* Kotak produk (cuboid) */
        .pp .pp-box-wrap {
          --w: 120px; --h: 84px; --d: 84px;
          position: absolute;
          left: calc(var(--w) / -2);
          top: calc(var(--h) / -2);
          width: var(--w);
          height: var(--h);
          transform-style: preserve-3d;
          animation: pp-bob 6s ease-in-out infinite;
        }
        @media (min-width: 640px) { .pp .pp-box-wrap { --w: 156px; --h: 108px; --d: 108px; } }
        @media (min-width: 1024px) { .pp .pp-box-wrap { --w: 200px; --h: 138px; --d: 138px; } }
        @keyframes pp-bob {
          0%, 100% { transform: translateY(-4px); }
          50% { transform: translateY(-16px); }
        }
        .pp .pp-box {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          animation: pp-box 18s linear infinite;
        }
        @keyframes pp-box {
          from { transform: rotateX(-22deg) rotateY(0deg); }
          to   { transform: rotateX(-22deg) rotateY(360deg); }
        }
        .pp .pp-bf {
          position: absolute;
          border: 1.5px solid #111;
          backface-visibility: visible;
        }
        .pp .pp-bf-front, .pp .pp-bf-back {
          inset: 0;
        }
        .pp .pp-bf-front {
          transform: translateZ(calc(var(--d) / 2));
          background: #fff;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: space-between;
          padding: 10px 12px;
        }
        .pp .pp-bf-front strong {
          font-size: calc(var(--h) * .5);
          line-height: .9;
          font-weight: 900;
          letter-spacing: -.08em;
          color: #7C3AED;
        }
        .pp .pp-bf-front span {
          font-family: ui-monospace, monospace;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: .18em;
          text-transform: uppercase;
          color: #111;
        }
        .pp .pp-bf-back {
          transform: rotateY(180deg) translateZ(calc(var(--d) / 2));
          background: #111;
        }
        .pp .pp-bf-right, .pp .pp-bf-left {
          top: 0;
          height: 100%;
          width: var(--d);
          left: calc((var(--w) - var(--d)) / 2);
          background: #7C3AED;
        }
        .pp .pp-bf-right { transform: rotateY(90deg) translateZ(calc(var(--w) / 2)); }
        .pp .pp-bf-left { transform: rotateY(-90deg) translateZ(calc(var(--w) / 2)); background: #5b21b6; }
        .pp .pp-bf-top, .pp .pp-bf-bottom {
          left: 0;
          width: 100%;
          height: var(--d);
          top: calc((var(--h) - var(--d)) / 2);
        }
        .pp .pp-bf-top {
          transform: rotateX(90deg) translateZ(calc(var(--h) / 2));
          background:
            linear-gradient(90deg, transparent 42%, #E78FBA 42%, #E78FBA 58%, transparent 58%),
            #f5f3ff;
        }
        .pp .pp-bf-bottom {
          transform: rotateX(-90deg) translateZ(calc(var(--h) / 2));
          background: #1a1030;
        }

        /* Kartu produk menyebar */
        .pp .pp-fan {
          --cw: 86px; --ch: 112px;
          width: 0; height: 0;
          transform-style: preserve-3d;
        }
        @media (min-width: 640px) { .pp .pp-fan { --cw: 112px; --ch: 146px; } }
        @media (min-width: 1024px) { .pp .pp-fan { --cw: 146px; --ch: 190px; } }
        .pp .pp-fc {
          position: absolute;
          width: var(--cw);
          height: var(--ch);
          left: calc(var(--cw) / -2);
          top: calc(var(--ch) / -2);
          border: 1.5px solid #111;
          background: #fff;
          padding: 10px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          animation: pp-fan 7s ease-in-out infinite alternate;
        }
        .pp .pp-fc i { display: block; flex: 1; background: #ede9fe; }
        .pp .pp-fc b { display: block; height: 5px; background: rgba(0,0,0,.14); }
        .pp .pp-fc b + b { width: 60%; }
        .pp .pp-fc1 { --x: -118%; --r: -14deg; --y: 6%; transform: translate(var(--x), var(--y)) rotate(var(--r)) translateZ(-40px); }
        .pp .pp-fc1 i { background: linear-gradient(135deg, #7C3AED, #E78FBA); }
        .pp .pp-fc2 { --x: 118%; --r: 12deg; --y: -4%; transform: translate(var(--x), var(--y)) rotate(var(--r)) translateZ(-20px); animation-delay: -2s; background: #111; border-color: #111; }
        .pp .pp-fc2 i { background: #7C3AED; }
        .pp .pp-fc2 b { background: rgba(255,255,255,.25); }
        .pp .pp-fc3 { --x: 0%; --r: -3deg; --y: -34%; transform: translate(var(--x), var(--y)) rotate(var(--r)) translateZ(-80px); animation-delay: -4s; background: #fdf2f8; }
        .pp .pp-fc3 i { background: #E78FBA; }
        @keyframes pp-fan {
          from { transform: translate(var(--x), var(--y)) rotate(var(--r)) translateZ(-40px); }
          to   { transform: translate(var(--x), calc(var(--y) - 8%)) rotate(calc(var(--r) * 1.4)) translateZ(10px); }
        }

        /* Kubus kecil */
        .pp .pp-cube {
          --s: 44px;
          position: relative;
          width: var(--s);
          height: var(--s);
          transform-style: preserve-3d;
          animation: pp-cube 14s linear infinite;
        }
        @media (min-width: 640px) { .pp .pp-cube { --s: 58px; } }
        @media (min-width: 1024px) { .pp .pp-cube { --s: 72px; } }
        @keyframes pp-cube {
          from { transform: rotateX(-24deg) rotateY(0deg); }
          to   { transform: rotateX(-24deg) rotateY(360deg); }
        }
        .pp .pp-cube i {
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
        .pp .pp-cube .pp-f1 { transform: translateZ(calc(var(--s) / 2)); background: rgba(255,255,255,.78); }
        .pp .pp-cube .pp-f2 { transform: rotateY(90deg) translateZ(calc(var(--s) / 2)); background: rgba(231,143,186,.4); }
        .pp .pp-cube .pp-f3 { transform: rotateY(180deg) translateZ(calc(var(--s) / 2)); background: rgba(255,255,255,.78); }
        .pp .pp-cube .pp-f4 { transform: rotateY(-90deg) translateZ(calc(var(--s) / 2)); background: rgba(124,58,237,.24); }
        .pp .pp-cube .pp-f5 { transform: rotateX(90deg) translateZ(calc(var(--s) / 2)); background: rgba(231,143,186,.5); }
        .pp .pp-cube .pp-f6 { transform: rotateX(-90deg) translateZ(calc(var(--s) / 2)); background: rgba(124,58,237,.32); }
        .pp .pp-cube-dark { --s: 76px; }
        .pp .pp-cube-dark i { color: #E78FBA; border-color: rgba(231,143,186,.7); background: rgba(124,58,237,.28); }

        /* Bola */
        .pp .pp-sphere {
          width: 30px; height: 30px;
          border-radius: 9999px;
          background: radial-gradient(circle at 30% 28%, #fbd5e6 0%, #E78FBA 38%, #7C3AED 100%);
          box-shadow: 0 14px 22px -8px rgba(124, 58, 237, .55);
        }
        @media (min-width: 640px) { .pp .pp-sphere { width: 42px; height: 42px; } }
        @media (min-width: 1024px) { .pp .pp-sphere { width: 56px; height: 56px; } }

        .pp .pp-plane { transform: rotateY(16deg) rotateX(6deg); }

        @media (max-width: 1023px) {
          .pp .pp-z-a { transform: translateZ(20px); }
          .pp .pp-z-b, .pp .pp-z-c { transform: translateZ(30px); }
        }

        /* ---------- Kartu ---------- */
        .pp .pp-card {
          transform: perspective(1000px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg));
          transition:
            transform .3s cubic-bezier(.22,1,.36,1),
            border-color .5s, box-shadow .5s;
          will-change: transform;
        }
        .pp .pp-glare {
          background: radial-gradient(
            260px circle at var(--gx, 50%) var(--gy, 0%),
            rgba(124, 58, 237, .12),
            transparent 65%
          );
        }

        @keyframes pp-kb {
          from { transform: scale(1); }
          to   { transform: scale(1.08); }
        }
        .pp .pp-kb { animation: pp-kb 14s ease-in-out infinite alternate; }

        @keyframes pp-shine {
          0% { left: -50%; opacity: 0; }
          30% { opacity: 1; }
          100% { left: 130%; opacity: 0; }
        }
        .pp .group:hover .pp-shine { animation: pp-shine .9s ease-out; }
        .pp .pp-shine-loop { animation: pp-shine 3.4s ease-in-out infinite; }

        @keyframes pp-stamp {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(2deg) translateY(-2px); }
        }
        .pp .pp-stamp { animation: pp-stamp 3.2s ease-in-out infinite; }

        @keyframes pp-art-drift {
          from { transform: translate3d(0, 0, 0); }
          to   { transform: translate3d(8px, -8px, 0); }
        }
        .pp .pp-art-a { animation: pp-art-drift 9s ease-in-out infinite alternate; }

        @keyframes pp-art-bar { 0%,100% { transform: scaleY(.55); } 50% { transform: scaleY(1); } }
        .pp .pp-art-bar {
          transform-box: fill-box;
          transform-origin: bottom;
          animation: pp-art-bar 2.4s ease-in-out infinite;
        }

        @keyframes pp-skeleton {
          0%, 100% { opacity: .55; }
          50% { opacity: 1; }
        }
        .pp .pp-skeleton { animation: pp-skeleton 1.4s ease-in-out infinite; }

        @media (prefers-reduced-motion: reduce) {
          .pp *, .pp *::before, .pp *::after {
            scroll-behavior: auto !important;
            transition-duration: 0.01ms !important;
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
          }
          .pp .pp-in, .pp .pp-rv, .pp .pp-up {
            opacity: 1 !important;
            transform: none !important;
          }
          .pp .pp-draw { transform: scaleX(1) !important; }
          .pp .pp-tilt, .pp .pp-card { transform: none !important; }
        }
      `}</style>
    </section>
  )
}

export default ProductsPage