import { useEffect, useState } from 'react'

import logo39Production from '@/assets/logo-39production.png'

interface SplashScreenProps {
    onComplete?: () => void
}

const TICK_COUNT = 51

const RINGS = [
    { rotate: 'rotateY(0deg)', color: 'rgba(167,139,250,.85)', duration: '12s', reverse: false },
    { rotate: 'rotateY(60deg)', color: 'rgba(232,121,249,.8)', duration: '16s', reverse: true },
    { rotate: 'rotateY(120deg)', color: 'rgba(255,255,255,.55)', duration: '20s', reverse: false },
]

const CUBE_FACES = [
    'rotateY(0deg)',
    'rotateY(90deg)',
    'rotateY(180deg)',
    'rotateY(270deg)',
    'rotateX(90deg)',
    'rotateX(-90deg)',
]

function formatTimecode(progress: number) {
    // 0–100% dipetakan ke 2 detik @ 24 fps
    const totalFrames = Math.round((progress / 100) * 48)
    const seconds = Math.floor(totalFrames / 24)
    const frames = totalFrames % 24

    return `00:00:${String(seconds).padStart(2, '0')}:${String(frames).padStart(2, '0')}`
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
    const [isLeaving, setIsLeaving] = useState(false)
    const [progress, setProgress] = useState(0)

    /* ---------- Font + kunci scroll selama splash ---------- */
    useEffect(() => {
        const fontId = 'splash-fonts'

        if (!document.getElementById(fontId)) {
            const link = document.createElement('link')
            link.id = fontId
            link.rel = 'stylesheet'
            link.href =
                'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap'
            document.head.appendChild(link)
        }

        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'

        return () => {
            document.body.style.overflow = previousOverflow
        }
    }, [])

    /* ---------- Progress + timing (sama seperti sebelumnya) ---------- */
    useEffect(() => {
        const startTime = performance.now()
        const duration = 1900

        let frameId = 0

        const animateProgress = (time: number) => {
            const elapsed = time - startTime
            const rawProgress = Math.min(elapsed / duration, 1)

            const easedProgress = 1 - Math.pow(1 - rawProgress, 3)

            setProgress(Math.round(easedProgress * 100))

            if (rawProgress < 1) {
                frameId = requestAnimationFrame(animateProgress)
            }
        }

        frameId = requestAnimationFrame(animateProgress)

        const leaveTimer = window.setTimeout(() => {
            setIsLeaving(true)
        }, 2050)

        const completeTimer = window.setTimeout(() => {
            onComplete?.()
        }, 2550)

        return () => {
            cancelAnimationFrame(frameId)
            window.clearTimeout(leaveTimer)
            window.clearTimeout(completeTimer)
        }
    }, [onComplete])

    return (
        <div
            role="status"
            aria-label="Loading 39Production"
            aria-live="polite"
            className={`sp-root fixed inset-0 z-[9999] flex min-h-screen items-center justify-center overflow-hidden text-white ${isLeaving ? 'sp-leaving pointer-events-none' : ''
                }`}
        >
            {/* =========================================================
                BACKGROUND
            ========================================================== */}

            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                    background:
                        'radial-gradient(50% 42% at 50% 46%, rgba(139,92,246,.26), transparent 70%), radial-gradient(35% 35% at 85% 95%, rgba(217,70,239,.14), transparent 70%)',
                }}
            />

            {/* Lantai grid 3D yang bergerak */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-[50%] overflow-hidden"
                style={{ perspective: 520 }}
            >
                <div className="sp-grid" />
                <div
                    className="absolute inset-0"
                    style={{
                        background: 'linear-gradient(to bottom, var(--sp-bg) 0%, transparent 60%)',
                    }}
                />
            </div>

            {/* Vignette */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                    background:
                        'radial-gradient(120% 90% at 50% 50%, transparent 55%, rgba(0,0,0,.55) 100%)',
                }}
            />

            {/* =========================================================
                VIEWFINDER
            ========================================================== */}

            <div aria-hidden="true" className="pointer-events-none absolute inset-4 sm:inset-8">
                <span className="sp-bracket left-0 top-0 border-l border-t" />
                <span className="sp-bracket right-0 top-0 border-r border-t" />
                <span className="sp-bracket bottom-0 left-0 border-b border-l" />
                <span className="sp-bracket bottom-0 right-0 border-b border-r" />

                <div className="sp-hud absolute left-3 top-3 flex items-center gap-2 sm:left-4 sm:top-4">
                    <span className="sp-rec h-2 w-2 rounded-full bg-fuchsia-500" />
                    <span className="sp-mono text-[10px] tracking-[0.2em] text-white/70">REC</span>
                </div>

                <div className="sp-hud absolute right-3 top-3 sm:right-4 sm:top-4">
                    <span className="sp-mono text-[10px] tabular-nums tracking-[0.18em] text-white/70">
                        {formatTimecode(progress)}
                    </span>
                </div>

                <div className="sp-hud absolute bottom-3 left-3 hidden sm:bottom-4 sm:left-4 sm:block">
                    <span className="sp-mono text-[10px] tracking-[0.2em] text-white/40">
                        39PRODUCTION
                    </span>
                </div>

                <div className="sp-hud absolute bottom-3 right-3 hidden sm:bottom-4 sm:right-4 sm:block">
                    <span className="sp-mono text-[10px] tracking-[0.2em] text-white/40">
                        CREATING DIGITAL WORKS
                    </span>
                </div>
            </div>

            {/* =========================================================
                CENTER
            ========================================================== */}

            <div className="relative z-10 flex w-full max-w-3xl flex-col items-center px-6 text-center sm:px-10">
                {/* ---------------- ADEGAN 3D ---------------- */}
                <div
                    className="sp-stage relative h-[250px] w-[250px] sm:h-[320px] sm:w-[320px]"
                    style={{ perspective: 1100 }}
                >
                    <div className="sp-scene sp-3d absolute inset-0">
                        {/* Dial lensa bertanda ukur, rebah di bidang miring */}
                        <div
                            className="sp-3d absolute inset-0"
                            style={{ transform: 'rotateX(68deg)' }}
                        >
                            <div className="sp-dial absolute inset-0 rounded-full" />
                            <div className="absolute inset-[7%] rounded-full border border-white/15" />
                        </div>

                        {/* Cincin orbital tipis */}
                        <div className="sp-armillary sp-3d absolute inset-[6%]">
                            {RINGS.map((ring, i) => (
                                <div
                                    key={i}
                                    className="sp-3d absolute inset-0"
                                    style={{ transform: ring.rotate }}
                                >
                                    <div
                                        className="absolute inset-0 rounded-full"
                                        style={{
                                            border: `1px solid ${ring.color}`,
                                            animation: `sp-spin ${ring.duration} linear infinite ${ring.reverse ? 'reverse' : ''
                                                }`,
                                        }}
                                    >
                                        <span
                                            className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
                                            style={{ boxShadow: `0 0 12px 2px ${ring.color}` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Kubus wireframe yang mengelilingi logo */}
                        <div className="sp-3d absolute left-1/2 top-1/2 h-0 w-0">
                            <div className="sp-cube sp-3d">
                                {CUBE_FACES.map((transform, i) => (
                                    <div
                                        key={i}
                                        className="sp-face"
                                        style={{
                                            transform: `${transform} translateZ(calc(var(--s) / 2))`,
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Logo */}
                        <div
                            className="sp-logo absolute left-1/2 top-1/2 flex h-24 w-24 items-center justify-center sm:h-28 sm:w-28"
                            style={{ transform: 'translate3d(-50%,-50%,1px)' }}
                        >
                            <span
                                aria-hidden="true"
                                className="sp-ping absolute inset-0 rounded-full bg-violet-500"
                            />
                            <div className="absolute inset-0 rounded-full bg-white shadow-[0_0_60px_rgba(139,92,246,.55)]" />
                            <div className="sp-logo-border absolute inset-0 rounded-full" />

                            <img
                                src={logo39Production}
                                alt="39Production"
                                className="relative z-10 h-[3.4rem] w-auto object-contain sm:h-[4rem]"
                                draggable={false}
                            />
                        </div>

                        {/* Penanda melayang pada kedalaman berbeda */}
                        <span
                            aria-hidden="true"
                            className="sp-chip absolute left-[4%] top-[10%] h-6 w-6 border border-violet-300/70"
                            style={{ ['--z' as string]: '150px' }}
                        />
                        <span
                            aria-hidden="true"
                            className="sp-chip absolute bottom-[14%] right-[2%] h-4 w-4 border border-fuchsia-300/70"
                            style={{ ['--z' as string]: '120px', animationDelay: '-2s' }}
                        />
                        <span
                            aria-hidden="true"
                            className="sp-plus absolute right-[8%] top-[18%] h-5 w-5"
                            style={{ ['--z' as string]: '170px', animationDelay: '-1s' }}
                        />
                        <span
                            aria-hidden="true"
                            className="sp-plus absolute bottom-[22%] left-[2%] h-4 w-4"
                            style={{ ['--z' as string]: '110px', animationDelay: '-3s' }}
                        />
                    </div>
                </div>

                {/* ---------------- JUDUL ---------------- */}
                <div className="mt-5 sm:mt-7">
                    <h1 className="sp-display overflow-hidden pb-1 text-[clamp(2rem,6.4vw,3.6rem)] font-semibold leading-none tracking-[-0.04em]">
                        <span className="sp-title-inner block">
                            <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                                39
                            </span>
                            Production
                        </span>
                    </h1>

                    <p className="sp-subtitle sp-mono mt-4 text-[10px] tracking-[0.34em] text-white/55 sm:text-[11px]">
                        DIGITAL PRODUCTION HOUSE
                    </p>
                </div>

                {/* ---------------- TIMELINE PROGRESS ---------------- */}
                <div className="sp-status mt-10 w-full max-w-[22rem] sm:mt-12 sm:max-w-md">
                    <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="sp-dot h-1.5 w-1.5 rounded-full bg-fuchsia-400" />
                            <span className="sp-mono text-[10px] tracking-[0.2em] text-white/55">
                                RENDERING EXPERIENCE
                            </span>
                        </div>

                        <span className="sp-mono text-[11px] tabular-nums tracking-[0.12em] text-white/85">
                            {String(progress).padStart(3, '0')}%
                        </span>
                    </div>

                    <div className="relative pb-3 pt-5">
                        {/* Penggaris */}
                        <div aria-hidden="true" className="flex items-end justify-between">
                            {Array.from({ length: TICK_COUNT }).map((_, i) => {
                                const major = i % 5 === 0
                                const lit = (i / (TICK_COUNT - 1)) * 100 <= progress

                                return (
                                    <span
                                        key={i}
                                        className="block w-px"
                                        style={{
                                            height: major ? 14 : 7,
                                            background: lit
                                                ? 'rgba(255,255,255,.9)'
                                                : 'rgba(255,255,255,.2)',
                                            transition: 'background 120ms linear',
                                        }}
                                    />
                                )
                            })}
                        </div>

                        {/* Garis progres */}
                        <div className="relative mt-2 h-[2px] overflow-hidden bg-white/10">
                            <div
                                className="sp-progress absolute inset-y-0 left-0 bg-gradient-to-r from-violet-500 via-fuchsia-400 to-violet-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>

                        {/* Playhead */}
                        <div
                            aria-hidden="true"
                            className="absolute top-0 -translate-x-1/2"
                            style={{ left: `${progress}%`, transition: 'left 120ms linear' }}
                        >
                            <span className="block h-0 w-0 border-x-[5px] border-t-[7px] border-x-transparent border-t-fuchsia-400" />
                            <span className="mx-auto block h-[34px] w-px bg-fuchsia-400/80" />
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .sp-root{
                    --sp-bg:#08060f;
                    background:var(--sp-bg);
                    font-family:'Space Grotesk',system-ui,-apple-system,'Segoe UI',sans-serif;
                    clip-path:circle(150% at 50% 50%);
                    transition:clip-path 520ms cubic-bezier(.76,0,.24,1);
                }
                .sp-root.sp-leaving{
                    clip-path:circle(0% at 50% 50%);
                }
                .sp-display{
                    font-family:'Space Grotesk',system-ui,sans-serif;
                }
                .sp-mono{
                    font-family:'JetBrains Mono',ui-monospace,SFMono-Regular,Menlo,monospace;
                }
                .sp-3d{transform-style:preserve-3d}

                /* ---------- Lantai grid ---------- */
                .sp-grid{
                    position:absolute;
                    left:-60%;
                    width:220%;
                    top:0;
                    height:260%;
                    transform-origin:50% 0;
                    transform:rotateX(68deg);
                    background-image:
                        linear-gradient(to right, rgba(167,139,250,.35) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(167,139,250,.28) 1px, transparent 1px);
                    background-size:64px 64px;
                    animation:sp-grid 2s linear infinite;
                }

                /* ---------- Viewfinder ---------- */
                .sp-bracket{
                    position:absolute;
                    width:22px;
                    height:22px;
                    border-color:rgba(255,255,255,.4);
                    animation:sp-bracket 700ms cubic-bezier(.22,1,.36,1) both;
                }
                .sp-hud{
                    animation:sp-fade 700ms ease 500ms both;
                }
                .sp-rec{
                    animation:sp-blink 1.1s ease-in-out infinite;
                    box-shadow:0 0 10px rgba(217,70,239,.8);
                }

                /* ---------- Adegan ---------- */
                .sp-stage{
                    animation:sp-stage-in 1000ms cubic-bezier(.16,1,.3,1) both;
                }
                .sp-scene{
                    animation:sp-sway 7s ease-in-out infinite;
                }
                .sp-armillary{
                    animation:sp-armillary 18s linear infinite;
                }
                .sp-dial{
                    background:repeating-conic-gradient(from 0deg, rgba(255,255,255,.65) 0 .7deg, transparent .7deg 5deg);
                    -webkit-mask:radial-gradient(farthest-side, transparent calc(100% - 14px), #000 calc(100% - 13px));
                    mask:radial-gradient(farthest-side, transparent calc(100% - 14px), #000 calc(100% - 13px));
                    border:1px solid rgba(255,255,255,.3);
                    animation:sp-spin 26s linear infinite;
                }
                .sp-cube{
                    --s:150px;
                    position:absolute;
                    left:0;
                    top:0;
                    width:var(--s);
                    height:var(--s);
                    margin-left:calc(var(--s) / -2);
                    margin-top:calc(var(--s) / -2);
                    animation:sp-cube 16s linear infinite;
                }
                @media (min-width:640px){
                    .sp-cube{--s:190px}
                }
                .sp-face{
                    position:absolute;
                    inset:0;
                    border:1px solid rgba(196,181,253,.6);
                    background:linear-gradient(135deg, rgba(139,92,246,.1), rgba(217,70,239,.04));
                }
                .sp-logo{
                    animation:sp-logo-in 1000ms cubic-bezier(.16,1,.3,1) both;
                }
                .sp-logo-border{
                    background:conic-gradient(
                        from 0deg,
                        rgba(139,92,246,0),
                        rgba(139,92,246,.95),
                        rgba(232,121,249,.95),
                        rgba(139,92,246,0)
                    );
                    -webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);
                    mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);
                    -webkit-mask-composite:xor;
                    mask-composite:exclude;
                    padding:2px;
                    animation:sp-spin 3s linear infinite;
                }
                .sp-ping{
                    animation:sp-ping 1.9s ease-out infinite;
                }
                .sp-chip{
                    animation:sp-chip 7s ease-in-out infinite;
                }
                .sp-plus{
                    animation:sp-chip 8s ease-in-out infinite;
                    background:
                        linear-gradient(rgba(255,255,255,.7),rgba(255,255,255,.7)) center/100% 1px no-repeat,
                        linear-gradient(rgba(255,255,255,.7),rgba(255,255,255,.7)) center/1px 100% no-repeat;
                }

                /* ---------- Teks ---------- */
                .sp-title-inner{
                    animation:sp-title 900ms cubic-bezier(.2,.8,.2,1) 350ms both;
                }
                .sp-subtitle{
                    animation:sp-fade-up 800ms cubic-bezier(.22,1,.36,1) 950ms both;
                }
                .sp-status{
                    animation:sp-fade-up 850ms cubic-bezier(.22,1,.36,1) 600ms both;
                }
                .sp-dot{
                    animation:sp-blink 1.2s ease-in-out infinite;
                }
                .sp-progress{
                    transition:width 120ms linear;
                    box-shadow:0 0 12px rgba(217,70,239,.7);
                }

                /* ---------- Keyframes ---------- */
                @keyframes sp-spin{
                    to{transform:rotate(360deg)}
                }
                @keyframes sp-grid{
                    to{background-position:0 64px}
                }
                @keyframes sp-bracket{
                    from{opacity:0;transform:scale(2.2)}
                    to{opacity:1;transform:scale(1)}
                }
                @keyframes sp-fade{
                    from{opacity:0}
                    to{opacity:1}
                }
                @keyframes sp-blink{
                    0%,100%{opacity:1}
                    50%{opacity:.25}
                }
                @keyframes sp-stage-in{
                    0%{opacity:0;transform:scale(.5) rotateX(55deg)}
                    60%{opacity:1;transform:scale(1.03) rotateX(0deg)}
                    100%{opacity:1;transform:scale(1)}
                }
                @keyframes sp-sway{
                    0%,100%{transform:rotateY(-12deg) rotateX(5deg)}
                    50%{transform:rotateY(12deg) rotateX(-5deg)}
                }
                @keyframes sp-armillary{
                    from{transform:rotateX(-16deg) rotateY(0deg)}
                    to{transform:rotateX(-16deg) rotateY(360deg)}
                }
                @keyframes sp-cube{
                    from{transform:rotateX(-24deg) rotateY(0deg)}
                    to{transform:rotateX(336deg) rotateY(360deg)}
                }
                @keyframes sp-logo-in{
                    0%{opacity:0;transform:translate3d(-50%,-50%,1px) scale(.3) rotateY(-180deg)}
                    65%{opacity:1;transform:translate3d(-50%,-50%,1px) scale(1.06) rotateY(12deg)}
                    100%{opacity:1;transform:translate3d(-50%,-50%,1px) scale(1) rotateY(0deg)}
                }
                @keyframes sp-ping{
                    0%{transform:scale(1);opacity:.55}
                    100%{transform:scale(2);opacity:0}
                }
                @keyframes sp-chip{
                    0%,100%{transform:translate3d(0,0,var(--z,0px)) rotateX(0deg) rotateY(0deg)}
                    50%{transform:translate3d(0,-14px,var(--z,0px)) rotateX(180deg) rotateY(180deg)}
                }
                @keyframes sp-title{
                    from{transform:translateY(110%)}
                    to{transform:translateY(0)}
                }
                @keyframes sp-fade-up{
                    from{opacity:0;transform:translateY(14px)}
                    to{opacity:1;transform:none}
                }

                /* ---------- Reduced motion ---------- */
                @media (prefers-reduced-motion: reduce){
                    .sp-root,
                    .sp-root *,
                    .sp-root *::before,
                    .sp-root *::after{
                        animation-duration:.001ms !important;
                        animation-iteration-count:1 !important;
                        transition-duration:.001ms !important;
                    }
                }
            `}</style>
        </div>
    )
}