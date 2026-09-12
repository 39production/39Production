import {
  useEffect,
  useState,
  type FormEvent,
} from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Sparkles,
  Tag,
  X,
  Zap,
} from 'lucide-react'

const API_BASE_URL =
  'https://39production-api.39production.workers.dev'

interface Service {
  id: number
  name: string
  category?: string
  description: string
  price: number | null
  pricing_type?: 'fixed' | 'starting_from' | 'custom_quote'
  starting_price?: number | null
  status: 'Active' | 'Draft'
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
  payment_stage: 'DP'
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

export function ServiceDetailPage() {
  const { id } = useParams<{
    id: string
  }>()

  const [service, setService] =
    useState<Service | null>(null)

  const [promotion, setPromotion] =
    useState<Promotion | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] = useState('')

  const [showCheckout, setShowCheckout] =
    useState(false)

  const [quoteSubmitted, setQuoteSubmitted] =
    useState<{
      quoteNumber: string
      serviceName: string
    } | null>(null)

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

  // Project/request fields for non-fixed services.
  // These are collected first; pricing is decided later by admin
  // after the customer and admin negotiate the scope.
  const [projectName, setProjectName] =
    useState('')

  const [projectDescription, setProjectDescription] =
    useState('')

  const [budgetRange, setBudgetRange] =
    useState('')

  const [deadline, setDeadline] =
    useState('')

  const [referenceUrl, setReferenceUrl] =
    useState('')

  const [additionalRequirements, setAdditionalRequirements] =
    useState('')

  const [formError, setFormError] =
    useState('')

  const isFixedService =
    (service?.pricing_type ?? 'fixed') === 'fixed'

  const isStartingFromService =
    service?.pricing_type === 'starting_from'

  const needsQuote = !isFixedService

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
    if (
      !service ||
      !promotion ||
      !isFixedService
    ) {
      return 0
    }

    const basePrice =
      Number(service.price) || 0

    if (
      promotion.discount_type ===
      'Percentage'
    ) {
      return Math.min(
        basePrice,
        Math.round(
          basePrice *
          (Number(
            promotion.discount_value,
          ) / 100),
        ),
      )
    }

