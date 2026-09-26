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
  useState,
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
    <article className="min-h-screen bg-white text-zinc-900">
      <EditorialGrid />

      {/* ─────────────────────────────────────────
          BREADCRUMB
      ───────────────────────────────────────── */}

      <div className="border-b border-zinc-200">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="flex h-12 items-center gap-2 overflow-hidden sm:h-14">
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
          FEATURED IMAGE
      ───────────────────────────────────────── */}

      <section className="mx-auto max-w-7xl px-5 pt-5 sm:px-6 sm:pt-8 lg:px-8 lg:pt-12">
        <div className="relative overflow-hidden border border-zinc-200 bg-zinc-100">
          {news.image_url ? (
            <>
              <img
                src={news.image_url}
                alt={`${news.title} — 39Production Journal`}
                className="
                  block
                  aspect-[16/9]
                  w-full
                  object-cover
                  transition-transform
                  duration-700
                  hover:scale-[1.015]
                  sm:aspect-[16/8]
                "
              />

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />

              <div className="absolute bottom-3 left-3 sm:bottom-5 sm:left-5">
                <span className="border border-white/20 bg-black/35 px-2.5 py-1.5 font-mono text-[8px] font-medium uppercase tracking-[0.16em] text-white backdrop-blur-md sm:px-3 sm:text-[9px]">
                  39P / Journal
                </span>
              </div>
            </>
          ) : (
            <div className="flex aspect-[16/9] min-h-[180px] items-center justify-center bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 sm:aspect-[16/8] sm:min-h-[280px]">
              <div className="text-center">
                <Newspaper className="mx-auto h-8 w-8 text-violet-200 sm:h-10 sm:w-10" />

                <p className="mt-3 font-mono text-[8px] uppercase tracking-[0.18em] text-zinc-300 sm:mt-4 sm:text-[9px]">
                  No featured image
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ─────────────────────────────────────────
          ARTICLE INTRO
      ───────────────────────────────────────── */}

      <header className="mx-auto max-w-7xl px-5 pb-10 pt-8 sm:px-6 sm:pb-16 sm:pt-12 lg:px-8 lg:pb-20 lg:pt-14">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_220px] lg:gap-20">
          <div className="max-w-5xl">
            {/* CATEGORY */}

            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="font-mono text-[8px] font-semibold uppercase tracking-[0.2em] text-violet-600 sm:text-[9px]">
                {news.category}
              </span>

              <span className="h-1 w-1 bg-zinc-300" />

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
              {news.title}
            </h1>

            {/* MOBILE META CARDS */}

            <div className="mt-6 grid grid-cols-2 gap-2 sm:hidden">
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

            <div className="mt-7 hidden flex-wrap items-center gap-x-5 gap-y-3 border-y border-zinc-200 py-4 sm:flex">
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
            </div>

            {/* DESCRIPTION */}

            <div className="mt-7 max-w-3xl border-l-2 border-violet-500 pl-4 sm:mt-8 sm:pl-7">
              <p className="text-base font-medium leading-7 tracking-[-0.015em] text-zinc-800 sm:text-xl sm:leading-9">
                {news.excerpt}
              </p>
            </div>
          </div>

          {/* DATE MARKER */}

          <div className="hidden lg:flex lg:items-end lg:justify-end">
            <div className="text-right">
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-400">
                Published
              </p>

              <div className="mt-3 flex items-end justify-end gap-3">
                <div>
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

      <section className="border-t border-zinc-200">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,760px)_220px] lg:justify-between lg:gap-20">
            {/* ARTICLE */}

            <div className="min-w-0">
              <div className="mb-7 flex items-center gap-3 sm:mb-8">
                <span className="font-mono text-[9px] text-zinc-400 sm:text-[10px]">
                  01
                </span>

                <span className="h-px w-7 bg-violet-500 sm:w-8" />

                <p className="font-mono text-[8px] font-semibold uppercase tracking-[0.18em] text-violet-600 sm:text-[9px]">
                  Article
                </p>
              </div>

              <div className="whitespace-pre-line text-[15px] leading-7 text-zinc-700 sm:text-base sm:leading-9">
                {news.content}
              </div>

              {/* END STORY */}

              <div className="mt-12 border-t border-zinc-200 pt-6 sm:mt-14 sm:pt-7">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-zinc-400 sm:text-[9px]">
                      End of story
                    </p>

                    <p className="mt-1 text-[11px] text-zinc-500 sm:text-xs">
                      Thanks for reading the
                      39Production Journal.
                    </p>
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
              <div className="border-y border-zinc-200 py-5 sm:py-6">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[9px] text-zinc-400 sm:text-[10px]">
                    INFO
                  </span>

                  <span className="h-px w-6 bg-violet-500 sm:w-7" />

                  <p className="font-mono text-[8px] font-semibold uppercase tracking-[0.18em] text-violet-600 sm:text-[9px]">
                    Story information
                  </p>
                </div>

                {/* MOBILE: COMPACT HORIZONTAL CARDS */}

                <div className="mt-6 grid grid-cols-2 gap-2 sm:hidden">
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

                <div className="mt-7 hidden space-y-6 sm:block">
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

              <Link
                to="/news"
                className="group mt-5 flex items-center justify-between border border-zinc-200 px-3.5 py-3 text-[10px] font-semibold uppercase tracking-[0.13em] text-zinc-600 transition hover:border-zinc-950 hover:bg-zinc-950 hover:text-white sm:mt-7 sm:px-4 sm:py-3.5 sm:text-xs"
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
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-[120px_1fr] sm:gap-8">
            <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-400 sm:text-[10px]">
              06.02
            </div>

            <div className="max-w-3xl">
              <p className="text-xl font-medium leading-tight tracking-[-0.03em] text-zinc-900 sm:text-3xl">
                Stories are part of the work —
                they give context to what we
                build, produce, and share.
              </p>

              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-3 sm:mt-7 sm:gap-x-6">
                <Link
                  to="/news"
                  className="group inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-700 transition hover:text-violet-600 sm:text-xs"
                >
                  Explore journal

                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  to="/portfolio"
                  className="group inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400 transition hover:text-zinc-900 sm:text-xs"
                >
                  View our work

                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
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