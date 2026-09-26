import {
  ArrowRight,
  Calendar,
  FileText,
  Loader2,
  Newspaper,
  Sparkles,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

const API_BASE_URL =
  'https://39production-api.39production.workers.dev'

const SITE_URL = 'https://39production.digital'
const PAGE_URL = `${SITE_URL}/news`
const DEFAULT_OG_IMAGE =
  'https://39production.digital/og-image.jpg'

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
      result.message || 'Gagal mengambil data.',
    )
  }

  return result.data
}

function formatDate(date: string) {
  const parsedDate = new Date(`${date}T00:00:00`)

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
  const parsedDate = new Date(`${date}T00:00:00`)

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

/*
 * ============================================================
 * SEO HELPERS
 * ============================================================
 */

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

/*
 * ============================================================
 * PAGE
 * ============================================================
 */

export function NewsPage() {
  const [news, setNews] = useState<News[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [category, setCategory] = useState('All')

  /*
   * ============================================================
   * SEO — NEWS INDEX
   * ============================================================
   */

  useEffect(() => {
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
        'news-page-jsonld',
      )

    document.title =
      'Journal — 39Production | Ideas, Stories & Updates'

    const description =
      'Read the latest stories, creative insights, project updates, announcements, and ideas from 39Production.'

    const keywords =
      '39Production, 39Production Journal, creative studio, digital production, creative technology, design, development, animation, UI UX, project updates, Indonesia'

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

    setMetaTag(
      'property',
      'og:title',
      'Journal — 39Production',
    )

    setMetaTag(
      'property',
      'og:description',
      description,
    )

    setMetaTag(
      'property',
      'og:url',
      PAGE_URL,
    )

    setMetaTag(
      'property',
      'og:type',
      'website',
    )

    setMetaTag(
      'property',
      'og:site_name',
      '39Production',
    )

    setMetaTag(
      'property',
      'og:image',
      DEFAULT_OG_IMAGE,
    )

    setMetaTag(
      'name',
      'twitter:card',
      'summary_large_image',
    )

    setMetaTag(
      'name',
      'twitter:title',
      'Journal — 39Production',
    )

    setMetaTag(
      'name',
      'twitter:description',
      description,
    )

    setMetaTag(
      'name',
      'twitter:image',
      DEFAULT_OG_IMAGE,
    )

    setCanonical(PAGE_URL)

    const jsonLd = document.createElement('script')

    jsonLd.id = 'news-page-jsonld'
    jsonLd.type = 'application/ld+json'

    jsonLd.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: '39Production Journal',
      description,
      url: PAGE_URL,
      isPartOf: {
        '@type': 'WebSite',
        name: '39Production',
        url: SITE_URL,
      },
      publisher: {
        '@type': 'Organization',
        name: '39Production',
        url: SITE_URL,
      },
    })

    document.head.appendChild(jsonLd)

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
        setCanonical(previousCanonical.href)
      } else {
        document.head
          .querySelector(
            'link[rel="canonical"]',
          )
          ?.remove()
      }

      if (previousOgTitle) {
        setMetaTag(
          'property',
          'og:title',
          previousOgTitle.content,
        )
      } else {
        document.head
          .querySelector(
            'meta[property="og:title"]',
          )
          ?.remove()
      }

      if (previousOgDescription) {
        setMetaTag(
          'property',
          'og:description',
          previousOgDescription.content,
        )
      } else {
        document.head
          .querySelector(
            'meta[property="og:description"]',
          )
          ?.remove()
      }

      if (previousOgUrl) {
        setMetaTag(
          'property',
          'og:url',
          previousOgUrl.content,
        )
      } else {
        document.head
          .querySelector(
            'meta[property="og:url"]',
          )
          ?.remove()
      }

      if (previousOgType) {
        setMetaTag(
          'property',
          'og:type',
          previousOgType.content,
        )
      } else {
        document.head
          .querySelector(
            'meta[property="og:type"]',
          )
          ?.remove()
      }

      if (previousOgSiteName) {
        setMetaTag(
          'property',
          'og:site_name',
          previousOgSiteName.content,
        )
      } else {
        document.head
          .querySelector(
            'meta[property="og:site_name"]',
          )
          ?.remove()
      }

      if (previousOgImage) {
        setMetaTag(
          'property',
          'og:image',
          previousOgImage.content,
        )
      } else {
        document.head
          .querySelector(
            'meta[property="og:image"]',
          )
          ?.remove()
      }

      if (previousTwitterCard) {
        setMetaTag(
          'name',
          'twitter:card',
          previousTwitterCard.content,
        )
      } else {
        document.head
          .querySelector(
            'meta[name="twitter:card"]',
          )
          ?.remove()
      }

      if (previousTwitterTitle) {
        setMetaTag(
          'name',
          'twitter:title',
          previousTwitterTitle.content,
        )
      } else {
        document.head
          .querySelector(
            'meta[name="twitter:title"]',
          )
          ?.remove()
      }

      if (previousTwitterDescription) {
        setMetaTag(
          'name',
          'twitter:description',
          previousTwitterDescription.content,
        )
      } else {
        document.head
          .querySelector(
            'meta[name="twitter:description"]',
          )
          ?.remove()
      }

      if (previousTwitterImage) {
        setMetaTag(
          'name',
          'twitter:image',
          previousTwitterImage.content,
        )
      } else {
        document.head
          .querySelector(
            'meta[name="twitter:image"]',
          )
          ?.remove()
      }

      if (previousJsonLd) {
        previousJsonLd.remove()
      }
    }
  }, [])

  /*
   * ============================================================
   * SEO — DYNAMIC NEWS ITEMLIST
   * ============================================================
   */

  useEffect(() => {
    if (news.length === 0) return

    const existing =
      document.getElementById(
        'news-items-jsonld',
      )

    existing?.remove()

    const jsonLd = document.createElement('script')

    jsonLd.id = 'news-items-jsonld'
    jsonLd.type = 'application/ld+json'

    jsonLd.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: '39Production Journal',
      url: PAGE_URL,
      numberOfItems: news.length,
      itemListElement: news
        .slice(0, 50)
        .map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'Article',
            headline: item.title,
            description:
              item.excerpt ||
              `Latest story from 39Production: ${item.title}`,
            url: `${SITE_URL}/news/${item.id}`,
            ...(item.image_url
              ? {
                image: item.image_url,
              }
              : {}),
            datePublished: item.date,
            author: {
              '@type': 'Person',
              name: item.author,
            },
            publisher: {
              '@type': 'Organization',
              name: '39Production',
              url: SITE_URL,
            },
            ...(item.category
              ? {
                articleSection: item.category,
              }
              : {}),
          },
        })),
    })

    document.head.appendChild(jsonLd)

    return () => {
      jsonLd.remove()
    }
  }, [news])

  /*
   * ============================================================
   * LOAD NEWS
   * ============================================================
   */

  useEffect(() => {
    async function loadNews() {
      try {
        setLoading(true)
        setError('')

        const data = await apiRequest<News[]>('/api/news')

        setNews(
          (data || []).filter(
            (item) => item.status === 'Published',
          ),
        )
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Gagal mengambil berita.',
        )
      } finally {
        setLoading(false)
      }
    }

    void loadNews()
  }, [])

  /*
   * ============================================================
   * CATEGORIES
   * ============================================================
   */

  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          news
            .map((item) => item.category)
            .filter(Boolean),
        ),
      ),
    [news],
  )

  const filteredNews =
    category === 'All'
      ? news
      : news.filter(
        (item) => item.category === category,
      )

  const featuredNews = filteredNews[0]
  const remainingNews = filteredNews.slice(1)

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      {/* EDITORIAL GRID */}

      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #111 1px, transparent 1px),
            linear-gradient(to bottom, #111 1px, transparent 1px)
          `,
          backgroundSize: '72px 72px',
        }}
      />

      {/* HERO */}

      <section className="relative overflow-hidden border-b border-zinc-200">
        <div className="pointer-events-none absolute -right-40 -top-48 h-[520px] w-[520px] rounded-full bg-violet-100/60 blur-[120px]" />

        <div className="pointer-events-none absolute -bottom-48 left-1/3 h-[420px] w-[420px] rounded-full bg-fuchsia-100/40 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-5 pb-12 pt-8 sm:px-6 sm:pb-14 sm:pt-14 lg:px-8 lg:pb-20">
          {/* TOP LINE */}

          <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
            <p className="font-mono text-[9px] font-medium uppercase tracking-[0.2em] text-zinc-500 sm:text-[10px] sm:tracking-[0.22em]">
              39Production • Journal
            </p>

            <div className="hidden items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-400 sm:flex">
              <span>Stories</span>
              <span className="text-zinc-300">/</span>
              <span>Ideas</span>
              <span className="text-zinc-300">/</span>
              <span>Updates</span>
            </div>
          </div>

          <div className="grid gap-9 pt-10 sm:gap-12 sm:pt-14 lg:grid-cols-[1fr_300px] lg:items-end lg:pt-18">
            {/* TITLE */}

            <div>
              <div className="mb-5 flex items-center gap-3 sm:mb-7">
                <div className="flex h-9 w-9 items-center justify-center border border-zinc-200 bg-white sm:h-10 sm:w-10">
                  <Newspaper className="h-4 w-4 text-violet-600" />
                </div>

                <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-violet-600 sm:text-[10px] sm:tracking-[0.2em]">
                  Publication
                </span>
              </div>

              <h1 className="max-w-4xl text-[3.25rem] font-semibold leading-[0.94] tracking-[-0.065em] text-zinc-950 sm:text-6xl lg:text-[5.25rem]">
                Stories behind
                <br />
                <span className="text-zinc-400">
                  what we create.
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-sm leading-6 text-zinc-600 sm:mt-7 sm:text-base sm:leading-7">
                Ideas, projects, releases, creative
                experiments, and stories shaping the world
                of 39Production.
              </p>
            </div>

            {/* PUBLICATION INFO */}

            {!loading && !error && (
              <div className="border-y border-zinc-200">
                <div className="grid grid-cols-2 divide-x divide-zinc-200">
                  <div className="px-4 py-4 sm:py-5">
                    <p className="font-mono text-2xl font-medium tracking-[-0.05em] text-zinc-950 sm:text-3xl">
                      {String(news.length).padStart(2, '0')}
                    </p>

                    <p className="mt-1 text-[8px] font-semibold uppercase tracking-[0.15em] text-zinc-400 sm:text-[9px] sm:tracking-[0.17em]">
                      Published
                    </p>
                  </div>

                  <div className="px-4 py-4 sm:py-5">
                    <p className="font-mono text-2xl font-medium tracking-[-0.05em] text-zinc-950 sm:text-3xl">
                      {String(categories.length).padStart(
                        2,
                        '0',
                      )}
                    </p>

                    <p className="mt-1 text-[8px] font-semibold uppercase tracking-[0.15em] text-zinc-400 sm:text-[9px] sm:tracking-[0.17em]">
                      Topics
                    </p>
                  </div>
                </div>

                <div className="border-t border-zinc-200 px-4 py-3">
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                    <Sparkles className="h-3 w-3 text-violet-500" />

                    <span>
                      The latest from our studio.
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        {/* FILTER INDEX */}

        {!loading && !error && categories.length > 0 && (
          <section className="border-b border-zinc-200 py-5 sm:py-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-400">
                  Story index
                </p>

                <p className="mt-1 text-xs text-zinc-600 sm:text-sm">
                  Browse the journal by topic.
                </p>
              </div>

              <div className="-mx-5 overflow-x-auto px-5 scrollbar-none sm:mx-0 sm:px-0">
                <div className="flex w-max border border-zinc-200">
                  <FilterButton
                    active={category === 'All'}
                    onClick={() => setCategory('All')}
                  >
                    All Stories
                  </FilterButton>

                  {categories.map((item) => (
                    <FilterButton
                      key={item}
                      active={category === item}
                      onClick={() => setCategory(item)}
                    >
                      {item}
                    </FilterButton>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* LOADING */}

        {loading && (
          <div className="flex min-h-[420px] items-center justify-center">
            <div className="flex items-center gap-3 text-sm text-zinc-500">
              <Loader2 className="h-5 w-5 animate-spin text-violet-600" />

              <span>Loading the journal...</span>
            </div>
          </div>
        )}

        {/* ERROR */}

        {!loading && error && (
          <div className="my-12 border border-red-200 bg-red-50/60 p-6 sm:my-16 sm:p-8">
            <div className="flex items-start gap-4">
              <FileText className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />

              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-red-500">
                  Request failed
                </p>

                <p className="mt-3 text-sm leading-6 text-red-700">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* CONTENT */}

        {!loading && !error && (
          <>
            {/* EMPTY */}

            {filteredNews.length === 0 && (
              <section className="py-16 sm:py-28">
                <div className="border border-zinc-200 bg-zinc-50 px-5 py-16 text-center sm:px-6 sm:py-20">
                  <Newspaper className="mx-auto h-8 w-8 text-zinc-300" />

                  <p className="mt-5 font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-400 sm:text-[10px]">
                    Empty index
                  </p>

                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-950">
                    No stories yet.
                  </h2>

                  <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-500">
                    There are currently no published stories
                    in this category. Check back soon for new
                    updates from 39Production.
                  </p>
                </div>
              </section>
            )}

            {/* FEATURED */}

            {featuredNews && (
              <section className="py-10 sm:py-16">
                <div className="mb-6 flex items-end justify-between sm:mb-8">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[9px] tracking-[0.18em] text-zinc-400 sm:text-[10px]">
                        01
                      </span>

                      <span className="h-px w-6 bg-violet-500 sm:w-8" />

                      <p className="font-mono text-[8px] font-semibold uppercase tracking-[0.18em] text-violet-600 sm:text-[9px] sm:tracking-[0.2em]">
                        Featured story
                      </p>
                    </div>

                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.045em] text-zinc-950 sm:mt-3 sm:text-4xl">
                      Inside 39Production.
                    </h2>
                  </div>

                  <span className="hidden font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-400 sm:block">
                    Editor's pick
                  </span>
                </div>

                <Link
                  to={`/news/${featuredNews.id}`}
                  className="group block overflow-hidden border border-zinc-200 bg-white transition hover:border-zinc-300 hover:bg-zinc-50/50"
                >
                  <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
                    {/* IMAGE */}

                    <div className="relative aspect-[16/10] overflow-hidden bg-zinc-100 lg:aspect-[4/3]">
                      {featuredNews.image_url ? (
                        <>
                          <img
                            src={featuredNews.image_url}
                            alt={featuredNews.title}
                            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.035]"
                          />

                          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />

                          <div className="absolute bottom-4 left-4 sm:bottom-5 sm:left-5">
                            <span className="border border-white/25 bg-black/30 px-2.5 py-1.5 font-mono text-[8px] font-medium uppercase tracking-[0.14em] text-white backdrop-blur-md sm:px-3 sm:text-[9px]">
                              {featuredNews.category}
                            </span>
                          </div>

                          <div className="absolute right-4 top-4 font-mono text-[8px] uppercase tracking-[0.18em] text-white/80 sm:right-5 sm:top-5 sm:text-[9px]">
                            39P / 01
                          </div>
                        </>
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-violet-50 via-white to-fuchsia-50">
                          <Newspaper className="h-10 w-10 text-violet-200 sm:h-12 sm:w-12" />
                        </div>
                      )}
                    </div>

                    {/* CONTENT */}

                    <div className="flex flex-col justify-center border-t border-zinc-200 p-5 sm:p-9 lg:border-l lg:border-t-0 lg:p-12 xl:p-14">
                      {!featuredNews.image_url && (
                        <span className="w-fit border border-violet-200 bg-violet-50 px-3 py-1.5 font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-violet-700">
                          {featuredNews.category}
                        </span>
                      )}

                      <h2 className="mt-3 text-2xl font-semibold leading-[1.05] tracking-[-0.045em] text-zinc-950 transition group-hover:text-violet-600 sm:mt-5 sm:text-4xl xl:text-[2.75rem]">
                        {featuredNews.title}
                      </h2>

                      <p className="mt-4 line-clamp-3 text-sm leading-6 text-zinc-600 sm:mt-5 sm:line-clamp-none sm:text-base sm:leading-7">
                        {featuredNews.excerpt}
                      </p>

                      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-zinc-200 pt-4 sm:mt-7 sm:gap-x-5 sm:pt-5">
                        <span className="text-[11px] text-zinc-500 sm:text-xs">
                          By{' '}
                          <span className="font-medium text-zinc-800">
                            {featuredNews.author}
                          </span>
                        </span>

                        <span className="hidden h-1 w-1 bg-zinc-300 sm:block" />

                        <span className="flex items-center gap-2 text-[11px] text-zinc-500 sm:text-xs">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(featuredNews.date)}
                        </span>
                      </div>

                      <div className="mt-6 flex items-center gap-3 sm:mt-8">
                        <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-violet-600 sm:text-[10px]">
                          Read full story
                        </span>

                        <span className="flex h-8 w-8 items-center justify-center border border-zinc-200 transition group-hover:translate-x-1 group-hover:border-violet-600 group-hover:bg-violet-600 group-hover:text-white">
                          <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </section>
            )}

            {/* LATEST STORIES */}

            {remainingNews.length > 0 && (
              <section className="border-t border-zinc-200 py-10 sm:py-16">
                <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end sm:gap-5">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[9px] tracking-[0.18em] text-zinc-400 sm:text-[10px]">
                        02
                      </span>

                      <span className="h-px w-6 bg-zinc-300 sm:w-8" />

                      <p className="font-mono text-[8px] font-semibold uppercase tracking-[0.18em] text-zinc-500 sm:text-[9px] sm:tracking-[0.2em]">
                        Latest updates
                      </p>
                    </div>

                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.045em] text-zinc-950 sm:mt-3 sm:text-4xl">
                      More from the journal.
                    </h2>
                  </div>

                  <p className="hidden max-w-xs text-sm leading-6 text-zinc-500 sm:block sm:text-right">
                    The latest ideas, projects,
                    announcements, and creative stories from
                    the studio.
                  </p>
                </div>

                {/*
                 * MOBILE:
                 * Compact horizontal cards.
                 *
                 * DESKTOP:
                 * Editorial row layout.
                 */}

                <div className="mt-7 border-t border-zinc-200 sm:mt-10">
                  {remainingNews.map((item, index) => (
                    <NewsRow
                      key={item.id}
                      item={item}
                      index={index + 2}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* FOOTER STATEMENT */}

            {filteredNews.length > 0 && (
              <section className="border-t border-zinc-200 py-12 sm:py-20">
                <div className="grid gap-6 sm:grid-cols-[120px_1fr] sm:gap-8">
                  <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-400 sm:text-[10px]">
                    06.01
                  </div>

                  <div className="max-w-3xl">
                    <p className="text-2xl font-medium leading-tight tracking-[-0.03em] text-zinc-900 sm:text-3xl">
                      We document the ideas, experiments,
                      and stories that become part of the
                      work.
                    </p>

                    <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 sm:mt-7">
                      <Link
                        to="/portfolio"
                        className="group inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-700 transition hover:text-violet-600 sm:text-xs"
                      >
                        Explore our work

                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </Link>

                      <Link
                        to="/contact"
                        className="group inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400 transition hover:text-zinc-900 sm:text-xs"
                      >
                        Start a project

                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  )
}

/*
 * ============================================================
 * FILTER BUTTON
 * ============================================================
 */

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 border-r border-zinc-200 px-4 py-2.5 text-[9px] font-semibold uppercase tracking-[0.12em] transition last:border-r-0 sm:text-[10px] ${active
          ? 'bg-zinc-950 text-white'
          : 'bg-white text-zinc-500 hover:bg-zinc-50 hover:text-zinc-950'
        }`}
    >
      {children}
    </button>
  )
}

