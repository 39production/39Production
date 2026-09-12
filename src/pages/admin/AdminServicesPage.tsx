import { Briefcase, Edit, ImagePlus, Plus, Search, Trash2, X } from 'lucide-react'
import { FormEvent, useEffect, useMemo, useState } from 'react'

const API_BASE_URL = 'https://39production-api.39production.workers.dev'

const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const MAX_STORED_IMAGE_SIZE = 150 * 1024
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

type ServicePricingType = 'fixed' | 'starting_from' | 'custom_quote'

interface Service {
  id: number
  name: string
  category: string
  description: string
  price: number | null
  pricing_type: ServicePricingType
  starting_price: number | null
  status: 'Active' | 'Draft'
  image_url?: string | null
  created_at?: string
  updated_at?: string
}

interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
}

interface ServiceForm {
  name: string
  category: string
  description: string
  pricing_type: ServicePricingType
  price: string
  starting_price: string
  status: 'Active' | 'Draft'
}

const emptyForm: ServiceForm = {
  name: '',
  category: 'Development',
  description: '',
  pricing_type: 'fixed',
  price: '',
  starting_price: '',
  status: 'Active',
}

function extractToken(value: unknown): string | null {
  if (typeof value === 'string') {
    const trimmed = value.trim()

    if (!trimmed) return null

    try {
      return extractToken(JSON.parse(trimmed))
    } catch {
      return trimmed
    }
  }

  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>

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

      if (typeof candidate === 'string' && candidate.trim()) {
        return candidate.trim()
      }
    }

    for (const key of ['data', 'auth', 'session', 'user']) {
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

  for (const storage of [window.localStorage, window.sessionStorage]) {
    for (const key of preferredKeys) {
      try {
        add(storage.getItem(key))
      } catch {
        // Ignore storage errors
      }
    }

    try {
      for (let index = 0; index < storage.length; index += 1) {
        const key = storage.key(index)

        if (key && !preferredKeys.includes(key)) {
          add(storage.getItem(key))
        }
      }
    } catch {
      // Ignore storage errors
    }
  }

  return tokens
}

async function getAdminToken(): Promise<string | null> {
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
      // Try next token
    }
  }

  return null
}

async function adminFetch(url: string, init: RequestInit = {}) {
  const token = await getAdminToken()

  if (!token) {
    throw new Error('Admin session not found or expired. Please login again.')
  }

  const headers = new Headers(init.headers)

  headers.set('Authorization', `Bearer ${token}`)

  return fetch(url, {
    ...init,
    headers,
  })
}

function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '-'
  }

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

function getPricingLabel(pricingType: ServicePricingType) {
  switch (pricingType) {
    case 'fixed':
      return 'Fixed Price'

    case 'starting_from':
      return 'Starting From'

    case 'custom_quote':
      return 'Custom Quote'

    default:
      return 'Fixed Price'
  }
}

function getPricingDescription(pricingType: ServicePricingType) {
  switch (pricingType) {
    case 'fixed':
      return 'Customer can directly purchase this service at the listed price.'

    case 'starting_from':
      return 'Display a minimum starting price. Final price depends on project scope.'

    case 'custom_quote':
      return 'Hide the price and ask the customer to request a custom quotation.'

    default:
      return ''
  }
}

function formatServicePrice(service: Service) {
  switch (service.pricing_type) {
    case 'fixed':
      return service.price ? formatCurrency(service.price) : 'Price not set'

    case 'starting_from':
      return service.starting_price
        ? `From ${formatCurrency(service.starting_price)}`
        : 'Starting price not set'

    case 'custom_quote':
      return 'Custom Quote'

    default:
      return service.price ? formatCurrency(service.price) : 'Price not set'
  }
}

