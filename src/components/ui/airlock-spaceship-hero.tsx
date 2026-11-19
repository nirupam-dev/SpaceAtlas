"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

/* -------------------------------------------------------------------------- */
/*  AIRLOCK — a scroll-locked, scrub-driven video hero                        */
/*  Pure video scrubbing forward and backward with user scroll. No static image. */
/* -------------------------------------------------------------------------- */

export type AirlockTheme = "vacuum" | "ember" | "ice"

interface Palette {
    backdrop: string
    text: string
    muted: string
    bar: string
}

const PALETTES: Record<AirlockTheme, Palette> = {
    vacuum: {
        backdrop: "#030f16",
        text: "#def1fb",
        muted: "rgba(222,241,251,0.72)",
        bar: "linear-gradient(90deg, rgba(132,198,238,0.45), rgba(132,198,238,0.95))",
    },
    ember: {
        backdrop: "#0d0705",
        text: "#fdf1e7",
        muted: "rgba(253,241,231,0.72)",
        bar: "linear-gradient(90deg, rgba(255,176,102,0.45), rgba(255,214,168,0.95))",
    },
    ice: {
        backdrop: "#030f16",
        text: "#def1fb",
        muted: "rgba(222,241,251,0.72)",
        bar: "linear-gradient(90deg, rgba(132,198,238,0.45), rgba(90,61,228,0.95))",
    },
}

export interface AirlockHeroProps {
    videoSrc?: string
    posterSrc?: string
    title?: string
    scrollHint?: string
    tagline?: string
    signature?: { name: string; url: string } | false
    scrubDistance?: number
    holdDistance?: number
    theme?: AirlockTheme
    skipLabel?: string
    className?: string
    style?: React.CSSProperties
}

const CDN = "https://cdn.jsdelivr.net/gh/yuraoak/airlock-hero-assets@main"
const DEFAULT_VIDEO = `${CDN}/iss-hero-1080p.mp4`
const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
const SEEK_FPS = 30
const SEEK_EPSILON = 1 / SEEK_FPS
const PAINT_EPSILON = 0.0008

const KEY_STEPS: Record<string, number> = {
    ArrowDown: 140,
    ArrowUp: -140,
    PageDown: 700,
    PageUp: -700,
    " ": 700,
    End: Number.MAX_SAFE_INTEGER,
    Home: Number.MIN_SAFE_INTEGER,
}

function clamp(v: number, min: number, max: number) {
    return Math.min(max, Math.max(min, v))
}

