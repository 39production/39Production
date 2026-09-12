import { useEffect, useMemo, useState } from 'react'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Tag,
  Calendar,
  Package,
  Briefcase,
  Loader2,
  RefreshCw,
} from 'lucide-react'

const API_BASE_URL =
  'https://39production-api.39production.workers.dev'

interface Product {
  id: number
  name: string
  category: string
  description: string
  price: number
  stock: number
  status: 'Published' | 'Draft'
  created_at?: string
  updated_at?: string
}

interface Service {
  id: number
  name: string
  description: string
  price: number
  status: 'Active' | 'Draft'
  created_at?: string
  updated_at?: string
}

interface Promotion {
  id: number
  title: string
  code: string
  description: string
  discount_type: 'Percentage' | 'Fixed'
  discount_value: number
  target_type: 'Product' | 'Service'
  product_id: number | null
  service_id: number | null
  product_name?: string | null
  service_name?: string | null
  start_date: string
  end_date: string
  status:
  | 'Active'
  | 'Scheduled'
  | 'Expired'
  | 'Draft'
  created_at?: string
  updated_at?: string
}

interface PromotionForm {
  title: string
  code: string
  description: string
  discount_type: 'Percentage' | 'Fixed'
  discount_value: string
  target_type: 'Product' | 'Service'
  product_id: string
  service_id: string
  start_date: string
  end_date: string
  status:
  | 'Active'
  | 'Scheduled'
  | 'Expired'
  | 'Draft'
}

async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    },
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

  if (
    !response.ok ||
    !result.success
  ) {
    throw new Error(
      result.message ||
      'Terjadi kesalahan pada API.',
    )
  }

  return result.data
}

function createEmptyForm(): PromotionForm {
  return {
    title: '',
    code: '',
    description: '',
    discount_type: 'Percentage',
    discount_value: '',
    target_type: 'Product',
    product_id: '',
    service_id: '',
    start_date: '',
    end_date: '',
    status: 'Draft',
  }
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat(
    'id-ID',
    {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    },
  ).format(value)
}

function formatDate(
  dateString: string,
) {
  if (!dateString) {
    return '-'
  }

  const date =
    new Date(`${dateString}T00:00:00`)

  if (Number.isNaN(date.getTime())) {
    return dateString
  }

  return date.toLocaleDateString(
    'id-ID',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    },
  )
}

function getStatusClass(
  status: Promotion['status'],
) {
  switch (status) {
    case 'Active':
      return 'bg-green-500/10 text-green-400 border-green-500/20'

    case 'Scheduled':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/20'

    case 'Expired':
      return 'bg-red-500/10 text-red-400 border-red-500/20'

    case 'Draft':
    default:
      return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
  }
}

function getDiscountText(
  promotion: Promotion,
) {
  if (
    promotion.discount_type ===
    'Percentage'
  ) {
    return `${promotion.discount_value}%`
  }

  return formatRupiah(
    promotion.discount_value,
  )
}

