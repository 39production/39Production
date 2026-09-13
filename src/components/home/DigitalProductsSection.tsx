import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ArrowUpRight,
  Package,
  ShoppingBag,
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

interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(price)
}

function getCategoryStyle(category: string) {
  const value = category.toLowerCase()

  if (
    value.includes('design') ||
    value.includes('ui') ||
    value.includes('ux')
  ) {
    return {
      badge: 'border-pink-100 bg-pink-50 text-pink-700',
      dot: 'bg-pink-500',
    }
  }

  if (
    value.includes('template') ||
    value.includes('web')
  ) {
    return {
      badge:
        'border-violet-100 bg-violet-50 text-violet-700',
      dot: 'bg-violet-500',
    }
  }

  if (
    value.includes('music') ||
    value.includes('audio')
  ) {
    return {
      badge:
        'border-indigo-100 bg-indigo-50 text-indigo-700',
      dot: 'bg-indigo-500',
    }
  }

  if (
    value.includes('animation') ||
    value.includes('video')
  ) {
    return {
      badge:
        'border-fuchsia-100 bg-fuchsia-50 text-fuchsia-700',
      dot: 'bg-fuchsia-500',
    }
  }

  return {
    badge:
      'border-purple-100 bg-purple-50 text-purple-700',
    dot: 'bg-purple-500',
  }
}