    return Math.min(
      basePrice,
      Number(promotion.discount_value),
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

  const createWhatsAppUrl = () => {
    if (!createdOrder) {
      return '#'
    }

    const phone =
      normalizeWhatsAppNumber(
        customerPhone,
      )

    const total = Number(
      createdOrder.final_total ??
      createdOrder.total_price,
    )

    const message = [
      'Halo 39Production, saya ingin menanyakan order.',
      '',
      `Order Number: ${createdOrder.order_number}`,
      `Layanan: ${createdOrder.product_name}`,
      `Nama: ${createdOrder.customer_name}`,
      `Total: ${formatPrice(total)}`,
      '',
      `Track Order: ${window.location.origin}${getTrackUrl(
        createdOrder.order_number,
      )}`,
    ].join('\n')

    return `https://wa.me/${phone}?text=${encodeURIComponent(
      message,
    )}`
  }

  const getAdminWhatsAppUrl = () => {
    const raw = String(
      import.meta.env.VITE_WHATSAPP_NUMBER ?? '',
    )

    const phone =
      normalizeWhatsAppNumber(raw)

    if (!phone) return ''

    const message = [
      'Halo Admin 39Production,',
      '',
      'Saya baru saja mengirim request quotation melalui website.',
      '',
      `Request Number: ${quoteSubmitted?.quoteNumber ?? '-'
      }`,
      `Layanan: ${quoteSubmitted?.serviceName ??
      service?.name ??
      '-'
      }`,
      `Nama: ${customerName.trim() || '-'}`,
      '',
      'Saya ingin mengonfirmasi request tersebut dan melanjutkan pembahasan scope serta harga.',
    ].join('\n')

    return `https://wa.me/${phone}?text=${encodeURIComponent(
      message,
    )}`
  }

  useEffect(() => {
    const fetchService = async () => {
      if (!id) {
        setError(
          'ID layanan tidak ditemukan.',
        )
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError('')

        const response = await fetch(
          `${API_BASE_URL}/api/services/${id}`,
          {
            cache: 'no-store',
          },
        )

        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? 'Layanan tidak ditemukan.'
              : `Gagal mengambil layanan (${response.status}).`,
          )
        }

        const result =
          await response.json()

        const data =
          result?.data ?? result

        if (
          !data ||
          data.status !== 'Active'
        ) {
          throw new Error(
            'Layanan tidak tersedia atau sudah tidak aktif.',
          )
        }

        setService(data)
      } catch (err) {
        console.error(
          'Fetch service error:',
          err,
        )

        setService(null)

        setError(
          err instanceof Error
            ? err.message
            : 'Terjadi kesalahan saat mengambil data layanan.',
        )
      } finally {
        setLoading(false)
      }
    }

    void fetchService()
  }, [id])

  useEffect(() => {
    const fetchPromotion = async () => {
      if (
        !id ||
        !service ||
        !isFixedService
      ) {
        setPromotion(null)
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
            : Array.isArray(result?.data)
              ? result.data
              : []

        const activePromotion =
          promotions
            .filter(
              (item: Promotion) =>
                item.target_type ===
                'Service' &&
                Number(item.service_id) ===
                Number(id) &&
                isPromotionValid(item),
            )
            .sort(
              (
                a: Promotion,
                b: Promotion,
              ) => b.id - a.id,
            )[0] ?? null

        setPromotion(activePromotion)
      } catch (err) {
        console.error(
          'Fetch promotion error:',
          err,
        )

        setPromotion(null)
      }
    }

    void fetchPromotion()
  }, [
    id,
    service,
    isFixedService,
  ])

  const resetCheckout = () => {
    setQuoteSubmitted(null)
    setCustomerName('')
    setCustomerEmail('')
    setCustomerPhone('')
    setFormError('')
    setPaymentData(null)
    setCreatedOrder(null)
    setCheckingPayment(false)
    setProjectName('')
    setProjectDescription('')
    setBudgetRange('')
    setDeadline('')
    setReferenceUrl('')
    setAdditionalRequirements('')
  }

  const closeCheckout = () => {
    if (isSubmitting) {
      return
    }

    setShowCheckout(false)
    resetCheckout()
  }

  const handleCheckout = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    if (!service) {
      return
    }

    setFormError('')

    if (!customerName.trim()) {
      return setFormError(
        'Nama wajib diisi.',
      )
    }

    if (!customerEmail.trim()) {
      return setFormError(
        'Email wajib diisi.',
      )
    }

    if (!customerPhone.trim()) {
      return setFormError(
        'Nomor WhatsApp wajib diisi.',
      )
    }

    if (needsQuote) {
      if (!projectName.trim()) {
        return setFormError(
          'Nama project wajib diisi.',
        )
      }

      if (!projectDescription.trim()) {
        return setFormError(
          'Deskripsi project wajib diisi.',
        )
      }
    }

    try {
      setIsSubmitting(true)

      if (needsQuote) {
        const response = await fetch(
          `${API_BASE_URL}/api/quotes`,
          {
            method: 'POST',
            headers: {
              'Content-Type':
                'application/json',
            },
            body: JSON.stringify({
              service_id: service.id,
              customer_name:
                customerName.trim(),
              customer_email:
                customerEmail.trim(),
              customer_phone:
                customerPhone.trim(),
              project_name:
                projectName.trim(),
              project_description:
                projectDescription.trim(),
              budget_range:
                budgetRange.trim() || null,
              deadline:
                deadline || null,
              reference_url:
                referenceUrl.trim() || null,
              additional_requirements:
                additionalRequirements.trim() ||
                null,
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
            `Gagal mengirim request quote (${response.status}).`,
          )
        }

        const quote =
          result?.data ?? result

        // Request quotation hanya membuat request awal.
        // Customer BELUM boleh masuk QuotePage karena harga final
        // belum ditentukan dan belum ada deal dengan admin.
        setShowCheckout(false)
        setQuoteSubmitted({
          quoteNumber: String(
            quote?.quote_number ??
            'REQUEST',
          ),
          serviceName: service.name,
        })
        return
      }

      const response = await fetch(
        `${API_BASE_URL}/api/payments/create`,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            type: 'Service',
            product_id: null,
            service_id: service.id,
            customer_name:
              customerName.trim(),
            customer_email:
              customerEmail.trim(),
            customer_phone:
              customerPhone.trim(),
            quantity: 1,
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
        !payment?.payment_reference ||
        !payment?.qr_content
      ) {
        throw new Error(
          'Pembayaran berhasil dibuat tetapi data QRIS tidak tersedia.',
        )
      }

      setPaymentData(
        payment as PaymentData,
      )
    } catch (err) {
      console.error(
        needsQuote
          ? 'Create quote error:'
          : 'Create payment error:',
        err,
      )

      setFormError(
        err instanceof Error
          ? err.message
          : needsQuote
            ? 'Gagal mengirim request quote.'
            : 'Gagal membuat pembayaran.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

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

    const checkPayment = async () => {
      if (!active) {
        return
      }

      try {
        setCheckingPayment(true)

        const response = await fetch(
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

          setCheckingPayment(false)

          if (
            intervalId !== undefined
          ) {
            window.clearInterval(
              intervalId,
            )
          }

          return
        }

        if (
          status.status === 'FAILED' ||
          status.status === 'EXPIRED' ||
          status.status === 'CANCELLED'
        ) {
          setFormError(
            'Pembayaran DP belum berhasil. QRIS ini sudah tidak dapat digunakan.',
          )

          setPaymentData(null)
          setCheckingPayment(false)

          if (
            intervalId !== undefined
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
          setCheckingPayment(false)
        }
      }
    }

    void checkPayment()

    intervalId = window.setInterval(
      checkPayment,
      3000,
    )

    return () => {
      active = false

      if (
        intervalId !== undefined
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

  // `service` is guaranteed to exist below the loading/error guards.
  // Keep all pricing calculations null-safe so an in-flight render can
  // never crash the component if the service state is temporarily null.
  const discount =
    service && isFixedService
      ? calculateDiscount()
      : 0

  const basePrice =
    service && isFixedService
      ? Number(service.price) || 0
      : 0

  const finalPrice = isFixedService
    ? Math.max(
      0,
      basePrice - discount,
    )
    : 0

  const startingPrice =
    service && isStartingFromService
      ? Number(service.starting_price) ||
      0
      : 0

  const estimatedDp =
    Math.ceil(finalPrice / 2)

  const estimatedRemaining =
    Math.max(
      0,
      finalPrice - estimatedDp,
    )

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
            Loading service
          </p>

          <p className="mt-1 text-sm text-text-muted">
            Menyiapkan detail layanan...
          </p>
        </div>
      </div>
    )
  }

  if (error || !service) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg-base px-6">
        <div className="relative max-w-lg rounded-3xl border border-border-default bg-bg-surface/80 p-8 text-center shadow-2xl backdrop-blur-xl">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10">
            <Briefcase className="h-8 w-8 text-red-400" />
          </div>

          <h1 className="font-display text-2xl font-bold text-text-primary">
            Service tidak ditemukan
          </h1>

          <p className="mt-3 text-sm leading-6 text-text-muted">
            {error ||
              'Layanan yang kamu cari tidak tersedia.'}
          </p>

          <Link
            to="/services"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-primary to-brand-accent px-5 py-3 text-sm font-semibold text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Services
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
          to="/services"
          className="group mb-8 inline-flex items-center gap-2 rounded-full border border-border-default bg-bg-surface/60 px-4 py-2 text-sm text-text-muted backdrop-blur-md transition hover:border-brand-primary/40 hover:text-text-primary"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Services
        </Link>

        <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          {/* =================================================
              SERVICE IMAGE
          ================================================== */}
          <div className="relative">
            <div className="absolute -inset-6 rounded-[40px] bg-brand-primary/10 blur-3xl" />

            <div className="relative aspect-square overflow-hidden rounded-[32px] border border-border-default bg-bg-surface/70 shadow-2xl backdrop-blur-xl">
              {service.image_url ? (
                <>
                  <img
                    src={service.image_url}
                    alt={service.name}
                    className="absolute inset-0 h-full w-full object-cover"
                    onError={(event) => {
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
                        <Briefcase className="h-16 w-16 text-brand-primary" />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Availability */}
              <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-300 backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Available
              </div>

              {/* Promotion */}
              {promotion &&
                isFixedService && (
                  <div className="absolute right-5 top-5 flex items-center gap-2 rounded-full border border-brand-accent/30 bg-brand-accent/10 px-3 py-2 text-xs font-bold text-brand-accent backdrop-blur-md">
                    <Tag className="h-3.5 w-3.5" />
                    {getDiscountLabel()}
                  </div>
                )}

              {/* Image bottom info */}
              <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/10 bg-black/40 p-4 backdrop-blur-xl">
                <p className="text-xs uppercase tracking-[0.2em] text-white/60">
                  {service.category ||
                    '39Production Service'}
                </p>

                <p className="mt-1 font-display text-sm font-semibold text-white">
                  {service.name}
                </p>
              </div>
            </div>
          </div>

          {/* =================================================
              SERVICE INFORMATION
          ================================================== */}
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-primary/20 bg-brand-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Service
            </div>

            {service.category && (
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">
                {service.category}
              </p>
            )}

            <h1 className="max-w-3xl font-display text-4xl font-black leading-[1.05] tracking-tight text-text-primary sm:text-5xl lg:text-6xl">
              {service.name}
            </h1>

            {/* Price */}
            <div className="mt-7">
              {isFixedService ? (
                <>
                  {promotion &&
                    discount > 0 && (
                      <p className="text-base text-text-muted line-through">
                        {formatPrice(
                          basePrice,
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
                </>
              ) : isStartingFromService ? (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                    Starting Price
                  </p>

                  <span className="mt-1 block font-display text-3xl font-black text-white sm:text-4xl">
                    Mulai dari{' '}
                    {formatPrice(
                      startingPrice,
                    )}
                  </span>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                    Pricing
                  </p>

                  <span className="mt-1 block font-display text-3xl font-black text-white sm:text-4xl">
                    Custom Quote
                  </span>
                </div>
              )}
            </div>

            {/* Promotion */}
            {promotion &&
              isFixedService && (
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
                        {promotion.title}
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
                          {promotion.code}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            {/* Description */}
            <div className="mt-7">
              <p className="text-base leading-7 text-text-muted">
                {service.description}
              </p>
            </div>

            {/* Features */}
            <div className="mt-8 grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-border-default bg-bg-surface/50 p-4 backdrop-blur-md">
                <Zap className="h-5 w-5 text-brand-primary" />

                <p className="mt-3 text-xs font-semibold text-text-primary">
                  Fast Process
                </p>

                <p className="mt-1 text-[11px] leading-4 text-text-muted">
                  Proses kerja terstruktur
                </p>
              </div>

              <div className="rounded-2xl border border-border-default bg-bg-surface/50 p-4 backdrop-blur-md">
                <ShieldCheck className="h-5 w-5 text-brand-accent" />

                <p className="mt-3 text-xs font-semibold text-text-primary">
                  Professional
                </p>

                <p className="mt-1 text-[11px] leading-4 text-text-muted">
                  Dikerjakan secara profesional
                </p>
              </div>

              <div className="rounded-2xl border border-border-default bg-bg-surface/50 p-4 backdrop-blur-md">
                <Sparkles className="h-5 w-5 text-purple-400" />

                <p className="mt-3 text-xs font-semibold text-text-primary">
                  Custom
                </p>

                <p className="mt-1 text-[11px] leading-4 text-text-muted">
                  Menyesuaikan kebutuhan
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  setFormError('')
                  setCreatedOrder(null)
                  setPaymentData(null)
                  setShowCheckout(true)
                }}
                className="group inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-primary to-brand-accent px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-primary/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-primary/30"
              >
                {needsQuote
                  ? 'Request Quote'
                  : 'Pesan Layanan'}

                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>

              <Link
                to="/services"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border-default bg-bg-surface/60 px-6 py-3.5 text-sm font-semibold text-text-primary backdrop-blur-md transition hover:border-brand-primary/30 hover:bg-bg-surface"
              >
                Lihat Layanan Lain
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* =====================================================
          CHECKOUT MODAL
      ====================================================== */}
      {quoteSubmitted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-border-default bg-bg-surface/95 shadow-2xl backdrop-blur-2xl">
            <div className="h-1 w-full bg-gradient-to-r from-brand-primary via-purple-500 to-brand-accent" />

            <div className="p-7 text-center sm:p-8">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10">
                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
              </div>

              <h2 className="mt-5 font-display text-2xl font-bold text-text-primary">
                Request Berhasil Dikirim
              </h2>

              <p className="mt-3 text-sm leading-6 text-text-muted">
                Request kamu sudah masuk ke sistem 39Production. Harga final belum ditentukan.
                Silakan konfirmasi melalui WhatsApp agar admin dapat membahas kebutuhan project dan harga dengan kamu.
              </p>

              <div className="mt-5 rounded-2xl border border-border-default bg-bg-base/50 p-4 text-left">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-text-muted">
                    Request Number
                  </span>

                  <span className="font-mono text-sm font-bold text-brand-primary">
                    {quoteSubmitted.quoteNumber}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between gap-4">
                  <span className="text-xs text-text-muted">
                    Layanan
                  </span>

                  <span className="text-right text-sm font-semibold text-text-primary">
                    {quoteSubmitted.serviceName}
                  </span>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <a
                  href={
                    getAdminWhatsAppUrl() || '#'
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(event) => {
                    if (
                      !getAdminWhatsAppUrl()
                    ) {
                      event.preventDefault()
                    }
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-primary to-brand-accent px-5 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5"
                >
                  Konfirmasi via WhatsApp

                  <ArrowRight className="h-4 w-4" />
                </a>

                <button
                  type="button"
                  onClick={() =>
                    setQuoteSubmitted(null)
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-border-default bg-bg-base/50 px-5 py-3.5 text-sm font-semibold text-text-primary transition hover:border-brand-primary/30 hover:bg-bg-elevated"
                >
                  Selesai
                </button>
              </div>

              {!getAdminWhatsAppUrl() && (
                <p className="mt-4 text-xs text-amber-300">
                  Nomor WhatsApp admin belum dikonfigurasi pada environment frontend.
                </p>
              )}

              <p className="mt-5 text-xs leading-5 text-text-muted">
                Setelah admin menentukan harga final, kamu akan menerima link quotation untuk melihat detail deal, menerima quotation, dan membayar DP.
              </p>
            </div>
          </div>
        </div>
      )}

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
                  <Briefcase className="h-3.5 w-3.5" />

                  {needsQuote
                    ? 'Project Request'
                    : 'Checkout'}
                </div>

                <h2 className="font-display text-2xl font-bold text-text-primary">
                  {createdOrder
                    ? 'Order Berhasil'
                    : paymentData
                      ? 'Pembayaran DP'
                      : needsQuote
                        ? isStartingFromService
                          ? 'Request Project'
                          : 'Request Quote'
                        : 'Pesan Layanan'}
                </h2>

                <p className="mt-1 text-sm text-text-muted">
                  {createdOrder
                    ? 'Pembayaran DP telah diverifikasi.'
                    : paymentData
                      ? 'Selesaikan pembayaran DP 50% melalui DANA QRIS.'
                      : needsQuote
                        ? 'Kirim kebutuhan project terlebih dahulu. Harga final akan dibahas dengan admin sebelum pembayaran.'
                        : 'Isi data berikut untuk melanjutkan pembayaran DP 50%.'}
                </p>
              </div>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={closeCheckout}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border-default bg-bg-base/50 text-text-muted transition hover:bg-bg-elevated hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
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
                onSubmit={handleCheckout}
                className="space-y-6 p-6"
              >
                <div className="rounded-2xl border border-border-default bg-bg-base/50 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-wider text-text-muted">
                        Service
                      </p>

                      <p className="mt-1 truncate font-display text-base font-bold text-text-primary">
                        {service.name}
                      </p>
                    </div>

                    <div className="text-right">
                      {isFixedService ? (
                        <>
                          {promotion &&
                            discount > 0 && (
                              <p className="text-xs text-text-muted line-through">
                                {formatPrice(
                                  basePrice,
                                )}
                              </p>
                            )}

                          <p className="font-display text-lg font-bold text-white">
                            {formatPrice(
                              finalPrice,
                            )}
                          </p>
                        </>
                      ) : isStartingFromService ? (
                        <p className="font-display text-lg font-bold text-white">
                          Mulai dari{' '}
                          {formatPrice(
                            startingPrice,
                          )}
                        </p>
                      ) : (
                        <p className="font-display text-lg font-bold text-white">
                          Custom Quote
                        </p>
                      )}
                    </div>
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
                      value={customerName}
                      onChange={(e) =>
                        setCustomerName(
                          e.target.value,
                        )
                      }
                      placeholder="Masukkan nama lengkap"
                      disabled={isSubmitting}
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
                      value={customerEmail}
                      onChange={(e) =>
                        setCustomerEmail(
                          e.target.value,
                        )
                      }
                      placeholder="nama@email.com"
                      disabled={isSubmitting}
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
                      value={customerPhone}
                      onChange={(e) =>
                        setCustomerPhone(
                          e.target.value,
                        )
                      }
                      placeholder="08xxxxxxxxxx"
                      disabled={isSubmitting}
                      className="w-full rounded-xl border border-border-default bg-bg-base/60 px-4 py-3 text-sm text-text-primary outline-none placeholder:text-text-muted/60 transition focus:border-brand-primary/50 focus:ring-2 focus:ring-brand-primary/10 disabled:opacity-50"
                    />
                  </div>

                  {needsQuote && (
                    <div className="sm:col-span-2 space-y-5 rounded-2xl border border-brand-primary/20 bg-brand-primary/5 p-4">
                      <div>
                        <p className="text-sm font-bold text-text-primary">
                          Detail Project
                        </p>

                        <p className="mt-1 text-xs leading-5 text-text-muted">
                          Data ini membantu admin menghitung scope dan memberikan penawaran harga yang sesuai.
                        </p>
                      </div>

                      <div>
                        <label
                          htmlFor="projectName"
                          className="mb-2 block text-sm font-medium text-text-primary"
                        >
                          Nama Project
                        </label>

                        <input
                          id="projectName"
                          type="text"
                          value={projectName}
                          onChange={(e) =>
                            setProjectName(
                              e.target.value,
                            )
                          }
                          placeholder="Contoh: Website Company Profile"
                          disabled={
                            isSubmitting
                          }
                          className="w-full rounded-xl border border-border-default bg-bg-base/60 px-4 py-3 text-sm text-text-primary outline-none placeholder:text-text-muted/60 transition focus:border-brand-primary/50 focus:ring-2 focus:ring-brand-primary/10 disabled:opacity-50"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="projectDescription"
                          className="mb-2 block text-sm font-medium text-text-primary"
                        >
                          Deskripsi Project
                        </label>

                        <textarea
                          id="projectDescription"
                          value={
                            projectDescription
                          }
                          onChange={(e) =>
                            setProjectDescription(
                              e.target.value,
                            )
                          }
                          placeholder="Jelaskan kebutuhan, fitur, atau hasil yang diinginkan..."
                          rows={4}
                          disabled={
                            isSubmitting
                          }
                          className="w-full resize-none rounded-xl border border-border-default bg-bg-base/60 px-4 py-3 text-sm text-text-primary outline-none placeholder:text-text-muted/60 transition focus:border-brand-primary/50 focus:ring-2 focus:ring-brand-primary/10 disabled:opacity-50"
                        />
                      </div>

                      <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                          <label
                            htmlFor="budgetRange"
                            className="mb-2 block text-sm font-medium text-text-primary"
                          >
                            Budget
                          </label>

                          <input
                            id="budgetRange"
                            type="text"
                            value={budgetRange}
                            onChange={(e) =>
                              setBudgetRange(
                                e.target.value,
                              )
                            }
                            placeholder="Contoh: Rp3–5 juta"
                            disabled={
                              isSubmitting
                            }
                            className="w-full rounded-xl border border-border-default bg-bg-base/60 px-4 py-3 text-sm text-text-primary outline-none placeholder:text-text-muted/60 transition focus:border-brand-primary/50 focus:ring-2 focus:ring-brand-primary/10 disabled:opacity-50"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="deadline"
                            className="mb-2 block text-sm font-medium text-text-primary"
                          >
                            Target Deadline
                          </label>

                          <input
                            id="deadline"
                            type="date"
                            value={deadline}
                            onChange={(e) =>
                              setDeadline(
                                e.target.value,
                              )
                            }
                            disabled={
                              isSubmitting
                            }
                            className="w-full rounded-xl border border-border-default bg-bg-base/60 px-4 py-3 text-sm text-text-primary outline-none transition focus:border-brand-primary/50 focus:ring-2 focus:ring-brand-primary/10 disabled:opacity-50"
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="referenceUrl"
                          className="mb-2 block text-sm font-medium text-text-primary"
                        >
                          Reference URL
                        </label>

                        <input
                          id="referenceUrl"
                          type="url"
                          value={referenceUrl}
                          onChange={(e) =>
                            setReferenceUrl(
                              e.target.value,
                            )
                          }
                          placeholder="https://..."
                          disabled={
                            isSubmitting
                          }
                          className="w-full rounded-xl border border-border-default bg-bg-base/60 px-4 py-3 text-sm text-text-primary outline-none placeholder:text-text-muted/60 transition focus:border-brand-primary/50 focus:ring-2 focus:ring-brand-primary/10 disabled:opacity-50"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="additionalRequirements"
                          className="mb-2 block text-sm font-medium text-text-primary"
                        >
                          Kebutuhan Tambahan
                        </label>

                        <textarea
                          id="additionalRequirements"
                          value={
                            additionalRequirements
                          }
                          onChange={(e) =>
                            setAdditionalRequirements(
                              e.target.value,
                            )
                          }
                          placeholder="Tambahkan catatan atau kebutuhan khusus (opsional)..."
                          rows={3}
                          disabled={
                            isSubmitting
                          }
                          className="w-full resize-none rounded-xl border border-border-default bg-bg-base/60 px-4 py-3 text-sm text-text-primary outline-none placeholder:text-text-muted/60 transition focus:border-brand-primary/50 focus:ring-2 focus:ring-brand-primary/10 disabled:opacity-50"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {isFixedService ? (
                  <div className="rounded-2xl border border-border-default bg-bg-base/50 p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-text-muted">
                          Harga layanan
                        </span>

                        <span className="text-text-primary">
                          {formatPrice(
                            basePrice,
                          )}
                        </span>
                      </div>

                      {discount > 0 && (
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
                ) : (
                  <div className="rounded-2xl border border-brand-primary/20 bg-brand-primary/5 p-4">
                    <p className="text-sm font-semibold text-text-primary">
                      Harga akan ditentukan melalui Quote
                    </p>

                    <p className="mt-1 text-xs leading-5 text-text-muted">
                      {isStartingFromService
                        ? `Layanan dimulai dari ${formatPrice(startingPrice)}. Angka ini hanya harga awal, bukan harga final.`
                        : 'Admin akan menentukan harga berdasarkan scope dan kebutuhan project.'}
                      {' '}
                      Kamu dan admin akan membahas detail serta harga terlebih dahulu. Setelah deal disetujui, barulah pembayaran DP dapat dilakukan.
                    </p>
                  </div>
                )}

                {formError && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {formError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-primary to-brand-accent px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-primary/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />

                      {needsQuote
                        ? 'Mengirim Request Quote...'
                        : 'Membuat Pembayaran...'}
                    </>
                  ) : (
                    <>
                      {needsQuote
                        ? 'Kirim Request Quote'
                        : 'Pay DP 50% via DANA QRIS'}

                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>

                <p className="text-center text-xs leading-5 text-text-muted">
                  {needsQuote
                    ? 'Setelah request dikirim, admin akan menghubungi kamu untuk membahas scope dan harga. Pembayaran belum dilakukan pada tahap ini.'
                    : 'Order number baru dibuat setelah pembayaran DP berhasil diverifikasi oleh server.'}
                </p>
              </form>
            ) : !createdOrder &&
              paymentData ? (
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
                  resmi tercatat.
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
                      Layanan
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
                        (Number(
                          createdOrder.final_total ??
                          createdOrder.total_price,
                        ) -
                          (createdOrder.dp_amount ??
                            Math.ceil(
                              Number(
                                createdOrder.final_total ??
                                createdOrder.total_price,
                              ) / 2,
                            ))),
                      )}
                    </span>
                  </div>
                </div>

                <div className="mt-5 rounded-xl border border-brand-primary/20 bg-brand-primary/5 p-4 text-left text-xs leading-5 text-text-muted">
                  Order akan diproses oleh admin.
                  Setelah pekerjaan selesai, admin
                  akan menerbitkan invoice untuk sisa
                  pembayaran 50%.
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <a
                    href={createWhatsAppUrl()}
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

                <Link
                  to="/services"
                  className="mt-3 flex w-full items-center justify-center rounded-xl px-5 py-3 text-sm text-text-muted transition hover:text-text-primary"
                >
                  Kembali ke Services
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}