async function compressServiceImage(file: File): Promise<File> {
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
        const blob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob(
            resolve,
            'image/webp',
            quality,
          )
        })

        if (
          blob &&
          blob.size <= MAX_STORED_IMAGE_SIZE
        ) {
          return new File(
            [
              blob,
            ],
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

export function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  const [isModalOpen, setIsModalOpen] = useState(false)

  const [editingService, setEditingService] =
    useState<Service | null>(null)

  const [form, setForm] =
    useState<ServiceForm>(emptyForm)

  const [imageFile, setImageFile] =
    useState<File | null>(null)

  const [imagePreview, setImagePreview] =
    useState('')

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchServices()
  }, [])

  async function fetchServices() {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(
        `${API_BASE_URL}/api/services`,
      )

      if (!response.ok) {
        throw new Error(
          `Failed to load services (${response.status}).`,
        )
      }

      const result: ApiResponse<Service[]> =
        await response.json()

      if (!result.success) {
        throw new Error(
          result.message || 'Failed to load services.',
        )
      }

      setServices(result.data || [])
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load services.',
      )
    } finally {
      setLoading(false)
    }
  }

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const value = search.toLowerCase()

      const matchesSearch =
        service.name.toLowerCase().includes(value) ||
        service.category.toLowerCase().includes(value) ||
        service.description.toLowerCase().includes(value)

      const matchesStatus =
        statusFilter === 'All' ||
        service.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [services, search, statusFilter])

  const activeCount = services.filter(
    (service) => service.status === 'Active',
  ).length

  const draftCount = services.filter(
    (service) => service.status === 'Draft',
  ).length

  function resetImageState() {
    setImageFile(null)
    setImagePreview('')
  }

  function openAddModal() {
    setEditingService(null)
    setForm(emptyForm)
    resetImageState()
    setError('')
    setIsModalOpen(true)
  }

  function openEditModal(service: Service) {
    setEditingService(service)

    setForm({
      name: service.name,
      category: service.category,
      description: service.description,
      pricing_type: service.pricing_type || 'fixed',
      price:
        service.price !== null &&
          service.price !== undefined
          ? String(service.price)
          : '',
      starting_price:
        service.starting_price !== null &&
          service.starting_price !== undefined
          ? String(service.starting_price)
          : '',
      status: service.status,
    })

    setImageFile(null)
    setImagePreview(service.image_url || '')
    setError('')
    setIsModalOpen(true)
  }

  function closeModal() {
    if (submitting) return

    setIsModalOpen(false)
    setEditingService(null)
    setForm(emptyForm)
    resetImageState()
    setError('')
  }

  function handleImageChange(
    event: React.ChangeEvent<HTMLInputElement>,
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

    const name = form.name.trim()
    const description = form.description.trim()

    const price = Number(form.price)
    const startingPrice = Number(
      form.starting_price,
    )

    if (!name) {
      setError('Service name is required.')
      return
    }

    if (!description) {
      setError('Description is required.')
      return
    }

    if (form.pricing_type === 'fixed') {
      if (
        !form.price ||
        Number.isNaN(price) ||
        price <= 0
      ) {
        setError(
          'Please enter a valid fixed price.',
        )
        return
      }
    }

    if (form.pricing_type === 'starting_from') {
      if (
        !form.starting_price ||
        Number.isNaN(startingPrice) ||
        startingPrice <= 0
      ) {
        setError(
          'Please enter a valid starting price.',
        )
        return
      }
    }

    try {
      setSubmitting(true)

      const formData = new FormData()

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
        'pricing_type',
        form.pricing_type,
      )

      if (form.pricing_type === 'fixed') {
        formData.append(
          'price',
          String(price),
        )
      } else {
        formData.append(
          'price',
          '',
        )
      }

      if (
        form.pricing_type === 'starting_from'
      ) {
        formData.append(
          'starting_price',
          String(startingPrice),
        )
      } else {
        formData.append(
          'starting_price',
          '',
        )
      }

      formData.append(
        'status',
        form.status,
      )

      if (imageFile) {
        const compressedImage =
          await compressServiceImage(
            imageFile,
          )

        formData.append(
          'image',
          compressedImage,
        )
      }

      const isEditing =
        Boolean(editingService)

      const url = isEditing
        ? `${API_BASE_URL}/api/services/${editingService!.id}`
        : `${API_BASE_URL}/api/services`

      const response = await adminFetch(
        url,
        {
          method: isEditing
            ? 'PUT'
            : 'POST',
          body: formData,
        },
      )

      const result: ApiResponse<Service> =
        await response.json()

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
          'Failed to save service.',
        )
      }

      if (!result.data) {
        throw new Error(
          'Service was saved but no data was returned.',
        )
      }

      setServices((current) =>
        isEditing
          ? current.map((service) =>
            service.id ===
              result.data!.id
              ? result.data!
              : service,
          )
          : [
            result.data!,
            ...current,
          ],
      )

      closeModal()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to save service.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: number) {
    const service = services.find(
      (item) => item.id === id,
    )

    if (!service) return

    if (
      !window.confirm(
        `Are you sure you want to delete "${service.name}"?`,
      )
    ) {
      return
    }

    try {
      setError('')

      const response = await adminFetch(
        `${API_BASE_URL}/api/services/${id}`,
        {
          method: 'DELETE',
        },
      )

      const result: ApiResponse<unknown> =
        await response.json()

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
          'Failed to delete service.',
        )
      }

      setServices((current) =>
        current.filter(
          (item) => item.id !== id,
        ),
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to delete service.',
      )
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-text-muted">
            Admin Panel
          </p>

          <h1 className="mt-1 font-display text-3xl font-bold text-text-primary">
            Services
          </h1>

          <p className="mt-2 text-sm text-text-secondary">
            Manage services offered by 39Production.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-secondary"
        >
          <Plus className="h-4 w-4" />
          Add Service
        </button>
      </div>

      {error && !isModalOpen && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          label="Total Services"
          value={String(services.length)}
        />

        <StatCard
          label="Active Services"
          value={String(activeCount)}
        />

        <StatCard
          label="Draft Services"
          value={String(draftCount)}
        />
      </div>

      <div className="rounded-xl border border-border-default bg-bg-surface p-5">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search services..."
              className="w-full rounded-lg border border-border-default bg-bg-base py-3 pl-10 pr-4 text-sm text-text-primary outline-none transition focus:border-brand-primary"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className="rounded-lg border border-border-default bg-bg-base px-4 py-3 text-sm text-text-primary outline-none focus:border-brand-primary"
          >
            <option>All</option>
            <option>Active</option>
            <option>Draft</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border-default bg-bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="border-b border-border-default bg-bg-base">
              <tr>
                {[
                  'Service',
                  'Category',
                  'Description',
                  'Pricing',
                  'Status',
                  'Actions',
                ].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-4 font-semibold text-text-primary"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-16 text-center text-text-muted"
                  >
                    Loading services...
                  </td>
                </tr>
              ) : (
                <>
                  {filteredServices.map(
                    (service) => (
                      <tr
                        key={service.id}
                        className="border-b border-border-default last:border-0"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 overflow-hidden rounded-lg bg-brand-primary/10 text-brand-primary">
                              {service.image_url ? (
                                <img
                                  src={
                                    service.image_url
                                  }
                                  alt={
                                    service.name
                                  }
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <Briefcase className="h-5 w-5" />
                                </div>
                              )}
                            </div>

                            <div>
                              <p className="font-medium text-text-primary">
                                {service.name}
                              </p>

                              <p className="text-xs text-text-muted">
                                ID #{service.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-text-secondary">
                          {service.category}
                        </td>

                        <td className="max-w-sm px-6 py-4 text-text-secondary">
                          <p className="line-clamp-2">
                            {
                              service.description
                            }
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <p className="font-medium text-text-primary">
                              {formatServicePrice(
                                service,
                              )}
                            </p>

                            <p className="text-xs text-text-muted">
                              {getPricingLabel(
                                service.pricing_type,
                              )}
                            </p>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${service.status ===
                                'Active'
                                ? 'bg-green-400/10 text-green-400'
                                : 'bg-yellow-400/10 text-yellow-400'
                              }`}
                          >
                            {service.status}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                openEditModal(
                                  service,
                                )
                              }
                              className="rounded-lg border border-border-default p-2 text-text-muted hover:text-text-primary"
                              title="Edit service"
                            >
                              <Edit className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  service.id,
                                )
                              }
                              className="rounded-lg border border-border-default p-2 text-red-400 hover:bg-red-400/10"
                              title="Delete service"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ),
                  )}

                  {filteredServices.length ===
                    0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-16 text-center text-sm text-text-muted"
                        >
                          No services found.
                        </td>
                      </tr>
                    )}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border-default bg-bg-surface shadow-2xl">
            <div className="flex items-center justify-between border-b border-border-default px-6 py-5">
              <div>
                <h2 className="font-display text-xl font-bold text-text-primary">
                  {editingService
                    ? 'Edit Service'
                    : 'Add Service'}
                </h2>

                <p className="mt-1 text-sm text-text-muted">
                  {editingService
                    ? 'Update service information.'
                    : 'Create a new service for your customers.'}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={submitting}
                className="rounded-lg p-2 text-text-muted hover:bg-bg-base hover:text-text-primary disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-5 px-6 py-6">
                {error && (
                  <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    {error}
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-sm font-medium text-text-primary">
                    Service Image
                  </label>

                  <div className="flex items-center gap-4">
                    <div className="h-28 w-28 overflow-hidden rounded-xl border border-border-default bg-bg-base">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Service preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center text-text-muted">
                          <ImagePlus className="h-7 w-7" />

                          <span className="mt-2 text-xs">
                            No image
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border-default px-4 py-2.5 text-sm font-medium text-text-primary hover:bg-bg-base">
                        <ImagePlus className="h-4 w-4" />

                        Choose Image

                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          onChange={
                            handleImageChange
                          }
                          disabled={submitting}
                          className="sr-only"
                        />
                      </label>

                      <p className="mt-2 text-xs text-text-muted">
                        JPG, PNG, WEBP, GIF. Max
                        upload 5 MB; stored image is
                        compressed to 150 KB.
                      </p>

                      {imageFile && (
                        <p className="mt-2 max-w-xs truncate text-xs text-text-secondary">
                          {imageFile.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-text-primary">
                    Service Name
                  </label>

                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      setForm((current) => ({
                        ...current,
                        name: e.target.value,
                      }))
                    }
                    placeholder="e.g. Web Development"
                    disabled={submitting}
                    className="w-full rounded-lg border border-border-default bg-bg-base px-4 py-3 text-sm text-text-primary outline-none focus:border-brand-primary disabled:opacity-60"
                  />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-text-primary">
                      Category
                    </label>

                    <select
                      value={form.category}
                      onChange={(e) =>
                        setForm((current) => ({
                          ...current,
                          category:
                            e.target.value,
                        }))
                      }
                      disabled={submitting}
                      className="w-full rounded-lg border border-border-default bg-bg-base px-4 py-3 text-sm text-text-primary outline-none focus:border-brand-primary"
                    >
                      <option>
                        Development
                      </option>

                      <option>
                        Design
                      </option>

                      <option>
                        Animation
                      </option>

                      <option>
                        Marketing
                      </option>

                      <option>
                        Production
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-text-primary">
                      Status
                    </label>

                    <select
                      value={form.status}
                      onChange={(e) =>
                        setForm((current) => ({
                          ...current,
                          status:
                            e.target.value as
                            | 'Active'
                            | 'Draft',
                        }))
                      }
                      disabled={submitting}
                      className="w-full rounded-lg border border-border-default bg-bg-base px-4 py-3 text-sm text-text-primary outline-none focus:border-brand-primary"
                    >
                      <option value="Active">
                        Active
                      </option>

                      <option value="Draft">
                        Draft
                      </option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-text-primary">
                    Pricing Type
                  </label>

                  <select
                    value={form.pricing_type}
                    onChange={(e) =>
                      setForm((current) => ({
                        ...current,
                        pricing_type:
                          e.target.value as ServicePricingType,
                      }))
                    }
                    disabled={submitting}
                    className="w-full rounded-lg border border-border-default bg-bg-base px-4 py-3 text-sm text-text-primary outline-none focus:border-brand-primary"
                  >
                    <option value="fixed">
                      Fixed Price
                    </option>

                    <option value="starting_from">
                      Starting From
                    </option>

                    <option value="custom_quote">
                      Custom Quote
                    </option>
                  </select>

                  <p className="mt-2 text-xs text-text-muted">
                    {getPricingDescription(
                      form.pricing_type,
                    )}
                  </p>
                </div>

                {form.pricing_type ===
                  'fixed' && (
                    <div>
                      <label className="mb-2 block text-sm font-medium text-text-primary">
                        Fixed Price
                      </label>

                      <input
                        type="number"
                        min="1"
                        value={form.price}
                        onChange={(e) =>
                          setForm((current) => ({
                            ...current,
                            price: e.target.value,
                          }))
                        }
                        placeholder="5000000"
                        disabled={submitting}
                        className="w-full rounded-lg border border-border-default bg-bg-base px-4 py-3 text-sm text-text-primary outline-none focus:border-brand-primary"
                      />

                      <p className="mt-2 text-xs text-text-muted">
                        Customer will pay this exact
                        price when ordering.
                      </p>
                    </div>
                  )}

                {form.pricing_type ===
                  'starting_from' && (
                    <div>
                      <label className="mb-2 block text-sm font-medium text-text-primary">
                        Starting Price
                      </label>

                      <input
                        type="number"
                        min="1"
                        value={
                          form.starting_price
                        }
                        onChange={(e) =>
                          setForm((current) => ({
                            ...current,
                            starting_price:
                              e.target.value,
                          }))
                        }
                        placeholder="1500000"
                        disabled={submitting}
                        className="w-full rounded-lg border border-border-default bg-bg-base px-4 py-3 text-sm text-text-primary outline-none focus:border-brand-primary"
                      />

                      <p className="mt-2 text-xs text-text-muted">
                        This will appear publicly as
                        "Starting from" or "From".
                        Final price will be determined
                        after reviewing the project.
                      </p>
                    </div>
                  )}

                {form.pricing_type ===
                  'custom_quote' && (
                    <div className="rounded-lg border border-brand-primary/20 bg-brand-primary/5 px-4 py-4">
                      <p className="text-sm font-medium text-text-primary">
                        Custom Quote
                      </p>

                      <p className="mt-1 text-xs leading-5 text-text-muted">
                        No price will be displayed for
                        this service. Customers will be
                        asked to submit a project request
                        and 39Production can determine
                        the final quotation manually.
                      </p>
                    </div>
                  )}

                <div>
                  <label className="mb-2 block text-sm font-medium text-text-primary">
                    Description
                  </label>

                  <textarea
                    rows={4}
                    value={form.description}
                    onChange={(e) =>
                      setForm((current) => ({
                        ...current,
                        description:
                          e.target.value,
                      }))
                    }
                    placeholder="Describe this service..."
                    disabled={submitting}
                    className="w-full resize-none rounded-lg border border-border-default bg-bg-base px-4 py-3 text-sm text-text-primary outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-border-default px-6 py-5">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="rounded-lg border border-border-default px-5 py-2.5 text-sm font-medium text-text-secondary hover:bg-bg-base disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-secondary disabled:opacity-60"
                >
                  {submitting
                    ? 'Saving...'
                    : editingService
                      ? 'Save Changes'
                      : 'Create Service'}
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
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border border-border-default bg-bg-surface p-5">
      <div className="mb-3 flex items-center gap-2 text-brand-primary">
        <Briefcase className="h-5 w-5" />

        <span className="text-sm">
          {label}
        </span>
      </div>

      <p className="text-2xl font-bold text-text-primary">
        {value}
      </p>
    </div>
  )
}