import { useEffect, useState } from 'react'

import logo39Production from '@/assets/logo-39production.png'

interface SplashScreenProps {
    onComplete?: () => void
}

export function SplashScreen({
    onComplete,
}: SplashScreenProps) {
    const [isLeaving, setIsLeaving] = useState(false)
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        const startTime = performance.now()
        const duration = 1900

        let frameId = 0

        const animateProgress = (time: number) => {
            const elapsed = time - startTime
            const rawProgress = Math.min(elapsed / duration, 1)

            const easedProgress =
                1 - Math.pow(1 - rawProgress, 3)

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
            aria-label="Loading 39Production"
            aria-live="polite"
            className={`fixed inset-0 z-[9999] flex min-h-screen items-center justify-center overflow-hidden bg-white text-neutral-950 transition-[opacity,filter,transform] duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${isLeaving
                    ? 'pointer-events-none scale-[1.015] opacity-0 blur-[8px]'
                    : 'scale-100 opacity-100 blur-0'
                }`}
        >
            {/* =========================================================
                BACKGROUND
            ========================================================== */}

            {/* Fine grid */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.035]"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, #111 1px, transparent 1px),
                        linear-gradient(to bottom, #111 1px, transparent 1px)
                    `,
                    backgroundSize: '64px 64px',
                }}
            />

            {/* Large ambient glow */}
            <div
                aria-hidden="true"
                className="splash-glow pointer-events-none absolute left-1/2 top-1/2 h-[18rem] w-[18rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-fuchsia-500/[0.08] via-violet-500/[0.10] to-fuchsia-500/[0.04] blur-3xl sm:h-[26rem] sm:w-[26rem] lg:h-[34rem] lg:w-[34rem]"
            />

            {/* Secondary moving glow */}
            <div
                aria-hidden="true"
                className="splash-glow-secondary pointer-events-none absolute left-[42%] top-[52%] h-[12rem] w-[12rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-fuchsia-500/[0.05] blur-3xl sm:h-[18rem] sm:w-[18rem]"
            />

            {/* =========================================================
                FRAME
            ========================================================== */}

            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-5 border border-neutral-200/80 sm:inset-7 lg:inset-10"
            />

            {/* Top accent */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute left-5 top-5 h-px w-20 bg-gradient-to-r from-fuchsia-500 to-transparent sm:left-7 sm:top-7 sm:w-28 lg:left-10 lg:top-10"
            />

            {/* Bottom accent */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute bottom-5 right-5 h-px w-20 bg-gradient-to-l from-violet-600 to-transparent sm:bottom-7 sm:right-7 sm:w-28 lg:bottom-10 lg:right-10"
            />

            {/* Corner marks */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute left-5 top-5 h-3 w-3 border-l border-t border-neutral-900 sm:left-7 sm:top-7 lg:left-10 lg:top-10"
            />

            <div
                aria-hidden="true"
                className="pointer-events-none absolute bottom-5 right-5 h-3 w-3 border-b border-r border-neutral-900 sm:bottom-7 sm:right-7 lg:bottom-10 lg:right-10"
            />

            {/* =========================================================
                CENTER
            ========================================================== */}

            <div className="relative z-10 flex w-full max-w-3xl flex-col items-center px-6 text-center sm:px-10">
                {/* -----------------------------------------------------
                    BRAND MARK
                ------------------------------------------------------ */}

                <div className="splash-brand relative flex flex-col items-center">
                    {/* Orbit system */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 sm:h-56 sm:w-56"
                    >
                        {/* Outer orbit */}
                        <div className="splash-orbit-outer absolute inset-0 rounded-full border border-neutral-200" />

                        {/* Middle orbit */}
                        <div className="splash-orbit-middle absolute inset-[10%] rounded-full border border-violet-300/60" />

                        {/* Inner orbit */}
                        <div className="splash-orbit-inner absolute inset-[22%] rounded-full border border-fuchsia-300/50" />

                        {/* Orbit dot */}
                        <span className="splash-orbit-dot absolute left-1/2 top-[-2px] h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-fuchsia-500 shadow-[0_0_12px_rgba(217,70,239,0.45)]" />

                        {/* Second dot */}
                        <span className="splash-orbit-dot-reverse absolute bottom-[12%] right-[7%] h-1 w-1 rounded-full bg-violet-600 shadow-[0_0_10px_rgba(124,58,237,0.35)]" />
                    </div>

                    {/* Rotating scan ring */}
                    <div
                        aria-hidden="true"
                        className="splash-scan-ring pointer-events-none absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full sm:h-40 sm:w-40"
                    />

                    {/* Radial energy */}
                    <div
                        aria-hidden="true"
                        className="splash-energy pointer-events-none absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-fuchsia-400/20 via-violet-400/10 to-transparent blur-xl sm:h-32 sm:w-32"
                    />

                    {/* Logo core */}
                    <div className="splash-logo-core relative flex h-28 w-28 items-center justify-center sm:h-36 sm:w-36">
                        {/* white plate */}
                        <div className="absolute inset-[13%] rounded-full bg-white/95 shadow-[0_12px_40px_rgba(0,0,0,0.08)]" />

                        {/* gradient border */}
                        <div className="splash-logo-border absolute inset-[13%] rounded-full" />

                        <img
                            src={logo39Production}
                            alt="39Production"
                            className="relative z-10 h-[4.5rem] w-auto object-contain sm:h-[5.5rem]"
                            draggable={false}
                        />
                    </div>

                    {/* Brand title */}
                    <div className="splash-title mt-10">
                        <div className="flex items-center justify-center gap-3">
                            <span className="h-px w-8 bg-gradient-to-r from-transparent to-fuchsia-500 sm:w-14" />

                            <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.38em] text-neutral-500 sm:text-[10px] sm:tracking-[0.42em]">
                                Digital Production House
                            </span>

                            <span className="h-px w-8 bg-gradient-to-l from-transparent to-violet-600 sm:w-14" />
                        </div>

                        <div className="mt-4 overflow-hidden">
                            <p className="font-mono text-[8px] uppercase tracking-[0.26em] text-neutral-300 sm:text-[9px] sm:tracking-[0.34em]">
                                Creating Digital Works
                            </p>
                        </div>
                    </div>
                </div>

                {/* -----------------------------------------------------
                    STATUS
                ------------------------------------------------------ */}

                <div className="splash-status mt-14 w-full max-w-[20rem] sm:mt-16 sm:max-w-sm">
                    <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="splash-status-dot h-1.5 w-1.5 rounded-full bg-violet-500" />

                            <span className="font-mono text-[8px] font-medium uppercase tracking-[0.24em] text-neutral-400 sm:text-[9px]">
                                Initializing
                            </span>
                        </div>

                        <span className="font-mono text-[8px] font-medium tracking-[0.2em] text-neutral-300 sm:text-[9px]">
                            39P / {String(progress).padStart(3, '0')}
                        </span>
                    </div>

                    {/* Progress shell */}
                    <div className="relative h-[2px] overflow-hidden bg-neutral-100">
                        {/* subtle track */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neutral-200 to-transparent" />

                        {/* progress */}
                        <div
                            className="splash-progress absolute inset-y-0 left-0 bg-gradient-to-r from-fuchsia-500 via-violet-500 to-violet-700"
                            style={{
                                width: `${progress}%`,
                            }}
                        />

                        {/* travelling light */}
                        <div
                            aria-hidden="true"
                            className="splash-progress-shine absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-white/80 to-transparent"
                            style={{
                                left: `${Math.max(progress - 10, -10)}%`,
                            }}
                        />
                    </div>

                    <div className="mt-3 flex items-center justify-between font-mono text-[7px] uppercase tracking-[0.18em] text-neutral-300">
                        <span>Building Experience</span>
                        <span>{progress}%</span>
                    </div>
                </div>
            </div>

            {/* =========================================================
                SIDE / CORNER INFO
            ========================================================== */}

            <div className="absolute bottom-8 left-8 hidden font-mono text-[7px] uppercase tracking-[0.22em] text-neutral-300 sm:block lg:left-12 lg:bottom-12">
                39Production
            </div>

            <div className="absolute bottom-8 right-8 hidden font-mono text-[7px] uppercase tracking-[0.22em] text-neutral-300 sm:block lg:right-12 lg:bottom-12">
                Producing Stories
            </div>

            {/* Mobile bottom label */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-[7px] uppercase tracking-[0.26em] text-neutral-300 sm:hidden">
                Producing Stories
            </div>

            {/* =========================================================
                DECORATIVE CENTER MARK
            ========================================================== */}

            <div
                aria-hidden="true"
                className="absolute left-1/2 top-10 hidden -translate-x-1/2 items-center gap-2 sm:flex"
            >
                <span className="h-1 w-1 rounded-full bg-fuchsia-500" />
                <span className="h-px w-5 bg-neutral-200" />
                <span className="font-mono text-[7px] tracking-[0.22em] text-neutral-300">
                    39
                </span>
                <span className="h-px w-5 bg-neutral-200" />
                <span className="h-1 w-1 rounded-full bg-violet-500" />
            </div>

            <style>{`
                /* =====================================================
                   BRAND ENTRANCE
                ====================================================== */

                .splash-brand {
                    animation:
                        splashBrandIn 900ms cubic-bezier(0.22, 1, 0.36, 1) both,
                        splashBrandFloat 4.5s ease-in-out 0.9s infinite;
                }

                .splash-logo-core {
                    animation: splashLogoIn 1000ms cubic-bezier(0.16, 1, 0.3, 1) both;
                }

                .splash-logo-border {
                    background: conic-gradient(
                        from 0deg,
                        rgba(217, 70, 239, 0.0),
                        rgba(217, 70, 239, 0.55),
                        rgba(124, 58, 237, 0.65),
                        rgba(217, 70, 239, 0.0)
                    );
                    -webkit-mask: linear-gradient(#fff 0 0) content-box,
                        linear-gradient(#fff 0 0);
                    mask: linear-gradient(#fff 0 0) content-box,
                        linear-gradient(#fff 0 0);
                    -webkit-mask-composite: xor;
                    mask-composite: exclude;
                    padding: 1px;
                    animation: splashBorderSpin 3.2s linear infinite;
                }

                .splash-title {
                    animation: splashTitleIn 850ms cubic-bezier(0.22, 1, 0.36, 1) 180ms both;
                }

                .splash-status {
                    animation: splashStatusIn 850ms cubic-bezier(0.22, 1, 0.36, 1) 320ms both;
                }

                /* =====================================================
                   ORBITS
                ====================================================== */

                .splash-orbit-outer {
                    animation: splashOrbitOuter 8s linear infinite;
                }

                .splash-orbit-middle {
                    animation: splashOrbitMiddle 6s linear infinite reverse;
                }

                .splash-orbit-inner {
                    animation: splashOrbitInner 4s linear infinite;
                }

                .splash-orbit-dot {
                    animation: splashDot 4s linear infinite;
                }

                .splash-orbit-dot-reverse {
                    animation: splashDotReverse 6s linear infinite;
                }

                .splash-scan-ring {
                    border: 1px solid transparent;
                    border-top-color: rgba(217, 70, 239, 0.45);
                    border-right-color: rgba(124, 58, 237, 0.18);
                    animation: splashScanRing 2.8s linear infinite;
                }

                .splash-energy {
                    animation:
                        splashEnergy 2.2s ease-in-out infinite,
                        splashEnergyIn 1100ms cubic-bezier(0.22, 1, 0.36, 1) both;
                }

                /* =====================================================
                   BACKGROUND
                ====================================================== */

                .splash-glow {
                    animation: splashGlow 4.8s ease-in-out infinite;
                }

                .splash-glow-secondary {
                    animation: splashGlowSecondary 5.5s ease-in-out infinite;
                }

                /* =====================================================
                   PROGRESS
                ====================================================== */

                .splash-progress {
                    transition: width 120ms linear;
                }

                .splash-progress-shine {
                    animation: splashProgressShine 1.3s ease-in-out infinite;
                }

                .splash-status-dot {
                    animation: splashStatusDot 1.2s ease-in-out infinite;
                }

                /* =====================================================
                   KEYFRAMES
                ====================================================== */

                @keyframes splashBrandIn {
                    0% {
                        opacity: 0;
                        transform: translateY(22px) scale(0.88);
                        filter: blur(8px);
                    }

                    55% {
                        opacity: 1;
                        transform: translateY(-2px) scale(1.025);
                        filter: blur(0);
                    }

                    100% {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                        filter: blur(0);
                    }
                }

                @keyframes splashBrandFloat {
                    0%,
                    100% {
                        transform: translateY(0);
                    }

                    50% {
                        transform: translateY(-4px);
                    }
                }

                @keyframes splashLogoIn {
                    0% {
                        opacity: 0;
                        transform: scale(0.45) rotate(-12deg);
                        filter: blur(10px);
                    }

                    65% {
                        opacity: 1;
                        transform: scale(1.04) rotate(2deg);
                        filter: blur(0);
                    }

                    100% {
                        opacity: 1;
                        transform: scale(1) rotate(0);
                    }
                }

                @keyframes splashTitleIn {
                    from {
                        opacity: 0;
                        transform: translateY(16px);
                    }

                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes splashStatusIn {
                    from {
                        opacity: 0;
                        transform: translateY(18px);
                    }

                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes splashBorderSpin {
                    to {
                        transform: rotate(360deg);
                    }
                }

                @keyframes splashOrbitOuter {
                    to {
                        transform: rotate(360deg);
                    }
                }

                @keyframes splashOrbitMiddle {
                    to {
                        transform: rotate(360deg);
                    }
                }

                @keyframes splashOrbitInner {
                    to {
                        transform: rotate(360deg);
                    }
                }

                @keyframes splashDot {
                    to {
                        transform: rotate(360deg);
                    }
                }

                @keyframes splashDotReverse {
                    to {
                        transform: rotate(-360deg);
                    }
                }

                @keyframes splashScanRing {
                    to {
                        transform: translate(-50%, -50%) rotate(360deg);
                    }
                }

                @keyframes splashEnergy {
                    0%,
                    100% {
                        transform: translate(-50%, -50%) scale(0.94);
                        opacity: 0.55;
                    }

                    50% {
                        transform: translate(-50%, -50%) scale(1.12);
                        opacity: 1;
                    }
                }

                @keyframes splashEnergyIn {
                    from {
                        opacity: 0;
                        transform: translate(-50%, -50%) scale(0.3);
                    }

                    to {
                        opacity: 0.75;
                        transform: translate(-50%, -50%) scale(1);
                    }
                }

                @keyframes splashGlow {
                    0%,
                    100% {
                        transform: translate(-50%, -50%) scale(0.95);
                        opacity: 0.55;
                    }

                    50% {
                        transform: translate(-50%, -50%) scale(1.08);
                        opacity: 0.85;
                    }
                }

                @keyframes splashGlowSecondary {
                    0%,
                    100% {
                        transform: translate(-45%, -55%) scale(0.9);
                        opacity: 0.3;
                    }

                    50% {
                        transform: translate(-55%, -45%) scale(1.1);
                        opacity: 0.7;
                    }
                }

                @keyframes splashProgressShine {
                    0% {
                        opacity: 0;
                        transform: translateX(-40px);
                    }

                    40% {
                        opacity: 0.9;
                    }

                    100% {
                        opacity: 0;
                        transform: translateX(80px);
                    }
                }

                @keyframes splashStatusDot {
                    0%,
                    100% {
                        opacity: 0.35;
                        transform: scale(0.8);
                    }

                    50% {
                        opacity: 1;
                        transform: scale(1.25);
                    }
                }

                /* =====================================================
                   REDUCED MOTION
                ====================================================== */

                @media (prefers-reduced-motion: reduce) {
                    .splash-brand,
                    .splash-logo-core,
                    .splash-logo-border,
                    .splash-title,
                    .splash-status,
                    .splash-orbit-outer,
                    .splash-orbit-middle,
                    .splash-orbit-inner,
                    .splash-orbit-dot,
                    .splash-orbit-dot-reverse,
                    .splash-scan-ring,
                    .splash-energy,
                    .splash-glow,
                    .splash-glow-secondary,
                    .splash-progress-shine,
                    .splash-status-dot {
                        animation: none !important;
                    }
                }

                /* =====================================================
                   SMALL MOBILE
                ====================================================== */

                @media (max-width: 380px) {
                    .splash-brand {
                        transform: scale(0.92);
                    }
                }
            `}</style>
        </div>
    )
}