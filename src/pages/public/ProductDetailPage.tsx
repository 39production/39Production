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
        String(
          WHATSAPP_NUMBER ?? '',
        ),
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
      )}`

    const message = [
      'Halo 39Production, saya ingin menanyakan order.',
      '',
      `Order Number: ${createdOrder.order_number}`,
      `Produk: ${createdOrder.product_name}`,
      `Nama: ${createdOrder.customer_name}`,
      `Quantity: ${createdOrder.quantity}`,
      '',
      `Total: ${formatPrice(total)}`,
      `DP 50%: ${formatPrice(dpAmount)}`,
      `Sisa pembayaran: ${formatPrice(
        remainingAmount,
      )}`,
      '',
      `Track Order: ${trackUrl}`,
    ].join('\n')

    return `https://wa.me/${destination}?text=${encodeURIComponent(
      message,
    )}`
  }

  /*
   * =========================================================
   * FETCH PRODUCT
   * =========================================================
   */
  useEffect(() => {
    const fetchProduct =
      async () => {
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

          const response =
            await fetch(
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

          setProduct({
            ...data,
            price: Number(
              data.price ?? 0,
            ),
            stock: Number(
              data.stock ?? 0,
            ),
          })

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

  /*
   * =========================================================
   * FETCH PROMOTION
   * =========================================================
   */
  useEffect(() => {
    const fetchPromotion =
      async () => {
        if (!id) {
          setPromotion(null)
          return
        }

        try {
          const response =
            await fetch(
              `${API_BASE_URL}/api/promotions`,
              {
                cache: 'no-store',
              },
            )

          if (!response.ok) {
            setPromotion(null)
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

  /*
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

  /*
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

      const response =
        await fetch(
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
        discount_amount: Number(
          payment.discount_amount ??
          0,
        ),
        final_amount: Number(
          payment.final_amount ??
          0,
        ),
        dp_amount: Number(
          payment.dp_amount ??
          0,
        ),
        remaining_amount: Number(
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

  /*
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
                cache: 'no-store',
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

  /*
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

  /*
   * =========================================================
   * LOADING
   * =========================================================
   */
  if (loading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-5">
        <div className="pointer-events-none absolute left-0 top-0 h-80 w-80 rounded-full bg-violet-100 blur-[110px]" />

        <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-pink-100 blur-[110px]" />

        <div className="relative w-full max-w-sm rounded-3xl border border-neutral-200 bg-white p-8 text-center shadow-[0_20px_70px_rgba(0,0,0,0.07)]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50">
            <Loader2 className="h-7 w-7 animate-spin text-violet-600" />
          </div>

          <p className="mt-5 text-lg font-bold text-neutral-950">
            Loading product
          </p>

          <p className="mt-1 text-sm text-neutral-500">
            Menyiapkan detail produk...
          </p>
        </div>
      </div>
    )
  }

  /*
   * =========================================================
   * ERROR
   * =========================================================
   */
  if (error || !product) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-5">
        <div className="pointer-events-none absolute left-0 top-0 h-80 w-80 rounded-full bg-violet-100 blur-[110px]" />

        <div className="relative w-full max-w-lg rounded-3xl border border-neutral-200 bg-white p-8 text-center shadow-[0_20px_70px_rgba(0,0,0,0.07)] sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <Disc3 className="h-8 w-8" />
          </div>

          <h1 className="mt-5 text-2xl font-black text-neutral-950">
            Product tidak ditemukan
          </h1>

          <p className="mt-3 text-sm leading-6 text-neutral-500">
            {error ||
              'Produk yang kamu cari tidak tersedia.'}
          </p>

          <Link
            to="/products"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-neutral-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <section className="relative isolate min-h-screen overflow-hidden bg-white">
      {/* =====================================================
          BACKGROUND
      ====================================================== */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-neutral-50" />

        <div className="absolute -left-56 top-20 h-[460px] w-[460px] rounded-full bg-violet-100/60 blur-[130px]" />

        <div className="absolute -right-56 top-[35%] h-[460px] w-[460px] rounded-full bg-pink-100/50 blur-[130px]" />

        <div className="absolute bottom-[5%] left-[30%] h-[360px] w-[360px] rounded-full bg-fuchsia-100/35 blur-[120px]" />
      </div>

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6 sm:pb-20 sm:pt-28 lg:px-8 lg:pb-24">
        {/* =====================================================
            BACK LINK
        ====================================================== */}
        <Link
          to="/products"
          className="group mb-7 inline-flex items-center gap-2 text-sm font-medium text-neutral-500 transition hover:text-violet-700 sm:mb-9"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-white shadow-sm transition group-hover:border-violet-200 group-hover:bg-violet-50">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          </span>

          Back to Products
        </Link>

        <div className="grid items-start gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">
          {/* =================================================
              PRODUCT IMAGE
          ================================================== */}
          <div className="lg:sticky lg:top-28">
            <div className="relative">
              <div className="pointer-events-none absolute -inset-6 rounded-[42px] bg-violet-100/50 blur-3xl" />

              <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] border border-neutral-200 bg-neutral-100 shadow-[0_25px_80px_rgba(0,0,0,0.09)] sm:aspect-square">
                {product.image_url ? (
                  <>
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-[1.02]"
                      onError={(event) => {
                        event.currentTarget.style.display =
                          'none'
                      }}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/65 via-neutral-950/5 to-transparent" />

                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-pink-500/10" />
                  </>
                ) : (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-100 via-white to-pink-100" />

                    <div
                      className="absolute inset-0 opacity-[0.05]"
                      style={{
                        backgroundImage: `
                          linear-gradient(rgba(124,58,237,0.8) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(124,58,237,0.8) 1px, transparent 1px)
                        `,
                        backgroundSize:
                          '38px 38px',
                      }}
                    />

                    <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-200/40 blur-3xl" />

                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex h-28 w-28 items-center justify-center rounded-[28px] border border-violet-200 bg-white/90 text-violet-600 shadow-xl backdrop-blur-md sm:h-32 sm:w-32">
                        <Disc3 className="h-14 w-14 sm:h-16 sm:w-16" />
                      </div>
                    </div>
                  </>
                )}

                {/* Availability */}
                <div className="absolute left-4 top-4 sm:left-5 sm:top-5">
                  <span
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] shadow-sm backdrop-blur-md ${Number(product.stock) >
                        0
                        ? 'border-white/30 bg-white/90 text-neutral-800'
                        : 'border-red-200 bg-white/90 text-red-700'
                      }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${Number(product.stock) >
                          0
                          ? 'bg-emerald-500'
                          : 'bg-red-500'
                        }`}
                    />

                    {Number(
                      product.stock,
                    ) > 0
                      ? 'Available'
                      : 'Out of Stock'}
                  </span>
                </div>

                {/* Promotion */}
                {promotion && (
                  <div className="absolute right-4 top-4 sm:right-5 sm:top-5">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-pink-200 bg-white/95 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-pink-700 shadow-sm backdrop-blur-md">
                      <Tag className="h-3 w-3" />
                      {getDiscountLabel()}
                    </span>
                  </div>
                )}

                {/* Image info */}
                <div className="absolute bottom-4 left-4 right-4 sm:bottom-5 sm:left-5 sm:right-5">
                  <div className="rounded-2xl border border-white/20 bg-neutral-950/40 p-4 backdrop-blur-md">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/65">
                      {product.category ||
                        '39Production Product'}
                    </p>

                    <p className="mt-1 text-sm font-semibold text-white sm:text-base">
                      {product.name}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              PRODUCT INFORMATION
          ================================================== */}
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-violet-700 sm:text-xs">
              <Sparkles className="h-3.5 w-3.5" />
              Digital Product
            </div>

            {product.category && (
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-violet-600 sm:text-xs">
                {product.category}
              </p>
            )}

            <h1 className="max-w-3xl text-4xl font-black leading-[1.02] tracking-[-0.045em] text-neutral-950 sm:text-5xl lg:text-6xl">
              {product.name}
            </h1>

            {/* Price */}
            <div className="mt-7">
              {promotion &&
                discount > 0 && (
                  <p className="text-sm text-neutral-400 line-through sm:text-base">
                    {formatPrice(subtotal)}
                  </p>
                )}

              <div className="mt-1 flex flex-wrap items-center gap-3">
                <span className="text-3xl font-black tracking-tight text-neutral-950 sm:text-4xl">
                  {formatPrice(
                    finalPrice,
                  )}
                </span>

                {promotion &&
                  discount > 0 && (
                    <span className="rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700">
                      Save{' '}
                      {formatPrice(
                        discount,
                      )}
                    </span>
                  )}
              </div>

              <p className="mt-2 text-xs text-neutral-500">
                Stock tersedia:{' '}
                <span className="font-semibold text-neutral-900">
                  {product.stock}
                </span>
              </p>
            </div>

            {/* Promotion */}
            {promotion && (
              <div className="mt-7 overflow-hidden rounded-2xl border border-pink-200 bg-gradient-to-r from-pink-50 via-white to-violet-50">
                <div className="flex items-start gap-3.5 p-4 sm:gap-4 sm:p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pink-100 text-pink-700 sm:h-11 sm:w-11">
                    <Tag className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-pink-700">
                      Special Promotion
                    </p>

                    <h2 className="mt-1 text-sm font-bold text-neutral-950 sm:text-base">
                      {promotion.title}
                    </h2>

                    <p className="mt-1 text-xs leading-5 text-neutral-500 sm:text-sm">
                      {promotion.description}
                    </p>

                    <div className="mt-3 inline-flex items-center rounded-lg border border-dashed border-pink-200 bg-white px-3 py-1.5">
                      <span className="text-xs text-neutral-500">
                        Code:
                      </span>

                      <span className="ml-2 font-mono text-xs font-bold text-pink-700">
                        {promotion.code}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mt-7">
              <p className="text-sm leading-7 text-neutral-600 sm:text-base sm:leading-8">
                {product.description}
              </p>
            </div>

            {/* Benefits */}
            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
              <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                  <Zap className="h-4 w-4" />
                </div>

                <p className="mt-3 text-sm font-semibold text-neutral-950">
                  Instant Order
                </p>

                <p className="mt-1 text-xs leading-5 text-neutral-500">
                  Proses order terstruktur
                </p>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-50 text-pink-700">
                  <ShieldCheck className="h-4 w-4" />
                </div>

                <p className="mt-3 text-sm font-semibold text-neutral-950">
                  Secure Payment
                </p>

                <p className="mt-1 text-xs leading-5 text-neutral-500">
                  Pembayaran via DANA QRIS
                </p>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-fuchsia-50 text-fuchsia-700">
                  <Sparkles className="h-4 w-4" />
                </div>

                <p className="mt-3 text-sm font-semibold text-neutral-950">
                  Digital
                </p>

                <p className="mt-1 text-xs leading-5 text-neutral-500">
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
                  setPaymentData(null)
                  setQuantity(1)
                  setShowCheckout(true)
                }}
                className="group inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-neutral-950 px-6 text-sm font-bold text-white shadow-[0_15px_35px_rgba(0,0,0,0.10)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-50"
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
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-6 text-sm font-semibold text-neutral-800 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
              >
                Lihat Produk Lain
              </Link>
            </div>

            {/* Payment info */}
            <div className="mt-6 rounded-2xl border border-violet-200 bg-violet-50/70 p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-violet-700 shadow-sm">
                  <ShieldCheck className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-neutral-950">
                    Pembayaran DP 50%
                  </p>

                  <p className="mt-1 text-xs leading-5 text-neutral-500 sm:text-sm">
                    Order number akan dibuat setelah pembayaran DP
                    berhasil diverifikasi. Sisa pembayaran diproses
                    sesuai status order.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* =====================================================
          CHECKOUT MODAL
      ====================================================== */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/50 p-3 backdrop-blur-sm sm:p-5">
          {/* Backdrop */}
          <div
            className="fixed inset-0"
            onClick={() => {
              if (!isSubmitting) {
                closeCheckout()
              }
            }}
          />

          {/* Modal outer */}
          <div className="relative mx-auto my-3 w-full max-w-2xl sm:my-6">
            <div className="overflow-hidden rounded-[1.5rem] border border-neutral-200 bg-white shadow-[0_30px_100px_rgba(0,0,0,0.20)] sm:rounded-3xl">
              {/* Accent */}
              <div className="h-1 w-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500" />

              {/* Single scroll area */}
              <div className="max-h-[calc(100dvh-1.5rem)] overflow-y-auto overscroll-contain sm:max-h-[calc(100dvh-3rem)]">
                {/* =================================================
                    HEADER
                ================================================== */}
                <div className="flex items-start justify-between gap-4 border-b border-neutral-200 bg-white p-5 sm:p-6">
                  <div className="min-w-0 pr-2">
                    <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-violet-700">
                      <Disc3 className="h-3.5 w-3.5" />
                      Checkout
                    </div>

                    <h2 className="text-xl font-black text-neutral-950 sm:text-2xl">
                      {createdOrder
                        ? 'Order Berhasil'
                        : paymentData
                          ? 'Pembayaran DP'
                          : 'Beli Produk'}
                    </h2>

                    <p className="mt-1 max-w-xl text-xs leading-5 text-neutral-500 sm:text-sm">
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
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-500 transition hover:bg-neutral-50 hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-50 sm:h-10 sm:w-10"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* =================================================
                    CHECKOUT FORM
                ================================================== */}
                {!createdOrder &&
                  !paymentData ? (
                  <form
                    onSubmit={
                      handleCheckout
                    }
                    className="space-y-5 p-5 sm:space-y-6 sm:p-6"
                  >
                    {/* Product summary */}
                    <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-400">
                            Product
                          </p>

                          <p className="mt-1 text-sm font-bold text-neutral-950 sm:text-base">
                            {
                              product.name
                            }
                          </p>
                        </div>

                        <div className="shrink-0 text-right">
                          {promotion &&
                            discount >
                            0 && (
                              <p className="text-xs text-neutral-400 line-through">
                                {formatPrice(
                                  subtotal,
                                )}
                              </p>
                            )}

                          <p className="text-base font-bold text-neutral-950 sm:text-lg">
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
                        className="mb-2 block text-sm font-semibold text-neutral-800"
                      >
                        Quantity
                      </label>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          disabled={
                            isSubmitting ||
                            quantity <=
                            1
                          }
                          onClick={() =>
                            setQuantity(
                              (
                                current,
                              ) =>
                                Math.max(
                                  1,
                                  current -
                                  1,
                                ),
                            )
                          }
                          className="flex h-11 w-11 items-center justify-center rounded-xl border border-neutral-200 bg-white text-lg font-bold text-neutral-900 transition hover:border-violet-200 hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          −
                        </button>

                        <input
                          id="quantity"
                          type="number"
                          min={1}
                          max={
                            product.stock
                          }
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
                          className="h-11 w-24 rounded-xl border border-neutral-200 bg-white px-3 text-center text-sm font-semibold text-neutral-900 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 disabled:opacity-50"
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
                              (
                                current,
                              ) =>
                                Math.min(
                                  Number(
                                    product.stock,
                                  ),
                                  current +
                                  1,
                                ),
                            )
                          }
                          className="flex h-11 w-11 items-center justify-center rounded-xl border border-neutral-200 bg-white text-lg font-bold text-neutral-900 transition hover:border-violet-200 hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          +
                        </button>

                        <span className="text-xs text-neutral-500">
                          Maks.{' '}
                          {
                            product.stock
                          }
                        </span>
                      </div>
                    </div>

                    {/* Customer */}
                    <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
                      <div className="sm:col-span-2">
                        <label
                          htmlFor="customerName"
                          className="mb-2 block text-sm font-semibold text-neutral-800"
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
                          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 disabled:opacity-50"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="customerEmail"
                          className="mb-2 block text-sm font-semibold text-neutral-800"
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
                          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 disabled:opacity-50"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="customerPhone"
                          className="mb-2 block text-sm font-semibold text-neutral-800"
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
                          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 disabled:opacity-50"
                        />
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between gap-4 text-sm">
                          <span className="text-neutral-500">
                            Harga produk
                          </span>

                          <span className="text-neutral-800">
                            {formatPrice(
                              product.price,
                            )}
                          </span>
                        </div>

                        <div className="flex justify-between gap-4 text-sm">
                          <span className="text-neutral-500">
                            Quantity
                          </span>

                          <span className="font-medium text-neutral-900">
                            {quantity}
                          </span>
                        </div>

                        <div className="flex justify-between gap-4 text-sm">
                          <span className="text-neutral-500">
                            Subtotal
                          </span>

                          <span className="text-neutral-800">
                            {formatPrice(
                              subtotal,
                            )}
                          </span>
                        </div>

                        {discount >
                          0 && (
                            <div className="flex justify-between gap-4 text-sm">
                              <span className="text-pink-600">
                                Discount
                              </span>

                              <span className="font-medium text-pink-600">
                                -
                                {formatPrice(
                                  discount,
                                )}
                              </span>
                            </div>
                          )}

                        <div className="border-t border-neutral-200 pt-3">
                          <div className="flex justify-between gap-4">
                            <span className="font-semibold text-neutral-950">
                              Total
                            </span>

                            <span className="text-xl font-black text-neutral-950">
                              {formatPrice(
                                finalPrice,
                              )}
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-between gap-4 text-sm">
                          <span className="font-medium text-violet-700">
                            DP 50%
                          </span>

                          <span className="font-bold text-violet-700">
                            {formatPrice(
                              estimatedDp,
                            )}
                          </span>
                        </div>

                        <div className="flex justify-between gap-4 text-sm">
                          <span className="text-neutral-500">
                            Sisa setelah DP
                          </span>

                          <span className="font-medium text-neutral-800">
                            {formatPrice(
                              estimatedRemaining,
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {formError && (
                      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-600">
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
                      className="group flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-neutral-950 px-5 text-sm font-bold text-white shadow-[0_15px_35px_rgba(0,0,0,0.10)] transition hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />

                          Membuat Pembayaran...
                        </>
                      ) : (
                        <>
                          Pay DP 50% via
                          DANA QRIS

                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </button>

                    <p className="text-center text-[11px] leading-5 text-neutral-500 sm:text-xs">
                      Order number baru dibuat setelah pembayaran
                      DP berhasil diverifikasi oleh server.
                    </p>
                  </form>
                ) : !createdOrder &&
                  paymentData ? (
                  /* =================================================
                     QRIS PAYMENT
                  ================================================== */
                  <div className="p-5 sm:p-6">
                    <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-violet-700">
                            DP 50%
                          </p>

                          <p className="mt-1 text-2xl font-black text-violet-700">
                            {formatPrice(
                              paymentData.dp_amount,
                            )}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-neutral-500">
                            Sisa pembayaran
                          </p>

                          <p className="mt-1 font-bold text-neutral-900">
                            {formatPrice(
                              paymentData.remaining_amount,
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5">
                      {paymentData.qr_image ? (
                        <img
                          src={
                            paymentData.qr_image
                          }
                          alt="DANA QRIS payment code"
                          className="mx-auto h-56 w-56 object-contain sm:h-64 sm:w-64"
                        />
                      ) : paymentData.qr_url ? (
                        <a
                          href={
                            paymentData.qr_url
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mx-auto flex h-56 w-56 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 text-center text-sm font-semibold text-neutral-700 sm:h-64 sm:w-64"
                        >
                          Open DANA QRIS
                        </a>
                      ) : (
                        <div className="mx-auto flex min-h-40 max-w-sm items-center justify-center break-all rounded-xl bg-neutral-50 p-5 text-center font-mono text-xs text-neutral-700">
                          {
                            paymentData.qr_content
                          }
                        </div>
                      )}
                    </div>

                    <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-xs leading-5 text-neutral-500 sm:text-sm">
                      <p className="font-semibold text-neutral-900">
                        Cara pembayaran
                      </p>

                      <p className="mt-1">
                        Scan QRIS menggunakan aplikasi DANA.
                        Setelah pembayaran berhasil, sistem
                        akan memverifikasi transaksi secara
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
                      className="mt-4 min-h-11 w-full rounded-xl border border-neutral-200 bg-white text-xs font-semibold text-neutral-800 transition hover:border-violet-200 hover:bg-violet-50"
                    >
                      Copy QRIS Content
                    </button>

                    {formError && (
                      <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs leading-5 text-red-600">
                        {formError}
                      </div>
                    )}
                  </div>
                ) : createdOrder ? (
                  /* =================================================
                     ORDER SUCCESS
                  ================================================== */
                  <div className="p-5 text-center sm:p-8">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>

                    <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600">
                      DP Payment Verified
                    </p>

                    <h2 className="mt-2 text-2xl font-black text-neutral-950">
                      Order berhasil dibuat
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-neutral-500">
                      Pembayaran DP 50% sudah diverifikasi.
                      Order sekarang resmi tercatat dan dapat
                      dipantau melalui Track Order.
                    </p>

                    <div className="mt-6 rounded-2xl border border-violet-200 bg-violet-50 p-5">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-500">
                        Order Number
                      </p>

                      <p className="mt-2 break-all font-mono text-lg font-bold tracking-wider text-violet-700 sm:text-xl">
                        {
                          createdOrder.order_number
                        }
                      </p>
                    </div>

                    <div className="mt-5 space-y-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 text-left">
                      <div className="flex justify-between gap-4 text-sm">
                        <span className="text-neutral-500">
                          Produk
                        </span>

                        <span className="max-w-[60%] text-right font-medium text-neutral-900">
                          {
                            createdOrder.product_name
                          }
                        </span>
                      </div>

                      <div className="flex justify-between gap-4 text-sm">
                        <span className="text-neutral-500">
                          Quantity
                        </span>

                        <span className="font-medium text-neutral-900">
                          {
                            createdOrder.quantity
                          }
                        </span>
                      </div>

                      {(createdOrder.discount_amount ??
                        0) > 0 && (
                          <div className="flex justify-between gap-4 text-sm">
                            <span className="text-neutral-500">
                              Discount
                            </span>

                            <span className="font-medium text-pink-600">
                              -
                              {formatPrice(
                                createdOrder.discount_amount ??
                                0,
                              )}
                            </span>
                          </div>
                        )}

                      <div className="flex justify-between gap-4 border-t border-neutral-200 pt-3">
                        <span className="font-semibold text-neutral-950">
                          Total
                        </span>

                        <span className="text-xl font-black text-neutral-950">
                          {formatPrice(
                            createdOrder.final_total ??
                            createdOrder.total_price,
                          )}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4 text-sm">
                        <span className="text-violet-700">
                          DP dibayar
                        </span>

                        <span className="font-bold text-violet-700">
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
                        <span className="text-neutral-500">
                          Sisa pembayaran
                        </span>

                        <span className="font-medium text-neutral-900">
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

                    <div className="mt-5 rounded-xl border border-violet-200 bg-violet-50 p-4 text-left text-xs leading-5 text-neutral-500">
                      <p className="font-semibold text-neutral-950">
                        Selanjutnya
                      </p>

                      <p className="mt-1">
                        Order sudah tercatat setelah pembayaran
                        DP terverifikasi. Pantau status order
                        melalui Track Order.
                      </p>

                      <p className="mt-2">
                        Jika order memerlukan proses pengerjaan,
                        admin akan memperbarui progress sampai
                        Ready for Final Payment.
                      </p>
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      <a
                        href={createWhatsAppUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-neutral-950 px-5 text-sm font-bold text-white transition hover:bg-violet-600"
                      >
                        Hubungi via WhatsApp

                        <ArrowRight className="h-4 w-4" />
                      </a>

                      <Link
                        to={getTrackUrl(
                          createdOrder.order_number,
                        )}
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-5 text-sm font-semibold text-neutral-800 transition hover:border-violet-200 hover:bg-violet-50"
                      >
                        Track Order
                      </Link>
                    </div>

                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-left">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                          DP Status
                        </p>

                        <p className="mt-1 text-sm font-semibold text-emerald-600">
                          Paid
                        </p>
                      </div>

                      <div className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-left">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                          Final Payment
                        </p>

                        <p className="mt-1 text-sm font-semibold text-neutral-500">
                          Waiting
                        </p>
                      </div>
                    </div>

                    <Link
                      to="/products"
                      className="mt-3 flex min-h-11 w-full items-center justify-center rounded-xl px-5 text-sm text-neutral-500 transition hover:text-neutral-900"
                    >
                      Kembali ke Products
                    </Link>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}