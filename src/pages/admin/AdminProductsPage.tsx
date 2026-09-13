import {
  Edit,
  ImagePlus,
  Package,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import { FormEvent, useEffect, useMemo, useState } from 'react'

const API_BASE_URL = 'https://39production-api.39production.workers.dev'

type AdminTheme = 'dark' | 'light'

interface Product {
  id: number
  name: string
  category: string
  description: string
  price: number
  stock: number
  status: 'Published' | 'Draft'
  image_url?: string | null
}

interface ProductForm {
  name: string
  category: string
  description: string
  price: string
  stock: string
  status: 'Published' | 'Draft'
}

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

const emptyForm: ProductForm = {
  name: '',
  category: 'Template',
  description: '',
  price: '',
  stock: '',
  status: 'Published',
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const MAX_STORED_IMAGE_SIZE = 150 * 1024

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]

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
    placeholder: 'placeholder:text-white/25',
  }
}

function extractToken(value: unknown): string | null {
  if (typeof value === 'string') {
    const trimmed = value.trim()

    if (!trimmed) return null

    try {
      const parsed = JSON.parse(trimmed)
      return extractToken(parsed)
    } catch {
      return trimmed
    }
  }

  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>

    const tokenKeys = [
      'token',
      'access_token',
      'accessToken',
      'admin_token',
      'adminToken',
      'session_token',
      'sessionToken',
    ]

    for (const key of tokenKeys) {
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
      const candidate = extractToken(record[key])

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

    if (token && !seen.has(token)) {
      seen.add(token)
      tokens.push(token)
    }
  }

  const preferredKeys = [
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
    for (const key of preferredKeys) {
      try {
        add(storage.getItem(key))
      } catch {
        // Ignore unavailable storage entries.
      }
    }

    try {
      for (
        let index = 0;
        index < storage.length;
        index += 1
      ) {
        const key = storage.key(index)

        if (
          !key ||
          preferredKeys.includes(key)
        ) {
          continue
        }

        add(storage.getItem(key))
      }
    } catch {
      // Ignore unavailable storage entries.
    }
  }

  return tokens
}

