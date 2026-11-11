import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ArrowLeft,
  ArrowUpRight,
  MoveUpRight,
  Package,
  ShoppingBag,
} from 'lucide-react'

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

function getCategoryStyle(category: string) {
  const value = category.toLowerCase()

  if (value.includes('design') || value.includes('ui') || value.includes('ux')) {
    return { dot: 'bg-[#7C3AED]', text: 'text-[#7C3AED]' }
  }

  if (value.includes('template') || value.includes('web')) {
    return { dot: 'bg-black', text: 'text-black' }
  }

  if (value.includes('music') || value.includes('audio')) {
    return { dot: 'bg-neutral-500', text: 'text-neutral-600' }
  }

  if (value.includes('animation') || value.includes('video')) {
    return { dot: 'bg-[#7C3AED]', text: 'text-[#7C3AED]' }
  }

  return { dot: 'bg-neutral-400', text: 'text-neutral-600' }
}

/* Gambar produk dengan fallback ikon */
function ProductImage({ src, alt }: { src?: string | null; alt: string }) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div
        className="relative flex h-full w-full items-center justify-center bg-neutral-50"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 15%, rgba(124,58,237,.16), transparent 55%), radial-gradient(circle at 85% 90%, rgba(231,143,186,.16), transparent 50%)',
        }}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #111 1px, transparent 1px), linear-gradient(to bottom, #111 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="relative flex h-12 w-12 items-center justify-center border border-black/10 bg-white text-neutral-400 transition-all duration-300 group-hover:border-[#7C3AED] group-hover:text-[#7C3AED]">
          <Package className="h-6 w-6" strokeWidth={1.5} />
        </div>
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
      draggable={false}
      className="h-full w-full object-cover"
    />
  )
}

