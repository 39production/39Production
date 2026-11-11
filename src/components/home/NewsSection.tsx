import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ArrowUpRight,
  Clock3,
  Newspaper,
  Sparkles,
} from 'lucide-react'

const API_BASE_URL = 'https://39production-api.39production.workers.dev'

interface News {
  id: number
  title: string
  slug?: string
  excerpt?: string
  content?: string
  category: string
  image_url?: string
  status: string
  published_at?: string
  created_at?: string
}

interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

function formatDate(date?: string) {
  if (!date) {
    return ''
  }

  const parsed = new Date(date)

  if (Number.isNaN(parsed.getTime())) {
    return date
  }

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  }).format(parsed)
}

function getNewsUrl(item: News) {
  if (item.slug) {
    return `/news/${item.slug}`
  }

  return '/news'
}

/* Gambar berita dengan fallback placeholder */
function NewsImage({
  src,
  alt,
  iconSize = 'h-7 w-7',
}: {
  src?: string
  alt: string
  iconSize?: string
}) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div
        className="absolute inset-0 flex items-center justify-center bg-neutral-50"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 15%, rgba(124,58,237,.16), transparent 55%), radial-gradient(circle at 85% 90%, rgba(231,143,186,.16), transparent 50%)',
        }}
      >
        <div className="flex h-12 w-12 items-center justify-center border border-neutral-200 bg-white text-neutral-400 transition-all duration-500 group-hover:border-[#7C3AED] group-hover:text-[#7C3AED]">
          <Newspaper className={iconSize} strokeWidth={1.5} />
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
      className="absolute inset-0 h-full w-full object-cover"
    />
  )
}

