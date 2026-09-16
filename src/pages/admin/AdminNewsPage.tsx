import {
  Edit,
  FileText,
  ImagePlus,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import {
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from 'react'

const API_BASE_URL = 'https://39production-api.39production.workers.dev'
const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const MAX_STORED_IMAGE_SIZE = 150 * 1024
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]

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
  created_at?: string
  updated_at?: string
}

interface NewsForm {
  title: string
  category: string
  author: string
  excerpt: string
  content: string
  date: string
  status: 'Published' | 'Draft'
}

interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
}

type AdminTheme = 'dark' | 'light'

interface ThemeTokens {
  page: string
  surface: string
  elevated: string
  input: string
  border: string
  textPrimary: string
  textSecondary: string
  textMuted: string
  hover: string
  placeholder: string
}

const emptyForm: NewsForm = {
  title: '',
  category: 'Company',
  author: 'Admin',
  excerpt: '',
  content: '',
  date: new Date().toISOString().split('T')[0],
  status: 'Published',
}

function useAdminTheme() {
  const readTheme = (): AdminTheme =>
    document.documentElement.dataset.adminTheme === 'light'
      ? 'light'
      : 'dark'

  const [theme, setTheme] = useState<AdminTheme>(readTheme)

  useEffect(() => {
    const syncTheme = () => {
      setTheme(readTheme())
    }

    syncTheme()

    const observer = new MutationObserver(syncTheme)

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-admin-theme'],
    })

    return () => observer.disconnect()
  }, [])

  return theme
}

function getThemeTokens(theme: AdminTheme): ThemeTokens {
  if (theme === 'light') {
    return {
      page: 'bg-[#f7f7fa]',
      surface: 'bg-white',
      elevated: 'bg-neutral-50',
      input: 'bg-white',
      border: 'border-neutral-200',
      textPrimary: 'text-neutral-900',
      textSecondary: 'text-neutral-600',
      textMuted: 'text-neutral-500',
      hover: 'hover:bg-neutral-50',
      placeholder: 'placeholder:text-neutral-400',
    }
  }

  return {
    page: 'bg-[#0b0b0f]',
    surface: 'bg-[#15151b]',
    elevated: 'bg-[#1b1b22]',
    input: 'bg-[#0f0f13]',
    border: 'border-white/[0.08]',
    textPrimary: 'text-white',
    textSecondary: 'text-white/70',
    textMuted: 'text-white/45',
    hover: 'hover:bg-white/[0.04]',
    placeholder: 'placeholder:text-white/30',
  }
}

function extractToken(value: unknown): string | null {
  if (typeof value === 'string') {
    const t = value.trim()

    if (!t) return null

    try {
      return extractToken(JSON.parse(t))
    } catch {
      return t
    }
  }

  if (value && typeof value === 'object') {
    const r = value as Record<string, unknown>

    for (const k of [
      'token',
      'access_token',
      'accessToken',
      'admin_token',
      'adminToken',
      'session_token',
      'sessionToken',
    ]) {
      const v = r[k]

      if (typeof v === 'string' && v.trim()) {
        return v.trim()
      }
    }

    for (const k of ['data', 'auth', 'session', 'user']) {
      const v = extractToken(r[k])

      if (v) return v
    }
  }

  return null
}

function getStoredAuthTokens() {
  const tokens: string[] = []
  const seen = new Set<string>()

  const add = (value: unknown) => {
    const token = extractToken(value)

    if (token && !seen.has(token)) {
      seen.add(token)
      tokens.push(token)
    }
  }

  const keys = [
    'token',
    'auth_token',
    'access_token',
    'accessToken',
    'admin_token',
    'adminToken',
    'session_token',
    'sessionToken',
    'auth',
    'adminAuth',
    'user',
  ]

  for (const storage of [
    window.localStorage,
    window.sessionStorage,
  ]) {
    for (const key of keys) {
      try {
        add(storage.getItem(key))
      } catch {
        // Ignore storage access errors.
      }
    }

    try {
      for (let i = 0; i < storage.length; i += 1) {
        const key = storage.key(i)

        if (key && !keys.includes(key)) {
          add(storage.getItem(key))
        }
      }
    } catch {
      // Ignore storage access errors.
    }
  }

  return tokens
}

