import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ArrowUpRight,
  MoveUpRight,
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
      dot: 'bg-[#7C3AED]',
      text: 'text-[#7C3AED]',
    }
  }

  if (
    value.includes('template') ||
    value.includes('web')
  ) {
    return {
      dot: 'bg-black',
      text: 'text-black',
    }
  }

  if (
    value.includes('music') ||
    value.includes('audio')
  ) {
    return {
      dot: 'bg-neutral-500',
      text: 'text-neutral-600',
    }
  }

  if (
    value.includes('animation') ||
    value.includes('video')
  ) {
    return {
      dot: 'bg-[#7C3AED]',
      text: 'text-[#7C3AED]',
    }
  }

  return {
    dot: 'bg-neutral-400',
    text: 'text-neutral-600',
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
          (await response.json()) as ApiResponse<Product[]>

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
      className="relative overflow-hidden bg-white text-zinc-950"
    >
      {/* =========================================================
                SUBTLE BACKGROUND
            ========================================================== */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <div
          className="absolute inset-0 opacity-[0.018]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #111 1px, transparent 1px), linear-gradient(to bottom, #111 1px, transparent 1px)',
            backgroundSize: '100px 100px',
          }}
        />

        <div className="absolute right-[8%] top-[18%] h-2 w-2 rounded-full bg-[#7C3AED]" />

        <div className="absolute left-[5%] bottom-[23%] h-1.5 w-1.5 rounded-full bg-[#7C3AED]" />
      </div>

      <div className="relative mx-auto max-w-[1600px] px-6 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24 xl:px-16">
        {/* =====================================================
                    HEADER
                ====================================================== */}

        <div className="mb-12 border-t border-black/10 pt-4 sm:mb-14">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-[#7C3AED]" />

              <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-neutral-500 sm:text-[10px]">
                39Production / Digital Products
              </span>
            </div>

            <span className="font-mono text-[9px] font-medium tracking-[0.16em] text-neutral-400 sm:text-[10px]">
              39 / 06
            </span>
          </div>
        </div>

        {/* =====================================================
                    INTRO
                ====================================================== */}

        <div className="grid gap-8 lg:grid-cols-[0.68fr_1.32fr] lg:items-end lg:gap-16">
          <div className="max-w-md">
            <p className="text-sm font-medium leading-7 text-neutral-600 sm:text-[15px] sm:leading-7">
              Tidak semua kebutuhan harus dimulai dari custom
              project. Beberapa karya sudah kami siapkan agar
              bisa langsung digunakan.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <span className="h-px w-10 bg-[#7C3AED]" />

              <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                Ready / Digital / Available
              </span>
            </div>
          </div>

          <div className="max-w-5xl">
            <p className="mb-4 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.22em] text-[#7C3AED]">
              <ShoppingBag size={12} />
              Digital Catalog
            </p>

            <h2
              id="digital-products-section-title"
              className="text-[clamp(2.6rem,4.8vw,5rem)] font-black leading-[0.9] tracking-[-0.065em] text-black"
            >
              Ready to use.
              <span className="text-neutral-300">
                {' '}
                Ready to build.
              </span>
            </h2>

            <p className="mt-6 max-w-2xl text-sm font-medium leading-7 text-neutral-500 sm:text-[15px]">
              Produk digital dari 39Production yang dapat dibeli
              langsung selama masih tersedia di katalog.
            </p>
          </div>
        </div>

        {/* =====================================================
                    CATALOG HEADER
                ====================================================== */}

        <div className="mt-16 flex flex-col gap-5 border-t border-black/10 pt-7 sm:mt-20 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-neutral-400">
              Available Now
            </p>

            <h3 className="mt-2 text-2xl font-black tracking-[-0.045em] text-black sm:text-3xl">
              Digital products.
              <span className="text-neutral-300">
                {' '}
                Ready when you are.
              </span>
            </h3>
          </div>

          <Link
            to="/products"
            className="group inline-flex w-fit items-center gap-2 text-[9px] font-bold uppercase tracking-[0.16em] text-black transition-colors duration-300 hover:text-[#7C3AED]"
          >
            View All Products

            <ArrowUpRight
              size={14}
              className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </Link>
        </div>

        {/* =====================================================
                    LOADING
                ====================================================== */}

        {loading && (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="overflow-hidden border border-black/10 bg-white"
              >
                <div className="aspect-[16/10] animate-pulse bg-neutral-100" />

                <div className="space-y-4 p-5 sm:p-6">
                  <div className="h-2.5 w-20 animate-pulse bg-neutral-100" />

                  <div className="h-6 w-3/4 animate-pulse bg-neutral-100" />

                  <div className="space-y-2">
                    <div className="h-3 w-full animate-pulse bg-neutral-100" />
                    <div className="h-3 w-4/5 animate-pulse bg-neutral-100" />
                  </div>

                  <div className="border-t border-neutral-100 pt-4">
                    <div className="h-6 w-28 animate-pulse bg-neutral-100" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* =====================================================
                    PRODUCT CARDS
                ====================================================== */}

        {!loading && products.length > 0 && (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.slice(0, 6).map(
              (product, index) => {
                const categoryStyle =
                  getCategoryStyle(
                    product.category,
                  )

                return (
                  <Link
                    key={product.id}
                    to={`/products/${product.id}`}
                    className="product-card group relative flex h-full flex-col overflow-hidden border border-black/10 bg-white transition-all duration-500 hover:-translate-y-1 hover:border-black/20 hover:shadow-[0_18px_45px_rgba(0,0,0,0.07)]"
                    style={{
                      animationDelay: `${index * 70}ms`,
                    }}
                  >
                    {/* IMAGE */}

                    <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
                      {product.image_url ? (
                        <img
                          src={
                            product.image_url
                          }
                          alt={
                            product.name
                          }
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
                          onError={(
                            event,
                          ) => {
                            event.currentTarget.style.display =
                              'none'
                          }}
                        />
                      ) : (
                        <div className="relative flex h-full w-full items-center justify-center bg-neutral-50">
                          <div
                            aria-hidden="true"
                            className="absolute inset-0 opacity-[0.035]"
                            style={{
                              backgroundImage:
                                'linear-gradient(to right, #111 1px, transparent 1px), linear-gradient(to bottom, #111 1px, transparent 1px)',
                              backgroundSize:
                                '32px 32px',
                            }}
                          />

                          <div className="relative flex h-16 w-16 items-center justify-center border border-black/10 bg-white text-neutral-400 transition-all duration-300 group-hover:border-[#7C3AED] group-hover:text-[#7C3AED]">
                            <Package
                              className="h-7 w-7"
                              strokeWidth={
                                1.5
                              }
                            />
                          </div>
                        </div>
                      )}

                      {/* Category */}

                      <div className="absolute left-4 top-4">
                        <span className="inline-flex items-center gap-2 border border-white/70 bg-white/95 px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.16em] text-black backdrop-blur-sm">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${categoryStyle.dot}`}
                          />

                          {
                            product.category
                          }
                        </span>
                      </div>

                      {/* Arrow */}

                      <div className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white text-black opacity-0 shadow-sm transition-all duration-300 group-hover:opacity-100">
                        <ArrowUpRight
                          size={14}
                          className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        />
                      </div>

                      {/* Bottom accent */}

                      <div className="absolute bottom-0 left-0 h-1 w-10 bg-[#7C3AED] transition-all duration-500 group-hover:w-16" />
                    </div>

                    {/* CONTENT */}

                    <div className="flex flex-1 flex-col p-5 sm:p-6">
                      <div>
                        <p className="mb-2 text-[8px] font-bold uppercase tracking-[0.18em] text-neutral-400">
                          Digital Product
                        </p>

                        <h3 className="line-clamp-2 text-xl font-black leading-[1] tracking-[-0.045em] text-black transition-colors duration-300 group-hover:text-[#7C3AED]">
                          {product.name}
                        </h3>

                        <p className="mt-3 line-clamp-3 text-xs font-medium leading-6 text-neutral-500 sm:text-[13px]">
                          {
                            product.description
                          }
                        </p>
                      </div>

                      <div className="mt-auto pt-6">
                        <div className="border-t border-black/10 pt-4">
                          <div className="flex items-end justify-between gap-4">
                            <div>
                              <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-neutral-400">
                                Price
                              </p>

                              <p className="mt-1 text-lg font-black tracking-[-0.025em] text-black">
                                {formatPrice(
                                  product.price,
                                )}
                              </p>
                            </div>

                            <div className="text-right">
                              <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-neutral-400">
                                Stock
                              </p>

                              <div className="mt-1 flex items-center justify-end gap-1.5">
                                <ShoppingBag
                                  size={
                                    11
                                  }
                                  className="text-neutral-400"
                                />

                                <span className="text-xs font-semibold text-neutral-600">
                                  {
                                    product.stock
                                  }
                                  {' '}
                                  available
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-5 flex items-center justify-between">
                            <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-neutral-400 transition-colors duration-300 group-hover:text-[#7C3AED]">
                              View Product
                            </span>

                            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 text-neutral-300 transition-all duration-300 group-hover:border-[#7C3AED] group-hover:bg-[#7C3AED] group-hover:text-white">
                              <ArrowRight
                                size={
                                  13
                                }
                                className="transition-transform duration-300 group-hover:translate-x-0.5"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              },
            )}
          </div>
        )}

        {/* =====================================================
                    VIEW ALL
                ====================================================== */}

        {!loading && products.length > 6 && (
          <div className="mt-12 flex justify-center">
            <Link
              to="/products"
              className="group inline-flex w-full items-center justify-center gap-3 rounded-full bg-black px-6 py-3.5 text-[9px] font-bold uppercase tracking-[0.14em] text-white transition-all duration-300 hover:bg-[#7C3AED] sm:w-auto"
            >
              View All Products

              <ArrowRight
                size={14}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </div>
        )}

        {/* =====================================================
                    CUSTOM PROJECT
                ====================================================== */}

        {!loading && products.length > 0 && (
          <div className="mt-14 border-t border-black/10 pt-8 sm:mt-16">
            <div className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-12">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#7C3AED]">
                  Need Something Custom?
                </p>

                <h3 className="mt-3 max-w-3xl text-3xl font-black leading-[0.94] tracking-[-0.05em] text-black sm:text-4xl">
                  Can&apos;t find what
                  <span className="text-neutral-300">
                    {' '}
                    you need?
                  </span>
                </h3>

                <p className="mt-4 max-w-xl text-xs font-medium leading-6 text-neutral-500 sm:text-sm">
                  Kalau kebutuhanmu belum tersedia di
                  katalog, mulai custom project bersama
                  39Production dan ceritakan apa yang ingin
                  kamu buat.
                </p>
              </div>

              <Link
                to="/contact"
                className="group inline-flex w-fit items-center gap-3 rounded-full bg-black px-5 py-3.5 text-[9px] font-bold uppercase tracking-[0.14em] text-white transition-all duration-300 hover:bg-[#7C3AED]"
              >
                Start a Project

                <ArrowRight
                  size={14}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            </div>
          </div>
        )}

        {/* =====================================================
                    FOOTER LINE
                ====================================================== */}

        <div className="mt-10 flex items-center justify-between border-t border-black/10 pt-4">
          <span className="font-mono text-[8px] font-bold tracking-[0.18em] text-neutral-400">
            39PRODUCTION
          </span>

          <span className="hidden text-[8px] font-semibold uppercase tracking-[0.18em] text-neutral-400 sm:block">
            Digital Products / Available Now
          </span>

          <MoveUpRight
            size={13}
            className="text-neutral-400"
          />
        </div>
      </div>

      {/* =========================================================
                ANIMATIONS
            ========================================================== */}

      <style>{`
                .product-card {
                    animation: productCardReveal 0.65s ease-out both;
                }

                @keyframes productCardReveal {
                    from {
                        opacity: 0;
                        transform: translateY(12px);
                    }

                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .product-card {
                        animation: none !important;
                    }
                }
            `}</style>
    </section>
  )
}
