import {
  Edit,
  FolderOpen,
  ImagePlus,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from 'react'

const API_BASE_URL =
  'https://39production-api.39production.workers.dev'

const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const MAX_STORED_IMAGE_SIZE = 150 * 1024
const MAX_PORTFOLIO_IMAGES = 8

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
  image_urls?: string[] | null
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

interface ImageItem {
  id: string
  url: string
  file: File | null
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

  const [theme, setTheme] =
    useState<AdminTheme>(readTheme)

  useEffect(() => {
    const syncTheme = () => {
      setTheme(readTheme())
    }

    syncTheme()

    const observer = new MutationObserver(
      syncTheme,
    )

    observer.observe(
      document.documentElement,
      {
        attributes: true,
        attributeFilter: [
          'data-admin-theme',
        ],
      },
    )

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
      placeholder:
        'placeholder:text-neutral-400',
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
    placeholder:
      'placeholder:text-white/25',
  }
}

function extractToken(
  value: unknown,
): string | null {
  if (typeof value === 'string') {
    const token = value.trim()

    if (!token) return null

    try {
      return extractToken(
        JSON.parse(token),
      )
    } catch {
      return token
    }
  }

  if (
    value &&
    typeof value === 'object'
  ) {
    const record =
      value as Record<
        string,
        unknown
      >

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
        typeof candidate ===
        'string' &&
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
      const candidate =
        extractToken(record[key])

      if (candidate) {
        return candidate
      }
    }
  }

  return null
}

function getStoredAuthTokens() {
  const tokens: string[] = []
  const seen = new Set<string>()

  const add = (value: unknown) => {
    const token =
      extractToken(value)

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
        // Ignore storage errors.
      }
    }

    try {
      for (
        let i = 0;
        i < storage.length;
        i += 1
      ) {
        const key =
          storage.key(i)

        if (
          key &&
          !keys.includes(key)
        ) {
          add(
            storage.getItem(key),
          )
        }
      }
    } catch {
      // Ignore storage errors.
    }
  }

  return tokens
}

async function getAdminToken(): Promise<
  string | null
