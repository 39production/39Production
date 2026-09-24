
import { useEffect, useState } from 'react'
import {
  Link,
  useSearchParams,
} from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Copy,
  CreditCard,
  ExternalLink,
  Loader2,
  Package,
  Search,
  ShieldCheck,
  Tag,
  WalletCards,
  XCircle,
} from 'lucide-react'

const API_BASE_URL =
  'https://39production-api.39production.workers.dev'

interface PaymentTransaction {
  payment_reference: string
  payment_stage: 'DP' | 'FINAL' | string
  payment_method: string
  amount: number
  status:
  | 'PENDING'
  | 'PROCESSING'
  | 'PAID'
  | 'FAILED'
  | string
  paid_at: string | null
  created_at: string
}

interface PaymentSummary {
  total: number
  dp_amount: number
  paid_amount: number
  remaining_amount: number
  dp_paid: boolean
  final_paid: boolean
}

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

  dp_amount?: number
  dp_paid_at?: string | null
  remaining_amount?: number
  paid_amount?: number
  final_paid_at?: string | null
  payment_status?: string

  type: 'Product' | 'Service'

  status:
  | 'Pending'
  | 'Processing'
  | 'Ready for Final Payment'
  | 'Completed'
  | 'Paid Full'
  | 'Cancelled'
  | string

  created_at: string
  updated_at: string
}

interface TrackingResponse {
  success: boolean
  message?: string
  data?: {
    order: Order | null
    payments?: PaymentTransaction[]
    payment_summary?: PaymentSummary
  }
}

interface FinalPaymentData {
  payment_reference: string
  partner_reference_no?: string
  payment_method: string
  payment_stage: 'FINAL'
  status: string
  order_number: string
  amount: number
  remaining_amount: number
  qr_content?: string | null
  qr_url?: string | null
  qr_image?: string | null
  expires_at?: string | null
}

const statusSteps = [
  'Pending',
  'Processing',
  'Ready for Final Payment',
  'Paid Full',
] as const

type StatusStep = (typeof statusSteps)[number]

