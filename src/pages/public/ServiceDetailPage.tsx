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
  pricing_type?:
  | 'fixed'
  | 'starting_from'
  | 'custom_quote'
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

  const [error, setError] =
    useState('')

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

  const [
    additionalRequirements,
    setAdditionalRequirements,
  ] = useState('')

  const [formError, setFormError] =
    useState('')

  const isFixedService =
    (service?.pricing_type ?? 'fixed') ===
    'fixed'

  const isStartingFromService =
    service?.pricing_type ===
    'starting_from'

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
      import.meta.env.VITE_WHATSAPP_NUMBER ??
      '',
    )

    const phone =
      normalizeWhatsAppNumber(raw)

    if (!phone) {
      return ''
    }

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
      `Nama: ${customerName.trim() || '-'
      }`,
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

        setService({
          ...data,
          pricing_type:
            data.pricing_type ??
            'fixed',
          price:
            data.price !== null &&
              data.price !== undefined
              ? Number(data.price)
              : null,
          starting_price:
            data.starting_price !==
              null &&
              data.starting_price !==
              undefined
              ? Number(
                data.starting_price,
              )
              : null,
        })
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
                budgetRange.trim() ||
                null,
              deadline:
                deadline || null,
              reference_url:
                referenceUrl.trim() ||
                null,
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

    const checkPayment =
      async () => {
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
            setCheckingPayment(false)

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

    intervalId = window.setInterval(
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
      ? Number(
        service.starting_price,
      ) || 0
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
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-5">
        <div className="pointer-events-none absolute left-0 top-0 h-80 w-80 rounded-full bg-violet-100 blur-[110px]" />

        <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-pink-100 blur-[110px]" />

        <div className="relative w-full max-w-sm rounded-3xl border border-neutral-200 bg-white p-8 text-center shadow-[0_20px_70px_rgba(0,0,0,0.07)]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50">
            <Loader2 className="h-7 w-7 animate-spin text-violet-600" />
          </div>

          <p className="mt-5 text-lg font-bold text-neutral-950">
            Loading service
          </p>

          <p className="mt-1 text-sm text-neutral-500">
            Menyiapkan detail layanan...
          </p>
        </div>
      </div>
    )
  }

  if (error || !service) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-5">
        <div className="pointer-events-none absolute left-0 top-0 h-80 w-80 rounded-full bg-violet-100 blur-[110px]" />

        <div className="relative w-full max-w-lg rounded-3xl border border-neutral-200 bg-white p-8 text-center shadow-[0_20px_70px_rgba(0,0,0,0.07)] sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <Briefcase className="h-8 w-8" />
          </div>

          <h1 className="mt-5 text-2xl font-black text-neutral-950">
            Service tidak ditemukan
          </h1>

          <p className="mt-3 text-sm leading-6 text-neutral-500">
            {error ||
              'Layanan yang kamu cari tidak tersedia.'}
          </p>

          <Link
            to="/services"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-neutral-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Services
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      {/* =====================================================
        BACKGROUND
    ====================================================== */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-44 top-20 h-[430px] w-[430px] rounded-full bg-violet-100/70 blur-[130px]" />

        <div className="absolute -right-44 top-[35%] h-[450px] w-[450px] rounded-full bg-pink-100/60 blur-[130px]" />

        <div className="absolute bottom-[5%] left-[32%] h-[350px] w-[350px] rounded-full bg-fuchsia-100/40 blur-[120px]" />
      </div>

      {/* =====================================================
        MAIN PAGE
    ====================================================== */}
      <main className="relative mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6 sm:pb-20 sm:pt-28 lg:px-8 lg:pb-24">
        <Link
          to="/services"
          className="group mb-7 inline-flex items-center gap-2 text-sm font-medium text-neutral-500 transition hover:text-violet-700 sm:mb-9"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-white shadow-sm transition group-hover:border-violet-200 group-hover:bg-violet-50">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          </span>

          Back to Services
        </Link>

        <div className="grid items-start gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">
          {/* =================================================
            IMAGE
        ================================================== */}
          <div className="lg:sticky lg:top-28">
            <div className="relative">
              <div className="pointer-events-none absolute -inset-6 rounded-[42px] bg-violet-100/50 blur-3xl" />

              <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] border border-neutral-200 bg-neutral-100 shadow-[0_25px_80px_rgba(0,0,0,0.09)] sm:aspect-square">
                {service.image_url ? (
                  <>
                    <img
                      src={service.image_url}
                      alt={service.name}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-[1.02]"
                      onError={(event) => {
                        event.currentTarget.style.display =
                          'none'
                      }}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/70 via-neutral-950/5 to-transparent" />

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
                        backgroundSize: '38px 38px',
                      }}
                    />

                    <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-200/40 blur-3xl" />

                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex h-28 w-28 items-center justify-center rounded-[28px] border border-violet-200 bg-white/90 text-violet-600 shadow-xl backdrop-blur-md sm:h-32 sm:w-32">
                        <Briefcase className="h-14 w-14 sm:h-16 sm:w-16" />
                      </div>
                    </div>
                  </>
                )}

                <div className="absolute left-4 top-4 sm:left-5 sm:top-5">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-800 shadow-sm backdrop-blur-md">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Available
                  </span>
                </div>

                {promotion && isFixedService && (
                  <div className="absolute right-4 top-4 sm:right-5 sm:top-5">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-pink-200 bg-white/95 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-pink-700 shadow-sm backdrop-blur-md">
                      <Tag className="h-3 w-3" />
                      {getDiscountLabel()}
                    </span>
                  </div>
                )}

                <div className="absolute bottom-4 left-4 right-4 sm:bottom-5 sm:left-5 sm:right-5">
                  <div className="rounded-2xl border border-white/20 bg-neutral-950/40 p-4 backdrop-blur-md">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/65">
                      {service.category ||
                        '39Production Service'}
                    </p>

                    <p className="mt-1 text-sm font-semibold text-white sm:text-base">
                      {service.name}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
            SERVICE DETAILS
        ================================================== */}
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-violet-700 sm:text-xs">
              <Sparkles className="h-3.5 w-3.5" />
              Service
            </div>

            {service.category && (
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-violet-600 sm:text-xs">
                {service.category}
              </p>
            )}

            <h1 className="max-w-3xl text-4xl font-black leading-[1.02] tracking-[-0.045em] text-neutral-950 sm:text-5xl lg:text-6xl">
              {service.name}
            </h1>

            {/* Pricing */}
            <div className="mt-7">
              {isFixedService ? (
                <>
                  {promotion && discount > 0 && (
                    <p className="text-sm text-neutral-400 line-through sm:text-base">
                      {formatPrice(basePrice)}
                    </p>
                  )}

                  <div className="mt-1 flex flex-wrap items-center gap-3">
                    <span className="text-3xl font-black tracking-tight text-neutral-950 sm:text-4xl">
                      {formatPrice(finalPrice)}
                    </span>

                    {promotion && discount > 0 && (
                      <span className="rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700">
                        Save {formatPrice(discount)}
                      </span>
                    )}
                  </div>
                </>
              ) : isStartingFromService ? (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-700 sm:text-xs">
                    Starting Price
                  </p>

                  <span className="mt-1 block text-3xl font-black tracking-tight text-neutral-950 sm:text-4xl">
                    Mulai dari {formatPrice(startingPrice)}
                  </span>
                </div>
              ) : (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-pink-600 sm:text-xs">
                    Pricing
                  </p>

                  <span className="mt-1 block text-3xl font-black tracking-tight text-neutral-950 sm:text-4xl">
                    Custom Quote
                  </span>
                </div>
              )}
            </div>

            {/* Promotion */}
            {promotion && isFixedService && (
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
                {service.description}
              </p>
            </div>

            {/* Benefits */}
            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
              <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                  <Zap className="h-4 w-4" />
                </div>

                <p className="mt-3 text-sm font-semibold text-neutral-950">
                  Fast Process
                </p>

                <p className="mt-1 text-xs leading-5 text-neutral-500">
                  Proses kerja terstruktur
                </p>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-50 text-pink-700">
                  <ShieldCheck className="h-4 w-4" />
                </div>

                <p className="mt-3 text-sm font-semibold text-neutral-950">
                  Professional
                </p>

                <p className="mt-1 text-xs leading-5 text-neutral-500">
                  Dikerjakan secara profesional
                </p>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-fuchsia-50 text-fuchsia-700">
                  <Sparkles className="h-4 w-4" />
                </div>

                <p className="mt-3 text-sm font-semibold text-neutral-950">
                  Custom
                </p>

                <p className="mt-1 text-xs leading-5 text-neutral-500">
                  Menyesuaikan kebutuhan
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  setFormError('')
                  setCreatedOrder(null)
                  setPaymentData(null)
                  setShowCheckout(true)
                }}
                className="group inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-neutral-950 px-6 text-sm font-bold text-white shadow-[0_15px_35px_rgba(0,0,0,0.10)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-violet-600 hover:shadow-[0_18px_40px_rgba(124,58,237,0.18)]"
              >
                {needsQuote
                  ? 'Request Quote'
                  : 'Pesan Layanan'}

                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>

              <Link
                to="/services"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-6 text-sm font-semibold text-neutral-800 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
              >
                Lihat Layanan Lain
              </Link>
            </div>

            {isFixedService && (
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
                      Order number akan dibuat setelah pembayaran
                      DP berhasil diverifikasi. Sisa pembayaran
                      ditagihkan setelah project selesai.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* =====================================================
        QUOTE SUCCESS MODAL
    ====================================================== */}
      {quoteSubmitted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-neutral-950/50 p-4 backdrop-blur-sm">
          <div className="relative my-4 w-full max-w-lg overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-[0_30px_100px_rgba(0,0,0,0.20)]">
            <div className="h-1 w-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500" />

            <div className="p-6 text-center sm:p-8">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <h2 className="mt-5 text-2xl font-black text-neutral-950">
                Request Berhasil Dikirim
              </h2>

              <p className="mt-3 text-sm leading-6 text-neutral-500">
                Request kamu sudah masuk ke sistem 39Production.
                Harga final belum ditentukan. Silakan konfirmasi
                melalui WhatsApp agar admin dapat membahas kebutuhan
                project dan harga dengan kamu.
              </p>

              <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-left">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-neutral-500">
                    Request Number
                  </span>

                  <span className="font-mono text-sm font-bold text-violet-700">
                    {quoteSubmitted.quoteNumber}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between gap-4">
                  <span className="text-xs text-neutral-500">
                    Layanan
                  </span>

                  <span className="max-w-[60%] text-right text-sm font-semibold text-neutral-900">
                    {quoteSubmitted.serviceName}
                  </span>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <a
                  href={getAdminWhatsAppUrl() || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(event) => {
                    if (!getAdminWhatsAppUrl()) {
                      event.preventDefault()
                    }
                  }}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-neutral-950 px-5 text-sm font-bold text-white transition hover:bg-violet-600"
                >
                  Konfirmasi via WhatsApp

                  <ArrowRight className="h-4 w-4" />
                </a>

                <button
                  type="button"
                  onClick={() =>
                    setQuoteSubmitted(null)
                  }
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-5 text-sm font-semibold text-neutral-800 transition hover:border-violet-200 hover:bg-violet-50"
                >
                  Selesai
                </button>
              </div>

              {!getAdminWhatsAppUrl() && (
                <p className="mt-4 text-xs text-amber-600">
                  Nomor WhatsApp admin belum dikonfigurasi pada
                  environment frontend.
                </p>
              )}

              <p className="mt-5 text-xs leading-5 text-neutral-500">
                Setelah admin menentukan harga final, kamu akan
                menerima link quotation untuk melihat detail deal,
                menerima quotation, dan membayar DP.
              </p>
            </div>
          </div>
        </div>
      )}

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

          {/* =====================================================
        CHECKOUT MODAL
    ====================================================== */}
          <div className="relative mx-auto my-3 w-full max-w-2xl sm:my-6">
            <div className="overflow-hidden rounded-[1.5rem] border border-neutral-200 bg-white shadow-[0_30px_100px_rgba(0,0,0,0.20)] sm:rounded-3xl">
              {/* Accent line */}
              <div className="h-1 w-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500" />

              {/* =================================================
            MODAL CONTENT
        ================================================= */}
              <div className="max-h-[calc(100dvh-1.5rem)] overflow-y-auto overscroll-contain sm:max-h-[calc(100dvh-3rem)]">
                {/* =================================================
              HEADER
          ================================================= */}
                <div className="flex items-start justify-between gap-4 border-b border-neutral-200 bg-white p-5 sm:p-6">
                  <div className="min-w-0 pr-2">
                    <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-violet-700">
                      <Briefcase className="h-3.5 w-3.5" />

                      {needsQuote
                        ? 'Project Request'
                        : 'Checkout'}
                    </div>

                    <h2 className="text-xl font-black text-neutral-950 sm:text-2xl">
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

                    <p className="mt-1 max-w-xl text-xs leading-5 text-neutral-500 sm:text-sm">
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
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-500 transition hover:bg-neutral-50 hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-50 sm:h-10 sm:w-10"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* =================================================
              FORM
          ================================================= */}
                {!createdOrder && !paymentData ? (
                  <form
                    onSubmit={handleCheckout}
                    className="space-y-5 p-5 sm:space-y-6 sm:p-6"
                  >
                    {/* Service summary */}
                    <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-400">
                            Service
                          </p>

                          <p className="mt-1 text-sm font-bold text-neutral-950 sm:text-base">
                            {service.name}
                          </p>
                        </div>

                        <div className="shrink-0 text-right">
                          {isFixedService ? (
                            <>
                              {promotion &&
                                discount > 0 && (
                                  <p className="text-xs text-neutral-400 line-through">
                                    {formatPrice(
                                      basePrice,
                                    )}
                                  </p>
                                )}

                              <p className="text-base font-bold text-neutral-950 sm:text-lg">
                                {formatPrice(
                                  finalPrice,
                                )}
                              </p>
                            </>
                          ) : isStartingFromService ? (
                            <p className="text-right text-sm font-bold text-neutral-950 sm:text-base">
                              Mulai dari{' '}
                              {formatPrice(
                                startingPrice,
                              )}
                            </p>
                          ) : (
                            <p className="text-sm font-bold text-pink-600 sm:text-base">
                              Custom Quote
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Customer information */}
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
                          value={customerName}
                          onChange={(e) =>
                            setCustomerName(
                              e.target.value,
                            )
                          }
                          placeholder="Masukkan nama lengkap"
                          disabled={isSubmitting}
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
                          value={customerEmail}
                          onChange={(e) =>
                            setCustomerEmail(
                              e.target.value,
                            )
                          }
                          placeholder="nama@email.com"
                          disabled={isSubmitting}
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
                          value={customerPhone}
                          onChange={(e) =>
                            setCustomerPhone(
                              e.target.value,
                            )
                          }
                          placeholder="08xxxxxxxxxx"
                          disabled={isSubmitting}
                          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 disabled:opacity-50"
                        />
                      </div>
                    </div>

                    {/* Quote fields */}
                    {needsQuote && (
                      <div className="space-y-5 rounded-2xl border border-violet-200 bg-violet-50/60 p-4 sm:p-5">
                        <div>
                          <p className="text-sm font-bold text-neutral-950">
                            Detail Project
                          </p>

                          <p className="mt-1 text-xs leading-5 text-neutral-500 sm:text-sm">
                            Data ini membantu admin menghitung scope
                            dan memberikan penawaran harga yang sesuai.
                          </p>
                        </div>

                        <div>
                          <label
                            htmlFor="projectName"
                            className="mb-2 block text-sm font-semibold text-neutral-800"
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
                            disabled={isSubmitting}
                            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 disabled:opacity-50"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="projectDescription"
                            className="mb-2 block text-sm font-semibold text-neutral-800"
                          >
                            Deskripsi Project
                          </label>

                          <textarea
                            id="projectDescription"
                            value={projectDescription}
                            onChange={(e) =>
                              setProjectDescription(
                                e.target.value,
                              )
                            }
                            placeholder="Jelaskan kebutuhan, fitur, atau hasil yang diinginkan..."
                            rows={4}
                            disabled={isSubmitting}
                            className="w-full resize-none rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 disabled:opacity-50"
                          />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
                          <div>
                            <label
                              htmlFor="budgetRange"
                              className="mb-2 block text-sm font-semibold text-neutral-800"
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
                              disabled={isSubmitting}
                              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 disabled:opacity-50"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="deadline"
                              className="mb-2 block text-sm font-semibold text-neutral-800"
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
                              disabled={isSubmitting}
                              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 disabled:opacity-50"
                            />
                          </div>
                        </div>

                        <div>
                          <label
                            htmlFor="referenceUrl"
                            className="mb-2 block text-sm font-semibold text-neutral-800"
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
                            disabled={isSubmitting}
                            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 disabled:opacity-50"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="additionalRequirements"
                            className="mb-2 block text-sm font-semibold text-neutral-800"
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
                            disabled={isSubmitting}
                            className="w-full resize-none rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 disabled:opacity-50"
                          />
                        </div>
                      </div>
                    )}

                    {/* Pricing */}
                    {isFixedService ? (
                      <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                        <div className="space-y-3">
                          <div className="flex justify-between gap-4 text-sm">
                            <span className="text-neutral-500">
                              Harga layanan
                            </span>

                            <span className="font-medium text-neutral-800">
                              {formatPrice(basePrice)}
                            </span>
                          </div>

                          {discount > 0 && (
                            <div className="flex justify-between gap-4 text-sm">
                              <span className="text-pink-600">
                                Discount
                              </span>

                              <span className="font-medium text-pink-600">
                                -{formatPrice(discount)}
                              </span>
                            </div>
                          )}

                          <div className="border-t border-neutral-200 pt-3">
                            <div className="flex justify-between gap-4">
                              <span className="font-semibold text-neutral-950">
                                Total
                              </span>

                              <span className="text-xl font-black text-neutral-950">
                                {formatPrice(finalPrice)}
                              </span>
                            </div>
                          </div>

                          <div className="flex justify-between gap-4 text-sm">
                            <span className="font-medium text-violet-700">
                              DP 50%
                            </span>

                            <span className="font-bold text-violet-700">
                              {formatPrice(estimatedDp)}
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
                    ) : (
                      <div className="rounded-2xl border border-violet-200 bg-violet-50/60 p-4">
                        <p className="text-sm font-semibold text-neutral-950">
                          Harga akan ditentukan melalui Quote
                        </p>

                        <p className="mt-1 text-xs leading-5 text-neutral-500 sm:text-sm">
                          {isStartingFromService
                            ? `Layanan dimulai dari ${formatPrice(
                              startingPrice,
                            )}. Angka ini hanya harga awal, bukan harga final.`
                            : 'Admin akan menentukan harga berdasarkan scope dan kebutuhan project.'}{' '}
                          Kamu dan admin akan membahas detail serta harga
                          terlebih dahulu. Setelah deal disetujui, barulah
                          pembayaran DP dapat dilakukan.
                        </p>
                      </div>
                    )}

                    {formError && (
                      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-600">
                        {formError}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="group flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-neutral-950 px-5 text-sm font-bold text-white shadow-[0_15px_35px_rgba(0,0,0,0.10)] transition hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-60"
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

                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </button>

                    <p className="text-center text-[11px] leading-5 text-neutral-500 sm:text-xs">
                      {needsQuote
                        ? 'Setelah request dikirim, admin akan menghubungi kamu untuk membahas scope dan harga. Pembayaran belum dilakukan pada tahap ini.'
                        : 'Order number baru dibuat setelah pembayaran DP berhasil diverifikasi oleh server.'}
                    </p>
                  </form>
                ) : !createdOrder && paymentData ? (
                  /* =================================================
                     QRIS
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
                          src={paymentData.qr_image}
                          alt="DANA QRIS payment code"
                          className="mx-auto h-56 w-56 object-contain sm:h-64 sm:w-64"
                        />
                      ) : paymentData.qr_url ? (
                        <a
                          href={paymentData.qr_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mx-auto flex h-56 w-56 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 text-center text-sm font-semibold text-neutral-700 sm:h-64 sm:w-64"
                        >
                          Open DANA QRIS
                        </a>
                      ) : (
                        <div className="mx-auto flex min-h-40 max-w-sm items-center justify-center break-all rounded-xl bg-neutral-50 p-5 text-center font-mono text-xs text-neutral-700">
                          {paymentData.qr_content}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-xs leading-5 text-neutral-500 sm:text-sm">
                      <p className="font-semibold text-neutral-900">
                        Cara pembayaran
                      </p>

                      <p className="mt-1">
                        Scan QRIS menggunakan aplikasi DANA. Setelah
                        pembayaran berhasil, sistem akan memverifikasi
                        transaksi secara otomatis.
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
                      Pembayaran DP 50% sudah diverifikasi. Order sekarang
                      resmi tercatat.
                    </p>

                    <div className="mt-6 rounded-2xl border border-violet-200 bg-violet-50 p-5">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-500">
                        Order Number
                      </p>

                      <p className="mt-2 break-all font-mono text-lg font-bold tracking-wider text-violet-700 sm:text-xl">
                        {createdOrder.order_number}
                      </p>
                    </div>

                    <div className="mt-5 space-y-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 text-left">
                      <div className="flex justify-between gap-4 text-sm">
                        <span className="text-neutral-500">
                          Layanan
                        </span>

                        <span className="max-w-[60%] text-right font-medium text-neutral-900">
                          {createdOrder.product_name}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4 text-sm">
                        <span className="text-neutral-500">
                          Quantity
                        </span>

                        <span className="font-medium text-neutral-900">
                          {createdOrder.quantity}
                        </span>
                      </div>

                      {(createdOrder.discount_amount ?? 0) > 0 && (
                        <div className="flex justify-between gap-4 text-sm">
                          <span className="text-neutral-500">
                            Discount
                          </span>

                          <span className="font-medium text-pink-600">
                            -
                            {formatPrice(
                              createdOrder.discount_amount ?? 0,
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

                    <div className="mt-5 rounded-xl border border-violet-200 bg-violet-50 p-4 text-left text-xs leading-5 text-neutral-500">
                      Order akan diproses oleh admin. Setelah pekerjaan
                      selesai, admin akan menerbitkan invoice untuk sisa
                      pembayaran 50%.
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

                    <Link
                      to="/services"
                      className="mt-3 flex min-h-11 w-full items-center justify-center rounded-xl px-5 text-sm text-neutral-500 transition hover:text-neutral-900"
                    >
                      Kembali ke Services
                    </Link>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}