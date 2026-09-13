import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Loader2,
  Package,
  Search,
  Tag,
  XCircle,
} from 'lucide-react'

const API_BASE_URL =
  'https://39production-api.39production.workers.dev'

interface Order {
  id: number
  order_number: string
  product_id: number | null
  service_id: number | null
  customer_name: string
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
  original_total?: number
  discount_amount?: number
  final_total?: number
  promotion_id?: number | null
  promotion_code?: string | null
  type: 'Product' | 'Service'
  status:
  | 'Pending'
  | 'Processing'
  | 'Completed'
  | 'Cancelled'
  created_at: string
  updated_at: string
}

const statusSteps = [
  'Pending',
  'Processing',
  'Completed',
] as const

export function TrackOrderPage() {
  const [searchParams, setSearchParams] =
    useSearchParams()

  const [orderNumber, setOrderNumber] =
    useState(
      searchParams.get('order') ?? '',
    )

  const [order, setOrder] =
    useState<Order | null>(null)

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState('')

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (date: string) => {
    if (!date) return '-'

    const parsedDate = new Date(date)

    if (Number.isNaN(parsedDate.getTime())) {
      return date
    }

    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(parsedDate)
  }

  const getOriginalTotal = () => {
    if (!order) return 0

    return Number(
      order.original_total ??
      order.unit_price * order.quantity,
    )
  }

  const getDiscountAmount = () => {
    if (!order) return 0

    return Number(
      order.discount_amount ?? 0,
    )
  }

  const getFinalTotal = () => {
    if (!order) return 0

    return Number(
      order.final_total ??
      order.total_price,
    )
  }

  const trackOrder = async (
    number?: string,
  ) => {
    const targetOrderNumber = (
      number ?? orderNumber
    ).trim()

    if (!targetOrderNumber) {
      setError(
        'Please enter your order number.',
      )
      setOrder(null)
      return
    }

    try {
      setLoading(true)
      setError('')
      setOrder(null)

      const response = await fetch(
        `${API_BASE_URL}/api/orders/track/${encodeURIComponent(
          targetOrderNumber,
        )}`,
        {
          cache: 'no-store',
        },
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result?.message ||
          'Order not found.',
        )
      }

      const data = result?.data ?? result

      if (!data) {
        throw new Error(
          'Order not found.',
        )
      }

      setOrder(data)

      setOrderNumber(data.order_number)

      setSearchParams({
        order: data.order_number,
      })
    } catch (err) {
      console.error(
        'Track order error:',
        err,
      )

      setOrder(null)

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to track order.',
      )
    } finally {
      setLoading(false)
    }
  }

  const refreshOrder = async (
    number: string,
  ) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/orders/track/${encodeURIComponent(
          number,
        )}`,
        {
          cache: 'no-store',
        },
      )

      if (!response.ok) {
        return
      }

      const result = await response.json()

      const data = result?.data ?? result

      if (!data) {
        return
      }

      setOrder(data)
      setOrderNumber(data.order_number)
    } catch (err) {
      console.error(
        'Refresh order error:',
        err,
      )
    }
  }

  useEffect(() => {
    const orderFromUrl =
      searchParams.get('order')

    if (orderFromUrl) {
      setOrderNumber(orderFromUrl)
      void trackOrder(orderFromUrl)
    }
  }, [])

  useEffect(() => {
    if (!order?.order_number) {
      return
    }

    if (
      order.status === 'Completed' ||
      order.status === 'Cancelled'
    ) {
      return
    }

    const interval =
      window.setInterval(() => {
        void refreshOrder(
          order.order_number,
        )
      }, 5000)

    return () => {
      window.clearInterval(interval)
    }
  }, [
    order?.order_number,
    order?.status,
  ])

  const getStepState = (
    step: (typeof statusSteps)[number],
  ) => {
    if (!order) {
      return 'waiting'
    }

    if (order.status === 'Cancelled') {
      return 'waiting'
    }

    const currentIndex =
      statusSteps.indexOf(order.status)

    const stepIndex =
      statusSteps.indexOf(step)

    if (stepIndex < currentIndex) {
      return 'completed'
    }

    if (stepIndex === currentIndex) {
      return 'current'
    }

    return 'waiting'
  }

  const getStatusDescription = (
    step: (typeof statusSteps)[number],
  ) => {
    if (step === 'Pending') {
      return 'Order received'
    }

    if (step === 'Processing') {
      return 'Being processed'
    }

    return 'Order completed'
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      {/* TOP NAV */}
      <div className="border-b border-zinc-200 bg-zinc-50/70">
        <div className="mx-auto max-w-5xl px-6 py-5 lg:px-8">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-purple-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Link>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-6 pb-20 pt-12 lg:px-8 lg:pt-16">
        {/* PAGE HEADER */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-purple-200 bg-purple-50">
            <Package className="h-8 w-8 text-purple-600" />
          </div>

          <h1 className="mt-6 text-4xl font-bold tracking-tight text-zinc-950">
            Track Your Order
          </h1>

          <p className="mt-3 text-zinc-500">
            Enter your order number to check the latest
            status of your order.
          </p>
        </div>

        {/* SEARCH */}
        <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
          <form
            onSubmit={(event) => {
              event.preventDefault()
              void trackOrder()
            }}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />

              <input
                type="text"
                value={orderNumber}
                onChange={(event) =>
                  setOrderNumber(
                    event.target.value,
                  )
                }
                placeholder="Example: ORD-2026-..."
                className="h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-12 pr-4 text-sm text-zinc-900 outline-none transition focus:border-purple-400 focus:bg-white focus:ring-2 focus:ring-purple-100 placeholder:text-zinc-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-zinc-950 px-6 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Track Order
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}
        </div>

        {/* ORDER */}
        {order && (
          <div className="mx-auto mt-8 max-w-4xl space-y-6">
            {/* ORDER STATUS */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-zinc-500">
                    Order Number
                  </p>

                  <h2 className="mt-1 text-2xl font-bold tracking-tight text-zinc-950">
                    {order.order_number}
                  </h2>
                </div>

                <div
                  className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${order.status === 'Completed'
                      ? 'bg-emerald-50 text-emerald-700'
                      : order.status === 'Cancelled'
                        ? 'bg-red-50 text-red-600'
                        : order.status === 'Processing'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-amber-50 text-amber-700'
                    }`}
                >
                  {order.status ===
                    'Completed' ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : order.status ===
                    'Cancelled' ? (
                    <XCircle className="h-4 w-4" />
                  ) : (
                    <Clock3 className="h-4 w-4" />
                  )}

                  {order.status}
                </div>
              </div>

              <div className="mt-8">
                {order.status ===
                  'Cancelled' ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                    <div className="flex items-start gap-3">
                      <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

                      <div>
                        <h3 className="font-semibold text-red-700">
                          Order Cancelled
                        </h3>

                        <p className="mt-1 text-sm leading-6 text-red-600">
                          This order has been cancelled.
                          Please contact us if you need
                          further assistance.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-5 sm:grid-cols-3">
                    {statusSteps.map(
                      (step, index) => {
                        const state =
                          getStepState(step)

                        return (
                          <div
                            key={step}
                            className="relative"
                          >
                            {index <
                              statusSteps.length -
                              1 && (
                                <div
                                  className={`absolute left-10 right-[-20px] top-5 hidden h-px sm:block ${getStepState(
                                    statusSteps[
                                    index + 1
                                    ],
                                  ) ===
                                      'completed'
                                      ? 'bg-purple-500'
                                      : 'bg-zinc-200'
                                    }`}
                                />
                              )}

                            <div className="relative flex items-center gap-3">
                              <div
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${state ===
                                    'completed'
                                    ? 'bg-emerald-500 text-white'
                                    : state ===
                                      'current'
                                      ? 'bg-zinc-950 text-white'
                                      : 'bg-zinc-100 text-zinc-400'
                                  }`}
                              >
                                {state ===
                                  'completed' ? (
                                  <CheckCircle2 className="h-5 w-5" />
                                ) : (
                                  <span className="text-sm font-semibold">
                                    {index + 1}
                                  </span>
                                )}
                              </div>

                              <div>
                                <p
                                  className={`text-sm font-medium ${state ===
                                      'waiting'
                                      ? 'text-zinc-400'
                                      : 'text-zinc-900'
                                    }`}
                                >
                                  {step}
                                </p>

                                <p className="mt-0.5 text-xs text-zinc-500">
                                  {getStatusDescription(
                                    step,
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        )
                      },
                    )}
                  </div>
                )}
              </div>

              {order.status !==
                'Completed' &&
                order.status !==
                'Cancelled' && (
                  <div className="mt-6 flex items-center justify-center gap-2 text-xs text-zinc-400">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />

                    <span>
                      Status updates automatically
                    </span>
                  </div>
                )}
            </div>

            {/* DETAILS + TIMELINE */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* ORDER DETAILS */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-zinc-950">
                  Order Details
                </h2>

                <div className="mt-6 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-sm text-zinc-500">
                      Customer
                    </span>

                    <span className="text-right text-sm font-medium text-zinc-900">
                      {order.customer_name}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <span className="text-sm text-zinc-500">
                      Item
                    </span>

                    <span className="text-right text-sm font-medium text-zinc-900">
                      {order.product_name}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <span className="text-sm text-zinc-500">
                      Type
                    </span>

                    <span className="text-right text-sm font-medium text-zinc-900">
                      {order.type}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <span className="text-sm text-zinc-500">
                      Quantity
                    </span>

                    <span className="text-right text-sm font-medium text-zinc-900">
                      {order.quantity}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <span className="text-sm text-zinc-500">
                      Unit Price
                    </span>

                    <span className="text-right text-sm font-medium text-zinc-900">
                      {formatPrice(
                        Number(
                          order.unit_price,
                        ),
                      )}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <span className="text-sm text-zinc-500">
                      Subtotal
                    </span>

                    <span className="text-right text-sm font-medium text-zinc-900">
                      {formatPrice(
                        getOriginalTotal(),
                      )}
                    </span>
                  </div>

                  {getDiscountAmount() >
                    0 && (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                        <div className="flex items-start gap-3">
                          <Tag className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

                          <div className="flex-1">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="text-sm font-semibold text-emerald-700">
                                  Promotion Applied
                                </p>

                                {order.promotion_code && (
                                  <p className="mt-1 text-xs text-emerald-600">
                                    Code:{' '}
                                    {
                                      order.promotion_code
                                    }
                                  </p>
                                )}
                              </div>

                              <span className="text-sm font-semibold text-emerald-700">
                                -
                                {formatPrice(
                                  getDiscountAmount(),
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                  <div className="border-t border-zinc-200 pt-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="font-medium text-zinc-900">
                          Total
                        </span>

                        {getDiscountAmount() >
                          0 && (
                            <p className="mt-1 text-xs text-emerald-600">
                              Discount applied
                            </p>
                          )}
                      </div>

                      <span className="text-lg font-bold text-purple-600">
                        {formatPrice(
                          getFinalTotal(),
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* TIMELINE */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-zinc-950">
                  Order Timeline
                </h2>

                <div className="mt-6 space-y-6">
                  <div className="flex gap-3">
                    <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-50">
                      <div className="h-2.5 w-2.5 rounded-full bg-purple-600" />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-zinc-900">
                        Order Created
                      </p>

                      <p className="mt-1 text-xs text-zinc-500">
                        {formatDate(
                          order.created_at,
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div
                      className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${order.status !== 'Pending'
                          ? 'bg-purple-50'
                          : 'bg-zinc-100'
                        }`}
                    >
                      <div
                        className={`h-2.5 w-2.5 rounded-full ${order.status !== 'Pending'
                            ? 'bg-purple-600'
                            : 'bg-zinc-300'
                          }`}
                      />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-zinc-900">
                        Last Updated
                      </p>

                      <p className="mt-1 text-xs text-zinc-500">
                        {formatDate(
                          order.updated_at,
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* FOOTNOTE */}
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-6 py-5 text-center">
              <p className="text-sm text-zinc-500">
                Keep your order number to check your
                order status again later.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}