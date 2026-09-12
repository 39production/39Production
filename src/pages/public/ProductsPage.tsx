import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Package,
  ArrowRight,
  Loader2,
  Tag,
  Sparkles,
  ShoppingBag,
  Zap,
} from 'lucide-react'

const API_BASE_URL = 'https://39production-api.39production.workers.dev'

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
  status: 'Active' | 'Scheduled' | 'Expired' | 'Draft'
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

function getDiscount(product: Product, p: Promotion | null) {
  if (!p) return 0

  if (p.discount_type === 'Percentage') {
    return Math.min(
      product.price,
      Math.round(
        product.price * (Number(p.discount_value) / 100),
      ),
    )
  }

  return Math.min(product.price, Number(p.discount_value))
}

function discountLabel(p: Promotion) {
  return p.discount_type === 'Percentage'
    ? `${p.discount_value}% OFF`
    : `Save ${formatPrice(Number(p.discount_value))}`
}

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [promotionLoading, setPromotionLoading] = useState(true)
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
            result.message || 'Failed to load products',
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
            (p: Product) => p.status === 'Published',
          ),
        )
      } catch (err) {
        console.error('Fetch products error:', err)

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
    <div className="relative min-h-screen overflow-hidden bg-bg-base text-text-primary">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-bg-base via-bg-base to-bg-surface" />

        <div className="absolute -left-52 top-0 h-[540px] w-[540px] rounded-full bg-brand-primary/12 blur-[150px]" />

        <div className="absolute -right-52 top-[28%] h-[520px] w-[520px] rounded-full bg-brand-accent/10 blur-[150px]" />

        <div className="absolute left-1/2 top-[48%] h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-secondary/8 blur-[140px]" />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(139, 92, 246, 0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.8) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_15%,rgba(5,5,10,0.78)_100%)]" />
      </div>

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-28 sm:px-6 lg:px-8">
        {/* HERO */}
        <div className="mb-10 max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-primary/30 bg-brand-primary/10 px-4 py-2 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-primary" />
            </span>

            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">
              Digital Marketplace
            </span>
          </div>

          <h1 className="font-display text-4xl font-bold leading-[0.95] tracking-tight text-text-primary sm:text-5xl md:text-6xl">
            Products{' '}
            <span className="gradient-text">
              Built to Create
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-text-secondary sm:text-base">
            Explore ready-to-use digital products crafted
            for creators, brands, and modern digital
            experiences — from creative assets and templates
            to interactive works and production-ready ideas.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-border-default bg-bg-surface/60 px-3.5 py-2 text-xs text-text-muted backdrop-blur-md">
              <Package className="h-3.5 w-3.5 text-brand-primary" />
              Creative Assets
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-border-default bg-bg-surface/60 px-3.5 py-2 text-xs text-text-muted backdrop-blur-md">
              <Zap className="h-3.5 w-3.5 text-brand-accent" />
              Ready to Deploy
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-border-default bg-bg-surface/60 px-3.5 py-2 text-xs text-text-muted backdrop-blur-md">
              <ShoppingBag className="h-3.5 w-3.5 text-cyan-400" />
              Made for Creators
            </div>
          </div>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="flex min-h-[280px] items-center justify-center">
            <div className="rounded-2xl border border-border-default bg-bg-surface/70 px-6 py-4 shadow-xl backdrop-blur-xl">
              <div className="flex items-center gap-3 text-sm text-text-muted">
                <Loader2 className="h-5 w-5 animate-spin text-brand-primary" />
                Loading products...
              </div>
            </div>
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="max-w-xl rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
            <div className="flex items-start gap-3">
              <Package className="mt-1 h-5 w-5 shrink-0 text-red-400" />

              <div>
                <h2 className="font-semibold text-text-primary">
                  Unable to load products
                </h2>

                <p className="mt-1 text-sm text-red-400">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* EMPTY */}
        {!loading &&
          !error &&
          products.length === 0 && (
            <div className="rounded-2xl border border-border-default bg-bg-surface/60 p-10 text-center backdrop-blur-md">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
                <Package className="h-7 w-7" />
              </div>

              <h2 className="mt-4 text-lg font-semibold text-text-primary">
                The collection is coming together
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm text-text-muted">
                Our digital product collection is
                currently being updated. New creative
                products will appear here as they are
                published.
              </p>
            </div>
          )}

        {/* PRODUCTS */}
        {!loading &&
          !error &&
          products.length > 0 && (
            <>
              <div className="mb-6 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-primary">
                    The Collection
                  </p>

                  <h2 className="mt-1 text-2xl font-bold tracking-tight text-text-primary">
                    What You Can Get
                  </h2>
                </div>

                <div className="hidden items-center gap-2 rounded-full border border-border-default bg-bg-surface/60 px-3 py-1.5 text-xs text-text-muted backdrop-blur-md sm:flex">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-primary" />

                  {products.length}{' '}
                  {products.length === 1
                    ? 'Product'
                    : 'Products'}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => {
                  const promotion =
                    getProductPromotion(product.id)

                  const discount = getDiscount(
                    product,
                    promotion,
                  )

                  const finalPrice =
                    product.price - discount

                  return (
                    <Link
                      key={product.id}
                      to={`/products/${product.id}`}
                      className="group relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-bg-surface/65 shadow-xl shadow-black/10 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-brand-primary/35 hover:bg-bg-surface/85 hover:shadow-[0_20px_60px_rgba(139,92,246,0.12)]"
                    >
                      <div className="pointer-events-none absolute -right-20 -top-20 z-0 h-44 w-44 rounded-full bg-brand-primary/10 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                      <div className="absolute inset-x-6 top-0 z-20 h-px bg-gradient-to-r from-transparent via-brand-primary/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                      <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden border-b border-white/8 bg-gradient-to-br from-bg-elevated/80 via-bg-surface to-brand-primary/5">
                        <div className="absolute h-36 w-36 rounded-full border border-brand-primary/10" />

                        <div className="absolute h-52 w-52 rounded-full border border-brand-primary/5" />

                        <div className="absolute h-24 w-24 rounded-full bg-brand-primary/5 blur-2xl" />

                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            loading="lazy"
                            decoding="async"
                            className="relative z-10 h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-[1.03]"
                          />
                        ) : (
                          <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-2xl border border-brand-primary/20 bg-bg-surface/70 text-brand-primary shadow-[0_0_35px_rgba(139,92,246,0.12)] backdrop-blur-xl transition-all duration-500 group-hover:scale-110">
                            <Package className="h-9 w-9" />
                          </div>
                        )}

                        <div className="absolute bottom-4 left-4 z-20">
                          <span className="rounded-full border border-white/10 bg-bg-base/60 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-text-muted backdrop-blur-md">
                            {product.category}
                          </span>
                        </div>

                        {promotion && (
                          <div className="absolute right-4 top-4 z-20 inline-flex items-center gap-1.5 rounded-full border border-green-400/20 bg-green-400/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-green-400 shadow-lg backdrop-blur-md">
                            <Tag className="h-3 w-3" />
                            {discountLabel(promotion)}
                          </div>
                        )}
                      </div>

                      <div className="relative p-5">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-primary">
                            Digital Product
                          </span>

                          {product.stock > 0 ? (
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-green-400">
                              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
                              Available
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium uppercase tracking-wide text-red-400">
                              Out of Stock
                            </span>
                          )}
                        </div>

                        <h2 className="line-clamp-1 font-display text-xl font-semibold text-text-primary transition-colors group-hover:text-brand-primary">
                          {product.name}
                        </h2>

                        <p className="mt-2 line-clamp-3 min-h-[60px] text-sm leading-5 text-text-muted">
                          {product.description}
                        </p>

                        {promotion && (
                          <div className="relative mt-4 overflow-hidden rounded-xl border border-green-400/15 bg-green-400/5 p-3">
                            <div className="relative flex items-start gap-2.5">
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-green-400/10 text-green-400">
                                <Tag className="h-3.5 w-3.5" />
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-xs font-semibold text-green-400">
                                  {promotion.title}
                                </p>

                                <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-green-300/65">
                                  {promotion.description}
                                </p>

                                <p className="mt-1.5 font-mono text-[9px] uppercase tracking-wider text-green-300/50">
                                  Code: {promotion.code}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="mt-5 flex items-end justify-between gap-4 border-t border-white/8 pt-4">
                          <div>
                            {promotion ? (
                              <>
                                <p className="text-[10px] text-text-muted line-through">
                                  {formatPrice(product.price)}
                                </p>

                                <p className="mt-0.5 text-lg font-bold text-green-400">
                                  {formatPrice(finalPrice)}
                                </p>
                              </>
                            ) : (
                              <p className="text-lg font-bold text-text-primary">
                                {formatPrice(product.price)}
                              </p>
                            )}
                          </div>

                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-primary">
                            Explore Product
                            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                          </span>
                        </div>
                      </div>

                      <Sparkles className="pointer-events-none absolute bottom-5 right-5 h-3 w-3 text-brand-primary/0 transition-all duration-300 group-hover:text-brand-primary/30" />
                    </Link>
                  )
                })}
              </div>
            </>
          )}

        {/* PROMOTION NOTICE */}
        {!promotionLoading &&
          products.length > 0 &&
          promotions.some(
            (p) =>
              p.target_type === 'Product' &&
              isPromotionValid(p),
          ) && (
            <div className="relative mt-7 overflow-hidden rounded-2xl border border-brand-primary/20 bg-brand-primary/5 p-4 backdrop-blur-xl sm:p-5">
              <div className="relative flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-brand-primary/15 bg-brand-primary/10 text-brand-primary">
                  <Tag className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-text-primary">
                    Active promotions are automatically applied
                  </p>

                  <p className="mt-1 text-xs leading-5 text-text-muted">
                    No promo code is required. Eligible
                    promotions are automatically reflected in
                    the product price when you place an order.
                  </p>
                </div>
              </div>
            </div>
          )}
      </main>
    </div>
  )
}
