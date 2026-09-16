import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type MouseEvent as ReactMouseEvent,
  type TouchEvent as ReactTouchEvent,
  type WheelEvent as ReactWheelEvent,
} from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
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
  ) =>
    `/track-order?order=${encodeURIComponent(
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
    const touch = event.changedTouches[0]

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
          payment.final_amount ?? 0,
        ),
        dp_amount: Number(
          payment.dp_amount ?? 0,
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
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-5 text-zinc-950">
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

        <div className="relative w-full max-w-md border border-black/10 bg-white p-8 text-center shadow-[0_25px_80px_rgba(0,0,0,0.06)]">
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
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-5 text-zinc-950">
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

        <div className="relative w-full max-w-lg border border-black/10 bg-white p-8 text-center shadow-[0_25px_80px_rgba(0,0,0,0.06)] sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center bg-red-50 text-red-600">
            <Disc3 className="h-7 w-7" />
          </div>

          <h1 className="mt-5 text-2xl font-black tracking-tight">
            Product tidak ditemukan
          </h1>

          <p className="mt-3 text-sm leading-6 text-zinc-500">
            {error ||
              'Produk yang kamu cari tidak tersedia.'}
          </p>

          <Link
            to="/products"
            className="mt-7 inline-flex items-center gap-2 bg-zinc-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-violet-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Products
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
        className="pointer-events-none absolute left-[-12rem] top-32 h-[420px] w-[420px] rounded-full bg-violet-100/50 blur-[130px]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-12rem] top-[38%] h-[420px] w-[420px] rounded-full bg-pink-100/40 blur-[130px]"
      />

      <main className="relative z-10 mx-auto max-w-[1600px] px-5 pb-20 pt-20 sm:px-8 sm:pt-24 lg:px-12 lg:pb-28 lg:pt-24">
        {/* =====================================================
            EDITORIAL HEADER
        ====================================================== */}

        <div className="mb-10 flex items-center justify-between border-b border-black/10 pb-5 sm:mb-14">
          <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.24em] text-zinc-500 sm:text-xs">
            <Link
              to="/products"
              className="text-zinc-950 transition hover:text-violet-600"
            >
              39Production
            </Link>

            <span className="h-1 w-1 rounded-full bg-violet-600" />

            <span>Products</span>

            <span className="h-1 w-1 rounded-full bg-zinc-300" />

            <span>Detail</span>
          </div>

          <div className="hidden items-center gap-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400 sm:flex">
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
          className="group mb-8 inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500 transition hover:text-violet-700 sm:mb-10"
        >
          <span className="flex h-9 w-9 items-center justify-center border border-black/10 bg-white transition group-hover:border-violet-300 group-hover:bg-violet-50">
            <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
          </span>

          Back to Products
        </Link>

        {/* =====================================================
            PRODUCT CONTENT
        ====================================================== */}

        <div className="grid items-start gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-20">
          {/* =================================================
              PRODUCT VISUAL
          ================================================== */}

          <div className="lg:sticky lg:top-28">
            <div className="relative">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-8 bg-violet-100/30 blur-3xl"
              />

              <div className="relative overflow-hidden border border-black/10 bg-neutral-100 shadow-[0_30px_90px_rgba(0,0,0,0.08)]">
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
                  className="group relative block aspect-[4/3] w-full cursor-zoom-in overflow-hidden bg-neutral-100 text-left sm:aspect-[5/4]"
                >
                  {currentImage ? (
                    <>
                      <img
                        src={currentImage}
                        alt={product.name}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]"
                        onError={(
                          event,
                        ) => {
                          event.currentTarget.style.display =
                            'none'
                        }}
                      />

                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />

                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-500/[0.08] via-transparent to-pink-500/[0.08] mix-blend-soft-light" />
                    </>
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-br from-violet-100 via-white to-pink-100" />

                      <div
                        className="absolute inset-0 opacity-[0.06]"
                        style={{
                          backgroundImage: `
                            linear-gradient(rgba(124,58,237,0.8) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(124,58,237,0.8) 1px, transparent 1px)
                          `,
                          backgroundSize:
                            '38px 38px',
                        }}
                      />

                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex h-28 w-28 items-center justify-center border border-violet-200 bg-white text-violet-600 shadow-xl">
                          <Disc3 className="h-14 w-14" />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="absolute left-5 top-5 z-20">
                    <span className="inline-flex items-center gap-2 border border-white/25 bg-black/55 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-white backdrop-blur-md">
                      Product{' '}
                      {String(
                        activeImageIndex + 1,
                      ).padStart(
                        2,
                        '0',
                      )}
                    </span>
                  </div>

                  <div className="absolute right-5 top-5 z-20">
                    <span
                      className={`inline-flex items-center gap-2 border px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.15em] backdrop-blur-md ${Number(
                        product.stock,
                      ) > 0
                        ? 'border-white/25 bg-white/90 text-zinc-900'
                        : 'border-red-200 bg-white/95 text-red-700'
                        }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${Number(
                          product.stock,
                        ) > 0
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

                  <div className="absolute bottom-5 left-5 right-5 z-20">
                    <div className="flex items-end justify-between gap-5">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/55">
                          {product.category ||
                            '39Production Product'}
                        </p>

                        <p className="mt-1 text-lg font-black tracking-tight text-white sm:text-xl">
                          {product.name}
                        </p>
                      </div>

                      <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-white/25 bg-black/55 text-white backdrop-blur-md transition-all duration-300 group-hover:border-violet-400 group-hover:bg-violet-600">
                        <Expand className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </button>

                {productImages.length >
                  1 && (
                    <div className="flex items-center gap-2 border-t border-black/10 bg-white p-3">
                      <button
                        type="button"
                        onClick={
                          goToPreviousImage
                        }
                        aria-label="Previous image"
                        className="flex h-10 w-10 shrink-0 items-center justify-center border border-black/10 bg-white text-zinc-600 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>

                      <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto">
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
                              className={`relative h-16 w-20 shrink-0 overflow-hidden border transition ${activeImageIndex ===
                                index
                                ? 'border-violet-600 ring-1 ring-violet-600'
                                : 'border-black/10 opacity-60 hover:opacity-100'
                                }`}
                            >
                              <img
                                src={image}
                                alt=""
                                className="h-full w-full object-contain bg-zinc-100 p-1"
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
                        className="flex h-10 w-10 shrink-0 items-center justify-center border border-black/10 bg-white text-zinc-600 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}
              </div>

              <div className="mt-4 flex items-center justify-between gap-4 text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-400">
                <span className="inline-flex items-center gap-2">
                  <ZoomIn className="h-3.5 w-3.5 text-violet-600" />
                  Click image to zoom
                </span>

                {productImages.length >
                  1 && (
                    <span>
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

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 border border-violet-200 bg-violet-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-violet-700">
                <Sparkles className="h-3.5 w-3.5" />
                Digital Product
              </span>

              {product.category && (
                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">
                  / {product.category}
                </span>
              )}
            </div>

            <div className="mt-6">
              <h1 className="max-w-5xl text-[clamp(3rem,6vw,6.5rem)] font-black leading-[0.86] tracking-[-0.065em] text-zinc-950">
                {product.name}
              </h1>
            </div>

            <div className="mt-9 border-y border-black/10 py-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  {promotion &&
                    discount > 0 && (
                      <p className="text-sm text-zinc-400 line-through">
                        {formatPrice(
                          subtotal,
                        )}
                      </p>
                    )}

                  <div className="mt-1 flex flex-wrap items-baseline gap-3">
                    <span className="text-3xl font-black tracking-[-0.04em] text-zinc-950 sm:text-4xl">
                      {formatPrice(
                        finalPrice,
                      )}
                    </span>

                    {promotion &&
                      discount > 0 && (
                        <span className="border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-emerald-700">
                          Save{' '}
                          {formatPrice(
                            discount,
                          )}
                        </span>
                      )}
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-400">
                    Available Stock
                  </p>

                  <p className="mt-1 text-lg font-black text-zinc-950">
                    {product.stock}
                  </p>
                </div>
              </div>
            </div>

            {promotion && (
              <div className="mt-7 border border-violet-200 bg-violet-50">
                <div className="flex items-start gap-4 p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-violet-600 text-white">
                    <Tag className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-violet-700">
                          Special Promotion
                        </p>

                        <h2 className="mt-1 text-base font-black text-zinc-950">
                          {
                            promotion.title
                          }
                        </h2>
                      </div>

                      <span className="border border-violet-200 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-violet-700">
                        {getDiscountLabel()}
                      </span>
                    </div>

                    <p className="mt-2 text-xs leading-5 text-zinc-600 sm:text-sm">
                      {
                        promotion.description
                      }
                    </p>

                    <div className="mt-3 inline-flex items-center gap-2 border border-dashed border-violet-300 bg-white px-3 py-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-400">
                        Code
                      </span>

                      <span className="font-mono text-xs font-black text-violet-700">
                        {promotion.code}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 max-w-3xl">
              <p className="text-base leading-8 text-zinc-600 sm:text-lg">
                {product.description}
              </p>
            </div>

            <div className="mt-9 grid grid-cols-1 border-y border-black/10 sm:grid-cols-3">
              <div className="border-b border-black/10 p-5 sm:border-b-0 sm:border-r">
                <div className="flex h-9 w-9 items-center justify-center bg-violet-50 text-violet-700">
                  <Zap className="h-4 w-4" />
                </div>

                <p className="mt-4 text-sm font-black text-zinc-950">
                  Instant Order
                </p>

                <p className="mt-1 text-xs leading-5 text-zinc-500">
                  Proses order terstruktur
                </p>
              </div>

              <div className="border-b border-black/10 p-5 sm:border-b-0 sm:border-r">
                <div className="flex h-9 w-9 items-center justify-center bg-violet-50 text-violet-700">
                  <ShieldCheck className="h-4 w-4" />
                </div>

                <p className="mt-4 text-sm font-black text-zinc-950">
                  Secure Payment
                </p>

                <p className="mt-1 text-xs leading-5 text-zinc-500">
                  Pembayaran via DANA QRIS
                </p>
              </div>

              <div className="p-5">
                <div className="flex h-9 w-9 items-center justify-center bg-violet-50 text-violet-700">
                  <Sparkles className="h-4 w-4" />
                </div>

                <p className="mt-4 text-sm font-black text-zinc-950">
                  Digital Ready
                </p>

                <p className="mt-1 text-xs leading-5 text-zinc-500">
                  Produk siap digunakan
                </p>
              </div>
            </div>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
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
                  setQuantity(1)
                  setShowCheckout(true)
                }}
                className="group inline-flex min-h-13 flex-1 items-center justify-center gap-3 bg-zinc-950 px-6 text-xs font-black uppercase tracking-[0.14em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {Number(
                  product.stock,
                ) > 0
                  ? 'Beli Produk'
                  : 'Stok Habis'}

                {Number(
                  product.stock,
                ) > 0 && (
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  )}
              </button>

              <Link
                to="/products"
                className="inline-flex min-h-13 items-center justify-center gap-3 border border-black/10 bg-white px-6 text-xs font-black uppercase tracking-[0.14em] text-zinc-800 transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700"
              >
                Lihat Produk Lain
              </Link>
            </div>

            <div className="mt-7 border border-violet-200 bg-violet-50">
              <div className="flex items-start gap-4 p-5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-white text-violet-700 shadow-sm">
                  <ShieldCheck className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-sm font-black text-zinc-950">
                    Pembayaran DP 50%
                  </p>

                  <p className="mt-1 text-xs leading-5 text-zinc-600 sm:text-sm">
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

              <div className="pointer-events-none absolute left-3 right-3 top-3 z-30 flex items-center justify-between gap-3 sm:left-6 sm:right-6 sm:top-6">
                <div className="pointer-events-auto flex items-center gap-2">
                  <div className="border border-white/15 bg-white/10 px-3 py-2 text-[9px] font-black uppercase tracking-[0.18em] text-white/80 backdrop-blur-md">
                    39Production
                  </div>

                  {productImages.length >
                    1 && (
                      <div className="border border-white/15 bg-white/10 px-3 py-2 text-[9px] font-black uppercase tracking-[0.18em] text-white/60 backdrop-blur-md">
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
                  className="pointer-events-auto flex h-12 w-12 items-center justify-center border border-white/20 bg-white/10 text-white shadow-lg backdrop-blur-md transition-all duration-200 hover:border-white/40 hover:bg-white hover:text-zinc-950 active:scale-95"
                >
                  <X className="h-6 w-6" />
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
                    className="absolute left-3 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center border border-white/15 bg-black/50 text-white backdrop-blur-md transition-all duration-200 hover:border-violet-400 hover:bg-violet-600 active:scale-95 sm:left-6"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                )}

              {/* IMAGE STAGE */}

              <div
                className={`absolute inset-x-0 bottom-20 top-20 z-10 flex items-center justify-center overflow-hidden px-14 sm:bottom-24 sm:top-24 sm:px-24 ${imageZoom > 1
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
                    className="absolute right-3 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center border border-white/15 bg-black/50 text-white backdrop-blur-md transition-all duration-200 hover:border-violet-400 hover:bg-violet-600 active:scale-95 sm:right-6"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                )}

              {/* BOTTOM CONTROLS */}

              <div className="absolute bottom-3 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1 border border-white/10 bg-black/70 p-1.5 shadow-2xl backdrop-blur-xl sm:bottom-6">
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
                  className="flex h-10 w-10 items-center justify-center text-white/70 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>

                <div className="flex h-10 min-w-16 items-center justify-center border-x border-white/10 px-3 text-[9px] font-black uppercase tracking-[0.12em] text-white/70">
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
                  className="flex h-10 w-10 items-center justify-center text-white/70 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
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
                  className="flex h-10 w-10 items-center justify-center text-white/70 transition hover:bg-white/10 hover:text-white"
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
                  className="ml-1 flex h-10 w-10 items-center justify-center border-l border-white/10 text-white/70 transition hover:bg-white/10 hover:text-white"
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
          <div className="fixed inset-0 z-[80] overflow-y-auto bg-zinc-950/55 p-3 backdrop-blur-sm sm:p-5">
            <div
              className="fixed inset-0"
              onClick={() => {
                if (!isSubmitting) {
                  closeCheckout()
                }
              }}
            />

            <div className="relative mx-auto my-3 w-full max-w-2xl sm:my-6">
              <div className="overflow-hidden border border-black/10 bg-white shadow-[0_30px_100px_rgba(0,0,0,0.22)]">
                <div className="h-1 w-full bg-violet-600" />

                <div className="max-h-[calc(100dvh-1.5rem)] overflow-y-auto overscroll-contain sm:max-h-[calc(100dvh-3rem)]">
                  <div className="flex items-start justify-between gap-4 border-b border-black/10 bg-white p-5 sm:p-6">
                    <div className="min-w-0 pr-2">
                      <div className="mb-2 inline-flex items-center gap-2 border border-violet-200 bg-violet-50 px-3 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-violet-700">
                        <Disc3 className="h-3.5 w-3.5" />
                        Checkout
                      </div>

                      <h2 className="text-xl font-black tracking-tight text-zinc-950 sm:text-2xl">
                        {createdOrder
                          ? 'Order Berhasil'
                          : paymentData
                            ? 'Pembayaran DP'
                            : 'Beli Produk'}
                      </h2>

                      <p className="mt-1 max-w-xl text-xs leading-5 text-zinc-500 sm:text-sm">
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
                      className="flex h-10 w-10 shrink-0 items-center justify-center border border-black/10 bg-white text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-950 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {!createdOrder &&
                    !paymentData ? (
                    <form
                      onSubmit={
                        handleCheckout
                      }
                      className="space-y-5 p-5 sm:space-y-6 sm:p-6"
                    >
                      <div className="border border-black/10 bg-zinc-50 p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="text-[9px] font-black uppercase tracking-[0.16em] text-zinc-400">
                              Product
                            </p>

                            <p className="mt-1 text-sm font-black text-zinc-950 sm:text-base">
                              {
                                product.name
                              }
                            </p>
                          </div>

                          <div className="shrink-0 text-right">
                            {promotion &&
                              discount >
                              0 && (
                                <p className="text-xs text-zinc-400 line-through">
                                  {formatPrice(
                                    subtotal,
                                  )}
                                </p>
                              )}

                            <p className="text-base font-black text-zinc-950 sm:text-lg">
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
                          className="mb-2 block text-[11px] font-black uppercase tracking-[0.12em] text-zinc-700"
                        >
                          Quantity
                        </label>

                        <div className="flex items-center gap-2">
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
                            className="flex h-11 w-11 items-center justify-center border border-black/10 bg-white text-zinc-900 transition hover:border-violet-300 hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-40"
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
                            className="h-11 w-24 border border-black/10 bg-white px-3 text-center text-sm font-bold text-zinc-900 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 disabled:opacity-50"
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
                            className="flex h-11 w-11 items-center justify-center border border-black/10 bg-white text-zinc-900 transition hover:border-violet-300 hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Plus className="h-4 w-4" />
                          </button>

                          <span className="ml-2 text-xs text-zinc-500">
                            Maks.{' '}
                            {
                              product.stock
                            }
                          </span>
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
                        <div className="sm:col-span-2">
                          <label
                            htmlFor="customerName"
                            className="mb-2 block text-[11px] font-black uppercase tracking-[0.12em] text-zinc-700"
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
                            className="w-full border border-black/10 bg-white px-4 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 disabled:opacity-50"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="customerEmail"
                            className="mb-2 block text-[11px] font-black uppercase tracking-[0.12em] text-zinc-700"
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
                            className="w-full border border-black/10 bg-white px-4 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 disabled:opacity-50"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="customerPhone"
                            className="mb-2 block text-[11px] font-black uppercase tracking-[0.12em] text-zinc-700"
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
                            className="w-full border border-black/10 bg-white px-4 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 disabled:opacity-50"
                          />
                        </div>
                      </div>

                      <div className="border border-black/10 bg-zinc-50 p-4">
                        <div className="space-y-3">
                          <div className="flex justify-between gap-4 text-sm">
                            <span className="text-zinc-500">
                              Harga produk
                            </span>

                            <span className="text-zinc-800">
                              {formatPrice(
                                product.price,
                              )}
                            </span>
                          </div>

                          <div className="flex justify-between gap-4 text-sm">
                            <span className="text-zinc-500">
                              Quantity
                            </span>

                            <span className="font-bold text-zinc-900">
                              {quantity}
                            </span>
                          </div>

                          <div className="flex justify-between gap-4 text-sm">
                            <span className="text-zinc-500">
                              Subtotal
                            </span>

                            <span className="text-zinc-800">
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

                                <span className="font-bold text-pink-600">
                                  -
                                  {formatPrice(
                                    discount,
                                  )}
                                </span>
                              </div>
                            )}

                          <div className="border-t border-black/10 pt-3">
                            <div className="flex justify-between gap-4">
                              <span className="font-black text-zinc-950">
                                Total
                              </span>

                              <span className="text-xl font-black text-zinc-950">
                                {formatPrice(
                                  finalPrice,
                                )}
                              </span>
                            </div>
                          </div>

                          <div className="flex justify-between gap-4 text-sm">
                            <span className="font-bold text-violet-700">
                              DP 50%
                            </span>

                            <span className="font-black text-violet-700">
                              {formatPrice(
                                estimatedDp,
                              )}
                            </span>
                          </div>

                          <div className="flex justify-between gap-4 text-sm">
                            <span className="text-zinc-500">
                              Sisa setelah DP
                            </span>

                            <span className="font-bold text-zinc-800">
                              {formatPrice(
                                estimatedRemaining,
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      {formError && (
                        <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-600">
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
                        className="group flex min-h-12 w-full items-center justify-center gap-2 bg-zinc-950 px-5 text-sm font-black text-white transition hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Membuat Pembayaran...
                          </>
                        ) : (
                          <>
                            Pay DP 50% via DANA QRIS

                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </>
                        )}
                      </button>

                      <p className="text-center text-[10px] leading-5 text-zinc-500">
                        Order number baru dibuat setelah
                        pembayaran DP berhasil diverifikasi
                        oleh server.
                      </p>
                    </form>
                  ) : !createdOrder &&
                    paymentData ? (
                    <div className="p-5 sm:p-6">
                      <div className="border border-violet-200 bg-violet-50 p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-[0.16em] text-violet-700">
                              DP 50%
                            </p>

                            <p className="mt-1 text-2xl font-black text-violet-700">
                              {formatPrice(
                                paymentData.dp_amount,
                              )}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-xs text-zinc-500">
                              Sisa pembayaran
                            </p>

                            <p className="mt-1 font-black text-zinc-900">
                              {formatPrice(
                                paymentData.remaining_amount,
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 border border-black/10 bg-white p-4 sm:p-5">
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
                            className="mx-auto flex h-56 w-56 items-center justify-center border border-black/10 bg-zinc-50 text-center text-sm font-bold text-zinc-700 sm:h-64 sm:w-64"
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

                      <div className="mt-4 border border-black/10 bg-zinc-50 p-4 text-xs leading-5 text-zinc-500 sm:text-sm">
                        <p className="font-black text-zinc-950">
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
                        className="mt-4 min-h-11 w-full border border-black/10 bg-white text-xs font-bold text-zinc-800 transition hover:border-violet-300 hover:bg-violet-50"
                      >
                        Copy QRIS Content
                      </button>

                      {formError && (
                        <div className="mt-4 border border-red-200 bg-red-50 p-3 text-xs leading-5 text-red-600">
                          {formError}
                        </div>
                      )}
                    </div>
                  ) : createdOrder ? (
                    <div className="p-5 text-center sm:p-8">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center bg-emerald-50 text-emerald-600">
                        <CheckCircle2 className="h-8 w-8" />
                      </div>

                      <p className="mt-5 text-[9px] font-black uppercase tracking-[0.2em] text-emerald-600">
                        DP Payment Verified
                      </p>

                      <h2 className="mt-2 text-2xl font-black tracking-tight text-zinc-950">
                        Order berhasil dibuat
                      </h2>

                      <p className="mt-2 text-sm leading-6 text-zinc-500">
                        Pembayaran DP 50% sudah diverifikasi.
                        Order sekarang resmi tercatat dan dapat
                        dipantau melalui Track Order.
                      </p>

                      <div className="mt-6 border border-violet-200 bg-violet-50 p-5">
                        <p className="text-[9px] font-black uppercase tracking-[0.16em] text-zinc-500">
                          Order Number
                        </p>

                        <p className="mt-2 break-all font-mono text-lg font-black tracking-wider text-violet-700 sm:text-xl">
                          {
                            createdOrder.order_number
                          }
                        </p>
                      </div>

                      <div className="mt-5 space-y-3 border border-black/10 bg-zinc-50 p-5 text-left">
                        <div className="flex justify-between gap-4 text-sm">
                          <span className="text-zinc-500">
                            Produk
                          </span>

                          <span className="max-w-[60%] text-right font-bold text-zinc-900">
                            {
                              createdOrder.product_name
                            }
                          </span>
                        </div>

                        <div className="flex justify-between gap-4 text-sm">
                          <span className="text-zinc-500">
                            Quantity
                          </span>

                          <span className="font-bold text-zinc-900">
                            {
                              createdOrder.quantity
                            }
                          </span>
                        </div>

                        {(createdOrder.discount_amount ??
                          0) > 0 && (
                            <div className="flex justify-between gap-4 text-sm">
                              <span className="text-zinc-500">
                                Discount
                              </span>

                              <span className="font-bold text-pink-600">
                                -
                                {formatPrice(
                                  createdOrder.discount_amount ??
                                  0,
                                )}
                              </span>
                            </div>
                          )}

                        <div className="flex justify-between gap-4 border-t border-black/10 pt-3">
                          <span className="font-black text-zinc-950">
                            Total
                          </span>

                          <span className="text-xl font-black text-zinc-950">
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

                          <span className="font-black text-violet-700">
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
                          <span className="text-zinc-500">
                            Sisa pembayaran
                          </span>

                          <span className="font-bold text-zinc-900">
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

                      <div className="mt-5 border border-violet-200 bg-violet-50 p-4 text-left text-xs leading-5 text-zinc-500">
                        <p className="font-black text-zinc-950">
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
                          className="inline-flex min-h-12 items-center justify-center gap-2 bg-zinc-950 px-5 text-sm font-black text-white transition hover:bg-violet-600"
                        >
                          Hubungi via WhatsApp

                          <ArrowRight className="h-4 w-4" />
                        </a>

                        <Link
                          to={getTrackUrl(
                            createdOrder.order_number,
                          )}
                          className="inline-flex min-h-12 items-center justify-center gap-2 border border-black/10 bg-white px-5 text-sm font-bold text-zinc-800 transition hover:border-violet-300 hover:bg-violet-50"
                        >
                          Track Order
                        </Link>
                      </div>

                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <div className="border border-black/10 bg-white px-4 py-3 text-left">
                          <p className="text-[9px] font-black uppercase tracking-wider text-zinc-400">
                            DP Status
                          </p>

                          <p className="mt-1 text-sm font-black text-emerald-600">
                            Paid
                          </p>
                        </div>

                        <div className="border border-black/10 bg-white px-4 py-3 text-left">
                          <p className="text-[9px] font-black uppercase tracking-wider text-zinc-400">
                            Final Payment
                          </p>

                          <p className="mt-1 text-sm font-black text-zinc-500">
                            Waiting
                          </p>
                        </div>
                      </div>

                      <Link
                        to="/products"
                        className="mt-3 flex min-h-11 w-full items-center justify-center px-5 text-sm text-zinc-500 transition hover:text-zinc-950"
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

        .select-none {
          -webkit-user-select: none;
          user-select: none;
        }
      `}</style>
    </section>
  )
}