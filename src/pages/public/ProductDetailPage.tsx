import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type PointerEvent,
  type MouseEvent as ReactMouseEvent,
  type TouchEvent as ReactTouchEvent,
  type WheelEvent as ReactWheelEvent,
} from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Disc3,
  Expand,
  Loader2,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Tag,
  X,
  ZoomIn,
  ZoomOut,
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
  image_urls?: string[] | null
  images?: string[] | null
  gallery?: string[] | null
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
  payment_method?: 'BANK_TRANSFER' | null
  payment_method2?: 'DANA' | null
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

const delay = (ms: number) =>
  ({ '--d': `${ms}ms` }) as CSSProperties

/* Gambar dummy lokal (SVG) — dipakai bila foto produk kosong / gagal */
function ProductArt() {
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
          <radialGradient id="pd-art-a" cx="18%" cy="12%" r="75%">
            <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="pd-art-b" cx="92%" cy="96%" r="60%">
            <stop offset="0%" stopColor="#E78FBA" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#E78FBA" stopOpacity="0" />
          </radialGradient>
          <pattern
            id="pd-art-g"
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

        <rect width="400" height="320" fill="url(#pd-art-a)" />
        <rect width="400" height="320" fill="url(#pd-art-b)" />
        <rect width="400" height="320" fill="url(#pd-art-g)" />

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

        {/* disc / produk digital */}
        <g className="pd-art-disc" transform="translate(272 150)">
          {[84, 62, 40].map((r, i) => (
            <circle
              key={r}
              r={r}
              fill="none"
              stroke="#fff"
              strokeOpacity={0.14 + i * 0.1}
            />
          ))}
          <circle r="84" fill="#7C3AED" fillOpacity="0.28" />
          <circle r="22" fill="#E78FBA" />
          <circle r="7" fill="#0d0820" />
          <path
            d="M0 -84 A84 84 0 0 1 72 -42"
            fill="none"
            stroke="#fff"
            strokeOpacity="0.7"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  )
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

  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<'BANK_TRANSFER' | 'DANA' | null>(null)

  const [isUploadingProof, setIsUploadingProof] =
    useState(false)

  const [proofFile, setProofFile] =
    useState<File | null>(null)

  const [proofUploaded, setProofUploaded] =
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

  /*
   * =========================================================
   * IMAGE VIEWER STATE
   * =========================================================
   */

  const [showImageViewer, setShowImageViewer] =
    useState(false)

  const [activeImageIndex, setActiveImageIndex] =
    useState(0)

  const [imageZoom, setImageZoom] =
    useState(1)

  const [imagePosition, setImagePosition] =
    useState({
      x: 0,
      y: 0,
    })

  const [isDraggingImage, setIsDraggingImage] =
    useState(false)

  const [dragStart, setDragStart] =
    useState({
      x: 0,
      y: 0,
    })

  const [dragOrigin, setDragOrigin] =
    useState({
      x: 0,
      y: 0,
    })

  const [touchStart, setTouchStart] =
    useState({
      x: 0,
      y: 0,
    })

  /*
   * =========================================================
   * HELPERS
   * =========================================================
   */

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
      String(WHATSAPP_NUMBER ?? ''),
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
      `Produk: ${createdOrder.product_name}`,
      `Nama: ${createdOrder.customer_name}`,
      `Metode pembayaran: ${selectedPaymentMethod === 'DANA' ? 'DANA' : 'Transfer Bank'}`,
      `Nominal transfer: ${formatPrice(dpAmount)}`,
      'Status bukti: Sudah diunggah, menunggu verifikasi admin.',
      '',
      `Track Order: ${trackUrl}`,
      '',
      'Mohon bantu verifikasi pembayaran saya. Terima kasih.',
    ].join('\n')

    return `https://wa.me/${destination}?text=${encodeURIComponent(message)}`
  }

  /*
   * =========================================================
   * PRODUCT IMAGES
   * =========================================================
   */

  const productImages = useMemo(() => {
    if (!product) {
      return []
    }

    const backendGallery = Array.isArray(
      product.image_urls,
    )
      ? product.image_urls.filter(
        (image): image is string =>
          typeof image === 'string' &&
          image.trim().length > 0,
      )
      : []

    const galleryImages = Array.isArray(
      product.images,
    )
      ? product.images.filter(
        (image): image is string =>
          typeof image === 'string' &&
          image.trim().length > 0,
      )
      : []

    const legacyGallery = Array.isArray(
      product.gallery,
    )
      ? product.gallery.filter(
        (image): image is string =>
          typeof image === 'string' &&
          image.trim().length > 0,
      )
      : []

    const primaryImage =
      typeof product.image_url === 'string' &&
        product.image_url.trim().length > 0
        ? [product.image_url]
        : []

    return Array.from(
      new Set([
        ...primaryImage,
        ...backendGallery,
        ...galleryImages,
        ...legacyGallery,
      ]),
    )
  }, [product])

  const currentImage =
    productImages[activeImageIndex] ??
    productImages[0] ??
    null

  /*
   * =========================================================
   * IMAGE VIEWER FUNCTIONS
   * =========================================================
   */

  const resetImageViewer = () => {
    setImageZoom(1)

    setImagePosition({
      x: 0,
      y: 0,
    })

    setIsDraggingImage(false)
  }

  const openImageViewer = (
    index = 0,
  ) => {
    if (
      productImages.length === 0
    ) {
      return
    }

    setActiveImageIndex(
      Math.max(
        0,
        Math.min(
          index,
          productImages.length - 1,
        ),
      ),
    )

    resetImageViewer()
    setShowImageViewer(true)
  }

  const closeImageViewer = () => {
    setShowImageViewer(false)
    resetImageViewer()
  }

  const goToPreviousImage = () => {
    if (productImages.length <= 1) {
      return
    }

    setActiveImageIndex(
      (current) =>
        current === 0
          ? productImages.length - 1
          : current - 1,
    )

    resetImageViewer()
  }

  const goToNextImage = () => {
    if (productImages.length <= 1) {
      return
    }

    setActiveImageIndex(
      (current) =>
        current ===
          productImages.length - 1
          ? 0
          : current + 1,
    )

    resetImageViewer()
  }

  const changeZoom = (
    amount: number,
  ) => {
    setImageZoom((current) => {
      const nextZoom = Math.max(
        1,
        Math.min(
          4,
          Number(
            (current + amount).toFixed(
              2,
            ),
          ),
        ),
      )

      if (nextZoom === 1) {
        setImagePosition({
          x: 0,
          y: 0,
        })
      }

      return nextZoom
    })
  }

  const handleImageWheel = (
    event: ReactWheelEvent<HTMLDivElement>,
  ) => {
    event.preventDefault()

    if (event.deltaY < 0) {
      changeZoom(0.25)
    } else {
      changeZoom(-0.25)
    }
  }

  const handleImageMouseDown = (
    event: ReactMouseEvent<HTMLDivElement>,
  ) => {
    if (imageZoom <= 1) {
      return
    }

    event.preventDefault()

    setIsDraggingImage(true)

    setDragStart({
      x: event.clientX,
      y: event.clientY,
    })

    setDragOrigin({
      x: imagePosition.x,
      y: imagePosition.y,
    })
  }

  const handleImageMouseMove = (
    event: ReactMouseEvent<HTMLDivElement>,
  ) => {
    if (
      !isDraggingImage ||
      imageZoom <= 1
    ) {
      return
    }

    const deltaX =
      event.clientX - dragStart.x

    const deltaY =
      event.clientY - dragStart.y

    setImagePosition({
      x: dragOrigin.x + deltaX,
      y: dragOrigin.y + deltaY,
    })
  }

  const stopDraggingImage = () => {
    setIsDraggingImage(false)
  }

  const handleImageTouchStart = (
    event: ReactTouchEvent<HTMLDivElement>,
  ) => {
    const touch = event.touches[0]

    if (!touch) {
      return
    }

    setTouchStart({
      x: touch.clientX,
      y: touch.clientY,
    })

    if (imageZoom > 1) {
      setDragStart({
        x: touch.clientX,
        y: touch.clientY,
      })

      setDragOrigin({
        x: imagePosition.x,
        y: imagePosition.y,
      })
    }
  }

  const handleImageTouchMove = (
    event: ReactTouchEvent<HTMLDivElement>,
  ) => {
    const touch = event.touches[0]

    if (
      !touch ||
      imageZoom <= 1
    ) {
      return
    }

    const deltaX =
      touch.clientX - dragStart.x

    const deltaY =
      touch.clientY - dragStart.y

    setImagePosition({
      x: dragOrigin.x + deltaX,
      y: dragOrigin.y + deltaY,
    })
  }

  const handleImageTouchEnd = (
    event: ReactTouchEvent<HTMLDivElement>,
  ) => {
    const touch =
      event.changedTouches[0]

    if (!touch) {
      return
    }

    const deltaX =
      touch.clientX - touchStart.x

    const deltaY =
      touch.clientY - touchStart.y

    const minimumSwipe = 60

    if (
      imageZoom <= 1 &&
      Math.abs(deltaX) >= minimumSwipe &&
      Math.abs(deltaX) >
      Math.abs(deltaY) * 1.25
    ) {
      if (deltaX < 0) {
        goToNextImage()
      } else {
        goToPreviousImage()
      }
    }

    setIsDraggingImage(false)
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

          setActiveImageIndex(0)
          resetImageViewer()

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
   * KEYBOARD IMAGE VIEWER
   * =========================================================
   */

  useEffect(() => {
    if (!showImageViewer) {
      return
    }

    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (event.key === 'Escape') {
        closeImageViewer()
        return
      }

      if (
        event.key === 'ArrowLeft'
      ) {
        event.preventDefault()
        goToPreviousImage()
        return
      }

      if (
        event.key === 'ArrowRight'
      ) {
        event.preventDefault()
        goToNextImage()
        return
      }

      if (
        event.key === '+' ||
        event.key === '='
      ) {
        event.preventDefault()
        changeZoom(0.25)
        return
      }

      if (event.key === '-') {
        event.preventDefault()
        changeZoom(-0.25)
        return
      }

      if (event.key === '0') {
        event.preventDefault()
        resetImageViewer()
      }
    }

    document.addEventListener(
      'keydown',
      handleKeyDown,
    )

    const previousOverflow =
      document.body.style.overflow

    document.body.style.overflow =
      'hidden'

    return () => {
      document.removeEventListener(
        'keydown',
        handleKeyDown,
      )

      document.body.style.overflow =
        previousOverflow
    }
  }, [
    showImageViewer,
    productImages.length,
    activeImageIndex,
    imageZoom,
    imagePosition,
  ])

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
    setSelectedPaymentMethod(null)
    setCreatedOrder(null)
    setProofFile(null)
    setProofUploaded(false)
    setIsUploadingProof(false)
  }

  const closeCheckout = () => {
    if (isSubmitting || isUploadingProof) return
    setShowCheckout(false)
    resetCheckout()
  }

  /* =========================================================
   * CREATE PRODUCT ORDER WITH MANUAL PAYMENT INSTRUCTIONS
   * ========================================================= */
  const handleCheckout = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!product) return
    setFormError('')

    if (!customerName.trim()) return setFormError('Nama wajib diisi.')
    if (!customerEmail.trim()) return setFormError('Email wajib diisi.')
    if (!customerPhone.trim()) return setFormError('Nomor WhatsApp wajib diisi.')
    if (!Number.isInteger(quantity) || quantity < 1) return setFormError('Quantity minimal 1.')
    if (Number(product.stock) <= 0) return setFormError('Produk sedang habis.')
    if (quantity > Number(product.stock)) {
      return setFormError(`Quantity melebihi stok tersedia (${product.stock}).`)
    }

    try {
      setIsSubmitting(true)
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'Product',
          product_id: product.id,
          service_id: null,
          customer_name: customerName.trim(),
          customer_email: customerEmail.trim(),
          customer_phone: customerPhone.trim(),
          quantity,
        }),
      })

      const result = await response.json()
      if (!response.ok || !result?.success) {
        throw new Error(result?.message || `Gagal membuat pesanan (${response.status}).`)
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
      const hasBankTransfer = instruction?.payment_method === 'BANK_TRANSFER'
      const hasDana = instruction?.payment_method2 === 'DANA'

      if ((!hasBankTransfer && !hasDana) || !Number.isFinite(Number(instruction?.amount))) {
        throw new Error('Instruksi pembayaran belum tersedia. Silakan hubungi admin.')
      }

      setCreatedOrder(order as Order)
      setPaymentData({
        ...instruction,
        amount: Number(instruction.amount),
        remaining_amount: Number(instruction.remaining_amount ?? order.remaining_amount ?? 0),
        payment_stage: instruction.payment_stage === 'FINAL' ? 'FINAL' : 'DP',
      } as PaymentData)
      setSelectedPaymentMethod(null)
      setProofFile(null)
      setProofUploaded(false)
    } catch (err) {
      console.error('Create product order error:', err)
      setFormError(err instanceof Error ? err.message : 'Gagal membuat pesanan.')
    } finally {
      setIsSubmitting(false)
    }
  }

  /* =========================================================
   * UPLOAD PAYMENT PROOF
   * ========================================================= */
  const handleProofUpload = async () => {
    if (!selectedPaymentMethod) {
      setFormError('Pilih metode pembayaran DANA atau Transfer Bank terlebih dahulu.')
      return
    }
    if (!createdOrder || !proofFile) {
      setFormError('Pilih file bukti pembayaran terlebih dahulu.')
      return
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
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
      formData.append('payment_method', selectedPaymentMethod)
      const response = await fetch(
        `${API_BASE_URL}/api/orders/${encodeURIComponent(createdOrder.order_number)}/payment-proof`,
        { method: 'POST', body: formData },
      )
      const result = await response.json()
      if (!response.ok || !result?.success) {
        throw new Error(result?.message || `Gagal mengunggah bukti (${response.status}).`)
      }
      setProofUploaded(true)
      setFormError('')
    } catch (err) {
      console.error('Upload payment proof error:', err)
      setFormError(err instanceof Error ? err.message : 'Gagal mengunggah bukti pembayaran.')
    } finally {
      setIsUploadingProof(false)
    }
  }

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
   * DYNAMIC SEO
   * =========================================================
   *
   * Metadata mengikuti data produk yang dipublikasikan.
   * Tidak menambah dependency dan tidak mengubah logic checkout,
   * payment, gallery, zoom, atau UI yang sudah ada.
   */
  useEffect(() => {
    const siteName = '39Production'
    const fallbackTitle = 'Products — 39Production'
    const fallbackDescription =
      'Explore digital products crafted by 39Production for creators, brands, and modern digital experiences.'

    const siteOrigin =
      typeof window !== 'undefined'
        ? window.location.origin
        : 'https://fiidhanz.github.io'

    const productUrl =
      typeof window !== 'undefined'
        ? window.location.href.split('#')[0]
        : `${siteOrigin}/products/${id ?? ''}`

    const title = product
      ? `${product.name} — ${siteName}`
      : fallbackTitle

    const description = product?.description?.trim()
      ? product.description.trim().slice(0, 160)
      : fallbackDescription

    const image = productImages[0] || undefined

    const setMeta = (
      key: string,
      attribute: 'name' | 'property',
      value: string,
    ) => {
      let element = document.head.querySelector<HTMLMetaElement>(
        `meta[${attribute}="${key}"]`,
      )

      if (!element) {
        element = document.createElement('meta')
        element.setAttribute(attribute, key)
        document.head.appendChild(element)
      }

      element.setAttribute('content', value)
    }

    const setLink = (
      rel: string,
      href: string,
    ) => {
      let element = document.head.querySelector<HTMLLinkElement>(
        `link[rel="${rel}"]`,
      )

      if (!element) {
        element = document.createElement('link')
        element.setAttribute('rel', rel)
        document.head.appendChild(element)
      }

      element.setAttribute('href', href)
    }

    document.title = title

    setMeta('description', 'name', description)

    setMeta(
      'robots',
      'name',
      product
        ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        : 'noindex, nofollow',
    )

    setMeta(
      'googlebot',
      'name',
      product
        ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        : 'noindex, nofollow',
    )

    setMeta('author', 'name', siteName)
    setMeta('theme-color', 'name', '#ffffff')

    setMeta('og:type', 'property', 'product')
    setMeta('og:site_name', 'property', siteName)
    setMeta('og:title', 'property', title)
    setMeta('og:description', 'property', description)
    setMeta('og:url', 'property', productUrl)

    if (image) {
      setMeta('og:image', 'property', image)
      setMeta(
        'og:image:alt',
        'property',
        product?.name || siteName,
      )

      setMeta('twitter:image', 'name', image)
      setMeta(
        'twitter:image:alt',
        'name',
        product?.name || siteName,
      )
    }

    setMeta(
      'twitter:card',
      'name',
      image ? 'summary_large_image' : 'summary',
    )

    setMeta('twitter:title', 'name', title)
    setMeta(
      'twitter:description',
      'name',
      description,
    )

    setLink(
      'canonical',
      product ? productUrl : siteOrigin,
    )

    document
      .head
      .querySelectorAll(
        'script[data-39production-product-schema="true"]',
      )
      .forEach((element) => element.remove())

    if (product) {
      const price = Number(
        promotion && discount > 0
          ? finalPrice
          : product.price,
      )

      const availability =
        Number(product.stock) > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock'

      const productSchema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description,
        category:
          product.category || 'Digital Product',
        image: productImages,
        url: productUrl,
        brand: {
          '@type': 'Brand',
          name: siteName,
        },
        offers: {
          '@type': 'Offer',
          url: productUrl,
          priceCurrency: 'IDR',
          price: price.toString(),
          availability,
          itemCondition:
            'https://schema.org/NewCondition',
        },
      }

      const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: siteName,
            item: siteOrigin,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Products',
            item: `${siteOrigin}/products`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: product.name,
            item: productUrl,
          },
        ],
      }

      const script = document.createElement('script')
      script.type = 'application/ld+json'
      script.dataset['39productionProductSchema'] =
        'true'
      script.textContent = JSON.stringify([
        productSchema,
        breadcrumbSchema,
      ])

      document.head.appendChild(script)
    }

    return () => {
      document
        .head
        .querySelectorAll(
          'script[data-39production-product-schema="true"]',
        )
        .forEach((element) => element.remove())
    }
  }, [
    id,
    product,
    productImages,
    promotion,
    discount,
    finalPrice,
  ])


  /*
   * =========================================================
   * MOTION
   * =========================================================
   */

  const rootRef = useRef<HTMLElement | null>(null)
  const stageRef = useRef<HTMLDivElement | null>(null)

  const [failedImage, setFailedImage] =
    useState<string | null>(null)

  const imageFailed =
    currentImage !== null &&
    failedImage === currentImage

  const setImageFailed = (failed: boolean) =>
    setFailedImage(failed ? currentImage : null)

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
  }, [loading, product, promotion])

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

  /*
   * =========================================================
   * LOADING
   * =========================================================
   */

  if (loading) {
    return (
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-4 py-8 text-zinc-950 sm:px-5">
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

        <div className="relative w-full max-w-md border border-black/10 bg-white p-6 text-center shadow-[0_25px_80px_rgba(0,0,0,0.06)] sm:p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center bg-violet-50 text-violet-600">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>

          <p className="mt-5 text-lg font-black tracking-tight">
            Loading product
          </p>

          <p className="mt-1 text-sm text-zinc-500">
            Menyiapkan detail produk...
          </p>
        </div>
      </section>
    )
  }

  /*
   * =========================================================
   * ERROR
   * =========================================================
   */

  if (error || !product) {
    return (
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-4 py-8 text-zinc-950 sm:px-5">
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

        <div className="relative w-full max-w-lg border border-black/10 bg-white p-6 text-center shadow-[0_25px_80px_rgba(0,0,0,0.06)] sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center bg-red-50 text-red-600">
            <Disc3 className="h-7 w-7" />
          </div>

          <h1 className="mt-5 text-2xl font-black tracking-tight sm:text-3xl">
            Product tidak ditemukan
          </h1>

          <p className="mt-3 text-sm leading-6 text-zinc-500">
            {error ||
              'Produk yang kamu cari tidak tersedia.'}
          </p>

          <Link
            to="/products"
            className="mt-7 inline-flex min-h-11 max-w-full items-center justify-center gap-2 bg-zinc-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-violet-600"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" />
            Kembali ke Products
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section
      ref={rootRef}
      className="pd relative isolate min-h-screen overflow-x-clip bg-white text-zinc-950"
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
        className="pointer-events-none absolute left-[-12rem] top-32 h-[420px] w-[420px] rounded-full bg-violet-100/50 blur-[130px]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-12rem] top-[38%] h-[420px] w-[420px] rounded-full bg-pink-100/40 blur-[130px]"
      />

      <div
        aria-hidden="true"
        className="pd-twinkle pointer-events-none absolute left-[7%] top-[20%] h-2 w-2 bg-violet-600"
      />

      <div
        aria-hidden="true"
        className="pd-twinkle pointer-events-none absolute right-[10%] top-[46%] h-1.5 w-1.5 bg-pink-400"
        style={{ animationDelay: '1.2s' }}
      />

      <main className="relative z-10 mx-auto w-full max-w-[1600px] overflow-x-hidden px-4 pb-16 pt-16 sm:px-6 sm:pb-20 sm:pt-20 md:px-8 md:pt-24 lg:px-12 lg:pb-28 lg:pt-24">
        {/* =====================================================
            EDITORIAL HEADER
        ====================================================== */}

        <div className="pd-in mb-8 flex min-w-0 items-center justify-between gap-4 border-b border-black/10 pb-4 sm:mb-10 sm:pb-5">
          <div className="flex min-w-0 max-w-full items-center gap-2 overflow-hidden text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-500 sm:gap-3 sm:text-xs sm:tracking-[0.24em]">
            <Link
              to="/products"
              className="shrink-0 text-zinc-950 transition hover:text-violet-600"
            >
              39Production
            </Link>

            <span className="pd-blink h-1.5 w-1.5 shrink-0 bg-violet-600" />

            <span className="shrink-0">
              Products
            </span>

            <span className="h-1 w-1 shrink-0 bg-zinc-300" />

            <span className="truncate">
              Detail
            </span>
          </div>

          <div className="hidden shrink-0 items-center gap-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400 sm:flex">
            <span>Digital</span>
            <span>/</span>
            <span>Creative</span>
            <span>/</span>
            <span>Product</span>
          </div>
        </div>

        {/* =====================================================
            BACK
        ====================================================== */}

        <Link
          to="/products"
          className="pd-in group mb-7 inline-flex max-w-full items-center gap-3 text-[9px] font-black uppercase tracking-[0.16em] text-zinc-500 transition hover:text-violet-700 sm:mb-10 sm:text-[10px] sm:tracking-[0.18em]"
          style={delay(80)}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-black/10 bg-white transition group-hover:border-violet-600 group-hover:bg-violet-600 group-hover:text-white">
            <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
          </span>

          Back to Products
        </Link>

        {/* =====================================================
            PRODUCT CONTENT
        ====================================================== */}

        <div className="grid min-w-0 items-start gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16 xl:gap-20">
          {/* =================================================
              PRODUCT VISUAL — stage 3D
          ================================================== */}

          <div
            className="pd-in min-w-0 lg:sticky lg:top-28"
            style={delay(140)}
          >
            <div
              ref={stageRef}
              onPointerMove={onStageMove}
              onPointerLeave={onStageLeave}
              className="pd-stage relative"
            >
              <div className="pd-tilt relative">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-4 bg-violet-100/30 blur-3xl sm:-inset-8"
                />

                <div className="relative min-w-0 overflow-hidden border border-black/10 bg-[#0d0820] shadow-[0_20px_60px_rgba(0,0,0,0.07)] sm:shadow-[0_30px_90px_rgba(0,0,0,0.08)]">
                  <button
                    type="button"
                    onClick={() =>
                      openImageViewer(
                        activeImageIndex,
                      )
                    }
                    disabled={
                      productImages.length === 0
                    }
                    aria-label="Open product image"
                    className="group relative block aspect-square w-full cursor-zoom-in overflow-hidden bg-[#0d0820] text-left sm:aspect-[5/4] lg:aspect-[4/3]"
                  >
                    {currentImage && !imageFailed ? (
                      <>
                        <img
                          key={currentImage}
                          src={currentImage}
                          alt={product.name}
                          className="pd-kb absolute inset-0 h-full w-full object-cover"
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
                            if (
                              event.currentTarget.naturalWidth === 0
                            ) {
                              setImageFailed(true)
                            }
                          }}
                        />

                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />

                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-500/[0.08] via-transparent to-pink-500/[0.08] mix-blend-soft-light" />
                      </>
                    ) : (
                      <>
                        <ProductArt />

                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      </>
                    )}

                    <div className="pd-glare pointer-events-none absolute inset-0 z-10" />
                    <div className="pd-shine pointer-events-none absolute inset-y-0 -left-1/2 z-10 w-1/3 -skew-x-12 bg-white/20" />

                    <div className="absolute left-3 top-3 z-20 sm:left-5 sm:top-5">
                      <span className="inline-flex items-center gap-2 border border-white/25 bg-black/55 px-2.5 py-1.5 text-[8px] font-black uppercase tracking-[0.16em] text-white backdrop-blur-md sm:px-3 sm:text-[9px] sm:tracking-[0.18em]">
                        Product{' '}
                        {String(
                          activeImageIndex + 1,
                        ).padStart(
                          2,
                          '0',
                        )}
                      </span>
                    </div>

                    <div className="absolute right-3 top-3 z-20 sm:right-5 sm:top-5">
                      <span
                        className={`inline-flex items-center gap-2 border px-2.5 py-1.5 text-[8px] font-black uppercase tracking-[0.12em] backdrop-blur-md sm:px-3 sm:text-[9px] sm:tracking-[0.15em] ${Number(
                          product.stock,
                        ) > 0
                          ? 'border-white/25 bg-white/90 text-zinc-900'
                          : 'border-red-200 bg-white/95 text-red-700'
                          }`}
                      >
                        <span
                          className={`pd-blink h-1.5 w-1.5 shrink-0 ${Number(
                            product.stock,
                          ) > 0
                            ? 'bg-emerald-500'
                            : 'bg-red-500'
                            }`}
                        />

                        <span className="hidden xs:inline">
                          {Number(
                            product.stock,
                          ) > 0
                            ? 'Available'
                            : 'Out of Stock'}
                        </span>

                        <span className="xs:hidden">
                          {Number(
                            product.stock,
                          ) > 0
                            ? 'In Stock'
                            : 'Sold Out'}
                        </span>
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 z-20 sm:bottom-5 sm:left-5 sm:right-5">
                      <div className="flex min-w-0 items-end justify-between gap-3 sm:gap-5">
                        <div className="min-w-0 border-l-2 border-violet-400 pl-3">
                          <p className="truncate text-[8px] font-black uppercase tracking-[0.16em] text-white/55 sm:text-[9px] sm:tracking-[0.2em]">
                            {product.category ||
                              '39Production Product'}
                          </p>

                          <p className="mt-1 truncate text-base font-black tracking-tight text-white sm:text-xl">
                            {product.name}
                          </p>
                        </div>

                        <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-white/25 bg-black/55 text-white backdrop-blur-md transition-all duration-300 group-hover:border-violet-400 group-hover:bg-violet-600 sm:h-10 sm:w-10">
                          <Expand className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </button>

                  {productImages.length >
                    1 && (
                      <div className="flex min-w-0 items-center gap-2 border-t border-black/10 bg-white p-2.5 sm:p-3">
                        <button
                          type="button"
                          onClick={
                            goToPreviousImage
                          }
                          aria-label="Previous image"
                          className="flex h-9 w-9 shrink-0 items-center justify-center border border-black/10 bg-white text-zinc-600 transition hover:border-violet-600 hover:bg-violet-600 hover:text-white sm:h-10 sm:w-10"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>

                        <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto overscroll-x-contain scrollbar-none">
                          {productImages.map(
                            (
                              image,
                              index,
                            ) => (
                              <button
                                key={`${image}-${index}`}
                                type="button"
                                onClick={() => {
                                  setActiveImageIndex(
                                    index,
                                  )
                                  resetImageViewer()
                                }}
                                aria-label={`View image ${index + 1}`}
                                className={`relative h-14 w-16 shrink-0 overflow-hidden border transition sm:h-16 sm:w-20 ${activeImageIndex ===
                                  index
                                  ? 'border-violet-600 ring-1 ring-violet-600'
                                  : 'border-black/10 opacity-60 hover:opacity-100'
                                  }`}
                              >
                                <img
                                  src={image}
                                  alt=""
                                  className="h-full w-full bg-zinc-100 object-contain p-1"
                                />

                                {activeImageIndex ===
                                  index && (
                                    <span className="absolute inset-x-0 bottom-0 h-0.5 bg-violet-600" />
                                  )}
                              </button>
                            ),
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={
                            goToNextImage
                          }
                          aria-label="Next image"
                          className="flex h-9 w-9 shrink-0 items-center justify-center border border-black/10 bg-white text-zinc-600 transition hover:border-violet-600 hover:bg-violet-600 hover:text-white sm:h-10 sm:w-10"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                </div>

                {/* 3D melayang */}
                <div
                  aria-hidden="true"
                  className="pd-z-a pointer-events-none absolute -right-2 -top-6 z-30 sm:-right-5 sm:-top-8"
                >
                  <div className="pd-float-slow">
                    <div className="pd-cube">
                      <i className="f1">39</i>
                      <i className="f2" />
                      <i className="f3">P</i>
                      <i className="f4" />
                      <i className="f5" />
                      <i className="f6" />
                    </div>
                  </div>
                </div>

                <div
                  aria-hidden="true"
                  className="pd-z-b pointer-events-none absolute -bottom-3 -left-2 z-30 sm:-bottom-5 sm:-left-4"
                >
                  <div className="pd-float" style={{ animationDelay: '-2s' }}>
                    <div className="pd-sphere" />
                  </div>
                </div>

                <div
                  aria-hidden="true"
                  className="pd-z-b pointer-events-none absolute -bottom-4 right-4 z-30 hidden sm:block"
                >
                  <div className="pd-float" style={{ animationDelay: '-3.5s' }}>
                    <div className="pd-plane border border-zinc-950 bg-white px-2.5 py-1.5 shadow-[5px_5px_0_0_rgba(124,58,237,0.9)]">
                      <p className="flex items-center gap-1.5 font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-violet-600">
                        <span className="pd-blink h-1.5 w-1.5 bg-violet-600" />
                        Digital product
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex min-w-0 items-center justify-between gap-3 text-[8px] font-bold uppercase tracking-[0.14em] text-zinc-400 sm:mt-8 sm:text-[9px] sm:tracking-[0.18em]">
                <span className="inline-flex min-w-0 items-center gap-1.5">
                  <ZoomIn className="h-3.5 w-3.5 shrink-0 text-violet-600" />
                  <span className="truncate">
                    Click image to zoom
                  </span>
                </span>

                {productImages.length >
                  1 && (
                    <span className="shrink-0">
                      {activeImageIndex +
                        1}{' '}
                      /{' '}
                      {
                        productImages.length
                      }
                    </span>
                  )}
              </div>
            </div>
          </div>

          {/* =================================================
              PRODUCT INFORMATION
          ================================================== */}

          <div className="min-w-0">
            <div
              className="pd-in flex flex-wrap items-center gap-2 sm:gap-3"
              style={delay(200)}
            >
              <span className="inline-flex items-center gap-2 border border-violet-200 bg-violet-50 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-[0.15em] text-violet-700 sm:px-3 sm:text-[10px] sm:tracking-[0.18em]">
                <Sparkles className="pd-wiggle h-3.5 w-3.5 shrink-0" />
                Digital Product
              </span>

              {product.category && (
                <span className="max-w-full truncate text-[9px] font-black uppercase tracking-[0.15em] text-zinc-400 sm:text-[10px] sm:tracking-[0.18em]">
                  / {product.category}
                </span>
              )}

              {Number(product.stock) > 0 &&
                Number(product.stock) <= 5 && (
                  <span className="pd-pulse border border-amber-200 bg-amber-50 px-2.5 py-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-amber-700">
                    Only {product.stock} left
                  </span>
                )}
            </div>

            <div className="mt-5 sm:mt-6">
              <p
                className="pd-in flex items-center gap-3 font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-violet-600 sm:text-[10px]"
                style={delay(260)}
              >
                <span className="pd-grow h-px w-8 bg-violet-600" />
                01 / Product Detail
              </p>

              <h1 className="mt-4 max-w-5xl break-words text-[clamp(2.5rem,10vw,6.5rem)] font-black leading-[0.92] tracking-[-0.06em] text-zinc-950 sm:text-[clamp(3rem,6vw,6.5rem)]">
                <span className="block overflow-hidden pb-[0.08em]">
                  <span
                    className="pd-up block"
                    style={delay(320)}
                  >
                    {product.name}
                  </span>
                </span>
              </h1>
            </div>

            <div
              className="pd-in mt-7 border-y border-black/10 py-5 sm:mt-9 sm:py-6"
              style={delay(440)}
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0">
                  {promotion &&
                    discount > 0 && (
                      <p className="text-xs text-zinc-400 line-through sm:text-sm">
                        {formatPrice(
                          subtotal,
                        )}
                      </p>
                    )}

                  <div className="mt-1 flex flex-wrap items-center gap-2 sm:items-baseline sm:gap-3">
                    <span className="break-words text-2xl font-black tracking-[-0.04em] text-zinc-950 sm:text-4xl">
                      {formatPrice(
                        finalPrice,
                      )}
                    </span>

                    {promotion &&
                      discount > 0 && (
                        <span className="pd-pulse border border-emerald-200 bg-emerald-50 px-2 py-1 text-[8px] font-black uppercase tracking-[0.1em] text-emerald-700 sm:px-2.5 sm:text-[10px] sm:tracking-[0.12em]">
                          Save{' '}
                          {formatPrice(
                            discount,
                          )}
                        </span>
                      )}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-black/5 pt-4 sm:block sm:border-0 sm:pt-0 sm:text-right">
                  <p className="text-[8px] font-black uppercase tracking-[0.16em] text-zinc-400 sm:text-[9px] sm:tracking-[0.18em]">
                    Available Stock
                  </p>

                  <p className="font-mono text-lg font-black text-zinc-950 sm:mt-1">
                    {product.stock}
                  </p>
                </div>
              </div>
            </div>

            {promotion && (
              <div
                data-reveal
                className="pd-rv relative mt-6 overflow-hidden border border-violet-200 bg-violet-50 sm:mt-7"
              >
                <div className="pd-shine-loop pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/50" />

                <div className="relative flex items-start gap-3 p-4 sm:gap-4 sm:p-5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-violet-600 text-white sm:h-10 sm:w-10">
                    <Tag className="pd-wiggle h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-[8px] font-black uppercase tracking-[0.16em] text-violet-700 sm:text-[9px] sm:tracking-[0.18em]">
                          Special Promotion
                        </p>

                        <h2 className="mt-1 break-words text-sm font-black text-zinc-950 sm:text-base">
                          {
                            promotion.title
                          }
                        </h2>
                      </div>

                      <span className="w-fit max-w-full shrink-0 border border-violet-200 bg-white px-2.5 py-1.5 text-[8px] font-black uppercase tracking-[0.1em] text-violet-700 sm:px-3 sm:text-[10px] sm:tracking-[0.12em]">
                        {getDiscountLabel()}
                      </span>
                    </div>

                    <p className="mt-2 break-words text-xs leading-5 text-zinc-600 sm:text-sm">
                      {
                        promotion.description
                      }
                    </p>

                    <div className="mt-3 inline-flex max-w-full items-center gap-2 border border-dashed border-violet-300 bg-white px-2.5 py-1.5 sm:px-3">
                      <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-zinc-400 sm:text-[10px] sm:tracking-[0.12em]">
                        Code
                      </span>

                      <span className="max-w-[180px] truncate font-mono text-xs font-black text-violet-700">
                        {promotion.code}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div
              data-reveal
              className="pd-rv mt-7 max-w-3xl sm:mt-8"
            >
              <div className="mb-3 flex items-center gap-3">
                <span className="font-mono text-[10px] font-bold tracking-[0.18em] text-violet-600">
                  02
                </span>
                <span className="h-px w-10 bg-violet-600" />
                <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                  Overview
                </span>
              </div>

              <p className="break-words text-sm leading-7 text-zinc-600 sm:text-lg sm:leading-8">
                {product.description}
              </p>
            </div>

            <div
              data-reveal
              className="pd-rv mt-7 grid grid-cols-1 border-l border-t border-black/10 sm:mt-9 sm:grid-cols-3"
            >
              {[
                {
                  icon: Zap,
                  title: 'Instant Order',
                  text: 'Proses order terstruktur',
                },
                {
                  icon: ShieldCheck,
                  title: 'Secure Payment',
                  text: 'Pembayaran via DANA QRIS',
                },
                {
                  icon: Sparkles,
                  title: 'Digital Ready',
                  text: 'Produk siap digunakan',
                },
              ].map((item, index) => {
                const Icon = item.icon

                return (
                  <div
                    key={item.title}
                    className="group relative overflow-hidden border-b border-r border-black/10 p-4 transition-colors duration-500 hover:bg-violet-50/50 sm:p-5"
                  >
                    <div className="absolute left-0 top-0 h-0.5 w-0 bg-violet-600 transition-all duration-700 group-hover:w-full" />

                    <div className="flex items-start justify-between">
                      <div className="flex h-9 w-9 items-center justify-center bg-violet-50 text-violet-700 transition-all duration-500 group-hover:-rotate-6 group-hover:bg-violet-600 group-hover:text-white">
                        <Icon className="h-4 w-4" />
                      </div>

                      <span className="font-mono text-[10px] text-zinc-300">
                        0{index + 1}
                      </span>
                    </div>

                    <p className="mt-4 text-sm font-black text-zinc-950">
                      {item.title}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-zinc-500">
                      {item.text}
                    </p>
                  </div>
                )
              })}
            </div>

            <div
              data-reveal
              className="pd-rv mt-7 flex flex-col gap-3 sm:mt-9 sm:flex-row"
            >
              <button
                type="button"
                disabled={
                  Number(
                    product.stock,
                  ) <= 0
                }
                onClick={() => {
                  setFormError('')
                  setCreatedOrder(null)
                  setPaymentData(null)
                  setProofFile(null)
                  setProofUploaded(false)
                  setFormError('')
                  setQuantity(1)
                  setShowCheckout(true)
                }}
                className="group relative inline-flex min-h-12 w-full items-center justify-center gap-3 overflow-hidden bg-zinc-950 px-6 text-xs font-black uppercase tracking-[0.14em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-13 sm:flex-1"
              >
                {Number(product.stock) > 0 && (
                  <span className="pd-shine-loop pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/20" />
                )}

                <span className="relative">
                  {Number(
                    product.stock,
                  ) > 0
                    ? 'Beli Produk'
                    : 'Stok Habis'}
                </span>

                {Number(
                  product.stock,
                ) > 0 && (
                    <ArrowRight className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  )}
              </button>

              <Link
                to="/products"
                className="inline-flex min-h-12 w-full items-center justify-center gap-3 border border-black/10 bg-white px-6 text-xs font-black uppercase tracking-[0.14em] text-zinc-800 transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 sm:min-h-13 sm:w-auto"
              >
                Lihat Produk Lain
              </Link>
            </div>

            <div
              data-reveal
              className="pd-rv mt-6 border border-violet-200 bg-violet-50 sm:mt-7"
            >
              <div className="flex items-start gap-3 p-4 sm:gap-4 sm:p-5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-white text-violet-700 shadow-sm">
                  <ShieldCheck className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-black text-zinc-950">
                    Pembayaran DP 50%
                  </p>

                  <p className="mt-1 break-words text-xs leading-5 text-zinc-600 sm:text-sm">
                    Order number akan dibuat setelah
                    pembayaran DP berhasil diverifikasi.
                    Sisa pembayaran diproses sesuai status
                    order.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            IMAGE VIEWER / LIGHTBOX
        ====================================================== */}

        {showImageViewer &&
          currentImage && (
            <div
              className="fixed inset-0 z-[100] bg-black/95"
              role="dialog"
              aria-modal="true"
              aria-label="Product image viewer"
              onMouseUp={
                stopDraggingImage
              }
              onMouseLeave={
                stopDraggingImage
              }
            >
              {/* BACKDROP */}

              <button
                type="button"
                aria-label="Close image viewer"
                className="absolute inset-0 z-0 cursor-default"
                onClick={
                  closeImageViewer
                }
              />

              {/* TOP BAR */}

              <div className="pointer-events-none absolute left-3 right-3 top-3 z-30 flex items-center justify-between gap-2 sm:left-6 sm:right-6 sm:top-6">
                <div className="pointer-events-auto flex min-w-0 items-center gap-2">
                  <div className="max-w-[150px] truncate border border-white/15 bg-white/10 px-2.5 py-2 text-[8px] font-black uppercase tracking-[0.14em] text-white/80 backdrop-blur-md sm:max-w-none sm:px-3 sm:text-[9px] sm:tracking-[0.18em]">
                    39Production
                  </div>

                  {productImages.length >
                    1 && (
                      <div className="shrink-0 border border-white/15 bg-white/10 px-2.5 py-2 text-[8px] font-black uppercase tracking-[0.14em] text-white/60 backdrop-blur-md sm:px-3 sm:text-[9px] sm:tracking-[0.18em]">
                        {activeImageIndex +
                          1}{' '}
                        /{' '}
                        {
                          productImages.length
                        }
                      </div>
                    )}
                </div>

                {/* CLOSE BUTTON */}

                <button
                  type="button"
                  onClick={
                    closeImageViewer
                  }
                  aria-label="Close image viewer"
                  title="Close"
                  className="pointer-events-auto flex h-10 w-10 shrink-0 items-center justify-center border border-white/20 bg-white/10 text-white shadow-lg backdrop-blur-md transition-all duration-200 hover:border-white/40 hover:bg-white hover:text-zinc-950 active:scale-95 sm:h-12 sm:w-12"
                >
                  <X className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>

              {/* PREVIOUS */}

              {productImages.length >
                1 && (
                  <button
                    type="button"
                    onClick={
                      goToPreviousImage
                    }
                    aria-label="Previous image"
                    title="Previous image"
                    className="absolute left-2 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-white/15 bg-black/50 text-white backdrop-blur-md transition-all duration-200 hover:border-violet-400 hover:bg-violet-600 active:scale-95 sm:left-6 sm:h-12 sm:w-12"
                  >
                    <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                  </button>
                )}

              {/* IMAGE STAGE */}

              <div
                className={`absolute inset-x-0 bottom-16 top-16 z-10 flex items-center justify-center overflow-hidden px-12 sm:bottom-24 sm:top-24 sm:px-24 ${imageZoom > 1
                  ? isDraggingImage
                    ? 'cursor-grabbing'
                    : 'cursor-grab'
                  : 'cursor-zoom-in'
                  }`}
                style={{
                  touchAction:
                    imageZoom > 1
                      ? 'none'
                      : 'pan-y',
                }}
                onWheel={
                  handleImageWheel
                }
                onMouseDown={
                  handleImageMouseDown
                }
                onMouseMove={
                  handleImageMouseMove
                }
                onMouseUp={
                  stopDraggingImage
                }
                onTouchStart={
                  handleImageTouchStart
                }
                onTouchMove={
                  handleImageTouchMove
                }
                onTouchEnd={
                  handleImageTouchEnd
                }
                onDoubleClick={() => {
                  if (imageZoom > 1) {
                    resetImageViewer()
                  } else {
                    setImageZoom(2)
                  }
                }}
              >
                <img
                  src={currentImage}
                  alt={product.name}
                  draggable={false}
                  className="max-h-full max-w-full select-none object-contain"
                  style={{
                    transform: `translate3d(${imagePosition.x}px, ${imagePosition.y}px, 0) scale(${imageZoom})`,
                    transition:
                      isDraggingImage
                        ? 'none'
                        : 'transform 220ms ease-out',
                    transformOrigin:
                      'center center',
                    willChange:
                      'transform',
                  }}
                />
              </div>

              {/* NEXT */}

              {productImages.length >
                1 && (
                  <button
                    type="button"
                    onClick={
                      goToNextImage
                    }
                    aria-label="Next image"
                    title="Next image"
                    className="absolute right-2 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-white/15 bg-black/50 text-white backdrop-blur-md transition-all duration-200 hover:border-violet-400 hover:bg-violet-600 active:scale-95 sm:right-6 sm:h-12 sm:w-12"
                  >
                    <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                  </button>
                )}

              {/* BOTTOM CONTROLS */}

              <div className="absolute bottom-2 left-1/2 z-30 flex max-w-[calc(100%-1rem)] -translate-x-1/2 items-center gap-0.5 border border-white/10 bg-black/70 p-1 shadow-2xl backdrop-blur-xl sm:bottom-6 sm:gap-1 sm:p-1.5">
                <button
                  type="button"
                  onClick={() =>
                    changeZoom(-0.25)
                  }
                  disabled={
                    imageZoom <= 1
                  }
                  aria-label="Zoom out"
                  title="Zoom out"
                  className="flex h-9 w-9 items-center justify-center text-white/70 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 sm:h-10 sm:w-10"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>

                <div className="flex h-9 min-w-12 items-center justify-center border-x border-white/10 px-2 text-[8px] font-black uppercase tracking-[0.1em] text-white/70 sm:h-10 sm:min-w-16 sm:px-3 sm:text-[9px] sm:tracking-[0.12em]">
                  {Math.round(
                    imageZoom * 100,
                  )}
                  %
                </div>

                <button
                  type="button"
                  onClick={() =>
                    changeZoom(0.25)
                  }
                  disabled={
                    imageZoom >= 4
                  }
                  aria-label="Zoom in"
                  title="Zoom in"
                  className="flex h-9 w-9 items-center justify-center text-white/70 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 sm:h-10 sm:w-10"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={
                    resetImageViewer
                  }
                  aria-label="Reset image"
                  title="Reset"
                  className="flex h-9 w-9 items-center justify-center text-white/70 transition hover:bg-white/10 hover:text-white sm:h-10 sm:w-10"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={
                    closeImageViewer
                  }
                  aria-label="Close image viewer"
                  title="Close"
                  className="ml-0.5 flex h-9 w-9 items-center justify-center border-l border-white/10 text-white/70 transition hover:bg-white/10 hover:text-white sm:ml-1 sm:h-10 sm:w-10"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* HELP */}

              <div className="pointer-events-none absolute bottom-5 right-5 z-20 hidden max-w-xs text-right text-[9px] font-bold uppercase leading-5 tracking-[0.12em] text-white/35 lg:block">
                Scroll to zoom
                <br />
                Drag to move
                <br />
                Swipe to slide
                <br />
                Double click to toggle
                <br />
                ESC to close
              </div>
            </div>
          )}

        {/* =====================================================
            CHECKOUT MODAL
        ====================================================== */}

        {showCheckout && (
          <div className="fixed inset-0 z-[80] overflow-y-auto overscroll-contain bg-zinc-950/55 p-2 backdrop-blur-sm sm:p-5">
            <div
              className="fixed inset-0"
              onClick={() => {
                if (!isSubmitting && !isUploadingProof) {
                  closeCheckout()
                }
              }}
            />

            <div className="relative mx-auto my-1 w-full max-w-2xl sm:my-6">
              <div className="overflow-hidden border border-black/10 bg-white shadow-[0_30px_100px_rgba(0,0,0,0.22)]">
                <div className="h-1 w-full bg-violet-600" />

                <div className="max-h-[calc(100dvh-0.5rem)] overflow-y-auto overscroll-contain sm:max-h-[calc(100dvh-3rem)]">
                  <div className="flex items-start justify-between gap-3 border-b border-black/10 bg-white p-4 sm:gap-4 sm:p-6">
                    <div className="min-w-0 pr-1 sm:pr-2">
                      <div className="mb-2 inline-flex max-w-full items-center gap-2 border border-violet-200 bg-violet-50 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.14em] text-violet-700 sm:px-3 sm:text-[9px] sm:tracking-[0.16em]">
                        <Disc3 className="h-3.5 w-3.5 shrink-0" />
                        Checkout
                      </div>

                      <h2 className="break-words text-lg font-black tracking-tight text-zinc-950 sm:text-2xl">
                        {paymentData ? 'Instruksi Pembayaran' : 'Beli Produk'}
                      </h2>

                      <p className="mt-1 max-w-xl break-words text-[11px] leading-5 text-zinc-500 sm:text-sm">
                        {paymentData ? 'Lakukan pembayaran sesuai instruksi, lalu unggah bukti transfer untuk konfirmasi.' : 'Isi data berikut untuk membuat pesanan dan mendapatkan instruksi pembayaran DP 50%.'}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={isSubmitting || isUploadingProof}
                      onClick={
                        closeCheckout
                      }
                      className="flex h-9 w-9 shrink-0 items-center justify-center border border-black/10 bg-white text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 sm:h-10 sm:w-10"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {!paymentData ? (
                    <form
                      onSubmit={
                        handleCheckout
                      }
                      className="space-y-5 p-4 sm:space-y-6 sm:p-6"
                    >
                      <div className="border border-black/10 bg-zinc-50 p-3.5 sm:p-4">
                        <div className="flex min-w-0 items-start justify-between gap-3 sm:gap-4">
                          <div className="min-w-0">
                            <p className="text-[8px] font-black uppercase tracking-[0.14em] text-zinc-400 sm:text-[9px] sm:tracking-[0.16em]">
                              Product
                            </p>

                            <p className="mt-1 break-words text-sm font-black text-zinc-950 sm:text-base">
                              {
                                product.name
                              }
                            </p>
                          </div>

                          <div className="shrink-0 text-right">
                            {promotion &&
                              discount >
                              0 && (
                                <p className="text-[10px] text-zinc-400 line-through sm:text-xs">
                                  {formatPrice(
                                    subtotal,
                                  )}
                                </p>
                              )}

                            <p className="text-sm font-black text-zinc-950 sm:text-lg">
                              {formatPrice(
                                finalPrice,
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="quantity"
                          className="mb-2 block text-[10px] font-black uppercase tracking-[0.1em] text-zinc-700 sm:text-[11px] sm:tracking-[0.12em]"
                        >
                          Quantity
                        </label>

                        <div className="flex flex-wrap items-center gap-2">
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
                            className="flex h-11 w-11 shrink-0 items-center justify-center border border-black/10 bg-white text-zinc-900 transition hover:border-violet-300 hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Minus className="h-4 w-4" />
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
                            className="h-11 w-20 shrink-0 border border-black/10 bg-white px-2 text-center text-sm font-bold text-zinc-900 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 disabled:opacity-50 sm:w-24"
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
                            className="flex h-11 w-11 shrink-0 items-center justify-center border border-black/10 bg-white text-zinc-900 transition hover:border-violet-300 hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Plus className="h-4 w-4" />
                          </button>

                          <span className="text-xs text-zinc-500 sm:ml-2">
                            Maks.{' '}
                            {
                              product.stock
                            }
                          </span>
                        </div>
                      </div>

                      <div className="grid min-w-0 gap-4 sm:grid-cols-2 sm:gap-5">
                        <div className="min-w-0 sm:col-span-2">
                          <label
                            htmlFor="customerName"
                            className="mb-2 block text-[10px] font-black uppercase tracking-[0.1em] text-zinc-700 sm:text-[11px] sm:tracking-[0.12em]"
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
                            className="w-full min-w-0 border border-black/10 bg-white px-3.5 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 disabled:opacity-50 sm:px-4"
                          />
                        </div>

                        <div className="min-w-0">
                          <label
                            htmlFor="customerEmail"
                            className="mb-2 block text-[10px] font-black uppercase tracking-[0.1em] text-zinc-700 sm:text-[11px] sm:tracking-[0.12em]"
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
                            className="w-full min-w-0 border border-black/10 bg-white px-3.5 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 disabled:opacity-50 sm:px-4"
                          />
                        </div>

                        <div className="min-w-0">
                          <label
                            htmlFor="customerPhone"
                            className="mb-2 block text-[10px] font-black uppercase tracking-[0.1em] text-zinc-700 sm:text-[11px] sm:tracking-[0.12em]"
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
                            className="w-full min-w-0 border border-black/10 bg-white px-3.5 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 disabled:opacity-50 sm:px-4"
                          />
                        </div>
                      </div>

                      <div className="border border-black/10 bg-zinc-50 p-3.5 sm:p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-4 text-sm">
                            <span className="text-zinc-500">
                              Harga produk
                            </span>

                            <span className="text-right text-zinc-800">
                              {formatPrice(
                                product.price,
                              )}
                            </span>
                          </div>

                          <div className="flex items-start justify-between gap-4 text-sm">
                            <span className="text-zinc-500">
                              Quantity
                            </span>

                            <span className="font-bold text-zinc-900">
                              {quantity}
                            </span>
                          </div>

                          <div className="flex items-start justify-between gap-4 text-sm">
                            <span className="text-zinc-500">
                              Subtotal
                            </span>

                            <span className="text-right text-zinc-800">
                              {formatPrice(
                                subtotal,
                              )}
                            </span>
                          </div>

                          {discount >
                            0 && (
                              <div className="flex items-start justify-between gap-4 text-sm">
                                <span className="text-pink-600">
                                  Discount
                                </span>

                                <span className="text-right font-bold text-pink-600">
                                  -
                                  {formatPrice(
                                    discount,
                                  )}
                                </span>
                              </div>
                            )}

                          <div className="border-t border-black/10 pt-3">
                            <div className="flex items-start justify-between gap-4">
                              <span className="font-black text-zinc-950">
                                Total
                              </span>

                              <span className="break-words text-right text-lg font-black text-zinc-950 sm:text-xl">
                                {formatPrice(
                                  finalPrice,
                                )}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-start justify-between gap-4 text-sm">
                            <span className="font-bold text-violet-700">
                              DP 50%
                            </span>

                            <span className="text-right font-black text-violet-700">
                              {formatPrice(
                                estimatedDp,
                              )}
                            </span>
                          </div>

                          <div className="flex items-start justify-between gap-4 text-sm">
                            <span className="text-zinc-500">
                              Sisa setelah DP
                            </span>

                            <span className="text-right font-bold text-zinc-800">
                              {formatPrice(
                                estimatedRemaining,
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      {formError && (
                        <div className="break-words border border-red-200 bg-red-50 px-3.5 py-3 text-xs leading-5 text-red-600 sm:px-4 sm:text-sm">
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
                        className="group flex min-h-12 w-full items-center justify-center gap-2 bg-zinc-950 px-4 text-xs font-black text-white transition hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-60 sm:px-5 sm:text-sm"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Membuat Pembayaran...
                          </>
                        ) : (
                          <>
                            <span className="truncate">
                              Buat Pesanan & Lihat Instruksi DP
                            </span>

                            <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
                          </>
                        )}
                      </button>

                      <p className="text-center text-[9px] leading-5 text-zinc-500 sm:text-[10px]">
                        Nomor pesanan dan instruksi pembayaran akan ditampilkan setelah pesanan berhasil dibuat.
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

                      <div className="border border-black/10 bg-white p-4 sm:p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-[0.14em] text-zinc-500">DP 50% yang perlu dibayar</p>
                            <p className="mt-1 text-2xl font-black text-violet-700">{formatPrice(paymentData.amount)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-zinc-500">Sisa pembayaran</p>
                            <p className="mt-1 font-black text-zinc-900">{formatPrice(paymentData.remaining_amount)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="border border-black/10 bg-white p-4 sm:p-5">
                        <p className="text-sm font-black text-zinc-950">Pilih metode pembayaran</p>
                        <p className="mt-1 text-xs leading-5 text-zinc-500">
                          Pilih metode pembayaran yang ingin digunakan. Nomor tujuan akan ditampilkan setelah metode dipilih.
                        </p>

                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                          {paymentData.payment_method === 'BANK_TRANSFER' && (
                            <button
                              type="button"
                              onClick={() => setSelectedPaymentMethod('BANK_TRANSFER')}
                              disabled={proofUploaded || !paymentData.bank_name || !paymentData.account_number || !paymentData.account_name}
                              className={`border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${selectedPaymentMethod === 'BANK_TRANSFER' ? 'border-violet-600 bg-violet-50 ring-1 ring-violet-600' : 'border-black/10 bg-white hover:border-violet-300'}`}
                            >
                              <span className="block text-sm font-black text-zinc-950">Transfer Bank</span>
                              <span className="mt-1 block text-xs text-zinc-500">Melalui rekening bank</span>
                            </button>
                          )}
                          {paymentData.payment_method2 === 'DANA' && (
                            <button
                              type="button"
                              onClick={() => setSelectedPaymentMethod('DANA')}
                              disabled={proofUploaded || !paymentData.dana_number || !paymentData.dana_name}
                              className={`border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${selectedPaymentMethod === 'DANA' ? 'border-violet-600 bg-violet-50 ring-1 ring-violet-600' : 'border-black/10 bg-white hover:border-violet-300'}`}
                            >
                              <span className="block text-sm font-black text-zinc-950">DANA</span>
                              <span className="mt-1 block text-xs text-zinc-500">Melalui dompet digital DANA</span>
                            </button>
                          )}
                        </div>

                        {selectedPaymentMethod === 'BANK_TRANSFER' && paymentData.payment_method === 'BANK_TRANSFER' && (
                          <div className="mt-4 space-y-3">
                            <p className="text-xs font-bold text-zinc-600">Transfer sesuai nominal DP ke rekening berikut.</p>
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
                          </div>
                        )}

                        {selectedPaymentMethod === 'DANA' && paymentData.payment_method2 === 'DANA' && (
                          <div className="mt-4 space-y-3">
                            <p className="text-xs font-bold text-zinc-600">Kirim pembayaran sesuai nominal DP ke akun DANA berikut.</p>
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
                          </div>
                        )}

                        {selectedPaymentMethod && (
                          <div className="mt-4 border border-violet-200 bg-violet-50 p-3">
                            <p className="text-[9px] font-bold uppercase tracking-wider text-violet-700">Nominal transfer (DP 50%)</p>
                            <div className="mt-1 flex items-center justify-between gap-3">
                              <p className="text-xl font-black text-violet-800">{formatPrice(paymentData.amount)}</p>
                              <button type="button" onClick={() => void navigator.clipboard?.writeText(String(paymentData.amount))} className="shrink-0 text-xs font-bold text-violet-700">Salin nominal</button>
                            </div>
                          </div>
                        )}
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
                          <a href={createWhatsAppUrl()} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 w-full items-center justify-center gap-2 bg-[#25D366] px-4 text-sm font-black text-white transition hover:bg-[#1fb85a]">
                            Konfirmasi Pesanan via WhatsApp <ArrowRight className="h-4 w-4" />
                          </a>
                        </div>
                      )}

                      <div className="grid gap-3 sm:grid-cols-2">
                        <Link to={getTrackUrl(createdOrder.order_number, createdOrder.public_payment_token ?? '')} className="inline-flex min-h-11 items-center justify-center border border-black/10 bg-white px-4 text-sm font-bold text-zinc-800 transition hover:border-violet-300 hover:bg-violet-50">Track Order</Link>
                        <Link to="/products" className="inline-flex min-h-11 items-center justify-center border border-black/10 bg-white px-4 text-sm font-bold text-zinc-800 transition hover:border-violet-300 hover:bg-violet-50">Kembali ke Products</Link>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

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

        /* ---------- Reveal ---------- */
        @keyframes pd-in {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .pd .pd-in {
          opacity: 0;
          animation: pd-in .85s cubic-bezier(.22,1,.36,1) var(--d, 0ms) forwards;
        }

        .pd .pd-rv {
          opacity: 0;
          transform: translate3d(0, 26px, 0);
          transition:
            opacity .8s cubic-bezier(.2,.7,.2,1) var(--d, 0ms),
            transform .8s cubic-bezier(.2,.7,.2,1) var(--d, 0ms),
            border-color .5s, box-shadow .5s;
        }
        .pd .pd-rv.is-visible { opacity: 1; transform: none; }
        .pd article.pd-rv.is-visible:hover { transform: translateY(-4px); transition-delay: 0ms; }

        @keyframes pd-up {
          from { transform: translateY(105%); }
          to   { transform: translateY(0); }
        }
        .pd .pd-up {
          transform: translateY(105%);
          animation: pd-up .95s cubic-bezier(.22,1,.36,1) var(--d, 0ms) forwards;
        }
        @keyframes pd-grow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        .pd .pd-grow {
          transform-origin: left;
          animation: pd-grow .9s cubic-bezier(.77,0,.18,1) .5s both;
        }

        /* ---------- Misc motion ---------- */
        @keyframes pd-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        .pd .pd-float { animation: pd-float 6s ease-in-out infinite; }
        .pd .pd-float-slow { animation: pd-float 9s ease-in-out infinite; }

        @keyframes pd-blink { 0%,100% { opacity: 1; } 50% { opacity: .25; } }
        .pd .pd-blink { animation: pd-blink 1.6s ease-in-out infinite; }

        @keyframes pd-twinkle {
          0%, 100% { opacity: .15; transform: scale(.6) rotate(45deg); }
          50% { opacity: 1; transform: scale(1) rotate(45deg); }
        }
        .pd .pd-twinkle { animation: pd-twinkle 3s ease-in-out infinite; }

        @keyframes pd-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(124,58,237,.35); }
          50% { box-shadow: 0 0 0 8px rgba(124,58,237,0); }
        }
        .pd .pd-pulse { animation: pd-pulse 2.4s ease-out infinite; }

        @keyframes pd-wiggle {
          0%, 80%, 100% { transform: rotate(0deg); }
          85% { transform: rotate(-14deg); }
          92% { transform: rotate(12deg); }
        }
        .pd .pd-wiggle { animation: pd-wiggle 3.6s ease-in-out infinite; }

        @keyframes pd-shine-loop {
          0%, 55% { left: -50%; opacity: 0; }
          65% { opacity: 1; }
          100% { left: 130%; opacity: 0; }
        }
        .pd .pd-shine-loop { animation: pd-shine-loop 4.5s ease-in-out infinite; }

        @keyframes pd-kb {
          from { transform: scale(1); }
          to   { transform: scale(1.07); }
        }
        .pd .pd-kb { animation: pd-kb 16s ease-in-out infinite alternate; }

        @keyframes pd-art-spin {
          from { transform: translate(272px, 150px) rotate(0deg); }
          to   { transform: translate(272px, 150px) rotate(360deg); }
        }
        .pd .pd-art-disc { animation: pd-art-spin 16s linear infinite; }

        /* ---------- Stage 3D ---------- */
        .pd .pd-stage { perspective: 1100px; }
        .pd .pd-tilt {
          transform-style: preserve-3d;
          transform: rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg));
          transition: transform .35s cubic-bezier(.22,1,.36,1);
        }
        .pd .pd-z-a { transform: translateZ(80px); }
        .pd .pd-z-b { transform: translateZ(55px); }
        @media (max-width: 1023px) {
          .pd .pd-z-a, .pd .pd-z-b { transform: translateZ(26px); }
        }

        .pd .pd-glare {
          opacity: 0;
          transition: opacity .3s;
          background: radial-gradient(
            320px circle at var(--gx, 50%) var(--gy, 0%),
            rgba(255,255,255,.18),
            transparent 65%
          );
        }
        .pd .pd-stage:hover .pd-glare { opacity: 1; }

        .pd .pd-shine { opacity: 0; }
        .pd .pd-stage:hover .pd-shine { animation: pd-shine .9s ease-out; }
        @keyframes pd-shine {
          0% { left: -50%; opacity: 0; }
          30% { opacity: 1; }
          100% { left: 130%; opacity: 0; }
        }

        /* Kubus */
        .pd .pd-cube {
          --s: 38px;
          position: relative;
          width: var(--s);
          height: var(--s);
          transform-style: preserve-3d;
          animation: pd-cube 14s linear infinite;
        }
        @media (min-width: 640px) { .pd .pd-cube { --s: 50px; } }
        .pd .pd-cube-lg { --s: 64px; }
        @keyframes pd-cube {
          from { transform: rotateX(-24deg) rotateY(0deg); }
          to   { transform: rotateX(-24deg) rotateY(360deg); }
        }
        .pd .pd-cube i {
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
        .pd .pd-cube .f1 { transform: translateZ(calc(var(--s) / 2)); background: rgba(255,255,255,.85); }
        .pd .pd-cube .f2 { transform: rotateY(90deg) translateZ(calc(var(--s) / 2)); background: rgba(231,143,186,.4); }
        .pd .pd-cube .f3 { transform: rotateY(180deg) translateZ(calc(var(--s) / 2)); background: rgba(255,255,255,.85); }
        .pd .pd-cube .f4 { transform: rotateY(-90deg) translateZ(calc(var(--s) / 2)); background: rgba(124,58,237,.24); }
        .pd .pd-cube .f5 { transform: rotateX(90deg) translateZ(calc(var(--s) / 2)); background: rgba(231,143,186,.5); }
        .pd .pd-cube .f6 { transform: rotateX(-90deg) translateZ(calc(var(--s) / 2)); background: rgba(124,58,237,.32); }

        /* Bola */
        .pd .pd-sphere {
          width: 26px; height: 26px;
          border-radius: 9999px;
          background: radial-gradient(circle at 30% 28%, #fbd5e6 0%, #E78FBA 38%, #7C3AED 100%);
          box-shadow: 0 12px 18px -6px rgba(124,58,237,.55);
        }
        @media (min-width: 1024px) { .pd .pd-sphere { width: 38px; height: 38px; } }

        .pd .pd-plane { transform: rotateY(-14deg) rotateX(6deg); }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            scroll-behavior: auto !important;
            transition-duration: 0.01ms !important;
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
          }
          .pd .pd-in, .pd .pd-rv, .pd .pd-up {
            opacity: 1 !important;
            transform: none !important;
          }
          .pd .pd-grow { transform: scaleX(1) !important; }
          .pd .pd-tilt { transform: none !important; }
        }


        .select-none {
          -webkit-user-select: none;
          user-select: none;
        }

        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }

        @media (max-width: 359px) {
          .xs\\:hidden {
            display: inline;
          }

          .xs\\:inline {
            display: none;
          }
        }

        @media (min-width: 360px) {
          .xs\\:hidden {
            display: none;
          }

          .xs\\:inline {
            display: inline;
          }
        }

        @media (max-width: 639px) {
          input,
          textarea,
          select {
            font-size: 16px;
          }
        }
      `}</style>
    </section>
  )
}