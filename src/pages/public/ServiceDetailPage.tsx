import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  CheckCircle2,
  Loader2,
  MoveUpRight,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
  X,
  Zap,
} from 'lucide-react'

const API_BASE_URL =
  'https://39production-api.39production.workers.dev'

type ServicePricingType =
  | 'fixed'
  | 'starting_from'
  | 'custom_quote'

interface Service {
  id: number
  name: string
  category?: string
  description: string
  price: number | null
  pricing_type: ServicePricingType
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

interface Testimonial {
  id: number
  customer_name: string
  company?: string | null
  rating: number
  message: string
  status?: 'Pending' | 'Published' | 'Rejected'
  created_at?: string
  updated_at?: string
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

const categoryColors: Record<string, string> = {
  Development:
    'border-violet-200 bg-violet-50 text-violet-700',
  Design:
    'border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700',
  Multimedia:
    'border-indigo-200 bg-indigo-50 text-indigo-700',
  Entertainment:
    'border-violet-200 bg-violet-50 text-violet-700',
  Creative:
    'border-purple-200 bg-purple-50 text-purple-700',
}

function formatPrice(price: number | null | undefined) {
  if (
    price === null ||
    price === undefined ||
    Number.isNaN(Number(price))
  ) {
    return null
  }

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(price))
}

function normalizePricingType(
  pricingType: unknown,
  price: unknown,
): ServicePricingType {
  if (
    pricingType === 'fixed' ||
    pricingType === 'starting_from' ||
    pricingType === 'custom_quote'
  ) {
    return pricingType
  }

  return price !== null && price !== undefined
    ? 'fixed'
    : 'custom_quote'
}

function isPromotionValid(
  promotion: Promotion,
) {
  if (promotion.status !== 'Active') {
    return false
  }

  const now = new Date()

  const start = new Date(
    promotion.start_date.includes('T')
      ? promotion.start_date
      : promotion.start_date.replace(' ', 'T'),
  )

  const end = new Date(
    promotion.end_date.includes('T')
      ? promotion.end_date
      : promotion.end_date.replace(' ', 'T'),
  )

  return now >= start && now <= end
}

function getDiscountLabel(
  promotion: Promotion,
) {
  if (promotion.discount_type === 'Percentage') {
    return `${promotion.discount_value}% OFF`
  }

  return `${formatPrice(
    promotion.discount_value,
  )} OFF`
}

function calculateDiscount(
  service: Service,
  promotion: Promotion | null,
) {
  if (
    !promotion ||
    service.pricing_type !== 'fixed' ||
    service.price === null
  ) {
    return 0
  }

  const basePrice = Number(service.price) || 0

  if (
    promotion.discount_type ===
    'Percentage'
  ) {
    return Math.min(
      basePrice,
      Math.round(
        basePrice *
        (Number(promotion.discount_value) /
          100),
      ),
    )
  }

  return Math.min(
    basePrice,
    Number(promotion.discount_value),
  )
}

function getPricingLabel(
  service: Service,
) {
  switch (service.pricing_type) {
    case 'starting_from':
      return 'Starting From'
    case 'custom_quote':
      return 'Custom Quote'
    default:
      return 'Fixed Price'
  }
}

function getPricingText(
  service: Service,
) {
  switch (service.pricing_type) {
    case 'starting_from':
      return (
        formatPrice(service.starting_price) ??
        'Discuss your needs'
      )

    case 'custom_quote':
      return 'Let’s discuss'

    default:
      return (
        formatPrice(service.price) ??
        'Contact us'
      )
  }
}

export function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>()

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

  const [testimonials, setTestimonials] =
    useState<Testimonial[]>([])

  const [testimonialsLoading, setTestimonialsLoading] =
    useState(true)

  const isFixedService =
    (service?.pricing_type ?? 'fixed') ===
    'fixed'

  const isStartingFromService =
    service?.pricing_type ===
    'starting_from'

  const needsQuote = !isFixedService

  const discount = useMemo(() => {
    if (!service) {
      return 0
    }

    return calculateDiscount(
      service,
      promotion,
    )
  }, [service, promotion])

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
      ? Number(service.starting_price) || 0
      : 0

  const estimatedDp =
    Math.ceil(finalPrice / 2)

  const estimatedRemaining =
    Math.max(
      0,
      finalPrice - estimatedDp,
    )