export function DigitalProductsSection() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function loadProducts() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/products`,
          {
            cache: 'no-store',
          },
        )

        if (!response.ok) {
          throw new Error(
            'Failed to fetch products.',
          )
        }

        const result =
          (await response.json()) as ApiResponse<
            Product[]
          >

        if (!mounted) {
          return
        }

        if (result.success) {
          setProducts(
            (result.data ?? []).filter(
              (product) =>
                product.status === 'Published' &&
                product.stock > 0,
            ),
          )
        }
      } catch (error) {
        console.error(
          'Load products error:',
          error,
        )

        if (mounted) {
          setProducts([])
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadProducts()

    return () => {
      mounted = false
    }
  }, [])

  if (!loading && products.length === 0) {
    return null
  }

  return (
    <section
      id="digital-products"
      aria-labelledby="digital-products-section-title"
      className="relative isolate overflow-hidden bg-white py-20 sm:py-24 lg:py-32"
    >
      {/* =========================================================
          BACKGROUND
      ========================================================== */}

      <div className="pointer-events-none absolute inset-0 -z-20 overflow-hidden">
        <div className="productsGlow productsGlowOne absolute -left-40 top-[8%] h-[400px] w-[400px] rounded-full" />

        <div className="productsGlow productsGlowTwo absolute -right-40 top-[40%] h-[440px] w-[440px] rounded-full" />

        <div className="productsGlow productsGlowThree absolute bottom-[-180px] left-[35%] h-[400px] w-[400px] rounded-full" />
      </div>

      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="productsLightLine productsLightLineOne absolute left-[-20%] top-[27%] h-px w-[140%]" />

        <div className="productsLightLine productsLightLineTwo absolute left-[-20%] top-[74%] h-px w-[140%]" />
      </div>

      {/* =========================================================
          CONTENT
      ========================================================== */}

      <div className="mx-auto max-w-[1240px] px-5 sm:px-8 lg:px-10">
        {/* =======================================================
            HEADER
        ======================================================== */}

        <div className="mx-auto max-w-3xl text-center">
          <div className="productsEyebrow mb-5 inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-4 py-2">
            <ShoppingBag className="h-3.5 w-3.5 text-violet-600" />

            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-700 sm:text-[11px]">
              DIGITAL PRODUCTS
            </span>
          </div>

          <h2
            id="digital-products-section-title"
            className="text-3xl font-semibold leading-[1.12] tracking-tight text-neutral-950 sm:text-4xl lg:text-5xl"
          >
            Ready-to-use digital
            <span className="block bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
              products.
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-neutral-500 sm:text-base sm:leading-7">
            Pilih produk digital yang sudah siap digunakan tanpa perlu melalui
            proses custom project dari awal.
          </p>
        </div>

        {/* =======================================================
            INTRO STRIP
        ======================================================== */}

        <div className="mx-auto mt-12 max-w-[1180px] rounded-[24px] border border-neutral-200 bg-neutral-50/80 p-5 sm:mt-14 sm:p-6 lg:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
                Available now
              </p>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
                Produk yang tampil di sini berasal langsung dari katalog
                39Production dan dapat dibeli selama statusnya published dan
                stok masih tersedia.
              </p>
            </div>

            <Link
              to="/products"
              className="group inline-flex shrink-0 items-center justify-center gap-2 text-sm font-semibold text-neutral-700 transition-colors duration-300 hover:text-violet-600"
            >
              View all products

              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* =======================================================
            PRODUCTS
        ======================================================== */}

        {loading ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-[24px] border border-neutral-200 bg-white"
              >
                <div className="h-[220px] animate-pulse bg-neutral-100" />

                <div className="space-y-4 p-5 sm:p-6">
                  <div className="h-4 w-24 animate-pulse rounded-full bg-neutral-100" />

                  <div className="h-6 w-3/4 animate-pulse rounded-lg bg-neutral-100" />

                  <div className="space-y-2">
                    <div className="h-3 w-full animate-pulse rounded bg-neutral-100" />
                    <div className="h-3 w-4/5 animate-pulse rounded bg-neutral-100" />
                  </div>

                  <div className="h-px bg-neutral-100" />

                  <div className="h-7 w-32 animate-pulse rounded bg-neutral-100" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.slice(0, 6).map((product) => {
              const categoryStyle =
                getCategoryStyle(
                  product.category,
                )

              return (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="productCard group relative flex h-full flex-col overflow-hidden rounded-[24px] border border-neutral-200 bg-white transition-all duration-500 hover:-translate-y-1 hover:border-violet-200 hover:shadow-[0_20px_50px_rgba(15,23,42,0.08)]"
                >
                  {/* =================================================
                      IMAGE
                  ================================================== */}

                  <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045]"
                        onError={(event) => {
                          event.currentTarget.style.display =
                            'none'
                        }}
                      />
                    ) : (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-pink-50" />

                        <div
                          className="absolute inset-0 opacity-[0.35]"
                          style={{
                            backgroundImage: `
                              linear-gradient(
                                rgba(124, 58, 237, 0.055) 1px,
                                transparent 1px
                              ),
                              linear-gradient(
                                90deg,
                                rgba(124, 58, 237, 0.055) 1px,
                                transparent 1px
                              )
                            `,
                            backgroundSize: '34px 34px',
                          }}
                        />

                        <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2">
                          <div className="absolute -inset-6 rounded-full bg-violet-200/50 blur-2xl" />

                          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-100 bg-white text-violet-600 shadow-sm transition-transform duration-300 group-hover:scale-105">
                            <Package className="h-7 w-7" strokeWidth={1.7} />
                          </div>
                        </div>
                      </>
                    )}

                    {/* soft overlay for image depth */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />

                    {/* Category */}
                    <div className="absolute left-4 top-4">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] shadow-sm backdrop-blur-sm ${categoryStyle.badge}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${categoryStyle.dot}`}
                        />

                        {product.category}
                      </span>
                    </div>

                    {/* Arrow */}
                    <div className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/60 bg-white/90 text-neutral-700 shadow-sm backdrop-blur-sm transition-all duration-300 group-hover:border-white group-hover:text-violet-600">
                      <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>

                    {/* Bottom accent */}
                    <div
                      className={`absolute bottom-0 left-0 h-1 w-12 ${categoryStyle.dot} transition-all duration-500 group-hover:w-20`}
                    />
                  </div>

                  {/* =================================================
                      PRODUCT CONTENT
                  ================================================== */}

                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    <h3 className="line-clamp-2 text-lg font-semibold leading-tight tracking-tight text-neutral-950 transition-colors duration-300 group-hover:text-violet-600 sm:text-xl">
                      {product.name}
                    </h3>

                    <p className="mt-3 line-clamp-3 text-[13px] leading-[1.7] text-neutral-500">
                      {product.description}
                    </p>

                    <div className="mt-auto pt-6">
                      <div className="border-t border-neutral-100 pt-5">
                        <div className="flex items-end justify-between gap-4">
                          {/* Price */}
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
                              Price
                            </p>

                            <p className="mt-1 text-lg font-bold tracking-tight text-neutral-950 sm:text-xl">
                              {formatPrice(product.price)}
                            </p>
                          </div>

                          {/* Stock */}
                          <div className="text-right">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
                              Availability
                            </p>

                            <div className="mt-1 flex items-center justify-end gap-1.5">
                              <ShoppingBag className="h-3.5 w-3.5 text-neutral-400" />

                              <span className="text-xs font-medium text-neutral-600">
                                {product.stock}{' '}
                                available
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action */}
                        <div className="mt-5 flex items-center justify-between">
                          <span className="text-xs font-semibold text-neutral-500 transition-colors duration-300 group-hover:text-violet-600">
                            View product
                          </span>

                          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 text-neutral-400 transition-all duration-300 group-hover:border-violet-200 group-hover:text-violet-600">
                            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* subtle shine */}
                  <div className="productCardShine pointer-events-none absolute inset-y-0 left-0 w-[35%] -translate-x-[180%] bg-gradient-to-r from-transparent via-white/35 to-transparent skew-x-[-18deg]" />
                </Link>
              )
            })}
          </div>
        )}

        {/* =======================================================
            VIEW ALL
        ======================================================== */}

        {!loading && products.length > 6 && (
          <div className="mt-12 flex justify-center">
            <Link
              to="/products"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white px-6 py-3 text-sm font-semibold text-neutral-700 transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-200 hover:text-violet-600 hover:shadow-md sm:w-auto"
            >
              View All Products

              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        )}

        {/* =======================================================
            BOTTOM NOTE
        ======================================================== */}

        {!loading && products.length > 0 && (
          <div className="mt-10 flex flex-col items-center justify-center gap-2 text-center sm:flex-row">
            <span className="text-xs text-neutral-400">
              Need something more specific?
            </span>

            <Link
              to="/contact"
              className="text-xs font-semibold text-violet-600 transition-colors hover:text-violet-700"
            >
              Start a custom project
            </Link>
          </div>
        )}
      </div>

      {/* =========================================================
          ANIMATIONS
      ========================================================== */}

      <style>{`
        .productsGlow {
          filter: blur(90px);
          opacity: 0.4;
        }

        .productsGlowOne {
          background: rgba(139, 92, 246, 0.045);
          animation: productsGlowOne 16s ease-in-out infinite;
        }

        .productsGlowTwo {
          background: rgba(236, 72, 153, 0.035);
          animation: productsGlowTwo 19s ease-in-out infinite;
        }

        .productsGlowThree {
          background: rgba(99, 102, 241, 0.03);
          animation: productsGlowThree 18s ease-in-out infinite;
        }

        .productsLightLine {
          background: linear-gradient(
            to right,
            transparent,
            rgba(139, 92, 246, 0.07),
            transparent
          );

          opacity: 0.45;
          animation: productsLineMove 11s ease-in-out infinite;
        }

        .productsLightLineTwo {
          background: linear-gradient(
            to right,
            transparent,
            rgba(236, 72, 153, 0.06),
            transparent
          );

          animation-delay: 4s;
        }

        .productsEyebrow {
          animation: productsEyebrowIn 0.7s ease-out both;
        }

        .productCardShine {
          opacity: 0;
          transition:
            transform 1s cubic-bezier(0.16, 1, 0.3, 1),
            opacity 0.3s ease;
        }

        .productCard:hover .productCardShine {
          opacity: 1;
          transform: translateX(380%);
        }

        @keyframes productsEyebrowIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes productsGlowOne {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }

          50% {
            transform: translate3d(45px, 30px, 0);
          }
        }

        @keyframes productsGlowTwo {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }

          50% {
            transform: translate3d(-45px, -30px, 0);
          }
        }

        @keyframes productsGlowThree {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }

          50% {
            transform: translate3d(35px, -30px, 0);
          }
        }

        @keyframes productsLineMove {
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
          .productsGlow {
            opacity: 0.28;
          }

          .productsLightLine {
            opacity: 0.2;
          }

          .productCardShine {
            display: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .productsGlow,
          .productsLightLine,
          .productsEyebrow {
            animation: none !important;
          }

          .productCardShine {
            display: none;
          }
        }
      `}</style>
    </section>
  )
}