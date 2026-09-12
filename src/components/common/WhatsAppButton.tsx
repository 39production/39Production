import { useEffect, useState } from 'react'
import { ArrowRight, Check, MessageCircle, X } from 'lucide-react'
import whatsappLogo from '../../assets/whatsapp-logo.svg'

type WhatsAppButtonVariant = 'float' | 'icon' | 'inline'

interface WhatsAppButtonProps {
  variant?: WhatsAppButtonVariant
  phoneNumber?: string
  className?: string
}

const DEFAULT_PHONE_NUMBER = '6281217504730'

const getWhatsAppUrl = (phoneNumber: string, message: string) => {
  const cleanNumber = phoneNumber.replace(/\D/g, '')
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`
}

const projectInquiryMessage = ({
  name,
  category,
  message,
}: {
  name: string
  category: string
  message: string
}) => {
  return `Halo 39Production! 👋

Saya ingin menghubungi 39Production.

Nama: ${name}
Kebutuhan: ${category}

Pesan:
${message}

Mohon informasinya. Terima kasih!`
}

function WhatsAppLogo({ size = 28 }: { size?: number }) {
  return (
    <img
      src={whatsappLogo}
      alt="WhatsApp"
      width={size}
      height={size}
      className="block object-contain"
    />
  )
}

export function WhatsAppButton({
  variant = 'float',
  phoneNumber = DEFAULT_PHONE_NUMBER,
  className = '',
}: WhatsAppButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [message, setMessage] = useState('')
  const [isPreview, setIsPreview] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
        setIsPreview(false)
      }
    }

    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = ''
      return
    }

    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const openPopup = () => {
    setIsOpen(true)
    setIsPreview(false)
  }

  const closePopup = () => {
    setIsOpen(false)
    setIsPreview(false)
  }

  const handleContinue = () => {
    if (!name.trim() || !category || !message.trim()) {
      return
    }

    setIsPreview(true)
  }

  const handleSendWhatsApp = () => {
    const whatsappMessage = projectInquiryMessage({
      name: name.trim(),
      category,
      message: message.trim(),
    })

    window.open(
      getWhatsAppUrl(phoneNumber, whatsappMessage),
      '_blank',
      'noopener,noreferrer',
    )

    closePopup()
  }

  const isFormValid =
    name.trim().length > 0 &&
    category.length > 0 &&
    message.trim().length > 0

  return (
    <>
      {/* =========================================================
          FLOATING BUTTON
      ========================================================= */}
      {variant === 'float' && (
        <button
          type="button"
          onClick={openPopup}
          aria-label="Chat dengan 39Production melalui WhatsApp"
          className={`group fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-[#25D366] shadow-[0_12px_35px_rgba(37,211,102,0.35)] transition-all duration-300 hover:scale-105 hover:bg-[#20bd5a] hover:shadow-[0_16px_45px_rgba(37,211,102,0.45)] active:scale-95 ${className}`}
        >
          {/* Inner border */}
          <span className="absolute inset-1 rounded-full border border-white/25" />

          {/* WhatsApp logo with white background */}
          <span className="relative z-10 flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm">
            <WhatsAppLogo size={27} />
          </span>

          {/* Online indicator */}
          <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-bg-base bg-[#25D366]" />

          {/* Tooltip */}
          <span className="pointer-events-none absolute right-16 whitespace-nowrap rounded-lg border border-white/10 bg-zinc-950/95 px-3 py-2 text-xs font-medium text-white opacity-0 shadow-xl transition-opacity duration-200 group-hover:opacity-100">
            Chat via WhatsApp
          </span>
        </button>
      )}

      {/* =========================================================
          ICON BUTTON
      ========================================================= */}
      {variant === 'icon' && (
        <button
          type="button"
          onClick={openPopup}
          aria-label="Chat via WhatsApp"
          className={`group flex h-10 w-10 items-center justify-center rounded-xl border border-[#25D366]/30 bg-[#25D366]/10 transition-all duration-200 hover:scale-105 hover:border-[#25D366]/60 hover:bg-[#25D366]/20 active:scale-95 ${className}`}
        >
          <WhatsAppLogo size={22} />
        </button>
      )}

      {/* =========================================================
          INLINE BUTTON
      ========================================================= */}
      {variant === 'inline' && (
        <button
          type="button"
          onClick={openPopup}
          className={`group relative inline-flex items-center gap-3 overflow-hidden rounded-xl bg-[#25D366] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(37,211,102,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#20bd5a] hover:shadow-[0_14px_35px_rgba(37,211,102,0.3)] active:translate-y-0 ${className}`}
        >
          {/* Shine animation */}
          <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

          {/* Logo */}
          <span className="relative flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-white">
            <WhatsAppLogo size={21} />
          </span>

          <span className="relative">
            Chat on WhatsApp
          </span>

          <ArrowRight
            size={16}
            className="relative transition-transform duration-200 group-hover:translate-x-0.5"
          />
        </button>
      )}

      {/* =========================================================
          POPUP
      ========================================================= */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closePopup()
            }
          }}
        >
          <div
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#111113] shadow-[0_30px_100px_rgba(0,0,0,0.65)]"
            onMouseDown={(event) => event.stopPropagation()}
          >
            {/* Background glow */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[#25D366]/10 blur-3xl" />

            <div className="pointer-events-none absolute -bottom-24 -left-20 h-48 w-48 rounded-full bg-[#8B5CF6]/10 blur-3xl" />

            {/* =====================================================
                HEADER
            ===================================================== */}
            <div className="relative border-b border-white/[0.07] px-6 py-5">
              <button
                type="button"
                onClick={closePopup}
                aria-label="Tutup"
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 pr-8">
                <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm">
                  <WhatsAppLogo size={32} />
                </div>

                <div>
                  <h2 className="text-base font-semibold text-white">
                    Hubungi 39Production
                  </h2>

                  <p className="mt-0.5 text-xs text-zinc-400">
                    Isi detail sebelum melanjutkan ke WhatsApp
                  </p>
                </div>
              </div>
            </div>

            {/* =====================================================
                FORM
            ===================================================== */}
            {!isPreview ? (
              <div className="relative space-y-5 px-6 py-6">
                {/* Name */}
                <div>
                  <label
                    htmlFor="whatsapp-name"
                    className="mb-2 block text-xs font-medium text-zinc-300"
                  >
                    Nama
                  </label>

                  <input
                    id="whatsapp-name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Masukkan nama Anda"
                    className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition-all placeholder:text-zinc-600 focus:border-[#25D366]/60 focus:bg-white/[0.06] focus:ring-2 focus:ring-[#25D366]/10"
                  />
                </div>

                {/* Category */}
                <div>
                  <label
                    htmlFor="whatsapp-category"
                    className="mb-2 block text-xs font-medium text-zinc-300"
                  >
                    Kebutuhan
                  </label>

                  <select
                    id="whatsapp-category"
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    className={`h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm outline-none transition-all focus:border-[#25D366]/60 focus:bg-white/[0.06] focus:ring-2 focus:ring-[#25D366]/10 ${category ? 'text-white' : 'text-zinc-600'
                      }`}
                  >
                    <option value="" disabled>
                      Pilih kebutuhan...
                    </option>

                    <option value="Jasa / Service">
                      Jasa / Service
                    </option>

                    <option value="Produk Digital">
                      Produk Digital
                    </option>

                    <option value="Produksi Idol">
                      Entertainment
                    </option>

                    <option value="Kerja Sama">
                      Kerja Sama
                    </option>

                    <option value="Lainnya">
                      Lainnya
                    </option>
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label
                    htmlFor="whatsapp-message"
                    className="mb-2 block text-xs font-medium text-zinc-300"
                  >
                    Pesan
                  </label>

                  <textarea
                    id="whatsapp-message"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Tulis kebutuhan atau pertanyaan Anda..."
                    rows={5}
                    className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-relaxed text-white outline-none transition-all placeholder:text-zinc-600 focus:border-[#25D366]/60 focus:bg-white/[0.06] focus:ring-2 focus:ring-[#25D366]/10"
                  />
                </div>

                {/* Action */}
                <button
                  type="button"
                  onClick={handleContinue}
                  disabled={!isFormValid}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] text-sm font-semibold text-white shadow-[0_8px_25px_rgba(37,211,102,0.18)] transition-all hover:bg-[#20bd5a] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                >
                  Lihat Template
                  <ArrowRight size={17} />
                </button>
              </div>
            ) : (
              /* ===================================================
                 PREVIEW
              =================================================== */
              <div className="relative px-6 py-6">
                <div className="mb-4">
                  <p className="text-xs font-medium text-zinc-400">
                    Preview pesan
                  </p>

                  <p className="mt-1 text-sm text-white">
                    Pastikan informasi sudah benar sebelum dikirim.
                  </p>
                </div>

                {/* Message Preview */}
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4">
                  {/* WhatsApp header */}
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-white">
                      <WhatsAppLogo size={25} />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-white">
                        39Production
                      </p>

                      <p className="text-[11px] text-zinc-500">
                        WhatsApp message
                      </p>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="rounded-xl bg-[#25D366]/10 p-4 text-sm leading-relaxed text-zinc-200">
                    <p>
                      Halo 39Production! 👋
                    </p>

                    <p className="mt-3">
                      Saya ingin menghubungi 39Production.
                    </p>

                    <div className="my-3 space-y-1 border-y border-white/10 py-3">
                      <p>
                        <span className="text-zinc-500">
                          Nama:
                        </span>{' '}
                        {name}
                      </p>

                      <p>
                        <span className="text-zinc-500">
                          Kebutuhan:
                        </span>{' '}
                        {category}
                      </p>
                    </div>

                    <p className="text-zinc-500">
                      Pesan:
                    </p>

                    <p className="mt-1 whitespace-pre-wrap">
                      {message}
                    </p>

                    <p className="mt-3">
                      Mohon informasinya. Terima kasih!
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPreview(false)}
                    className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] text-sm font-medium text-zinc-300 transition-colors hover:bg-white/[0.08] hover:text-white"
                  >
                    <MessageCircle size={16} />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={handleSendWhatsApp}
                    className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#25D366] text-sm font-semibold text-white shadow-[0_8px_25px_rgba(37,211,102,0.2)] transition-all hover:bg-[#20bd5a]"
                  >
                    <Check size={16} />
                    Kirim
                  </button>
                </div>
              </div>
            )}

            {/* =====================================================
                FOOTER
            ===================================================== */}
            <div className="border-t border-white/[0.05] px-6 py-3">
              <p className="text-center text-[10px] text-zinc-600">
                Pesan akan dibuka melalui WhatsApp dan dapat Anda edit
                kembali sebelum dikirim.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}