async function getAdminToken() {
  for (const token of getStoredAuthTokens()) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      })

      if (response.ok) {
        return token
      }
    } catch {
      // Try the next token.
    }
  }

  return null
}

async function adminFetch(
  url: string,
  init: RequestInit = {},
) {
  const token = await getAdminToken()

  if (!token) {
    throw new Error(
      'Admin session not found or expired. Please login again.',
    )
  }

  const headers = new Headers(init.headers)
  headers.set('Authorization', `Bearer ${token}`)

  return fetch(url, {
    ...init,
    headers,
  })
}

async function compressImage(file: File): Promise<File> {
  if (file.type === 'image/gif') {
    if (file.size > MAX_STORED_IMAGE_SIZE) {
      throw new Error(
        'GIF must not exceed 150 KB. Please choose a smaller image or use JPG/PNG/WEBP.',
      )
    }

    return file
  }

  if (
    file.size <= MAX_STORED_IMAGE_SIZE &&
    file.type === 'image/webp'
  ) {
    return file
  }

  const bitmap = await createImageBitmap(file)

  const dimensions = [
    1200,
    1000,
    800,
    700,
    600,
    500,
    400,
  ]

  const qualities = [
    0.82,
    0.72,
    0.62,
    0.52,
    0.42,
    0.34,
    0.28,
  ]

  try {
    for (const maxDimension of dimensions) {
      const scale = Math.min(
        1,
        maxDimension / Math.max(bitmap.width, bitmap.height),
      )

      const width = Math.max(
        1,
        Math.round(bitmap.width * scale),
      )

      const height = Math.max(
        1,
        Math.round(bitmap.height * scale),
      )

      const canvas = document.createElement('canvas')

      canvas.width = width
      canvas.height = height

      const context = canvas.getContext('2d')

      if (!context) continue

      context.drawImage(
        bitmap,
        0,
        0,
        width,
        height,
      )

      for (const quality of qualities) {
        const blob = await new Promise<Blob | null>(
          (resolve) =>
            canvas.toBlob(
              resolve,
              'image/webp',
              quality,
            ),
        )

        if (
          blob &&
          blob.size <= MAX_STORED_IMAGE_SIZE
        ) {
          return new File(
            [blob],
            `${file.name.replace(/\.[^.]+$/, '')}.webp`,
            {
              type: 'image/webp',
              lastModified: Date.now(),
            },
          )
        }
      }
    }
  } finally {
    bitmap.close()
  }

  throw new Error(
    'Image could not be compressed below 150 KB. Please choose a simpler or smaller image.',
  )
}