export function NewsSection() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const [news, setNews] = useState<News[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function loadNews() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/news`, {
          cache: 'no-store',
        })

        if (!response.ok) {
          throw new Error('Failed to fetch news.')
        }

        const result = (await response.json()) as ApiResponse<News[]>

        if (!mounted) {
          return
        }

        if (result.success) {
          const publishedNews = (result.data ?? [])
            .filter((item) => item.status === 'Published')
            .sort((a, b) => {
              const dateA = new Date(
                a.published_at ?? a.created_at ?? '',
              ).getTime()

              const dateB = new Date(
                b.published_at ?? b.created_at ?? '',
              ).getTime()

              return dateB - dateA
            })

          setNews(publishedNews)
        } else {
          setNews([])
        }
      } catch (error) {
        console.error('Load news error:', error)

        if (mounted) {
          setNews([])
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadNews()

    return () => {
      mounted = false
    }
  }, [])

  /* Reveal on scroll — dijalankan ulang setelah berita selesai dimuat */
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const items = section.querySelectorAll<HTMLElement>(
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
      { threshold: 0.1, rootMargin: '0px 0px -5% 0px' },
    )

    items.forEach((item) => observer.observe(item))
    return () => observer.disconnect()
  }, [loading, news.length])

  /* Parallax foto utama */
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let ticking = false

    const update = () => {
      const vh = window.innerHeight
      section
        .querySelectorAll<HTMLElement>('[data-parallax]')
        .forEach((el) => {
          const speed = Number(el.getAttribute('data-parallax')) || 0.05
          const rect = el.parentElement!.getBoundingClientRect()
          if (rect.bottom < -200 || rect.top > vh + 200) return
          const offset = (rect.top + rect.height / 2 - vh / 2) * speed
          el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0) scale(1.1)`
        })
      ticking = false
    }

    const onScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(update)
      }
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [loading, news.length])

  const visibleNews = useMemo(() => {
    return news.slice(0, 6)
  }, [news])

  /*
   * Tidak menampilkan section apabila
   * belum ada berita yang published.
   */
  if (!loading && news.length === 0) {
    return null
  }

  const featuredNews = visibleNews[0]
  const secondaryNews = visibleNews.slice(1)

  return (
    <section
      ref={sectionRef}
      id="news"
      aria-labelledby="news-section-title"
      className="nw relative isolate overflow-hidden bg-white"
    >
      {/* Background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.028]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #111 1px, transparent 1px), linear-gradient(to bottom, #111 1px, transparent 1px)',
          backgroundSize: '100px 100px',
        }}
      />

      <div
        aria-hidden="true"
        className="nw-float pointer-events-none absolute left-[8%] top-[16%] -z-10 h-2 w-2 rounded-full bg-[#7C3AED]"
      />

      <div
        aria-hidden="true"
        className="nw-float pointer-events-none absolute bottom-[18%] right-[11%] -z-10 hidden h-1.5 w-1.5 rounded-full bg-black/20 sm:block"
        style={{ animationDelay: '-2.5s' }}
      />

      <div className="relative z-10 mx-auto max-w-[1240px] px-5 py-12 sm:px-8 sm:py-16 lg:px-10 lg:py-20">
        {/* ============================ HEADER ============================ */}
        <div className="flex flex-col gap-5 border-b border-black/10 pb-6 sm:pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div
              data-reveal
              className="rv mb-4 flex items-center gap-3"
            >
              <span className="flex h-8 w-8 items-center justify-center bg-black text-white">
                <Newspaper className="h-3.5 w-3.5" strokeWidth={1.8} />
              </span>

              <span className="nw-grow h-px w-8 origin-left bg-[#7C3AED]" />

              <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-neutral-400">
                39Production Journal
              </span>
            </div>

            <h2
              id="news-section-title"
              data-reveal
              style={{ ['--d' as string]: '80ms' }}
              className="rv max-w-3xl text-[clamp(2.2rem,4.6vw,4.2rem)] font-black leading-[0.92] tracking-[-0.065em] text-black"
            >
              Stories, updates,
              <br />
              <span className="relative inline-block">
                <span className="relative z-10 text-neutral-300">
                  and things we&apos;re making.
                </span>
                <span
                  aria-hidden="true"
                  className="nw-draw absolute bottom-[2%] left-0 right-[-2%] z-0 h-[0.09em] bg-[#7C3AED]"
                />
              </span>
            </h2>

            <p
              data-reveal
              style={{ ['--d' as string]: '160ms' }}
              className="rv mt-5 max-w-xl text-sm leading-7 text-neutral-500"
            >
              Ikuti perkembangan terbaru dari 39Production — mulai dari
              project, produk digital, creative technology, hingga
              entertainment.
            </p>
          </div>

          {!loading && news.length > 0 && (
            <Link
              to="/news"
              data-reveal
              style={{ ['--d' as string]: '220ms' }}
              className="rv group inline-flex w-fit items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-black transition-colors duration-300 hover:text-[#7C3AED]"
            >
              View all updates
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          )}
        </div>

        {/* ============================ LOADING ============================ */}
        {loading ? (
          <div className="mt-8 grid gap-4 lg:grid-cols-12 lg:gap-6">
            <div className="lg:col-span-7">
              <div className="aspect-[4/3] animate-pulse bg-neutral-100" />
              <div className="-mt-10 ml-4 mr-4 space-y-3 border border-neutral-200 bg-white p-5 sm:ml-8">
                <div className="h-3 w-24 animate-pulse bg-neutral-100" />
                <div className="h-6 w-4/5 animate-pulse bg-neutral-100" />
                <div className="h-3 w-2/3 animate-pulse bg-neutral-100" />
              </div>
            </div>

            <div className="space-y-3 lg:col-span-5">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="flex gap-3 border border-neutral-200 bg-white p-2.5"
                >
                  <div className="h-[88px] w-[88px] shrink-0 animate-pulse bg-neutral-100" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-3 w-20 animate-pulse bg-neutral-100" />
                    <div className="h-4 w-full animate-pulse bg-neutral-100" />
                    <div className="h-3 w-3/5 animate-pulse bg-neutral-100" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-12 lg:gap-8">
            {/* ============================ FEATURED ============================ */}
            {featuredNews && (
              <Link
                to={getNewsUrl(featuredNews)}
                data-reveal
                className="rv group relative block lg:col-span-7"
              >
                {/* Foto */}
                <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100 sm:aspect-[16/10] lg:mr-8">
                  <div
                    data-parallax="0.05"
                    className="absolute inset-0 will-change-transform"
                  >
                    <div className="absolute inset-0 transition-transform duration-[1200ms] ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-[1.05]">
                      <NewsImage
                        src={featuredNews.image_url}
                        alt={featuredNews.title}
                      />
                    </div>
                  </div>

                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent"
                  />

                  <div
                    aria-hidden="true"
                    className="nw-sweep pointer-events-none absolute inset-y-0 -left-1/3 w-1/4 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                  />

                  {/* Latest badge */}
                  <div className="absolute left-4 top-4 sm:left-5 sm:top-5">
                    <span className="inline-flex items-center gap-2 bg-black px-3.5 py-2 text-[9px] font-bold uppercase tracking-[0.14em] text-white">
                      <Sparkles className="nw-twinkle h-3 w-3 text-[#7C3AED]" />
                      Latest Update
                    </span>
                  </div>

                  <div className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center bg-white text-black opacity-0 shadow-sm transition-all duration-300 group-hover:opacity-100 sm:right-5 sm:top-5">
                    <ArrowUpRight className="h-4 w-4" />
                  </div>

                  <div className="absolute bottom-0 left-0 h-1 w-20 bg-[#7C3AED] transition-all duration-500 group-hover:w-32" />
                </div>

                {/* Kartu teks — menimpa foto */}
                <div className="relative z-10 -mt-10 ml-4 mr-4 border border-neutral-200 bg-white p-5 transition-all duration-500 group-hover:border-[#7C3AED]/50 group-hover:shadow-[0_22px_50px_-28px_rgba(124,58,237,0.55)] sm:-mt-14 sm:ml-8 sm:mr-0 sm:p-6 lg:ml-12">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-2 border border-[#7C3AED]/20 bg-[#7C3AED]/5 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.13em] text-[#7C3AED]">
                      <span className="nw-ping h-1.5 w-1.5 rounded-full bg-[#7C3AED]" />
                      {featuredNews.category}
                    </span>

                    {(featuredNews.published_at ?? featuredNews.created_at) && (
                      <>
                        <span className="h-3 w-px bg-neutral-200" />

                        <span className="flex items-center gap-1.5 text-xs text-neutral-400">
                          <Clock3 className="h-3.5 w-3.5" />
                          {formatDate(
                            featuredNews.published_at ?? featuredNews.created_at,
                          )}
                        </span>
                      </>
                    )}
                  </div>

                  <h3 className="mt-4 max-w-2xl text-xl font-black leading-[1.08] tracking-[-0.04em] text-black transition-colors duration-300 group-hover:text-[#7C3AED] sm:text-2xl lg:text-3xl">
                    {featuredNews.title}
                  </h3>

                  {featuredNews.excerpt && (
                    <p className="mt-3 line-clamp-3 max-w-xl text-sm leading-7 text-neutral-500">
                      {featuredNews.excerpt}
                    </p>
                  )}

                  <div className="mt-5 flex items-center justify-between gap-5 border-t border-neutral-200 pt-4">
                    <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-neutral-400">
                      Featured Story
                    </span>

                    <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-black transition-colors group-hover:text-[#7C3AED]">
                      Read update
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </Link>
            )}

            {/* ============================ FEED ============================ */}
            <div className="lg:col-span-5">
              {secondaryNews.length > 0 && (
                <div
                  data-reveal
                  className="rv mb-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="nw-ping h-1.5 w-1.5 rounded-full bg-[#7C3AED]" />
                    <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-neutral-400">
                      More stories
                    </span>
                  </div>
                  <span className="font-mono text-[9px] font-bold tracking-[0.16em] text-neutral-300">
                    {String(secondaryNews.length).padStart(2, '0')} NEW
                  </span>
                </div>
              )}

              <div
                data-reveal
                className="nw-feed relative pl-6"
              >
                {/* Garis alur */}
                <span
                  aria-hidden="true"
                  className="absolute bottom-3 left-[5px] top-3 w-px bg-black/10"
                />
                <span
                  aria-hidden="true"
                  className="nw-line absolute bottom-3 left-[5px] top-3 w-px origin-top bg-[#7C3AED]"
                />

                <div className="space-y-3">
                  {secondaryNews.map((item, index) => (
                    <Link
                      key={item.id}
                      to={getNewsUrl(item)}
                      data-reveal
                      style={{ ['--d' as string]: `${index * 90}ms` }}
                      className={`rv group relative flex gap-3.5 overflow-hidden border border-neutral-200 bg-white p-2.5 transition-all duration-500 hover:border-[#7C3AED]/50 hover:shadow-[0_18px_40px_-26px_rgba(124,58,237,0.55)] sm:gap-4 sm:p-3 ${index % 2 === 1 ? 'lg:ml-5' : ''
                        }`}
                    >
                      {/* Node timeline */}
                      <span
                        aria-hidden="true"
                        className="nw-node absolute -left-6 top-6 h-[11px] w-[11px] border border-black/20 bg-white transition-colors duration-500"
                      />

                      <div className="absolute left-0 top-0 z-10 h-0.5 w-0 bg-[#7C3AED] transition-all duration-700 group-hover:w-full" />

                      {/* Thumbnail */}
                      <div className="relative h-[92px] w-[92px] shrink-0 overflow-hidden bg-neutral-100 sm:h-[104px] sm:w-[104px]">
                        <div className="absolute inset-0 transition-transform duration-[900ms] ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-[1.1]">
                          <NewsImage
                            src={item.image_url}
                            alt={item.title}
                            iconSize="h-5 w-5"
                          />
                        </div>
                        <div className="pointer-events-none absolute inset-0 bg-[#7C3AED]/0 mix-blend-multiply transition-colors duration-500 group-hover:bg-[#7C3AED]/20" />
                      </div>

                      {/* Teks */}
                      <div className="flex min-w-0 flex-1 flex-col justify-center py-0.5 pr-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[0.16em] text-[#7C3AED]">
                            <span className="h-1 w-1 rounded-full bg-[#7C3AED]" />
                            {item.category}
                          </span>

                          <span className="flex shrink-0 items-center gap-1 text-[9px] font-medium uppercase tracking-[0.08em] text-neutral-400">
                            <Clock3 className="h-3 w-3" />
                            {formatDate(item.published_at ?? item.created_at)}
                          </span>
                        </div>

                        <h3 className="mt-1.5 line-clamp-2 text-[15px] font-black leading-[1.15] tracking-[-0.03em] text-black transition-colors duration-300 group-hover:text-[#7C3AED]">
                          {item.title}
                        </h3>

                        <span className="mt-2 inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-neutral-400 transition-colors duration-300 group-hover:text-[#7C3AED]">
                          Read more
                          <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>

                {secondaryNews.length === 0 && (
                  <div className="flex min-h-[140px] items-center justify-center border border-dashed border-neutral-200 bg-neutral-50 text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-300">
                    More stories coming
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================ BOTTOM CTA ============================ */}
        {!loading && news.length > 6 && (
          <div
            data-reveal
            className="rv mt-10 flex justify-center border-t border-black/10 pt-8"
          >
            <Link
              to="/news"
              className="group inline-flex w-full items-center justify-center gap-3 bg-black px-6 py-3.5 text-xs font-bold uppercase tracking-[0.1em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#7C3AED] sm:w-auto"
            >
              Explore all updates
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        )}

        {/* Small footer statement */}
        {!loading && news.length > 0 && (
          <div
            data-reveal
            className="rv mt-8 flex flex-col gap-3 border-t border-black/5 pt-6 sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-neutral-400">
              39Production Journal
            </p>

            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-300">
              Create · Produce · Deliver
            </p>
          </div>
        )}
      </div>

      <style>{`
        .nw .rv {
          opacity: 0;
          transform: translate3d(0, 22px, 0);
          transition:
            opacity .85s cubic-bezier(.2,.7,.2,1) var(--d, 0ms),
            transform .85s cubic-bezier(.2,.7,.2,1) var(--d, 0ms),
            border-color .5s, box-shadow .5s;
          will-change: transform, opacity;
        }
        .nw .rv.is-visible { opacity: 1; transform: none; }
        .nw a.rv.is-visible:hover { transform: translateY(-3px); }

        .nw .nw-grow {
          transform: scaleX(0);
          transition: transform 1s cubic-bezier(.77,0,.18,1) .5s;
        }
        .nw .rv.is-visible .nw-grow { transform: scaleX(1); }

        .nw .nw-draw {
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 1s cubic-bezier(.77,0,.18,1) .8s;
        }
        .nw .rv.is-visible .nw-draw { transform: scaleX(1); }

        /* Garis timeline tumbuh turun saat feed terlihat */
        .nw .nw-line {
          transform: scaleY(0);
          transition: transform 1.8s cubic-bezier(.77,0,.18,1) .3s;
        }
        .nw .nw-feed.is-visible .nw-line { transform: scaleY(1); }

        /* Node berubah ungu saat kartunya muncul */
        .nw .rv.is-visible .nw-node {
          background: #7C3AED;
          border-color: #7C3AED;
          animation: nw-node-pop .6s ease-out .3s both;
        }
        @keyframes nw-node-pop {
          0% { box-shadow: 0 0 0 0 rgba(124,58,237,.5); }
          100% { box-shadow: 0 0 0 10px rgba(124,58,237,0); }
        }

        /* Kilau pada foto utama */
        @keyframes nw-sweep {
          0%, 55% { left: -35%; opacity: 0; }
          65% { opacity: 1; }
          100% { left: 130%; opacity: 0; }
        }
        .nw .nw-sweep { animation: nw-sweep 7s ease-in-out infinite; }

        @keyframes nw-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-9px); }
        }
        .nw .nw-float { animation: nw-float 6s ease-in-out infinite; }

        @keyframes nw-ping {
          0%, 100% { box-shadow: 0 0 0 0 rgba(124,58,237,.5); }
          50% { box-shadow: 0 0 0 6px rgba(124,58,237,0); }
        }
        .nw .nw-ping { animation: nw-ping 2s ease-out infinite; }

        @keyframes nw-twinkle {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; }
          50% { transform: scale(1.3) rotate(20deg); opacity: .6; }
        }
        .nw .nw-twinkle { animation: nw-twinkle 2.6s ease-in-out infinite; }

        @media (prefers-reduced-motion: reduce) {
          .nw .rv {
            opacity: 1 !important;
            transform: none !important;
            transition: none !important;
          }
          .nw .nw-grow, .nw .nw-draw { transform: scaleX(1) !important; transition: none !important; }
          .nw .nw-line { transform: scaleY(1) !important; transition: none !important; }
          .nw .nw-sweep, .nw .nw-float, .nw .nw-ping, .nw .nw-twinkle,
          .nw .rv.is-visible .nw-node { animation: none !important; }
        }
      `}</style>
    </section>
  )
}