async function getAdminToken(): Promise<string | null> {
  const candidates = getStoredAuthTokens()

  for (const token of candidates) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        },
      )

      if (response.ok) {
        return token
      }
    } catch {
      // Try the next stored token.
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

  headers.set(
    'Authorization',
    `Bearer ${token}`,
  )

  return fetch(url, {
    ...init,
    headers,
  })
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

async function compressProductImage(
  file: File,
): Promise<File> {
  if (file.type === 'image/gif') {
    if (
      file.size > MAX_STORED_IMAGE_SIZE
    ) {
      throw new Error(
        'GIF image must not exceed 150 KB. Please use JPG, PNG, or WEBP for larger images.',
      )
    }

    return file
  }

  if (
    file.size <= MAX_STORED_IMAGE_SIZE
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
        maxDimension /
        Math.max(
          bitmap.width,
          bitmap.height,
        ),
      )

      const width = Math.max(
        1,
        Math.round(bitmap.width * scale),
      )

      const height = Math.max(
        1,
        Math.round(bitmap.height * scale),
      )

      const canvas =
        document.createElement('canvas')

      canvas.width = width
      canvas.height = height

      const context =
        canvas.getContext('2d')

      if (!context) {
        throw new Error(
          'Your browser cannot process the product image.',
        )
      }

      context.imageSmoothingEnabled = true
      context.imageSmoothingQuality = 'high'

      context.drawImage(
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

export function AdminProductsPage() {
  const theme = useAdminTheme()
  const c = getThemeTokens(theme)

  const [products, setProducts] =
    useState<Product[]>([])

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] =
    useState('All')

  const [isModalOpen, setIsModalOpen] =
    useState(false)

  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null)

  const [form, setForm] =
    useState<ProductForm>(emptyForm)

  const [imageFile, setImageFile] =
    useState<File | null>(null)

  const [imagePreview, setImagePreview] =
    useState('')

  const [error, setError] = useState('')
  const [success, setSuccess] =
    useState('')

  const [isLoading, setIsLoading] =
    useState(true)

  const [isSubmitting, setIsSubmitting] =
    useState(false)

  const [deletingId, setDeletingId] =
    useState<number | null>(null)

  async function fetchProducts() {
    try {
      setIsLoading(true)
      setError('')

      const response = await adminFetch(
        `${API_BASE_URL}/api/products`,
        {
          method: 'GET',
          cache: 'no-store',
        },
      )

      if (!response.ok) {
        throw new Error(
          `Failed to load products (${response.status})`,
        )
      }

      const result =
        await response.json()

      const data = Array.isArray(result)
        ? result
        : result?.data ??
        result?.products

      if (!Array.isArray(data)) {
        throw new Error(
          'Invalid products response from API.',
        )
      }

      setProducts(
        data as Product[],
      )
    } catch (err) {
      console.error(
        'Fetch products error:',
        err,
      )

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load products.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    return () => {
      if (
        imagePreview.startsWith('blob:')
      ) {
        URL.revokeObjectURL(
          imagePreview,
        )
      }
    }
  }, [imagePreview])

  const filteredProducts = useMemo(() => {
    const keyword = search
      .toLowerCase()
      .trim()

    return products.filter(
      (product) => {
        const matchesSearch =
          product.name
            .toLowerCase()
            .includes(keyword) ||
          product.category
            .toLowerCase()
            .includes(keyword) ||
          product.description
            .toLowerCase()
            .includes(keyword)

        const matchesStatus =
          statusFilter === 'All' ||
          product.status === statusFilter

        return (
          matchesSearch &&
          matchesStatus
        )
      },
    )
  }, [
    products,
    search,
    statusFilter,
  ])

  const publishedCount =
    products.filter(
      (product) =>
        product.status === 'Published',
    ).length

  const draftCount =
    products.filter(
      (product) =>
        product.status === 'Draft',
    ).length

  const totalStock =
    products.reduce(
      (total, product) =>
        total +
        Number(product.stock || 0),
      0,
    )

  function resetImageState() {
    if (
      imagePreview.startsWith('blob:')
    ) {
      URL.revokeObjectURL(
        imagePreview,
      )
    }

    setImageFile(null)
    setImagePreview('')
  }

  function openAddModal() {
    setEditingProduct(null)
    setForm({
      ...emptyForm,
    })
    resetImageState()
    setError('')
    setSuccess('')
    setIsModalOpen(true)
  }

  function openEditModal(
    product: Product,
  ) {
    setEditingProduct(product)

    setForm({
      name: product.name,
      category: product.category,
      description:
        product.description,
      price: String(product.price),
      stock: String(product.stock),
      status: product.status,
    })

    setImageFile(null)
    setImagePreview(
      product.image_url || '',
    )
    setError('')
    setSuccess('')
    setIsModalOpen(true)
  }

  function closeModal() {
    if (isSubmitting) return

    setIsModalOpen(false)
    setEditingProduct(null)
    setForm({
      ...emptyForm,
    })
    resetImageState()
    setError('')
  }

  function handleImageChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0]

    event.target.value = ''

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
      imagePreview.startsWith('blob:')
    ) {
      URL.revokeObjectURL(
        imagePreview,
      )
    }

    setImageFile(file)

    setImagePreview(
      URL.createObjectURL(file),
    )

    setError('')
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setError('')
    setSuccess('')
    setIsSubmitting(true)

    try {
      const name = form.name.trim()
      const description =
        form.description.trim()

      const price = Number(
        form.price,
      )

      const stock = Number(
        form.stock,
      )

      if (!name) {
        throw new Error(
          'Product name is required.',
        )
      }

      if (!description) {
        throw new Error(
          'Description is required.',
        )
      }

      if (
        !form.price ||
        Number.isNaN(price) ||
        price <= 0
      ) {
        throw new Error(
          'Please enter a valid price.',
        )
      }

      if (
        form.stock === '' ||
        Number.isNaN(stock) ||
        stock < 0 ||
        !Number.isInteger(stock)
      ) {
        throw new Error(
          'Please enter a valid stock quantity.',
        )
      }

      const formData =
        new FormData()

      formData.append(
        'name',
        name,
      )

      formData.append(
        'category',
        form.category,
      )

      formData.append(
        'description',
        description,
      )

      formData.append(
        'price',
        String(price),
      )

      formData.append(
        'stock',
        String(stock),
      )

      formData.append(
        'status',
        form.status,
      )

      if (imageFile) {
        const compressedImage =
          await compressProductImage(
            imageFile,
          )

        formData.append(
          'image',
          compressedImage,
        )
      }

      const url =
        editingProduct
          ? `${API_BASE_URL}/api/products/${editingProduct.id}`
          : `${API_BASE_URL}/api/products`

      const response =
        await adminFetch(url, {
          method:
            editingProduct
              ? 'PUT'
              : 'POST',
          body: formData,
        })

      if (!response.ok) {
        let message = `Failed to ${editingProduct
            ? 'update'
            : 'create'
          } product (${response.status})`

        try {
          const result =
            await response.json()

          message =
            result?.message ||
            result?.error ||
            message
        } catch {
          // Ignore invalid JSON response.
        }

        throw new Error(message)
      }

      await fetchProducts()

      setSuccess(
        editingProduct
          ? 'Product updated successfully.'
          : 'Product created successfully.',
      )

      closeModal()
    } catch (err) {
      console.error(
        'Save product error:',
        err,
      )

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to save product.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(
    id: number,
  ) {
    const product =
      products.find(
        (item) => item.id === id,
      )

    if (!product) return

    if (
      !window.confirm(
        `Are you sure you want to delete "${product.name}"?`,
      )
    ) {
      return
    }

    try {
      setDeletingId(id)
      setError('')
      setSuccess('')

      const response =
        await adminFetch(
          `${API_BASE_URL}/api/products/${id}`,
          {
            method: 'DELETE',
          },
        )

      if (!response.ok) {
        let message = `Failed to delete product (${response.status})`

        try {
          const result =
            await response.json()

          message =
            result?.message ||
            result?.error ||
            message
        } catch {
          // Ignore invalid JSON response.
        }

        throw new Error(message)
      }

      await fetchProducts()

      setSuccess(
        'Product deleted successfully.',
      )
    } catch (err) {
      console.error(
        'Delete product error:',
        err,
      )

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to delete product.',
      )
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div
      className={`min-h-full space-y-8 ${c.page}`}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p
            className={`text-sm ${c.textMuted}`}
          >
            Admin Panel
          </p>

          <h1
            className={`mt-1 text-3xl font-bold ${c.textPrimary}`}
          >
            Products
          </h1>

          <p
            className={`mt-2 text-sm ${c.textSecondary}`}
          >
            Manage digital products and
            inventory.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-700"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </button>
      </div>

      {error && !isModalOpen && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      )}

      {success && (
        <div
          className={`rounded-lg border border-emerald-500/20 ${theme === 'light'
              ? 'bg-emerald-50'
              : 'bg-emerald-500/[0.06]'
            } px-4 py-3 text-sm ${theme === 'light'
              ? 'text-emerald-700'
              : 'text-emerald-400'
            }`}
        >
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard
          label="Total Products"
          value={String(
            products.length,
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

        <StatCard
          label="Total Stock"
          value={String(
            totalStock,
          )}
          theme={theme}
        />
      </div>

      <div
        className={`rounded-xl border ${c.border} ${c.surface} p-5`}
      >
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search
              className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${c.textMuted}`}
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Search products..."
              className={`w-full rounded-lg border ${c.border} ${c.input} ${c.textPrimary} ${c.placeholder} py-3 pl-10 pr-4 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10`}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value,
              )
            }
            className={`rounded-lg border ${c.border} ${c.input} ${c.textPrimary} px-4 py-3 text-sm outline-none focus:border-violet-500`}
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

      <div
        className={`overflow-hidden rounded-xl border ${c.border} ${c.surface}`}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left text-sm">
            <thead>
              <tr
                className={`border-b ${c.border} ${c.elevated}`}
              >
                <th
                  className={`px-6 py-4 font-semibold ${c.textPrimary}`}
                >
                  Product
                </th>

                <th
                  className={`px-6 py-4 font-semibold ${c.textPrimary}`}
                >
                  Category
                </th>

                <th
                  className={`px-6 py-4 font-semibold ${c.textPrimary}`}
                >
                  Price
                </th>

                <th
                  className={`px-6 py-4 font-semibold ${c.textPrimary}`}
                >
                  Stock
                </th>

                <th
                  className={`px-6 py-4 font-semibold ${c.textPrimary}`}
                >
                  Status
                </th>

                <th
                  className={`px-6 py-4 font-semibold ${c.textPrimary}`}
                >
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className={`px-6 py-16 text-center text-sm ${c.textMuted}`}
                  >
                    Loading products...
                  </td>
                </tr>
              ) : filteredProducts.length ===
                0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className={`px-6 py-16 text-center text-sm ${c.textMuted}`}
                  >
                    No products found.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(
                  (product) => (
                    <tr
                      key={product.id}
                      className={`border-b ${c.border} last:border-0 ${c.hover} transition-colors`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-12 w-12 shrink-0 overflow-hidden rounded-lg border ${c.border} ${product.image_url
                                ? ''
                                : 'bg-violet-500/10'
                              }`}
                          >
                            {product.image_url ? (
                              <img
                                src={
                                  product.image_url
                                }
                                alt={
                                  product.name
                                }
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-violet-500">
                                <Package className="h-5 w-5" />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <p
                              className={`truncate font-medium ${c.textPrimary}`}
                            >
                              {product.name}
                            </p>

                            <p
                              className={`mt-1 text-xs ${c.textMuted}`}
                            >
                              ID #{product.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td
                        className={`px-6 py-4 ${c.textSecondary}`}
                      >
                        {product.category}
                      </td>

                      <td
                        className={`px-6 py-4 font-medium ${c.textPrimary}`}
                      >
                        {formatCurrency(
                          Number(
                            product.price,
                          ),
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={
                            Number(
                              product.stock,
                            ) === 0
                              ? 'text-red-500'
                              : Number(
                                product.stock,
                              ) < 10
                                ? theme ===
                                  'light'
                                  ? 'text-amber-600'
                                  : 'text-amber-400'
                                : c.textSecondary
                          }
                        >
                          {product.stock}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${product.status ===
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
                          {product.status}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              openEditModal(
                                product,
                              )
                            }
                            disabled={
                              deletingId ===
                              product.id
                            }
                            className={`rounded-lg border ${c.border} p-2 ${c.textMuted} transition-colors hover:text-violet-500 disabled:cursor-not-allowed disabled:opacity-50`}
                            title="Edit product"
                          >
                            <Edit className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                product.id,
                              )
                            }
                            disabled={
                              deletingId ===
                              product.id
                            }
                            className="rounded-lg border border-red-500/20 p-2 text-red-500 transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                            title="Delete product"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
          <div
            className={`max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border ${c.border} ${c.surface} shadow-2xl`}
          >
            <div
              className={`flex items-center justify-between border-b ${c.border} px-6 py-5`}
            >
              <div>
                <h2
                  className={`text-xl font-bold ${c.textPrimary}`}
                >
                  {editingProduct
                    ? 'Edit Product'
                    : 'Add Product'}
                </h2>

                <p
                  className={`mt-1 text-sm ${c.textMuted}`}
                >
                  {editingProduct
                    ? 'Update product information.'
                    : 'Create a new digital product.'}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={isSubmitting}
                className={`rounded-lg p-2 ${c.textMuted} ${c.hover} transition-colors disabled:opacity-50`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
            >
              <div className="space-y-5 px-6 py-6">
                {error && (
                  <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">
                    {error}
                  </div>
                )}

                <div>
                  <label
                    className={`mb-2 block text-sm font-medium ${c.textPrimary}`}
                  >
                    Product Image
                  </label>

                  <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
                    <div
                      className={`relative aspect-square overflow-hidden rounded-xl border ${c.border} ${c.input}`}
                    >
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Product preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div
                          className={`flex h-full flex-col items-center justify-center ${c.textMuted}`}
                        >
                          <ImagePlus className="h-8 w-8" />

                          <span className="mt-2 text-xs">
                            No image
                          </span>
                        </div>
                      )}
                    </div>

                    <div
                      className={`flex flex-col justify-center rounded-xl border border-dashed ${c.border} ${c.elevated} p-5`}
                    >
                      <div
                        className={`flex items-center gap-3 ${c.textPrimary}`}
                      >
                        <Upload className="h-5 w-5 text-violet-500" />

                        <p className="text-sm font-semibold">
                          Upload product image
                        </p>
                      </div>

                      <p
                        className={`mt-2 text-xs leading-5 ${c.textMuted}`}
                      >
                        JPG, PNG, WEBP, or GIF.
                        Maximum 5 MB. Stored
                        image is compressed to
                        150 KB.
                      </p>

                      <label className="mt-4 inline-flex w-fit cursor-pointer items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700">
                        <ImagePlus className="h-4 w-4" />

                        Choose Image

                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          onChange={
                            handleImageChange
                          }
                          disabled={
                            isSubmitting
                          }
                          className="sr-only"
                        />
                      </label>

                      {imageFile && (
                        <p
                          className={`mt-3 truncate text-xs ${c.textSecondary}`}
                        >
                          {imageFile.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="product-name"
                    className={`mb-2 block text-sm font-medium ${c.textPrimary}`}
                  >
                    Product Name
                  </label>

                  <input
                    id="product-name"
                    type="text"
                    value={form.name}
                    onChange={(event) =>
                      setForm(
                        (current) => ({
                          ...current,
                          name: event
                            .target
                            .value,
                        }),
                      )
                    }
                    placeholder="e.g. Website Template"
                    disabled={isSubmitting}
                    className={`w-full rounded-lg border ${c.border} ${c.input} ${c.textPrimary} ${c.placeholder} px-4 py-3 text-sm outline-none focus:border-violet-500 disabled:opacity-50`}
                  />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="product-category"
                      className={`mb-2 block text-sm font-medium ${c.textPrimary}`}
                    >
                      Category
                    </label>

                    <select
                      id="product-category"
                      value={
                        form.category
                      }
                      onChange={(
                        event,
                      ) =>
                        setForm(
                          (current) => ({
                            ...current,
                            category:
                              event
                                .target
                                .value,
                          }),
                        )
                      }
                      disabled={isSubmitting}
                      className={`w-full rounded-lg border ${c.border} ${c.input} ${c.textPrimary} px-4 py-3 text-sm outline-none focus:border-violet-500 disabled:opacity-50`}
                    >
                      <option>
                        Template
                      </option>

                      <option>
                        Design Asset
                      </option>

                      <option>
                        UI Kit
                      </option>

                      <option>
                        Icon
                      </option>

                      <option>
                        Preset
                      </option>

                      <option>
                        Other
                      </option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="product-price"
                      className={`mb-2 block text-sm font-medium ${c.textPrimary}`}
                    >
                      Price
                    </label>

                    <div className="relative">
                      <span
                        className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm ${c.textMuted}`}
                      >
                        Rp
                      </span>

                      <input
                        id="product-price"
                        type="number"
                        min="0"
                        value={
                          form.price
                        }
                        onChange={(
                          event,
                        ) =>
                          setForm(
                            (current) => ({
                              ...current,
                              price:
                                event
                                  .target
                                  .value,
                            }),
                          )
                        }
                        placeholder="149000"
                        disabled={
                          isSubmitting
                        }
                        className={`w-full rounded-lg border ${c.border} ${c.input} ${c.textPrimary} pl-10 pr-4 py-3 text-sm outline-none focus:border-violet-500 disabled:opacity-50`}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="product-stock"
                    className={`mb-2 block text-sm font-medium ${c.textPrimary}`}
                  >
                    Stock
                  </label>

                  <input
                    id="product-stock"
                    type="number"
                    min="0"
                    step="1"
                    value={form.stock}
                    onChange={(
                      event,
                    ) =>
                      setForm(
                        (current) => ({
                          ...current,
                          stock: event
                            .target
                            .value,
                        }),
                      )
                    }
                    placeholder="25"
                    disabled={isSubmitting}
                    className={`w-full rounded-lg border ${c.border} ${c.input} ${c.textPrimary} ${c.placeholder} px-4 py-3 text-sm outline-none focus:border-violet-500 disabled:opacity-50`}
                  />
                </div>

                <div>
                  <label
                    htmlFor="product-description"
                    className={`mb-2 block text-sm font-medium ${c.textPrimary}`}
                  >
                    Description
                  </label>

                  <textarea
                    id="product-description"
                    rows={4}
                    value={
                      form.description
                    }
                    onChange={(
                      event,
                    ) =>
                      setForm(
                        (current) => ({
                          ...current,
                          description:
                            event
                              .target
                              .value,
                        }),
                      )
                    }
                    placeholder="Describe this product..."
                    disabled={isSubmitting}
                    className={`w-full resize-none rounded-lg border ${c.border} ${c.input} ${c.textPrimary} ${c.placeholder} px-4 py-3 text-sm leading-6 outline-none focus:border-violet-500 disabled:opacity-50`}
                  />
                </div>

                <div>
                  <label
                    htmlFor="product-status"
                    className={`mb-2 block text-sm font-medium ${c.textPrimary}`}
                  >
                    Status
                  </label>

                  <select
                    id="product-status"
                    value={form.status}
                    onChange={(
                      event,
                    ) =>
                      setForm(
                        (current) => ({
                          ...current,
                          status:
                            event
                              .target
                              .value as
                            | 'Published'
                            | 'Draft',
                        }),
                      )
                    }
                    disabled={isSubmitting}
                    className={`w-full rounded-lg border ${c.border} ${c.input} ${c.textPrimary} px-4 py-3 text-sm outline-none focus:border-violet-500 disabled:opacity-50`}
                  >
                    <option value="Published">
                      Published
                    </option>

                    <option value="Draft">
                      Draft
                    </option>
                  </select>
                </div>
              </div>

              <div
                className={`flex justify-end gap-3 border-t ${c.border} px-6 py-5`}
              >
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className={`rounded-lg border ${c.border} px-5 py-2.5 text-sm font-medium ${c.textSecondary} ${c.hover} transition-colors disabled:opacity-50`}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting
                    ? 'Saving...'
                    : editingProduct
                      ? 'Save Changes'
                      : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
      className={`rounded-xl border ${c.border} ${c.surface} p-5 transition hover:-translate-y-0.5`}
    >
      <div className="mb-3 flex items-center gap-2 text-violet-500">
        <div className="rounded-lg bg-violet-500/10 p-2">
          <Package className="h-5 w-5" />
        </div>

        <span
          className={`text-sm ${c.textMuted}`}
        >
          {label}
        </span>
      </div>

      <p
        className={`text-2xl font-bold ${c.textPrimary}`}
      >
        {value}
      </p>
    </div>
  )
}