export default function AirlockHero({
    videoSrc = DEFAULT_VIDEO,
    title = "SPACE OBSERVATORY",
    scrollHint = "SCROLL TO EXPLORE",
    tagline = "Your real-time command center for the cosmos — powered by NASA, JPL & SpaceDevs.",
    signature = false,
    scrubDistance = 1600,
    holdDistance = 500,
    theme = "ice",
    skipLabel = "Skip to observatory",
    className,
    style,
}: AirlockHeroProps) {
    const sectionRef = useRef<HTMLDivElement>(null)
    const videoRef = useRef<HTMLVideoElement>(null)
    const titleRef = useRef<HTMLDivElement>(null)
    const hintRef = useRef<HTMLDivElement>(null)
    const taglineRef = useRef<HTMLDivElement>(null)
    const barRef = useRef<HTMLDivElement>(null)
    const scrimRef = useRef<HTMLDivElement>(null)
    const releaseRef = useRef<() => void>(() => { })
    const [ready, setReady] = useState(false)

    const palette = PALETTES[theme] || PALETTES.ice

    useEffect(() => {
        const video = videoRef.current
        const section = sectionRef.current
        if (!video || !section) return

        const reduceMotion =
            typeof window !== "undefined" &&
            (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false)

        let duration = 0
        let rafId = 0
        let target = 0
        let shown = 0
        let moved = false
        let seeking = false
        let queued: number | null = null
        let lastSeekTime = -1
        let lastPaint = -1
        let locked = false
        let lockedY = 0
        let touchY = 0
        let released = false
        let lastY = 0

        const totalDistance = scrubDistance + holdDistance
        const scrubShare = scrubDistance / totalDistance

        let lastSeekTs = 0
        let lastFrameTs = performance.now()
        const MIN_SEEK_INTERVAL = 60 // ms (throttles seeks to ~16/sec, eliminating decoder stutter)

        /* --- Seeking ------------------------------------------------------- */

        function performSeek(t: number) {
            seeking = true
            lastSeekTime = t
            lastSeekTs = performance.now()
            // fastSeek jumps to keyframes instantly without decoding lag when available
            if (typeof (video as any).fastSeek === "function") {
                try {
                    (video as any).fastSeek(t)
                    return
                } catch { }
            }
            video!.currentTime = t
        }

        function seekTo(t: number) {
            if (Math.abs(t - lastSeekTime) < 0.05) return
            const now = performance.now()
            if (now - lastSeekTs < MIN_SEEK_INTERVAL || seeking) {
                queued = t
                return
            }
            performSeek(t)
        }

        const onSeeked = () => {
            seeking = false
            if (queued !== null) {
                const t = queued
                queued = null
                const now = performance.now()
                if (now - lastSeekTs >= MIN_SEEK_INTERVAL && Math.abs(t - lastSeekTime) >= 0.05) {
                    performSeek(t)
                }
            }
        }

        /* --- Painting ------------------------------------------------------ */

        function paint(p: number) {
            if (Math.abs(p - lastPaint) < PAINT_EPSILON) return
            lastPaint = p

            const videoP = clamp(p / scrubShare, 0, 1)

            if (duration > 0) {
                seekTo(Math.min(videoP * duration, duration - 0.04))
            }

            const titleAlpha = 1 - clamp(videoP / 0.35, 0, 1)
            const taglineAlpha = clamp((videoP - 0.75) / 0.25, 0, 1)

            if (videoRef.current) {
                videoRef.current.style.transform = `scale(${1 + videoP * 0.05})`
            }
            if (scrimRef.current) {
                scrimRef.current.style.opacity = String(Math.max(titleAlpha, taglineAlpha))
            }
            if (titleRef.current) {
                const t = titleAlpha
                titleRef.current.style.opacity = String(t)
                titleRef.current.style.transform = `translateY(${(1 - t) * -24}px) scale(${0.96 + t * 0.04})`
            }
            if (hintRef.current) {
                hintRef.current.style.opacity = moved ? "0" : "1"
            }
            if (taglineRef.current) {
                const t = taglineAlpha
                taglineRef.current.style.opacity = String(t)
                taglineRef.current.style.transform = `translateY(${(1 - t) * 20}px) scale(${0.97 + t * 0.03})`
            }
            if (barRef.current) {
                barRef.current.style.transform = `scaleX(${p})`
            }
        }

        /* --- The lock ------------------------------------------------------ */

        function engageLock() {
            if (locked) return
            locked = true
            released = false
            lockedY = window.scrollY
            const b = document.body.style
            b.position = "fixed"
            b.top = `-${lockedY}px`
            b.left = "0"
            b.right = "0"
            b.width = "100%"
        }

        function releaseLock() {
            if (!locked) return
            locked = false
            const y = lockedY
            const b = document.body.style
            b.position = ""
            b.top = ""
            b.left = ""
            b.right = ""
            b.width = ""
            window.scrollTo(0, y)
            released = true
            lastY = y
        }

        releaseRef.current = () => {
            target = shown = 1
            moved = true
            paint(1)
            releaseLock()
        }

        function consume(deltaY: number) {
            if (!locked) return false
            if (target >= 1 && shown > 0.98 && deltaY > 0) {
                releaseLock()
                return false
            }
            target = clamp(target + deltaY / totalDistance, 0, 1)
            if (target > 0.001) moved = true
            return true
        }

        /* --- Input --------------------------------------------------------- */

        const onWheel = (e: WheelEvent) => {
            if (consume(e.deltaY)) e.preventDefault()
        }

        const onTouchStart = (e: TouchEvent) => {
            touchY = e.touches[0]?.clientY ?? 0
        }

        const onTouchMove = (e: TouchEvent) => {
            const y = e.touches[0]?.clientY ?? touchY
            const deltaY = touchY - y
            touchY = y
            if (consume(deltaY)) e.preventDefault()
        }

        const onKeyDown = (e: KeyboardEvent) => {
            const step = KEY_STEPS[e.key]
            if (step === undefined) return
            if (consume(step)) e.preventDefault()
        }

        const onScroll = () => {
            if (locked || !released) return
            const y = window.scrollY
            const climbing = y < lastY
            lastY = y
            if (climbing && y <= section!.offsetTop + 5) {
                target = shown = 1
                paint(1)
                engageLock()
            }
        }

        /* --- Wiring -------------------------------------------------------- */

        const onLoadedData = () => {
            duration = video!.duration || 0
            setReady(true)
            paint(0)
            if (reduceMotion) {
                target = shown = 1
                moved = true
                paint(1)
            }
        }

        if (video.readyState >= 1) {
            onLoadedData()
        }

        video.addEventListener("loadeddata", onLoadedData)
        video.addEventListener("canplay", onLoadedData)
        video.addEventListener("loadedmetadata", onLoadedData)
        video.addEventListener("seeked", onSeeked)

        if (!reduceMotion) {
            if (window.scrollY <= section.offsetTop + 1) engageLock()

            window.addEventListener("wheel", onWheel, { passive: false })
            window.addEventListener("touchstart", onTouchStart, { passive: true })
            window.addEventListener("touchmove", onTouchMove, { passive: false })
            window.addEventListener("keydown", onKeyDown)
            window.addEventListener("scroll", onScroll, { passive: true })

            const frame = () => {
                const now = performance.now()
                const dt = Math.min((now - lastFrameTs) / 16.67, 2.5)
                lastFrameTs = now
                const smoothing = 1 - Math.pow(0.84, dt)
                shown += (target - shown) * smoothing
                paint(shown)
                rafId = requestAnimationFrame(frame)
            }
            rafId = requestAnimationFrame(frame)
        }

        return () => {
            video.removeEventListener("loadeddata", onLoadedData)
            video.removeEventListener("canplay", onLoadedData)
            video.removeEventListener("loadedmetadata", onLoadedData)
            video.removeEventListener("seeked", onSeeked)
            window.removeEventListener("wheel", onWheel)
            window.removeEventListener("touchstart", onTouchStart)
            window.removeEventListener("touchmove", onTouchMove)
            window.removeEventListener("keydown", onKeyDown)
            window.removeEventListener("scroll", onScroll)
            cancelAnimationFrame(rafId)
            releaseLock()
        }
    }, [scrubDistance, holdDistance])

    return (
        <div
            ref={sectionRef}
            className={cn("relative h-[100dvh] w-full overflow-hidden bg-[#030f16]", className)}
            style={{ ...style }}
        >
            {/* Pure video scrubber — NO static photo / poster */}
            <video
                ref={videoRef}
                src={videoSrc}
                muted
                playsInline
                preload="auto"
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-cover z-0 bg-[#030f16]"
                style={{
                    opacity: ready ? 1 : 0.95,
                    transformOrigin: "center center",
                    willChange: "transform",
                    transform: "translate3d(0, 0, 0)",
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    transition: "opacity 0.5s ease",
                }}
            />

            {/* Gradient overlays */}
            <div
                className="pointer-events-none absolute inset-0 z-[1]"
                style={{
                    background:
                        "linear-gradient(180deg, rgba(3,15,22,0.4) 0%, rgba(3,15,22,0) 25%, rgba(3,15,22,0.2) 70%, rgba(3,15,22,0.85) 100%)",
                }}
            />

            <div
                ref={scrimRef}
                className="pointer-events-none absolute inset-0 z-[1]"
                style={{
                    background:
                        "radial-gradient(ellipse 65% 45% at 50% 50%, rgba(3,15,22,0.65), rgba(3,15,22,0) 70%)",
                }}
            />

            {/* Title */}
            <div
                ref={titleRef}
                className="pointer-events-none absolute inset-0 z-[2] flex flex-col items-center justify-center px-[6%] text-center"
            >
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#84c6ee]/30 bg-[#84c6ee]/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[3px] text-[#84c6ee] backdrop-blur-md">
                    Live Telemetry · NASA & SpaceDevs
                </div>
                <h1
                    className="inline-block font-extrabold leading-none tracking-[-0.02em]"
                    style={{
                        fontFamily: SANS,
                        fontSize: "clamp(32px, 7.5vw, 96px)",
                        color: palette.text,
                        textShadow: "0 4px 30px rgba(0,0,0,0.6)",
                        willChange: "transform, opacity",
                    }}
                >
                    {title}
                </h1>
            </div>

            {/* Tagline */}
            {tagline ? (
                <div
                    ref={taglineRef}
                    className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center px-[8%] text-center opacity-0"
                >
                    <p
                        className="max-w-3xl font-bold tracking-[-0.01em]"
                        style={{
                            fontFamily: SANS,
                            fontSize: "clamp(20px, 3.2vw, 38px)",
                            lineHeight: 1.3,
                            color: palette.text,
                            textShadow: "0 4px 24px rgba(0,0,0,0.7)",
                        }}
                    >
                        {tagline}
                    </p>
                </div>
            ) : null}

            {/* Scroll Hint */}
            <div
                ref={hintRef}
                className="pointer-events-none absolute bottom-[clamp(24px,6vh,48px)] left-1/2 z-[2] flex -translate-x-1/2 flex-col items-center gap-2 transition-opacity duration-[400ms]"
                style={{
                    color: palette.muted,
                    fontFamily: SANS,
                    fontSize: "clamp(10px, 1.3vw, 12px)",
                    fontWeight: 600,
                    letterSpacing: "0.3em",
                }}
            >
                <span>{scrollHint}</span>
                <svg width="14" height="18" viewBox="0 0 14 18" aria-hidden="true" style={{ animation: "airlock-bounce 1.6s ease-in-out infinite" }}>
                    <style>{`
                        @keyframes airlock-bounce {
                            0%, 100% { transform: translateY(0); opacity: 0.5; }
                            50% { transform: translateY(5px); opacity: 1; }
                        }
                        @media (prefers-reduced-motion: reduce) {
                            [style*="airlock-bounce"] { animation: none !important; }
                        }
                    `}</style>
                    <path
                        d="M7 1 L7 17 M2 12 L7 17 L12 12"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </div>

            {/* Skip button for accessibility */}
            <button
                type="button"
                onClick={() => releaseRef.current()}
                className="absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-full px-4 py-2 text-xs font-semibold opacity-0 transition-opacity focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{ fontFamily: SANS, color: palette.text, background: "rgba(3,15,22,0.8)", letterSpacing: "0.08em" }}
            >
                {skipLabel}
            </button>

            {/* Thin progress line — fills as the video is scrubbed */}
            <div className="absolute inset-x-0 bottom-0 z-[2] h-0.5" style={{ background: "rgba(255,255,255,0.12)" }}>
                <div
                    ref={barRef}
                    className="h-full w-full origin-left"
                    style={{ background: palette.bar, transform: "scaleX(0)" }}
                />
            </div>

            {signature ? (
                <span
                    className="absolute bottom-[clamp(10px,2vw,18px)] right-[clamp(12px,2.5vw,24px)] z-[2] font-medium"
                    style={{
                        fontFamily: SANS,
                        fontSize: "clamp(11px, 1.4vw, 13px)",
                        color: palette.muted,
                    }}
                >
                    by{" "}
                    <a
                        href={signature.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="no-underline transition-colors hover:opacity-100"
                        style={{ color: "inherit" }}
                    >
                        {signature.name}
                    </a>
                </span>
            ) : null}
        </div>
    )
}
