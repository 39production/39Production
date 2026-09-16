import { useEffect, useState } from 'react'
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

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [promotionLoading, setPromotionLoading] =
    useState(true)
  const [error, setError] = useState('')

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

  return (
    <section className="relative isolate min-h-screen overflow-hidden bg-white text-zinc-950">
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
        className="pointer-events-none absolute left-[8%] top-[18%] h-2 w-2 rounded-full bg-violet-600"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[13%] top-[34%] h-1.5 w-1.5 rounded-full bg-violet-500"
      />

      <div className="relative mx-auto max-w-[1600px] px-5 pb-20 pt-20 sm:px-8 sm:pt-24 lg:px-12 lg:pb-28 lg:pt-24">
        {/* ===================================================
            TOP EDITORIAL LINE
        ==================================================== */}

        <div className="mb-12 flex items-center justify-between border-b border-black/10 pb-5 sm:mb-16">
          <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.24em] text-zinc-500 sm:text-xs">
            <span className="text-zinc-950">
              39Production
            </span>

            <span className="h-1 w-1 rounded-full bg-violet-600" />

            <span>Products</span>
          </div>

          <div className="hidden items-center gap-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400 sm:flex">
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

        <div className="relative grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end lg:gap-16">
          <div>
            <div className="mb-7 flex items-center gap-3">
              <span className="inline-flex items-center gap-2 border border-violet-200 bg-violet-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-violet-700">
                <Sparkles className="h-3.5 w-3.5" />
                Digital Marketplace
              </span>

              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                Ready to Explore
              </span>
            </div>

            <h1 className="max-w-5xl text-[clamp(3.5rem,8vw,8rem)] font-black leading-[0.82] tracking-[-0.065em]">
              <span className="block text-zinc-950">
                Built
              </span>

              <span className="block text-zinc-300">
                to create.
              </span>
            </h1>

            <div className="mt-8 max-w-2xl border-l-2 border-violet-600 pl-5">
              <p className="text-base leading-7 text-zinc-600 sm:text-lg">
                Explore digital products crafted
                for creators, brands and modern
                digital experiences — ready to use,
                adapt and make your own.
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
                    Product Philosophy
                  </p>

                  <p className="mt-3 max-w-md text-sm leading-6 text-zinc-600">
                    Creative assets, digital works and
                    production-ready products designed
                    to move ideas forward.
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <span className="text-3xl font-black tracking-[-0.04em] text-violet-600">
                    {products.length
                      .toString()
                      .padStart(2, '0')}
                  </span>

                  <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.16em] text-zinc-400">
                    Products
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================
            COLLECTION HEADING
        ==================================================== */}

        <div className="mt-20 flex flex-col justify-between gap-6 border-y border-black/10 py-5 sm:mt-24 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-600">
                03
              </span>

              <span className="h-px w-10 bg-violet-600" />

              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                The Collection
              </span>
            </div>

            <h2 className="text-3xl font-black tracking-[-0.04em] sm:text-5xl">
              What you can get.
            </h2>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-600" />

            {products.length}{' '}
            {products.length === 1
              ? 'Product'
              : 'Products'}
          </div>
        </div>

        {/* ===================================================
            LOADING
        ==================================================== */}

        {loading && (
          <div className="mt-10 flex min-h-[300px] items-center justify-center border border-black/10 bg-neutral-50">
            <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
              <Loader2 className="h-4 w-4 animate-spin text-violet-600" />
              Loading products
            </div>
          </div>
        )}

        {/* ===================================================
            ERROR
        ==================================================== */}

        {!loading && error && (
          <div className="mt-10 border border-red-200 bg-red-50 px-6 py-5 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* ===================================================
            EMPTY
        ==================================================== */}

        {!loading &&
          !error &&
          products.length === 0 && (
            <div className="mt-10 border border-black/10 bg-neutral-50 px-6 py-20 text-center">
              <Package className="mx-auto h-7 w-7 text-violet-600" />

              <h3 className="mt-5 text-xl font-black tracking-tight">
                The collection is coming together
              </h3>

              <p className="mt-2 text-sm text-zinc-500">
                New digital products will appear
                here as they are published.
              </p>
            </div>
          )}

        {/* ===================================================
            PRODUCTS
        ==================================================== */}

        {!loading &&
          !error &&
          products.length > 0 && (
            <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-12">
              {products.map((product, index) => {
                const promotion =
                  getProductPromotion(product.id)

                const discount = getDiscount(
                  product,
                  promotion,
                )

                const finalPrice = Math.max(
                  0,
                  product.price - discount,
                )

                const isAvailable =
                  product.stock > 0

                const isFeatured =
                  index % 5 === 0

                return (
                  <Link
                    key={product.id}
                    to={`/products/${product.id}`}
                    className={`
                      group relative overflow-hidden
                      border border-black/10
                      bg-white
                      transition-all duration-500
                      hover:-translate-y-1
                      hover:border-violet-300
                      hover:shadow-[0_24px_65px_rgba(124,58,237,0.11)]
                      ${isFeatured
                        ? 'lg:col-span-7'
                        : 'lg:col-span-5'
                      }
                    `}
                  >
                    {/* Accent line */}

                    <div className="absolute inset-x-0 top-0 z-30 h-1 bg-violet-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                    {/* =================================================
                        VISUAL PRODUCT
                    ================================================== */}

                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-100">
                      {product.image_url ? (
                        <>
                          <img
                            src={product.image_url}
                            alt={product.name}
                            loading="lazy"
                            decoding="async"
                            className="
                              h-full
                              w-full
                              object-cover
                              transition-transform
                              duration-700
                              ease-out
                              group-hover:scale-[1.045]
                            "
                          />

                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />

                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-500/[0.08] via-transparent to-pink-500/[0.08] mix-blend-soft-light" />
                        </>
                      ) : (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-br from-violet-100 via-white to-pink-100" />

                          <div
                            className="absolute inset-0 opacity-[0.07]"
                            style={{
                              backgroundImage: `
                                linear-gradient(rgba(124,58,237,0.8) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(124,58,237,0.8) 1px, transparent 1px)
                              `,
                              backgroundSize: '36px 36px',
                            }}
                          />

                          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                            <div className="absolute -inset-10 rounded-full bg-violet-200/60 blur-3xl" />

                            <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl border border-violet-200 bg-white text-violet-600 shadow-xl">
                              <Package className="h-10 w-10" />
                            </div>
                          </div>
                        </>
                      )}

                      {/* Product number */}

                      <div className="absolute left-5 top-5 z-20">
                        <span className="inline-flex items-center border border-white/25 bg-black/55 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-white backdrop-blur-md">
                          Product{' '}
                          {String(index + 1).padStart(
                            2,
                            '0',
                          )}
                        </span>
                      </div>

                      {/* Category */}

                      <div className="absolute bottom-5 left-5 z-20">
                        <span className="inline-flex border border-white/25 bg-black/55 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-md">
                          {product.category}
                        </span>
                      </div>

                      {/* Promotion */}

                      {promotion && (
                        <div className="absolute right-5 top-5 z-20">
                          <span className="inline-flex items-center gap-1.5 border border-green-200/70 bg-white/95 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-green-700 shadow-sm backdrop-blur-md">
                            <Tag className="h-3 w-3" />

                            {discountLabel(
                              promotion,
                            )}
                          </span>
                        </div>
                      )}

                      {/* Explore indicator */}

                      <div className="absolute bottom-5 right-5 z-20 flex h-10 w-10 items-center justify-center border border-white/25 bg-black/55 text-white backdrop-blur-md transition-all duration-300 group-hover:border-violet-400 group-hover:bg-violet-600">
                        <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </div>
                    </div>

                    {/* =================================================
                        PRODUCT CONTENT
                    ================================================== */}

                    <div className="flex flex-col p-6 sm:p-7">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-violet-600">
                          Digital Product
                        </span>

                        {isAvailable ? (
                          <span className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.15em] text-green-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                            Available
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-red-500">
                            Out of Stock
                          </span>
                        )}
                      </div>

                      <h2 className="mt-4 max-w-2xl text-2xl font-black leading-[0.98] tracking-[-0.045em] text-zinc-950 transition-colors duration-300 group-hover:text-violet-700 sm:text-3xl">
                        {product.name}
                      </h2>

                      <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-500">
                        {product.description}
                      </p>

                      {promotion && (
                        <div className="mt-6 border border-violet-200 bg-violet-50 p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex gap-3">
                              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center bg-violet-600 text-white">
                                <Tag className="h-3.5 w-3.5" />
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-[10px] font-black uppercase tracking-[0.16em] text-violet-700">
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
                              {discountLabel(
                                promotion,
                              )}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="mt-7 border-t border-black/10 pt-5">
                        <div className="flex items-end justify-between gap-5">
                          <div>
                            {promotion ? (
                              <>
                                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-zinc-400">
                                  Promotional Price
                                </p>

                                <div className="mt-1 flex flex-wrap items-baseline gap-2">
                                  <span className="text-xl font-black tracking-tight text-green-600 sm:text-2xl">
                                    {formatPrice(
                                      finalPrice,
                                    )}
                                  </span>

                                  <span className="text-xs text-zinc-400 line-through">
                                    {formatPrice(
                                      product.price,
                                    )}
                                  </span>
                                </div>
                              </>
                            ) : (
                              <>
                                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-zinc-400">
                                  Product Price
                                </p>

                                <p className="mt-1 text-xl font-black tracking-tight text-zinc-950 sm:text-2xl">
                                  {formatPrice(
                                    product.price,
                                  )}
                                </p>
                              </>
                            )}
                          </div>

                          <span className="inline-flex items-center gap-2 border-b border-black pb-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-zinc-950 transition-colors group-hover:border-violet-600 group-hover:text-violet-600">
                            Explore Product

                            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
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
            <div className="mt-10 grid border border-violet-200 bg-violet-50 lg:grid-cols-[auto_1fr_auto]">
              <div className="flex items-center justify-center bg-violet-600 p-5 text-white">
                <Tag className="h-5 w-5" />
              </div>

              <div className="px-6 py-5">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-violet-700">
                  Current Offers
                </p>

                <p className="mt-1 text-sm leading-6 text-violet-900/80">
                  Selected products currently have
                  active promotional offers. Eligible
                  discounts are reflected directly in
                  the product pricing.
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

        {/* ===================================================
            CTA
        ==================================================== */}

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
                  Need Something Custom?
                </span>
              </div>

              <h2 className="max-w-4xl text-4xl font-black leading-[0.95] tracking-[-0.05em] sm:text-6xl lg:text-7xl">
                Have something
                <span className="block text-violet-400">
                  different in mind?
                </span>
              </h2>

              <p className="mt-6 max-w-xl text-sm leading-6 text-white/55 sm:text-base">
                If you need something beyond the
                products in our collection, tell us
                what you want to build and we can
                create it with you.
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

        <div className="mt-7 flex flex-col justify-between gap-3 border-t border-black/10 pt-5 text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400 sm:flex-row sm:items-center">
          <span>
            39Production / Digital / Creative /
            Entertainment
          </span>

          <span className="inline-flex items-center gap-2">
            Creating Digital Works

            <ArrowUpRight className="h-3 w-3 text-violet-600" />
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