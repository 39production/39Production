import {
  useEffect,
  useState,
  type FormEvent,
} from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Disc3,
  Loader2,
  ShieldCheck,
  Sparkles,
  Tag,
  X,
  Zap,
} from 'lucide-react'
import { WHATSAPP_NUMBER } from '@/utils/constants'

const API_BASE_URL =
  'https://39production-api.39production.workers.dev'

interface Product {
  id: number
  name: string
  category?: string
  description: string
  price: number
  stock: number
  status: 'Published' | 'Draft'
  image_url?: string | null
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
  start_date: string
  end_date: string
  status:
  | 'Active'
  | 'Scheduled'
  | 'Expired'
  | 'Draft'
}

interface Order {
  id: number
  order_number: string
  product_id: number | null
  service_id: number | null
  customer_name: string
  customer_email?: string
  customer_phone?: string
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
  original_total?: number
  discount_amount?: number
  final_total?: number
  promotion_id?: number | null
  promotion_code?: string | null

  payment_stage?: 'DP' | 'FINAL'
  dp_percentage?: number
  dp_amount?: number
  dp_paid_at?: string | null
  paid_amount?: number
  remaining_amount?: number

  type: 'Product' | 'Service'

  status:
  | 'Pending'
  | 'Processing'
  | 'Completed'
  | 'WaitingFinalPayment'
  | 'PaidFull'
  | 'Cancelled'

  created_at: string
  updated_at: string
}

interface PaymentData {
  payment_reference: string
  partner_reference_no: string
  payment_method: 'DANA_QRIS'

  payment_stage: 'DP' | 'FINAL'

  status:
  | 'PENDING'
  | 'PROCESSING'
  | 'PAID'
  | 'FAILED'
  | 'EXPIRED'
  | 'CANCELLED'

  subtotal: number
  discount_amount: number
  final_amount: number

  dp_amount: number
  remaining_amount: number

  qr_content: string
  qr_url?: string | null
  qr_image?: string | null

  expires_at: string
}

interface PaymentStatusResponse {
  payment_reference: string

  status: PaymentData['status']

  payment_stage: string

  amount: number

  dp_amount: number

  subtotal: number

  discount_amount: number

  final_amount: number

  remaining_amount: number

  order: Order | null

  dana_status?: string | null

  expires_at: string

  paid_at?: string | null

  qr_content?: string | null

  qr_url?: string | null

  qr_image?: string | null

  warning?: string | null
}