  const categoryClass =
    categoryColors[
    service?.category ?? ''
    ] ??
    'border-zinc-200 bg-zinc-50 text-zinc-600'

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
      `Request Number: ${quoteSubmitted?.quoteNumber ??
      '-'
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
    let mounted = true

    async function fetchService() {
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

        if (!mounted) {
          return
        }

        setService({
          ...data,
          pricing_type:
            normalizePricingType(
              data.pricing_type,
              data.price,
            ),
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

        if (!mounted) {
          return
        }

        setService(null)

        setError(
          err instanceof Error
            ? err.message
            : 'Terjadi kesalahan saat mengambil data layanan.',
        )
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    void fetchService()

    return () => {
      mounted = false
    }
  }, [id])

  useEffect(() => {
    if (
      !id ||
      !service ||
      !isFixedService
    ) {
      setPromotion(null)
      return
    }

    let mounted = true

    async function fetchPromotion() {
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

        const promotions: Promotion[] =
          Array.isArray(result)
            ? result
            : Array.isArray(result?.data)
              ? result.data
              : []

        const activePromotion =
          promotions
            .filter(
              (item) =>
                item.target_type ===
                'Service' &&
                Number(item.service_id) ===
                Number(id) &&
                isPromotionValid(item),
            )
            .sort(
              (a, b) => b.id - a.id,
            )[0] ?? null

        if (mounted) {
          setPromotion(
            activePromotion,
          )
        }
      } catch (err) {
        console.error(
          'Fetch promotion error:',
          err,
        )

        if (mounted) {
          setPromotion(null)
        }
      }
    }

    void fetchPromotion()

    return () => {
      mounted = false
    }
  }, [
    id,
    service,
    isFixedService,
  ])

  useEffect(() => {
    let mounted = true

    async function fetchTestimonials() {
      try {
        setTestimonialsLoading(true)

        const response = await fetch(
          `${API_BASE_URL}/api/testimonials`,
          {
            cache: 'no-store',
          },
        )

        if (!response.ok) {
          throw new Error(
            `Failed to fetch testimonials (${response.status})`,
          )
        }

        const result = await response.json()

        const data = Array.isArray(result)
          ? result
          : Array.isArray(result?.data)
            ? result.data
            : []

        const publishedTestimonials = data
          .filter(
            (item: Testimonial) =>
              item.status === undefined ||
              item.status === 'Published',
          )
          .map((item: Testimonial) => ({
            ...item,
            rating: Math.min(
              5,
              Math.max(
                1,
                Number(item.rating) || 5,
              ),
            ),
          }))

        if (!mounted) {
          return
        }

        setTestimonials(publishedTestimonials)
      } catch (err) {
        console.error(
          'Fetch testimonials error:',
          err,
        )

        if (mounted) {
          setTestimonials([])
        }
      } finally {
        if (mounted) {
          setTestimonialsLoading(false)
        }
      }
    }

    void fetchTestimonials()

    return () => {
      mounted = false
    }
  }, [])

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

    if (needsQuote) {
      if (!projectName.trim()) {
        setFormError(
          'Nama project wajib diisi.',
        )
        return
      }

      if (
        !projectDescription.trim()
      ) {
        setFormError(
          'Deskripsi project wajib diisi.',
        )
        return
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
          serviceName:
            service.name,
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

  if (loading) {
    return (
      <section className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-white text-zinc-950">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(24,24,27,0.035) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(24,24,27,0.035) 1px, transparent 1px)
            `,
            backgroundSize: '72px 72px',
          }}
        />

        <div className="relative w-full max-w-md px-6">
          <div className="border-y border-black/10 py-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center border border-violet-200 bg-violet-50 text-violet-600">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>

            <p className="mt-5 text-[10px] font-black uppercase tracking-[0.22em] text-violet-600">
              39Production / Services
            </p>

            <h1 className="mt-2 text-2xl font-black tracking-[-0.04em]">
              Loading service
            </h1>

            <p className="mt-2 text-sm text-zinc-500">
              Menyiapkan detail layanan...
            </p>
          </div>
        </div>
      </section>
    )
  }

  if (error || !service) {
    return (
      <section className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-white px-5 text-zinc-950">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(24,24,27,0.035) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(24,24,27,0.035) 1px, transparent 1px)
            `,
            backgroundSize: '72px 72px',
          }}
        />

        <div className="relative w-full max-w-xl border border-black/10 bg-white p-8 text-center sm:p-12">
          <div className="mx-auto flex h-14 w-14 items-center justify-center border border-red-200 bg-red-50 text-red-600">
            <Briefcase className="h-6 w-6" />
          </div>

          <p className="mt-6 text-[10px] font-black uppercase tracking-[0.2em] text-violet-600">
            39Production / Services
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-[-0.045em]">
            Service tidak ditemukan
          </h1>

          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-zinc-500">
            {error ||
              'Layanan yang kamu cari tidak tersedia.'}
          </p>

          <Link
            to="/services"
            className="mt-8 inline-flex items-center gap-3 border border-black bg-black px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white transition hover:border-violet-600 hover:bg-violet-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Services
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="relative isolate min-h-screen overflow-hidden bg-white text-zinc-950">
      {/* =====================================================
          BACKGROUND
      ====================================================== */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-70"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(24,24,27,0.035) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(24,24,27,0.035) 1px, transparent 1px)
          `,
          backgroundSize: '72px 72px',
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[8%] top-[17%] h-2 w-2 rounded-full bg-violet-600"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[12%] top-[42%] h-1.5 w-1.5 rounded-full bg-violet-500"
      />

      <main className="relative mx-auto max-w-[1600px] px-5 pb-20 pt-28 sm:px-8 sm:pt-32 lg:px-12 lg:pb-28 lg:pt-20">
        {/* =====================================================
            TOP LINE
        ====================================================== */}

        <div className="mb-10 flex items-center justify-between border-b border-black/10 pb-5 sm:mb-14">
          <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.24em] text-zinc-500 sm:text-xs">
            <span className="text-zinc-950">
              39Production
            </span>

            <span className="h-1 w-1 rounded-full bg-violet-600" />

            <Link
              to="/services"
              className="transition hover:text-violet-600"
            >
              Services
            </Link>

            <span className="text-zinc-300">
              /
            </span>

            <span className="hidden text-zinc-400 sm:inline">
              Detail
            </span>
          </div>

          <div className="hidden items-center gap-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400 sm:flex">
            <span>Digital</span>
            <span>/</span>
            <span>Creative</span>
            <span>/</span>
            <span>Entertainment</span>
          </div>
        </div>

        {/* =====================================================
            BACK
        ====================================================== */}

        <Link
          to="/services"
          className="group mb-10 inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500 transition hover:text-violet-600 sm:mb-14"
        >
          <span className="flex h-8 w-8 items-center justify-center border border-black/10 bg-white transition group-hover:border-violet-300 group-hover:bg-violet-50">
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
          </span>

          Back to Services
        </Link>

        {/* =====================================================
            HERO DETAIL
        ====================================================== */}

        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          {/* IMAGE */}

          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="relative">
              <div className="absolute -left-4 top-8 hidden h-px w-20 bg-violet-600 lg:block" />

              <div className="relative aspect-[4/3] overflow-hidden border border-black/10 bg-zinc-100 shadow-[0_25px_70px_rgba(0,0,0,0.08)] sm:aspect-[5/4]">
                {service.image_url ? (
                  <>
                    <img
                      src={service.image_url}
                      alt={service.name}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-[1.025]"
                      onError={(event) => {
                        event.currentTarget.style.display = 'none'
                      }}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />

                    <div className="absolute left-5 top-5 border border-white/25 bg-black/70 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-white backdrop-blur-sm">
                      39Production
                    </div>

                    <div className="absolute bottom-5 left-5 right-5">
                      <div className="border-l-2 border-violet-500 pl-4">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60">
                          Service
                        </p>

                        <p className="mt-1 text-lg font-black tracking-[-0.025em] text-white sm:text-xl">
                          {service.name}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="absolute inset-0 bg-zinc-50" />

                    <div
                      className="absolute inset-0 opacity-[0.055]"
                      style={{
                        backgroundImage: `
                          linear-gradient(rgba(124,58,237,1) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(124,58,237,1) 1px, transparent 1px)
                        `,
                        backgroundSize: '60px 60px',
                      }}
                    />

                    <div className="absolute right-8 top-8 text-[11rem] font-black leading-none tracking-[-0.12em] text-zinc-200">
                      39
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex h-28 w-28 items-center justify-center border border-violet-200 bg-white text-violet-600 shadow-xl sm:h-36 sm:w-36">
                        <Briefcase className="h-12 w-12 sm:h-16 sm:w-16" />
                      </div>
                    </div>

                    <div className="absolute bottom-6 left-6">
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-violet-600">
                        39Production Service
                      </p>

                      <p className="mt-1 text-xl font-black tracking-[-0.04em]">
                        {service.name}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Image metadata */}

              <div className="mt-4 grid grid-cols-2 border-y border-black/10">
                <div className="border-r border-black/10 px-4 py-4">
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-400">
                    Category
                  </p>

                  <p className="mt-1 text-sm font-bold text-zinc-950">
                    {service.category ||
                      'Creative Service'}
                  </p>
                </div>

                <div className="px-4 py-4">
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-400">
                    Availability
                  </p>

                  <div className="mt-1 flex items-center gap-2 text-sm font-bold text-zinc-950">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Available
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CONTENT */}

          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`border px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.17em] ${categoryClass}`}
              >
                {service.category ||
                  '39Production'}
              </span>

              <span className="border border-black/10 bg-white px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.17em] text-zinc-500">
                {getPricingLabel(service)}
              </span>
            </div>

            <div className="mt-7">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-violet-600">
                01 / Service Detail
              </p>

              <h1 className="mt-4 max-w-4xl text-[clamp(3rem,7vw,7rem)] font-black leading-[0.86] tracking-[-0.07em]">
                {service.name}
              </h1>
            </div>

            {/* PRICE */}

            <div className="mt-10 border-y border-black/10 py-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">
                    {promotion &&
                      isFixedService &&
                      discount > 0
                      ? 'Current Offer'
                      : getPricingLabel(
                        service,
                      )}
                  </p>

                  {isFixedService ? (
                    <div className="mt-2 flex flex-wrap items-baseline gap-3">
                      <span className="text-3xl font-black tracking-[-0.04em] text-violet-600 sm:text-4xl">
                        {formatPrice(
                          finalPrice,
                        )}
                      </span>

                      {promotion &&
                        discount > 0 && (
                          <span className="text-sm text-zinc-400 line-through">
                            {formatPrice(
                              basePrice,
                            )}
                          </span>
                        )}
                    </div>
                  ) : isStartingFromService ? (
                    <div className="mt-2">
                      <span className="text-3xl font-black tracking-[-0.04em] text-zinc-950 sm:text-4xl">
                        Mulai dari{' '}
                        {formatPrice(
                          startingPrice,
                        )}
                      </span>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <span className="text-3xl font-black tracking-[-0.04em] text-zinc-950 sm:text-4xl">
                        Custom Quote
                      </span>
                    </div>
                  )}
                </div>

                {promotion &&
                  isFixedService && (
                    <div className="flex items-center gap-2 border border-violet-200 bg-violet-50 px-3 py-2 text-violet-700">
                      <Tag className="h-3.5 w-3.5" />

                      <span className="text-[9px] font-black uppercase tracking-[0.16em]">
                        {getDiscountLabel(
                          promotion,
                        )}
                      </span>
                    </div>
                  )}
              </div>
            </div>

            {/* PROMOTION */}

            {promotion &&
              isFixedService && (
                <div className="mt-8 border border-violet-200 bg-violet-50">
                  <div className="grid sm:grid-cols-[auto_1fr_auto]">
                    <div className="flex items-center justify-center bg-violet-600 p-5 text-white">
                      <Tag className="h-5 w-5" />
                    </div>

                    <div className="p-5">
                      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-violet-700">
                        Special Promotion
                      </p>

                      <h2 className="mt-1 text-base font-black tracking-tight text-zinc-950">
                        {promotion.title}
                      </h2>

                      <p className="mt-1 text-xs leading-5 text-zinc-600 sm:text-sm">
                        {promotion.description}
                      </p>
                    </div>

                    <div className="flex items-center border-t border-violet-200 px-5 py-4 sm:border-l sm:border-t-0">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.16em] text-zinc-400">
                          Code
                        </p>

                        <p className="mt-1 font-mono text-sm font-black text-violet-700">
                          {promotion.code}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            {/* DESCRIPTION */}

            <div className="mt-10">
              <div className="mb-4 flex items-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-600">
                  02
                </span>

                <span className="h-px w-10 bg-violet-600" />

                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                  Overview
                </span>
              </div>

              <p className="max-w-3xl text-base leading-8 text-zinc-600 sm:text-lg">
                {service.description}
              </p>
            </div>

            {/* VALUE */}

            <div className="mt-12">
              <div className="mb-5 flex items-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-600">
                  03
                </span>

                <span className="h-px w-10 bg-violet-600" />

                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                  Why Work With Us
                </span>
              </div>

              <div className="grid border-l border-t border-black/10 sm:grid-cols-3">
                <div className="border-b border-r border-black/10 p-5">
                  <div className="flex h-10 w-10 items-center justify-center border border-violet-200 bg-violet-50 text-violet-600">
                    <Zap className="h-4 w-4" />
                  </div>

                  <p className="mt-5 text-sm font-black tracking-tight">
                    Structured Process
                  </p>

                  <p className="mt-2 text-xs leading-5 text-zinc-500">
                    Proses kerja dirancang
                    dengan alur yang jelas
                    dari awal hingga
                    delivery.
                  </p>
                </div>

                <div className="border-b border-r border-black/10 p-5">
                  <div className="flex h-10 w-10 items-center justify-center border border-violet-200 bg-violet-50 text-violet-600">
                    <ShieldCheck className="h-4 w-4" />
                  </div>

                  <p className="mt-5 text-sm font-black tracking-tight">
                    Professional
                  </p>

                  <p className="mt-2 text-xs leading-5 text-zinc-500">
                    Dikerjakan dengan
                    standar produksi
                    profesional dan
                    komunikasi yang jelas.
                  </p>
                </div>

                <div className="border-b border-r border-black/10 p-5">
                  <div className="flex h-10 w-10 items-center justify-center border border-violet-200 bg-violet-50 text-violet-600">
                    <Sparkles className="h-4 w-4" />
                  </div>

                  <p className="mt-5 text-sm font-black tracking-tight">
                    Tailored
                  </p>

                  <p className="mt-2 text-xs leading-5 text-zinc-500">
                    Pendekatan disesuaikan
                    dengan kebutuhan dan
                    tujuan project.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}

            <div className="mt-12 border-t border-black/10 pt-7">
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    setFormError('')
                    setCreatedOrder(null)
                    setPaymentData(null)
                    setShowCheckout(true)
                  }}
                  className="group inline-flex min-h-13 flex-1 items-center justify-between border border-black bg-black px-5 text-xs font-black uppercase tracking-[0.15em] text-white transition-all duration-300 hover:border-violet-600 hover:bg-violet-600"
                >
                  <span>
                    {needsQuote
                      ? 'Request Quote'
                      : 'Pesan Layanan'}
                  </span>

                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </button>

                <Link
                  to="/services"
                  className="inline-flex min-h-13 items-center justify-center gap-3 border border-black/10 bg-white px-6 text-xs font-black uppercase tracking-[0.15em] text-zinc-700 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700"
                >
                  Other Services
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {isFixedService && (
                <div className="mt-5 flex items-start gap-3 border-l-2 border-violet-600 bg-violet-50/60 p-4">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />

                  <div>
                    <p className="text-xs font-black text-zinc-950">
                      DP 50% untuk memulai
                    </p>

                    <p className="mt-1 text-[11px] leading-5 text-zinc-500">
                      Order number dibuat setelah
                      pembayaran DP berhasil
                      diverifikasi. Sisa pembayaran
                      akan ditagihkan setelah project
                      selesai.
                    </p>
                  </div>
                </div>
              )}

              {needsQuote && (
                <div className="mt-5 border border-black/10 bg-zinc-50 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.17em] text-violet-600">
                    Pricing Note
                  </p>

                  <p className="mt-1 text-xs leading-5 text-zinc-500">
                    {isStartingFromService
                      ? `Layanan dimulai dari ${formatPrice(
                        startingPrice,
                      )}. Harga tersebut merupakan harga awal dan bukan harga final.`
                      : 'Harga ditentukan berdasarkan scope, kebutuhan, kompleksitas, dan hasil yang ingin dicapai.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* =====================================================
            TESTIMONIALS
        ====================================================== */}

        {!testimonialsLoading && testimonials.length > 0 && (
          <section className="mt-20 border-t border-black/10 pt-12 sm:mt-28 sm:pt-16">
            <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-600">
                    04
                  </span>

                  <span className="h-px w-10 bg-violet-600" />

                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                    Client Stories
                  </span>
                </div>

                <h2 className="mt-5 max-w-md text-3xl font-black tracking-[-0.05em] sm:text-4xl">
                  What clients say about working with us.
                </h2>

                <p className="mt-4 max-w-md text-sm leading-6 text-zinc-500">
                  Pengalaman dari client yang telah bekerja bersama 39Production.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {testimonials.slice(0, 4).map((testimonial) => (
                  <article
                    key={testimonial.id}
                    className="border border-black/10 bg-white p-5 transition hover:border-violet-200 hover:shadow-[0_18px_50px_rgba(0,0,0,0.06)]"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-1" aria-label={`${testimonial.rating} dari 5 bintang`}>
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star
                            key={index}
                            className={`h-3.5 w-3.5 ${index < testimonial.rating
                                ? 'fill-violet-500 text-violet-500'
                                : 'text-zinc-200'
                              }`}
                          />
                        ))}
                      </div>

                      <span className="text-[9px] font-black uppercase tracking-[0.16em] text-zinc-300">
                        39P
                      </span>
                    </div>

                    <p className="mt-5 text-sm leading-6 text-zinc-600">
                      “{testimonial.message}”
                    </p>

                    <div className="mt-6 border-t border-black/10 pt-4">
                      <p className="text-xs font-black text-zinc-950">
                        {testimonial.customer_name}
                      </p>

                      {testimonial.company && (
                        <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-400">
                          {testimonial.company}
                        </p>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* =====================================================
            SERVICE FOOTER
        ====================================================== */}

        <div className="mt-20 border-t border-black/10 pt-5 sm:mt-28">
          <div className="flex flex-col justify-between gap-3 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 sm:flex-row sm:items-center">
            <span>
              39Production / Digital / Creative /
              Entertainment
            </span>

            <span className="inline-flex items-center gap-2">
              Creating Digital Works
              <MoveUpRight className="h-3 w-3 text-violet-600" />
            </span>
          </div>
        </div>
      </main>

      {/* =====================================================
          QUOTE SUCCESS MODAL
      ====================================================== */}

      {quoteSubmitted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg overflow-hidden border border-black/10 bg-white shadow-[0_30px_100px_rgba(0,0,0,0.2)]">
            <div className="h-1 w-full bg-violet-600" />

            <div className="p-7 sm:p-9">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-violet-600">
                    Request Submitted
                  </p>

                  <h2 className="mt-2 text-3xl font-black tracking-[-0.05em]">
                    Request berhasil.
                  </h2>
                </div>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-emerald-200 bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              </div>

              <p className="mt-5 text-sm leading-6 text-zinc-500">
                Request kamu sudah masuk ke
                sistem 39Production. Harga final
                akan dibahas bersama admin
                berdasarkan scope project.
              </p>

              <div className="mt-6 border-y border-black/10 py-5">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[9px] font-black uppercase tracking-[0.16em] text-zinc-400">
                    Request Number
                  </span>

                  <span className="font-mono text-sm font-black text-violet-600">
                    {quoteSubmitted.quoteNumber}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between gap-4">
                  <span className="text-[9px] font-black uppercase tracking-[0.16em] text-zinc-400">
                    Service
                  </span>

                  <span className="max-w-[60%] text-right text-sm font-bold text-zinc-950">
                    {quoteSubmitted.serviceName}
                  </span>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <a
                  href={
                    getAdminWhatsAppUrl() ||
                    '#'
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
                  className="inline-flex min-h-12 items-center justify-center gap-2 border border-black bg-black px-5 text-xs font-black uppercase tracking-[0.12em] text-white transition hover:border-violet-600 hover:bg-violet-600"
                >
                  Confirm WhatsApp
                  <ArrowRight className="h-4 w-4" />
                </a>

                <button
                  type="button"
                  onClick={() =>
                    setQuoteSubmitted(null)
                  }
                  className="inline-flex min-h-12 items-center justify-center border border-black/10 bg-white px-5 text-xs font-black uppercase tracking-[0.12em] text-zinc-700 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700"
                >
                  Close
                </button>
              </div>

              {!getAdminWhatsAppUrl() && (
                <p className="mt-4 text-xs text-amber-600">
                  Nomor WhatsApp admin belum
                  dikonfigurasi pada environment
                  frontend.
                </p>
              )}

              <p className="mt-5 border-l-2 border-violet-500 pl-4 text-xs leading-5 text-zinc-500">
                Setelah harga final ditentukan,
                admin akan memberikan quotation
                untuk proses persetujuan dan
                pembayaran DP.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          CHECKOUT MODAL
      ====================================================== */}

      {showCheckout && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-3 backdrop-blur-sm sm:p-5">
          <div
            className="fixed inset-0"
            onClick={() => {
              if (!isSubmitting) {
                closeCheckout()
              }
            }}
          />

          <div className="relative mx-auto my-3 w-full max-w-2xl sm:my-8">
            <div className="overflow-hidden border border-black/10 bg-white shadow-[0_30px_100px_rgba(0,0,0,0.25)]">
              <div className="h-1 w-full bg-violet-600" />

              <div className="max-h-[calc(100dvh-1.5rem)] overflow-y-auto sm:max-h-[calc(100dvh-4rem)]">
                {/* HEADER */}

                <div className="flex items-start justify-between gap-5 border-b border-black/10 p-5 sm:p-7">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-violet-600">
                      39Production / Checkout
                    </p>

                    <h2 className="mt-2 text-2xl font-black tracking-[-0.045em]">
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

                    <p className="mt-1 max-w-xl text-xs leading-5 text-zinc-500 sm:text-sm">
                      {createdOrder
                        ? 'Pembayaran DP telah diverifikasi.'
                        : paymentData
                          ? 'Selesaikan pembayaran DP 50% melalui DANA QRIS.'
                          : needsQuote
                            ? 'Kirim kebutuhan project terlebih dahulu. Harga final akan dibahas dengan admin.'
                            : 'Isi data berikut untuk melanjutkan pembayaran DP 50%.'}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={closeCheckout}
                    className="flex h-9 w-9 shrink-0 items-center justify-center border border-black/10 bg-white text-zinc-500 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* FORM */}

                {!createdOrder &&
                  !paymentData ? (
                  <form
                    onSubmit={
                      handleCheckout
                    }
                    className="space-y-6 p-5 sm:p-7"
                  >
                    {/* SERVICE SUMMARY */}

                    <div className="border-y border-black/10 bg-zinc-50 px-4 py-5">
                      <div className="flex items-start justify-between gap-5">
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-400">
                            Service
                          </p>

                          <p className="mt-1 text-base font-black tracking-tight text-zinc-950">
                            {service.name}
                          </p>

                          <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-violet-600">
                            {getPricingLabel(
                              service,
                            )}
                          </p>
                        </div>

                        <div className="text-right">
                          {isFixedService ? (
                            <>
                              {discount >
                                0 && (
                                  <p className="text-xs text-zinc-400 line-through">
                                    {formatPrice(
                                      basePrice,
                                    )}
                                  </p>
                                )}

                              <p className="text-lg font-black text-violet-600">
                                {formatPrice(
                                  finalPrice,
                                )}
                              </p>
                            </>
                          ) : isStartingFromService ? (
                            <p className="text-sm font-black">
                              Mulai dari{' '}
                              {formatPrice(
                                startingPrice,
                              )}
                            </p>
                          ) : (
                            <p className="text-sm font-black text-violet-600">
                              Custom Quote
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* CUSTOMER */}

                    <div>
                      <div className="mb-4 flex items-center gap-3">
                        <span className="text-[9px] font-black uppercase tracking-[0.18em] text-violet-600">
                          01
                        </span>

                        <span className="h-px w-8 bg-violet-600" />

                        <span className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-400">
                          Customer Information
                        </span>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <label
                            htmlFor="customerName"
                            className="mb-2 block text-xs font-bold text-zinc-800"
                          >
                            Nama Lengkap
                          </label>

                          <input
                            id="customerName"
                            type="text"
                            value={
                              customerName
                            }
                            onChange={(event) =>
                              setCustomerName(
                                event.target
                                  .value,
                              )
                            }
                            placeholder="Masukkan nama lengkap"
                            disabled={
                              isSubmitting
                            }
                            className="w-full border border-black/10 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 disabled:opacity-50"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="customerEmail"
                            className="mb-2 block text-xs font-bold text-zinc-800"
                          >
                            Email
                          </label>

                          <input
                            id="customerEmail"
                            type="email"
                            value={
                              customerEmail
                            }
                            onChange={(event) =>
                              setCustomerEmail(
                                event.target
                                  .value,
                              )
                            }
                            placeholder="nama@email.com"
                            disabled={
                              isSubmitting
                            }
                            className="w-full border border-black/10 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 disabled:opacity-50"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="customerPhone"
                            className="mb-2 block text-xs font-bold text-zinc-800"
                          >
                            Nomor WhatsApp
                          </label>

                          <input
                            id="customerPhone"
                            type="tel"
                            value={
                              customerPhone
                            }
                            onChange={(event) =>
                              setCustomerPhone(
                                event.target
                                  .value,
                              )
                            }
                            placeholder="08xxxxxxxxxx"
                            disabled={
                              isSubmitting
                            }
                            className="w-full border border-black/10 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 disabled:opacity-50"
                          />
                        </div>
                      </div>
                    </div>

                    {/* QUOTE */}

                    {needsQuote && (
                      <div className="border border-violet-200 bg-violet-50/50 p-5">
                        <div className="mb-5">
                          <div className="flex items-center gap-3">
                            <span className="text-[9px] font-black uppercase tracking-[0.18em] text-violet-600">
                              02
                            </span>

                            <span className="h-px w-8 bg-violet-600" />

                            <span className="text-[9px] font-black uppercase tracking-[0.18em] text-violet-700">
                              Project Brief
                            </span>
                          </div>

                          <p className="mt-3 text-xs leading-5 text-zinc-500 sm:text-sm">
                            Data ini membantu
                            tim menentukan
                            scope dan penawaran
                            yang sesuai.
                          </p>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label
                              htmlFor="projectName"
                              className="mb-2 block text-xs font-bold text-zinc-800"
                            >
                              Nama Project
                            </label>

                            <input
                              id="projectName"
                              type="text"
                              value={
                                projectName
                              }
                              onChange={(event) =>
                                setProjectName(
                                  event.target
                                    .value,
                                )
                              }
                              placeholder="Contoh: Website Company Profile"
                              disabled={
                                isSubmitting
                              }
                              className="w-full border border-black/10 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 disabled:opacity-50"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="projectDescription"
                              className="mb-2 block text-xs font-bold text-zinc-800"
                            >
                              Deskripsi Project
                            </label>

                            <textarea
                              id="projectDescription"
                              value={
                                projectDescription
                              }
                              onChange={(event) =>
                                setProjectDescription(
                                  event.target
                                    .value,
                                )
                              }
                              placeholder="Jelaskan kebutuhan, fitur, atau hasil yang diinginkan..."
                              rows={4}
                              disabled={
                                isSubmitting
                              }
                              className="w-full resize-none border border-black/10 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 disabled:opacity-50"
                            />
                          </div>

                          <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                              <label
                                htmlFor="budgetRange"
                                className="mb-2 block text-xs font-bold text-zinc-800"
                              >
                                Budget
                              </label>

                              <input
                                id="budgetRange"
                                type="text"
                                value={
                                  budgetRange
                                }
                                onChange={(
                                  event,
                                ) =>
                                  setBudgetRange(
                                    event.target
                                      .value,
                                  )
                                }
                                placeholder="Contoh: Rp3–5 juta"
                                disabled={
                                  isSubmitting
                                }
                                className="w-full border border-black/10 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 disabled:opacity-50"
                              />
                            </div>

                            <div>
                              <label
                                htmlFor="deadline"
                                className="mb-2 block text-xs font-bold text-zinc-800"
                              >
                                Target Deadline
                              </label>

                              <input
                                id="deadline"
                                type="date"
                                value={
                                  deadline
                                }
                                onChange={(
                                  event,
                                ) =>
                                  setDeadline(
                                    event.target
                                      .value,
                                  )
                                }
                                disabled={
                                  isSubmitting
                                }
                                className="w-full border border-black/10 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 disabled:opacity-50"
                              />
                            </div>
                          </div>

                          <div>
                            <label
                              htmlFor="referenceUrl"
                              className="mb-2 block text-xs font-bold text-zinc-800"
                            >
                              Reference URL
                            </label>

                            <input
                              id="referenceUrl"
                              type="url"
                              value={
                                referenceUrl
                              }
                              onChange={(event) =>
                                setReferenceUrl(
                                  event.target
                                    .value,
                                )
                              }
                              placeholder="https://..."
                              disabled={
                                isSubmitting
                              }
                              className="w-full border border-black/10 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 disabled:opacity-50"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="additionalRequirements"
                              className="mb-2 block text-xs font-bold text-zinc-800"
                            >
                              Kebutuhan Tambahan
                            </label>

                            <textarea
                              id="additionalRequirements"
                              value={
                                additionalRequirements
                              }
                              onChange={(event) =>
                                setAdditionalRequirements(
                                  event.target
                                    .value,
                                )
                              }
                              placeholder="Catatan atau kebutuhan khusus..."
                              rows={3}
                              disabled={
                                isSubmitting
                              }
                              className="w-full resize-none border border-black/10 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 disabled:opacity-50"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* PRICING */}

                    {isFixedService ? (
                      <div className="border-y border-black/10 py-5">
                        <div className="space-y-3">
                          <div className="flex justify-between gap-4 text-sm">
                            <span className="text-zinc-500">
                              Harga layanan
                            </span>

                            <span className="font-bold text-zinc-900">
                              {formatPrice(
                                basePrice,
                              )}
                            </span>
                          </div>

                          {discount >
                            0 && (
                              <div className="flex justify-between gap-4 text-sm">
                                <span className="text-violet-600">
                                  Discount
                                </span>

                                <span className="font-bold text-violet-600">
                                  -
                                  {formatPrice(
                                    discount,
                                  )}
                                </span>
                              </div>
                            )}

                          <div className="border-t border-black/10 pt-4">
                            <div className="flex justify-between gap-4">
                              <span className="font-black">
                                Total
                              </span>

                              <span className="text-xl font-black text-violet-600">
                                {formatPrice(
                                  finalPrice,
                                )}
                              </span>
                            </div>
                          </div>

                          <div className="flex justify-between gap-4 text-sm">
                            <span className="font-bold text-violet-600">
                              DP 50%
                            </span>

                            <span className="font-black text-violet-600">
                              {formatPrice(
                                estimatedDp,
                              )}
                            </span>
                          </div>

                          <div className="flex justify-between gap-4 text-sm">
                            <span className="text-zinc-500">
                              Sisa pembayaran
                            </span>

                            <span className="font-bold text-zinc-800">
                              {formatPrice(
                                estimatedRemaining,
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="border border-violet-200 bg-violet-50/60 p-5">
                        <p className="text-sm font-black text-zinc-950">
                          Harga akan ditentukan
                          melalui Quote
                        </p>

                        <p className="mt-2 text-xs leading-5 text-zinc-500 sm:text-sm">
                          {isStartingFromService
                            ? `Layanan dimulai dari ${formatPrice(
                              startingPrice,
                            )}. Angka ini hanya harga awal, bukan harga final.`
                            : 'Admin akan menentukan harga berdasarkan scope dan kebutuhan project.'}{' '}
                          Pembayaran belum
                          dilakukan pada tahap
                          request ini.
                        </p>
                      </div>
                    )}

                    {/* ERROR */}

                    {formError && (
                      <div className="border border-red-200 bg-red-50 px-4 py-3 text-xs leading-5 text-red-600">
                        {formError}
                      </div>
                    )}

                    {/* SUBMIT */}

                    <button
                      type="submit"
                      disabled={
                        isSubmitting
                      }
                      className="group flex min-h-13 w-full items-center justify-between border border-black bg-black px-5 text-xs font-black uppercase tracking-[0.14em] text-white transition hover:border-violet-600 hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <span className="flex items-center gap-3">
                        {isSubmitting && (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        )}

                        {isSubmitting
                          ? needsQuote
                            ? 'Sending Request...'
                            : 'Creating Payment...'
                          : needsQuote
                            ? 'Kirim Request Quote'
                            : 'Pay DP 50% via QRIS'}
                      </span>

                      {!isSubmitting && (
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      )}
                    </button>

                    <p className="text-center text-[10px] leading-5 text-zinc-400">
                      {needsQuote
                        ? 'Pembayaran belum dilakukan. Admin akan menghubungi kamu untuk pembahasan scope dan harga.'
                        : 'Order number dibuat setelah pembayaran DP berhasil diverifikasi oleh server.'}
                    </p>
                  </form>
                ) : !createdOrder &&
                  paymentData ? (
                  /* =================================================
                     QRIS
                  ================================================== */

                  <div className="p-5 sm:p-7">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="border border-violet-200 bg-violet-50 p-5">
                        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-violet-600">
                          DP 50%
                        </p>

                        <p className="mt-2 text-3xl font-black tracking-[-0.04em] text-violet-600">
                          {formatPrice(
                            paymentData.dp_amount,
                          )}
                        </p>
                      </div>

                      <div className="border border-black/10 bg-zinc-50 p-5">
                        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-400">
                          Remaining
                        </p>

                        <p className="mt-2 text-2xl font-black tracking-[-0.04em]">
                          {formatPrice(
                            paymentData.remaining_amount,
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 border border-black/10 bg-white p-5">
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
                          className="mx-auto flex h-56 w-56 items-center justify-center border border-black/10 bg-zinc-50 text-center text-xs font-black uppercase tracking-[0.1em] text-zinc-700 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 sm:h-64 sm:w-64"
                        >
                          Open DANA QRIS
                        </a>
                      ) : (
                        <div className="mx-auto flex min-h-40 max-w-sm items-center justify-center break-all bg-zinc-50 p-5 text-center font-mono text-xs text-zinc-700">
                          {
                            paymentData.qr_content
                          }
                        </div>
                      )}
                    </div>

                    <div className="mt-5 border-l-2 border-violet-600 bg-violet-50/60 p-4 text-xs leading-5 text-zinc-500">
                      <p className="font-black text-zinc-950">
                        Pembayaran melalui
                        DANA QRIS
                      </p>

                      <p className="mt-1">
                        Scan QRIS menggunakan
                        aplikasi DANA. Sistem
                        akan mengecek status
                        pembayaran secara
                        otomatis.
                      </p>

                      <p className="mt-2 font-semibold text-violet-700">
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
                      className="mt-4 min-h-11 w-full border border-black/10 bg-white text-[10px] font-black uppercase tracking-[0.14em] text-zinc-700 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700"
                    >
                      Copy QRIS Content
                    </button>

                    {formError && (
                      <div className="mt-4 border border-red-200 bg-red-50 p-3 text-xs text-red-600">
                        {formError}
                      </div>
                    )}
                  </div>
                ) : createdOrder ? (
                  /* =================================================
                     ORDER SUCCESS
                  ================================================== */

                  <div className="p-6 sm:p-8">
                    <div className="flex items-start justify-between gap-6 border-b border-black/10 pb-6">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-600">
                          DP Payment Verified
                        </p>

                        <h2 className="mt-2 text-3xl font-black tracking-[-0.05em]">
                          Order berhasil dibuat
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-zinc-500">
                          Pembayaran DP 50%
                          sudah diverifikasi.
                          Order resmi tercatat
                          di sistem.
                        </p>
                      </div>

                      <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-emerald-200 bg-emerald-50 text-emerald-600">
                        <CheckCircle2 className="h-6 w-6" />
                      </div>
                    </div>

                    <div className="mt-6 border border-violet-200 bg-violet-50 p-5">
                      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-400">
                        Order Number
                      </p>

                      <p className="mt-2 break-all font-mono text-xl font-black tracking-[0.08em] text-violet-600">
                        {
                          createdOrder.order_number
                        }
                      </p>
                    </div>

                    <div className="mt-5 border-y border-black/10 py-5">
                      <div className="flex justify-between gap-4 text-sm">
                        <span className="text-zinc-500">
                          Layanan
                        </span>

                        <span className="max-w-[60%] text-right font-bold text-zinc-950">
                          {
                            createdOrder.product_name
                          }
                        </span>
                      </div>

                      <div className="mt-3 flex justify-between gap-4 text-sm">
                        <span className="text-zinc-500">
                          Quantity
                        </span>

                        <span className="font-bold">
                          {
                            createdOrder.quantity
                          }
                        </span>
                      </div>

                      {(createdOrder.discount_amount ??
                        0) > 0 && (
                          <div className="mt-3 flex justify-between gap-4 text-sm">
                            <span className="text-zinc-500">
                              Discount
                            </span>

                            <span className="font-bold text-violet-600">
                              -
                              {formatPrice(
                                createdOrder.discount_amount ??
                                0,
                              )}
                            </span>
                          </div>
                        )}

                      <div className="mt-4 border-t border-black/10 pt-4">
                        <div className="flex justify-between gap-4">
                          <span className="font-black">
                            Total
                          </span>

                          <span className="text-xl font-black text-violet-600">
                            {formatPrice(
                              createdOrder.final_total ??
                              createdOrder.total_price,
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 flex justify-between gap-4 text-sm">
                        <span className="font-bold text-violet-600">
                          DP dibayar
                        </span>

                        <span className="font-black text-violet-600">
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

                      <div className="mt-3 flex justify-between gap-4 text-sm">
                        <span className="text-zinc-500">
                          Sisa pembayaran
                        </span>

                        <span className="font-bold text-zinc-900">
                          {formatPrice(
                            createdOrder.remaining_amount ??
                            Number(
                              createdOrder.final_total ??
                              createdOrder.total_price,
                            ) -
                            (createdOrder.dp_amount ??
                              Math.ceil(
                                Number(
                                  createdOrder.final_total ??
                                  createdOrder.total_price,
                                ) / 2,
                              )),
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 border-l-2 border-violet-600 bg-violet-50/60 p-4 text-xs leading-5 text-zinc-500">
                      Order akan diproses oleh
                      admin. Setelah pekerjaan
                      selesai, admin akan
                      menerbitkan invoice untuk
                      sisa pembayaran 50%.
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      <a
                        href={createWhatsAppUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-12 items-center justify-center gap-2 border border-black bg-black px-5 text-xs font-black uppercase tracking-[0.12em] text-white transition hover:border-violet-600 hover:bg-violet-600"
                      >
                        WhatsApp
                        <ArrowRight className="h-4 w-4" />
                      </a>

                      <Link
                        to={getTrackUrl(
                          createdOrder.order_number,
                        )}
                        className="inline-flex min-h-12 items-center justify-center gap-2 border border-black/10 bg-white px-5 text-xs font-black uppercase tracking-[0.12em] text-zinc-700 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700"
                      >
                        Track Order
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </div>

                    <Link
                      to="/services"
                      className="mt-4 flex min-h-10 items-center justify-center text-[10px] font-black uppercase tracking-[0.14em] text-zinc-400 transition hover:text-violet-600"
                    >
                      Back to Services
                    </Link>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            scroll-behavior: auto !important;
            transition-duration: 0.01ms !important;
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
          }
        }
      `}</style>
    </section>
  )
}