export function AdminPromotionsPage() {
  const [promotions, setPromotions] =
    useState<Promotion[]>([])

  const [products, setProducts] =
    useState<Product[]>([])

  const [services, setServices] =
    useState<Service[]>([])

  const [loading, setLoading] =
    useState(true)

  const [saving, setSaving] =
    useState(false)

  const [error, setError] =
    useState('')

  const [searchQuery, setSearchQuery] =
    useState('')

  const [statusFilter, setStatusFilter] =
    useState<
      'All' | Promotion['status']
    >('All')

  const [targetFilter, setTargetFilter] =
    useState<
      'All' | Promotion['target_type']
    >('All')

  const [showModal, setShowModal] =
    useState(false)

  const [editingPromotion, setEditingPromotion] =
    useState<Promotion | null>(null)

  const [form, setForm] =
    useState<PromotionForm>(
      createEmptyForm(),
    )

  const [deleteId, setDeleteId] =
    useState<number | null>(null)

  const [deleting, setDeleting] =
    useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')

      const [
        promotionData,
        productData,
        serviceData,
      ] = await Promise.all([
        apiRequest<Promotion[]>(
          '/api/promotions',
        ),
        apiRequest<Product[]>(
          '/api/products',
        ),
        apiRequest<Service[]>(
          '/api/services',
        ),
      ])

      setPromotions(
        Array.isArray(promotionData)
          ? promotionData
          : [],
      )

      setProducts(
        Array.isArray(productData)
          ? productData.filter(
            (product) =>
              product.status ===
              'Published',
          )
          : [],
      )

      setServices(
        Array.isArray(serviceData)
          ? serviceData.filter(
            (service) =>
              service.status ===
              'Active',
          )
          : [],
      )
    } catch (err) {
      console.error(err)

      setError(
        err instanceof Error
          ? err.message
          : 'Gagal mengambil data promotion.',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredPromotions =
    useMemo(() => {
      const query =
        searchQuery
          .trim()
          .toLowerCase()

      return promotions.filter(
        (promotion) => {
          const matchesSearch =
            !query ||
            promotion.title
              .toLowerCase()
              .includes(query) ||
            promotion.code
              .toLowerCase()
              .includes(query) ||
            promotion.description
              .toLowerCase()
              .includes(query) ||
            (
              promotion.product_name ||
              ''
            )
              .toLowerCase()
              .includes(query) ||
            (
              promotion.service_name ||
              ''
            )
              .toLowerCase()
              .includes(query)

          const matchesStatus =
            statusFilter === 'All' ||
            promotion.status ===
            statusFilter

          const matchesTarget =
            targetFilter === 'All' ||
            promotion.target_type ===
            targetFilter

          return (
            matchesSearch &&
            matchesStatus &&
            matchesTarget
          )
        },
      )
    }, [
      promotions,
      searchQuery,
      statusFilter,
      targetFilter,
    ])

  const openCreateModal = () => {
    setEditingPromotion(null)
    setForm(createEmptyForm())
    setError('')
    setShowModal(true)
  }

  const openEditModal = (
    promotion: Promotion,
  ) => {
    setEditingPromotion(promotion)
    setError('')

    setForm({
      title: promotion.title,
      code: promotion.code,
      description:
        promotion.description,
      discount_type:
        promotion.discount_type,
      discount_value:
        String(
          promotion.discount_value,
        ),
      target_type:
        promotion.target_type,
      product_id:
        promotion.product_id
          ? String(
            promotion.product_id,
          )
          : '',
      service_id:
        promotion.service_id
          ? String(
            promotion.service_id,
          )
          : '',
      start_date:
        promotion.start_date,
      end_date:
        promotion.end_date,
      status: promotion.status,
    })

    setShowModal(true)
  }

  const closeModal = () => {
    if (saving) {
      return
    }

    setShowModal(false)
    setEditingPromotion(null)
    setForm(createEmptyForm())
    setError('')
  }

  const handleTargetTypeChange = (
    targetType:
      | 'Product'
      | 'Service',
  ) => {
    setForm((previous) => ({
      ...previous,
      target_type: targetType,
      product_id:
        targetType === 'Product'
          ? previous.product_id
          : '',
      service_id:
        targetType === 'Service'
          ? previous.service_id
          : '',
    }))
  }

  const handleSubmit = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault()

    setError('')

    if (
      !form.title.trim() ||
      !form.code.trim() ||
      !form.description.trim()
    ) {
      setError(
        'Title, code, dan description wajib diisi.',
      )
      return
    }

    const discountValue =
      Number(form.discount_value)

    if (
      !Number.isInteger(
        discountValue,
      ) ||
      discountValue <= 0
    ) {
      setError(
        'Discount value harus berupa angka bulat lebih dari 0.',
      )
      return
    }

    if (
      form.discount_type ===
      'Percentage' &&
      discountValue > 100
    ) {
      setError(
        'Discount percentage tidak boleh lebih dari 100%.',
      )
      return
    }

    if (
      form.target_type ===
      'Product' &&
      !form.product_id
    ) {
      setError(
        'Pilih product terlebih dahulu.',
      )
      return
    }

    if (
      form.target_type ===
      'Service' &&
      !form.service_id
    ) {
      setError(
        'Pilih service terlebih dahulu.',
      )
      return
    }

    if (
      !form.start_date ||
      !form.end_date
    ) {
      setError(
        'Tanggal mulai dan tanggal berakhir wajib diisi.',
      )
      return
    }

    if (
      form.end_date <
      form.start_date
    ) {
      setError(
        'Tanggal berakhir tidak boleh sebelum tanggal mulai.',
      )
      return
    }

    const payload = {
      title: form.title.trim(),
      code: form.code
        .trim()
        .toUpperCase(),
      description:
        form.description.trim(),
      discount_type:
        form.discount_type,
      discount_value:
        discountValue,
      target_type:
        form.target_type,
      product_id:
        form.target_type ===
          'Product'
          ? Number(
            form.product_id,
          )
          : null,
      service_id:
        form.target_type ===
          'Service'
          ? Number(
            form.service_id,
          )
          : null,
      start_date:
        form.start_date,
      end_date:
        form.end_date,
      status: form.status,
    }

    try {
      setSaving(true)

      if (editingPromotion) {
        await apiRequest(
          `/api/promotions/${editingPromotion.id}`,
          {
            method: 'PUT',
            body: JSON.stringify(
              payload,
            ),
          },
        )
      } else {
        await apiRequest(
          '/api/promotions',
          {
            method: 'POST',
            body: JSON.stringify(
              payload,
            ),
          },
        )
      }

      await loadData()
      closeModal()
    } catch (err) {
      console.error(err)

      setError(
        err instanceof Error
          ? err.message
          : 'Gagal menyimpan promotion.',
      )
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (deleteId === null) {
      return
    }

    try {
      setDeleting(true)
      setError('')

      await apiRequest(
        `/api/promotions/${deleteId}`,
        {
          method: 'DELETE',
        },
      )

      setDeleteId(null)

      await loadData()
    } catch (err) {
      console.error(err)

      setError(
        err instanceof Error
          ? err.message
          : 'Gagal menghapus promotion.',
      )
    } finally {
      setDeleting(false)
    }
  }

  const getTargetName = (
    promotion: Promotion,
  ) => {
    if (
      promotion.target_type ===
      'Product'
    ) {
      if (promotion.product_name) {
        return promotion.product_name
      }

      const product =
        products.find(
          (item) =>
            item.id ===
            promotion.product_id,
        )

      return product?.name || '-'
    }

    if (promotion.service_name) {
      return promotion.service_name
    }

    const service =
      services.find(
        (item) =>
          item.id ===
          promotion.service_id,
      )

    return service?.name || '-'
  }

  return (
    <div className="min-h-screen bg-[#09090B] text-white">
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Promotions
            </h1>

            <p className="mt-1 text-sm text-zinc-400">
              Kelola promotion untuk
              product dan service.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={
                  loading
                    ? 'animate-spin'
                    : ''
                }
              />

              Refresh
            </button>

            <button
              type="button"
              onClick={
                openCreateModal
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-purple-700"
            >
              <Plus size={18} />

              Add Promotion
            </button>
          </div>
        </div>

        {/* Error */}
        {error && !showModal && (
          <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 rounded-xl border border-zinc-800 bg-[#18181B] p-4">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_180px_180px]">
            {/* Search */}
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
              />

              <input
                type="text"
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(
                    event.target.value,
                  )
                }
                placeholder="Search promotion, code, product, service..."
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 py-2.5 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-purple-500"
              />
            </div>

            {/* Status */}
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as
                  | 'All'
                  | Promotion['status'],
                )
              }
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none focus:border-purple-500"
            >
              <option value="All">
                All Status
              </option>
              <option value="Active">
                Active
              </option>
              <option value="Scheduled">
                Scheduled
              </option>
              <option value="Expired">
                Expired
              </option>
              <option value="Draft">
                Draft
              </option>
            </select>

            {/* Target */}
            <select
              value={targetFilter}
              onChange={(event) =>
                setTargetFilter(
                  event.target.value as
                  | 'All'
                  | Promotion['target_type'],
                )
              }
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none focus:border-purple-500"
            >
              <option value="All">
                All Target
              </option>
              <option value="Product">
                Product
              </option>
              <option value="Service">
                Service
              </option>
            </select>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-zinc-800 bg-[#18181B]">
            <div className="flex items-center gap-3 text-zinc-400">
              <Loader2
                size={20}
                className="animate-spin"
              />

              Loading promotions...
            </div>
          </div>
        ) : filteredPromotions.length ===
          0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-zinc-800 bg-[#18181B] px-6 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-purple-500/10">
              <Tag
                size={26}
                className="text-purple-400"
              />
            </div>

            <h3 className="text-lg font-semibold">
              No promotions found
            </h3>

            <p className="mt-1 max-w-md text-sm text-zinc-400">
              Belum ada promotion yang
              sesuai dengan filter.
            </p>

            {!searchQuery &&
              statusFilter ===
              'All' &&
              targetFilter ===
              'All' && (
                <button
                  type="button"
                  onClick={
                    openCreateModal
                  }
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium hover:bg-purple-700"
                >
                  <Plus size={17} />

                  Add Promotion
                </button>
              )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-zinc-800 bg-[#18181B]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px]">
                <thead>
                  <tr className="border-b border-zinc-800 text-left text-xs uppercase tracking-wider text-zinc-500">
                    <th className="px-5 py-4 font-medium">
                      Promotion
                    </th>

                    <th className="px-5 py-4 font-medium">
                      Code
                    </th>

                    <th className="px-5 py-4 font-medium">
                      Discount
                    </th>

                    <th className="px-5 py-4 font-medium">
                      Target
                    </th>

                    <th className="px-5 py-4 font-medium">
                      Period
                    </th>

                    <th className="px-5 py-4 font-medium">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right font-medium">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-zinc-800">
                  {filteredPromotions.map(
                    (promotion) => (
                      <tr
                        key={
                          promotion.id
                        }
                        className="transition hover:bg-zinc-900/60"
                      >
                        {/* Promotion */}
                        <td className="px-5 py-4">
                          <div>
                            <div className="font-medium text-white">
                              {
                                promotion.title
                              }
                            </div>

                            <div className="mt-1 max-w-xs truncate text-xs text-zinc-500">
                              {
                                promotion.description
                              }
                            </div>
                          </div>
                        </td>

                        {/* Code */}
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center rounded-md border border-purple-500/20 bg-purple-500/10 px-2.5 py-1 font-mono text-xs font-semibold text-purple-300">
                            {
                              promotion.code
                            }
                          </span>
                        </td>

                        {/* Discount */}
                        <td className="px-5 py-4">
                          <div className="font-semibold text-white">
                            {getDiscountText(
                              promotion,
                            )}
                          </div>

                          <div className="mt-1 text-xs text-zinc-500">
                            {
                              promotion.discount_type
                            }
                          </div>
                        </td>

                        {/* Target */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800">
                              {promotion.target_type ===
                                'Product' ? (
                                <Package
                                  size={15}
                                  className="text-purple-400"
                                />
                              ) : (
                                <Briefcase
                                  size={15}
                                  className="text-pink-400"
                                />
                              )}
                            </div>

                            <div>
                              <div className="text-xs text-zinc-500">
                                {
                                  promotion.target_type
                                }
                              </div>

                              <div className="max-w-[180px] truncate text-sm text-zinc-200">
                                {getTargetName(
                                  promotion,
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Period */}
                        <td className="px-5 py-4">
                          <div className="flex items-start gap-2 text-sm">
                            <Calendar
                              size={15}
                              className="mt-0.5 shrink-0 text-zinc-500"
                            />

                            <div>
                              <div className="text-zinc-200">
                                {formatDate(
                                  promotion.start_date,
                                )}
                              </div>

                              <div className="mt-1 text-xs text-zinc-500">
                                until{' '}
                                {formatDate(
                                  promotion.end_date,
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClass(
                              promotion.status,
                            )}`}
                          >
                            {
                              promotion.status
                            }
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                openEditModal(
                                  promotion,
                                )
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-300 transition hover:border-purple-500/40 hover:bg-purple-500/10 hover:text-purple-300"
                              title="Edit"
                            >
                              <Edit
                                size={16}
                              />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setDeleteId(
                                  promotion.id,
                                )
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-300 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300"
                              title="Delete"
                            >
                              <Trash2
                                size={16}
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-zinc-800 bg-[#18181B] shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-800 bg-[#18181B] px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold">
                  {editingPromotion
                    ? 'Edit Promotion'
                    : 'Add Promotion'}
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Hubungkan promotion
                  dengan product atau
                  service.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  closeModal
                }
                disabled={saving}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-800 hover:text-white disabled:opacity-50"
              >
                <X size={19} />
              </button>
            </div>

            {/* Modal Form */}
            <form
              onSubmit={
                handleSubmit
              }
              className="space-y-5 p-6"
            >
              {error && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              {/* Title */}
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Promotion Title
                </label>

                <input
                  type="text"
                  value={form.title}
                  onChange={(event) =>
                    setForm(
                      (previous) => ({
                        ...previous,
                        title:
                          event.target
                            .value,
                      }),
                    )
                  }
                  placeholder="Contoh: Welcome 10"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-purple-500"
                />
              </div>

              {/* Code */}
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Promotion Code
                </label>

                <input
                  type="text"
                  value={form.code}
                  onChange={(event) =>
                    setForm(
                      (previous) => ({
                        ...previous,
                        code:
                          event.target.value
                            .toUpperCase(),
                      }),
                    )
                  }
                  placeholder="WELCOME10"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 font-mono text-sm text-white uppercase outline-none placeholder:text-zinc-600 focus:border-purple-500"
                />

                <p className="mt-1.5 text-xs text-zinc-600">
                  Gunakan huruf, angka,
                  underscore (_) atau
                  hyphen (-).
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Description
                </label>

                <textarea
                  value={
                    form.description
                  }
                  onChange={(event) =>
                    setForm(
                      (previous) => ({
                        ...previous,
                        description:
                          event.target
                            .value,
                      }),
                    )
                  }
                  rows={3}
                  placeholder="Deskripsi promotion..."
                  className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-purple-500"
                />
              </div>

              {/* Discount */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    Discount Type
                  </label>

                  <select
                    value={
                      form.discount_type
                    }
                    onChange={(event) =>
                      setForm(
                        (previous) => ({
                          ...previous,
                          discount_type:
                            event.target
                              .value as
                            | 'Percentage'
                            | 'Fixed',
                        }),
                      )
                    }
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500"
                  >
                    <option value="Percentage">
                      Percentage
                    </option>

                    <option value="Fixed">
                      Fixed
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    Discount Value
                  </label>

                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max={
                        form.discount_type ===
                          'Percentage'
                          ? 100
                          : undefined
                      }
                      value={
                        form.discount_value
                      }
                      onChange={(
                        event,
                      ) =>
                        setForm(
                          (
                            previous,
                          ) => ({
                            ...previous,
                            discount_value:
                              event
                                .target
                                .value,
                          }),
                        )
                      }
                      placeholder="10"
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 pr-12 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-purple-500"
                    />

                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">
                      {form.discount_type ===
                        'Percentage'
                        ? '%'
                        : 'IDR'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Target */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-zinc-300">
                    Promotion Target
                  </label>

                  <p className="mt-1 text-xs text-zinc-600">
                    Promotion hanya berlaku
                    untuk satu product atau
                    satu service yang dipilih.
                  </p>
                </div>

                {/* Target Type */}
                <div className="mb-4 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      handleTargetTypeChange(
                        'Product',
                      )
                    }
                    className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition ${form.target_type ===
                      'Product'
                      ? 'border-purple-500/50 bg-purple-500/10 text-purple-300'
                      : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
                      }`}
                  >
                    <Package size={17} />

                    Product
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleTargetTypeChange(
                        'Service',
                      )
                    }
                    className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition ${form.target_type ===
                      'Service'
                      ? 'border-pink-500/50 bg-pink-500/10 text-pink-300'
                      : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
                      }`}
                  >
                    <Briefcase
                      size={17}
                    />

                    Service
                  </button>
                </div>

                {/* Product Target */}
                {form.target_type ===
                  'Product' && (
                    <div>
                      <label className="mb-2 block text-sm font-medium text-zinc-300">
                        Select Product
                      </label>

                      <select
                        value={
                          form.product_id
                        }
                        onChange={(
                          event,
                        ) =>
                          setForm(
                            (
                              previous,
                            ) => ({
                              ...previous,
                              product_id:
                                event
                                  .target
                                  .value,
                            }),
                          )
                        }
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500"
                      >
                        <option value="">
                          -- Select Product --
                        </option>

                        {products.map(
                          (product) => (
                            <option
                              key={
                                product.id
                              }
                              value={
                                product.id
                              }
                            >
                              {
                                product.name
                              }{' '}
                              —{' '}
                              {formatRupiah(
                                product.price,
                              )}
                            </option>
                          ),
                        )}
                      </select>

                      {products.length ===
                        0 && (
                          <p className="mt-2 text-xs text-yellow-500">
                            Belum ada product
                            Published yang
                            tersedia.
                          </p>
                        )}
                    </div>
                  )}

                {/* Service Target */}
                {form.target_type ===
                  'Service' && (
                    <div>
                      <label className="mb-2 block text-sm font-medium text-zinc-300">
                        Select Service
                      </label>

                      <select
                        value={
                          form.service_id
                        }
                        onChange={(
                          event,
                        ) =>
                          setForm(
                            (
                              previous,
                            ) => ({
                              ...previous,
                              service_id:
                                event
                                  .target
                                  .value,
                            }),
                          )
                        }
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500"
                      >
                        <option value="">
                          -- Select Service --
                        </option>

                        {services.map(
                          (service) => (
                            <option
                              key={
                                service.id
                              }
                              value={
                                service.id
                              }
                            >
                              {
                                service.name
                              }{' '}
                              —{' '}
                              {formatRupiah(
                                service.price,
                              )}
                            </option>
                          ),
                        )}
                      </select>

                      {services.length ===
                        0 && (
                          <p className="mt-2 text-xs text-yellow-500">
                            Belum ada service
                            Active yang
                            tersedia.
                          </p>
                        )}
                    </div>
                  )}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    Start Date
                  </label>

                  <input
                    type="date"
                    value={
                      form.start_date
                    }
                    onChange={(event) =>
                      setForm(
                        (previous) => ({
                          ...previous,
                          start_date:
                            event
                              .target
                              .value,
                        }),
                      )
                    }
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    End Date
                  </label>

                  <input
                    type="date"
                    value={
                      form.end_date
                    }
                    min={
                      form.start_date ||
                      undefined
                    }
                    onChange={(event) =>
                      setForm(
                        (previous) => ({
                          ...previous,
                          end_date:
                            event
                              .target
                              .value,
                        }),
                      )
                    }
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Status
                </label>

                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm(
                      (previous) => ({
                        ...previous,
                        status:
                          event.target
                            .value as Promotion['status'],
                      }),
                    )
                  }
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500"
                >
                  <option value="Draft">
                    Draft
                  </option>

                  <option value="Scheduled">
                    Scheduled
                  </option>

                  <option value="Active">
                    Active
                  </option>

                  <option value="Expired">
                    Expired
                  </option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 border-t border-zinc-800 pt-5">
                <button
                  type="button"
                  onClick={
                    closeModal
                  }
                  disabled={saving}
                  className="rounded-lg border border-zinc-700 px-5 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving && (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  )}

                  {saving
                    ? 'Saving...'
                    : editingPromotion
                      ? 'Update Promotion'
                      : 'Create Promotion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#18181B] p-6 shadow-2xl">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
              <Trash2
                size={22}
                className="text-red-400"
              />
            </div>

            <h2 className="text-lg font-semibold text-white">
              Delete Promotion?
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Promotion ini akan dihapus
              secara permanen dari database.
              Tindakan ini tidak dapat
              dibatalkan.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() =>
                  setDeleteId(null)
                }
                disabled={deleting}
                className="rounded-lg border border-zinc-700 px-5 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleDelete
                }
                disabled={deleting}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting && (
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                )}

                {deleting
                  ? 'Deleting...'
                  : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
