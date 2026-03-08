"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import { SignUpButton } from "@clerk/nextjs"
import { useEffect, useRef, useState } from "react"
import { ArrowRight, BookOpen, Brain, Mic, Sparkles } from "lucide-react"

// Dynamically import the Three.js canvas (no SSR)
const BookCanvas = dynamic(() => import("./BookCanvas"), { ssr: false })

// ─── Feature page content ─────────────────────────────────────────────────────
// scroll is split into 5 equal sections [0,0.2) [0.2,0.4) [0.4,0.6) [0.6,0.8) [0.8,1.0]
// currentPage 0 = cover | 1-4 = features | done when progress ≥ 0.9
const TOTAL_PAGES = 4

const FEATURE_PAGES = [
  {
    Icon: BookOpen,
    accent: "#60a5fa",
    label: "Step 1",
    title: "Upload Your Book",
    description:
      "Drop any PDF and Bookyfied processes it instantly — extracting every insight, chapter, and idea ready for conversation.",
  },
  {
    Icon: Brain,
    accent: "#a78bfa",
    label: "Step 2",
    title: "AI Reads & Understands",
    description:
      "Our AI deeply comprehends themes, characters, arguments, and nuances throughout your entire book — not just keywords.",
  },
  {
    Icon: Mic,
    accent: "#34d399",
    label: "Step 3",
    title: "Voice Chat with AI",
    description:
      "Ask questions, get summaries, debate ideas — have a natural voice conversation with an AI that truly knows your book.",
  },
  {
    Icon: Sparkles,
    accent: "#f59e0b",
    label: "Step 4",
    title: "Start Your Journey",
    description:
      "Transform passive reading into active, AI-powered discovery. Learn faster, retain more, and fall in love with books again.",
  },
] as const

type FeaturePage = (typeof FEATURE_PAGES)[number]

// ─── Animated feature text panel ─────────────────────────────────────────────
function FeaturePanel({ page }: { page: FeaturePage }) {
  const { Icon, accent, label, title, description } = page
  return (
    <div className="animate-fade-slide">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
        style={{ background: `${accent}18`, border: `1px solid ${accent}40` }}
      >
        <Icon className="w-6 h-6" style={{ color: accent }} />
      </div>
      <p className="text-xs font-bold uppercase tracking-[0.18em] mb-3" style={{ color: accent }}>
        {label}
      </p>
      <h2 className="text-4xl sm:text-5xl font-bold font-serif text-white leading-[1.1] mb-5">
        {title}
      </h2>
      <p className="text-white/55 text-lg leading-relaxed">{description}</p>
    </div>
  )
}

// ─── Final CTA panel ──────────────────────────────────────────────────────────
function FinalPanel({ isSignedIn }: { isSignedIn: boolean }) {
  return (
    <div className="animate-fade-slide">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-blue-500/10 border border-blue-400/30">
        <Sparkles className="w-6 h-6 text-blue-400" />
      </div>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-400 mb-3">
        Ready to begin?
      </p>
      <h2 className="text-4xl font-bold font-serif text-white leading-[1.1] mb-5">
        Your Library Awaits
      </h2>
      <p className="text-white/55 text-lg leading-relaxed mb-8">
        Join thousands of readers using Bookyfied to unlock deeper understanding from every book.
      </p>
      {isSignedIn ? (
        <Link
          href="/library"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg transition-all hover:scale-105 shadow-lg shadow-blue-600/30"
        >
          Open My Library <ArrowRight className="w-5 h-5" />
        </Link>
      ) : (
        <SignUpButton mode="modal">
          <button className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg transition-all hover:scale-105 shadow-lg shadow-blue-600/30">
            Start Reading Free <ArrowRight className="w-5 h-5" />
          </button>
        </SignUpButton>
      )}
    </div>
  )
}

