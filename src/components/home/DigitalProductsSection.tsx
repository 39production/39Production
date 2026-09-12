
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Package,
  ShoppingBag,
} from 'lucide-react'

import { SectionHeading } from '@/components/common/SectionHeading'

const API_BASE_URL = 'https://39production-api.39production.workers.dev'

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
      aria-labelledby="digital-products-section-title"
      className="relative py-24 lg:py-32"
    >
      <div className="mx-auto max-w-7xl px-4 lg:px-8">

        <SectionHeading
          label="Digital Products"
          title="Ready-to-use digital"
          description="Explore digital products created by 39Production, available to purchase directly without the custom project process."
        />

        {loading ? (
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-64 animate-pulse rounded-2xl border border-border-default bg-bg-surface"
              />
            ))}
          </div>
        ) : (
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products
              .slice(0, 6)
              .map((product) => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="group relative overflow-hidden rounded-2xl border border-border-default bg-bg-surface transition-all duration-300 hover:-translate-y-1 hover:border-brand-primary/40 hover:shadow-xl hover:shadow-brand-primary/10"
                >
                  <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-brand-primary/10 blur-3xl transition-opacity group-hover:bg-brand-primary/20" />

                  {/* =====================================================
                      PRODUCT IMAGE
                  ====================================================== */}

                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-bg-elevated">
                    {product.image_url ? (
                      <>
                        <img
                          src={product.image_url}
                          alt={product.name}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(event) => {
                            event.currentTarget.style.display =
                              'none'
                          }}
                        />

                        {/* Image overlay */}
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-primary/10 via-transparent to-brand-accent/10" />
                      </>
                    ) : (
                      <>
                        {/* Fallback background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/15 via-bg-surface to-brand-accent/10" />

                        <div
                          className="absolute inset-0 opacity-[0.04]"
                          style={{
                            backgroundImage: `
                              linear-gradient(
                                rgba(255, 255, 255, 0.8) 1px,
                                transparent 1px
                              ),
                              linear-gradient(
                                90deg,
                                rgba(255, 255, 255, 0.8) 1px,
                                transparent 1px
                              )
                            `,
                            backgroundSize:
                              '32px 32px',
                          }}
                        />

                        <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2">
                          <div className="absolute -inset-8 rounded-full bg-brand-primary/20 blur-2xl" />

                          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-brand-primary/20 bg-brand-primary/10 text-brand-primary backdrop-blur-xl transition-transform duration-300 group-hover:scale-105">
                            <Package className="h-7 w-7" />
                          </div>
                        </div>
                      </>
                    )}

                    {/* Category badge */}
                    <div className="absolute bottom-4 left-4">
                      <span className="inline-flex rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-md">
                        {product.category}
                      </span>
                    </div>

                    {/* Arrow */}
                    <div className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/35 text-white backdrop-blur-md transition-all duration-300 group-hover:border-brand-primary/40 group-hover:bg-brand-primary/20">
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>

                  {/* =====================================================
                      PRODUCT CONTENT
                  ====================================================== */}

                  <div className="relative p-6">
                    <div className="relative">
                      <h3 className="line-clamp-1 text-xl font-bold text-text-primary transition-colors group-hover:text-brand-primary">
                        {product.name}
                      </h3>

                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-text-muted">
                        {product.description}
                      </p>

                      <div className="mt-6 flex items-end justify-between gap-4 border-t border-border-default pt-5">
                        <div>
                          <p className="text-xs text-text-muted">
                            Price
                          </p>

                          <p className="mt-1 text-lg font-bold text-text-primary">
                            {formatPrice(
                              product.price,
                            )}
                          </p>
                        </div>

                        <div className="flex items-center gap-1 text-xs text-text-muted">
                          <ShoppingBag className="h-3.5 w-3.5" />

                          <span>
                            Stock {product.stock}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        )}

        {!loading && products.length > 6 && (
          <div className="mt-12 text-center">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-lg border border-border-default px-6 py-3 text-sm font-semibold text-text-primary transition-all hover:border-brand-primary/50 hover:text-brand-primary"
            >
              View All Products

              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}