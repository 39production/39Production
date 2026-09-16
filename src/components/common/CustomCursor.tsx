import { useEffect, useRef, useState } from 'react'

type CursorMode = 'default' | 'interactive' | 'view' | 'play'

interface Point {
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

    const [enabled, setEnabled] = useState(false)
    const [mode, setMode] = useState<CursorMode>('default')
    const [label, setLabel] = useState('')

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

        const handleMouseMove = (event: MouseEvent) => {
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
        }

        window.addEventListener(
            'mousemove',
            handleMouseMove,
        )

        window.addEventListener(
            'mouseover',
            handleMouseOver,
        )

        document.documentElement.addEventListener(
            'mouseleave',
            handleMouseLeave,
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
            | Star
            |--------------------------------------------------------------------------
            */

            if (starRef.current) {
                const scale =
                    1 + Math.min(speed / 100, 0.3)

                starRef.current.style.transform = `
                    translate(-50%, -50%)
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

            document.documentElement.removeEventListener(
                'mouseleave',
                handleMouseLeave,
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

    const isMedia =
        mode === 'view' ||
        mode === 'play'

    return (
        <>
            {/* =========================================================
                STAR TRAIL
            ========================================================= */}

            <div
                aria-hidden="true"
                className="
                    pointer-events-none
                    fixed
                    inset-0
                    z-[9996]
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
                            -translate-x-1/2
                            -translate-y-1/2
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
                MAIN CURSOR
            ========================================================= */}

            <div
                ref={cursorRef}
                aria-hidden="true"
                className="
                    pointer-events-none
                    fixed
                    left-0
                    top-0
                    z-[10000]
                    h-0
                    w-0
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
                    STAR
                ===================================================== */}

                <div
                    ref={starRef}
                    className={`
                        absolute
                        left-0
                        top-0
                        h-8
                        w-8
                        -translate-x-1/2
                        -translate-y-1/2
                        transition-all
                        duration-300
                        ease-out
                        ${starColor}
                    `}
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

                {/* =====================================================
                    INTERACTIVE CORNERS
                ===================================================== */}

                {mode === 'interactive' && (
                    <>
                        <span
                            className={`
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
                        className={`
                            absolute
                            left-7
                            top-5
                            whitespace-nowrap
                            text-[8px]
                            font-bold
                            uppercase
                            tracking-[0.28em]
                            ${mode === 'play'
                                ? 'text-fuchsia-500'
                                : 'text-violet-600'
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