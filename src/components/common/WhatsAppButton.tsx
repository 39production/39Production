import { useEffect, useState } from 'react'
import {
  ArrowRight,
  Check,
  MessageCircle,
  X,
} from 'lucide-react'
import whatsappLogo from '../../assets/whatsapp-logo.svg'

type WhatsAppButtonVariant =
  | 'float'
  | 'icon'
  | 'inline'

interface WhatsAppButtonProps {
  variant?: WhatsAppButtonVariant
  phoneNumber?: string
  className?: string
}

const DEFAULT_PHONE_NUMBER =
  '6281217504730'

const getWhatsAppUrl = (
  phoneNumber: string,
  message: string,
) => {
  const cleanNumber =
    phoneNumber.replace(/\D/g, '')

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(
    message,
  )}`
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

function WhatsAppLogo({
  size = 28,
}: {
  size?: number
}) {
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
  const [isOpen, setIsOpen] =
    useState(false)

  const [name, setName] = useState('')
  const [category, setCategory] =
    useState('')

  const [message, setMessage] =
    useState('')

  const [isPreview, setIsPreview] =
    useState(false)

  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (
      event: KeyboardEvent,
    ) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
        setIsPreview(false)
      }
    }

    document.addEventListener(
      'keydown',
      handleEscape,
    )

    return () => {
      document.removeEventListener(
        'keydown',
        handleEscape,
      )
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
    if (
      !name.trim() ||
      !category ||
      !message.trim()
    ) {
      return
    }

    setIsPreview(true)
  }

  const handleSendWhatsApp = () => {
    const whatsappMessage =
      projectInquiryMessage({
        name: name.trim(),
        category,
        message: message.trim(),
      })

    window.open(
      getWhatsAppUrl(
        phoneNumber,
        whatsappMessage,
      ),
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
      ========================================================== */}

      {variant === 'float' && (
        <button
          type="button"
          onClick={openPopup}
          aria-label="Chat dengan 39Production melalui WhatsApp"
          className={`
            whatsappFloat
            group
            fixed
            bottom-5
            right-5
            z-40
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-full
            border
            border-white
            bg-[#25D366]
            shadow-[0_12px_35px_rgba(37,211,102,0.28)]
            transition-all
            duration-300
            hover:scale-105
            hover:bg-[#20bd5a]
            hover:shadow-[0_16px_45px_rgba(37,211,102,0.36)]
            active:scale-95
            sm:bottom-6
            sm:right-6
            ${className}
          `}
        >
          <span className="absolute inset-1 rounded-full border border-white/30" />

          <span className="relative z-10 flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm">
            <WhatsAppLogo size={27} />
          </span>

          <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#25D366]" />

          <span className="pointer-events-none absolute right-16 hidden whitespace-nowrap rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-700 opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 sm:block">
            Chat via WhatsApp
          </span>
        </button>
      )}

      {/* =========================================================
          ICON BUTTON
      ========================================================== */}

      {variant === 'icon' && (
        <button
          type="button"
          onClick={openPopup}
          aria-label="Chat via WhatsApp"
          className={`
            group
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            border
            border-green-200
            bg-green-50
            transition-all
            duration-200
            hover:scale-105
            hover:border-green-300
            hover:bg-green-100
            active:scale-95
            ${className}
          `}
        >
          <WhatsAppLogo size={22} />
        </button>
      )}

      {/* =========================================================
          INLINE BUTTON
      ========================================================== */}

      {variant === 'inline' && (
        <button
          type="button"
          onClick={openPopup}
          className={`
            group
            relative
            inline-flex
            items-center
            gap-3
            overflow-hidden
            rounded-full
            bg-[#25D366]
            px-5
            py-3
            text-sm
            font-semibold
            text-white
            shadow-[0_10px_30px_rgba(37,211,102,0.18)]
            transition-all
            duration-300
            hover:-translate-y-0.5
            hover:bg-[#20bd5a]
            hover:shadow-[0_14px_35px_rgba(37,211,102,0.26)]
            active:translate-y-0
            ${className}
          `}
        >
          <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

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
      ========================================================== */}

      {isOpen && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            bg-neutral-950/35
            p-4
            backdrop-blur-sm
          "
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closePopup()
            }
          }}
        >
          <div
            className="
              whatsappModal
              relative
              flex
              max-h-[calc(100vh-2rem)]
              w-full
              max-w-md
              flex-col
              overflow-hidden
              rounded-[26px]
              border
              border-neutral-200
              bg-white
              shadow-[0_30px_100px_rgba(15,23,42,0.20)]
            "
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            {/* ===================================================
                SOFT BACKGROUND ACCENTS
            ==================================================== */}

            <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-green-100/70 blur-3xl" />

            <div className="pointer-events-none absolute -bottom-24 -left-20 h-48 w-48 rounded-full bg-violet-100/60 blur-3xl" />

            {/* ===================================================
                HEADER
            ==================================================== */}

            <div className="relative border-b border-neutral-200 px-5 py-5 sm:px-6">
              <button
                type="button"
                onClick={closePopup}
                aria-label="Tutup"
                className="
                  absolute
                  right-4
                  top-4
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-full
                  text-neutral-400
                  transition-colors
                  hover:bg-neutral-100
                  hover:text-neutral-800
                "
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 pr-8">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-green-100 bg-green-50 shadow-sm">
                  <WhatsAppLogo size={32} />
                </div>

                <div>
                  <h2 className="text-base font-semibold text-neutral-950">
                    Hubungi 39Production
                  </h2>

                  <p className="mt-0.5 text-xs text-neutral-500">
                    Isi detail sebelum melanjutkan ke WhatsApp
                  </p>
                </div>
              </div>
            </div>

            {/* ===================================================
                BODY
            ==================================================== */}

            <div className="relative min-h-0 flex-1 overflow-y-auto">
              {!isPreview ? (
                <div className="space-y-5 px-5 py-6 sm:px-6">
                  {/* Name */}
                  <div>
                    <label
                      htmlFor="whatsapp-name"
                      className="mb-2 block text-xs font-semibold text-neutral-700"
                    >
                      Nama
                    </label>

                    <input
                      id="whatsapp-name"
                      type="text"
                      value={name}
                      onChange={(event) =>
                        setName(
                          event.target.value,
                        )
                      }
                      placeholder="Masukkan nama Anda"
                      className="
                        h-11
                        w-full
                        rounded-xl
                        border
                        border-neutral-200
                        bg-neutral-50
                        px-4
                        text-sm
                        text-neutral-900
                        outline-none
                        transition-all
                        placeholder:text-neutral-400
                        focus:border-green-400
                        focus:bg-white
                        focus:ring-4
                        focus:ring-green-50
                      "
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label
                      htmlFor="whatsapp-category"
                      className="mb-2 block text-xs font-semibold text-neutral-700"
                    >
                      Kebutuhan
                    </label>

                    <select
                      id="whatsapp-category"
                      value={category}
                      onChange={(event) =>
                        setCategory(
                          event.target.value,
                        )
                      }
                      className={`
                        h-11
                        w-full
                        rounded-xl
                        border
                        border-neutral-200
                        bg-neutral-50
                        px-4
                        text-sm
                        outline-none
                        transition-all
                        focus:border-green-400
                        focus:bg-white
                        focus:ring-4
                        focus:ring-green-50
                        ${category
                          ? 'text-neutral-900'
                          : 'text-neutral-400'
                        }
                      `}
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
                      className="mb-2 block text-xs font-semibold text-neutral-700"
                    >
                      Pesan
                    </label>

                    <textarea
                      id="whatsapp-message"
                      value={message}
                      onChange={(event) =>
                        setMessage(
                          event.target.value,
                        )
                      }
                      placeholder="Tulis kebutuhan atau pertanyaan Anda..."
                      rows={5}
                      className="
                        w-full
                        resize-none
                        rounded-xl
                        border
                        border-neutral-200
                        bg-neutral-50
                        px-4
                        py-3
                        text-sm
                        leading-relaxed
                        text-neutral-900
                        outline-none
                        transition-all
                        placeholder:text-neutral-400
                        focus:border-green-400
                        focus:bg-white
                        focus:ring-4
                        focus:ring-green-50
                      "
                    />
                  </div>

                  {/* Continue */}
                  <button
                    type="button"
                    onClick={
                      handleContinue
                    }
                    disabled={!isFormValid}
                    className="
                      flex
                      h-12
                      w-full
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      bg-[#25D366]
                      text-sm
                      font-semibold
                      text-white
                      shadow-[0_8px_25px_rgba(37,211,102,0.18)]
                      transition-all
                      hover:bg-[#20bd5a]
                      disabled:cursor-not-allowed
                      disabled:opacity-40
                      disabled:shadow-none
                    "
                  >
                    Lihat Template
                    <ArrowRight size={17} />
                  </button>
                </div>
              ) : (
                <div className="px-5 py-6 sm:px-6">
                  {/* Preview header */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-neutral-500">
                      Preview pesan
                    </p>

                    <p className="mt-1 text-sm text-neutral-800">
                      Pastikan informasi sudah benar sebelum dikirim.
                    </p>
                  </div>

                  {/* Message card */}
                  <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50">
                    {/* WhatsApp header */}
                    <div className="border-b border-neutral-200 bg-white px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-green-50">
                          <WhatsAppLogo size={25} />
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-neutral-900">
                            39Production
                          </p>

                          <p className="text-[11px] text-neutral-400">
                            WhatsApp message
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Message */}
                    <div className="p-4">
                      <div className="rounded-2xl rounded-tl-md border border-green-100 bg-green-50 p-4 text-sm leading-relaxed text-neutral-700">
                        <p>
                          Halo 39Production! 👋
                        </p>

                        <p className="mt-3">
                          Saya ingin menghubungi 39Production.
                        </p>

                        <div className="my-3 space-y-1 border-y border-green-100 py-3">
                          <p>
                            <span className="text-neutral-400">
                              Nama:
                            </span>{' '}
                            {name}
                          </p>

                          <p>
                            <span className="text-neutral-400">
                              Kebutuhan:
                            </span>{' '}
                            {category}
                          </p>
                        </div>

                        <p className="text-neutral-400">
                          Pesan:
                        </p>

                        <p className="mt-1 whitespace-pre-wrap text-neutral-700">
                          {message}
                        </p>

                        <p className="mt-3">
                          Mohon informasinya. Terima kasih!
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setIsPreview(
                          false,
                        )
                      }
                      className="
                        flex
                        h-11
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        border
                        border-neutral-200
                        bg-white
                        text-sm
                        font-medium
                        text-neutral-700
                        transition-colors
                        hover:bg-neutral-50
                      "
                    >
                      <MessageCircle size={16} />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={
                        handleSendWhatsApp
                      }
                      className="
                        flex
                        h-11
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        bg-[#25D366]
                        text-sm
                        font-semibold
                        text-white
                        shadow-[0_8px_25px_rgba(37,211,102,0.18)]
                        transition-all
                        hover:bg-[#20bd5a]
                      "
                    >
                      <Check size={16} />
                      Kirim
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ===================================================
                FOOTER
            ==================================================== */}

            <div className="border-t border-neutral-200 bg-neutral-50 px-5 py-3 sm:px-6">
              <p className="text-center text-[10px] leading-4 text-neutral-400">
                Pesan akan dibuka melalui WhatsApp dan dapat Anda edit
                kembali sebelum dikirim.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          ANIMATIONS
      ========================================================== */}

      <style>{`
        .whatsappModal {
          animation: whatsappModalIn 0.25s ease-out both;
        }

        .whatsappFloat {
          animation: whatsappFloatIn 0.5s ease-out both;
        }

        @keyframes whatsappModalIn {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.98);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes whatsappFloatIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }

          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .whatsappModal,
          .whatsappFloat {
            animation: none !important;
          }
        }
      `}</style>
    </>
  )
}