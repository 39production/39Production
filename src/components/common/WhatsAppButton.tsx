import { useEffect, useRef, useState } from 'react'
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

/* value dipakai di isi pesan WhatsApp, label dipakai di tampilan */
const CATEGORIES = [
  { value: 'Jasa / Service', label: 'Jasa / Service' },
  { value: 'Produk Digital', label: 'Produk Digital' },
  { value: 'Produksi Idol', label: 'Entertainment' },
  { value: 'Kerja Sama', label: 'Kerja Sama' },
  { value: 'Lainnya', label: 'Lainnya' },
]

const CUBE_FACES = [
  'rotateY(0deg)',
  'rotateY(90deg)',
  'rotateY(180deg)',
  'rotateY(270deg)',
  'rotateX(90deg)',
  'rotateX(-90deg)',
]

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

const formatClock = () =>
  new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  })
    .format(new Date())
    .replace('.', ':')

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

  const nameRef =
    useRef<HTMLInputElement | null>(null)

  /* ---------- Font (dipakai bersama splash & hero) ---------- */
  useEffect(() => {
    const fontId = 'splash-fonts'
    if (document.getElementById(fontId)) return

    const link = document.createElement('link')
    link.id = fontId
    link.rel = 'stylesheet'
    link.href =
      'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap'
    document.head.appendChild(link)
  }, [])

  /* ---------- Escape + kunci scroll + fokus awal ---------- */
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

    const previousOverflow =
      document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const focusTimer = window.setTimeout(
      () => nameRef.current?.focus(),
      250,
    )

    return () => {
      document.removeEventListener(
        'keydown',
        handleEscape,
      )
      document.body.style.overflow =
        previousOverflow
      window.clearTimeout(focusTimer)
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
          className={`wa-float group fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center sm:bottom-6 sm:right-6 ${className}`}
        >
          {/* Cincin orbit 3D */}
          <span
            aria-hidden="true"
            className="wa-orbit pointer-events-none absolute -inset-3"
          >
            <span className="wa-orbit-tilt wa-orbit-a">
              <span className="wa-ring wa-ring-a">
                <i />
              </span>
            </span>
            <span className="wa-orbit-tilt wa-orbit-b">
              <span className="wa-ring wa-ring-b">
                <i />
              </span>
            </span>
          </span>

          {/* Ping */}
          <span
            aria-hidden="true"
            className="wa-ping pointer-events-none absolute inset-0 rounded-full bg-[#25D366]"
          />

          {/* Inti tombol */}
          <span className="wa-core relative flex h-14 w-14 items-center justify-center rounded-full border border-white bg-[#25D366] shadow-[0_12px_35px_rgba(37,211,102,0.32)] transition-all duration-300 group-hover:scale-105 group-hover:bg-[#20bd5a] group-hover:shadow-[0_16px_45px_rgba(37,211,102,0.42)] group-active:scale-95">
            <span className="absolute inset-1 rounded-full border border-white/30" />

            <span className="wa-plate relative z-10 flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm">
              <WhatsAppLogo size={27} />
            </span>
          </span>

          {/* Tooltip */}
          <span className="wa-tip pointer-events-none absolute right-[4.6rem] hidden whitespace-nowrap bg-black px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-white opacity-0 shadow-lg sm:block">
            Chat via WhatsApp
            <span className="absolute -right-1 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 bg-black" />
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
          className={`group relative flex h-10 w-10 items-center justify-center border border-green-200 bg-green-50 transition-all duration-200 hover:border-violet-400 hover:bg-white active:scale-95 ${className}`}
        >
          <span className="wa-flip flex items-center justify-center">
            <WhatsAppLogo size={22} />
          </span>

          <span
            aria-hidden="true"
            className="wa-blink absolute -right-1 -top-1 h-2 w-2 rounded-full bg-fuchsia-500"
          />
        </button>
      )}

      {/* =========================================================
          INLINE BUTTON
      ========================================================== */}

      {variant === 'inline' && (
        <button
          type="button"
          onClick={openPopup}
          className={`wa-inline group relative inline-flex items-center gap-3 overflow-hidden bg-[#25D366] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(37,211,102,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#20bd5a] hover:shadow-[0_14px_35px_rgba(37,211,102,0.3)] active:translate-y-0 ${className}`}
        >
          <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

          <span className="relative flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-white">
            <span className="wa-flip flex items-center justify-center">
              <WhatsAppLogo size={21} />
            </span>
          </span>

          <span className="relative">
            Chat on WhatsApp
          </span>

          <ArrowRight
            size={16}
            className="relative transition-transform duration-200 group-hover:translate-x-1"
          />
        </button>
      )}

      {/* =========================================================
          POPUP
      ========================================================== */}

      {isOpen && (
        <div
          className="wa-overlay fixed inset-0 z-[100] flex items-center justify-center bg-neutral-950/45 p-4 backdrop-blur-sm"
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
            className="wa-stage relative w-full max-w-md"
            style={{ perspective: 1400 }}
          >
            {/* Dekorasi 3D di luar panel */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -left-24 top-10 hidden lg:block"
            >
              <div className="wa-float-slow">
                <div className="wa-cube">
                  {CUBE_FACES.map((transform) => (
                    <i
                      key={transform}
                      style={{
                        transform: `${transform} translateZ(calc(var(--s) / 2))`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-24 bottom-16 hidden lg:block"
            >
              <div className="wa-float-slow" style={{ animationDelay: '-3s' }}>
                <div className="wa-gyro">
                  <span className="wa-g1" />
                  <span className="wa-g2" />
                  <span className="wa-g3" />
                </div>
              </div>
            </div>

            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="whatsapp-title"
              className="wa-modal relative flex max-h-[calc(100vh-2rem)] w-full flex-col overflow-hidden border border-black/10 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.28)]"
              onMouseDown={(event) =>
                event.stopPropagation()
              }
            >
              {/* Aksen latar */}
              <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-violet-200/50 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -left-20 h-48 w-48 rounded-full bg-green-100/70 blur-3xl" />

              {/* Bracket viewfinder */}
              <span aria-hidden="true" className="wa-bracket left-2 top-2 border-l border-t" />
              <span aria-hidden="true" className="wa-bracket right-2 top-2 border-r border-t" />
              <span aria-hidden="true" className="wa-bracket bottom-2 left-2 border-b border-l" />
              <span aria-hidden="true" className="wa-bracket bottom-2 right-2 border-b border-r" />

              {/* ===============================================
                  HEADER
              =============================================== */}
              <div className="relative border-b border-black/10 px-5 py-5 sm:px-6">
                <button
                  type="button"
                  onClick={closePopup}
                  aria-label="Tutup"
                  className="wa-focus absolute right-4 top-4 flex h-9 w-9 items-center justify-center border border-black/10 text-neutral-500 transition-all hover:border-black hover:bg-black hover:text-white"
                >
                  <X size={16} />
                </button>

                <div className="flex items-center gap-3.5 pr-12">
                  <div style={{ perspective: 500 }}>
                    <div className="wa-tile flex h-12 w-12 shrink-0 items-center justify-center border border-green-200 bg-green-50 shadow-sm">
                      <WhatsAppLogo size={32} />
                    </div>
                  </div>

                  <div className="min-w-0">
                    <p className="wa-mono flex items-center gap-2 text-[9px] uppercase tracking-[0.22em] text-neutral-400">
                      <span className="wa-rec h-1.5 w-1.5 rounded-full bg-fuchsia-500" />
                      39Production / Contact
                    </p>

                    <h2
                      id="whatsapp-title"
                      className="wa-display mt-1 text-lg font-bold tracking-[-0.04em] text-neutral-950"
                    >
                      Hubungi 39Production
                    </h2>
                  </div>
                </div>
              </div>

              {/* ===============================================
                  BODY
              =============================================== */}
              <div className="relative min-h-0 flex-1 overflow-y-auto">
                {/* Timeline langkah */}
                <div className="px-5 pt-5 sm:px-6">
                  <div className="wa-mono flex items-center justify-between text-[10px] uppercase tracking-[0.18em]">
                    <span className={!isPreview ? 'text-black' : 'text-neutral-400'}>
                      01 Detail
                    </span>
                    <span className={isPreview ? 'text-black' : 'text-neutral-400'}>
                      02 Preview
                    </span>
                  </div>

                  <div className="relative mt-2 h-[2px] bg-black/10">
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-500 to-fuchsia-400 transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                      style={{ width: isPreview ? '100%' : '50%' }}
                    />
                    <span
                      aria-hidden="true"
                      className="absolute top-1/2 h-2 w-2 -translate-y-1/2 -translate-x-1/2 rotate-45 bg-violet-600 transition-[left] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                      style={{ left: isPreview ? '100%' : '50%' }}
                    />
                  </div>
                </div>

                {!isPreview ? (
                  <div key="form" className="wa-step space-y-5 px-5 pb-6 pt-6 sm:px-6">
                    {/* Name */}
                    <div>
                      <label
                        htmlFor="whatsapp-name"
                        className="wa-mono mb-2 block text-[10px] uppercase tracking-[0.18em] text-neutral-500"
                      >
                        Nama
                      </label>

                      <input
                        ref={nameRef}
                        id="whatsapp-name"
                        type="text"
                        value={name}
                        onChange={(event) =>
                          setName(event.target.value)
                        }
                        placeholder="Masukkan nama Anda"
                        className="h-11 w-full border border-neutral-300 bg-white px-4 text-sm text-neutral-900 outline-none transition-all placeholder:text-neutral-400 focus:border-violet-600 focus:ring-4 focus:ring-violet-100"
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <span
                        id="whatsapp-category-label"
                        className="wa-mono mb-2 block text-[10px] uppercase tracking-[0.18em] text-neutral-500"
                      >
                        Kebutuhan
                      </span>

                      <div
                        role="radiogroup"
                        aria-labelledby="whatsapp-category-label"
                        className="flex flex-wrap gap-2"
                      >
                        {CATEGORIES.map((item) => {
                          const selected =
                            category === item.value

                          return (
                            <button
                              key={item.value}
                              type="button"
                              role="radio"
                              aria-checked={selected}
                              onClick={() =>
                                setCategory(item.value)
                              }
                              className={`wa-focus border px-3.5 py-2 text-xs font-semibold transition-all duration-200 ${selected
                                  ? 'border-black bg-black text-white shadow-[3px_3px_0_0_rgba(124,58,237,0.9)]'
                                  : 'border-neutral-300 bg-white text-neutral-600 hover:border-violet-500 hover:text-violet-700'
                                }`}
                            >
                              {item.label}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <label
                          htmlFor="whatsapp-message"
                          className="wa-mono block text-[10px] uppercase tracking-[0.18em] text-neutral-500"
                        >
                          Pesan
                        </label>

                        <span className="wa-mono text-[10px] tabular-nums text-neutral-300">
                          {String(message.length).padStart(3, '0')}
                        </span>
                      </div>

                      <textarea
                        id="whatsapp-message"
                        value={message}
                        onChange={(event) =>
                          setMessage(event.target.value)
                        }
                        placeholder="Tulis kebutuhan atau pertanyaan Anda..."
                        rows={5}
                        className="w-full resize-none border border-neutral-300 bg-white px-4 py-3 text-sm leading-relaxed text-neutral-900 outline-none transition-all placeholder:text-neutral-400 focus:border-violet-600 focus:ring-4 focus:ring-violet-100"
                      />
                    </div>

                    {/* Continue */}
                    <button
                      type="button"
                      onClick={handleContinue}
                      disabled={!isFormValid}
                      className="wa-focus group/btn relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden bg-black text-sm font-semibold text-white transition-colors duration-300 hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-black"
                    >
                      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
                      <span className="relative">Lihat Template</span>
                      <ArrowRight
                        size={17}
                        className="relative transition-transform duration-200 group-hover/btn:translate-x-1"
                      />
                    </button>
                  </div>
                ) : (
                  <div key="preview" className="wa-step px-5 pb-6 pt-6 sm:px-6">
                    {/* Preview header */}
                    <div className="mb-4">
                      <p className="wa-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500">
                        Preview pesan
                      </p>

                      <p className="mt-1 text-sm text-neutral-800">
                        Pastikan informasi sudah benar sebelum dikirim.
                      </p>
                    </div>

                    {/* Message card */}
                    <div className="overflow-hidden border border-neutral-200 bg-neutral-50">
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

                            <p className="wa-mono text-[10px] uppercase tracking-[0.14em] text-neutral-400">
                              WhatsApp message
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Message */}
                      <div className="p-4">
                        <div className="rounded-2xl rounded-tl-sm border border-green-100 bg-green-50 p-4 text-sm leading-relaxed text-neutral-700">
                          <p className="wa-line" style={{ ['--i' as string]: 0 }}>
                            Halo 39Production! 👋
                          </p>

                          <p className="wa-line mt-3" style={{ ['--i' as string]: 1 }}>
                            Saya ingin menghubungi 39Production.
                          </p>

                          <div
                            className="wa-line my-3 space-y-1 border-y border-green-100 py-3"
                            style={{ ['--i' as string]: 2 }}
                          >
                            <p>
                              <span className="text-neutral-400">Nama:</span>{' '}
                              {name}
                            </p>

                            <p>
                              <span className="text-neutral-400">Kebutuhan:</span>{' '}
                              {category}
                            </p>
                          </div>

                          <p
                            className="wa-line text-neutral-400"
                            style={{ ['--i' as string]: 3 }}
                          >
                            Pesan:
                          </p>

                          <p
                            className="wa-line mt-1 whitespace-pre-wrap break-words text-neutral-700"
                            style={{ ['--i' as string]: 4 }}
                          >
                            {message}
                          </p>

                          <p className="wa-line mt-3" style={{ ['--i' as string]: 5 }}>
                            Mohon informasinya. Terima kasih!
                          </p>

                          <p
                            className="wa-line wa-mono mt-2 flex items-center justify-end gap-1 text-[10px] text-neutral-400"
                            style={{ ['--i' as string]: 6 }}
                          >
                            {formatClock()}
                            <Check size={11} className="text-violet-500" />
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setIsPreview(false)}
                        className="wa-focus flex h-11 items-center justify-center gap-2 border border-neutral-300 bg-white text-sm font-medium text-neutral-700 transition-colors hover:border-black hover:bg-black hover:text-white"
                      >
                        <MessageCircle size={16} />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={handleSendWhatsApp}
                        className="wa-focus group/send relative flex h-11 items-center justify-center gap-2 overflow-hidden bg-[#25D366] text-sm font-semibold text-white shadow-[0_8px_25px_rgba(37,211,102,0.25)] transition-all hover:bg-[#20bd5a]"
                      >
                        <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover/send:translate-x-full" />
                        <Check size={16} className="relative" />
                        <span className="relative">Kirim</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* ===============================================
                  FOOTER
              =============================================== */}
              <div className="relative border-t border-black/10 bg-neutral-50 px-5 py-3 sm:px-6">
                <p className="wa-mono text-center text-[9px] uppercase leading-4 tracking-[0.14em] text-neutral-400">
                  Pesan dibuka melalui WhatsApp dan dapat Anda edit kembali sebelum dikirim
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          ANIMATIONS
      ========================================================== */}

      <style>{`
        .wa-display { font-family: 'Space Grotesk', system-ui, -apple-system, 'Segoe UI', sans-serif; }
        .wa-mono { font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace; }
        .wa-focus:focus-visible {
          outline: 2px solid #7c3aed;
          outline-offset: 2px;
        }

        /* ---------- Tombol float ---------- */
        .wa-float { animation: waFloatIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.4s both; }

        .wa-orbit { perspective: 260px; }
        .wa-orbit-tilt {
          position: absolute;
          inset: 0;
          transform-style: preserve-3d;
        }
        .wa-orbit-a { transform: rotateX(68deg); }
        .wa-orbit-b { transform: rotateY(68deg); }
        .wa-ring {
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          transform-style: preserve-3d;
        }
        .wa-ring-a {
          border: 1px solid rgba(124, 58, 237, 0.55);
          animation: waSpin 9s linear infinite;
        }
        .wa-ring-b {
          border: 1px solid rgba(37, 211, 102, 0.7);
          animation: waSpin 12s linear infinite reverse;
        }
        .wa-ring i {
          position: absolute;
          left: 50%;
          top: 0;
          width: 6px;
          height: 6px;
          margin: -3px 0 0 -3px;
          border-radius: 9999px;
          background: #7c3aed;
          box-shadow: 0 0 10px 1px rgba(124, 58, 237, 0.7);
        }
        .wa-ring-b i {
          background: #25d366;
          box-shadow: 0 0 10px 1px rgba(37, 211, 102, 0.8);
        }

        .wa-ping { animation: waPing 2.8s ease-out 1.2s infinite; }

        .wa-plate {
          animation: waNudge 9s ease-in-out 2s infinite;
          backface-visibility: visible;
        }

        .wa-tip {
          transform: translateX(8px);
          transition: opacity 0.2s ease, transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .wa-float:hover .wa-tip,
        .wa-float:focus-visible .wa-tip {
          opacity: 1;
          transform: translateX(0);
        }

        /* ---------- Logo flip (icon & inline) ---------- */
        .wa-flip { transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1); }
        .group:hover .wa-flip { transform: rotateY(360deg); }

        .wa-blink { animation: waBlink 1.4s ease-in-out infinite; }
        .wa-rec {
          animation: waBlink 1.1s ease-in-out infinite;
          box-shadow: 0 0 8px rgba(217, 70, 239, 0.7);
        }

        /* ---------- Modal ---------- */
        .wa-overlay { animation: waFade 0.25s ease-out both; }

        .wa-modal {
          transform-origin: 50% 100%;
          animation: waModalIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .wa-tile { animation: waTileIn 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both; }

        .wa-bracket {
          position: absolute;
          z-index: 5;
          width: 14px;
          height: 14px;
          border-color: rgba(124, 58, 237, 0.7);
          pointer-events: none;
          animation: waBracket 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.25s both;
        }

        .wa-step { animation: waStep 0.45s cubic-bezier(0.22, 1, 0.36, 1) both; }

        .wa-line {
          animation: waLine 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
          animation-delay: calc(var(--i, 0) * 70ms + 120ms);
        }

        /* Dekorasi 3D */
        .wa-float-slow { animation: waFloat 8s ease-in-out infinite; }

        .wa-cube {
          --s: 64px;
          position: relative;
          width: var(--s);
          height: var(--s);
          transform-style: preserve-3d;
          animation: waCube 14s linear infinite;
        }
        .wa-cube i {
          position: absolute;
          inset: 0;
          border: 1.5px solid rgba(255, 255, 255, 0.9);
          background: rgba(255, 255, 255, 0.12);
        }

        .wa-gyro {
          position: relative;
          width: 88px;
          height: 88px;
          transform-style: preserve-3d;
        }
        .wa-gyro span {
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          border: 1.5px solid rgba(255, 255, 255, 0.9);
          transform-style: preserve-3d;
        }
        .wa-g1 { animation: waGx 9s linear infinite; }
        .wa-g2 { inset: 16%; animation: waGy 7s linear infinite; border-color: #c4b5fd !important; }
        .wa-g3 { inset: 32%; animation: waGz 5s linear infinite; border-color: #25d366 !important; }

        /* ---------- Keyframes ---------- */
        @keyframes waSpin { to { transform: rotate(360deg); } }
        @keyframes waFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes waBlink { 0%, 100% { opacity: 1; } 50% { opacity: .25; } }

        @keyframes waFloatIn {
          from { opacity: 0; transform: scale(0.6) translateY(16px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes waPing {
          0%   { transform: scale(1); opacity: 0.45; }
          70%, 100% { transform: scale(1.9); opacity: 0; }
        }
        @keyframes waNudge {
          0%, 86%, 100% { transform: rotateY(0deg) translateY(0); }
          90% { transform: rotateY(180deg) translateY(-3px); }
          95% { transform: rotateY(360deg) translateY(0); }
        }

        @keyframes waModalIn {
          from { opacity: 0; transform: rotateX(22deg) translateY(36px) scale(0.94); }
          to   { opacity: 1; transform: rotateX(0) translateY(0) scale(1); }
        }
        @keyframes waTileIn {
          from { opacity: 0; transform: rotateY(-180deg) scale(0.6); }
          to   { opacity: 1; transform: rotateY(0) scale(1); }
        }
        @keyframes waBracket {
          from { opacity: 0; transform: scale(2); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes waStep {
          from { opacity: 0; transform: translateX(16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes waLine {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes waFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        @keyframes waCube {
          from { transform: rotateX(-24deg) rotateY(0deg); }
          to   { transform: rotateX(-24deg) rotateY(360deg); }
        }
        @keyframes waGx { to { transform: rotateX(360deg); } }
        @keyframes waGy { to { transform: rotateY(360deg); } }
        @keyframes waGz { to { transform: rotateZ(360deg) rotateX(60deg); } }

        @media (prefers-reduced-motion: reduce) {
          .wa-float,
          .wa-ring,
          .wa-ping,
          .wa-plate,
          .wa-blink,
          .wa-rec,
          .wa-overlay,
          .wa-modal,
          .wa-tile,
          .wa-bracket,
          .wa-step,
          .wa-line,
          .wa-float-slow,
          .wa-cube,
          .wa-gyro span {
            animation: none !important;
          }

          .wa-flip,
          .wa-tip {
            transition: none !important;
          }
        }
      `}</style>
    </>
  )
}