// ─── Navigation dot ───────────────────────────────────────────────────────────
function NavDot({
  index,
  currentPage,
  accent,
  onClick,
}: {
  index: number
  currentPage: number
  accent: string
  onClick: () => void
}) {
  const isPast = index + 1 < currentPage
  const isActive = index + 1 === currentPage
  return (
    <button
      aria-label={`Go to page ${index + 1}`}
      onClick={onClick}
      className="rounded-full transition-all duration-300"
      style={{
        width: isPast ? 24 : isActive ? 10 : 8,
        height: 8,
        background: isPast ? accent : isActive ? "#ffffff" : "rgba(255,255,255,0.22)",
      }}
    />
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function BookFlip({ isSignedIn }: { isSignedIn: boolean }) {
  // Outer scrollable container ref — used to compute progress relative to this element
  const containerRef = useRef<HTMLDivElement>(null)
  const rafRef       = useRef<number | null>(null)

  // scrollProgress: 0 (cover) → 1 (last section done)
  const [scrollProgress, setScrollProgress] = useState(0)

  // Derive integer page for HTML overlay (0 = cover, 1-4 = features, done at ≥ 0.9)
  const currentPage = Math.min(TOTAL_PAGES, Math.floor(scrollProgress * 5))
  const done        = scrollProgress >= 0.9
  const pageIndex   = Math.min(Math.max(currentPage - 1, 0), TOTAL_PAGES - 1)
  const featurePage = FEATURE_PAGES[pageIndex]

  // Scroll listener — throttled to rAF to stay smooth
  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        const el = containerRef.current
        if (!el) return
        const totalScrollable = el.scrollHeight - window.innerHeight
        if (totalScrollable <= 0) return
        // Offset of container from document top (accounts for anything above it)
        const elTop = el.getBoundingClientRect().top + window.scrollY
        const scrolled = window.scrollY - elTop
        setScrollProgress(Math.max(0, Math.min(1, scrolled / totalScrollable)))
      })
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  // Clicking a nav dot smoothly scrolls to the corresponding section
  const scrollToPage = (dotIndex: number) => {
    const el = containerRef.current
    if (!el) return
    const elTop          = el.getBoundingClientRect().top + window.scrollY
    const totalScrollable = el.scrollHeight - window.innerHeight
    // dot 0 → progress 0.2 (first page flip zone), dot 1 → 0.4, etc.
    const targetProgress = (dotIndex + 1) / 5
    window.scrollTo({ top: elTop + targetProgress * totalScrollable, behavior: "smooth" })
  }

  return (
    // Tall container gives the page room to scroll. Sticky inner div pins the visual.
    <div ref={containerRef} style={{ height: "600vh", position: "relative" }}>
      <div className="sticky top-0 h-screen flex overflow-hidden">

        {/* ── Three.js book canvas ── */}
        <div className="absolute inset-0 z-0">
          <BookCanvas scrollProgress={scrollProgress} />
        </div>

        {/* ── Soft radial glow behind book ── */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 55% 65% at 38% 50%, rgba(20,50,110,0.30) 0%, transparent 70%)",
          }}
        />

        {/* ── Desktop: right-side feature panel ── */}
        <div className="relative z-10 ml-auto hidden md:flex md:flex-col md:justify-center mr-14 lg:mr-24 w-80 lg:w-96 shrink-0">
          {currentPage === 0 && (
            <div className="animate-fade-in">
              <p className="text-white/25 text-sm tracking-wide">
                scroll to explore ↓
              </p>
            </div>
          )}
          {currentPage > 0 && !done && (
            <FeaturePanel key={pageIndex} page={featurePage} />
          )}
          {done && <FinalPanel isSignedIn={isSignedIn} />}
        </div>

        {/* ── Mobile: bottom feature text ── */}
        <div className="absolute bottom-24 left-0 right-0 px-6 md:hidden z-10 text-center">
          {currentPage > 0 && !done && (
            <div key={pageIndex}>
              <p
                className="text-xs font-bold uppercase tracking-widest mb-1"
                style={{ color: featurePage.accent }}
              >
                {featurePage.label}
              </p>
              <h3 className="text-xl font-bold font-serif text-white mb-2">{featurePage.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{featurePage.description}</p>
            </div>
          )}
          {done && (
            isSignedIn ? (
              <Link
                href="/library"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-lg shadow-blue-600/30"
              >
                Open My Library <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <SignUpButton mode="modal">
                <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-lg shadow-blue-600/30">
                  Start Reading Free <ArrowRight className="w-4 h-4" />
                </button>
              </SignUpButton>
            )
          )}
        </div>

        {/* ── Scroll-progress bar (top edge) ── */}
        <div className="absolute top-0 left-0 right-0 h-0.5 z-30 pointer-events-none">
          <div
            className="h-full bg-linear-to-r from-blue-500 via-purple-500 to-amber-400 transition-none"
            style={{ width: `${scrollProgress * 100}%` }}
          />
        </div>

        {/* ── Page navigation dots ── */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
          {FEATURE_PAGES.map((p, i) => (
            <NavDot
              key={i}
              index={i}
              currentPage={currentPage}
              accent={p.accent}
              onClick={() => scrollToPage(i)}
            />
          ))}
        </div>

        {/* ── "scroll to explore" hint on cover ── */}
        {scrollProgress < 0.04 && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 pointer-events-none">
            <p className="text-white/25 text-xs tracking-widest animate-pulse">
              scroll to explore
            </p>
            {/* Animated chevron */}
            <svg width="16" height="10" viewBox="0 0 16 10" className="animate-bounce opacity-25">
              <polyline points="1,1 8,9 15,1" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}

      </div>
    </div>
  )
}
