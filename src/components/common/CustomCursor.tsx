import { useEffect, useRef, useState, type CSSProperties } from 'react'

type CursorMode = 'default' | 'interactive' | 'view' | 'play'

interface Point {
    x: number
    y: number
}

interface Burst {
    id: number
    x: number
    y: number
}

function StarShape({
    className = '',
}: {
    className?: string
}) {
    return (
        <svg
            viewBox="0 0 100 100"
            fill="currentColor"
            className={className}
            aria-hidden="true"
        >
            <path
                d="
                    M50 0
                    C56 35 65 44 100 50
                    C65 56 56 65 50 100
                    C44 65 35 56 0 50
                    C35 44 44 35 50 0
                    Z
                "
            />
        </svg>
    )
}

export function CustomCursor() {
    const cursorRef = useRef<HTMLDivElement | null>(null)
    const trailWrapRef = useRef<HTMLDivElement | null>(null)
    const tiltRef = useRef<HTMLDivElement | null>(null)
    const starRef = useRef<HTMLDivElement | null>(null)
    const glowRef = useRef<HTMLDivElement | null>(null)

    const trailRefs = useRef<(HTMLDivElement | null)[]>([])

    const mouse = useRef<Point>({
        x: 0,
        y: 0,
    })

    const current = useRef<Point>({
        x: 0,
        y: 0,
    })

    const previous = useRef<Point>({
        x: 0,
        y: 0,
    })

    const velocity = useRef<Point>({
        x: 0,
        y: 0,
    })

    /* Smoothed 3D tilt (degrees) */
    const tilt = useRef<Point>({
        x: 0,
        y: 0,
    })

    const seen = useRef(false)
    const burstId = useRef(0)

    const [enabled, setEnabled] = useState(false)
    const [mode, setMode] = useState<CursorMode>('default')
    const [label, setLabel] = useState('')
    const [bursts, setBursts] = useState<Burst[]>([])

    /*
    |--------------------------------------------------------------------------
    | Detect mouse / desktop
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        const mediaQuery = window.matchMedia(
            '(hover: hover) and (pointer: fine)',
        )

        const updateDevice = () => {
            setEnabled(mediaQuery.matches)
        }

        updateDevice()

        mediaQuery.addEventListener(
            'change',
            updateDevice,
        )

        return () => {
            mediaQuery.removeEventListener(
                'change',
                updateDevice,
            )
        }
    }, [])

    /*
    |--------------------------------------------------------------------------
    | Cursor animation
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (!enabled) return

        document.documentElement.classList.add(
            'custom-cursor-active',
        )

        const reduceMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        ).matches

        const setVisible = (visible: boolean) => {
            const value = visible ? '1' : '0'

            if (cursorRef.current) {
                cursorRef.current.style.opacity = value
            }

            if (trailWrapRef.current) {
                trailWrapRef.current.style.opacity = value
            }
        }

        const handleMouseMove = (event: MouseEvent) => {
            /* First move: jump straight to the pointer, no sweep from 0,0 */
            if (!seen.current) {
                seen.current = true

                current.current.x = event.clientX
                current.current.y = event.clientY

                previous.current.x = event.clientX
                previous.current.y = event.clientY

                setVisible(true)
            }

            mouse.current.x = event.clientX
            mouse.current.y = event.clientY

            velocity.current.x =
                event.clientX - previous.current.x

            velocity.current.y =
                event.clientY - previous.current.y

            previous.current.x = event.clientX
            previous.current.y = event.clientY
        }

        /*
        |--------------------------------------------------------------------------
        | Detect hover target
        |--------------------------------------------------------------------------
        */

        const handleMouseOver = (event: MouseEvent) => {
            const target = event.target as HTMLElement | null

            if (!target) return

            const element = target.closest(
                'a, button, [data-cursor]',
            ) as HTMLElement | null

            if (!element) {
                setMode('default')
                setLabel('')
                return
            }

            const cursorType =
                element.getAttribute('data-cursor')

            if (cursorType === 'view') {
                setMode('view')

                setLabel(
                    element.getAttribute(
                        'data-cursor-label',
                    ) || 'VIEW',
                )

                return
            }

            if (cursorType === 'play') {
                setMode('play')

                setLabel(
                    element.getAttribute(
                        'data-cursor-label',
                    ) || 'PLAY',
                )

                return
            }

            setMode('interactive')
            setLabel('')
        }

        const handleMouseLeave = () => {
            setMode('default')
            setLabel('')
            setVisible(false)
        }

        const handleMouseEnter = () => {
            if (seen.current) setVisible(true)
        }

        /*
        |--------------------------------------------------------------------------
        | Press + click burst
        |--------------------------------------------------------------------------
        */

        const handleMouseDown = () => {
            tiltRef.current?.classList.add('cc-pressed')
        }

        const handleMouseUp = () => {
            tiltRef.current?.classList.remove('cc-pressed')
        }

        const handleClick = (event: MouseEvent) => {
            if (reduceMotion) return

            const id = ++burstId.current

            setBursts((list) => [
                ...list.slice(-5),
                {
                    id,
                    x: event.clientX,
                    y: event.clientY,
                },
            ])

            window.setTimeout(() => {
                setBursts((list) =>
                    list.filter((item) => item.id !== id),
                )
            }, 750)
        }

        window.addEventListener(
            'mousemove',
            handleMouseMove,
        )

        window.addEventListener(
            'mouseover',
            handleMouseOver,
        )

        window.addEventListener(
            'mousedown',
            handleMouseDown,
        )

        window.addEventListener(
            'mouseup',
            handleMouseUp,
        )

        window.addEventListener(
            'click',
            handleClick,
        )

        document.documentElement.addEventListener(
            'mouseleave',
            handleMouseLeave,
        )

        document.documentElement.addEventListener(
            'mouseenter',
            handleMouseEnter,
        )

        /*
        |--------------------------------------------------------------------------
        | Animation loop
        |--------------------------------------------------------------------------
        */

        let animationFrame = 0

        const animate = () => {
            current.current.x +=
                (mouse.current.x - current.current.x) *
                0.22

            current.current.y +=
                (mouse.current.y - current.current.y) *
                0.22

            const x = current.current.x
            const y = current.current.y

            const speed = Math.min(
                Math.sqrt(
                    velocity.current.x *
                    velocity.current.x +
                    velocity.current.y *
                    velocity.current.y,
                ),
                40,
            )

            const angle =
                Math.atan2(
                    velocity.current.y,
                    velocity.current.x,
                ) *
                (180 / Math.PI)

            /*
            |--------------------------------------------------------------------------
            | Main cursor position
            |--------------------------------------------------------------------------
            */

            if (cursorRef.current) {
                cursorRef.current.style.left = `${x}px`
                cursorRef.current.style.top = `${y}px`
            }

            /*
            |--------------------------------------------------------------------------
            | 3D tilt — leans into the direction of travel
            |--------------------------------------------------------------------------
            */

            if (tiltRef.current && !reduceMotion) {
                const targetX = Math.max(
                    -45,
                    Math.min(45, -velocity.current.y * 1.6),
                )

                const targetY = Math.max(
                    -45,
                    Math.min(45, velocity.current.x * 1.6),
                )

                tilt.current.x +=
                    (targetX - tilt.current.x) * 0.16

                tilt.current.y +=
                    (targetY - tilt.current.y) * 0.16

                tiltRef.current.style.setProperty(
                    '--rx',
                    `${tilt.current.x.toFixed(2)}deg`,
                )

                tiltRef.current.style.setProperty(
                    '--ry',
                    `${tilt.current.y.toFixed(2)}deg`,
                )

                tiltRef.current.style.setProperty(
                    '--spd',
                    `${(speed / 40).toFixed(3)}`,
                )
            }

            /*
            |--------------------------------------------------------------------------
            | Star
            |--------------------------------------------------------------------------
            */

            if (starRef.current) {
                const scale =
                    1 + Math.min(speed / 100, 0.3)

                starRef.current.style.transform = `
                    translate(-50%, -50%)
                    translateZ(8px)
                    rotate(${angle}deg)
                    scale(${scale})
                `
            }

            /*
            |--------------------------------------------------------------------------
            | Glow
            |--------------------------------------------------------------------------
            */

            if (glowRef.current) {
                glowRef.current.style.left = `${x}px`
                glowRef.current.style.top = `${y}px`
            }

            /*
            |--------------------------------------------------------------------------
            | Trail
            |--------------------------------------------------------------------------
            */

            trailRefs.current.forEach(
                (trail, index) => {
                    if (!trail) return

                    const delay =
                        (index + 1) * 0.08

                    const trailX =
                        x -
                        velocity.current.x *
                        delay *
                        1.6

                    const trailY =
                        y -
                        velocity.current.y *
                        delay *
                        1.6

                    const scale = Math.max(
                        0.35,
                        1 - index * 0.15,
                    )

                    const opacity = Math.max(
                        0,
                        0.3 - index * 0.055,
                    )

                    trail.style.left =
                        `${trailX}px`

                    trail.style.top =
                        `${trailY}px`

                    trail.style.opacity =
                        `${opacity}`

                    trail.style.transform = `
                        translate(-50%, -50%)
                        rotate(${angle}deg)
                        scale(${scale})
                    `
                },
            )

            /*
            |--------------------------------------------------------------------------
            | Velocity decay
            |--------------------------------------------------------------------------
            */

            velocity.current.x *= 0.88
            velocity.current.y *= 0.88

            animationFrame =
                requestAnimationFrame(animate)
        }

        animationFrame =
            requestAnimationFrame(animate)

        return () => {
            document.documentElement.classList.remove(
                'custom-cursor-active',
            )

            window.removeEventListener(
                'mousemove',
                handleMouseMove,
            )

            window.removeEventListener(
                'mouseover',
                handleMouseOver,
            )

            window.removeEventListener(
                'mousedown',
                handleMouseDown,
            )

            window.removeEventListener(
                'mouseup',
                handleMouseUp,
            )

            window.removeEventListener(
                'click',
                handleClick,
            )

            document.documentElement.removeEventListener(
                'mouseleave',
                handleMouseLeave,
            )

            document.documentElement.removeEventListener(
                'mouseenter',
                handleMouseEnter,
            )

            cancelAnimationFrame(animationFrame)
        }
    }, [enabled])

    if (!enabled) {
        return null
    }

    const starColor =
        mode === 'play'
            ? 'text-fuchsia-500'
            : mode === 'view'
                ? 'text-violet-500'
                : mode === 'interactive'
                    ? 'text-violet-600'
                    : 'text-black'

    const glowColor =
        mode === 'play'
            ? 'bg-fuchsia-500/30'
            : mode === 'view'
                ? 'bg-violet-500/30'
                : mode === 'interactive'
                    ? 'bg-violet-500/15'
                    : 'bg-violet-500/10'

    const cornerColor =
        mode === 'play'
            ? 'border-fuchsia-400'
            : 'border-violet-500'

    const ringColor =
        mode === 'play'
            ? 'border-fuchsia-500/70'
            : mode === 'default'
                ? 'border-black/35'
                : 'border-violet-500/70'

    const satColor =
        mode === 'play'
            ? 'bg-fuchsia-500'
            : mode === 'default'
                ? 'bg-black'
                : 'bg-violet-600'

    const ringSize =
        mode === 'default'
            ? 'h-9 w-9'
            : mode === 'interactive'
                ? 'h-11 w-11'
                : 'h-14 w-14'

    const isMedia =
        mode === 'view' ||
        mode === 'play'

    return (
        <>
            <style>{`
                /* ---------- 3D rig ---------- */
                .cc-stage {
                    perspective: 340px;
                    perspective-origin: 50% 50%;
                }

                .cc-tilt {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 0;
                    height: 0;
                    transform-style: preserve-3d;
                    transform:
                        rotateX(var(--rx, 0deg))
                        rotateY(var(--ry, 0deg))
                        scale(1);
                    transition: scale 180ms cubic-bezier(.2,.9,.3,1.4);
                    will-change: transform;
                }

                .cc-tilt.cc-pressed {
                    scale: 0.72;
                }

                .cc-ring {
                    position: absolute;
                    left: 0;
                    top: 0;
                    border-width: 1px;
                    border-style: solid;
                    border-radius: 9999px;
                    transform-style: preserve-3d;
                    transition:
                        width 320ms cubic-bezier(.2,.9,.3,1.2),
                        height 320ms cubic-bezier(.2,.9,.3,1.2),
                        border-color 250ms ease;
                }

                .cc-ring-a {
                    animation: cc-orbit-a 3.6s linear infinite;
                }

                .cc-ring-b {
                    animation: cc-orbit-b 5.2s linear infinite;
                }

                .cc-sat {
                    position: absolute;
                    left: 50%;
                    top: 0;
                    width: 4px;
                    height: 4px;
                    margin-left: -2px;
                    margin-top: -2px;
                    transform: translateZ(0);
                }

                .cc-disc {
                    position: absolute;
                    left: 0;
                    top: 0;
                    border-radius: 9999px;
                    transform: translate(-50%, -50%) translateZ(-10px);
                    animation: cc-disc-pulse 1.8s ease-in-out infinite;
                }

                @keyframes cc-orbit-a {
                    from { transform: translate(-50%, -50%) rotateX(68deg) rotateZ(0deg); }
                    to   { transform: translate(-50%, -50%) rotateX(68deg) rotateZ(360deg); }
                }

                @keyframes cc-orbit-b {
                    from { transform: translate(-50%, -50%) rotateY(68deg) rotateZ(360deg); }
                    to   { transform: translate(-50%, -50%) rotateY(68deg) rotateZ(0deg); }
                }

                @keyframes cc-disc-pulse {
                    0%, 100% { transform: translate(-50%, -50%) translateZ(-10px) scale(1); opacity: .9; }
                    50%      { transform: translate(-50%, -50%) translateZ(-10px) scale(1.18); opacity: .5; }
                }

                /* ---------- corners / label ---------- */
                .cc-corner {
                    animation: cc-corner-in 260ms cubic-bezier(.2,.9,.3,1.3) both;
                }

                @keyframes cc-corner-in {
                    from { opacity: 0; transform: scale(1.9); }
                    to   { opacity: 1; transform: scale(1); }
                }

                .cc-label {
                    animation: cc-label-in 280ms cubic-bezier(.2,.9,.3,1.2) both;
                    transform-origin: 0 50%;
                }

                @keyframes cc-label-in {
                    from { opacity: 0; transform: perspective(200px) rotateY(-70deg) translateX(-6px); }
                    to   { opacity: 1; transform: perspective(200px) rotateY(0deg) translateX(0); }
                }

                /* ---------- click burst ---------- */
                .cc-burst {
                    position: fixed;
                    width: 0;
                    height: 0;
                    pointer-events: none;
                    z-index: 9997;
                    perspective: 300px;
                }

                .cc-burst-ring {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 14px;
                    height: 14px;
                    border: 1px solid currentColor;
                    transform: translate(-50%, -50%) rotateX(0deg) rotate(45deg) scale(.3);
                    animation: cc-burst-ring 620ms cubic-bezier(.15,.8,.3,1) forwards;
                }

                .cc-burst-ring.cc-r2 {
                    animation-delay: 90ms;
                    animation-name: cc-burst-ring-2;
                }

                .cc-burst-star {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 9px;
                    height: 9px;
                    animation: cc-fly 650ms cubic-bezier(.12,.8,.3,1) forwards;
                }

                @keyframes cc-burst-ring {
                    0%   { opacity: .9; transform: translate(-50%, -50%) rotateX(0deg) rotate(45deg) scale(.3); }
                    100% { opacity: 0;  transform: translate(-50%, -50%) rotateX(60deg) rotate(135deg) scale(4.2); }
                }

                @keyframes cc-burst-ring-2 {
                    0%   { opacity: .7; transform: translate(-50%, -50%) rotateY(0deg) rotate(0deg) scale(.2); }
                    100% { opacity: 0;  transform: translate(-50%, -50%) rotateY(70deg) rotate(-90deg) scale(3.2); }
                }

                @keyframes cc-fly {
                    0%   { opacity: 1; transform: translate(-50%, -50%) rotate(var(--a)) translateX(4px) scale(1); }
                    100% { opacity: 0; transform: translate(-50%, -50%) rotate(var(--a)) translateX(var(--dist)) scale(.2) rotate(180deg); }
                }

                @media (prefers-reduced-motion: reduce) {
                    .cc-ring-a,
                    .cc-ring-b,
                    .cc-disc,
                    .cc-corner,
                    .cc-label {
                        animation: none !important;
                    }
                }
            `}</style>

            {/* =========================================================
                STAR TRAIL
            ========================================================= */}

            <div
                ref={trailWrapRef}
                aria-hidden="true"
                className="
                    pointer-events-none
                    fixed
                    inset-0
                    z-[9996]
                    opacity-0
                "
            >
                {[0, 1, 2, 3, 4].map((index) => (
                    <div
                        key={index}
                        ref={(element) => {
                            trailRefs.current[index] =
                                element
                        }}
                        className={`
                            fixed
                            left-0
                            top-0
                            h-3
                            w-3
                            ${index % 2 === 0
                                ? 'text-violet-500'
                                : 'text-fuchsia-500'
                            }
                        `}
                    >
                        <StarShape className="h-full w-full" />
                    </div>
                ))}
            </div>

            {/* =========================================================
                CLICK BURSTS
            ========================================================= */}

            {bursts.map((burst) => (
                <div
                    key={burst.id}
                    aria-hidden="true"
                    className="cc-burst"
                    style={{
                        left: burst.x,
                        top: burst.y,
                    }}
                >
                    <span className="cc-burst-ring text-violet-500" />
                    <span className="cc-burst-ring cc-r2 text-fuchsia-500" />

                    {[0, 72, 144, 216, 288].map((deg, i) => (
                        <span
                            key={deg}
                            className={`cc-burst-star ${i % 2 === 0
                                ? 'text-violet-500'
                                : 'text-fuchsia-500'
                                }`}
                            style={
                                {
                                    '--a': `${deg + (burst.id * 23) % 40}deg`,
                                    '--dist': `${26 + (i % 3) * 8}px`,
                                } as CSSProperties
                            }
                        >
                            <StarShape className="h-full w-full" />
                        </span>
                    ))}
                </div>
            ))}

            {/* =========================================================
                MAIN CURSOR
            ========================================================= */}

            <div
                ref={cursorRef}
                aria-hidden="true"
                className="
                    cc-stage
                    pointer-events-none
                    fixed
                    left-0
                    top-0
                    z-[10000]
                    h-0
                    w-0
                    opacity-0
                    transition-opacity
                    duration-200
                "
            >
                {/* =====================================================
                    GLOW
                ===================================================== */}

                <div
                    ref={glowRef}
                    className={`
                        pointer-events-none
                        fixed
                        left-0
                        top-0
                        h-16
                        w-16
                        -translate-x-1/2
                        -translate-y-1/2
                        rounded-full
                        blur-2xl
                        transition-all
                        duration-500
                        ${glowColor}
                    `}
                />

                {/* =====================================================
                    3D RIG — tilts with movement
                ===================================================== */}

                <div
                    ref={tiltRef}
                    className="cc-tilt"
                >
                    {/* Soft disc behind the star (view / play) */}

                    {isMedia && (
                        <span
                            className={`
                                cc-disc
                                h-12
                                w-12
                                ${mode === 'play'
                                    ? 'bg-fuchsia-500/10'
                                    : 'bg-violet-500/10'
                                }
                            `}
                        />
                    )}

                    {/* Orbit ring A (horizontal) + satellite */}

                    <span
                        className={`cc-ring cc-ring-a ${ringSize} ${ringColor}`}
                    >
                        <span className={`cc-sat ${satColor}`} />
                    </span>

                    {/* Orbit ring B (vertical) */}

                    <span
                        className={`cc-ring cc-ring-b ${ringSize} ${ringColor}`}
                    />

                    {/* =================================================
                        STAR
                    ================================================= */}

                    <div
                        ref={starRef}
                        className={`
                            absolute
                            left-0
                            top-0
                            h-8
                            w-8
                            transition-colors
                            duration-300
                            ease-out
                            ${starColor}
                        `}
                        style={{
                            transform: 'translate(-50%, -50%) translateZ(8px)',
                        }}
                    >
                        <StarShape className="h-full w-full" />

                        {/* Small center highlight */}

                        {isMedia && (
                            <span
                                className="
                                    absolute
                                    left-1/2
                                    top-1/2
                                    h-1
                                    w-1
                                    -translate-x-1/2
                                    -translate-y-1/2
                                    rounded-full
                                    bg-white
                                "
                            />
                        )}
                    </div>
                </div>

                {/* =====================================================
                    INTERACTIVE CORNERS
                ===================================================== */}

                {mode === 'interactive' && (
                    <>
                        <span
                            className={`
                                cc-corner
                                absolute
                                -left-5
                                -top-5
                                h-3
                                w-3
                                border-l
                                border-t
                                ${cornerColor}
                            `}
                        />

                        <span
                            className={`
                                cc-corner
                                absolute
                                -right-5
                                -top-5
                                h-3
                                w-3
                                border-r
                                border-t
                                ${cornerColor}
                            `}
                        />

                        <span
                            className={`
                                cc-corner
                                absolute
                                -bottom-5
                                -left-5
                                h-3
                                w-3
                                border-b
                                border-l
                                ${cornerColor}
                            `}
                        />

                        <span
                            className={`
                                cc-corner
                                absolute
                                -bottom-5
                                -right-5
                                h-3
                                w-3
                                border-b
                                border-r
                                ${cornerColor}
                            `}
                        />
                    </>
                )}

                {/* =====================================================
                    VIEW / PLAY LABEL
                ===================================================== */}

                {isMedia && (
                    <span
                        key={`${mode}-${label}`}
                        className={`
                            cc-label
                            absolute
                            left-9
                            top-4
                            whitespace-nowrap
                            border
                            bg-white
                            px-1.5
                            py-[3px]
                            text-[8px]
                            font-bold
                            uppercase
                            leading-none
                            tracking-[0.28em]
                            shadow-[2px_2px_0_0_currentColor]
                            ${mode === 'play'
                                ? 'border-fuchsia-500 text-fuchsia-500'
                                : 'border-violet-600 text-violet-600'
                            }
                        `}
                    >
                        {label}
                    </span>
                )}
            </div>
        </>
    )
}