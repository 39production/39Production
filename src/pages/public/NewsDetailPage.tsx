import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  FileText,
  Newspaper,
} from 'lucide-react'
import {
  Link,
  useParams,
} from 'react-router-dom'
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from 'react'

const API_BASE_URL =
  'https://39production-api.39production.workers.dev'

const SITE_URL = 'https://39production.digital'

interface News {
  id: number
  title: string
  category: string
  author: string
  excerpt: string
  content: string
  date: string
  status: 'Published' | 'Draft'
  image_url?: string | null
}

async function apiRequest<T>(
  endpoint: string,
): Promise<T> {
  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
  )

  const text = await response.text()

  let result: any

  try {
    result = JSON.parse(text)
  } catch {
    throw new Error(
      `API response tidak valid (${response.status}).`,
    )
  }

  if (!response.ok || !result.success) {
    throw new Error(
      result.message ||
      'Gagal mengambil data.',
    )
  }

  return result.data
}

function formatDate(date: string) {
  const parsedDate = new Date(
    `${date}T00:00:00`,
  )

  if (Number.isNaN(parsedDate.getTime())) {
    return date
  }

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(parsedDate)
}

function getDateParts(date: string) {
  const parsedDate = new Date(
    `${date}T00:00:00`,
  )

  if (Number.isNaN(parsedDate.getTime())) {
    return {
      day: '--',
      month: '---',
      year: '----',
    }
  }

  return {
    day: new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
    }).format(parsedDate),

    month: new Intl.DateTimeFormat('id-ID', {
      month: 'short',
    })
      .format(parsedDate)
      .replace('.', '')
      .toUpperCase(),

    year: new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
    }).format(parsedDate),
  }
}

/* ─────────────────────────────────────────────
   SEO HELPERS
───────────────────────────────────────────── */

function setMetaTag(
  attribute: 'name' | 'property',
  key: string,
  content: string,
) {
  let element = document.head.querySelector(
    `meta[${attribute}="${key}"]`,
  ) as HTMLMetaElement | null

  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }

  element.setAttribute('content', content)

  return element
}

function setCanonical(url: string) {
  let canonical = document.head.querySelector(
    'link[rel="canonical"]',
  ) as HTMLLinkElement | null

  if (!canonical) {
    canonical = document.createElement('link')
    canonical.setAttribute('rel', 'canonical')
    document.head.appendChild(canonical)
  }

  canonical.setAttribute('href', url)

  return canonical
}

const delay = (ms: number) =>
  ({ '--d': `${ms}ms` }) as CSSProperties

/* Gambar dummy lokal (SVG) — dipakai bila foto artikel kosong / gagal */
function ArticleArt() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden bg-[#0d0820]"
    >
      <svg
        viewBox="0 0 800 400"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <radialGradient id="nd-art-a" cx="14%" cy="10%" r="75%">
            <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="nd-art-b" cx="94%" cy="96%" r="60%">
            <stop offset="0%" stopColor="#E78FBA" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#E78FBA" stopOpacity="0" />
          </radialGradient>
          <pattern
            id="nd-art-g"
            width="28"
            height="28"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M28 0H0V28"
              fill="none"
              stroke="#fff"
              strokeOpacity="0.05"
            />
          </pattern>
        </defs>

        <rect width="800" height="400" fill="url(#nd-art-a)" />
        <rect width="800" height="400" fill="url(#nd-art-b)" />
        <rect width="800" height="400" fill="url(#nd-art-g)" />

        <text
          x="36"
          y="372"
          fill="none"
          stroke="#fff"
          strokeOpacity="0.2"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          fontSize="190"
          fontWeight="900"
          letterSpacing="-14"
        >
          39
        </text>

        {/* lembar koran */}
        <g className="nd-art-paper" transform="translate(520 70)">
          <rect width="190" height="250" fill="#fff" stroke="#111" strokeWidth="2" />
          <rect x="14" y="14" width="162" height="26" fill="#111" />
          <rect x="14" y="52" width="86" height="64" fill="#7C3AED" />
          <rect x="110" y="52" width="66" height="8" fill="#111" opacity="0.7" />
          <rect x="110" y="68" width="66" height="6" fill="#111" opacity="0.2" />
          <rect x="110" y="80" width="52" height="6" fill="#111" opacity="0.2" />
          {[130, 144, 158, 172, 186, 200, 214].map((y) => (
            <rect key={y} x="14" y={y} width="162" height="5" fill="#111" opacity="0.16" />
          ))}
        </g>
        <g transform="translate(556 52) rotate(6)" opacity="0.35">
          <rect width="190" height="250" fill="#E78FBA" />
        </g>
      </svg>
    </div>
  )
}