> {
  for (const token of getStoredAuthTokens()) {
    try {
      const response =
        await fetch(
          `${API_BASE_URL}/api/auth/me`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
            cache: 'no-store',
          },
        )

      if (response.ok) {
        return token
      }
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
  const token =
    await getAdminToken()

  if (!token) {
    throw new Error(
      'Admin session not found or expired. Please login again.',
    )
  }

  const headers =
    new Headers(init.headers)

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
  if (
    file.type === 'image/gif'
  ) {
    if (
      file.size >
      MAX_STORED_IMAGE_SIZE
    ) {
      throw new Error(
        `"${file.name}" is a GIF larger than 150 KB. Please use a smaller GIF or JPG/PNG/WEBP.`,
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

      const width =
        Math.max(
          1,
          Math.round(
            bitmap.width * scale,
          ),
        )

      const height =
        Math.max(
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

      ctx.imageSmoothingEnabled =
        true

      ctx.imageSmoothingQuality =
        'high'

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
            (resolve) => {
              canvas.toBlob(
                resolve,
                'image/webp',
                quality,
              )
            },
          )

        if (
          blob &&
          blob.size <=
          MAX_STORED_IMAGE_SIZE
        ) {
          return new File(
            [blob],
            `${file.name.replace(
              /\.[^.]+$/,
              '',
            )}.webp`,
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
    `"${file.name}" could not be compressed below 150 KB.`,
  )
}

function createImageItem(
  file: File,
): ImageItem {
  return {
    id: `${file.name}-${file.lastModified}-${Math.random()
      .toString(36)
      .slice(2)}`,
    url: URL.createObjectURL(
      file,
    ),
    file,
  }
}

function getPortfolioImages(
  item: Portfolio,
): string[] {
  if (
    Array.isArray(
      item.image_urls,
    ) &&
    item.image_urls.length
  ) {
    return item.image_urls.filter(
      Boolean,
    )
  }

  if (item.image_url) {
    return [item.image_url]
  }

  return []
}

export function AdminPortfolioPage() {
  const theme =
    useAdminTheme()

  const c =
    getThemeTokens(theme)

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
  ] = useState<Portfolio | null>(
    null,
  )

  const [form, setForm] =
    useState<PortfolioForm>({
      ...emptyForm,
    })

  const [
    imageItems,
    setImageItems,
  ] = useState<ImageItem[]>([])

  const [error, setError] =
    useState('')

  /*
  |--------------------------------------------------------------------------
  | Fetch
  |--------------------------------------------------------------------------
  */

  async function fetchPortfolio() {
    try {
      setLoading(true)
      setError('')

      const response =
        await fetch(
          `${API_BASE_URL}/api/portfolio`,
          {
            cache: 'no-store',
          },
        )

      const result:
        ApiResponse<Portfolio[]> =
        await response.json()

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
          'Failed to fetch portfolio.',
        )
      }

      setPortfolio(
        result.data || [],
      )
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

  /*
  |--------------------------------------------------------------------------
  | Cleanup image object URLs
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    return () => {
      imageItems.forEach(
        (item) => {
          if (item.file) {
            URL.revokeObjectURL(
              item.url,
            )
          }
        },
      )
    }
  }, [imageItems])

  /*
  |--------------------------------------------------------------------------
  | Filtering
  |--------------------------------------------------------------------------
  */

  const filteredPortfolio =
    useMemo(
      () => {
        const q =
          searchQuery
            .trim()
            .toLowerCase()

        return portfolio.filter(
          (item) => {
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
              (statusFilter ===
                'All' ||
                item.status ===
                statusFilter)
            )
          },
        )
      },
      [
        portfolio,
        searchQuery,
        statusFilter,
      ],
    )

  const publishedCount =
    portfolio.filter(
      (item) =>
        item.status ===
        'Published',
    ).length

  const draftCount =
    portfolio.filter(
      (item) =>
        item.status ===
        'Draft',
    ).length

  /*
  |--------------------------------------------------------------------------
  | Image state
  |--------------------------------------------------------------------------
  */

  const clearImageItems =
    () => {
      imageItems.forEach(
        (item) => {
          if (item.file) {
            URL.revokeObjectURL(
              item.url,
            )
          }
        },
      )

      setImageItems([])
    }

  const removeImage = (
    id: string,
  ) => {
    setImageItems(
      (current) => {
        const target =
          current.find(
            (item) =>
              item.id === id,
          )

        if (
          target?.file
        ) {
          URL.revokeObjectURL(
            target.url,
          )
        }

        return current.filter(
          (item) =>
            item.id !== id,
        )
      },
    )
  }

  /*
  |--------------------------------------------------------------------------
  | Create / Edit
  |--------------------------------------------------------------------------
  */

  const openCreateModal =
    () => {
      clearImageItems()

      setEditingPortfolio(
        null,
      )

      setForm({
        ...emptyForm,
      })

      setError('')
      setIsModalOpen(true)
    }

  const openEditModal = (
    item: Portfolio,
  ) => {
    clearImageItems()

    const urls =
      getPortfolioImages(item)

    setEditingPortfolio(
      item,
    )

    setForm({
      title: item.title,
      category: item.category,
      client: item.client,
      description:
        item.description,
      year: item.year,
      status: item.status,
    })

    setImageItems(
      urls
        .slice(
          0,
          MAX_PORTFOLIO_IMAGES,
        )
        .map(
          (
            url,
            index,
          ) => ({
            id: `existing-${item.id}-${index}`,
            url,
            file: null,
          }),
        ),
    )

    setError('')
    setIsModalOpen(true)
  }

  const closeModal = () => {
    if (saving) return

    setIsModalOpen(false)
    setEditingPortfolio(
      null,
    )

    setForm({
      ...emptyForm,
    })

    clearImageItems()
    setError('')
  }

  /*
  |--------------------------------------------------------------------------
  | Multiple image upload
  |--------------------------------------------------------------------------
  */

  function handleImageChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const files =
      Array.from(
        event.target.files ||
        [],
      )

    event.target.value = ''

    if (!files.length) {
      return
    }

    setError('')

    const remainingSlots =
      MAX_PORTFOLIO_IMAGES -
      imageItems.length

    if (
      remainingSlots <= 0
    ) {
      setError(
        `Maximum ${MAX_PORTFOLIO_IMAGES} images per portfolio.`,
      )
      return
    }

    const selectedFiles =
      files.slice(
        0,
        remainingSlots,
      )

    const invalidType =
      selectedFiles.find(
        (file) =>
          !ALLOWED_IMAGE_TYPES.includes(
            file.type,
          ),
      )

    if (invalidType) {
      setError(
        `"${invalidType.name}" is not a supported image. Use JPG, PNG, WEBP, or GIF.`,
      )
      return
    }

    const oversized =
      selectedFiles.find(
        (file) =>
          file.size >
          MAX_IMAGE_SIZE,
      )

    if (oversized) {
      setError(
        `"${oversized.name}" exceeds the 5 MB upload limit.`,
      )
      return
    }

    const newItems =
      selectedFiles.map(
        createImageItem,
      )

    setImageItems(
      (current) => [
        ...current,
        ...newItems,
      ],
    )

    if (
      files.length >
      remainingSlots
    ) {
      setError(
        `Only ${remainingSlots} image slot${remainingSlots > 1
          ? 's'
          : ''
        } remaining. Extra files were skipped.`,
      )
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Submit
  |--------------------------------------------------------------------------
  */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setError('')

    if (!form.title.trim()) {
      setError(
        'Portfolio title is required.',
      )
      return
    }

    if (!form.client.trim()) {
      setError(
        'Client is required.',
      )
      return
    }

    if (
      !form.description.trim()
    ) {
      setError(
        'Description is required.',
      )
      return
    }

    if (!form.year.trim()) {
      setError(
        'Year is required.',
      )
      return
    }

    if (
      imageItems.length >
      MAX_PORTFOLIO_IMAGES
    ) {
      setError(
        `Maximum ${MAX_PORTFOLIO_IMAGES} images per portfolio.`,
      )
      return
    }

    try {
      setSaving(true)

      const formData =
        new FormData()

      formData.append(
        'title',
        form.title.trim(),
      )

      formData.append(
        'category',
        form.category,
      )

      formData.append(
        'client',
        form.client.trim(),
      )

      formData.append(
        'description',
        form.description.trim(),
      )

      formData.append(
        'year',
        form.year.trim(),
      )

      formData.append(
        'status',
        form.status,
      )

      /*
      |--------------------------------------------------------------------------
      | Existing images
      |--------------------------------------------------------------------------
      */

      const existingImages =
        imageItems
          .filter(
            (item) =>
              !item.file,
          )
          .map(
            (item) =>
              item.url,
          )

      formData.append(
        'existing_images',
        JSON.stringify(
          existingImages,
        ),
      )

      /*
      |--------------------------------------------------------------------------
      | Tell backend to use exactly
      | the images currently displayed.
      |--------------------------------------------------------------------------
      */

      formData.append(
        'replace_images',
        'true',
      )

      /*
      |--------------------------------------------------------------------------
      | New images
      |--------------------------------------------------------------------------
      */

      const newImages =
        imageItems.filter(
          (item) =>
            item.file,
        )

      for (
        const item of newImages
      ) {
        if (!item.file) {
          continue
        }

        const compressed =
          await compressImage(
            item.file,
          )

        formData.append(
          'images',
          compressed,
        )
      }

      const editing =
        Boolean(
          editingPortfolio,
        )

      const url = editing
        ? `${API_BASE_URL}/api/portfolio/${editingPortfolio!.id}`
        : `${API_BASE_URL}/api/portfolio`

      const response =
        await adminFetch(
          url,
          {
            method: editing
              ? 'PUT'
              : 'POST',
            body: formData,
          },
        )

      const result:
        ApiResponse<Portfolio> =
        await response.json()

      if (
        !response.ok ||
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

  /*
  |--------------------------------------------------------------------------
  | Delete
  |--------------------------------------------------------------------------
  */

  async function handleDelete(
    id: number,
  ) {
    const item =
      portfolio.find(
        (entry) =>
          entry.id === id,
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

      const response =
        await adminFetch(
          `${API_BASE_URL}/api/portfolio/${id}`,
          {
            method: 'DELETE',
          },
        )

      const result:
        ApiResponse<unknown> =
        await response.json()

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
          'Failed to delete portfolio.',
        )
      }

      setPortfolio(
        (current) =>
          current.filter(
            (entry) =>
              entry.id !== id,
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
      {/* =========================================================
          HEADER
      ========================================================= */}

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
          type="button"
          onClick={
            openCreateModal
          }
          className="
            inline-flex
            items-center
            justify-center
            gap-2
            rounded-lg
            bg-violet-600
            px-4
            py-2.5
            text-sm
            font-semibold
            text-white
            transition
            hover:bg-violet-700
          "
        >
          <Plus className="h-4 w-4" />
          Add Portfolio
        </button>
      </div>

      {error &&
        !isModalOpen && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">
            {error}
          </div>
        )}

      {/* =========================================================
          STATS
      ========================================================= */}

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

      {/* =========================================================
          FILTER
      ========================================================= */}

      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search
            className={`
              absolute
              left-3
              top-1/2
              h-4
              w-4
              -translate-y-1/2
              ${c.textMuted}
            `}
          />

          <input
            value={searchQuery}
            onChange={(event) =>
              setSearchQuery(
                event.target.value,
              )
            }
            placeholder="Search portfolio..."
            className={`
              w-full
              rounded-xl
              border
              ${c.borderSubtle}
              ${c.surface}
              ${c.textPrimary}
              ${c.placeholder}
              py-2.5
              pl-10
              pr-4
              text-sm
              outline-none
              transition
              focus:border-violet-500
              focus:ring-2
              focus:ring-violet-500/10
            `}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(
              event.target.value as
              | 'All'
              | 'Published'
              | 'Draft',
            )
          }
          className={`
            rounded-xl
            border
            ${c.borderSubtle}
            ${c.surface}
            ${c.textPrimary}
            px-4
            py-2.5
            text-sm
            outline-none
            focus:border-violet-500
          `}
        >
          <option>All</option>
          <option>
            Published
          </option>
          <option>Draft</option>
        </select>
      </div>

      {/* =========================================================
          TABLE
      ========================================================= */}

      <div
        className={`
          overflow-hidden
          rounded-2xl
          border
          ${c.borderSubtle}
          ${c.surface}
        `}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left text-sm">
            <thead>
              <tr
                className={`
                  border-b
                  ${c.borderSubtle}
                  ${c.elevated}
                `}
              >
                <th
                  className={`
                    px-5
                    py-4
                    font-semibold
                    ${c.textMuted}
                  `}
                >
                  Portfolio
                </th>

                <th
                  className={`
                    px-5
                    py-4
                    font-semibold
                    ${c.textMuted}
                  `}
                >
                  Category
                </th>

                <th
                  className={`
                    px-5
                    py-4
                    font-semibold
                    ${c.textMuted}
                  `}
                >
                  Client
                </th>

                <th
                  className={`
                    px-5
                    py-4
                    font-semibold
                    ${c.textMuted}
                  `}
                >
                  Year
                </th>

                <th
                  className={`
                    px-5
                    py-4
                    font-semibold
                    ${c.textMuted}
                  `}
                >
                  Status
                </th>

                <th
                  className={`
                    px-5
                    py-4
                    text-right
                    font-semibold
                    ${c.textMuted}
                  `}
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
                    className={`
                      px-5
                      py-12
                      text-center
                      ${c.textMuted}
                    `}
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
                      className={`
                        mx-auto
                        h-10
                        w-10
                        ${c.textMuted}
                      `}
                    />

                    <p
                      className={`
                        mt-3
                        text-sm
                        font-medium
                        ${c.textPrimary}
                      `}
                    >
                      No portfolio found
                    </p>

                    <p
                      className={`
                        mt-1
                        text-xs
                        ${c.textMuted}
                      `}
                    >
                      Try changing your
                      search or status
                      filter.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredPortfolio.map(
                  (item) => {
                    const imageCount =
                      getPortfolioImages(
                        item,
                      ).length

                    return (
                      <tr
                        key={item.id}
                        className={`
                          border-b
                          ${c.borderSubtle}
                          last:border-0
                          ${c.hover}
                          transition-colors
                        `}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`
                                relative
                                h-14
                                w-20
                                shrink-0
                                overflow-hidden
                                rounded-lg
                                border
                                ${c.borderSubtle}
                                ${c.input}
                              `}
                            >
                              {item.image_url ? (
                                <>
                                  <img
                                    src={
                                      item.image_url
                                    }
                                    alt={
                                      item.title
                                    }
                                    className="h-full w-full object-cover"
                                  />

                                  {imageCount >
                                    1 && (
                                      <span
                                        className="
                                        absolute
                                        bottom-1
                                        right-1
                                        rounded
                                        bg-black/75
                                        px-1.5
                                        py-0.5
                                        text-[10px]
                                        font-semibold
                                        text-white
                                      "
                                      >
                                        +
                                        {imageCount -
                                          1}
                                      </span>
                                    )}
                                </>
                              ) : (
                                <div className="flex h-full items-center justify-center">
                                  <ImagePlus
                                    className={`
                                      h-5
                                      w-5
                                      ${c.textMuted}
                                    `}
                                  />
                                </div>
                              )}
                            </div>

                            <div className="min-w-0">
                              <p
                                className={`
                                  truncate
                                  font-medium
                                  ${c.textPrimary}
                                `}
                              >
                                {item.title}
                              </p>

                              <p
                                className={`
                                  mt-1
                                  line-clamp-1
                                  text-xs
                                  ${c.textMuted}
                                `}
                              >
                                {
                                  item.description
                                }
                              </p>
                            </div>
                          </div>
                        </td>

                        <td
                          className={`
                            px-5
                            py-4
                            ${c.textSecondary}
                          `}
                        >
                          {item.category}
                        </td>

                        <td
                          className={`
                            px-5
                            py-4
                            ${c.textSecondary}
                          `}
                        >
                          {item.client}
                        </td>

                        <td
                          className={`
                            px-5
                            py-4
                            ${c.textSecondary}
                          `}
                        >
                          {item.year}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`
                              inline-flex
                              rounded-full
                              px-3
                              py-1
                              text-xs
                              font-medium
                              ${item.status ===
                                'Published'
                                ? theme ===
                                  'light'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-emerald-500/10 text-emerald-400'
                                : theme ===
                                  'light'
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-amber-500/10 text-amber-400'
                              }
                            `}
                          >
                            {item.status}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                openEditModal(
                                  item,
                                )
                              }
                              className={`
                                rounded-lg
                                border
                                ${c.borderSubtle}
                                p-2
                                ${c.textMuted}
                                ${c.hover}
                                transition
                                hover:text-violet-500
                              `}
                              title="Edit portfolio"
                            >
                              <Edit className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  item.id,
                                )
                              }
                              className="
                                rounded-lg
                                border
                                border-red-500/20
                                p-2
                                text-red-500
                                transition
                                hover:bg-red-500/10
                              "
                              title="Delete portfolio"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  },
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================
          MODAL
      ========================================================= */}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div
            className={`
              max-h-[92vh]
              w-full
              max-w-3xl
              overflow-y-auto
              rounded-2xl
              border
              ${c.borderSubtle}
              ${c.surface}
              shadow-2xl
            `}
          >
            {/* =====================================================
                MODAL HEADER
            ===================================================== */}

            <div
              className={`
                flex
                items-center
                justify-between
                border-b
                ${c.borderSubtle}
                px-6
                py-5
              `}
            >
              <div>
                <h2
                  className={`
                    text-lg
                    font-semibold
                    ${c.textPrimary}
                  `}
                >
                  {editingPortfolio
                    ? 'Edit Portfolio'
                    : 'Add Portfolio'}
                </h2>

                <p
                  className={`
                    mt-1
                    text-xs
                    ${c.textMuted}
                  `}
                >
                  Kelola informasi dan
                  gallery portfolio.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className={`
                  rounded-lg
                  p-2
                  ${c.textMuted}
                  ${c.hover}
                  transition
                  disabled:opacity-50
                `}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >
              {error && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-500">
                  {error}
                </div>
              )}

              {/* ===================================================
                  TITLE
              =================================================== */}

              <Field
                label="Title"
                theme={theme}
              >
                <input
                  value={form.title}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      title:
                        event.target
                          .value,
                    })
                  }
                  placeholder="Portfolio title"
                  disabled={saving}
                  className={getInputClass(
                    theme,
                  )}
                />
              </Field>

              {/* ===================================================
                  CATEGORY + YEAR
              =================================================== */}

              <div className="grid gap-5 md:grid-cols-2">
                <Field
                  label="Category"
                  theme={theme}
                >
                  <select
                    value={
                      form.category
                    }
                    onChange={(event) =>
                      setForm({
                        ...form,
                        category:
                          event.target
                            .value,
                      })
                    }
                    disabled={saving}
                    className={getInputClass(
                      theme,
                    )}
                  >
                    {categories.map(
                      (
                        category,
                      ) => (
                        <option
                          key={
                            category
                          }
                        >
                          {
                            category
                          }
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
                    onChange={(event) =>
                      setForm({
                        ...form,
                        year:
                          event.target
                            .value,
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

              {/* ===================================================
                  CLIENT
              =================================================== */}

              <Field
                label="Client"
                theme={theme}
              >
                <input
                  value={form.client}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      client:
                        event.target
                          .value,
                    })
                  }
                  placeholder="Client name"
                  disabled={saving}
                  className={getInputClass(
                    theme,
                  )}
                />
              </Field>

              {/* ===================================================
                  MULTIPLE IMAGE GALLERY
              =================================================== */}

              <div>
                <div className="mb-3 flex items-end justify-between gap-3">
                  <div>
                    <label
                      className={`
                        block
                        text-sm
                        font-medium
                        ${c.textPrimary}
                      `}
                    >
                      Portfolio Gallery
                    </label>

                    <p
                      className={`
                        mt-1
                        text-xs
                        ${c.textMuted}
                      `}
                    >
                      Upload hingga{' '}
                      {
                        MAX_PORTFOLIO_IMAGES
                      }{' '}
                      gambar.
                    </p>
                  </div>

                  <span
                    className={`
                      shrink-0
                      text-xs
                      font-medium
                      ${c.textSecondary}
                    `}
                  >
                    {
                      imageItems.length
                    }{' '}
                    /{' '}
                    {
                      MAX_PORTFOLIO_IMAGES
                    }
                  </span>
                </div>

                {/* =================================================
                    IMAGE GRID
                ================================================= */}

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {imageItems.map(
                    (
                      item,
                      index,
                    ) => (
                      <div
                        key={
                          item.id
                        }
                        className={`
                          group
                          relative
                          aspect-square
                          overflow-hidden
                          rounded-xl
                          border
                          ${c.borderSubtle}
                          ${c.input}
                        `}
                      >
                        <img
                          src={
                            item.url
                          }
                          alt={`Portfolio image ${index + 1}`}
                          className="
                            h-full
                            w-full
                            object-cover
                            transition
                            duration-300
                            group-hover:scale-105
                          "
                        />

                        {/* Main image label */}

                        {index ===
                          0 && (
                            <span
                              className="
                              absolute
                              left-2
                              top-2
                              rounded
                              bg-black/75
                              px-2
                              py-1
                              text-[9px]
                              font-bold
                              uppercase
                              tracking-wider
                              text-white
                            "
                            >
                              Main
                            </span>
                          )}

                        {/* New image label */}

                        {item.file && (
                          <span
                            className="
                              absolute
                              bottom-2
                              left-2
                              rounded
                              bg-violet-600/90
                              px-2
                              py-1
                              text-[9px]
                              font-bold
                              uppercase
                              tracking-wider
                              text-white
                            "
                          >
                            New
                          </span>
                        )}

                        {/* Remove */}

                        <button
                          type="button"
                          onClick={() =>
                            removeImage(
                              item.id,
                            )
                          }
                          disabled={
                            saving
                          }
                          className="
                            absolute
                            right-2
                            top-2
                            flex
                            h-7
                            w-7
                            items-center
                            justify-center
                            rounded-full
                            bg-black/75
                            text-white
                            opacity-0
                            transition
                            group-hover:opacity-100
                            hover:bg-red-500
                            disabled:opacity-50
                          "
                          title="Remove image"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>

                        {/* Number */}

                        <span
                          className="
                            absolute
                            bottom-2
                            right-2
                            rounded
                            bg-black/65
                            px-1.5
                            py-0.5
                            text-[9px]
                            font-semibold
                            text-white
                          "
                        >
                          {index +
                            1}
                        </span>
                      </div>
                    ),
                  )}

                  {/* =================================================
                      ADD IMAGE
                  ================================================= */}

                  {imageItems.length <
                    MAX_PORTFOLIO_IMAGES && (
                      <label
                        className={`
                        group
                        relative
                        flex
                        aspect-square
                        cursor-pointer
                        flex-col
                        items-center
                        justify-center
                        overflow-hidden
                        rounded-xl
                        border
                        border-dashed
                        ${c.border}
                        ${c.input}
                        transition
                        hover:border-violet-500
                        hover:bg-violet-500/[0.04]
                      `}
                      >
                        <div
                          className="
                          flex
                          h-11
                          w-11
                          items-center
                          justify-center
                          rounded-full
                          border
                          border-violet-500/20
                          text-violet-500
                          transition
                          group-hover:scale-110
                          group-hover:border-violet-500/40
                        "
                        >
                          <ImagePlus className="h-5 w-5" />
                        </div>

                        <span
                          className={`
                          mt-3
                          text-xs
                          font-medium
                          ${c.textSecondary}
                        `}
                        >
                          Add Images
                        </span>

                        <span
                          className={`
                          mt-1
                          text-[10px]
                          ${c.textMuted}
                        `}
                        >
                          Multiple files
                        </span>

                        <input
                          type="file"
                          accept="
                          image/jpeg,
                          image/png,
                          image/webp,
                          image/gif
                        "
                          multiple
                          onChange={
                            handleImageChange
                          }
                          disabled={
                            saving
                          }
                          className="sr-only"
                        />
                      </label>
                    )}
                </div>

                {/* =================================================
                    UPLOAD INFORMATION
                ================================================= */}

                <div
                  className={`
                    mt-3
                    rounded-lg
                    border
                    ${c.borderSubtle}
                    ${c.elevated}
                    px-4
                    py-3
                  `}
                >
                  <div className="flex flex-col gap-1.5 text-xs sm:flex-row sm:items-center sm:justify-between">
                    <span
                      className={
                        c.textMuted
                      }
                    >
                      JPG, PNG, WEBP,
                      GIF
                    </span>

                    <span
                      className={
                        c.textMuted
                      }
                    >
                      Max 5 MB / image
                    </span>

                    <span
                      className={
                        c.textMuted
                      }
                    >
                      Auto-compressed
                      to ≤150 KB
                    </span>
                  </div>
                </div>
              </div>

              {/* ===================================================
                  DESCRIPTION
              =================================================== */}

              <Field
                label="Description"
                theme={theme}
              >
                <textarea
                  value={
                    form.description
                  }
                  onChange={(event) =>
                    setForm({
                      ...form,
                      description:
                        event.target
                          .value,
                    })
                  }
                  placeholder="Describe this project..."
                  rows={5}
                  disabled={saving}
                  className={`
                    ${getInputClass(
                    theme,
                  )}
                    resize-none
                  `}
                />
              </Field>

              {/* ===================================================
                  STATUS
              =================================================== */}

              <Field
                label="Status"
                theme={theme}
              >
                <select
                  value={
                    form.status
                  }
                  onChange={(event) =>
                    setForm({
                      ...form,
                      status:
                        event.target
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

              {/* ===================================================
                  FOOTER
              =================================================== */}

              <div
                className={`
                  flex
                  justify-end
                  gap-3
                  border-t
                  ${c.borderSubtle}
                  pt-5
                `}
              >
                <button
                  type="button"
                  onClick={
                    closeModal
                  }
                  disabled={
                    saving
                  }
                  className={`
                    rounded-xl
                    border
                    ${c.borderSubtle}
                    px-4
                    py-2.5
                    text-sm
                    ${c.textSecondary}
                    ${c.hover}
                    transition
                    disabled:opacity-50
                  `}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    saving
                  }
                  className="
                    rounded-xl
                    bg-violet-600
                    px-5
                    py-2.5
                    text-sm
                    font-semibold
                    text-white
                    transition
                    hover:bg-violet-700
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {saving
                    ? 'Uploading...'
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

/*
|--------------------------------------------------------------------------
| Input
|--------------------------------------------------------------------------
*/

function getInputClass(
  theme: AdminTheme,
) {
  const c =
    getThemeTokens(theme)

  return `
    w-full
    rounded-xl
    border
    ${c.borderSubtle}
    ${c.input}
    ${c.textPrimary}
    ${c.placeholder}
    px-4
    py-3
    text-sm
    outline-none
    transition
    focus:border-violet-500
    focus:ring-2
    focus:ring-violet-500/10
    disabled:opacity-50
  `
}

/*
|--------------------------------------------------------------------------
| Field
|--------------------------------------------------------------------------
*/

function Field({
  label,
  children,
  theme,
}: {
  label: string
  children: ReactNode
  theme: AdminTheme
}) {
  const c =
    getThemeTokens(theme)

  return (
    <div className="space-y-2">
      <label
        className={`
          text-sm
          font-medium
          ${c.textPrimary}
        `}
      >
        {label}
      </label>

      {children}
    </div>
  )
}

/*
|--------------------------------------------------------------------------
| Stat Card
|--------------------------------------------------------------------------
*/

function StatCard({
  label,
  value,
  theme,
}: {
  label: string
  value: string
  theme: AdminTheme
}) {
  const c =
    getThemeTokens(theme)

  return (
    <div
      className={`
        rounded-2xl
        border
        ${c.borderSubtle}
        ${c.surface}
        p-5
        transition
        hover:-translate-y-0.5
      `}
    >
      <p
        className={`
          text-sm
          ${c.textMuted}
        `}
      >
        {label}
      </p>

      <p
        className={`
          mt-2
          text-2xl
          font-bold
          ${c.textPrimary}
        `}
      >
        {value}
      </p>
    </div>
  )
}