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

  const formatPrice = (
    price: number,
  ) => {
    return new Intl.NumberFormat(
      'id-ID',
      {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
      },
    ).format(price)
  }

  const formatDate = (
    date: string,
  ) => {
    if (!date) return '-'

    return new Intl.DateTimeFormat(
      'id-ID',
      {
        dateStyle: 'long',
        timeStyle: 'short',
      },
    ).format(new Date(date))
  }

  const getOriginalTotal = () => {
    if (!order) return 0

    return Number(
      order.original_total ??
      order.unit_price *
      order.quantity,
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

      const response =
        await fetch(
          `${API_BASE_URL} /api/orders / track / ${encodeURIComponent(
            targetOrderNumber,
          )
          } `,
          {
            cache: 'no-store',
          },
        )

      const result =
        await response.json()

      if (!response.ok) {
        throw new Error(
          result?.message ||
          'Order not found.',
        )
      }

      const data =
        result?.data ?? result

      if (!data) {
        throw new Error(
          'Order not found.',
        )
      }

      setOrder(data)

      setOrderNumber(
        data.order_number,
      )

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
      const response =
        await fetch(
          `${API_BASE_URL} /api/orders / track / ${encodeURIComponent(
            number,
          )
          } `,
          {
            cache: 'no-store',
          },
        )

      if (!response.ok) {
        return
      }

      const result =
        await response.json()

      const data =
        result?.data ?? result

      if (!data) {
        return
      }

      setOrder(data)

      setOrderNumber(
        data.order_number,
      )
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
      trackOrder(orderFromUrl)
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
        refreshOrder(
          order.order_number,
        )
      }, 5000)

    return () => {
      window.clearInterval(
        interval,
      )
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

    if (
      order.status === 'Cancelled'
    ) {
      return 'waiting'
    }

    const currentIndex =
      statusSteps.indexOf(
        order.status,
      )

    const stepIndex =
      statusSteps.indexOf(step)

    if (
      stepIndex < currentIndex
    ) {
      return 'completed'
    }

    if (
      stepIndex === currentIndex
    ) {
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
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-6 py-8 lg:px-8">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Link>
      </div>

      <main className="mx-auto max-w-5xl px-6 pb-20 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-card">
            <Package className="h-8 w-8 text-brand-primary" />
          </div>

          <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground">
            Track Your Order
          </h1>

          <p className="mt-3 text-muted-foreground">
            Enter your order number to check the latest status of your order.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-border bg-card p-6">
          <form
            onSubmit={(event) => {
              event.preventDefault()
              trackOrder()
            }}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

              <input
                type="text"
                value={orderNumber}
                onChange={(event) =>
                  setOrderNumber(
                    event.target.value,
                  )
                }
                placeholder="Example: ORD-2026-..."
                className="h-12 w-full rounded-xl border border-border bg-background pl-12 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-brand-primary"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-primary px-6 text-sm font-medium text-white transition-colors hover:bg-brand-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
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
            <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
              {error}
            </div>
          )}
        </div>

        {order && (
          <div className="mx-auto mt-8 max-w-4xl space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Order Number
                  </p>

                  <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
                    {order.order_number}
                  </h2>
                </div>

                <div
                  className={`inline - flex w - fit items - center gap - 2 rounded - full px - 4 py - 2 text - sm font - medium ${order.status ===
                      'Completed'
                      ? 'bg-green-500/10 text-green-400'
                      : order.status ===
                        'Cancelled'
                        ? 'bg-red-500/10 text-red-400'
                        : order.status ===
                          'Processing'
                          ? 'bg-blue-500/10 text-blue-400'
                          : 'bg-yellow-500/10 text-yellow-400'
                    } `}
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
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-5">
                    <div className="flex items-start gap-3">
                      <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />

                      <div>
                        <h3 className="font-semibold text-red-400">
                          Order Cancelled
                        </h3>

                        <p className="mt-1 text-sm leading-6 text-red-300/80">
                          This order has been cancelled. Please contact us if you need further assistance.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-6 sm:grid-cols-3">
                    {statusSteps.map(
                      (
                        step,
                        index,
                      ) => {
                        const state =
                          getStepState(
                            step,
                          )

                        return (
                          <div
                            key={step}
                            className="relative"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex h - 10 w - 10 shrink - 0 items - center justify - center rounded - full ${state ===
                                    'completed'
                                    ? 'bg-green-500 text-white'
                                    : state ===
                                      'current'
                                      ? 'bg-brand-primary text-white'
                                      : 'bg-muted text-muted-foreground'
                                  } `}
                              >
                                {state ===
                                  'completed' ? (
                                  <CheckCircle2 className="h-5 w-5" />
                                ) : (
                                  <span className="text-sm font-semibold">
                                    {index +
                                      1}
                                  </span>
                                )}
                              </div>

                              <div>
                                <p
                                  className={`font - medium ${state ===
                                      'waiting'
                                      ? 'text-muted-foreground'
                                      : 'text-foreground'
                                    } `}
                                >
                                  {step}
                                </p>

                                <p className="text-xs text-muted-foreground">
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
                  <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />

                    <span>
                      Status updates automatically
                    </span>
                  </div>
                )}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card p-6">
                <h2 className="text-lg font-semibold text-foreground">
                  Order Details
                </h2>

                <div className="mt-6 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-sm text-muted-foreground">
                      Customer
                    </span>

                    <span className="text-right text-sm font-medium text-foreground">
                      {order.customer_name}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <span className="text-sm text-muted-foreground">
                      {order.type}
                    </span>

                    <span className="text-right text-sm font-medium text-foreground">
                      {order.product_name}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <span className="text-sm text-muted-foreground">
                      Type
                    </span>

                    <span className="text-right text-sm font-medium text-foreground">
                      {order.type}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <span className="text-sm text-muted-foreground">
                      Quantity
                    </span>

                    <span className="text-right text-sm font-medium text-foreground">
                      {order.quantity}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <span className="text-sm text-muted-foreground">
                      Unit Price
                    </span>

                    <span className="text-right text-sm font-medium text-foreground">
                      {formatPrice(
                        Number(
                          order.unit_price,
                        ),
                      )}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <span className="text-sm text-muted-foreground">
                      Subtotal
                    </span>

                    <span className="text-right text-sm font-medium text-foreground">
                      {formatPrice(
                        getOriginalTotal(),
                      )}
                    </span>
                  </div>

                  {getDiscountAmount() >
                    0 && (
                      <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-4">
                        <div className="flex items-start gap-3">
                          <Tag className="mt-0.5 h-5 w-5 shrink-0 text-green-400" />

                          <div className="flex-1">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="text-sm font-semibold text-green-400">
                                  Promotion Applied
                                </p>

                                {order.promotion_code && (
                                  <p className="mt-1 text-xs text-green-300/70">
                                    Code:{' '}
                                    {
                                      order.promotion_code
                                    }
                                  </p>
                                )}
                              </div>

                              <span className="text-sm font-semibold text-green-400">
                                -{formatPrice(
                                  getDiscountAmount(),
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                  <div className="border-t border-border pt-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="font-medium text-foreground">
                          Total
                        </span>

                        {getDiscountAmount() >
                          0 && (
                            <p className="mt-1 text-xs text-green-400">
                              Discount applied
                            </p>
                          )}
                      </div>

                      <span className="text-lg font-bold text-brand-primary">
                        {formatPrice(
                          getFinalTotal(),
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6">
                <h2 className="text-lg font-semibold text-foreground">
                  Order Timeline
                </h2>

                <div className="mt-6 space-y-5">
                  <div className="flex gap-3">
                    <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-brand-primary" />

                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Order Created
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDate(
                          order.created_at,
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div
                      className={`mt - 1 h - 2.5 w - 2.5 shrink - 0 rounded - full ${order.status !==
                          'Pending'
                          ? 'bg-brand-primary'
                          : 'bg-muted'
                        } `}
                    />

                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Last Updated
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDate(
                          order.updated_at,
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Keep your order number to check your order status again later.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}