export function TrackOrderPage() {
  const [searchParams, setSearchParams] =
    useSearchParams()

  const [orderNumber, setOrderNumber] =
    useState(
      searchParams.get('order') ?? '',
    )

  const [paymentToken, setPaymentToken] =
    useState(
      searchParams.get('token') ?? '',
    )

  const [order, setOrder] =
    useState<Order | null>(null)

  const [payments, setPayments] =
    useState<PaymentTransaction[]>([])

  const [paymentSummary, setPaymentSummary] =
    useState<PaymentSummary | null>(null)

  const [loading, setLoading] =
    useState(false)

  const [paymentLoading, setPaymentLoading] =
    useState(false)

  const [paymentPolling, setPaymentPolling] =
    useState(false)

  const [finalPayment, setFinalPayment] =
    useState<FinalPaymentData | null>(null)

  const [error, setError] =
    useState('')

  const [paymentError, setPaymentError] =
    useState('')

  const [copiedReference, setCopiedReference] =
    useState(false)

  const [copiedQr, setCopiedQr] =
    useState(false)

  const [paymentSuccess, setPaymentSuccess] =
    useState(false)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (
    date: string | null | undefined,
  ) => {
    if (!date) {
      return '-'
    }

    const parsedDate = new Date(date)

    if (
      Number.isNaN(
        parsedDate.getTime(),
      )
    ) {
      return date
    }

    return new Intl.DateTimeFormat(
      'id-ID',
      {
        dateStyle: 'long',
        timeStyle: 'short',
      },
    ).format(parsedDate)
  }

  const getOriginalTotal = () => {
    if (!order) {
      return 0
    }

    return Number(
      order.original_total ??
      order.unit_price *
      order.quantity,
    )
  }

  const getDiscountAmount = () => {
    if (!order) {
      return 0
    }

    return Number(
      order.discount_amount ?? 0,
    )
  }

  const getFinalTotal = () => {
    if (!order) {
      return 0
    }

    return Number(
      order.final_total ??
      order.total_price,
    )
  }

  const getDpAmount = () => {
    if (paymentSummary) {
      return Number(
        paymentSummary.dp_amount ?? 0,
      )
    }

    return Number(
      order?.dp_amount ?? 0,
    )
  }

  const getPaidAmount = () => {
    if (paymentSummary) {
      return Number(
        paymentSummary.paid_amount ?? 0,
      )
    }

    return Number(
      order?.paid_amount ?? 0,
    )
  }

  const getRemainingAmount = () => {
    if (paymentSummary) {
      return Number(
        paymentSummary.remaining_amount ?? 0,
      )
    }

    return Number(
      order?.remaining_amount ?? 0,
    )
  }

  const isFinalPaymentReady = () => {
    if (!order) {
      return false
    }

    return (
      order.status ===
      'Ready for Final Payment' &&
      getRemainingAmount() > 0
    )
  }

  const isFullyPaid = () => {
    if (!order) {
      return false
    }

    return (
      paymentSummary?.final_paid === true ||
      order.payment_status === 'PAID_FULL' ||
      (
        Number(
          order.remaining_amount ?? 0,
        ) === 0 &&
        !!order.final_paid_at
      ) ||
      order.status === 'Paid Full'
    )
  }

  const isCancelled = () => {
    return order?.status === 'Cancelled'
  }

  const updateTrackingUrl = (
    number: string,
    token: string,
  ) => {
    setSearchParams({
      order: number,
      ...(token
        ? {
          token,
        }
        : {}),
    })
  }

  const applyTrackingData = (
    result: TrackingResponse,
  ) => {
    const data = result?.data

    if (!data?.order) {
      throw new Error(
        'Order not found.',
      )
    }

    setOrder(data.order)

    setOrderNumber(
      data.order.order_number,
    )

    setPayments(
      data.payments ?? [],
    )

    setPaymentSummary(
      data.payment_summary ?? null,
    )
  }

  const trackOrder = async (
    number?: string,
    token?: string,
  ) => {
    const targetOrderNumber = (
      number ?? orderNumber
    ).trim()

    const targetPaymentToken = (
      token ?? paymentToken
    ).trim()

    if (!targetOrderNumber) {
      setError(
        'Please enter your order number.',
      )

      setOrder(null)
      setPayments([])
      setPaymentSummary(null)

      return
    }

    if (!targetPaymentToken) {
      setError(
        'This tracking link is missing its secure payment token. Please use the original tracking link from your order.',
      )

      setOrder(null)
      setPayments([])
      setPaymentSummary(null)

      return
    }

    try {
      setLoading(true)
      setError('')

      setOrder(null)
      setPayments([])
      setPaymentSummary(null)

      const response = await fetch(
        `${API_BASE_URL}/api/orders/track/${encodeURIComponent(
          targetOrderNumber,
        )}?token=${encodeURIComponent(
          targetPaymentToken,
        )}`,
        {
          cache: 'no-store',
        },
      )

      const result =
        (await response.json()) as TrackingResponse

      if (!response.ok) {
        throw new Error(
          result?.message ||
          'Order not found.',
        )
      }

      applyTrackingData(result)

      setPaymentToken(
        targetPaymentToken,
      )

      updateTrackingUrl(
        targetOrderNumber,
        targetPaymentToken,
      )
    } catch (err) {
      console.error(
        'Track order error:',
        err,
      )

      setOrder(null)
      setPayments([])
      setPaymentSummary(null)

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
    token: string,
  ) => {
    if (!number || !token) {
      return
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/orders/track/${encodeURIComponent(
          number,
        )}?token=${encodeURIComponent(
          token,
        )}`,
        {
          cache: 'no-store',
        },
      )

      if (!response.ok) {
        return
      }

      const result =
        (await response.json()) as TrackingResponse

      if (!result?.data?.order) {
        return
      }

      applyTrackingData(result)
    } catch (err) {
      console.error(
        'Refresh order error:',
        err,
      )
    }
  }

  const createFinalPayment = async () => {
    if (!order?.order_number) {
      return
    }

    if (!paymentToken) {
      setPaymentError(
        'Secure payment token is missing from this tracking link.',
      )

      return
    }

    if (!isFinalPaymentReady()) {
      setPaymentError(
        'This order is not currently ready for final payment.',
      )

      return
    }

    try {
      setPaymentLoading(true)
      setPaymentError('')
      setPaymentSuccess(false)

      const response = await fetch(
        `${API_BASE_URL}/api/payments/final/create`,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            order_number:
              order.order_number,
            payment_token:
              paymentToken,
          }),
        },
      )

      const result =
        await response.json()

      if (!response.ok) {
        throw new Error(
          result?.message ||
          'Failed to create final payment.',
        )
      }

      const data =
        result?.data as
        | FinalPaymentData
        | undefined

      if (!data) {
        throw new Error(
          'Payment information was not returned by the server.',
        )
      }

      setFinalPayment(data)
      setPaymentSuccess(false)
    } catch (err) {
      console.error(
        'Create final payment error:',
        err,
      )

      setPaymentError(
        err instanceof Error
          ? err.message
          : 'Failed to create final payment.',
      )
    } finally {
      setPaymentLoading(false)
    }
  }

  const checkFinalPaymentStatus =
    async (
      paymentReference: string,
    ) => {
      if (
        !paymentReference ||
        !paymentToken
      ) {
        return
      }

      try {
        setPaymentPolling(true)

        const response = await fetch(
          `${API_BASE_URL}/api/payments/${encodeURIComponent(
            paymentReference,
          )}/status?token=${encodeURIComponent(
            paymentToken,
          )}`,
          {
            cache: 'no-store',
          },
        )

        const result =
          await response.json()

        if (!response.ok) {
          throw new Error(
            result?.message ||
            'Unable to check payment status.',
          )
        }

        const data =
          result?.data

        if (!data) {
          return
        }

        setFinalPayment(
          (current) => {
            if (!current) {
              return current
            }

            return {
              ...current,
              status:
                data.status ??
                current.status,
              expires_at:
                data.expires_at ??
                current.expires_at,
              qr_content:
                data.qr_content ??
                current.qr_content,
              qr_url:
                data.qr_url ??
                current.qr_url,
              qr_image:
                data.qr_image ??
                current.qr_image,
            }
          },
        )

        if (
          data.status === 'PAID'
        ) {
          setPaymentSuccess(true)

          await refreshOrder(
            orderNumber,
            paymentToken,
          )
        }
      } catch (err) {
        console.error(
          'Final payment status error:',
          err,
        )
      } finally {
        setPaymentPolling(false)
      }
    }

  const copyText = async (
    value: string,
    type: 'reference' | 'qr',
  ) => {
    if (!value) {
      return
    }

    try {
      await navigator.clipboard.writeText(
        value,
      )

      if (type === 'reference') {
        setCopiedReference(true)

        window.setTimeout(() => {
          setCopiedReference(false)
        }, 1800)
      }

      if (type === 'qr') {
        setCopiedQr(true)

        window.setTimeout(() => {
          setCopiedQr(false)
        }, 1800)
      }
    } catch (err) {
      console.error(
        'Copy error:',
        err,
      )
    }
  }

  useEffect(() => {
    const orderFromUrl =
      searchParams.get('order')

    const tokenFromUrl =
      searchParams.get('token')

    if (orderFromUrl) {
      setOrderNumber(
        orderFromUrl,
      )
    }

    if (tokenFromUrl) {
      setPaymentToken(
        tokenFromUrl,
      )
    }

    if (
      orderFromUrl &&
      tokenFromUrl
    ) {
      void trackOrder(
        orderFromUrl,
        tokenFromUrl,
      )
    }
  }, [])

  useEffect(() => {
    if (
      !order?.order_number ||
      !paymentToken
    ) {
      return
    }

    if (
      order.status === 'Cancelled' ||
      isFullyPaid()
    ) {
      return
    }

    const interval =
      window.setInterval(() => {
        void refreshOrder(
          order.order_number,
          paymentToken,
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
    order?.payment_status,
    order?.remaining_amount,
    order?.final_paid_at,
    paymentSummary?.final_paid,
    paymentToken,
  ])

  useEffect(() => {
    if (
      !finalPayment?.payment_reference ||
      !paymentToken ||
      finalPayment.status ===
      'PAID' ||
      finalPayment.status ===
      'FAILED'
    ) {
      return
    }

    const interval =
      window.setInterval(() => {
        void checkFinalPaymentStatus(
          finalPayment.payment_reference,
        )
      }, 5000)

    return () => {
      window.clearInterval(
        interval,
      )
    }
  }, [
    finalPayment?.payment_reference,
    finalPayment?.status,
    paymentToken,
  ])

  useEffect(() => {
    if (
      isFullyPaid() &&
      finalPayment
    ) {
      setFinalPayment(null)
      setPaymentSuccess(false)
    }
  }, [
    order?.status,
    order?.payment_status,
    order?.remaining_amount,
    order?.final_paid_at,
    paymentSummary?.final_paid,
  ])

  const getStepState = (
    step: StatusStep,
  ) => {
    if (!order) {
      return 'waiting'
    }

    if (isCancelled()) {
      return 'waiting'
    }

    if (isFullyPaid()) {
      if (
        step === 'Paid Full' ||
        step === 'Ready for Final Payment'
      ) {
        return 'completed'
      }

      return 'completed'
    }

    const currentStatus =
      order.status

    if (
      step === 'Pending'
    ) {
      if (
        currentStatus ===
        'Pending'
      ) {
        return 'current'
      }

      return 'completed'
    }

    if (
      step === 'Processing'
    ) {
      if (
        currentStatus ===
        'Processing'
      ) {
        return 'current'
      }

      if (
        currentStatus ===
        'Ready for Final Payment' ||
        currentStatus ===
        'Paid Full' ||
        currentStatus ===
        'Completed'
      ) {
        return 'completed'
      }

      return 'waiting'
    }

    if (
      step ===
      'Ready for Final Payment'
    ) {
      if (
        currentStatus ===
        'Ready for Final Payment'
      ) {
        return 'current'
      }

      if (
        currentStatus ===
        'Paid Full' ||
        isFullyPaid()
      ) {
        return 'completed'
      }

      return 'waiting'
    }

    return 'waiting'
  }

  const getStatusDescription = (
    step: StatusStep,
  ) => {
    if (
      step === 'Pending'
    ) {
      return 'Order received'
    }

    if (
      step === 'Processing'
    ) {
      return 'Being processed'
    }

    if (
      step ===
      'Ready for Final Payment'
    ) {
      return 'Final payment is available'
    }

    return 'Payment completed'
  }

  const getStatusBadgeClass = () => {
    if (!order) {
      return ''
    }

    if (isCancelled()) {
      return 'bg-red-50 text-red-600'
    }

    if (isFullyPaid()) {
      return 'bg-emerald-50 text-emerald-700'
    }

    if (
      order.status ===
      'Ready for Final Payment'
    ) {
      return 'bg-amber-50 text-amber-700'
    }

    if (
      order.status ===
      'Processing'
    ) {
      return 'bg-blue-50 text-blue-700'
    }

    return 'bg-zinc-100 text-zinc-700'
  }

  const getStatusIcon = () => {
    if (!order) {
      return null
    }

    if (isCancelled()) {
      return (
        <XCircle className="h-4 w-4" />
      )
    }

    if (isFullyPaid()) {
      return (
        <CheckCircle2 className="h-4 w-4" />
      )
    }

    return (
      <Clock3 className="h-4 w-4" />
    )
  }

  const getPaymentStatusLabel = (
    status: string,
  ) => {
    if (status === 'PAID') {
      return 'Paid'
    }

    if (
      status === 'PROCESSING'
    ) {
      return 'Processing'
    }

    if (
      status === 'FAILED'
    ) {
      return 'Failed'
    }

    return 'Pending'
  }

  const getPaymentStatusClass = (
    status: string,
  ) => {
    if (status === 'PAID') {
      return 'bg-emerald-50 text-emerald-700'
    }

    if (
      status === 'FAILED'
    ) {
      return 'bg-red-50 text-red-600'
    }

    if (
      status === 'PROCESSING'
    ) {
      return 'bg-blue-50 text-blue-700'
    }

    return 'bg-amber-50 text-amber-700'
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
            Check your order progress,
            payment status, and final
            payment balance.
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
                className="h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-12 pr-4 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-purple-400 focus:bg-white focus:ring-2 focus:ring-purple-100"
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
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-600">
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
                  className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${getStatusBadgeClass()}`}
                >
                  {getStatusIcon()}

                  {isFullyPaid()
                    ? 'Paid Full'
                    : order.status}
                </div>
              </div>

              <div className="mt-8">
                {isCancelled() ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                    <div className="flex items-start gap-3">
                      <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

                      <div>
                        <h3 className="font-semibold text-red-700">
                          Order Cancelled
                        </h3>

                        <p className="mt-1 text-sm leading-6 text-red-600">
                          This order has been
                          cancelled. Please
                          contact us if you need
                          further assistance.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-5 sm:grid-cols-4">
                    {statusSteps.map(
                      (step, index) => {
                        const state =
                          getStepState(
                            step,
                          )

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
                                    {index +
                                      1}
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

              {!isCancelled() &&
                !isFullyPaid() && (
                  <div className="mt-6 flex items-center justify-center gap-2 text-xs text-zinc-400">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />

                    <span>
                      Status updates
                      automatically
                    </span>
                  </div>
                )}
            </div>

            {/* PAYMENT SUMMARY */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
                    <WalletCards className="h-5 w-5 text-purple-600" />
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                      Order Total
                    </p>

                    <p className="mt-1 text-lg font-bold text-zinc-950">
                      {formatPrice(
                        getFinalTotal(),
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                      Paid
                    </p>

                    <p className="mt-1 text-lg font-bold text-zinc-950">
                      {formatPrice(
                        getPaidAmount(),
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`rounded-2xl border p-5 shadow-sm ${getRemainingAmount() >
                    0
                    ? 'border-amber-200 bg-amber-50/50'
                    : 'border-emerald-200 bg-emerald-50/50'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${getRemainingAmount() >
                        0
                        ? 'bg-amber-100'
                        : 'bg-emerald-100'
                      }`}
                  >
                    {getRemainingAmount() >
                      0 ? (
                      <CreditCard className="h-5 w-5 text-amber-600" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                      Remaining
                    </p>

                    <p className="mt-1 text-lg font-bold text-zinc-950">
                      {formatPrice(
                        getRemainingAmount(),
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* FINAL PAYMENT */}
            {isFinalPaymentReady() && (
              <div className="overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-sm">
                <div className="border-b border-amber-100 bg-amber-50/60 px-6 py-5 sm:px-7">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-amber-200">
                        <CreditCard className="h-5 w-5 text-amber-600" />
                      </div>

                      <div>
                        <h2 className="text-lg font-semibold text-zinc-950">
                          Final Payment
                        </h2>

                        <p className="mt-1 text-sm leading-6 text-zinc-500">
                          Your order is ready
                          for the remaining
                          payment.
                        </p>
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="text-xs uppercase tracking-wide text-zinc-400">
                        Amount Due
                      </p>

                      <p className="mt-1 text-xl font-bold text-amber-700">
                        {formatPrice(
                          getRemainingAmount(),
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 sm:p-7">
                  {!finalPayment ? (
                    <>
                      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5">
                        <div className="flex items-start gap-3">
                          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-zinc-600" />

                          <div>
                            <p className="text-sm font-semibold text-zinc-900">
                              Secure payment
                            </p>

                            <p className="mt-1 text-sm leading-6 text-zinc-500">
                              Generate your
                              DANA QRIS
                              payment code
                              for the exact
                              remaining
                              balance.
                            </p>
                          </div>
                        </div>
                      </div>

                      {paymentError && (
                        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-600">
                          {paymentError}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          void createFinalPayment()
                        }
                        disabled={
                          paymentLoading
                        }
                        className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 px-6 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {paymentLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Preparing Payment...
                          </>
                        ) : (
                          <>
                            <CreditCard className="h-4 w-4" />
                            Pay Remaining Balance
                          </>
                        )}
                      </button>
                    </>
                  ) : (
                    <div className="space-y-5">
                      {/* PAYMENT REFERENCE */}
                      <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-zinc-50 p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-zinc-400">
                            Payment Reference
                          </p>

                          <p className="mt-1 break-all font-mono text-sm font-semibold text-zinc-900">
                            {
                              finalPayment.payment_reference
                            }
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            void copyText(
                              finalPayment.payment_reference,
                              'reference',
                            )
                          }
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50"
                        >
                          <Copy className="h-4 w-4" />

                          {copiedReference
                            ? 'Copied'
                            : 'Copy'}
                        </button>
                      </div>

                      <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
                        {/* PAYMENT INFORMATION */}
                        <div className="rounded-xl border border-zinc-200 bg-white p-5">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <p className="text-xs uppercase tracking-wide text-zinc-400">
                                Payment Status
                              </p>

                              <span
                                className={`mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${getPaymentStatusClass(
                                  finalPayment.status,
                                )}`}
                              >
                                {finalPayment.status ===
                                  'PAID' ? (
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                ) : (
                                  <Clock3 className="h-3.5 w-3.5" />
                                )}

                                {getPaymentStatusLabel(
                                  finalPayment.status,
                                )}
                              </span>
                            </div>

                            <div className="text-right">
                              <p className="text-xs uppercase tracking-wide text-zinc-400">
                                Amount
                              </p>

                              <p className="mt-1 text-lg font-bold text-zinc-950">
                                {formatPrice(
                                  Number(
                                    finalPayment.amount,
                                  ),
                                )}
                              </p>
                            </div>
                          </div>

                          {finalPayment.expires_at && (
                            <div className="mt-5 border-t border-zinc-100 pt-4">
                              <p className="text-xs text-zinc-400">
                                QRIS payment
                                expires
                              </p>

                              <p className="mt-1 text-sm font-medium text-zinc-700">
                                {formatDate(
                                  finalPayment.expires_at,
                                )}
                              </p>
                            </div>
                          )}

                          {finalPayment.qr_content && (
                            <div className="mt-5 border-t border-zinc-100 pt-5">
                              <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                                QRIS Content
                              </p>

                              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                                <input
                                  readOnly
                                  value={
                                    finalPayment.qr_content
                                  }
                                  className="h-11 min-w-0 flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 font-mono text-xs text-zinc-600 outline-none"
                                />

                                <button
                                  type="button"
                                  onClick={() =>
                                    void copyText(
                                      finalPayment.qr_content ??
                                      '',
                                      'qr',
                                    )
                                  }
                                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
                                >
                                  <Copy className="h-4 w-4" />

                                  {copiedQr
                                    ? 'Copied'
                                    : 'Copy'}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* QRIS */}
                        <div className="rounded-xl border border-zinc-200 bg-white p-5">
                          {finalPayment.qr_image ||
                            finalPayment.qr_url ? (
                            <div className="flex flex-col items-center">
                              <div className="flex aspect-square w-full max-w-[220px] items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-white p-3">
                                <img
                                  src={
                                    finalPayment.qr_image ??
                                    finalPayment.qr_url ??
                                    ''
                                  }
                                  alt="DANA QRIS payment"
                                  className="h-full w-full object-contain"
                                />
                              </div>

                              <p className="mt-4 text-center text-xs leading-5 text-zinc-400">
                                Scan this QRIS
                                using your
                                supported
                                payment
                                application.
                              </p>

                              {finalPayment.qr_url && (
                                <a
                                  href={
                                    finalPayment.qr_url
                                  }
                                  target="_blank"
                                  rel="noreferrer"
                                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-purple-600 transition hover:text-purple-700"
                                >
                                  Open QR
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                              )}
                            </div>
                          ) : (
                            <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl bg-zinc-50 text-center">
                              <Loader2 className="h-7 w-7 animate-spin text-zinc-400" />

                              <p className="mt-3 text-sm font-medium text-zinc-700">
                                Preparing QRIS
                              </p>

                              <p className="mt-1 text-xs text-zinc-400">
                                Please wait...
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* PAYMENT RESULT */}
                      {paymentSuccess ||
                        finalPayment.status ===
                        'PAID' ? (
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
                          <div className="flex items-start gap-3">
                            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

                            <div>
                              <h3 className="font-semibold text-emerald-800">
                                Payment Received
                              </h3>

                              <p className="mt-1 text-sm leading-6 text-emerald-700">
                                Your final payment
                                has been
                                confirmed. Your
                                order is now fully
                                paid.
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2 text-xs text-zinc-400">
                          {paymentPolling ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Clock3 className="h-3.5 w-3.5" />
                          )}

                          <span>
                            Waiting for payment
                            confirmation...
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* FULLY PAID */}
            {isFullyPaid() && (
              <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm">
                <div className="border-b border-emerald-100 bg-emerald-50/60 px-6 py-5 sm:px-7">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-emerald-200">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    </div>

                    <div>
                      <h2 className="text-lg font-semibold text-zinc-950">
                        Order Fully Paid
                      </h2>

                      <p className="mt-1 text-sm leading-6 text-zinc-500">
                        Thank you. Your
                        payment has been
                        completed
                        successfully.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 sm:p-7">
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
                    <div className="flex items-start gap-3">
                      <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

                      <div>
                        <h3 className="font-semibold text-emerald-800">
                          Payment Completed
                        </h3>

                        <p className="mt-1 text-sm leading-6 text-emerald-700">
                          Your order has been
                          fully paid. Keep this
                          tracking link for your
                          order records.
                        </p>

                        {order.final_paid_at && (
                          <p className="mt-3 text-xs text-emerald-600">
                            Final payment received
                            on{' '}
                            {formatDate(
                              order.final_paid_at,
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

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

                  <div className="border-t border-zinc-200 pt-4">
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-sm text-zinc-500">
                        DP Paid
                      </span>

                      <span className="text-right text-sm font-semibold text-zinc-900">
                        {formatPrice(
                          getDpAmount(),
                        )}
                      </span>
                    </div>

                    {order.dp_paid_at && (
                      <p className="mt-1 text-right text-xs text-zinc-400">
                        {formatDate(
                          order.dp_paid_at,
                        )}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-sm text-zinc-500">
                        Remaining
                      </span>

                      <span
                        className={`text-right text-sm font-semibold ${getRemainingAmount() >
                            0
                            ? 'text-amber-700'
                            : 'text-emerald-700'
                          }`}
                      >
                        {formatPrice(
                          getRemainingAmount(),
                        )}
                      </span>
                    </div>

                    {order.final_paid_at && (
                      <p className="mt-1 text-right text-xs text-zinc-400">
                        Fully paid{' '}
                        {formatDate(
                          order.final_paid_at,
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* TIMELINE */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-zinc-950">
                  Order Timeline
                </h2>

                <div className="mt-6 space-y-6">
                  {/* ORDER CREATED */}
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

                  {/* DP */}
                  {order.dp_paid_at && (
                    <div className="flex gap-3">
                      <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      </div>

                      <div>
                        <p className="text-sm font-medium text-zinc-900">
                          Down Payment Received
                        </p>

                        <p className="mt-1 text-xs text-zinc-500">
                          {formatDate(
                            order.dp_paid_at,
                          )}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* PROCESSING */}
                  {(
                    order.status ===
                    'Processing' ||
                    order.status ===
                    'Ready for Final Payment' ||
                    isFullyPaid() ||
                    order.status ===
                    'Completed'
                  ) && (
                      <div className="flex gap-3">
                        <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-50">
                          <CheckCircle2 className="h-3.5 w-3.5 text-purple-600" />
                        </div>

                        <div>
                          <p className="text-sm font-medium text-zinc-900">
                            Order Processing
                          </p>

                          <p className="mt-1 text-xs text-zinc-500">
                            Your order is being
                            processed.
                          </p>
                        </div>
                      </div>
                    )}

                  {/* FINAL PAYMENT READY */}
                  {order.status ===
                    'Ready for Final Payment' &&
                    !isFullyPaid() && (
                      <div className="flex gap-3">
                        <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-50">
                          <CreditCard className="h-3.5 w-3.5 text-amber-600" />
                        </div>

                        <div>
                          <p className="text-sm font-medium text-zinc-900">
                            Final Payment Required
                          </p>

                          <p className="mt-1 text-xs leading-5 text-zinc-500">
                            The remaining balance
                            is ready for
                            payment.
                          </p>
                        </div>
                      </div>
                    )}

                  {/* FINAL PAYMENT */}
                  {order.final_paid_at && (
                    <div className="flex gap-3">
                      <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      </div>

                      <div>
                        <p className="text-sm font-medium text-zinc-900">
                          Final Payment Received
                        </p>

                        <p className="mt-1 text-xs text-zinc-500">
                          {formatDate(
                            order.final_paid_at,
                          )}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* LAST UPDATED */}
                  <div className="flex gap-3">
                    <div
                      className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${isFullyPaid()
                          ? 'bg-emerald-50'
                          : 'bg-zinc-100'
                        }`}
                    >
                      <div
                        className={`h-2.5 w-2.5 rounded-full ${isFullyPaid()
                            ? 'bg-emerald-600'
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

            {/* PAYMENT HISTORY */}
            {payments.length > 0 && (
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-7">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-zinc-950">
                      Payment History
                    </h2>

                    <p className="mt-1 text-sm text-zinc-500">
                      Payment transactions
                      associated with this
                      order.
                    </p>
                  </div>

                  <WalletCards className="h-5 w-5 text-zinc-400" />
                </div>

                <div className="mt-6 divide-y divide-zinc-100">
                  {payments.map(
                    (payment) => (
                      <div
                        key={
                          payment.payment_reference
                        }
                        className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-zinc-900">
                              {payment.payment_stage ===
                                'DP'
                                ? 'Down Payment'
                                : payment.payment_stage ===
                                  'FINAL'
                                  ? 'Final Payment'
                                  : payment.payment_stage}
                            </p>

                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${getPaymentStatusClass(
                                payment.status,
                              )}`}
                            >
                              {getPaymentStatusLabel(
                                payment.status,
                              )}
                            </span>
                          </div>

                          <p className="mt-1 font-mono text-xs text-zinc-400">
                            {
                              payment.payment_reference
                            }
                          </p>

                          <p className="mt-1 text-xs text-zinc-400">
                            {formatDate(
                              payment.paid_at ??
                              payment.created_at,
                            )}
                          </p>
                        </div>

                        <div className="text-left sm:text-right">
                          <p className="text-sm font-bold text-zinc-950">
                            {formatPrice(
                              Number(
                                payment.amount,
                              ),
                            )}
                          </p>

                          <p className="mt-1 text-xs text-zinc-400">
                            {
                              payment.payment_method
                            }
                          </p>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}

            {/* FOOTNOTE */}
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-6 py-5 text-center">
              <p className="text-sm text-zinc-500">
                Keep your secure tracking link
                available to check your order,
                payment status, and remaining
                balance.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}