export function DigitalProductsSection() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const railRef = useRef<HTMLDivElement | null>(null)
  const drag = useRef({ down: false, x: 0, left: 0, moved: false })
  const [dragging, setDragging] = useState(false)
  const [progress, setProgress] = useState(0)
  const [canNext, setCanNext] = useState(true)

  useEffect(() => {
    let mounted = true

    async function loadProducts() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/products`, {
          cache: 'no-store',
        })

        if (!response.ok) {
          throw new Error('Failed to fetch products.')
        }

        const result = (await response.json()) as ApiResponse<Product[]>

        if (!mounted) {
          return
        }

        if (result.success) {
          setProducts(
            (result.data ?? []).filter(
              (product) => product.status === 'Published' && product.stock > 0,
            ),
          )
        }
      } catch (error) {
        console.error('Load products error:', error)

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

  /* Reveal on scroll — dijalankan ulang setelah produk selesai dimuat */
  useEffect(() => {
    if (loading) return

    const items = document.querySelectorAll<HTMLElement>(
      '#digital-products [data-reveal]:not(.is-visible)',
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
      { threshold: 0.1, rootMargin: '0px 0px -5% 0px' },
    )

    items.forEach((item) => observer.observe(item))
    return () => observer.disconnect()
  }, [loading, products.length])

  /* Progress scroll rail */
  useEffect(() => {
    const rail = railRef.current
    if (!rail) return

    const update = () => {
      const max = rail.scrollWidth - rail.clientWidth
      setProgress(max > 0 ? rail.scrollLeft / max : 0)
      setCanNext(rail.scrollLeft < max - 4)
    }

    update()
    rail.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      rail.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [loading, products.length])

  const scrollRail = (dir: 1 | -1) => {
    const rail = railRef.current
    if (!rail) return
    rail.scrollBy({ left: dir * 276, behavior: 'smooth' })
  }

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || !railRef.current) return
    drag.current = {
      down: true,
      x: e.clientX,
      left: railRef.current.scrollLeft,
      moved: false,
    }
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d.down || !railRef.current) return
    const dx = e.clientX - d.x
    if (Math.abs(dx) > 5) {
      d.moved = true
      setDragging(true)
    }
    if (d.moved) railRef.current.scrollLeft = d.left - dx
  }

  const endDrag = () => {
    drag.current.down = false
    setDragging(false)
  }

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category))).filter(Boolean),
    [products],
  )

  if (!loading && products.length === 0) {
    return null
  }

  const visible = products.slice(0, 6)
  const marqueeItems = categories.length > 0 ? categories : ['Digital Products']

  return (
    <section
      id="digital-products"
      aria-labelledby="digital-products-section-title"
      className="dp relative overflow-hidden bg-white text-zinc-950"
    >
      {/* Background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 opacity-[0.018]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #111 1px, transparent 1px), linear-gradient(to bottom, #111 1px, transparent 1px)',
            backgroundSize: '100px 100px',
          }}
        />
        <div className="dp-float absolute right-[8%] top-[18%] h-2 w-2 rounded-full bg-[#7C3AED]" />
        <div
          className="dp-float absolute bottom-[23%] left-[5%] h-1.5 w-1.5 rounded-full bg-[#7C3AED]"
          style={{ animationDelay: '-2.5s' }}
        />
      </div>

      <div className="relative mx-auto max-w-[1240px] px-5 py-10 sm:px-8 sm:py-16 lg:px-10 lg:py-20">
        {/* Header */}
        <div
          data-reveal
          className="rv flex items-center justify-between border-t border-black/10 pt-4"
        >
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

        {/* ============================ INTRO ============================ */}
        <div className="mt-8 grid gap-6 sm:mt-10 lg:grid-cols-12 lg:items-end lg:gap-10">
          <div className="lg:col-span-7">
            <p
              data-reveal
              className="rv mb-4 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.22em] text-[#7C3AED]"
            >
              <ShoppingBag size={12} />
              Digital Catalog
            </p>

            <h2
              id="digital-products-section-title"
              data-reveal
              style={{ ['--d' as string]: '80ms' }}
              className="rv text-[clamp(2.4rem,5vw,4.6rem)] font-black leading-[0.9] tracking-[-0.065em] text-black"
            >
              Ready to use.
              <br />
              <span className="relative inline-block">
                <span className="relative z-10 text-neutral-300">
                  Ready to build.
                </span>
                <span
                  aria-hidden="true"
                  className="draw absolute bottom-[2%] left-0 right-[-2%] z-0 h-[0.09em] bg-[#7C3AED]"
                />
              </span>
            </h2>
          </div>

          <div
            data-reveal
            style={{ ['--d' as string]: '160ms' }}
            className="rv lg:col-span-5"
          >
            <p className="max-w-md text-sm font-medium leading-7 text-neutral-600 sm:text-[15px]">
              Tidak semua kebutuhan harus dimulai dari custom project. Beberapa
              karya sudah kami siapkan agar bisa langsung digunakan.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
              <div className="flex items-center gap-3 border border-black/10 bg-white px-3 py-2">
                <span className="relative flex h-2 w-2">
                  <span className="dp-ping absolute inline-flex h-full w-full rounded-full bg-[#7C3AED]" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#7C3AED]" />
                </span>
                <span className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-black">
                  {loading ? '—' : `${products.length} Available`}
                </span>
              </div>

              <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                Ready / Digital / Available
              </span>
            </div>
          </div>
        </div>

        {/* ============================ RAIL CONTROLS ============================ */}
        <div
          data-reveal
          className="rv mt-8 flex items-end justify-between gap-4 border-t border-black/10 pt-4 sm:mt-12 sm:pt-6"
        >
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-neutral-400">
              Available Now
            </p>
            <h3 className="mt-2 text-2xl font-black tracking-[-0.045em] text-black sm:text-3xl">
              Digital products.
              <span className="hidden text-neutral-300 sm:inline">
                {' '}
                Ready when you are.
              </span>
            </h3>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <span className="hidden font-mono text-[10px] font-bold tracking-[0.16em] text-neutral-400 sm:block">
              {loading || visible.length === 0
                ? '00'
                : String(
                  Math.min(
                    visible.length,
                    Math.round(progress * (visible.length - 1)) + 1,
                  ),
                ).padStart(2, '0')}
              <span className="text-neutral-300">
                {' '}
                / {String(visible.length).padStart(2, '0')}
              </span>
            </span>

            <button
              type="button"
              onClick={() => scrollRail(-1)}
              disabled={progress <= 0.01}
              aria-label="Produk sebelumnya"
              className="flex h-9 w-9 items-center justify-center border border-black/10 bg-white text-black transition-all duration-300 hover:border-[#7C3AED] hover:bg-[#7C3AED] hover:text-white disabled:pointer-events-none disabled:opacity-30"
            >
              <ArrowLeft size={14} />
            </button>
            <button
              type="button"
              onClick={() => scrollRail(1)}
              disabled={!canNext}
              aria-label="Produk berikutnya"
              className="flex h-9 w-9 items-center justify-center border border-black/10 bg-white text-black transition-all duration-300 hover:border-[#7C3AED] hover:bg-[#7C3AED] hover:text-white disabled:pointer-events-none disabled:opacity-30"
            >
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* ============================ LOADING ============================ */}
        {loading && (
          <div className="mt-6 flex items-end gap-3 overflow-hidden">
            {[300, 360, 320, 380].map((h, i) => (
              <div
                key={i}
                style={{ height: h }}
                className="w-[240px] shrink-0 animate-pulse border border-black/10 bg-neutral-100 sm:w-[260px]"
              />
            ))}
          </div>
        )}

        {/* ============================ PRODUCT RAIL ============================ */}
        {!loading && visible.length > 0 && (
          <>
            <div
              ref={railRef}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerLeave={endDrag}
              onClickCapture={(e) => {
                if (drag.current.moved) {
                  e.preventDefault()
                  e.stopPropagation()
                  drag.current.moved = false
                }
              }}
              className={`dp-rail -mx-5 mt-6 flex items-end gap-3 overflow-x-auto px-5 pb-2 sm:-mx-8 sm:gap-4 sm:px-8 lg:-mx-10 lg:px-10 ${dragging ? 'cursor-grabbing' : 'cursor-grab snap-x snap-mandatory'
                }`}
            >
              {/* Kartu pembuka */}
              <div
                data-reveal
                className="rv relative flex h-[340px] w-[240px] shrink-0 snap-start select-none flex-col justify-between overflow-hidden bg-black p-5 text-white sm:h-[380px] sm:w-[260px]"
              >
                <div
                  aria-hidden="true"
                  className="dp-float pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#7C3AED] opacity-70"
                />
                <p className="relative text-[9px] font-bold uppercase tracking-[0.22em] text-[#E78FBA]">
                  Digital Catalog
                </p>

                <div className="relative">
                  <p className="font-mono text-6xl font-black leading-none tracking-[-0.08em]">
                    {String(products.length).padStart(2, '0')}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="dp-ping absolute inline-flex h-full w-full rounded-full bg-[#7C3AED]" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-[#7C3AED]" />
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/70">
                      Ready to use
                    </span>
                  </div>
                  <p className="mt-3 text-xs font-medium leading-5 text-white/55">
                    Geser untuk melihat produk yang tersedia sekarang.
                  </p>
                </div>

                <span className="relative flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.18em] text-white/60">
                  Drag
                  <ArrowRight size={12} className="dp-nudge" />
                </span>
              </div>

              {visible.map((product, index) => {
                const categoryStyle = getCategoryStyle(product.category)
                const tall = index % 2 === 0

                return (
                  <Link
                    key={product.id}
                    to={`/products/${product.id}`}
                    draggable={false}
                    data-reveal
                    style={{ ['--d' as string]: `${Math.min(index, 3) * 90}ms` }}
                    className="rv group relative flex w-[240px] shrink-0 snap-start select-none flex-col overflow-hidden border border-black/10 bg-white transition-all duration-500 hover:-translate-y-1 hover:border-[#7C3AED]/50 hover:shadow-[0_20px_44px_-26px_rgba(124,58,237,0.55)] sm:w-[260px]"
                  >
                    <div className="absolute left-0 top-0 z-20 h-0.5 w-0 bg-[#7C3AED] transition-all duration-700 group-hover:w-full" />

                    {/* IMAGE — tinggi bergantian */}
                    <div
                      className={`relative overflow-hidden bg-neutral-100 ${tall ? 'aspect-[4/4.6]' : 'aspect-[4/3.2]'
                        }`}
                    >
                      <div className="absolute inset-0 transition-transform duration-[900ms] ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-[1.07]">
                        <ProductImage src={product.image_url} alt={product.name} />
                      </div>

                      <div className="dp-shine pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/30 opacity-0" />

                      <span className="absolute bottom-2 left-3 font-mono text-2xl font-black leading-none tracking-[-0.06em] text-white mix-blend-difference">
                        {String(index + 1).padStart(2, '0')}
                      </span>

                      <div className="absolute left-3 top-3">
                        <span className="inline-flex items-center gap-2 border border-white/70 bg-white/95 px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.16em] text-black backdrop-blur-sm">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${categoryStyle.dot}`}
                          />
                          {product.category}
                        </span>
                      </div>

                      <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center bg-white text-black opacity-0 shadow-sm transition-all duration-300 group-hover:opacity-100">
                        <ArrowUpRight size={14} />
                      </div>

                      <div className="absolute bottom-0 right-0 h-1 w-10 bg-[#7C3AED] transition-all duration-500 group-hover:w-20" />
                    </div>

                    {/* CONTENT */}
                    <div className="p-4">
                      <h3 className="line-clamp-2 text-base font-black leading-[1.05] tracking-[-0.04em] text-black transition-colors duration-300 group-hover:text-[#7C3AED]">
                        {product.name}
                      </h3>

                      <p className="mt-2 line-clamp-2 text-xs font-medium leading-5 text-neutral-500">
                        {product.description}
                      </p>

                      <div className="mt-4 flex items-end justify-between gap-3 border-t border-black/10 pt-3">
                        <div>
                          <p className="text-base font-black tracking-[-0.025em] text-black">
                            {formatPrice(product.price)}
                          </p>
                          <p className="mt-0.5 flex items-center gap-1.5 text-[10px] font-semibold text-neutral-500">
                            <ShoppingBag size={10} className="text-neutral-400" />
                            {product.stock} available
                          </p>
                        </div>

                        <div className="flex h-7 w-7 items-center justify-center border border-black/10 text-neutral-300 transition-all duration-300 group-hover:border-[#7C3AED] group-hover:bg-[#7C3AED] group-hover:text-white">
                          <ArrowRight
                            size={12}
                            className="transition-transform duration-300 group-hover:translate-x-0.5"
                          />
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}

              {/* Kartu penutup */}
              <Link
                to="/products"
                draggable={false}
                className="group relative flex h-[200px] w-[200px] shrink-0 snap-start select-none flex-col justify-between border border-black/10 bg-white p-5 transition-all duration-500 hover:border-[#7C3AED] hover:bg-[#7C3AED] hover:text-white sm:h-[220px]"
              >
                <span className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-neutral-400 transition-colors group-hover:text-white/70">
                  Catalog
                </span>
                <p className="text-xl font-black leading-[1] tracking-[-0.04em]">
                  View all
                  <br />
                  products
                </p>
                <ArrowUpRight
                  size={18}
                  className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
                />
              </Link>

              <div className="w-1 shrink-0" aria-hidden="true" />
            </div>

            {/* Progress */}
            <div className="mt-3 h-px w-full bg-black/10">
              <div
                className="h-px origin-left bg-[#7C3AED] transition-transform duration-200"
                style={{ transform: `scaleX(${Math.max(0.08, progress)})` }}
              />
            </div>
          </>
        )}

        {/* ============================ CUSTOM PROJECT ============================ */}
        {!loading && products.length > 0 && (
          <div
            data-reveal
            className="rv relative mt-12 overflow-hidden bg-black text-white sm:mt-16"
          >
            <div
              aria-hidden="true"
              className="dp-float pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-[#7C3AED] opacity-60"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute right-[30%] top-1/2 hidden h-20 w-20 -translate-y-1/2 rounded-full border border-white/10 lg:block"
            />

            <div className="relative z-10 grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-12 lg:p-10">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#E78FBA]">
                  Need Something Custom?
                </p>

                <h3 className="mt-3 max-w-3xl text-3xl font-black leading-[0.94] tracking-[-0.05em] sm:text-4xl">
                  Can&apos;t find what
                  <span className="text-white/35"> you need?</span>
                </h3>

                <p className="mt-4 max-w-xl text-xs font-medium leading-6 text-white/55 sm:text-sm">
                  Kalau kebutuhanmu belum tersedia di katalog, mulai custom
                  project bersama 39Production dan ceritakan apa yang ingin kamu
                  buat.
                </p>
              </div>

              <Link
                to="/contact"
                className="group inline-flex w-full items-center justify-center gap-3 bg-white px-5 py-3.5 text-[9px] font-bold uppercase tracking-[0.14em] text-black transition-all duration-300 hover:bg-[#7C3AED] hover:text-white sm:w-fit"
              >
                Start a Project
                <ArrowRight
                  size={14}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            </div>

            {/* Marquee kategori */}
            <div
              aria-hidden="true"
              className="relative z-10 overflow-hidden border-t border-white/10 py-3.5"
            >
              <div className="dp-marquee flex w-max items-center gap-7 whitespace-nowrap">
                {[0, 1].map((copy) => (
                  <div key={copy} className="flex items-center gap-7">
                    {Array.from({ length: 6 }).flatMap((_, round) =>
                      marqueeItems.map((item) => (
                        <span
                          key={`${copy}-${round}-${item}`}
                          className="flex items-center gap-7"
                        >
                          <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-white/40">
                            {item}
                          </span>
                          <span className="h-1 w-1 rounded-full bg-[#7C3AED]" />
                        </span>
                      )),
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer line */}
        <div
          data-reveal
          className="rv mt-8 flex items-center justify-between border-t border-black/10 pt-4"
        >
          <span className="font-mono text-[8px] font-bold tracking-[0.18em] text-neutral-400">
            39PRODUCTION
          </span>
          <span className="hidden text-[8px] font-semibold uppercase tracking-[0.18em] text-neutral-400 sm:block">
            Digital Products / Available Now
          </span>
          <MoveUpRight size={13} className="text-neutral-400" />
        </div>
      </div>

      <style>{`
        .dp .rv {
          opacity: 0;
          transform: translate3d(0, 22px, 0);
          transition:
            opacity .85s cubic-bezier(.2,.7,.2,1) var(--d, 0ms),
            transform .85s cubic-bezier(.2,.7,.2,1) var(--d, 0ms),
            border-color .5s, box-shadow .5s;
          will-change: transform, opacity;
        }
        .dp .rv.is-visible { opacity: 1; transform: none; }

        .dp .draw {
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 1s cubic-bezier(.77,0,.18,1) .7s;
        }
        .dp .rv.is-visible .draw { transform: scaleX(1); }

        .dp .dp-rail {
          scrollbar-width: none;
          -ms-overflow-style: none;
          scroll-padding-left: 1.25rem;
        }
        .dp .dp-rail::-webkit-scrollbar { display: none; }
        @keyframes dp-nudge {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(6px); }
        }
        .dp .dp-nudge { animation: dp-nudge 1.6s ease-in-out infinite; }
        .dp article.rv.is-visible:hover, .dp a.rv.is-visible:hover { transform: translateY(-4px); }

        @keyframes dp-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-9px); }
        }
        .dp .dp-float { animation: dp-float 6s ease-in-out infinite; }

        @keyframes dp-ping {
          0% { transform: scale(1); opacity: .6; }
          80%, 100% { transform: scale(2.6); opacity: 0; }
        }
        .dp .dp-ping { animation: dp-ping 1.8s cubic-bezier(0,0,.2,1) infinite; }

        @keyframes dp-marquee { to { transform: translateX(-50%); } }
        .dp .dp-marquee { animation: dp-marquee 50s linear infinite; }

        @keyframes dp-shine {
          0% { left: -50%; opacity: 0; }
          30% { opacity: 1; }
          100% { left: 130%; opacity: 0; }
        }
        .dp .group:hover .dp-shine { animation: dp-shine .9s ease-out; }

        @media (prefers-reduced-motion: reduce) {
          .dp .rv {
            opacity: 1 !important;
            transform: none !important;
            transition: none !important;
          }
          .dp .draw { transform: scaleX(1) !important; transition: none !important; }
          .dp .dp-float, .dp .dp-ping, .dp .dp-nudge, .dp .dp-marquee, .dp .group:hover .dp-shine {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  )
}