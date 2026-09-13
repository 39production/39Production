import {
  Edit,
  FolderOpen,
  ImagePlus,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

const API_BASE_URL =
  'https://39production-api.39production.workers.dev'

const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const MAX_STORED_IMAGE_SIZE = 150 * 1024

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]

type AdminTheme = 'dark' | 'light'

interface Portfolio {
  id: number
  title: string
  category: string
  client: string
  description: string
  year: string
  status: 'Published' | 'Draft'
  image_url?: string | null
  created_at?: string
  updated_at?: string
}

interface PortfolioForm {
  title: string
  category: string
  client: string
  description: string
  year: string
  status: 'Published' | 'Draft'
}

interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
}

interface ThemeTokens {
  page: string
  surface: string
  elevated: string
  input: string
  border: string
  borderSubtle: string
  textPrimary: string
  textSecondary: string
  textMuted: string
  hover: string
  placeholder: string
}

const categories = [
  'Web Development',
  'UI/UX Design',
  'Animation',
  'Game Development',
  'Brand Identity',
  'Video Production',
]

const emptyForm: PortfolioForm = {
  title: '',
  category: 'Web Development',
  client: '',
  description: '',
  year: '',
  status: 'Published',
}

function useAdminTheme() {
  const readTheme = (): AdminTheme =>
    document.documentElement.dataset.adminTheme === 'light'
      ? 'light'
      : 'dark'

  const [theme, setTheme] = useState<AdminTheme>(readTheme)

  useEffect(() => {
    const syncTheme = () => setTheme(readTheme())

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

function getThemeTokens(
  theme: AdminTheme,
): ThemeTokens {
  if (theme === 'light') {
    return {
      page: 'bg-[#f7f7fa]',
      surface: 'bg-white',
      elevated: 'bg-neutral-50',
      input: 'bg-white',
      border: 'border-neutral-200',
      borderSubtle: 'border-neutral-200',
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
    borderSubtle: 'border-white/[0.07]',
    textPrimary: 'text-white',
    textSecondary: 'text-white/70',
    textMuted: 'text-white/45',
    hover: 'hover:bg-white/[0.04]',
    placeholder: 'placeholder:text-white/25',
  }
}

function extractToken(
  value: unknown,
): string | null {
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
    const record =
      value as Record<string, unknown>

    for (const key of [
      'token',
      'access_token',
      'accessToken',
      'admin_token',
      'adminToken',
      'session_token',
      'sessionToken',
    ]) {
      const candidate = record[key]

      if (
        typeof candidate === 'string' &&
        candidate.trim()
      ) {
        return candidate.trim()
      }
    }

    for (const key of [
      'data',
      'auth',
      'session',
      'user',
    ]) {
      const candidate = extractToken(
        record[key],
      )

      if (candidate) return candidate
    }
  }

  return null
}

function getStoredAuthTokens() {
  const tokens: string[] = []
  const seen = new Set<string>()

  const add = (value: unknown) => {
    const token = extractToken(value)

    if (
      token &&
      !seen.has(token)
    ) {
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
        // Ignore unavailable storage entries.
      }
    }

    try {
      for (
        let i = 0;
        i < storage.length;
        i += 1
      ) {
        const key = storage.key(i)

        if (
          key &&
          !keys.includes(key)
        ) {
          add(storage.getItem(key))
        }
      }
    } catch {
      // Ignore unavailable storage entries.
    }
  }

  return tokens
}

async function getAdminToken(): Promise<string | null> {
  for (const token of getStoredAuthTokens()) {
    try {
      const r = await fetch(
        `${API_BASE_URL}/api/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        },
      )

      if (r.ok) return token
    } catch {
      // Try next token.
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

  const headers = new Headers(
    init.headers,
  )

  headers.set(
    'Authorization',
    `Bearer ${token}`,
  )

  return fetch(url, {
    ...init,
    headers,
  })
}

async function compressImage(
  file: File,
): Promise<File> {
  if (file.type === 'image/gif') {
    if (
      file.size >
      MAX_STORED_IMAGE_SIZE
    ) {
      throw new Error(
        'GIF must not exceed 150 KB. Please choose a smaller image or use JPG/PNG/WEBP.',
      )
    }

    return file
  }

  if (
    file.size <=
    MAX_STORED_IMAGE_SIZE &&
    file.type === 'image/webp'
  ) {
    return file
  }

  const bitmap =
    await createImageBitmap(file)

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
        maxDimension /
        Math.max(
          bitmap.width,
          bitmap.height,
        ),
      )

      const width = Math.max(
        1,
        Math.round(
          bitmap.width * scale,
        ),
      )

      const height = Math.max(
        1,
        Math.round(
          bitmap.height * scale,
        ),
      )

      const canvas =
        document.createElement(
          'canvas',
        )

      canvas.width = width
      canvas.height = height

      const ctx =
        canvas.getContext('2d')

      if (!ctx) continue

      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'

      ctx.drawImage(
        bitmap,
        0,
        0,
        width,
        height,
      )

      for (const quality of qualities) {
        const blob =
          await new Promise<Blob | null>(
            (resolve) =>
              canvas.toBlob(
                resolve,
                'image/webp',
                quality,
              ),
          )

        if (
          blob &&
          blob.size <=
          MAX_STORED_IMAGE_SIZE
        ) {
          return new File(
            [blob],
            `${file.name.replace(/\.[^.]+$/, '')}.webp`,
            {
              type: 'image/webp',
              lastModified:
                Date.now(),
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

export function AdminPortfolioPage() {
  const theme = useAdminTheme()
  const c = getThemeTokens(theme)

  const [portfolio, setPortfolio] =
    useState<Portfolio[]>([])

  const [loading, setLoading] =
    useState(true)

  const [saving, setSaving] =
    useState(false)

  const [searchQuery, setSearchQuery] =
    useState('')

  const [statusFilter, setStatusFilter] =
    useState<
      'All' | 'Published' | 'Draft'
    >('All')

  const [isModalOpen, setIsModalOpen] =
    useState(false)

  const [
    editingPortfolio,
    setEditingPortfolio,
  ] = useState<Portfolio | null>(null)

  const [form, setForm] =
    useState<PortfolioForm>({
      ...emptyForm,
    })

  const [imageFile, setImageFile] =
    useState<File | null>(null)

  const [imagePreview, setImagePreview] =
    useState('')

  const [error, setError] =
    useState('')

  async function fetchPortfolio() {
    try {
      setLoading(true)
      setError('')

      const r = await fetch(
        `${API_BASE_URL}/api/portfolio`,
        {
          cache: 'no-store',
        },
      )

      const result:
        ApiResponse<Portfolio[]> =
        await r.json()

      if (
        !r.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
          'Failed to fetch portfolio.',
        )
      }

      setPortfolio(result.data || [])
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Failed to fetch portfolio.',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPortfolio()
  }, [])

  useEffect(() => {
    return () => {
      if (
        imagePreview.startsWith(
          'blob:',
        )
      ) {
        URL.revokeObjectURL(
          imagePreview,
        )
      }
    }
  }, [imagePreview])

  const filteredPortfolio =
    useMemo(
      () =>
        portfolio.filter((item) => {
          const q =
            searchQuery
              .trim()
              .toLowerCase()

          return (
            (!q ||
              item.title
                .toLowerCase()
                .includes(q) ||
              item.client
                .toLowerCase()
                .includes(q) ||
              item.category
                .toLowerCase()
                .includes(q)) &&
            (statusFilter === 'All' ||
              item.status ===
              statusFilter)
          )
        }),
      [
        portfolio,
        searchQuery,
        statusFilter,
      ],
    )

  const publishedCount =
    portfolio.filter(
      (i) => i.status === 'Published',
    ).length

  const draftCount =
    portfolio.filter(
      (i) => i.status === 'Draft',
    ).length

  const resetImage = () => {
    if (
      imagePreview.startsWith(
        'blob:',
      )
    ) {
      URL.revokeObjectURL(
        imagePreview,
      )
    }

    setImageFile(null)
    setImagePreview('')
  }

  const openCreateModal = () => {
    setEditingPortfolio(null)

    setForm({
      ...emptyForm,
    })

    resetImage()
    setError('')
    setIsModalOpen(true)
  }

  const openEditModal = (
    item: Portfolio,
  ) => {
    setEditingPortfolio(item)

    setForm({
      title: item.title,
      category: item.category,
      client: item.client,
      description:
        item.description,
      year: item.year,
      status: item.status,
    })

    setImageFile(null)
    setImagePreview(
      item.image_url || '',
    )

    setError('')
    setIsModalOpen(true)
  }

  const closeModal = () => {
    if (saving) return

    setIsModalOpen(false)
    setEditingPortfolio(null)

    setForm({
      ...emptyForm,
    })

    resetImage()
    setError('')
  }

  function handleImageChange(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      e.target.files?.[0]

    e.target.value = ''

    if (!file) return

    if (
      !ALLOWED_IMAGE_TYPES.includes(
        file.type,
      )
    ) {
      setError(
        'Image must be JPG, PNG, WEBP, or GIF.',
      )
      return
    }

    if (
      file.size > MAX_IMAGE_SIZE
    ) {
      setError(
        'Image size must not exceed 5 MB.',
      )
      return
    }

    if (
      imagePreview.startsWith(
        'blob:',
      )
    ) {
      URL.revokeObjectURL(
        imagePreview,
      )
    }

    setError('')
    setImageFile(file)

    setImagePreview(
      URL.createObjectURL(file),
    )
  }

  async function handleSubmit(
    e: React.FormEvent,
  ) {
    e.preventDefault()
    setError('')

    if (!form.title.trim()) {
      setError(
        'Portfolio title is required.',
      )
      return
    }

    if (!form.client.trim()) {
      setError('Client is required.')
      return
    }

    if (!form.description.trim()) {
      setError(
        'Description is required.',
      )
      return
    }

    if (!form.year.trim()) {
      setError('Year is required.')
      return
    }

    try {
      setSaving(true)

      const fd = new FormData()

      fd.append(
        'title',
        form.title.trim(),
      )

      fd.append(
        'category',
        form.category,
      )

      fd.append(
        'client',
        form.client.trim(),
      )

      fd.append(
        'description',
        form.description.trim(),
      )

      fd.append(
        'year',
        form.year.trim(),
      )

      fd.append(
        'status',
        form.status,
      )

      if (imageFile) {
        fd.append(
          'image',
          await compressImage(
            imageFile,
          ),
        )
      }

      const editing =
        !!editingPortfolio

      const url = editing
        ? `${API_BASE_URL}/api/portfolio/${editingPortfolio!.id}`
        : `${API_BASE_URL}/api/portfolio`

      const r = await adminFetch(
        url,
        {
          method: editing
            ? 'PUT'
            : 'POST',
          body: fd,
        },
      )

      const result:
        ApiResponse<Portfolio> =
        await r.json()

      if (
        !r.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
          'Failed to save portfolio.',
        )
      }

      if (!result.data) {
        throw new Error(
          'Portfolio was saved but no data was returned.',
        )
      }

      setPortfolio(
        (current) =>
          editing
            ? current.map(
              (item) =>
                item.id ===
                  result.data!.id
                  ? result.data!
                  : item,
            )
            : [
              result.data!,
              ...current,
            ],
      )

      closeModal()
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Failed to save portfolio.',
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(
    id: number,
  ) {
    const item =
      portfolio.find(
        (i) => i.id === id,
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

      const r = await adminFetch(
        `${API_BASE_URL}/api/portfolio/${id}`,
        {
          method: 'DELETE',
        },
      )

      const result:
        ApiResponse<unknown> =
        await r.json()

      if (
        !r.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
          'Failed to delete portfolio.',
        )
      }

      setPortfolio((current) =>
        current.filter(
          (i) => i.id !== id,
        ),
      )
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Failed to delete portfolio.',
      )
    }
  }

  return (
    <div
      className={`min-h-full space-y-6 ${c.page}`}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p
            className={`text-sm ${c.textMuted}`}
          >
            Admin Panel
          </p>

          <h1
            className={`mt-1 text-2xl font-bold ${c.textPrimary}`}
          >
            Portfolio
          </h1>

          <p
            className={`mt-1 text-sm ${c.textMuted}`}
          >
            Kelola portfolio yang
            ditampilkan pada website.
          </p>
        </div>

        <button
          onClick={
            openCreateModal
          }
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
        >
          <Plus className="h-4 w-4" />
          Add Portfolio
        </button>
      </div>

      {error && !isModalOpen && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Portfolio"
          value={String(
            portfolio.length,
          )}
          theme={theme}
        />

        <StatCard
          label="Published"
          value={String(
            publishedCount,
          )}
          theme={theme}
        />

        <StatCard
          label="Draft"
          value={String(
            draftCount,
          )}
          theme={theme}
        />
      </div>

      <div className="flex flex-col gap-3 md:flex-row">
        <div
          className={`relative flex-1 rounded-xl`}
        >
          <Search
            className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${c.textMuted}`}
          />

          <input
            value={searchQuery}
            onChange={(e) =>
              setSearchQuery(
                e.target.value,
              )
            }
            placeholder="Search portfolio..."
            className={`w-full rounded-xl border ${c.borderSubtle} ${c.surface} ${c.textPrimary} ${c.placeholder} py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10`}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(
              e.target.value as
              | 'All'
              | 'Published'
              | 'Draft',
            )
          }
          className={`rounded-xl border ${c.borderSubtle} ${c.surface} ${c.textPrimary} px-4 py-2.5 text-sm outline-none focus:border-violet-500`}
        >
          <option>All</option>
          <option>Published</option>
          <option>Draft</option>
        </select>
      </div>

      <div
        className={`overflow-hidden rounded-2xl border ${c.borderSubtle} ${c.surface}`}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left text-sm">
            <thead>
              <tr
                className={`border-b ${c.borderSubtle} ${c.elevated}`}
              >
                <th
                  className={`px-5 py-4 font-semibold ${c.textMuted}`}
                >
                  Portfolio
                </th>

                <th
                  className={`px-5 py-4 font-semibold ${c.textMuted}`}
                >
                  Category
                </th>

                <th
                  className={`px-5 py-4 font-semibold ${c.textMuted}`}
                >
                  Client
                </th>

                <th
                  className={`px-5 py-4 font-semibold ${c.textMuted}`}
                >
                  Year
                </th>

                <th
                  className={`px-5 py-4 font-semibold ${c.textMuted}`}
                >
                  Status
                </th>

                <th
                  className={`px-5 py-4 text-right font-semibold ${c.textMuted}`}
                >
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className={`px-5 py-12 text-center ${c.textMuted}`}
                  >
                    Loading portfolio...
                  </td>
                </tr>
              ) : filteredPortfolio.length ===
                0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center"
                  >
                    <FolderOpen
                      className={`mx-auto h-10 w-10 ${c.textMuted}`}
                    />

                    <p
                      className={`mt-3 text-sm font-medium ${c.textPrimary}`}
                    >
                      No portfolio found
                    </p>

                    <p
                      className={`mt-1 text-xs ${c.textMuted}`}
                    >
                      Try changing your
                      search or status
                      filter.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredPortfolio.map(
                  (item) => (
                    <tr
                      key={item.id}
                      className={`border-b ${c.borderSubtle} last:border-0 ${c.hover} transition-colors`}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-14 w-20 shrink-0 overflow-hidden rounded-lg border ${c.borderSubtle} ${c.input}`}
                          >
                            {item.image_url ? (
                              <img
                                src={
                                  item.image_url
                                }
                                alt={
                                  item.title
                                }
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <ImagePlus
                                  className={`h-5 w-5 ${c.textMuted}`}
                                />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <p
                              className={`truncate font-medium ${c.textPrimary}`}
                            >
                              {item.title}
                            </p>

                            <p
                              className={`mt-1 line-clamp-1 text-xs ${c.textMuted}`}
                            >
                              {
                                item.description
                              }
                            </p>
                          </div>
                        </div>
                      </td>

                      <td
                        className={`px-5 py-4 ${c.textSecondary}`}
                      >
                        {item.category}
                      </td>

                      <td
                        className={`px-5 py-4 ${c.textSecondary}`}
                      >
                        {item.client}
                      </td>

                      <td
                        className={`px-5 py-4 ${c.textSecondary}`}
                      >
                        {item.year}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${item.status ===
                              'Published'
                              ? theme ===
                                'light'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-emerald-500/10 text-emerald-400'
                              : theme ===
                                'light'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-amber-500/10 text-amber-400'
                            }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() =>
                              openEditModal(
                                item,
                              )
                            }
                            className={`rounded-lg border ${c.borderSubtle} p-2 ${c.textMuted} ${c.hover} transition hover:text-violet-500`}
                            title="Edit portfolio"
                          >
                            <Edit className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(
                                item.id,
                              )
                            }
                            className="rounded-lg border border-red-500/20 p-2 text-red-500 transition hover:bg-red-500/10"
                            title="Delete portfolio"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ),
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div
            className={`max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border ${c.borderSubtle} ${c.surface} shadow-2xl`}
          >
            <div
              className={`flex items-center justify-between border-b ${c.borderSubtle} px-6 py-5`}
            >
              <div>
                <h2
                  className={`text-lg font-semibold ${c.textPrimary}`}
                >
                  {editingPortfolio
                    ? 'Edit Portfolio'
                    : 'Add Portfolio'}
                </h2>

                <p
                  className={`mt-1 text-xs ${c.textMuted}`}
                >
                  Isi informasi portfolio
                  berikut.
                </p>
              </div>

              <button
                onClick={closeModal}
                disabled={saving}
                className={`rounded-lg p-2 ${c.textMuted} ${c.hover} transition disabled:opacity-50`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >
              {error && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">
                  {error}
                </div>
              )}

              <Field
                label="Title"
                theme={theme}
              >
                <input
                  value={form.title}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      title:
                        e.target.value,
                    })
                  }
                  placeholder="Portfolio title"
                  disabled={saving}
                  className={getInputClass(
                    theme,
                  )}
                />
              </Field>

              <div className="grid gap-5 md:grid-cols-2">
                <Field
                  label="Category"
                  theme={theme}
                >
                  <select
                    value={
                      form.category
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        category:
                          e.target.value,
                      })
                    }
                    disabled={saving}
                    className={getInputClass(
                      theme,
                    )}
                  >
                    {categories.map(
                      (category) => (
                        <option
                          key={
                            category
                          }
                        >
                          {category}
                        </option>
                      ),
                    )}
                  </select>
                </Field>

                <Field
                  label="Year"
                  theme={theme}
                >
                  <input
                    value={form.year}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        year:
                          e.target.value,
                      })
                    }
                    placeholder="2026"
                    disabled={saving}
                    className={getInputClass(
                      theme,
                    )}
                  />
                </Field>
              </div>

              <Field
                label="Client"
                theme={theme}
              >
                <input
                  value={form.client}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      client:
                        e.target.value,
                    })
                  }
                  placeholder="Client name"
                  disabled={saving}
                  className={getInputClass(
                    theme,
                  )}
                />
              </Field>

              <div>
                <label
                  className={`mb-2 block text-sm font-medium ${c.textPrimary}`}
                >
                  Portfolio Image
                </label>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div
                    className={`h-28 w-44 shrink-0 overflow-hidden rounded-xl border ${c.borderSubtle} ${c.input}`}
                  >
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div
                        className={`flex h-full flex-col items-center justify-center ${c.textMuted}`}
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
                      className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border ${c.border} px-4 py-2.5 text-sm font-medium ${c.textPrimary} ${c.hover}`}
                    >
                      <ImagePlus className="h-4 w-4" />

                      Choose Image

                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={
                          handleImageChange
                        }
                        disabled={saving}
                        className="sr-only"
                      />
                    </label>

                    <p
                      className={`mt-2 text-xs leading-5 ${c.textMuted}`}
                    >
                      JPG, PNG, WEBP, GIF.
                      Max 5 MB; stored
                      image is compressed to
                      150 KB.
                    </p>

                    {imageFile && (
                      <p
                        className={`mt-1 max-w-xs truncate text-xs ${c.textSecondary}`}
                      >
                        {imageFile.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <Field
                label="Description"
                theme={theme}
              >
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description:
                        e.target.value,
                    })
                  }
                  placeholder="Describe this project..."
                  rows={5}
                  disabled={saving}
                  className={`${getInputClass(
                    theme,
                  )} resize-none`}
                />
              </Field>

              <Field
                label="Status"
                theme={theme}
              >
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status:
                        e.target
                          .value as
                        | 'Published'
                        | 'Draft',
                    })
                  }
                  disabled={saving}
                  className={getInputClass(
                    theme,
                  )}
                >
                  <option>
                    Published
                  </option>

                  <option>
                    Draft
                  </option>
                </select>
              </Field>

              <div
                className={`flex justify-end gap-3 border-t ${c.borderSubtle} pt-5`}
              >
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className={`rounded-xl border ${c.borderSubtle} px-4 py-2.5 text-sm ${c.textSecondary} ${c.hover} transition disabled:opacity-50`}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-50"
                >
                  {saving
                    ? 'Saving...'
                    : editingPortfolio
                      ? 'Update Portfolio'
                      : 'Create Portfolio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function getInputClass(
  theme: AdminTheme,
) {
  const c = getThemeTokens(theme)

  return `w-full rounded-xl border ${c.borderSubtle} ${c.input} ${c.textPrimary} ${c.placeholder} px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 disabled:opacity-50`
}

function Field({
  label,
  children,
  theme,
}: {
  label: string
  children: React.ReactNode
  theme: AdminTheme
}) {
  const c = getThemeTokens(theme)

  return (
    <div className="space-y-2">
      <label
        className={`text-sm font-medium ${c.textPrimary}`}
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
  const c = getThemeTokens(theme)

  return (
    <div
      className={`rounded-2xl border ${c.borderSubtle} ${c.surface} p-5 transition hover:-translate-y-0.5`}
    >
      <p
        className={`text-sm ${c.textMuted}`}
      >
        {label}
      </p>

      <p
        className={`mt-2 text-2xl font-bold ${c.textPrimary}`}
      >
        {value}
      </p>
    </div>
  )
}