/*
 * ============================================================
 * NEWS ROW
 * ============================================================
 */

function NewsRow({
  item,
  index,
}: {
  item: News
  index: number
}) {
  const dateParts = getDateParts(item.date)

  return (
    <Link
      to={`/news/${item.id}`}
      className="
        group
        block
        border-b
        border-zinc-200
        py-4
        transition
        hover:bg-zinc-50/70
        sm:py-8
      "
    >
      {/* ======================================================
          MOBILE — COMPACT SIDE CARD
          ====================================================== */}

      <div className="flex gap-3 sm:hidden">
        {/* IMAGE */}

        <div className="relative h-[88px] w-[112px] shrink-0 overflow-hidden bg-zinc-100">
          {item.image_url ? (
            <>
              <img
                src={item.image_url}
                alt={item.title}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                loading="lazy"
              />

              <div className="absolute inset-0 bg-black/5" />
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-50 via-white to-violet-50">
              <FileText className="h-5 w-5 text-violet-200" />
            </div>
          )}

          <span className="absolute bottom-2 left-2 bg-white/90 px-1.5 py-1 font-mono text-[7px] font-semibold uppercase tracking-[0.12em] text-violet-600 backdrop-blur-sm">
            {item.category}
          </span>
        </div>

        {/* CONTENT */}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-zinc-400">
              {dateParts.day} {dateParts.month}{' '}
              {dateParts.year}
            </span>
          </div>

          <h3 className="mt-1.5 line-clamp-2 text-[14px] font-semibold leading-[1.2] tracking-[-0.025em] text-zinc-950 transition group-hover:text-violet-600">
            {item.title}
          </h3>

          <p className="mt-1.5 line-clamp-1 text-[11px] leading-5 text-zinc-500">
            {item.excerpt}
          </p>

          <div className="mt-2 flex items-center justify-between">
            <span className="truncate text-[9px] text-zinc-400">
              By {item.author}
            </span>

            <span className="ml-2 flex shrink-0 items-center gap-1 text-[8px] font-semibold uppercase tracking-[0.12em] text-violet-600">
              Read
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </div>

      {/* ======================================================
          DESKTOP — EDITORIAL ROW
          ====================================================== */}

      <div className="hidden gap-6 lg:grid lg:grid-cols-[70px_180px_minmax(0,1fr)_220px] lg:items-center lg:gap-8 sm:grid">
        {/* INDEX */}

        <div>
          <span className="font-mono text-[10px] tracking-[0.16em] text-zinc-400">
            {String(index).padStart(2, '0')}
          </span>
        </div>

        {/* IMAGE */}

        <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100">
          {item.image_url ? (
            <>
              <img
                src={item.image_url}
                alt={item.title}
                className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                loading="lazy"
              />

              <div className="absolute inset-0 bg-black/5 transition group-hover:bg-transparent" />
            </>
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-zinc-50 via-white to-violet-50">
              <FileText className="h-7 w-7 text-violet-200" />
            </div>
          )}
        </div>

        {/* ARTICLE */}

        <div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.17em] text-violet-600">
              {item.category}
            </span>

            <span className="h-1 w-1 bg-zinc-300" />

            <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-zinc-400">
              {dateParts.day} {dateParts.month}{' '}
              {dateParts.year}
            </span>
          </div>

          <h3 className="mt-3 max-w-2xl text-xl font-semibold leading-tight tracking-[-0.03em] text-zinc-950 transition group-hover:text-violet-600 sm:text-2xl">
            {item.title}
          </h3>

          <p className="mt-3 line-clamp-2 max-w-2xl text-sm leading-6 text-zinc-500">
            {item.excerpt}
          </p>

          <div className="mt-4 flex items-center gap-2 text-xs text-zinc-500">
            <span>By {item.author}</span>
          </div>
        </div>

        {/* DATE / ACTION */}

        <div className="flex flex-col items-end justify-between self-stretch">
          <div className="text-right">
            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-400">
              Published
            </p>

            <p className="mt-2 text-xs text-zinc-500">
              {formatDate(item.date)}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400 transition group-hover:text-violet-600">
            Read

            <span className="flex h-7 w-7 items-center justify-center border border-zinc-200 transition group-hover:translate-x-1 group-hover:border-violet-600 group-hover:bg-violet-600 group-hover:text-white">
              <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </div>
      </div>

      {/* TABLET — COMPACT BUT NOT MOBILE */}

      <div className="hidden sm:flex lg:hidden gap-5">
        <div className="relative h-28 w-40 shrink-0 overflow-hidden bg-zinc-100">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.title}
              className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-zinc-50 via-white to-violet-50">
              <FileText className="h-7 w-7 text-violet-200" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.17em] text-violet-600">
              {item.category}
            </span>

            <span className="h-1 w-1 bg-zinc-300" />

            <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-zinc-400">
              {dateParts.day} {dateParts.month}{' '}
              {dateParts.year}
            </span>
          </div>

          <h3 className="mt-2 line-clamp-2 text-xl font-semibold leading-tight tracking-[-0.03em] text-zinc-950 transition group-hover:text-violet-600">
            {item.title}
          </h3>

          <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-500">
            {item.excerpt}
          </p>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-zinc-500">
              By {item.author}
            </span>

            <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-violet-600">
              Read story
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}