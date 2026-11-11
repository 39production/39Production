import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type PointerEvent,
} from 'react'
import { Link, useParams } from 'react-router-dom'
import { WHATSAPP_NUMBER } from '@/utils/constants'
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
  public_payment_token?: string
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
  payment_method: 'BANK_TRANSFER' | 'DANA'
  payment_stage: 'DP' | 'FINAL'
  amount: number
  remaining_amount: number
  bank_name?: string | null
  account_number?: string | null
  account_name?: string | null
  dana_number?: string | null
  dana_name?: string | null
  instructions?: string | null
  expires_at?: string | null
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

const delay = (ms: number) =>
  ({ '--d': `${ms}ms` }) as CSSProperties

/* Gambar dummy lokal (SVG) — dipakai bila foto layanan kosong / gagal */
function ServiceArt() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden bg-[#0d0820]"
    >
      <svg
        viewBox="0 0 400 320"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <radialGradient id="sd-art-a" cx="18%" cy="12%" r="75%">
            <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="sd-art-b" cx="92%" cy="96%" r="60%">
            <stop offset="0%" stopColor="#E78FBA" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#E78FBA" stopOpacity="0" />
          </radialGradient>
          <pattern
            id="sd-art-g"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M24 0H0V24"
              fill="none"
              stroke="#fff"
              strokeOpacity="0.05"
            />
          </pattern>
        </defs>

        <rect width="400" height="320" fill="url(#sd-art-a)" />
        <rect width="400" height="320" fill="url(#sd-art-b)" />
        <rect width="400" height="320" fill="url(#sd-art-g)" />

        <text
          x="22"
          y="300"
          fill="none"
          stroke="#fff"
          strokeOpacity="0.22"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          fontSize="130"
          fontWeight="900"
          letterSpacing="-10"
        >
          39
        </text>

        {/* tumpukan layer isometrik */}
        <g className="sd-art-stack" transform="translate(236 168)">
          {[0, 1, 2, 3].map((i) => (
            <g key={i} transform={`translate(0 ${-i * 22})`}>
              <path
                d="M0 0 L78 -34 L156 0 L78 34 Z"
                fill={i === 3 ? '#E78FBA' : '#7C3AED'}
                fillOpacity={i === 3 ? 0.9 : 0.35 + i * 0.12}
                stroke="#fff"
                strokeOpacity="0.5"
              />
              <path
                d="M0 0 L78 34 L78 44 L0 10 Z"
                fill="#fff"
                fillOpacity="0.08"
              />
              <path
                d="M156 0 L78 34 L78 44 L156 10 Z"
                fill="#000"
                fillOpacity="0.25"
              />
            </g>
          ))}
        </g>
      </svg>
    </div>
  )
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

  const [proofFile, setProofFile] =
    useState<File | null>(null)

  const [proofUploaded, setProofUploaded] =
    useState(false)

  const [isUploadingProof, setIsUploadingProof] =
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

  /* =====================================================
      DYNAMIC SEO
  ====================================================== */

  useEffect(() => {
    if (!service) {
      return
    }

    const siteName = '39Production'
    const serviceName = service.name.trim()
    const category = service.category?.trim()
    const description = service.description
      .trim()
      .replace(/\s+/g, ' ')
    const seoDescription =
      description.length > 155
        ? `${description.slice(0, 152).trimEnd()}...`
        : description
    const pageUrl = `${window.location.origin}/services/${service.id}`
    const title = `${serviceName} | ${siteName}`

    document.title = title

    const upsertMeta = (
      attribute: 'name' | 'property',
      key: string,
      content: string,
    ) => {
      let element =
        document.head.querySelector<HTMLMetaElement>(
          `meta[${attribute}="${key}"]`,
        )

      if (!element) {
        element = document.createElement('meta')
        element.setAttribute(attribute, key)
        document.head.appendChild(element)
      }

      element.setAttribute('content', content)
    }

    const upsertLink = (rel: string, href: string) => {
      let element =
        document.head.querySelector<HTMLLinkElement>(
          `link[rel="${rel}"]`,
        )

      if (!element) {
        element = document.createElement('link')
        element.setAttribute('rel', rel)
        document.head.appendChild(element)
      }

      element.setAttribute('href', href)
    }

    upsertMeta(
      'name',
      'description',
      seoDescription,
    )
    upsertMeta(
      'name',
      'robots',
      'index, follow',
    )
    upsertMeta(
      'property',
      'og:type',
      'website',
    )
    upsertMeta(
      'property',
      'og:title',
      title,
    )
    upsertMeta(
      'property',
      'og:description',
      seoDescription,
    )
    upsertMeta(
      'property',
      'og:url',
      pageUrl,
    )
    upsertMeta(
      'property',
      'og:site_name',
      siteName,
    )
    upsertMeta(
      'property',
      'og:locale',
      'id_ID',
    )

    if (service.image_url) {
      upsertMeta(
        'property',
        'og:image',
        service.image_url,
      )
      upsertMeta(
        'name',
        'twitter:image',
        service.image_url,
      )
    }

    upsertMeta(
      'name',
      'twitter:card',
      service.image_url
        ? 'summary_large_image'
        : 'summary',
    )
    upsertMeta(
      'name',
      'twitter:title',
      title,
    )
    upsertMeta(
      'name',
      'twitter:description',
      seoDescription,
    )
    upsertLink(
      'canonical',
      pageUrl,
    )

    const schemaPrice = isFixedService
      ? finalPrice
      : undefined

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: serviceName,
      description,
      url: pageUrl,
      provider: {
        '@type': 'Organization',
        name: siteName,
        url: window.location.origin,
      },
      ...(category
        ? { serviceType: category }
        : {}),
      ...(service.image_url
        ? { image: service.image_url }
        : {}),
      ...(isFixedService &&
        service.price !== null
        ? {
          offers: {
            '@type': 'Offer',
            price: schemaPrice,
            priceCurrency: 'IDR',
            availability:
              'https://schema.org/InStock',
            url: pageUrl,
          },
        }
        : {}),
    }

    const existingSchema =
      document.head.querySelector<HTMLScriptElement>(
        'script[data-service-seo="true"]',
      )

    const schemaElement =
      existingSchema ??
      document.createElement('script')

    schemaElement.type =
      'application/ld+json'
    schemaElement.setAttribute(
      'data-service-seo',
      'true',
    )
    schemaElement.textContent = JSON.stringify(
      schema,
    ).replace(/</g, '\\u003c')

    if (!existingSchema) {
      document.head.appendChild(
        schemaElement,
      )
    }

    return () => {
      schemaElement.parentNode?.removeChild(
        schemaElement,
      )
    }
  }, [
    service,
    isFixedService,
    finalPrice,
  ])

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
    paymentToken: string,
  ) =>
    `/track-order?order=${encodeURIComponent(
      orderNumber,
    )}&token=${encodeURIComponent(paymentToken)}`

  const createWhatsAppUrl = () => {
    if (!createdOrder || !paymentData || !proofUploaded) {
      return '#'
    }

    const destination = normalizeWhatsAppNumber(
      String(WHATSAPP_NUMBER ?? import.meta.env.VITE_WHATSAPP_NUMBER ?? ''),
    )

    if (!destination) return '#'

    const total = Number(
      createdOrder.final_total ?? createdOrder.total_price ?? 0,
    )
    const dpAmount = Number(
      paymentData.amount ?? createdOrder.dp_amount ?? Math.ceil(total / 2),
    )
    const trackUrl = `${window.location.origin}${getTrackUrl(createdOrder.order_number, createdOrder.public_payment_token ?? '')}`

    const message = [
      'Halo 39Production, saya sudah melakukan pembayaran DP dan mengunggah bukti transfer melalui website.',
      '',
      `Order Number: ${createdOrder.order_number}`,
      `Layanan: ${createdOrder.product_name}`,
      `Nama: ${createdOrder.customer_name}`,
      `Nominal transfer: ${formatPrice(dpAmount)}`,
      'Status bukti: Sudah diunggah, menunggu verifikasi admin.',
      '',
      `Track Order: ${trackUrl}`,
      '',
      'Mohon bantu verifikasi pembayaran saya. Terima kasih.',
    ].join('\n')

    return `https://wa.me/${destination}?text=${encodeURIComponent(message)}`
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

  /* =====================================================
      MOTION
  ====================================================== */

  const rootRef = useRef<HTMLElement | null>(null)
  const stageRef = useRef<HTMLDivElement | null>(null)

  const [imageFailed, setImageFailed] =
    useState(false)

  useEffect(() => {
    setImageFailed(false)
  }, [service?.image_url])

  /* Reveal saat di-scroll */
  useEffect(() => {
    const root = rootRef.current

    if (!root) {
      return
    }

    const items = root.querySelectorAll(
      '[data-reveal]:not(.is-visible)',
    )

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px -4% 0px' },
    )

    items.forEach((item) => observer.observe(item))

    return () => observer.disconnect()
  }, [
    loading,
    service,
    promotion,
    testimonials.length,
  ])

  /* Tilt 3D mengikuti kursor */
  const onStageMove = (
    event: PointerEvent<HTMLDivElement>,
  ) => {
    if (event.pointerType === 'touch') {
      return
    }

    const el = stageRef.current

    if (!el) {
      return
    }

    const rect = el.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width
    const y = (event.clientY - rect.top) / rect.height

    el.style.setProperty('--ry', `${((x - 0.5) * 14).toFixed(2)}deg`)
    el.style.setProperty('--rx', `${((0.5 - y) * 10).toFixed(2)}deg`)
    el.style.setProperty('--gx', `${(x * 100).toFixed(1)}%`)
    el.style.setProperty('--gy', `${(y * 100).toFixed(1)}%`)
  }

  const onStageLeave = () => {
    const el = stageRef.current

    if (!el) {
      return
    }

    el.style.setProperty('--ry', '0deg')
    el.style.setProperty('--rx', '0deg')
  }

  const resetCheckout = () => {
    setQuoteSubmitted(null)
    setCustomerName('')
    setCustomerEmail('')
    setCustomerPhone('')
    setFormError('')
    setPaymentData(null)
    setCreatedOrder(null)
    setProofFile(null)
    setProofUploaded(false)
    setIsUploadingProof(false)
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
        `${API_BASE_URL}/api/orders`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'Service',
            product_id: null,
            service_id: service.id,
            customer_name: customerName.trim(),
            customer_email: customerEmail.trim(),
            customer_phone: customerPhone.trim(),
            quantity: 1,
          }),
        },
      )

      const result = await response.json()

      if (!response.ok || !result?.success) {
        throw new Error(
          result?.message || `Gagal membuat pesanan (${response.status}).`,
        )
      }

      const data = result?.data ?? result
      const order = data?.order
      const instruction = data?.payment_instruction

      if (!order?.order_number) {
        throw new Error('Nomor pesanan tidak diterima dari server.')
      }
      if (!order?.public_payment_token || String(order.public_payment_token).length < 32) {
        throw new Error('Token tracking aman tidak diterima dari server. Silakan hubungi admin.')
      }

      if (
        !instruction?.payment_method ||
        !Number.isFinite(Number(instruction?.amount))
      ) {
        throw new Error('Instruksi pembayaran belum tersedia. Silakan hubungi admin.')
      }

      if (!['BANK_TRANSFER', 'DANA'].includes(instruction.payment_method)) {
        throw new Error('Metode pembayaran dari server tidak dikenali.')
      }

      setCreatedOrder(order as Order)
      setPaymentData({
        ...instruction,
        amount: Number(instruction.amount),
        remaining_amount: Number(
          instruction.remaining_amount ?? order.remaining_amount ?? 0,
        ),
        payment_stage: instruction.payment_stage === 'FINAL' ? 'FINAL' : 'DP',
      } as PaymentData)
      setProofFile(null)
      setProofUploaded(false)

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
            : 'Gagal membuat pesanan.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleProofUpload = async () => {
    if (!createdOrder || !proofFile) {
      setFormError('Pilih file bukti transfer terlebih dahulu.')
      return
    }

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
    ]

    if (!allowedTypes.includes(proofFile.type)) {
      setFormError('Format bukti pembayaran harus JPG, PNG, WEBP, atau PDF.')
      return
    }

    if (proofFile.size > 5 * 1024 * 1024) {
      setFormError('Ukuran file maksimal 5 MB.')
      return
    }

    try {
      setFormError('')
      setIsUploadingProof(true)

      const formData = new FormData()
      formData.append('proof', proofFile)

      const response = await fetch(
        `${API_BASE_URL}/api/orders/${encodeURIComponent(createdOrder.order_number)}/payment-proof`,
        { method: 'POST', body: formData },
      )

      const result = await response.json()

      if (!response.ok || !result?.success) {
        throw new Error(
          result?.message || `Gagal mengunggah bukti (${response.status}).`,
        )
      }

      setProofUploaded(true)
      setFormError('')
    } catch (err) {
      console.error('Upload payment proof error:', err)
      setFormError(
        err instanceof Error
          ? err.message
          : 'Gagal mengunggah bukti pembayaran.',
      )
    } finally {
      setIsUploadingProof(false)
    }
  }

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
    <section
      ref={rootRef}
      className="sd relative isolate min-h-screen overflow-x-clip bg-white text-zinc-950"
    >
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
        className="sd-twinkle pointer-events-none absolute left-[8%] top-[17%] h-2 w-2 bg-violet-600"
      />

      <div
        aria-hidden="true"
        className="sd-twinkle pointer-events-none absolute right-[12%] top-[42%] h-1.5 w-1.5 bg-violet-500"
        style={{ animationDelay: '1.2s' }}
      />

      <main className="relative mx-auto max-w-[1600px] px-5 pb-20 pt-28 sm:px-8 sm:pt-32 lg:px-12 lg:pb-28 lg:pt-20">
        {/* =====================================================
            TOP LINE
        ====================================================== */}

        <div className="sd-in mb-8 flex items-center justify-between border-b border-black/10 pb-5 sm:mb-10">
          <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.24em] text-zinc-500 sm:text-xs">
            <span className="text-zinc-950">
              39Production
            </span>

            <span className="sd-blink h-1.5 w-1.5 bg-violet-600" />

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
          className="sd-in group mb-8 inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500 transition hover:text-violet-600 sm:mb-10"
          style={delay(80)}
        >
          <span className="flex h-8 w-8 items-center justify-center border border-black/10 bg-white transition group-hover:border-violet-600 group-hover:bg-violet-600 group-hover:text-white">
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
          </span>

          Back to Services
        </Link>

        {/* =====================================================
            HERO DETAIL
        ====================================================== */}

        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          {/* IMAGE — stage 3D */}

          <div
            className="sd-in lg:sticky lg:top-28 lg:self-start"
            style={delay(140)}
          >
            <div
              ref={stageRef}
              onPointerMove={onStageMove}
              onPointerLeave={onStageLeave}
              className="sd-stage relative"
            >
              <div className="sd-tilt relative">
                <div className="relative aspect-[16/9] overflow-hidden border border-black/10 bg-[#0d0820] shadow-[0_18px_45px_rgba(0,0,0,0.07)] sm:aspect-[5/4] sm:shadow-[0_25px_70px_rgba(0,0,0,0.08)]">
                  {service.image_url && !imageFailed ? (
                    <>
                      <img
                        src={service.image_url}
                        alt={service.name}
                        className="sd-kb absolute inset-0 h-full w-full object-cover"
                        ref={(element) => {
                          if (
                            element &&
                            element.complete &&
                            element.naturalWidth === 0
                          ) {
                            setImageFailed(true)
                          }
                        }}
                        onError={() => setImageFailed(true)}
                        onLoad={(event) => {
                          if (event.currentTarget.naturalWidth === 0) {
                            setImageFailed(true)
                          }
                        }}
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />

                      <div className="absolute left-3 top-3 z-10 border border-white/25 bg-black/70 px-2.5 py-1.5 text-[8px] font-black uppercase tracking-[0.16em] text-white backdrop-blur-sm sm:left-5 sm:top-5 sm:px-3 sm:text-[9px]">
                        39Production
                      </div>

                      <div className="absolute bottom-3 left-3 right-3 z-10 sm:bottom-5 sm:left-5 sm:right-5">
                        <div className="border-l-2 border-violet-500 pl-4">
                          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60">
                            Service
                          </p>

                          <p className="mt-1 line-clamp-1 text-sm font-black tracking-[-0.025em] text-white sm:text-xl">
                            {service.name}
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <ServiceArt />

                      <div className="absolute left-3 top-3 z-10 border border-white/25 bg-black/60 px-2.5 py-1.5 text-[8px] font-black uppercase tracking-[0.16em] text-white backdrop-blur-sm sm:left-5 sm:top-5 sm:px-3 sm:text-[9px]">
                        39Production Service
                      </div>

                      <div className="absolute bottom-3 left-3 right-3 z-10 sm:bottom-5 sm:left-5 sm:right-5">
                        <div className="border-l-2 border-violet-400 pl-4">
                          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60">
                            Service
                          </p>

                          <p className="mt-1 line-clamp-1 text-sm font-black tracking-[-0.025em] text-white sm:text-xl">
                            {service.name}
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="sd-glare pointer-events-none absolute inset-0 z-10" />
                  <div className="sd-shine pointer-events-none absolute inset-y-0 -left-1/2 z-10 w-1/3 -skew-x-12 bg-white/20" />
                </div>

                {/* 3D melayang */}
                <div
                  aria-hidden="true"
                  className="sd-z-a pointer-events-none absolute -right-2 -top-6 z-20 sm:-right-5 sm:-top-8"
                >
                  <div className="sd-float-slow">
                    <div className="sd-cube">
                      <i className="f1">39</i>
                      <i className="f2" />
                      <i className="f3">S</i>
                      <i className="f4" />
                      <i className="f5" />
                      <i className="f6" />
                    </div>
                  </div>
                </div>

                <div
                  aria-hidden="true"
                  className="sd-z-b pointer-events-none absolute -bottom-3 -left-2 z-20 sm:-bottom-5 sm:-left-4"
                >
                  <div className="sd-float" style={{ animationDelay: '-2s' }}>
                    <div className="sd-sphere" />
                  </div>
                </div>

                <div
                  aria-hidden="true"
                  className="sd-z-b pointer-events-none absolute -bottom-4 right-4 z-20 hidden sm:block"
                >
                  <div className="sd-float" style={{ animationDelay: '-3.5s' }}>
                    <div className="sd-plane border border-zinc-950 bg-white px-2.5 py-1.5 shadow-[5px_5px_0_0_rgba(124,58,237,0.9)]">
                      <p className="flex items-center gap-1.5 font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-violet-600">
                        <span className="sd-blink h-1.5 w-1.5 bg-emerald-500" />
                        Available
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Image metadata */}

              <div className="mt-6 grid grid-cols-2 border-y border-black/10 sm:mt-8">
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
                    <span className="sd-blink h-1.5 w-1.5 bg-emerald-500" />
                    Available
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CONTENT */}

          <div className="max-w-4xl">
            <div
              className="sd-in flex flex-wrap items-center gap-2"
              style={delay(200)}
            >
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
              <p
                className="sd-in flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.24em] text-violet-600"
                style={delay(260)}
              >
                <span className="sd-grow h-px w-8 bg-violet-600" />
                01 / Service Detail
              </p>

              <h1 className="mt-4 max-w-4xl text-[clamp(3rem,7vw,7rem)] font-black leading-[0.9] tracking-[-0.07em]">
                <span className="block overflow-hidden pb-[0.08em]">
                  <span
                    className="sd-up block"
                    style={delay(320)}
                  >
                    {service.name}
                  </span>
                </span>
              </h1>
            </div>

            {/* PRICE */}

            <div
              className="sd-in mt-10 border-y border-black/10 py-6"
              style={delay(460)}
            >
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
                    <div className="sd-pulse flex items-center gap-2 border border-violet-200 bg-violet-50 px-3 py-2 text-violet-700">
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
                <div
                  data-reveal
                  className="sd-rv relative mt-8 overflow-hidden border border-violet-200 bg-violet-50"
                >
                  <div className="sd-shine-loop pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/50" />

                  <div className="relative grid sm:grid-cols-[auto_1fr_auto]">
                    <div className="flex items-center justify-center bg-violet-600 p-5 text-white">
                      <Tag className="sd-wiggle h-5 w-5" />
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

                        <p className="mt-1 border border-dashed border-violet-400 bg-white px-2 py-1 font-mono text-sm font-black text-violet-700">
                          {promotion.code}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            {/* DESCRIPTION */}

            <div
              data-reveal
              className="sd-rv mt-10"
            >
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

            <div
              data-reveal
              className="sd-rv relative mt-12"
            >
              <div className="mb-5 flex items-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-600">
                  03
                </span>

                <span className="h-px w-10 bg-violet-600" />

                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                  Why Work With Us
                </span>
              </div>

              <div className="grid grid-cols-3 border-l border-t border-black/10">
                {[
                  {
                    icon: Zap,
                    title: 'Structured Process',
                    text: 'Proses kerja dirancang dengan alur yang jelas dari awal hingga delivery.',
                  },
                  {
                    icon: ShieldCheck,
                    title: 'Professional',
                    text: 'Dikerjakan dengan standar produksi profesional dan komunikasi yang jelas.',
                  },
                  {
                    icon: Sparkles,
                    title: 'Tailored',
                    text: 'Pendekatan disesuaikan dengan kebutuhan dan tujuan project.',
                  },
                ].map((item, index) => {
                  const Icon = item.icon

                  return (
                    <div
                      key={item.title}
                      className="group relative min-w-0 overflow-hidden border-b border-r border-black/10 p-3 transition-colors duration-500 hover:bg-violet-50/50 sm:p-5"
                    >
                      <div className="absolute left-0 top-0 h-0.5 w-0 bg-violet-600 transition-all duration-700 group-hover:w-full" />

                      <div className="flex items-start justify-between">
                        <div className="flex h-10 w-10 items-center justify-center border border-violet-200 bg-violet-50 text-violet-600 transition-all duration-500 group-hover:-rotate-6 group-hover:border-violet-600 group-hover:bg-violet-600 group-hover:text-white">
                          <Icon className="h-4 w-4" />
                        </div>

                        <span className="font-mono text-[10px] text-zinc-300">
                          0{index + 1}
                        </span>
                      </div>

                      <p className="mt-3 text-[10px] font-black leading-tight tracking-tight sm:mt-5 sm:text-sm">
                        {item.title}
                      </p>

                      <p className="mt-1 hidden text-xs leading-5 text-zinc-500 sm:block">
                        {item.text}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* CTA */}

            <div
              data-reveal
              className="sd-rv mt-12 border-t border-black/10 pt-7"
            >
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    setFormError('')
                    setCreatedOrder(null)
                    setPaymentData(null)
                    setProofFile(null)
                    setProofUploaded(false)
                    setIsUploadingProof(false)
                    setShowCheckout(true)
                  }}
                  className="group relative inline-flex min-h-13 flex-1 items-center justify-between overflow-hidden border border-black bg-black px-5 text-xs font-black uppercase tracking-[0.15em] text-white transition-all duration-300 hover:border-violet-600 hover:bg-violet-600"
                >
                  <span className="sd-shine-loop pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/20" />

                  <span className="relative">
                    {needsQuote
                      ? 'Request Quote'
                      : 'Pesan Layanan'}
                  </span>

                  <ArrowUpRight className="relative h-4 w-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                </button>

                <Link
                  to="/services"
                  className="group inline-flex min-h-13 items-center justify-center gap-3 border border-black/10 bg-white px-6 text-xs font-black uppercase tracking-[0.15em] text-zinc-700 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700"
                >
                  Other Services
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              {isFixedService && (
                <div className="mt-5 flex items-start gap-3 border-l-2 border-violet-600 bg-violet-50/60 p-4">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />

                  <div>
                    <p className="truncate text-[10px] font-black text-zinc-950 sm:text-xs">
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
          <section className="mt-20 border-t-2 border-zinc-950 pt-12 sm:mt-28 sm:pt-16">
            <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
              <div
                data-reveal
                className="sd-rv relative"
              >
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

                <div
                  aria-hidden="true"
                  className="sd-z-b pointer-events-none mt-8 hidden lg:block"
                >
                  <div className="sd-float-slow">
                    <div className="sd-cube sd-cube-lg">
                      <i className="f1">“</i>
                      <i className="f2" />
                      <i className="f3">39</i>
                      <i className="f4" />
                      <i className="f5" />
                      <i className="f6" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                {testimonials.slice(0, 4).map((testimonial, index) => (
                  <article
                    key={testimonial.id}
                    data-reveal
                    style={delay(index * 90)}
                    className="sd-rv group relative min-w-0 border border-black/10 bg-white p-3 transition-[border-color,box-shadow,transform] duration-500 hover:-translate-y-1 hover:border-violet-400 hover:shadow-[6px_6px_0_0_rgba(124,58,237,0.9)] sm:p-5"
                  >
                    <div className="absolute left-0 top-0 h-0.5 w-0 bg-violet-600 transition-all duration-700 group-hover:w-full" />

                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-1" aria-label={`${testimonial.rating} dari 5 bintang`}>
                        {Array.from({ length: 5 }).map((_, starIndex) => (
                          <Star
                            key={starIndex}
                            className={`h-3.5 w-3.5 ${starIndex < testimonial.rating
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

                    <p className="mt-3 line-clamp-4 text-[11px] leading-5 text-zinc-600 sm:mt-5 sm:text-sm sm:leading-6">
                      “{testimonial.message}”
                    </p>

                    <div className="mt-4 border-t border-black/10 pt-3 sm:mt-6 sm:pt-4">
                      <p className="text-xs font-black text-zinc-950">
                        {testimonial.customer_name}
                      </p>

                      {testimonial.company && (
                        <p className="mt-1 truncate text-[8px] font-semibold uppercase tracking-[0.1em] text-zinc-400 sm:text-[10px] sm:tracking-[0.12em]">
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
                      {createdOrder && paymentData
                        ? 'Instruksi Pembayaran'
                        : needsQuote
                          ? isStartingFromService
                            ? 'Request Project'
                            : 'Request Quote'
                          : 'Pesan Layanan'}
                    </h2>

                    <p className="mt-1 max-w-xl text-xs leading-5 text-zinc-500 sm:text-sm">
                      {createdOrder && paymentData
                        ? 'Transfer DP sesuai instruksi, lalu unggah bukti pembayaran untuk diperiksa admin.'
                        : needsQuote
                          ? 'Kirim kebutuhan project terlebih dahulu. Harga final akan dibahas dengan admin.'
                          : 'Isi data berikut untuk melanjutkan pemesanan layanan.'}
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

                {!createdOrder && !paymentData ? (
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
                            : 'Creating Order...'
                          : needsQuote
                            ? 'Kirim Request Quote'
                            : 'Buat Pesanan & Lihat Instruksi DP'}
                      </span>

                      {!isSubmitting && (
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      )}
                    </button>

                    <p className="text-center text-[10px] leading-5 text-zinc-400">
                      {needsQuote
                        ? 'Pembayaran belum dilakukan. Admin akan menghubungi kamu untuk pembahasan scope dan harga.'
                        : 'Nomor pesanan dan instruksi pembayaran akan ditampilkan setelah pesanan berhasil dibuat.'}
                    </p>
                  </form>
                ) : paymentData && createdOrder ? (
                  <div className="space-y-5 p-4 sm:p-6">
                    <div className="border border-violet-200 bg-violet-50 p-4 sm:p-5">
                      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-violet-700">Nomor Pesanan</p>
                      <p className="mt-2 break-all font-mono text-lg font-black text-violet-800">{createdOrder.order_number}</p>
                      <div className="mt-4 flex items-center gap-2 border-t border-violet-200 pt-3 text-xs font-bold text-amber-700">
                        <ShieldCheck className="h-4 w-4 shrink-0" />
                        Menunggu Verifikasi Admin
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="border border-violet-200 bg-violet-50 p-4">
                        <p className="text-[9px] font-black uppercase tracking-[0.16em] text-violet-700">DP 50% yang perlu dibayar</p>
                        <p className="mt-2 text-2xl font-black text-violet-800">{formatPrice(paymentData.amount)}</p>
                      </div>
                      <div className="border border-black/10 bg-zinc-50 p-4">
                        <p className="text-[9px] font-black uppercase tracking-[0.16em] text-zinc-500">Sisa pembayaran</p>
                        <p className="mt-2 text-2xl font-black text-zinc-900">{formatPrice(paymentData.remaining_amount)}</p>
                      </div>
                    </div>

                    <div className="border border-black/10 bg-white p-4 sm:p-5">
                      <p className="text-sm font-black text-zinc-950">Instruksi pembayaran</p>
                      <p className="mt-1 text-xs leading-5 text-zinc-500">Transfer sesuai nominal DP ke tujuan pembayaran berikut.</p>
                      <div className="mt-4 space-y-3">
                        {paymentData.payment_method === 'BANK_TRANSFER' ? (
                          <>
                            <div className="border border-black/10 bg-zinc-50 p-3">
                              <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Bank tujuan</p>
                              <p className="mt-1 font-black text-zinc-950">{paymentData.bank_name || 'Informasi bank tidak tersedia'}</p>
                            </div>
                            <div className="border border-black/10 bg-zinc-50 p-3">
                              <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Nomor rekening</p>
                              <div className="mt-1 flex items-center justify-between gap-3">
                                <p className="break-all font-mono text-lg font-black text-zinc-950">{paymentData.account_number || '-'}</p>
                                {paymentData.account_number && <button type="button" onClick={() => void navigator.clipboard?.writeText(paymentData.account_number || '')} className="shrink-0 text-xs font-bold text-violet-700">Salin</button>}
                              </div>
                            </div>
                            <div className="border border-black/10 bg-zinc-50 p-3">
                              <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Nama pemilik rekening</p>
                              <p className="mt-1 font-bold text-zinc-950">{paymentData.account_name || '-'}</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="border border-black/10 bg-zinc-50 p-3">
                              <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Nomor DANA</p>
                              <div className="mt-1 flex items-center justify-between gap-3">
                                <p className="break-all font-mono text-lg font-black text-zinc-950">{paymentData.dana_number || '-'}</p>
                                {paymentData.dana_number && <button type="button" onClick={() => void navigator.clipboard?.writeText(paymentData.dana_number || '')} className="shrink-0 text-xs font-bold text-violet-700">Salin</button>}
                              </div>
                            </div>
                            <div className="border border-black/10 bg-zinc-50 p-3">
                              <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Nama akun DANA</p>
                              <p className="mt-1 font-bold text-zinc-950">{paymentData.dana_name || '-'}</p>
                            </div>
                          </>
                        )}
                        <div className="border border-violet-200 bg-violet-50 p-3">
                          <p className="text-[9px] font-bold uppercase tracking-wider text-violet-700">Nominal transfer (DP 50%)</p>
                          <div className="mt-1 flex items-center justify-between gap-3">
                            <p className="text-xl font-black text-violet-800">{formatPrice(paymentData.amount)}</p>
                            <button type="button" onClick={() => void navigator.clipboard?.writeText(String(paymentData.amount))} className="shrink-0 text-xs font-bold text-violet-700">Salin nominal</button>
                          </div>
                        </div>
                      </div>
                      {paymentData.instructions && <p className="mt-3 whitespace-pre-line text-xs leading-5 text-zinc-500">{paymentData.instructions}</p>}
                      {paymentData.expires_at && <p className="mt-3 text-xs text-amber-700">Batas pembayaran: {new Date(paymentData.expires_at).toLocaleString('id-ID')}</p>}
                    </div>

                    <div className="border border-black/10 bg-zinc-50 p-4 sm:p-5">
                      <p className="text-sm font-black text-zinc-950">Unggah bukti pembayaran</p>
                      <p className="mt-1 text-xs leading-5 text-zinc-500">Format JPG, PNG, WEBP, atau PDF. Maksimal 5 MB. Pastikan nominal dan tujuan transfer terlihat jelas.</p>
                      {proofUploaded ? (
                        <div className="mt-4 border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-700">Bukti pembayaran berhasil diunggah. Menunggu pemeriksaan admin.</div>
                      ) : (
                        <>
                          <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(event) => { setProofFile(event.target.files?.[0] || null); setFormError('') }} disabled={isUploadingProof} className="mt-4 block w-full text-xs text-zinc-600 file:mr-3 file:border-0 file:bg-zinc-950 file:px-4 file:py-3 file:text-xs file:font-bold file:text-white hover:file:bg-violet-700" />
                          {proofFile && <p className="mt-2 break-all text-xs text-zinc-500">File dipilih: {proofFile.name}</p>}
                          <button type="button" onClick={() => void handleProofUpload()} disabled={!proofFile || isUploadingProof} className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 bg-zinc-950 px-4 text-sm font-black text-white transition hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-50">
                            {isUploadingProof ? <><Loader2 className="h-4 w-4 animate-spin" /> Mengunggah bukti...</> : 'Upload Bukti Pembayaran'}
                          </button>
                        </>
                      )}
                    </div>

                    {formError && <div className="break-words border border-red-200 bg-red-50 p-3 text-xs leading-5 text-red-600">{formError}</div>}

                    {proofUploaded && (
                      <div className="space-y-3">
                        <div className="border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">Bukti sudah tersimpan, tetapi pembayaran belum dianggap lunas. Admin akan memeriksa bukti transfer dan memperbarui status pesanan.</div>
                        <a href={createWhatsAppUrl()} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 w-full items-center justify-center gap-2 bg-[#25D366] px-4 text-sm font-black text-white transition hover:bg-[#1fb85a]">Konfirmasi Pesanan via WhatsApp <ArrowRight className="h-4 w-4" /></a>
                      </div>
                    )}

                    <div className="grid gap-3 sm:grid-cols-2">
                      <Link to={getTrackUrl(createdOrder.order_number, createdOrder.public_payment_token ?? '')} className="inline-flex min-h-11 items-center justify-center border border-black/10 bg-white px-4 text-sm font-bold text-zinc-800 transition hover:border-violet-300 hover:bg-violet-50">Track Order</Link>
                      <Link to="/services" className="inline-flex min-h-11 items-center justify-center border border-black/10 bg-white px-4 text-sm font-bold text-zinc-800 transition hover:border-violet-300 hover:bg-violet-50">Kembali ke Services</Link>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* ---------- Reveal ---------- */
        @keyframes sd-in {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .sd .sd-in {
          opacity: 0;
          animation: sd-in .85s cubic-bezier(.22,1,.36,1) var(--d, 0ms) forwards;
        }

        .sd .sd-rv {
          opacity: 0;
          transform: translate3d(0, 26px, 0);
          transition:
            opacity .8s cubic-bezier(.2,.7,.2,1) var(--d, 0ms),
            transform .8s cubic-bezier(.2,.7,.2,1) var(--d, 0ms),
            border-color .5s, box-shadow .5s;
        }
        .sd .sd-rv.is-visible { opacity: 1; transform: none; }
        .sd article.sd-rv.is-visible:hover { transform: translateY(-4px); transition-delay: 0ms; }

        @keyframes sd-up {
          from { transform: translateY(105%); }
          to   { transform: translateY(0); }
        }
        .sd .sd-up {
          transform: translateY(105%);
          animation: sd-up .95s cubic-bezier(.22,1,.36,1) var(--d, 0ms) forwards;
        }
        @keyframes sd-grow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        .sd .sd-grow {
          transform-origin: left;
          animation: sd-grow .9s cubic-bezier(.77,0,.18,1) .5s both;
        }

        /* ---------- Misc motion ---------- */
        @keyframes sd-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        .sd .sd-float { animation: sd-float 6s ease-in-out infinite; }
        .sd .sd-float-slow { animation: sd-float 9s ease-in-out infinite; }

        @keyframes sd-blink { 0%,100% { opacity: 1; } 50% { opacity: .25; } }
        .sd .sd-blink { animation: sd-blink 1.6s ease-in-out infinite; }

        @keyframes sd-twinkle {
          0%, 100% { opacity: .15; transform: scale(.6) rotate(45deg); }
          50% { opacity: 1; transform: scale(1) rotate(45deg); }
        }
        .sd .sd-twinkle { animation: sd-twinkle 3s ease-in-out infinite; }

        @keyframes sd-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(124,58,237,.35); }
          50% { box-shadow: 0 0 0 8px rgba(124,58,237,0); }
        }
        .sd .sd-pulse { animation: sd-pulse 2.4s ease-out infinite; }

        @keyframes sd-wiggle {
          0%, 80%, 100% { transform: rotate(0deg); }
          85% { transform: rotate(-14deg); }
          92% { transform: rotate(12deg); }
        }
        .sd .sd-wiggle { animation: sd-wiggle 3.6s ease-in-out infinite; }

        @keyframes sd-shine-loop {
          0%, 55% { left: -50%; opacity: 0; }
          65% { opacity: 1; }
          100% { left: 130%; opacity: 0; }
        }
        .sd .sd-shine-loop { animation: sd-shine-loop 4.5s ease-in-out infinite; }

        @keyframes sd-kb {
          from { transform: scale(1); }
          to   { transform: scale(1.07); }
        }
        .sd .sd-kb { animation: sd-kb 16s ease-in-out infinite alternate; }

        @keyframes sd-art-lift {
          from { transform: translate(236px, 168px); }
          to   { transform: translate(236px, 156px); }
        }
        .sd .sd-art-stack { animation: sd-art-lift 4s ease-in-out infinite alternate; }

        /* ---------- Stage 3D ---------- */
        .sd .sd-stage { perspective: 1100px; }
        .sd .sd-tilt {
          transform-style: preserve-3d;
          transform: rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg));
          transition: transform .35s cubic-bezier(.22,1,.36,1);
        }
        .sd .sd-z-a { transform: translateZ(80px); }
        .sd .sd-z-b { transform: translateZ(55px); }
        @media (max-width: 1023px) {
          .sd .sd-z-a, .sd .sd-z-b { transform: translateZ(26px); }
        }

        .sd .sd-glare {
          opacity: 0;
          transition: opacity .3s;
          background: radial-gradient(
            320px circle at var(--gx, 50%) var(--gy, 0%),
            rgba(255,255,255,.18),
            transparent 65%
          );
        }
        .sd .sd-stage:hover .sd-glare { opacity: 1; }

        .sd .sd-shine { opacity: 0; }
        .sd .sd-stage:hover .sd-shine { animation: sd-shine .9s ease-out; }
        @keyframes sd-shine {
          0% { left: -50%; opacity: 0; }
          30% { opacity: 1; }
          100% { left: 130%; opacity: 0; }
        }

        /* Kubus */
        .sd .sd-cube {
          --s: 38px;
          position: relative;
          width: var(--s);
          height: var(--s);
          transform-style: preserve-3d;
          animation: sd-cube 14s linear infinite;
        }
        @media (min-width: 640px) { .sd .sd-cube { --s: 50px; } }
        .sd .sd-cube-lg { --s: 64px; }
        @keyframes sd-cube {
          from { transform: rotateX(-24deg) rotateY(0deg); }
          to   { transform: rotateX(-24deg) rotateY(360deg); }
        }
        .sd .sd-cube i {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-style: normal;
          font-weight: 900;
          font-size: calc(var(--s) * .34);
          letter-spacing: -.06em;
          color: #7C3AED;
          border: 1.5px solid rgba(124,58,237,.85);
          background: rgba(124,58,237,.1);
        }
        .sd .sd-cube .f1 { transform: translateZ(calc(var(--s) / 2)); background: rgba(255,255,255,.85); }
        .sd .sd-cube .f2 { transform: rotateY(90deg) translateZ(calc(var(--s) / 2)); background: rgba(231,143,186,.4); }
        .sd .sd-cube .f3 { transform: rotateY(180deg) translateZ(calc(var(--s) / 2)); background: rgba(255,255,255,.85); }
        .sd .sd-cube .f4 { transform: rotateY(-90deg) translateZ(calc(var(--s) / 2)); background: rgba(124,58,237,.24); }
        .sd .sd-cube .f5 { transform: rotateX(90deg) translateZ(calc(var(--s) / 2)); background: rgba(231,143,186,.5); }
        .sd .sd-cube .f6 { transform: rotateX(-90deg) translateZ(calc(var(--s) / 2)); background: rgba(124,58,237,.32); }

        /* Bola */
        .sd .sd-sphere {
          width: 26px; height: 26px;
          border-radius: 9999px;
          background: radial-gradient(circle at 30% 28%, #fbd5e6 0%, #E78FBA 38%, #7C3AED 100%);
          box-shadow: 0 12px 18px -6px rgba(124,58,237,.55);
        }
        @media (min-width: 1024px) { .sd .sd-sphere { width: 38px; height: 38px; } }

        .sd .sd-plane { transform: rotateY(-14deg) rotateX(6deg); }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            scroll-behavior: auto !important;
            transition-duration: 0.01ms !important;
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
          }
          .sd .sd-in, .sd .sd-rv, .sd .sd-up {
            opacity: 1 !important;
            transform: none !important;
          }
          .sd .sd-grow { transform: scaleX(1) !important; }
          .sd .sd-tilt { transform: none !important; }
        }
      `}</style>
    </section>
  )
}