export function AdminNewsPage() {
  const theme = useAdminTheme()
  const tokens = getThemeTokens(theme)

  const [news, setNews] = useState<News[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [categoryFilter, setCategoryFilter] = useState('All')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingNews, setEditingNews] =
    useState<News | null>(null)

  const [form, setForm] =
    useState<NewsForm>(emptyForm)

  const [imageFile, setImageFile] =
    useState<File | null>(null)

  const [imagePreview, setImagePreview] =
    useState('')

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  async function loadNews() {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(
        `${API_BASE_URL}/api/news`,
        {
          cache: 'no-store',
        },
      )

      const result: ApiResponse<News[]> =
        await response.json()

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
          'Gagal mengambil data news.',
        )
      }

      setNews(result.data || [])
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Gagal mengambil data news.',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNews()
  }, [])

  const categories = Array.from(
    new Set(news.map((item) => item.category)),
  )

  const filteredNews = useMemo(() => {
    return news.filter((item) => {
      const q = search.trim().toLowerCase()

      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.author.toLowerCase().includes(q) ||
        item.excerpt.toLowerCase().includes(q)

      const matchesStatus =
        statusFilter === 'All' ||
        item.status === statusFilter

      const matchesCategory =
        categoryFilter === 'All' ||
        item.category === categoryFilter

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory
      )
    })
  }, [
    news,
    search,
    statusFilter,
    categoryFilter,
  ])

  const publishedCount = news.filter(
    (item) => item.status === 'Published',
  ).length

  const draftCount = news.filter(
    (item) => item.status === 'Draft',
  ).length

  const resetImage = () => {
    if (imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview)
    }

    setImageFile(null)
    setImagePreview('')
  }

  const openAddModal = () => {
    setEditingNews(null)

    setForm({
      ...emptyForm,
      date: new Date()
        .toISOString()
        .split('T')[0],
    })

    resetImage()
    setError('')
    setIsModalOpen(true)
  }

  const openEditModal = (item: News) => {
    setEditingNews(item)

    setForm({
      title: item.title,
      category: item.category,
      author: item.author,
      excerpt: item.excerpt,
      content: item.content,
      date: item.date,
      status: item.status,
    })

    setImageFile(null)
    setImagePreview(item.image_url || '')
    setError('')
    setIsModalOpen(true)
  }

  const closeModal = (force = false) => {
    if (saving && !force) return

    if (imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview)
    }

    setIsModalOpen(false)
    setEditingNews(null)
    setForm(emptyForm)
    setImageFile(null)
    setImagePreview('')
    setError('')
  }

  function handleImageChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0]

    if (!file) return

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError(
        'Image must be JPG, PNG, WEBP, or GIF.',
      )
      return
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError(
        'Image size must not exceed 5 MB.',
      )
      return
    }

    if (imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview)
    }

    setError('')
    setImageFile(file)
    setImagePreview(
      URL.createObjectURL(file),
    )
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setError('')

    const title = form.title.trim()
    const author = form.author.trim()
    const excerpt = form.excerpt.trim()
    const content = form.content.trim()

    if (!title) {
      setError('News title is required.')
      return
    }

    if (!author) {
      setError('Author is required.')
      return
    }

    if (!excerpt) {
      setError('Excerpt is required.')
      return
    }

    if (!content) {
      setError('Content is required.')
      return
    }

    if (!form.date) {
      setError('Publication date is required.')
      return
    }

    try {
      setSaving(true)

      const formData = new FormData()

      formData.append('title', title)
      formData.append('category', form.category)
      formData.append('author', author)
      formData.append('excerpt', excerpt)
      formData.append('content', content)
      formData.append('date', form.date)
      formData.append('status', form.status)

      if (imageFile) {
        formData.append(
          'image',
          await compressImage(imageFile),
        )
      }

      const editing = !!editingNews

      const url = editing
        ? `${API_BASE_URL}/api/news/${editingNews!.id}`
        : `${API_BASE_URL}/api/news`

      const response = await adminFetch(url, {
        method: editing ? 'PUT' : 'POST',
        body: formData,
      })

      const result: ApiResponse<News> =
        await response.json()

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
          'Gagal menyimpan news.',
        )
      }

      if (!result.data) {
        throw new Error(
          'News was saved but no data was returned.',
        )
      }

      setNews((current) =>
        editing
          ? current.map((item) =>
            item.id === result.data!.id
              ? result.data!
              : item,
          )
          : [result.data!, ...current],
      )

      closeModal(true)
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Gagal menyimpan news.',
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    const item = news.find(
      (newsItem) => newsItem.id === id,
    )

    if (
      !item ||
      !window.confirm(
        `Are you sure you want to delete "${item.title}"?`,
      )
    ) {
      return
    }

    try {
      setError('')

      const response = await adminFetch(
        `${API_BASE_URL}/api/news/${id}`,
        {
          method: 'DELETE',
        },
      )

      const result: ApiResponse<unknown> =
        await response.json()

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
          'Gagal menghapus news.',
        )
      }

      setNews((current) =>
        current.filter(
          (newsItem) => newsItem.id !== id,
        ),
      )
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Gagal menghapus news.',
      )
    }
  }

  function formatDate(date: string) {
    return new Intl.DateTimeFormat(
      'id-ID',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      },
    ).format(new Date(`${date}T00:00:00`))
  }

  const inputClass = [
    'w-full rounded-lg border px-4 py-3 text-sm outline-none transition',
    tokens.border,
    tokens.input,
    tokens.textPrimary,
    tokens.placeholder,
    'focus:border-violet-500',
  ].join(' ')

  const compactInputClass = [
    'w-full rounded-lg border py-3 pl-10 pr-4 text-sm outline-none transition',
    tokens.border,
    tokens.input,
    tokens.textPrimary,
    tokens.placeholder,
    'focus:border-violet-500',
  ].join(' ')

  const selectClass = [
    'w-full rounded-lg border px-4 py-3 text-sm outline-none transition',
    tokens.border,
    tokens.input,
    tokens.textPrimary,
    'focus:border-violet-500',
  ].join(' ')

  return (
    <div
      className={[
        'min-h-full space-y-8',
        tokens.page,
      ].join(' ')}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p
            className={[
              'text-sm',
              tokens.textMuted,
            ].join(' ')}
          >
            Content Management
          </p>

          <h1
            className={[
              'mt-1 font-display text-3xl font-bold',
              tokens.textPrimary,
            ].join(' ')}
          >
            News
          </h1>

          <p
            className={[
              'mt-2 max-w-2xl text-sm',
              tokens.textSecondary,
            ].join(' ')}
          >
            Manage news articles, announcements,
            company updates, and website
            publications.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500"
        >
          <Plus className="h-4 w-4" />
          Add News
        </button>
      </div>

      {/* Error */}
      {error && !isModalOpen && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          label="Total News"
          value={String(news.length)}
          theme={theme}
        />

        <StatCard
          label="Published"
          value={String(publishedCount)}
          theme={theme}
        />

        <StatCard
          label="Draft"
          value={String(draftCount)}
          theme={theme}
        />
      </div>

      {/* Filters */}
      <div
        className={[
          'rounded-xl border p-5',
          tokens.border,
          tokens.surface,
        ].join(' ')}
      >
        <div className="grid gap-4 md:grid-cols-[1fr_200px_200px]">
          <div className="relative">
            <Search
              className={[
                'absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2',
                tokens.textMuted,
              ].join(' ')}
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search news..."
              className={compactInputClass}
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(event) =>
              setCategoryFilter(event.target.value)
            }
            className={selectClass}
          >
            <option value="All">All Categories</option>

            {categories.map((category) => (
              <option
                key={category}
                value={category}
              >
                {category}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
            className={selectClass}
          >
            <option value="All">
              All Status
            </option>
            <option value="Published">
              Published
            </option>
            <option value="Draft">
              Draft
            </option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div
        className={[
          'overflow-hidden rounded-xl border',
          tokens.border,
          tokens.surface,
        ].join(' ')}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead
              className={[
                'border-b',
                tokens.border,
                tokens.elevated,
              ].join(' ')}
            >
              <tr>
                {[
                  'Article',
                  'Category',
                  'Author',
                  'Date',
                  'Status',
                  'Actions',
                ].map((heading) => (
                  <th
                    key={heading}
                    className={[
                      'px-6 py-4 font-semibold',
                      tokens.textPrimary,
                    ].join(' ')}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className={[
                      'px-6 py-16 text-center',
                      tokens.textMuted,
                    ].join(' ')}
                  >
                    Loading news...
                  </td>
                </tr>
              ) : filteredNews.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className={[
                      'px-6 py-16 text-center',
                      tokens.textMuted,
                    ].join(' ')}
                  >
                    No news articles found.
                  </td>
                </tr>
              ) : (
                filteredNews.map((item) => (
                  <tr
                    key={item.id}
                    className={[
                      'border-b transition last:border-0',
                      tokens.border,
                      theme === 'light'
                        ? 'hover:bg-neutral-50'
                        : 'hover:bg-white/[0.02]',
                    ].join(' ')}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={[
                            'h-14 w-20 shrink-0 overflow-hidden rounded-lg',
                            tokens.elevated,
                          ].join(' ')}
                        >
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <FileText
                                className={[
                                  'h-5 w-5',
                                  tokens.textMuted,
                                ].join(' ')}
                              />
                            </div>
                          )}
                        </div>

                        <div className="max-w-md">
                          <p
                            className={[
                              'font-medium',
                              tokens.textPrimary,
                            ].join(' ')}
                          >
                            {item.title}
                          </p>

                          <p
                            className={[
                              'mt-1 truncate text-xs',
                              tokens.textMuted,
                            ].join(' ')}
                          >
                            {item.excerpt}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td
                      className={[
                        'px-6 py-4',
                        tokens.textSecondary,
                      ].join(' ')}
                    >
                      {item.category}
                    </td>

                    <td
                      className={[
                        'px-6 py-4',
                        tokens.textSecondary,
                      ].join(' ')}
                    >
                      {item.author}
                    </td>

                    <td
                      className={[
                        'px-6 py-4',
                        tokens.textSecondary,
                      ].join(' ')}
                    >
                      {formatDate(item.date)}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={[
                          'inline-flex rounded-full px-3 py-1 text-xs font-medium',
                          item.status === 'Published'
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : 'bg-amber-500/10 text-amber-500',
                        ].join(' ')}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            openEditModal(item)
                          }
                          className={[
                            'rounded-lg border p-2 transition',
                            tokens.border,
                            tokens.textMuted,
                            theme === 'light'
                              ? 'hover:bg-neutral-100 hover:text-neutral-900'
                              : 'hover:bg-white/[0.05] hover:text-white',
                          ].join(' ')}
                          title="Edit news"
                        >
                          <Edit className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(item.id)
                          }
                          className={[
                            'rounded-lg border border-red-500/20 p-2 text-red-400 transition',
                            theme === 'light'
                              ? 'hover:bg-red-50'
                              : 'hover:bg-red-400/10',
                          ].join(' ')}
                          title="Delete news"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-[2px]">
          <div
            className={[
              'max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border shadow-2xl',
              tokens.border,
              tokens.surface,
            ].join(' ')}
          >
            {/* Modal Header */}
            <div
              className={[
                'flex items-center justify-between border-b px-6 py-5',
                tokens.border,
              ].join(' ')}
            >
              <div>
                <h2
                  className={[
                    'font-display text-xl font-bold',
                    tokens.textPrimary,
                  ].join(' ')}
                >
                  {editingNews
                    ? 'Edit News'
                    : 'Add News'}
                </h2>

                <p
                  className={[
                    'mt-1 text-sm',
                    tokens.textMuted,
                  ].join(' ')}
                >
                  {editingNews
                    ? 'Update news article information.'
                    : 'Create a new news article.'}
                </p>
              </div>

              <button
                onClick={() => closeModal()}
                disabled={saving}
                className={[
                  'rounded-lg p-2 transition disabled:cursor-not-allowed disabled:opacity-50',
                  tokens.textMuted,
                  tokens.hover,
                ].join(' ')}
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >
              {error && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <Field
                label="Title"
                textClass={tokens.textPrimary}
              >
                <input
                  value={form.title}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      title: event.target.value,
                    })
                  }
                  placeholder="News title"
                  className={inputClass}
                />
              </Field>

              <div className="grid gap-5 md:grid-cols-2">
                <Field
                  label="Category"
                  textClass={tokens.textPrimary}
                >
                  <select
                    value={form.category}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        category:
                          event.target.value,
                      })
                    }
                    className={selectClass}
                  >
                    <option value="Company">
                      Company
                    </option>
                    <option value="Behind The Scenes">
                      Behind The Scenes
                    </option>
                    <option value="Tips">
                      Tips
                    </option>
                    <option value="Announcement">
                      Announcement
                    </option>
                    <option value="Technology">
                      Technology
                    </option>
                    <option value="Creative">
                      Creative
                    </option>
                  </select>
                </Field>

                <Field
                  label="Publication Date"
                  textClass={tokens.textPrimary}
                >
                  <input
                    type="date"
                    value={form.date}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        date: event.target.value,
                      })
                    }
                    className={inputClass}
                  />
                </Field>
              </div>

              <Field
                label="Author"
                textClass={tokens.textPrimary}
              >
                <input
                  value={form.author}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      author: event.target.value,
                    })
                  }
                  placeholder="Admin"
                  className={inputClass}
                />
              </Field>

              {/* Image */}
              <div>
                <label
                  className={[
                    'mb-2 block text-sm font-medium',
                    tokens.textPrimary,
                  ].join(' ')}
                >
                  News Cover Image
                </label>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div
                    className={[
                      'h-28 w-full overflow-hidden rounded-xl border sm:w-44',
                      tokens.border,
                      tokens.elevated,
                    ].join(' ')}
                  >
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="News preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div
                        className={[
                          'flex h-full flex-col items-center justify-center',
                          tokens.textMuted,
                        ].join(' ')}
                      >
                        <ImagePlus className="h-7 w-7" />

                        <span className="mt-2 text-xs">
                          No image
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label
                      className={[
                        'inline-flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition',
                        tokens.border,
                        tokens.textPrimary,
                        tokens.hover,
                      ].join(' ')}
                    >
                      <ImagePlus className="h-4 w-4" />
                      Choose Image

                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handleImageChange}
                        disabled={saving}
                        className="sr-only"
                      />
                    </label>

                    <p
                      className={[
                        'mt-2 text-xs',
                        tokens.textMuted,
                      ].join(' ')}
                    >
                      JPG, PNG, WEBP, GIF. Max 5 MB;
                      stored image is compressed to
                      150 KB.
                    </p>

                    {imageFile && (
                      <p
                        className={[
                          'mt-1 max-w-xs truncate text-xs',
                          tokens.textSecondary,
                        ].join(' ')}
                      >
                        {imageFile.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <Field
                label="Excerpt"
                textClass={tokens.textPrimary}
              >
                <textarea
                  rows={3}
                  value={form.excerpt}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      excerpt: event.target.value,
                    })
                  }
                  placeholder="Short summary of the article..."
                  className={`${inputClass} resize-none`}
                />
              </Field>

              <Field
                label="Content"
                textClass={tokens.textPrimary}
              >
                <textarea
                  rows={8}
                  value={form.content}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      content: event.target.value,
                    })
                  }
                  placeholder="Write the complete article content..."
                  className={`${inputClass} resize-none`}
                />
              </Field>

              <Field
                label="Status"
                textClass={tokens.textPrimary}
              >
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      status:
                        event.target.value as
                        | 'Published'
                        | 'Draft',
                    })
                  }
                  className={selectClass}
                >
                  <option value="Published">
                    Published
                  </option>

                  <option value="Draft">
                    Draft
                  </option>
                </select>
              </Field>

              {/* Footer */}
              <div
                className={[
                  'flex justify-end gap-3 border-t pt-5',
                  tokens.border,
                ].join(' ')}
              >
                <button
                  type="button"
                  onClick={() => closeModal()}
                  disabled={saving}
                  className={[
                    'rounded-lg border px-5 py-2.5 text-sm transition disabled:cursor-not-allowed disabled:opacity-50',
                    tokens.border,
                    tokens.textSecondary,
                    tokens.hover,
                  ].join(' ')}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? 'Saving...'
                    : editingNews
                      ? 'Save Changes'
                      : 'Create News'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({
  label,
  children,
  textClass,
}: {
  label: string
  children: ReactNode
  textClass: string
}) {
  return (
    <div>
      <label
        className={[
          'mb-2 block text-sm font-medium',
          textClass,
        ].join(' ')}
      >
        {label}
      </label>

      {children}
    </div>
  )
}

function StatCard({
  label,
  value,
  theme,
}: {
  label: string
  value: string
  theme: AdminTheme
}) {
  const tokens = getThemeTokens(theme)

  return (
    <div
      className={[
        'rounded-xl border p-5',
        tokens.border,
        tokens.surface,
      ].join(' ')}
    >
      <div className="mb-3 flex items-center gap-2 text-violet-500">
        <FileText className="h-5 w-5" />

        <span className="text-sm">
          {label}
        </span>
      </div>

      <p
        className={[
          'text-2xl font-bold',
          tokens.textPrimary,
        ].join(' ')}
      >
        {value}
      </p>
    </div>
  )
}