export function ProductDetailPage() {
  const { id } = useParams<{
    id: string
  }>()

  const [product, setProduct] =
    useState<Product | null>(null)

  const [promotion, setPromotion] =
    useState<Promotion | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  const [showCheckout, setShowCheckout] =
    useState(false)

  const [isSubmitting, setIsSubmitting] =
    useState(false)

  const [createdOrder, setCreatedOrder] =
    useState<Order | null>(null)

  const [paymentData, setPaymentData] =
    useState<PaymentData | null>(null)

  const [checkingPayment, setCheckingPayment] =
    useState(false)

  const [customerName, setCustomerName] =
    useState('')

  const [customerEmail, setCustomerEmail] =
    useState('')

  const [customerPhone, setCustomerPhone] =
    useState('')

  const [quantity, setQuantity] =
    useState(1)

  const [formError, setFormError] =
    useState('')

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(Number(price) || 0)

  const isPromotionValid = (
    promo: Promotion,
  ) => {
    if (promo.status !== 'Active') {
      return false
    }

    const now = new Date()

    const start = new Date(
      promo.start_date.includes('T')
        ? promo.start_date
        : promo.start_date.replace(
          ' ',
          'T',
        ),
    )

    const end = new Date(
      promo.end_date.includes('T')
        ? promo.end_date
        : promo.end_date.replace(
          ' ',
          'T',
        ),
    )

    return now >= start && now <= end
  }

  const calculateDiscount = () => {
    if (!product || !promotion) {
      return 0
    }

    const subtotal =
      product.price * quantity

    if (
      promotion.discount_type ===
      'Percentage'
    ) {
      return Math.min(
        subtotal,
        Math.round(
          subtotal *
          (Number(
            promotion.discount_value,
          ) / 100),
        ),
      )
    }

    return Math.min(
      subtotal,
      Number(
        promotion.discount_value,
      ),
    )
  }

  const getDiscountLabel = () => {
    if (!promotion) {
      return ''
    }

    return promotion.discount_type ===
      'Percentage'
      ? `${promotion.discount_value}% OFF`
      : `${formatPrice(
        promotion.discount_value,
      )} OFF`
  }

  const normalizeWhatsAppNumber = (
    phone: string,
  ) => {
    let number = phone.replace(/\D/g, '')

    if (number.startsWith('0')) {
      number = `62${number.slice(1)}`
    }

    if (number.startsWith('8')) {
      number = `62${number}`
    }

    return number
  }

  const getTrackUrl = (
    orderNumber: string,
  ) =>
    `/track-order?order=${encodeURIComponent(
      orderNumber,
    )}`

  const getFinalPaymentUrl = (
    orderNumber: string,
  ) =>
    `/payment/${encodeURIComponent(
      orderNumber,
    )}`

  const createWhatsAppUrl = () => {
    if (!createdOrder) {
      return '#'
    }

    const destination =
      normalizeWhatsAppNumber(
        String(WHATSAPP_NUMBER ?? ''),
      )

    if (!destination) {
      return '#'
    }

    const total = Number(
      createdOrder.final_total ??
      createdOrder.total_price ??
      0,
    )

    const dpAmount = Number(
      createdOrder.dp_amount ??
      Math.ceil(total / 2),
    )

    const remainingAmount = Number(
      createdOrder.remaining_amount ??
      Math.max(
        0,
        total - dpAmount,
      ),
    )

    const trackUrl =
      `${window.location.origin}${getTrackUrl(
        createdOrder.order_number,
      )} `

    const message = [
      'Halo 39Production, saya ingin menanyakan order.',
      '',
      `Order Number: ${createdOrder.order_number} `,
      `Produk: ${createdOrder.product_name} `,
      `Nama: ${createdOrder.customer_name} `,
      `Quantity: ${createdOrder.quantity} `,
      '',
      `Total: ${formatPrice(total)} `,
      `DP 50 %: ${formatPrice(dpAmount)} `,
      `Sisa pembayaran: ${formatPrice(
        remainingAmount,
      )} `,
      '',
      `Track Order: ${trackUrl} `,
    ].join('\n')

    return `https://wa.me/${destination}?text=${encodeURIComponent(
      message,
    )}`
  }

  /**
   * =========================================================
   * FETCH PRODUCT
   * =========================================================
   */
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError(
          'ID produk tidak ditemukan.',
        )

        setLoading(false)

        return
      }

      try {
        setLoading(true)
        setError('')

        const response = await fetch(
          `${API_BASE_URL}/api/products/${encodeURIComponent(
            id,
          )}`,
          {
            cache: 'no-store',
          },
        )

        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? 'Produk tidak ditemukan.'
              : `Gagal mengambil produk (${response.status}).`,
          )
        }

        const result =
          await response.json()

        const data =
          result?.data ?? result

        if (
          !data ||
          data.status !== 'Published'
        ) {
          throw new Error(
            'Produk tidak tersedia atau sudah tidak dipublikasikan.',
          )
        }

        setProduct(data)

        if (
          Number(data.stock) <= 0
        ) {
          setQuantity(1)
        }
      } catch (err) {
        console.error(
          'Fetch product error:',
          err,
        )

        setProduct(null)

        setError(
          err instanceof Error
            ? err.message
            : 'Terjadi kesalahan saat mengambil data produk.',
        )
      } finally {
        setLoading(false)
      }
    }

    void fetchProduct()
  }, [id])

  /**
   * =========================================================
   * FETCH PROMOTION
   * =========================================================
   */
  useEffect(() => {
    const fetchPromotion = async () => {
      if (!id) {
        return
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/promotions`,
          {
            cache: 'no-store',
          },
        )

        if (!response.ok) {
          return
        }

        const result =
          await response.json()

        const promotions =
          Array.isArray(result)
            ? result
            : Array.isArray(
              result?.data,
            )
              ? result.data
              : []

        const activePromotion =
          promotions
            .filter(
              (item: Promotion) =>
                item.target_type ===
                'Product' &&
                Number(
                  item.product_id,
                ) === Number(id) &&
                isPromotionValid(item),
            )
            .sort(
              (
                a: Promotion,
                b: Promotion,
              ) => b.id - a.id,
            )[0] ?? null

        setPromotion(
          activePromotion,
        )
      } catch (err) {
        console.error(
          'Fetch promotion error:',
          err,
        )

        setPromotion(null)
      }
    }

    void fetchPromotion()
  }, [id])

  /**
   * =========================================================
   * CHECKOUT STATE
   * =========================================================
   */
  const resetCheckout = () => {
    setCustomerName('')
    setCustomerEmail('')
    setCustomerPhone('')
    setQuantity(1)
    setFormError('')
    setPaymentData(null)
    setCreatedOrder(null)
    setCheckingPayment(false)
  }

  const closeCheckout = () => {
    if (isSubmitting) {
      return
    }

    setShowCheckout(false)
    resetCheckout()
  }

  /**
   * =========================================================
   * CREATE DP PAYMENT
   * =========================================================
   */
  const handleCheckout = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    if (!product) {
      return
    }

    setFormError('')

    if (!customerName.trim()) {
      setFormError(
        'Nama wajib diisi.',
      )

      return
    }

    if (!customerEmail.trim()) {
      setFormError(
        'Email wajib diisi.',
      )

      return
    }

    if (!customerPhone.trim()) {
      setFormError(
        'Nomor WhatsApp wajib diisi.',
      )

      return
    }

    if (
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      setFormError(
        'Quantity minimal 1.',
      )

      return
    }

    if (
      Number(product.stock) <= 0
    ) {
      setFormError(
        'Produk sedang habis.',
      )

      return
    }

    if (
      quantity >
      Number(product.stock)
    ) {
      setFormError(
        `Quantity melebihi stok tersedia (${product.stock}).`,
      )

      return
    }

    try {
      setIsSubmitting(true)

      const response = await fetch(
        `${API_BASE_URL}/api/payments/create`,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({
            type: 'Product',

            product_id:
              product.id,

            service_id: null,

            customer_name:
              customerName.trim(),

            customer_email:
              customerEmail.trim(),

            customer_phone:
              customerPhone.trim(),

            quantity,
          }),
        },
      )

      const result =
        await response.json()

      if (
        !response.ok ||
        !result?.success
      ) {
        throw new Error(
          result?.message ||
          `Gagal membuat pembayaran (${response.status}).`,
        )
      }

      const payment =
        result?.data ?? result

      if (
        !payment?.payment_reference
      ) {
        throw new Error(
          'Referensi pembayaran tidak tersedia.',
        )
      }

      if (
        !payment?.qr_content &&
        !payment?.qr_url &&
        !payment?.qr_image
      ) {
        throw new Error(
          'Pembayaran berhasil dibuat tetapi data QRIS tidak tersedia.',
        )
      }

      const normalizedPayment: PaymentData =
      {
        ...payment,

        payment_stage:
          payment.payment_stage ===
            'FINAL'
            ? 'FINAL'
            : 'DP',

        subtotal: Number(
          payment.subtotal ?? 0,
        ),

        discount_amount:
          Number(
            payment.discount_amount ??
            0,
          ),

        final_amount:
          Number(
            payment.final_amount ??
            0,
          ),

        dp_amount:
          Number(
            payment.dp_amount ??
            0,
          ),

        remaining_amount:
          Number(
            payment.remaining_amount ??
            0,
          ),
      }

      setPaymentData(
        normalizedPayment,
      )
    } catch (err) {
      console.error(
        'Create payment error:',
        err,
      )

      setFormError(
        err instanceof Error
          ? err.message
          : 'Gagal membuat pembayaran.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * =========================================================
   * POLLING PAYMENT STATUS
   * =========================================================
   */
  useEffect(() => {
    if (
      !paymentData?.payment_reference ||
      createdOrder
    ) {
      return
    }

    let active = true

    let intervalId:
      | number
      | undefined

    const checkPayment =
      async () => {
        if (!active) {
          return
        }

        try {
          setCheckingPayment(true)

          const response =
            await fetch(
              `${API_BASE_URL}/api/payments/${encodeURIComponent(
                paymentData.payment_reference,
              )}/status`,
              {
                cache:
                  'no-store',
              },
            )

          const result =
            await response.json()

          if (!response.ok) {
            throw new Error(
              result?.message ||
              `Gagal mengecek pembayaran (${response.status}).`,
            )
          }

          const status =
            (result?.data ??
              result) as PaymentStatusResponse

          /**
           * Order muncul ketika DP
           * telah diverifikasi server.
           */
          if (status.order) {
            setCreatedOrder(
              status.order,
            )

            setCheckingPayment(
              false,
            )

            if (
              intervalId !==
              undefined
            ) {
              window.clearInterval(
                intervalId,
              )
            }

            return
          }

          if (
            status.status ===
            'FAILED' ||
            status.status ===
            'EXPIRED' ||
            status.status ===
            'CANCELLED'
          ) {
            setFormError(
              'Pembayaran DP belum berhasil. QRIS ini sudah tidak dapat digunakan.',
            )

            setPaymentData(null)

            setCheckingPayment(
              false,
            )

            if (
              intervalId !==
              undefined
            ) {
              window.clearInterval(
                intervalId,
              )
            }
          }
        } catch (err) {
          console.error(
            'Payment status error:',
            err,
          )
        } finally {
          if (active) {
            setCheckingPayment(
              false,
            )
          }
        }
      }

    void checkPayment()

    intervalId =
      window.setInterval(
        checkPayment,
        3000,
      )

    return () => {
      active = false

      if (
        intervalId !==
        undefined
      ) {
        window.clearInterval(
          intervalId,
        )
      }
    }
  }, [
    paymentData?.payment_reference,
    createdOrder,
  ])

  /**
   * =========================================================
   * PRICE DISPLAY
   * =========================================================
   */
  const subtotal = product
    ? product.price * quantity
    : 0

  const discount =
    calculateDiscount()

  const finalPrice = Math.max(
    0,
    subtotal - discount,
  )

  const estimatedDp =
    Math.ceil(
      finalPrice / 2,
    )

  const estimatedRemaining =
    Math.max(
      0,
      finalPrice -
      estimatedDp,
    )

  /**
   * =========================================================
   * LOADING
   * =========================================================
   */
  if (loading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg-base px-6">
        <div className="absolute left-1/4 top-1/4 h-80 w-80 rounded-full bg-brand-primary/15 blur-[120px]" />

        <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-brand-accent/10 blur-[120px]" />

        <div className="relative rounded-3xl border border-border-default bg-bg-surface/70 px-10 py-10 text-center shadow-2xl backdrop-blur-xl">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-primary/30 bg-brand-primary/10">
            <Loader2 className="h-7 w-7 animate-spin text-brand-primary" />
          </div>

          <p className="font-display text-lg font-semibold text-text-primary">
            Loading product
          </p>

          <p className="mt-1 text-sm text-text-muted">
            Menyiapkan detail produk...
          </p>
        </div>
      </div>
    )
  }

  /**
   * =========================================================
   * ERROR
   * =========================================================
   */
  if (error || !product) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg-base px-6">
        <div className="relative max-w-lg rounded-3xl border border-border-default bg-bg-surface/80 p-8 text-center shadow-2xl backdrop-blur-xl">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10">
            <Disc3 className="h-8 w-8 text-red-400" />
          </div>

          <h1 className="font-display text-2xl font-bold text-text-primary">
            Product tidak ditemukan
          </h1>

          <p className="mt-3 text-sm leading-6 text-text-muted">
            {error ||
              'Produk yang kamu cari tidak tersedia.'}
          </p>

          <Link
            to="/products"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-primary to-brand-accent px-5 py-3 text-sm font-semibold text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg-base">
      {/* =====================================================
          BACKGROUND
      ====================================================== */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-20 h-[500px] w-[500px] rounded-full bg-brand-primary/15 blur-[140px]" />

        <div className="absolute -right-32 top-[35%] h-[500px] w-[500px] rounded-full bg-brand-accent/10 blur-[140px]" />

        <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)] [background-size:48px_48px]" />
      </div>

      <main className="relative mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
        <Link
          to="/products"
          className="group mb-8 inline-flex items-center gap-2 rounded-full border border-border-default bg-bg-surface/60 px-4 py-2 text-sm text-text-muted backdrop-blur-md transition hover:border-brand-primary/40 hover:text-text-primary"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />

          Back to Products
        </Link>

        <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          {/* =================================================
              PRODUCT IMAGE
          ================================================== */}
          <div className="relative">
            <div className="absolute -inset-6 rounded-[40px] bg-brand-primary/10 blur-3xl" />

            <div className="relative aspect-square overflow-hidden rounded-[32px] border border-border-default bg-bg-surface/70 shadow-2xl backdrop-blur-xl">
              {product.image_url ? (
                <>
                  <img
                    src={
                      product.image_url
                    }
                    alt={
                      product.name
                    }
                    className="absolute inset-0 h-full w-full object-cover"
                    onError={(
                      event,
                    ) => {
                      event.currentTarget.style.display =
                        'none'
                    }}
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/5" />

                  <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/15 via-transparent to-brand-accent/15" />

                  <div
                    className="absolute inset-0 opacity-[0.06]"
                    style={{
                      backgroundImage: `
                        linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)
                      `,
                      backgroundSize:
                        '40px 40px',
                    }}
                  />
                </>
              ) : (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/20 via-bg-surface to-brand-accent/10" />

                  <div
                    className="absolute inset-0 opacity-[0.05]"
                    style={{
                      backgroundImage: `
                        linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px),
                        linear-gradient(90deg,rgba(255,255,255,0.6) 1px,transparent 1px)
                      `,
                      backgroundSize:
                        '40px 40px',
                    }}
                  />

                  <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-primary/20 blur-[100px]" />

                  <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand-primary/15" />

                  <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand-accent/10" />

                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                      <div className="absolute -inset-8 rounded-full bg-brand-primary/20 blur-2xl" />

                      <div className="relative flex h-32 w-32 items-center justify-center rounded-[32px] border border-brand-primary/30 bg-bg-elevated/80 shadow-2xl backdrop-blur-xl">
                        <Disc3 className="h-16 w-16 text-brand-primary" />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Availability */}
              <div
                className={`absolute left-5 top-5 flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold backdrop-blur-md ${Number(
                  product.stock,
                ) > 0
                    ? 'border border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
                    : 'border border-red-400/20 bg-red-400/10 text-red-300'
                  }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${Number(
                    product.stock,
                  ) > 0
                      ? 'bg-emerald-400'
                      : 'bg-red-400'
                    }`}
                />

                {Number(
                  product.stock,
                ) > 0
                  ? 'Available'
                  : 'Out of Stock'}
              </div>

              {/* Promotion */}
              {promotion && (
                <div className="absolute right-5 top-5 flex items-center gap-2 rounded-full border border-brand-accent/30 bg-brand-accent/10 px-3 py-2 text-xs font-bold text-brand-accent backdrop-blur-md">
                  <Tag className="h-3.5 w-3.5" />

                  {getDiscountLabel()}
                </div>
              )}

              {/* Image bottom info */}
              <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/10 bg-black/40 p-4 backdrop-blur-xl">
                <p className="text-xs uppercase tracking-[0.2em] text-white/60">
                  {product.category ||
                    '39Production Product'}
                </p>

                <p className="mt-1 font-display text-sm font-semibold text-white">
                  {product.name}
                </p>
              </div>
            </div>
          </div>

          {/* =================================================
              PRODUCT INFORMATION
          ================================================== */}
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-primary/20 bg-brand-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-primary">
              <Sparkles className="h-3.5 w-3.5" />

              Digital Product
            </div>

            {product.category && (
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">
                {product.category}
              </p>
            )}

            <h1 className="max-w-3xl font-display text-4xl font-black leading-[1.05] tracking-tight text-text-primary sm:text-5xl lg:text-6xl">
              {product.name}
            </h1>

            {/* Price */}
            <div className="mt-7">
              {promotion &&
                discount > 0 && (
                  <p className="text-base text-text-muted line-through">
                    {formatPrice(
                      product.price *
                      quantity,
                    )}
                  </p>
                )}

              <div className="mt-1 flex flex-wrap items-end gap-3">
                <span className="font-display text-3xl font-black text-white sm:text-4xl">
                  {formatPrice(
                    finalPrice,
                  )}
                </span>

                {promotion &&
                  discount > 0 && (
                    <span className="mb-1 rounded-full border border-brand-accent/20 bg-brand-accent/10 px-2.5 py-1 text-xs font-bold text-brand-accent">
                      Save{' '}
                      {formatPrice(
                        discount,
                      )}
                    </span>
                  )}
              </div>

              <p className="mt-2 text-xs text-text-muted">
                Stock tersedia:{' '}
                <span className="font-semibold text-text-primary">
                  {product.stock}
                </span>
              </p>
            </div>

            {/* Promotion */}
            {promotion && (
              <div className="mt-7 overflow-hidden rounded-2xl border border-brand-accent/20 bg-gradient-to-r from-brand-accent/10 via-brand-primary/5 to-transparent">
                <div className="flex items-start gap-4 p-5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-accent/10">
                    <Tag className="h-5 w-5 text-brand-accent" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wider text-brand-accent">
                      Special Promotion
                    </p>

                    <h2 className="mt-1 font-display text-base font-bold text-text-primary">
                      {
                        promotion.title
                      }
                    </h2>

                    <p className="mt-1 text-sm leading-5 text-text-muted">
                      {
                        promotion.description
                      }
                    </p>

                    <div className="mt-3 inline-flex items-center rounded-lg border border-dashed border-brand-accent/30 bg-bg-base/40 px-3 py-1.5">
                      <span className="text-xs text-text-muted">
                        Code:
                      </span>

                      <span className="ml-2 font-mono text-xs font-bold text-brand-accent">
                        {
                          promotion.code
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mt-7">
              <p className="text-base leading-7 text-text-muted">
                {
                  product.description
                }
              </p>
            </div>

            {/* Features */}
            <div className="mt-8 grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-border-default bg-bg-surface/50 p-4 backdrop-blur-md">
                <Zap className="h-5 w-5 text-brand-primary" />

                <p className="mt-3 text-xs font-semibold text-text-primary">
                  Instant Order
                </p>

                <p className="mt-1 text-[11px] leading-4 text-text-muted">
                  Proses order terstruktur
                </p>
              </div>

              <div className="rounded-2xl border border-border-default bg-bg-surface/50 p-4 backdrop-blur-md">
                <ShieldCheck className="h-5 w-5 text-brand-accent" />

                <p className="mt-3 text-xs font-semibold text-text-primary">
                  Secure Payment
                </p>

                <p className="mt-1 text-[11px] leading-4 text-text-muted">
                  Pembayaran via DANA QRIS
                </p>
              </div>

              <div className="rounded-2xl border border-border-default bg-bg-surface/50 p-4 backdrop-blur-md">
                <Sparkles className="h-5 w-5 text-purple-400" />

                <p className="mt-3 text-xs font-semibold text-text-primary">
                  Digital
                </p>

                <p className="mt-1 text-[11px] leading-4 text-text-muted">
                  Produk siap digunakan
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                disabled={
                  Number(
                    product.stock,
                  ) <= 0
                }
                onClick={() => {
                  setFormError('')
                  setCreatedOrder(
                    null,
                  )
                  setPaymentData(
                    null,
                  )
                  setQuantity(1)
                  setShowCheckout(
                    true,
                  )
                }}
                className="group inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-primary to-brand-accent px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-primary/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {Number(
                  product.stock,
                ) > 0
                  ? 'Beli Produk'
                  : 'Stok Habis'}

                {Number(
                  product.stock,
                ) > 0 && (
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  )}
              </button>

              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border-default bg-bg-surface/60 px-6 py-3.5 text-sm font-semibold text-text-primary backdrop-blur-md transition hover:border-brand-primary/30 hover:bg-bg-surface"
              >
                Lihat Produk Lain
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* =====================================================
          CHECKOUT MODAL
      ====================================================== */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-md">
          <div
            className="fixed inset-0"
            onClick={() => {
              if (!isSubmitting) {
                closeCheckout()
              }
            }}
          />

          <div className="relative my-8 w-full max-w-2xl overflow-hidden rounded-3xl border border-border-default bg-bg-surface/95 shadow-2xl backdrop-blur-2xl">
            <div className="h-1 w-full bg-gradient-to-r from-brand-primary via-purple-500 to-brand-accent" />

            <div className="flex items-start justify-between gap-5 border-b border-border-default p-6">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-brand-primary/20 bg-brand-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-primary">
                  <Disc3 className="h-3.5 w-3.5" />

                  Checkout
                </div>

                <h2 className="font-display text-2xl font-bold text-text-primary">
                  {createdOrder
                    ? 'Order Berhasil'
                    : paymentData
                      ? 'Pembayaran DP'
                      : 'Beli Produk'}
                </h2>

                <p className="mt-1 text-sm text-text-muted">
                  {createdOrder
                    ? 'Pembayaran DP telah diverifikasi.'
                    : paymentData
                      ? 'Selesaikan pembayaran DP 50% melalui DANA QRIS.'
                      : 'Isi data berikut untuk melanjutkan pembayaran DP 50%.'}
                </p>
              </div>

              <button
                type="button"
                disabled={
                  isSubmitting
                }
                onClick={
                  closeCheckout
                }
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border-default bg-bg-base/50 text-text-muted transition hover:bg-bg-elevated hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* =================================================
                CHECKOUT FORM
            ================================================== */}
            {!createdOrder && !paymentData ? (
              <form
                onSubmit={handleCheckout}
                className="space-y-6"
              >
                <div className="rounded-2xl border border-border-default bg-bg-base/50 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-wider text-text-muted">
                        Product
                      </p>

                      <p className="mt-1 truncate font-display text-base font-bold text-text-primary">
                        {
                          product.name
                        }
                      </p>
                    </div>

                    <div className="text-right">
                      {promotion &&
                        discount >
                        0 && (
                          <p className="text-xs text-text-muted line-through">
                            {formatPrice(
                              subtotal,
                            )}
                          </p>
                        )}

                      <p className="font-display text-lg font-bold text-white">
                        {formatPrice(
                          finalPrice,
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <label
                    htmlFor="quantity"
                    className="mb-2 block text-sm font-medium text-text-primary"
                  >
                    Quantity
                  </label>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={
                        isSubmitting ||
                        quantity <= 1
                      }
                      onClick={() =>
                        setQuantity(
                          (current) =>
                            Math.max(
                              1,
                              current -
                              1,
                            ),
                        )
                      }
                      className="flex h-11 w-11 items-center justify-center rounded-xl border border-border-default bg-bg-base/60 text-lg font-bold text-text-primary transition hover:border-brand-primary/30 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      −
                    </button>

                    <input
                      id="quantity"
                      type="number"
                      min={1}
                      max={product.stock}
                      value={
                        quantity
                      }
                      onChange={(
                        event,
                      ) => {
                        const value =
                          Number(
                            event
                              .target
                              .value,
                          )

                        if (
                          Number.isNaN(
                            value,
                          )
                        ) {
                          return
                        }

                        setQuantity(
                          Math.min(
                            Number(
                              product.stock,
                            ),
                            Math.max(
                              1,
                              Math.floor(
                                value,
                              ),
                            ),
                          ),
                        )
                      }}
                      disabled={
                        isSubmitting
                      }
                      className="h-11 w-24 rounded-xl border border-border-default bg-bg-base/60 px-3 text-center text-sm font-semibold text-text-primary outline-none transition focus:border-brand-primary/50 focus:ring-2 focus:ring-brand-primary/10 disabled:opacity-50"
                    />

                    <button
                      type="button"
                      disabled={
                        isSubmitting ||
                        quantity >=
                        Number(
                          product.stock,
                        )
                      }
                      onClick={() =>
                        setQuantity(
                          (current) =>
                            Math.min(
                              Number(
                                product.stock,
                              ),
                              current +
                              1,
                            ),
                        )
                      }
                      className="flex h-11 w-11 items-center justify-center rounded-xl border border-border-default bg-bg-base/60 text-lg font-bold text-text-primary transition hover:border-brand-primary/30 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      +
                    </button>

                    <span className="text-xs text-text-muted">
                      Maks.{' '}
                      {
                        product.stock
                      }
                    </span>
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="customerName"
                      className="mb-2 block text-sm font-medium text-text-primary"
                    >
                      Nama Lengkap
                    </label>

                    <input
                      id="customerName"
                      type="text"
                      value={
                        customerName
                      }
                      onChange={(
                        e,
                      ) =>
                        setCustomerName(
                          e.target
                            .value,
                        )
                      }
                      placeholder="Masukkan nama lengkap"
                      disabled={
                        isSubmitting
                      }
                      className="w-full rounded-xl border border-border-default bg-bg-base/60 px-4 py-3 text-sm text-text-primary outline-none placeholder:text-text-muted/60 transition focus:border-brand-primary/50 focus:ring-2 focus:ring-brand-primary/10 disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="customerEmail"
                      className="mb-2 block text-sm font-medium text-text-primary"
                    >
                      Email
                    </label>

                    <input
                      id="customerEmail"
                      type="email"
                      value={
                        customerEmail
                      }
                      onChange={(
                        e,
                      ) =>
                        setCustomerEmail(
                          e.target
                            .value,
                        )
                      }
                      placeholder="nama@email.com"
                      disabled={
                        isSubmitting
                      }
                      className="w-full rounded-xl border border-border-default bg-bg-base/60 px-4 py-3 text-sm text-text-primary outline-none placeholder:text-text-muted/60 transition focus:border-brand-primary/50 focus:ring-2 focus:ring-brand-primary/10 disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="customerPhone"
                      className="mb-2 block text-sm font-medium text-text-primary"
                    >
                      Nomor WhatsApp
                    </label>

                    <input
                      id="customerPhone"
                      type="tel"
                      value={
                        customerPhone
                      }
                      onChange={(
                        e,
                      ) =>
                        setCustomerPhone(
                          e.target
                            .value,
                        )
                      }
                      placeholder="08xxxxxxxxxx"
                      disabled={
                        isSubmitting
                      }
                      className="w-full rounded-xl border border-border-default bg-bg-base/60 px-4 py-3 text-sm text-text-primary outline-none placeholder:text-text-muted/60 transition focus:border-brand-primary/50 focus:ring-2 focus:ring-brand-primary/10 disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-border-default bg-bg-base/50 p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">
                        Harga produk
                      </span>

                      <span className="text-text-primary">
                        {formatPrice(
                          product.price,
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">
                        Quantity
                      </span>

                      <span className="font-medium text-text-primary">
                        {
                          quantity
                        }
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">
                        Subtotal
                      </span>

                      <span className="text-text-primary">
                        {formatPrice(
                          subtotal,
                        )}
                      </span>
                    </div>

                    {discount >
                      0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-brand-accent">
                            Discount
                          </span>

                          <span className="font-medium text-brand-accent">
                            -
                            {formatPrice(
                              discount,
                            )}
                          </span>
                        </div>
                      )}

                    <div className="border-t border-border-default pt-3">
                      <div className="flex justify-between">
                        <span className="font-semibold text-text-primary">
                          Total
                        </span>

                        <span className="font-display text-xl font-bold text-white">
                          {formatPrice(
                            finalPrice,
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-brand-primary">
                        DP 50%
                      </span>

                      <span className="font-bold text-brand-primary">
                        {formatPrice(
                          estimatedDp,
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">
                        Sisa setelah DP
                      </span>

                      <span className="font-medium text-text-primary">
                        {formatPrice(
                          estimatedRemaining,
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {formError && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {formError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    Number(
                      product.stock,
                    ) <= 0
                  }
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-primary to-brand-accent px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-primary/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />

                      Membuat Pembayaran...
                    </>
                  ) : (
                    <>
                      Pay DP 50% via DANA QRIS

                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>

                <p className="text-center text-xs leading-5 text-text-muted">
                  Order number baru dibuat
                  setelah pembayaran DP berhasil
                  diverifikasi oleh server.
                </p>
              </form>
            ) : !createdOrder && paymentData ? (
              /* =================================================
                QRIS PAYMENT
                ================================================== */
              <div className="p-6 sm:p-8">
                <div className="rounded-2xl border border-brand-primary/20 bg-brand-primary/5 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-text-muted">
                        DP 50%
                      </p>

                      <p className="mt-1 text-2xl font-black text-brand-primary">
                        {formatPrice(
                          paymentData.dp_amount,
                        )}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-text-muted">
                        Sisa pembayaran
                      </p>

                      <p className="mt-1 font-bold text-text-primary">
                        {formatPrice(
                          paymentData.remaining_amount,
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-border-default bg-white p-5">
                  {paymentData.qr_image ? (
                    <img
                      src={
                        paymentData.qr_image
                      }
                      alt="DANA QRIS payment code"
                      className="mx-auto h-64 w-64 object-contain"
                    />
                  ) : paymentData.qr_url ? (
                    <a
                      href={
                        paymentData.qr_url
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mx-auto flex h-64 w-64 items-center justify-center rounded-xl border border-slate-200 text-center text-sm font-semibold text-slate-700"
                    >
                      Open DANA QRIS
                    </a>
                  ) : (
                    <div className="mx-auto flex min-h-40 max-w-sm items-center justify-center break-all text-center font-mono text-xs text-slate-700">
                      {
                        paymentData.qr_content
                      }
                    </div>
                  )}
                </div>

                <div className="mt-4 rounded-xl border border-border-default bg-bg-base/40 p-4 text-xs leading-5 text-text-muted">
                  <p className="font-semibold text-text-primary">
                    Cara pembayaran
                  </p>

                  <p className="mt-1">
                    Scan QRIS menggunakan aplikasi
                    DANA. Setelah pembayaran
                    berhasil, sistem akan
                    memverifikasi transaksi secara
                    otomatis.
                  </p>

                  <p className="mt-2">
                    {checkingPayment
                      ? 'Sedang mengecek status pembayaran...'
                      : 'Menunggu verifikasi pembayaran...'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    void navigator.clipboard?.writeText(
                      paymentData.qr_content,
                    )
                  }
                  className="mt-4 h-11 w-full rounded-xl border border-border-default bg-bg-base/50 text-xs font-semibold text-text-primary transition hover:border-brand-primary/30"
                >
                  Copy QRIS Content
                </button>

                {formError && (
                  <div className="mt-4 rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-xs leading-5 text-red-400">
                    {formError}
                  </div>
                )}
              </div>
            ) : createdOrder ? (
              /* =================================================
                  ORDER SUCCESS
              ================================================== */
              <div className="p-6 text-center sm:p-8">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10">
                  <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                </div>

                <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">
                  DP Payment Verified
                </p>

                <h2 className="mt-2 font-display text-2xl font-bold text-text-primary">
                  Order berhasil dibuat
                </h2>

                <p className="mt-2 text-sm leading-6 text-text-muted">
                  Pembayaran DP 50% sudah
                  diverifikasi. Order sekarang
                  resmi tercatat dan dapat dipantau
                  melalui Track Order.
                </p>

                <div className="mt-7 rounded-2xl border border-brand-primary/20 bg-brand-primary/5 p-5 text-center">
                  <p className="text-xs uppercase tracking-wider text-text-muted">
                    Order Number
                  </p>

                  <p className="mt-2 break-all font-mono text-xl font-bold tracking-wider text-brand-primary">
                    {
                      createdOrder.order_number
                    }
                  </p>
                </div>

                <div className="mt-5 space-y-3 rounded-2xl border border-border-default bg-bg-base/50 p-5 text-left">
                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-text-muted">
                      Produk
                    </span>

                    <span className="max-w-[60%] text-right font-medium text-text-primary">
                      {
                        createdOrder.product_name
                      }
                    </span>
                  </div>

                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-text-muted">
                      Quantity
                    </span>

                    <span className="font-medium text-text-primary">
                      {
                        createdOrder.quantity
                      }
                    </span>
                  </div>

                  {(createdOrder.discount_amount ??
                    0) > 0 && (
                      <div className="flex justify-between gap-4 text-sm">
                        <span className="text-text-muted">
                          Discount
                        </span>

                        <span className="font-medium text-brand-accent">
                          -
                          {formatPrice(
                            createdOrder.discount_amount ??
                            0,
                          )}
                        </span>
                      </div>
                    )}

                  <div className="flex justify-between gap-4 border-t border-border-default pt-3">
                    <span className="font-semibold text-text-primary">
                      Total
                    </span>

                    <span className="font-display text-xl font-bold text-white">
                      {formatPrice(
                        createdOrder.final_total ??
                        createdOrder.total_price,
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-brand-primary">
                      DP dibayar
                    </span>

                    <span className="font-bold text-brand-primary">
                      {formatPrice(
                        createdOrder.dp_amount ??
                        Math.ceil(
                          Number(
                            createdOrder.final_total ??
                            createdOrder.total_price,
                          ) / 2,
                        ),
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-text-muted">
                      Sisa pembayaran
                    </span>

                    <span className="font-medium text-text-primary">
                      {formatPrice(
                        createdOrder.remaining_amount ??
                        Math.max(
                          0,
                          Number(
                            createdOrder.final_total ??
                            createdOrder.total_price,
                          ) -
                          Number(
                            createdOrder.dp_amount ??
                            Math.ceil(
                              Number(
                                createdOrder.final_total ??
                                createdOrder.total_price,
                              ) / 2,
                            ),
                          ),
                        ),
                      )}
                    </span>
                  </div>
                </div>

                <div className="mt-5 rounded-xl border border-brand-primary/20 bg-brand-primary/5 p-4 text-left text-xs leading-5 text-text-muted">
                  <p className="font-semibold text-text-primary">
                    Selanjutnya
                  </p>

                  <p className="mt-1">
                    Order sudah tercatat setelah
                    pembayaran DP terverifikasi.
                    Pantau status order melalui
                    Track Order.
                  </p>

                  <p className="mt-2">
                    Jika order memerlukan proses
                    pengerjaan, admin akan
                    memperbarui progress sampai
                    Ready for Final Payment.
                  </p>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <a
                    href={
                      createWhatsAppUrl()
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-primary to-brand-accent px-5 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5"
                  >
                    Hubungi via WhatsApp

                    <ArrowRight className="h-4 w-4" />
                  </a>

                  <Link
                    to={getTrackUrl(
                      createdOrder.order_number,
                    )}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-border-default bg-bg-base/50 px-5 py-3.5 text-sm font-semibold text-text-primary transition hover:border-brand-primary/30 hover:bg-bg-elevated"
                  >
                    Track Order
                  </Link>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-border-default bg-bg-base/40 px-4 py-3 text-left">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                      DP Status
                    </p>

                    <p className="mt-1 text-sm font-semibold text-emerald-400">
                      Paid
                    </p>
                  </div>

                  <div className="rounded-xl border border-border-default bg-bg-base/40 px-4 py-3 text-left">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                      Final Payment
                    </p>

                    <p className="mt-1 text-sm font-semibold text-text-muted">
                      Waiting
                    </p>
                  </div>
                </div>

                <Link
                  to="/products"
                  className="mt-3 flex w-full items-center justify-center rounded-xl px-5 py-3 text-sm text-text-muted transition hover:text-text-primary"
                >
                  Kembali ke Products
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}