export function NewsDetailPage() {
  const { id } = useParams()

  const [news, setNews] =
    useState<News | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  /*
   * ============================================================
   * LOAD NEWS
   * ============================================================
   */

  useEffect(() => {
    async function loadNews() {
      if (!id) {
        setError(
          'News ID is not available.',
        )
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError('')

        const data =
          await apiRequest<News>(
            `/api/news/${id}`,
          )

        if (data.status !== 'Published') {
          setError(
            'This news article is not available.',
          )
          setLoading(false)
          return
        }

        setNews(data)
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Gagal mengambil artikel.',
        )
      } finally {
        setLoading(false)
      }
    }

    void loadNews()
  }, [id])

  /*
   * ============================================================
   * DYNAMIC SEO
   * ============================================================
   */

  useEffect(() => {
    if (!news) return

    const previousTitle = document.title

    const previousDescription =
      document.head.querySelector(
        'meta[name="description"]',
      ) as HTMLMetaElement | null

    const previousKeywords =
      document.head.querySelector(
        'meta[name="keywords"]',
      ) as HTMLMetaElement | null

    const previousRobots =
      document.head.querySelector(
        'meta[name="robots"]',
      ) as HTMLMetaElement | null

    const previousCanonical =
      document.head.querySelector(
        'link[rel="canonical"]',
      ) as HTMLLinkElement | null

    const previousOgTitle =
      document.head.querySelector(
        'meta[property="og:title"]',
      ) as HTMLMetaElement | null

    const previousOgDescription =
      document.head.querySelector(
        'meta[property="og:description"]',
      ) as HTMLMetaElement | null

    const previousOgUrl =
      document.head.querySelector(
        'meta[property="og:url"]',
      ) as HTMLMetaElement | null

    const previousOgType =
      document.head.querySelector(
        'meta[property="og:type"]',
      ) as HTMLMetaElement | null

    const previousOgSiteName =
      document.head.querySelector(
        'meta[property="og:site_name"]',
      ) as HTMLMetaElement | null

    const previousOgImage =
      document.head.querySelector(
        'meta[property="og:image"]',
      ) as HTMLMetaElement | null

    const previousTwitterCard =
      document.head.querySelector(
        'meta[name="twitter:card"]',
      ) as HTMLMetaElement | null

    const previousTwitterTitle =
      document.head.querySelector(
        'meta[name="twitter:title"]',
      ) as HTMLMetaElement | null

    const previousTwitterDescription =
      document.head.querySelector(
        'meta[name="twitter:description"]',
      ) as HTMLMetaElement | null

    const previousTwitterImage =
      document.head.querySelector(
        'meta[name="twitter:image"]',
      ) as HTMLMetaElement | null

    const previousJsonLd =
      document.getElementById(
        'news-article-jsonld',
      )

    const articleUrl =
      `${SITE_URL}/news/${news.id}`

    const description =
      news.excerpt?.trim() ||
      news.content
        ?.replace(/\s+/g, ' ')
        .trim()
        .slice(0, 160) ||
      `${news.title} — 39Production Journal.`

    const keywords = [
      '39Production',
      '39Production Journal',
      news.category,
      news.title,
      'creative production',
      'digital production',
      'creative technology',
      'Indonesia',
    ]
      .filter(Boolean)
      .join(', ')

    const imageUrl =
      news.image_url ||
      `${SITE_URL}/og-image.jpg`

    /*
     * PAGE TITLE
     */

    document.title =
      `${news.title} — 39Production Journal`

    /*
     * BASIC SEO
     */

    setMetaTag(
      'name',
      'description',
      description,
    )

    setMetaTag(
      'name',
      'keywords',
      keywords,
    )

    setMetaTag(
      'name',
      'robots',
      'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    )

    /*
     * OPEN GRAPH
     */

    setMetaTag(
      'property',
      'og:title',
      `${news.title} — 39Production Journal`,
    )

    setMetaTag(
      'property',
      'og:description',
      description,
    )

    setMetaTag(
      'property',
      'og:url',
      articleUrl,
    )

    setMetaTag(
      'property',
      'og:type',
      'article',
    )

    setMetaTag(
      'property',
      'og:site_name',
      '39Production',
    )

    setMetaTag(
      'property',
      'og:image',
      imageUrl,
    )

    setMetaTag(
      'property',
      'article:section',
      news.category,
    )

    setMetaTag(
      'property',
      'article:published_time',
      news.date,
    )

    /*
     * TWITTER CARD
     */

    setMetaTag(
      'name',
      'twitter:card',
      'summary_large_image',
    )

    setMetaTag(
      'name',
      'twitter:title',
      `${news.title} — 39Production Journal`,
    )

    setMetaTag(
      'name',
      'twitter:description',
      description,
    )

    setMetaTag(
      'name',
      'twitter:image',
      imageUrl,
    )

    /*
     * CANONICAL
     */

    setCanonical(articleUrl)

    /*
     * JSON-LD
     */

    const jsonLd =
      document.createElement('script')

    jsonLd.id = 'news-article-jsonld'
    jsonLd.type = 'application/ld+json'

    jsonLd.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',

      headline: news.title,

      description,

      url: articleUrl,

      image: [imageUrl],

      datePublished: news.date,

      dateModified: news.date,

      author: {
        '@type': 'Person',
        name: news.author,
      },

      publisher: {
        '@type': 'Organization',
        name: '39Production',
        url: SITE_URL,
      },

      articleSection:
        news.category,

      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': articleUrl,
      },

      isPartOf: {
        '@type': 'Blog',
        name: '39Production Journal',
        url: `${SITE_URL}/news`,
      },
    })

    document.head.appendChild(jsonLd)

    /*
     * CLEANUP
     */

    return () => {
      document.title = previousTitle

      if (previousDescription) {
        setMetaTag(
          'name',
          'description',
          previousDescription.content,
        )
      } else {
        document.head
          .querySelector(
            'meta[name="description"]',
          )
          ?.remove()
      }

      if (previousKeywords) {
        setMetaTag(
          'name',
          'keywords',
          previousKeywords.content,
        )
      } else {
        document.head
          .querySelector(
            'meta[name="keywords"]',
          )
          ?.remove()
      }

      if (previousRobots) {
        setMetaTag(
          'name',
          'robots',
          previousRobots.content,
        )
      } else {
        document.head
          .querySelector(
            'meta[name="robots"]',
          )
          ?.remove()
      }

      if (previousCanonical) {
        setCanonical(
          previousCanonical.href,
        )
      } else {
        document.head
          .querySelector(
            'link[rel="canonical"]',
          )
          ?.remove()
      }

      const restoreMeta = (
        attribute:
          | 'name'
          | 'property',
        key: string,
        previous:
          | HTMLMetaElement
          | null,
      ) => {
        if (previous) {
          setMetaTag(
            attribute,
            key,
            previous.content,
          )
        } else {
          document.head
            .querySelector(
              `meta[${attribute}="${key}"]`,
            )
            ?.remove()
        }
      }

      restoreMeta(
        'property',
        'og:title',
        previousOgTitle,
      )

      restoreMeta(
        'property',
        'og:description',
        previousOgDescription,
      )

      restoreMeta(
        'property',
        'og:url',
        previousOgUrl,
      )

      restoreMeta(
        'property',
        'og:type',
        previousOgType,
      )

      restoreMeta(
        'property',
        'og:site_name',
        previousOgSiteName,
      )

      restoreMeta(
        'property',
        'og:image',
        previousOgImage,
      )

      restoreMeta(
        'name',
        'twitter:card',
        previousTwitterCard,
      )

      restoreMeta(
        'name',
        'twitter:title',
        previousTwitterTitle,
      )

      restoreMeta(
        'name',
        'twitter:description',
        previousTwitterDescription,
      )

      restoreMeta(
        'name',
        'twitter:image',
        previousTwitterImage,
      )

      if (previousJsonLd) {
        document.head.appendChild(
          previousJsonLd,
        )
      } else {
        document.getElementById(
          'news-article-jsonld',
        )?.remove()
      }
    }
  }, [news])

  /*
   * ============================================================
   * MOTION
   * ============================================================
   */

  const rootRef = useRef<HTMLElement | null>(null)
  const stageRef = useRef<HTMLDivElement | null>(null)
  const progressRef = useRef<HTMLDivElement | null>(null)

  const [failedImage, setFailedImage] =
    useState<string | null>(null)

  const featuredImage = news?.image_url ?? null

  const imageFailed =
    featuredImage !== null &&
    failedImage === featuredImage

  const setImageFailed = (failed: boolean) =>
    setFailedImage(failed ? featuredImage : null)

  const readingMinutes = Math.max(
    1,
    Math.round(
      (news?.content ?? '')
        .trim()
        .split(/\s+/)
        .filter(Boolean).length / 200,
    ),
  )

  /* Reveal saat di-scroll */
  useEffect(() => {
    const root = rootRef.current

    if (!root) {
      return
    }

    const items = root.querySelectorAll(
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
      { threshold: 0.06, rootMargin: '0px 0px -4% 0px' },
    )

    items.forEach((item) => observer.observe(item))

    return () => observer.disconnect()
  }, [loading, news])

  /* Progress baca */
  useEffect(() => {
    if (!news) {
      return
    }

    const update = () => {
      const bar = progressRef.current

      if (!bar) {
        return
      }

      const max =
        document.documentElement.scrollHeight -
        window.innerHeight

      const ratio =
        max > 0
          ? Math.min(1, Math.max(0, window.scrollY / max))
          : 0

      bar.style.transform = `scaleX(${ratio.toFixed(4)})`
    }

    update()

    window.addEventListener('scroll', update, {
      passive: true,
    })
    window.addEventListener('resize', update)

    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [news])

  /* Tilt 3D mengikuti kursor */
  const onStageMove = (
    event: PointerEvent<HTMLDivElement>,
  ) => {
    if (event.pointerType === 'touch') {
      return
    }

    const el = stageRef.current

    if (!el) {
      return
    }

    const rect = el.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width
    const y = (event.clientY - rect.top) / rect.height

    el.style.setProperty('--ry', `${((x - 0.5) * 8).toFixed(2)}deg`)
    el.style.setProperty('--rx', `${((0.5 - y) * 6).toFixed(2)}deg`)
    el.style.setProperty('--gx', `${(x * 100).toFixed(1)}%`)
    el.style.setProperty('--gy', `${(y * 100).toFixed(1)}%`)
  }

  const onStageLeave = () => {
    const el = stageRef.current

    if (!el) {
      return
    }

    el.style.setProperty('--ry', '0deg')
    el.style.setProperty('--rx', '0deg')
  }

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-zinc-900">
        <EditorialGrid />

        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="flex min-h-[560px] items-center justify-center">
            <div className="flex items-center gap-3 text-sm text-zinc-500">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-200 border-t-violet-600" />

              <span>
                Loading article...
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  /*
   * ============================================================
   * ERROR
   * ============================================================
   */

  if (error || !news) {
    return (
      <div className="min-h-screen bg-white text-zinc-900">
        <EditorialGrid />

        <div className="mx-auto flex min-h-screen max-w-7xl items-center px-5 py-16 sm:px-6 lg:px-8">
          <div className="w-full border-y border-zinc-200 py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center border border-zinc-200 bg-zinc-50">
              <FileText className="h-5 w-5 text-zinc-400" />
            </div>

            <p className="mt-6 font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-400">
              404 / Article
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-zinc-950">
              Article not found.
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-500">
              {error ||
                'The requested news article could not be found.'}
            </p>

            <Link
              to="/news"
              className="group mt-7 inline-flex items-center gap-2 border border-zinc-200 bg-white px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-700 transition hover:border-zinc-950 hover:bg-zinc-950 hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
              Back to News
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const dateParts = getDateParts(
    news.date,
  )

  return (
    <article
      ref={rootRef}
      className="nd min-h-screen overflow-x-clip bg-white text-zinc-900"
    >
      <EditorialGrid />

      {/* PROGRESS BACA */}

      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px] bg-transparent"
      >
        <div
          ref={progressRef}
          className="nd-progress h-full origin-left bg-violet-600"
        />
      </div>

      {/* ─────────────────────────────────────────
          BREADCRUMB
      ───────────────────────────────────────── */}

      <div className="nd-in border-b border-zinc-200">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="flex h-12 items-center gap-2 overflow-hidden sm:h-14">
            <span className="nd-blink h-1.5 w-1.5 shrink-0 bg-violet-600" />

            <Link
              to="/news"
              className="shrink-0 font-mono text-[8px] font-semibold uppercase tracking-[0.18em] text-zinc-400 transition hover:text-violet-600 sm:text-[9px]"
            >
              39Production Journal
            </Link>

            <ChevronRight className="h-3 w-3 shrink-0 text-zinc-300" />

            <span className="truncate text-[11px] text-zinc-500 sm:text-xs">
              {news.title}
            </span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────
          FEATURED IMAGE — stage 3D
      ───────────────────────────────────────── */}

      <section
        className="nd-in mx-auto max-w-7xl px-5 pt-5 sm:px-6 sm:pt-8 lg:px-8 lg:pt-12"
        style={delay(100)}
      >
        <div
          ref={stageRef}
          onPointerMove={onStageMove}
          onPointerLeave={onStageLeave}
          className="nd-stage relative"
        >
          <div className="nd-tilt relative">
            <div className="relative overflow-hidden border border-zinc-200 bg-[#0d0820] shadow-[0_20px_60px_rgba(0,0,0,0.07)]">
              {news.image_url && !imageFailed ? (
                <>
                  <img
                    src={news.image_url}
                    alt={`${news.title} — 39Production Journal`}
                    className="nd-kb block aspect-[16/9] w-full object-cover sm:aspect-[16/8]"
                    ref={(element) => {
                      if (
                        element &&
                        element.complete &&
                        element.naturalWidth === 0
                      ) {
                        setImageFailed(true)
                      }
                    }}
                    onError={() => setImageFailed(true)}
                    onLoad={(event) => {
                      if (
                        event.currentTarget.naturalWidth === 0
                      ) {
                        setImageFailed(true)
                      }
                    }}
                  />

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                </>
              ) : (
                <div className="relative aspect-[16/9] min-h-[180px] sm:aspect-[16/8] sm:min-h-[280px]">
                  <ArticleArt />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </div>
              )}

              <div className="nd-glare pointer-events-none absolute inset-0 z-10" />
              <div className="nd-shine pointer-events-none absolute inset-y-0 -left-1/2 z-10 w-1/3 -skew-x-12 bg-white/20" />

              <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2 sm:bottom-5 sm:left-5">
                <span className="border border-white/20 bg-black/40 px-2.5 py-1.5 font-mono text-[8px] font-medium uppercase tracking-[0.16em] text-white backdrop-blur-md sm:px-3 sm:text-[9px]">
                  39P / Journal
                </span>

                <span className="hidden bg-violet-600 px-2.5 py-1.5 font-mono text-[8px] font-bold uppercase tracking-[0.16em] text-white sm:inline-block sm:px-3 sm:text-[9px]">
                  {news.category}
                </span>
              </div>
            </div>

            {/* 3D melayang */}
            <div
              aria-hidden="true"
              className="nd-z-a pointer-events-none absolute -right-2 -top-5 z-30 sm:-right-5 sm:-top-8"
            >
              <div className="nd-float-slow">
                <div className="nd-cube">
                  <i className="f1">N</i>
                  <i className="f2" />
                  <i className="f3">39</i>
                  <i className="f4" />
                  <i className="f5" />
                  <i className="f6" />
                </div>
              </div>
            </div>

            <div
              aria-hidden="true"
              className="nd-z-b pointer-events-none absolute -bottom-3 -left-2 z-30 sm:-bottom-5 sm:-left-4"
            >
              <div className="nd-float" style={{ animationDelay: '-2s' }}>
                <div className="nd-sphere" />
              </div>
            </div>

            <div
              aria-hidden="true"
              className="nd-z-b pointer-events-none absolute -bottom-4 right-4 z-30 hidden sm:block"
            >
              <div className="nd-float" style={{ animationDelay: '-3.5s' }}>
                <div className="nd-plane border border-zinc-950 bg-white px-2.5 py-1.5 shadow-[5px_5px_0_0_rgba(124,58,237,0.9)]">
                  <p className="flex items-center gap-1.5 font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-violet-600">
                    <span className="nd-blink h-1.5 w-1.5 bg-violet-600" />
                    {readingMinutes} min read
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────
          ARTICLE INTRO
      ───────────────────────────────────────── */}

      <header className="mx-auto max-w-7xl px-5 pb-10 pt-10 sm:px-6 sm:pb-16 sm:pt-14 lg:px-8 lg:pb-20 lg:pt-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_220px] lg:gap-20">
          <div className="max-w-5xl">
            {/* CATEGORY */}

            <div
              className="nd-in flex flex-wrap items-center gap-x-3 gap-y-2"
              style={delay(160)}
            >
              <span className="nd-grow h-px w-8 bg-violet-600" />

              <span className="bg-violet-600 px-2 py-1 font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-white sm:text-[9px]">
                {news.category}
              </span>

              <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-zinc-400 sm:text-[9px]">
                Journal /{' '}
                {String(news.id).padStart(
                  3,
                  '0',
                )}
              </span>
            </div>

            {/* TITLE */}

            <h1 className="mt-4 max-w-5xl break-words text-[2.15rem] font-semibold leading-[1.02] tracking-[-0.055em] text-zinc-950 sm:mt-5 sm:text-5xl lg:text-6xl xl:text-[4.7rem]">
              <span className="block overflow-hidden pb-[0.08em]">
                <span
                  className="nd-up block"
                  style={delay(240)}
                >
                  {news.title}
                </span>
              </span>
            </h1>

            {/* MOBILE META CARDS */}

            <div
              className="nd-in mt-6 grid grid-cols-2 gap-2 sm:hidden"
              style={delay(380)}
            >
              <MetaCard
                label="Published"
                value={formatDate(
                  news.date,
                )}
              />

              <MetaCard
                label="Written by"
                value={news.author}
              />
            </div>

            {/* DESKTOP META */}

            <div
              className="nd-in mt-7 hidden flex-wrap items-center gap-x-5 gap-y-3 border-y border-zinc-200 py-4 sm:flex"
              style={delay(380)}
            >
              <MetaInline
                label="Published"
                value={formatDate(
                  news.date,
                )}
              />

              <span className="hidden h-4 w-px bg-zinc-200 sm:block" />

              <MetaInline
                label="Written by"
                value={news.author}
              />

              <span className="hidden h-4 w-px bg-zinc-200 sm:block" />

              <MetaInline
                label="Read"
                value={`${readingMinutes} min`}
              />
            </div>

            {/* DESCRIPTION */}

            {news.excerpt && (
              <div
                className="nd-in mt-7 max-w-3xl border-l-2 border-violet-500 pl-4 sm:mt-8 sm:pl-7"
                style={delay(460)}
              >
                <p className="text-base font-medium leading-7 tracking-[-0.015em] text-zinc-800 sm:text-xl sm:leading-9">
                  {news.excerpt}
                </p>
              </div>
            )}
          </div>

          {/* DATE MARKER */}

          <div
            className="nd-in hidden lg:flex lg:items-end lg:justify-end"
            style={delay(420)}
          >
            <div className="text-right">
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-400">
                Published
              </p>

              <div className="mt-3 flex items-end justify-end gap-3">
                <div className="nd-date border border-zinc-950 bg-white px-4 py-3 shadow-[6px_6px_0_0_rgba(124,58,237,0.9)]">
                  <p className="font-mono text-6xl font-medium leading-none tracking-[-0.07em] text-zinc-950">
                    {dateParts.day}
                  </p>

                  <p className="mt-2 font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-violet-600">
                    {dateParts.month}
                  </p>
                </div>

                <p className="pb-1 font-mono text-[9px] uppercase tracking-[0.15em] text-zinc-400">
                  {dateParts.year}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────
          ARTICLE CONTENT
      ───────────────────────────────────────── */}

      <section className="border-t-2 border-zinc-950">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,760px)_240px] lg:justify-between lg:gap-20">
            {/* ARTICLE */}

            <div className="min-w-0">
              <div
                data-reveal
                className="nd-rv mb-7 flex items-center gap-3 sm:mb-8"
              >
                <span className="font-mono text-[9px] font-bold text-violet-600 sm:text-[10px]">
                  01
                </span>

                <span className="h-px w-7 bg-violet-500 sm:w-8" />

                <p className="font-mono text-[8px] font-semibold uppercase tracking-[0.18em] text-zinc-500 sm:text-[9px]">
                  Article
                </p>
              </div>

              <div
                data-reveal
                className="nd-rv nd-body whitespace-pre-line text-[15px] leading-7 text-zinc-700 sm:text-base sm:leading-9"
              >
                {news.content}
              </div>

              {/* END STORY */}

              <div
                data-reveal
                className="nd-rv mt-12 border-t border-zinc-200 pt-6 sm:mt-14 sm:pt-7"
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <span className="nd-blink mt-1 h-2 w-2 shrink-0 bg-violet-600" />

                    <div>
                      <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-zinc-400 sm:text-[9px]">
                        End of story
                      </p>

                      <p className="mt-1 text-[11px] text-zinc-500 sm:text-xs">
                        Thanks for reading the
                        39Production Journal.
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/news"
                    className="group inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-700 transition hover:text-violet-600 sm:text-xs"
                  >
                    More stories

                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>

            {/* STORY INFORMATION */}

            <aside className="h-fit lg:sticky lg:top-24">
              <div
                data-reveal
                className="nd-rv border border-zinc-950"
              >
                <div className="flex items-center justify-between bg-zinc-950 px-4 py-3 text-white">
                  <p className="font-mono text-[9px] font-bold uppercase tracking-[0.2em]">
                    Story information
                  </p>

                  <span className="nd-blink h-1.5 w-1.5 bg-violet-400" />
                </div>

                <div className="p-4 sm:p-5">
                  {/* MOBILE: COMPACT HORIZONTAL CARDS */}

                  <div className="grid grid-cols-2 gap-2 sm:hidden">
                    <MetaCard
                      label="Category"
                      value={news.category}
                    />

                    <MetaCard
                      label="Author"
                      value={news.author}
                    />

                    <MetaCard
                      label="Published"
                      value={formatDate(
                        news.date,
                      )}
                    />

                    <MetaCard
                      label="Reference"
                      value={`39P-JNL-${String(
                        news.id,
                      ).padStart(3, '0')}`}
                    />
                  </div>

                  {/* DESKTOP: ORIGINAL INFORMATION */}

                  <div className="hidden space-y-6 sm:block">
                    <MetaItem
                      label="Category"
                      value={news.category}
                    />

                    <MetaItem
                      label="Author"
                      value={news.author}
                    />

                    <MetaItem
                      label="Published"
                      value={formatDate(
                        news.date,
                      )}
                    />

                    <MetaItem
                      label="Reference"
                      value={`39P-JNL-${String(
                        news.id,
                      ).padStart(3, '0')}`}
                    />
                  </div>
                </div>
              </div>

              <Link
                to="/news"
                className="group mt-4 flex items-center justify-between border border-zinc-200 px-3.5 py-3 text-[10px] font-semibold uppercase tracking-[0.13em] text-zinc-600 transition hover:border-zinc-950 hover:bg-zinc-950 hover:text-white sm:mt-5 sm:px-4 sm:py-3.5 sm:text-xs"
              >
                <span className="flex items-center gap-2">
                  <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />

                  Back to Journal
                </span>

                <ArrowRight className="h-3.5 w-3.5 opacity-40 transition group-hover:opacity-100" />
              </Link>
            </aside>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────
          CLOSING STATEMENT
      ───────────────────────────────────────── */}

      <section className="border-t border-zinc-200">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div
            data-reveal
            className="nd-rv relative overflow-hidden bg-zinc-950 px-6 py-12 text-white sm:px-12 sm:py-16"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-10 -right-2 select-none text-[12rem] font-black leading-none tracking-[-0.12em] text-white/[0.05] sm:text-[18rem]"
            >
              39
            </div>

            <div
              aria-hidden="true"
              className="pointer-events-none absolute right-6 top-6 hidden sm:right-14 sm:top-12 sm:block"
            >
              <div className="nd-float-slow">
                <div className="nd-cube nd-cube-dark">
                  <i className="f1">39</i>
                  <i className="f2" />
                  <i className="f3">N</i>
                  <i className="f4" />
                  <i className="f5" />
                  <i className="f6" />
                </div>
              </div>
            </div>

            <div className="relative max-w-3xl">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] font-bold tracking-[0.18em] text-violet-400">
                  06.02
                </span>

                <span className="h-px w-8 bg-violet-400" />

                <p className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                  Closing note
                </p>
              </div>

              <p className="mt-6 text-2xl font-semibold leading-[1.1] tracking-[-0.04em] sm:text-4xl">
                Stories are part of the work —{' '}
                <span className="text-violet-400">
                  they give context to what we
                  build, produce, and share.
                </span>
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/news"
                  className="group inline-flex items-center justify-center gap-3 bg-violet-600 px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-violet-500"
                >
                  Explore journal

                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  to="/portfolio"
                  className="group inline-flex items-center justify-center gap-3 border border-white/20 px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-white/80 transition-colors hover:border-violet-400 hover:text-violet-300"
                >
                  View our work

                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        /* ---------- Reveal ---------- */
        @keyframes nd-in {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .nd .nd-in {
          opacity: 0;
          animation: nd-in .85s cubic-bezier(.22,1,.36,1) var(--d, 0ms) forwards;
        }

        .nd .nd-rv {
          opacity: 0;
          transform: translate3d(0, 26px, 0);
          transition:
            opacity .8s cubic-bezier(.2,.7,.2,1) var(--d, 0ms),
            transform .8s cubic-bezier(.2,.7,.2,1) var(--d, 0ms),
            border-color .5s, box-shadow .5s;
        }
        .nd .nd-rv.is-visible { opacity: 1; transform: none; }
        .nd article.nd-rv.is-visible:hover { transform: translateY(-4px); transition-delay: 0ms; }

        @keyframes nd-up {
          from { transform: translateY(105%); }
          to   { transform: translateY(0); }
        }
        .nd .nd-up {
          transform: translateY(105%);
          animation: nd-up .95s cubic-bezier(.22,1,.36,1) var(--d, 0ms) forwards;
        }
        @keyframes nd-grow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        .nd .nd-grow {
          transform-origin: left;
          animation: nd-grow .9s cubic-bezier(.77,0,.18,1) .5s both;
        }

        /* ---------- Misc motion ---------- */
        @keyframes nd-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        .nd .nd-float { animation: nd-float 6s ease-in-out infinite; }
        .nd .nd-float-slow { animation: nd-float 9s ease-in-out infinite; }

        @keyframes nd-blink { 0%,100% { opacity: 1; } 50% { opacity: .25; } }
        .nd .nd-blink { animation: nd-blink 1.6s ease-in-out infinite; }

        @keyframes nd-twinkle {
          0%, 100% { opacity: .15; transform: scale(.6) rotate(45deg); }
          50% { opacity: 1; transform: scale(1) rotate(45deg); }
        }
        .nd .nd-twinkle { animation: nd-twinkle 3s ease-in-out infinite; }

        @keyframes nd-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(124,58,237,.35); }
          50% { box-shadow: 0 0 0 8px rgba(124,58,237,0); }
        }
        .nd .nd-pulse { animation: nd-pulse 2.4s ease-out infinite; }

        @keyframes nd-wiggle {
          0%, 80%, 100% { transform: rotate(0deg); }
          85% { transform: rotate(-14deg); }
          92% { transform: rotate(12deg); }
        }
        .nd .nd-wiggle { animation: nd-wiggle 3.6s ease-in-out infinite; }

        @keyframes nd-shine-loop {
          0%, 55% { left: -50%; opacity: 0; }
          65% { opacity: 1; }
          100% { left: 130%; opacity: 0; }
        }
        .nd .nd-shine-loop { animation: nd-shine-loop 4.5s ease-in-out infinite; }

        @keyframes nd-kb {
          from { transform: scale(1); }
          to   { transform: scale(1.07); }
        }
        .nd .nd-kb { animation: nd-kb 16s ease-in-out infinite alternate; }

        @keyframes nd-art-sway {
          from { transform: translate(520px, 70px) rotate(-3deg); }
          to   { transform: translate(520px, 56px) rotate(3deg); }
        }
        .nd .nd-art-paper { animation: nd-art-sway 6s ease-in-out infinite alternate; }

        .nd .nd-progress { transform: scaleX(0); transition: transform .1s linear; }

        .nd .nd-date { animation: nd-float 7s ease-in-out infinite; }

        .nd .nd-body::first-letter {
          float: left;
          font-size: 4.2rem;
          line-height: .8;
          font-weight: 800;
          letter-spacing: -.06em;
          padding: .35rem .6rem 0 0;
          color: #7C3AED;
        }

        /* ---------- Stage 3D ---------- */
        .nd .nd-stage { perspective: 1100px; }
        .nd .nd-tilt {
          transform-style: preserve-3d;
          transform: rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg));
          transition: transform .35s cubic-bezier(.22,1,.36,1);
        }
        .nd .nd-z-a { transform: translateZ(80px); }
        .nd .nd-z-b { transform: translateZ(55px); }
        @media (max-width: 1023px) {
          .nd .nd-z-a, .nd .nd-z-b { transform: translateZ(26px); }
        }

        .nd .nd-glare {
          opacity: 0;
          transition: opacity .3s;
          background: radial-gradient(
            320px circle at var(--gx, 50%) var(--gy, 0%),
            rgba(255,255,255,.18),
            transparent 65%
          );
        }
        .nd .nd-stage:hover .nd-glare { opacity: 1; }

        .nd .nd-shine { opacity: 0; }
        .nd .nd-stage:hover .nd-shine { animation: nd-shine .9s ease-out; }
        @keyframes nd-shine {
          0% { left: -50%; opacity: 0; }
          30% { opacity: 1; }
          100% { left: 130%; opacity: 0; }
        }

        /* Kubus */
        .nd .nd-cube {
          --s: 38px;
          position: relative;
          width: var(--s);
          height: var(--s);
          transform-style: preserve-3d;
          animation: nd-cube 14s linear infinite;
        }
        @media (min-width: 640px) { .nd .nd-cube { --s: 50px; } }
        .nd .nd-cube-lg { --s: 64px; }
        @keyframes nd-cube {
          from { transform: rotateX(-24deg) rotateY(0deg); }
          to   { transform: rotateX(-24deg) rotateY(360deg); }
        }
        .nd .nd-cube i {
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
          border: 1.5px solid rgba(124,58,237,.85);
          background: rgba(124,58,237,.1);
        }
        .nd .nd-cube .f1 { transform: translateZ(calc(var(--s) / 2)); background: rgba(255,255,255,.85); }
        .nd .nd-cube .f2 { transform: rotateY(90deg) translateZ(calc(var(--s) / 2)); background: rgba(231,143,186,.4); }
        .nd .nd-cube .f3 { transform: rotateY(180deg) translateZ(calc(var(--s) / 2)); background: rgba(255,255,255,.85); }
        .nd .nd-cube .f4 { transform: rotateY(-90deg) translateZ(calc(var(--s) / 2)); background: rgba(124,58,237,.24); }
        .nd .nd-cube .f5 { transform: rotateX(90deg) translateZ(calc(var(--s) / 2)); background: rgba(231,143,186,.5); }
        .nd .nd-cube .f6 { transform: rotateX(-90deg) translateZ(calc(var(--s) / 2)); background: rgba(124,58,237,.32); }

        /* Bola */
        .nd .nd-sphere {
          width: 26px; height: 26px;
          border-radius: 9999px;
          background: radial-gradient(circle at 30% 28%, #fbd5e6 0%, #E78FBA 38%, #7C3AED 100%);
          box-shadow: 0 12px 18px -6px rgba(124,58,237,.55);
        }
        @media (min-width: 1024px) { .nd .nd-sphere { width: 38px; height: 38px; } }

        .nd .nd-plane { transform: rotateY(-14deg) rotateX(6deg); }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            scroll-behavior: auto !important;
            transition-duration: 0.01ms !important;
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
          }
          .nd .nd-in, .nd .nd-rv, .nd .nd-up {
            opacity: 1 !important;
            transform: none !important;
          }
          .nd .nd-grow { transform: scaleX(1) !important; }
          .nd .nd-tilt { transform: none !important; }
        }

        .nd .nd-cube-dark { --s: 54px; }
        .nd .nd-cube-dark i { color: #E78FBA; border-color: rgba(231,143,186,.7); background: rgba(124,58,237,.28); }
      `}</style>
    </article>
  )
}

/* ─────────────────────────────────────────────
   EDITORIAL GRID
───────────────────────────────────────────── */

function EditorialGrid() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 opacity-[0.035]"
      style={{
        backgroundImage: `
          linear-gradient(to right, #111 1px, transparent 1px),
          linear-gradient(to bottom, #111 1px, transparent 1px)
        `,
        backgroundSize: '72px 72px',
      }}
    />
  )
}

/* ─────────────────────────────────────────────
   MOBILE META CARD
───────────────────────────────────────────── */

function MetaCard({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="min-w-0 border border-zinc-200 bg-zinc-50/60 px-3 py-3">
      <p className="font-mono text-[7px] uppercase tracking-[0.16em] text-zinc-400">
        {label}
      </p>

      <p className="mt-1.5 truncate text-[10px] font-medium leading-4 text-zinc-800">
        {value}
      </p>
    </div>
  )
}

/* ─────────────────────────────────────────────
   INLINE META
───────────────────────────────────────────── */

function MetaInline({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-zinc-400">
        {label}
      </span>

      <span className="text-xs font-medium text-zinc-700">
        {value}
      </span>
    </div>
  )
}

/* ─────────────────────────────────────────────
   SIDEBAR META
───────────────────────────────────────────── */

function MetaItem({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div>
      <p className="font-mono text-[9px] uppercase tracking-[0.17em] text-zinc-400">
        {label}
      </p>

      <p className="mt-2 text-xs font-medium leading-5 text-zinc-800">
        {value}
      </p>
    </div>
  )
}