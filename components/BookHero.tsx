'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { SignUpButton } from '@clerk/nextjs';
import {
  ArrowRight, BookOpen, Brain, Mic, Sparkles,
  Search, History, Zap, Check, Star,
} from 'lucide-react';

// ─── Data ─────────────────────────────────────────────────────────────────────

const STEPS = [
  {
    number: 1,
    icon: BookOpen,
    accent: '#60a5fa',
    title: 'Upload Your Book',
    subtitle: 'Any PDF, instantly ready',
    description:
      'Drop any PDF into Bookyfied and our AI processes every page in seconds — extracting insights, chapters, themes, and ideas so you can start chatting right away.',
    detail: 'Supports PDFs up to 50 MB. Processing takes under 30 seconds for most books.',
  },
  {
    number: 2,
    icon: Brain,
    accent: '#a78bfa',
    title: 'AI Reads & Understands',
    subtitle: 'Deep comprehension, not keywords',
    description:
      'Our AI deeply comprehends themes, characters, arguments, and nuances throughout your entire book — understanding context and meaning the way a human reader would.',
    detail: 'Powered by large language models trained on millions of books and documents.',
  },
  {
    number: 3,
    icon: Mic,
    accent: '#34d399',
    title: 'Voice Chat with AI',
    subtitle: 'A conversation, not a search',
    description:
      'Ask questions, get chapter summaries, debate ideas, or explore concepts — have a completely natural voice conversation with an AI that truly knows your book inside out.',
    detail: 'Multiple AI voice options available. Sessions saved for later review.',
  },
  {
    number: 4,
    icon: Sparkles,
    accent: '#f59e0b',
    title: 'Start Your Journey',
    subtitle: 'Transform how you read',
    description:
      'Join thousands of readers using Bookyfied to unlock deeper understanding from every book. Learn faster, retain more, and fall in love with reading all over again.',
    detail: 'Free tier available. No credit card required to get started.',
  },
] as const;

const FEATURES = [
  { icon: BookOpen, accent: '#60a5fa', title: 'Instant PDF Processing', description: 'Drop any PDF and Bookyfied processes it in seconds — every insight ready to explore.' },
  { icon: Brain,   accent: '#a78bfa', title: 'Deep AI Comprehension',  description: 'Understands themes, characters, arguments and nuance — not just keywords.' },
  { icon: Mic,     accent: '#34d399', title: 'Natural Voice Chat',     description: 'Have a real voice conversation with your book. Ask anything, get real answers.' },
  { icon: Search,  accent: '#f59e0b', title: 'Smart Search',           description: 'Find any concept, quote or idea across your entire library instantly.' },
  { icon: History, accent: '#f472b6', title: 'Session History',        description: 'Every conversation is saved. Pick up where you left off at any time.' },
  { icon: Zap,     accent: '#38bdf8', title: 'Lightning Fast',         description: 'Responses in under a second. Continuous, natural flowing conversation.' },
];

const TESTIMONIALS = [
  { quote: "It's like having a study partner who's read everything. I never take notes by hand anymore.", author: 'Sarah K.',  role: 'PhD Student, Literature', accent: '#60a5fa', stars: 5 },
  { quote: 'Voice chatting about Atomic Habits during my commute completely changed how I absorb books.',  author: 'Marcus T.', role: 'Product Manager',         accent: '#a78bfa', stars: 5 },
  { quote: 'Uploaded a dense finance textbook at 11pm and was quizzing the AI on derivatives by midnight.', author: 'Priya R.',  role: 'Finance Analyst',        accent: '#34d399', stars: 5 },
];

const PRICING_PLANS = [
  { name: 'Free',     price: '$0',  period: 'forever', accent: '#60a5fa', popular: false, features: ['1 book in library', '5 sessions / month', '5 min per session', 'Core AI chat'] },
  { name: 'Standard', price: '$9',  period: '/ month',  accent: '#a78bfa', popular: true,  features: ['10 books in library', '100 sessions / month', '15 min per session', 'Session history'] },
  { name: 'Pro',      price: '$19', period: '/ month',  accent: '#34d399', popular: false, features: ['100 books in library', 'Unlimited sessions', '60 min per session', 'Full history'] },
];

const CHAPTERS = [
  { title: 'Welcome',           pages: [0],          pageLabel: '1'  },
  { title: 'How It Works',     pages: [1, 2, 3, 4], pageLabel: '3'  },
  { title: 'Features',         pages: [5],           pageLabel: '11' },
  { title: 'What Readers Say', pages: [6],           pageLabel: '13' },
  { title: 'Pricing Plans',    pages: [7],           pageLabel: '15' },
  { title: 'Get Started',      pages: [8],           pageLabel: '17' },
];

const TOTAL_PAGES = 9;

type Step = (typeof STEPS)[number];

// ─── Helper ───────────────────────────────────────────────────────────────────

function PageShell({
  children, pageNum, animKey, hint = 'swipe or scroll to turn page',
}: {
  children: React.ReactNode;
  pageNum: number;
  animKey: number;
  hint?: string;
}) {
  return (
    <div
      key={animKey}
      className="relative flex flex-col h-full px-4 md:px-7 py-5 md:py-8"
      style={{ animation: 'bookPageIn 0.42s ease forwards' }}
    >
      <div className="flex-1 flex flex-col">{children}</div>
      <div className="pt-3 border-t border-[#c9b99a]/40 flex justify-between items-center mt-3">
        <span className="text-[9px] text-[#8b7355] font-serif italic">{hint}</span>
        <span className="text-[9px] text-[#8b7355] font-serif">{pageNum}</span>
      </div>
      <div className="absolute top-0 left-0 bottom-0 w-5 bg-linear-to-r from-[#c9b99a]/25 to-transparent pointer-events-none" />
    </div>
  );
}

// ─── Left: Table of Contents ──────────────────────────────────────────────────

function LeftTOC({ currentPage }: { currentPage: number }) {
  const activeChapter = CHAPTERS.findIndex((c) => c.pages.includes(currentPage));
  return (
    <div className="relative flex flex-col h-full px-7 py-8 select-none">
      <div className="mb-6 pb-5 border-b border-[#c9b99a]/40">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-4 h-4 text-[#8b7355]" />
          <span className="font-serif font-bold text-[#4a3728] text-sm tracking-wide">Bookyfied</span>
        </div>
        <p className="text-[10px] text-[#8b7355] font-serif italic">AI-Powered Book Intelligence</p>
      </div>

      <p className="text-[9px] uppercase tracking-[0.18em] text-[#8b7355] font-sans mb-4">Table of Contents</p>

      <div className="flex-1 space-y-4">
        {CHAPTERS.map((ch, i) => {
          const isActive = i === activeChapter;
          const isPast   = i < activeChapter;
          return (
            <div key={ch.title} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold font-sans transition-all duration-500"
                  style={
                    isActive
                      ? { background: '#60a5fa', color: '#fff', boxShadow: '0 0 8px #60a5fa60' }
                      : isPast
                      ? { background: '#c9b99a', color: '#5a4a3a' }
                      : { border: '1px solid #c9b99a', color: '#8b7355' }
                  }
                >
                  {isPast ? '✓' : i + 1}
                </span>
                <span
                  className="font-serif text-xs truncate transition-all duration-500"
                  style={{
                    color:      isActive ? '#2c1f0e' : isPast ? '#6b5744' : '#9a8070',
                    fontWeight: isActive ? 700 : 400,
                  }}
                >
                  {ch.title}
                </span>
              </div>
              <span className="shrink-0 text-[9px] font-sans" style={{ color: isActive ? '#8b7355' : '#c0b0a0' }}>
                {ch.pageLabel}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-[#c9b99a]/40 flex justify-between items-center">
        <span className="text-[9px] text-[#8b7355] font-serif italic">Bookyfied · Guide</span>
        <span className="text-[9px] text-[#8b7355] font-serif">{currentPage * 2 + 1}</span>
      </div>
      <div className="absolute top-0 right-0 bottom-0 w-5 bg-linear-to-l from-[#c9b99a]/25 to-transparent pointer-events-none" />
    </div>
  );
}

// ─── Step Illustrations ──────────────────────────────────────────────────────

function StepIllustration({ number, accent }: { number: number; accent: string }) {
  if (number === 1) return (
    <div className="step-illustration flex-1 flex items-center justify-center py-2">
      <svg width="100%" height="220" viewBox="0 0 200 130" fill="none">
        {/* stacked pages shadow */}
        <rect x="66" y="18" width="72" height="90" rx="5" fill={`${accent}08`} transform="translate(4,4)" />
        <rect x="66" y="18" width="72" height="90" rx="5" fill={`${accent}10`} transform="translate(2,2)" />
        {/* main doc */}
        <rect x="66" y="18" width="72" height="90" rx="5" fill={`${accent}16`} stroke={`${accent}60`} strokeWidth="1.5" />
        {/* corner fold */}
        <path d="M118 18 L138 38 L118 38 Z" fill={`${accent}30`} stroke={`${accent}50`} strokeWidth="1" />
        {/* text lines */}
        <line x1="80" y1="52" x2="118" y2="52" stroke={`${accent}70`} strokeWidth="1.5" strokeLinecap="round" />
        <line x1="80" y1="63" x2="126" y2="63" stroke={`${accent}45`} strokeWidth="1.5" strokeLinecap="round" />
        <line x1="80" y1="74" x2="122" y2="74" stroke={`${accent}45`} strokeWidth="1.5" strokeLinecap="round" />
        <line x1="80" y1="85" x2="108" y2="85" stroke={`${accent}30`} strokeWidth="1.5" strokeLinecap="round" />
        {/* upload cloud */}
        <circle cx="158" cy="38" r="22" fill={`${accent}14`} stroke={`${accent}40`} strokeWidth="1.2" />
        <path d="M158 48 L158 30" stroke={accent} strokeWidth="2" strokeLinecap="round" />
        <path d="M151 37 L158 30 L165 37" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="152" y1="50" x2="164" y2="50" stroke={`${accent}60`} strokeWidth="1.5" strokeLinecap="round" />
        {/* dashed link */}
        <line x1="138" y1="38" x2="136" y2="38" stroke={`${accent}50`} strokeWidth="1" strokeDasharray="3 2" />
        {/* dots */}
        <circle cx="44" cy="45" r="4" fill={`${accent}35`} />
        <circle cx="36" cy="68" r="2.5" fill={`${accent}25`} />
        <circle cx="50" cy="88" r="2" fill={`${accent}20`} />
        <circle cx="170" cy="70" r="3" fill={`${accent}30`} />
      </svg>
    </div>
  );
  if (number === 2) {
    const nodes: [number,number,number][] = [[100,52,6],[66,80,4],[134,80,4],[50,108,3.5],[100,112,4],[150,108,3.5],[78,36,3],[122,36,3],[32,88,3],[168,88,3]];
    const edges = [[0,1],[0,2],[1,3],[1,4],[2,4],[2,5],[0,6],[0,7],[1,8],[2,9],[3,4],[4,5]];
    return (
      <div className="step-illustration flex-1 flex items-center justify-center py-2">
        <svg width="100%" height="220" viewBox="0 0 200 130" fill="none">
          {/* outer glow ring */}
          <circle cx="100" cy="75" r="55" fill={`${accent}05`} />
          {edges.map(([a,b],i) => (
            <line key={i} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]}
              stroke={`${accent}35`} strokeWidth="1" strokeDasharray={i>7?"3 2":"none"} />
          ))}
          {nodes.map(([x,y,r],i) => (
            <circle key={i} cx={x} cy={y} r={r}
              fill={i===0?`${accent}30`:`${accent}15`}
              stroke={`${accent}${i===0?'80':'50'}`} strokeWidth="1.5" />
          ))}
          {/* pulse ring on center */}
          <circle cx="100" cy="52" r="14" fill="none" stroke={`${accent}25`} strokeWidth="1" strokeDasharray="4 3" />
        </svg>
      </div>
    );
  }
  if (number === 3) {
    const bars = [6,12,18,24,18,28,22,14,28,20,12,24,16,8,12];
    return (
      <div className="step-illustration flex-1 flex items-center justify-center py-2">
        <svg width="100%" height="220" viewBox="0 0 200 130" fill="none">
          {/* chat bubble */}
          <rect x="22" y="12" width="156" height="64" rx="12" fill={`${accent}12`} stroke={`${accent}35`} strokeWidth="1.2" />
          <path d="M48 76 L36 92 L64 76 Z" fill={`${accent}12`} stroke={`${accent}35`} strokeWidth="1.2" strokeLinejoin="round" />
          {/* waveform */}
          {bars.map((h,i) => (
            <rect key={i} x={36+i*8} y={44-h/2} width="4.5" height={h} rx="2.2"
              fill={`${accent}${i%3===1?'90':'55'}`} />
          ))}
          {/* mic */}
          <circle cx="150" cy="108" r="18" fill={`${accent}18`} stroke={`${accent}45`} strokeWidth="1.4" />
          <rect x="144" y="98" width="12" height="17" rx="6" stroke={accent} strokeWidth="1.5" fill="none" />
          <path d="M144 113 Q140 120 150 122 Q160 120 156 113" stroke={accent} strokeWidth="1.5" fill="none" />
          <line x1="150" y1="122" x2="150" y2="127" stroke={accent} strokeWidth="1.5" strokeLinecap="round" />
          {/* dots */}
          <circle cx="30" cy="105" r="3" fill={`${accent}35`} />
          <circle cx="42" cy="118" r="2" fill={`${accent}25`} />
        </svg>
      </div>
    );
  }
  // Step 4 — open book + stars
  return (
    <div className="step-illustration flex-1 flex items-center justify-center py-2">
      <svg width="100%" height="220" viewBox="0 0 200 130" fill="none">
        {/* glow */}
        <ellipse cx="100" cy="85" rx="60" ry="30" fill={`${accent}08`} />
        {/* left page */}
        <path d="M100 28 Q72 24 38 34 L38 108 Q70 98 100 104 Z" fill={`${accent}15`} stroke={`${accent}55`} strokeWidth="1.5" />
        {/* right page */}
        <path d="M100 28 Q128 24 162 34 L162 108 Q130 98 100 104 Z" fill={`${accent}10`} stroke={`${accent}45`} strokeWidth="1.5" />
        {/* spine */}
        <line x1="100" y1="28" x2="100" y2="104" stroke={`${accent}70`} strokeWidth="2" strokeLinecap="round" />
        {/* left lines */}
        <line x1="52" y1="56" x2="90" y2="52" stroke={`${accent}45`} strokeWidth="1.2" strokeLinecap="round" />
        <line x1="52" y1="67" x2="90" y2="63" stroke={`${accent}30`} strokeWidth="1.2" strokeLinecap="round" />
        <line x1="52" y1="78" x2="88" y2="74" stroke={`${accent}30`} strokeWidth="1.2" strokeLinecap="round" />
        {/* stars */}
        <text x="112" y="54" fontSize="15" fill={accent} opacity="0.85">✦</text>
        <text x="136" y="72" fontSize="10" fill={accent} opacity="0.55">✦</text>
        <text x="105" y="88" fontSize="8" fill={accent} opacity="0.60">✦</text>
        <text x="152" y="50" fontSize="8" fill={accent} opacity="0.40">✦</text>
        <text x="128" y="95" fontSize="6" fill={accent} opacity="0.35">✦</text>
      </svg>
    </div>
  );
}


function LeftSteps({ currentStepIndex }: { currentStepIndex: number }) {
  return (
    <div className="relative flex flex-col h-full px-7 py-8 select-none">
      <div className="mb-6 pb-5 border-b border-[#c9b99a]/40">
        <p className="text-[9px] text-[#8b7355] uppercase tracking-[0.15em] font-sans mb-1">Chapter Two</p>
        <h2 className="font-serif text-lg font-bold text-[#1a1008] leading-tight">How It Works</h2>
        <p className="text-[10px] text-[#8b7355] font-serif italic mt-1">Four simple steps</p>
      </div>

      <div className="flex-1 space-y-5">
        {STEPS.map((step, i) => {
          const isActive = i === currentStepIndex;
          const isPast   = i < currentStepIndex;
          return (
            <div
              key={step.number}
              className="flex items-start gap-3 transition-all duration-500"
              style={{ opacity: isPast ? 0.45 : isActive ? 1 : 0.6 }}
            >
              <div
                className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-sans transition-all duration-500"
                style={
                  isActive
                    ? { background: step.accent, color: '#fff', boxShadow: `0 0 12px ${step.accent}50` }
                    : isPast
                    ? { background: '#c9b99a', color: '#5a4a3a' }
                    : { border: '1.5px solid #c9b99a', color: '#8b7355' }
                }
              >
                {isPast ? '✓' : step.number}
              </div>
              <div>
                <p className="font-serif font-semibold text-sm leading-tight" style={{ color: isActive ? '#1a1008' : '#4a3520' }}>
                  {step.title}
                </p>
                <p className="text-[10px] font-sans mt-0.5" style={{ color: isActive ? step.accent : '#8b7355' }}>
                  {step.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Decorative chapter ornament */}
      <div className="flex flex-col items-center gap-2 py-4">
        <svg width="160" height="48" viewBox="0 0 160 48" fill="none">
          <line x1="12" y1="24" x2="58" y2="24" stroke="#c9b99a" strokeWidth="0.8" />
          <line x1="102" y1="24" x2="148" y2="24" stroke="#c9b99a" strokeWidth="0.8" />
          <circle cx="80" cy="24" r="10" fill="none" stroke="#c9b99a" strokeWidth="0.8" />
          <path d="M74 24 Q77 18 80 24 Q83 30 86 24" stroke="#b8956a" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <circle cx="60" cy="24" r="2" fill="#c9b99a" opacity="0.6" />
          <circle cx="100" cy="24" r="2" fill="#c9b99a" opacity="0.6" />
          <circle cx="36" cy="24" r="1.2" fill="#c9b99a" opacity="0.35" />
          <circle cx="124" cy="24" r="1.2" fill="#c9b99a" opacity="0.35" />
        </svg>
        <p className="text-[8px] text-[#b8956a] font-serif italic tracking-widest select-none">per aspera ad astra</p>
      </div>

      <div className="mt-4 pt-3 border-t border-[#c9b99a]/40 flex justify-between items-center">
        <span className="text-[9px] text-[#8b7355] font-serif italic">Bookyfied · Guide</span>
        <span className="text-[9px] text-[#8b7355] font-serif">{(currentStepIndex + 1) * 2 + 3}</span>
      </div>
      <div className="absolute top-0 right-0 bottom-0 w-5 bg-linear-to-l from-[#c9b99a]/25 to-transparent pointer-events-none" />
    </div>
  );
}

// ─── RIGHT: Hero / Welcome ────────────────────────────────────────────────────

function RightHero({ isSignedIn, animKey }: { isSignedIn: boolean; animKey: number }) {
  return (
    <PageShell pageNum={2} animKey={animKey} hint="scroll down to turn page →">
      <div className="flex flex-col justify-center flex-1">
        <div
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-5 w-fit"
          style={{ background: '#60a5fa15', border: '1px solid #60a5fa35' }}
        >
          <Sparkles className="w-3 h-3 text-blue-400" />
          <span className="text-[10px] text-blue-500 font-sans font-semibold">AI-Powered</span>
        </div>

        <h1 className="font-serif text-3xl font-bold text-[#2c1f0e] leading-tight mb-3">
          Talk to<br />
          <span style={{ background: 'linear-gradient(to right,#60a5fa,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Your Books.
          </span>
        </h1>

        <p className="font-serif text-[#2c1a08] text-xs leading-relaxed mb-6">
          Upload any book and have a real AI conversation about it. Bookyfied turns passive
          reading into active, AI-powered discovery — instantly.
        </p>

        <div className="flex flex-col gap-2">
          {isSignedIn ? (
            <Link href="/library" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all hover:scale-105 w-fit">
              Open Library <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <SignUpButton mode="modal">
              <button className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all hover:scale-105">
                Get Started Free <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </SignUpButton>
          )}
          <p className="text-[9px] text-[#8b7355] font-sans">No credit card required · Free tier available</p>
        </div>

        <div className="mt-5 pt-4 border-t border-[#c9b99a]/30">
          <p className="text-[9px] text-[#8b7355] font-serif italic">Scroll to discover how it works →</p>
        </div>

        {/* Mini book + chat mockup */}
        <div className="mt-4 flex items-end gap-4">
          <svg width="160" height="120" viewBox="0 0 110 80" fill="none">
            {/* open book */}
            <path d="M55 10 Q38 6 16 13 L16 66 Q36 59 55 63 Z" fill="#60a5fa18" stroke="#60a5fa50" strokeWidth="1.2" />
            <path d="M55 10 Q72 6 94 13 L94 66 Q74 59 55 63 Z" fill="#a78bfa14" stroke="#a78bfa45" strokeWidth="1.2" />
            <line x1="55" y1="10" x2="55" y2="63" stroke="#c9b99a" strokeWidth="1.5" />
            <line x1="25" y1="28" x2="48" y2="25" stroke="#60a5fa45" strokeWidth="1" strokeLinecap="round" />
            <line x1="25" y1="37" x2="48" y2="34" stroke="#60a5fa30" strokeWidth="1" strokeLinecap="round" />
            <line x1="25" y1="46" x2="47" y2="43" stroke="#60a5fa25" strokeWidth="1" strokeLinecap="round" />
          </svg>
          <div className="flex flex-col gap-1.5 pb-1">
            <div className="px-2.5 py-1.5 rounded-lg rounded-bl-none text-[9px] font-sans" style={{ background: '#60a5fa18', border: '1px solid #60a5fa35', color: '#2c5282' }}>What is this book about?</div>
            <div className="px-2.5 py-1.5 rounded-lg rounded-br-none text-[9px] font-sans self-end" style={{ background: '#a78bfa18', border: '1px solid #a78bfa35', color: '#553c9a' }}>It explores the idea that…</div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

// ─── RIGHT: Step detail ───────────────────────────────────────────────────────

function RightStep({ step, animKey }: { step: Step; animKey: number }) {
  const { icon: Icon, accent, number, title, description, detail } = step;
  return (
    <PageShell pageNum={number * 2 + 2} animKey={animKey}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${accent}20`, border: `1.5px solid ${accent}50` }}>
          <Icon className="w-4 h-4" style={{ color: accent }} />
        </div>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] font-sans" style={{ color: accent }}>
            Step {number} of {STEPS.length}
          </p>
          <h3 className="font-serif font-bold text-[#1a1008] text-sm leading-tight">{title}</h3>
        </div>
      </div>

      <div className="h-px mb-4" style={{ background: `linear-gradient(to right,${accent}60,transparent)` }} />

      <p className="font-serif text-[#3d2b1a] text-xs leading-[1.95]">{description}</p>

      <StepIllustration number={number} accent={accent} />

      <div
        className="mt-4 p-3 rounded-lg text-[10px] font-sans leading-relaxed"
        style={{ background: `${accent}12`, border: `1px solid ${accent}30`, color: '#5a4a3a' }}
      >
        {detail}
      </div>
    </PageShell>
  );
}

// ─── RIGHT: Features ──────────────────────────────────────────────────────────

function RightFeatures({ animKey }: { animKey: number }) {
  return (
    <PageShell pageNum={11} animKey={animKey}>
      <p className="text-[9px] uppercase tracking-[0.18em] text-[#8b7355] font-sans mb-0.5">Chapter Three</p>
      <h2 className="font-serif text-lg font-bold text-[#2c1f0e] mb-4">Features</h2>
      <div className="grid grid-cols-2 gap-2.5 flex-1 content-start">
        {FEATURES.map(({ icon: Icon, accent, title, description }) => (
          <div key={title} className="p-2.5 rounded-lg" style={{ background: `${accent}0d`, border: `1px solid ${accent}28` }}>
            <div className="flex items-center gap-1.5 mb-1">
              <Icon className="w-3 h-3 shrink-0" style={{ color: accent }} />
              <span className="font-serif font-bold text-[#2c1f0e] text-[10px] leading-tight">{title}</span>
            </div>
            <p className="text-[9px] text-[#7a6555] font-sans leading-relaxed">{description}</p>
          </div>
        ))}
      </div>
    </PageShell>
  );
}

// ─── RIGHT: Testimonials ──────────────────────────────────────────────────────

function RightTestimonials({ animKey }: { animKey: number }) {
  return (
    <PageShell pageNum={13} animKey={animKey}>
      <p className="text-[9px] uppercase tracking-[0.18em] text-[#8b7355] font-sans mb-0.5">Chapter Four</p>
      <h2 className="font-serif text-lg font-bold text-[#2c1f0e] mb-4">What Readers Say</h2>
      <div className="flex-1 space-y-3">
        {TESTIMONIALS.map(({ quote, author, role, accent, stars }) => (
          <div key={author} className="p-3 rounded-lg" style={{ background: `${accent}0d`, border: `1px solid ${accent}28` }}>
            <div className="flex gap-0.5 mb-1.5">
              {Array.from({ length: stars }).map((_, i) => (
                <Star key={i} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="font-serif text-[#3d2b1a] text-[10px] leading-relaxed mb-2">
              &ldquo;{quote}&rdquo;
            </p>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0" style={{ background: `${accent}22`, color: accent }}>
                {author[0]}
              </div>
              <div>
                <p className="text-[9px] font-bold font-sans text-[#3d2b1a]">{author}</p>
                <p className="text-[8px] text-[#8b7355] font-sans">{role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}

// ─── RIGHT: Pricing ───────────────────────────────────────────────────────────

function RightPricing({ isSignedIn, animKey }: { isSignedIn: boolean; animKey: number }) {
  return (
    <PageShell pageNum={15} animKey={animKey}>
      <p className="text-[9px] uppercase tracking-[0.18em] text-[#8b7355] font-sans mb-0.5">Chapter Five</p>
      <h2 className="font-serif text-lg font-bold text-[#2c1f0e] mb-4">Pricing Plans</h2>
      <div className="flex-1 space-y-2.5">
        {PRICING_PLANS.map(({ name, price, period, accent, features, popular }) => (
          <div
            key={name}
            className="p-3 rounded-lg relative"
            style={{ background: popular ? `${accent}14` : `${accent}09`, border: `1px solid ${accent}${popular ? '55' : '28'}` }}
          >
            {popular && (
              <span className="absolute -top-2 left-3 px-2 py-0.5 rounded-full text-[8px] font-bold font-sans text-white" style={{ background: accent }}>
                Popular
              </span>
            )}
            <div className="flex justify-between items-baseline mb-1.5">
              <p className="font-serif font-bold text-[#2c1f0e] text-xs">{name}</p>
              <div className="flex items-baseline gap-0.5">
                <span className="font-serif font-bold text-sm" style={{ color: accent }}>{price}</span>
                <span className="text-[8px] text-[#8b7355] font-sans">{period}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5">
              {features.map((f) => (
                <span key={f} className="text-[9px] text-[#5a4a3a] font-sans flex items-center gap-0.5">
                  <Check className="w-2 h-2 shrink-0" style={{ color: accent }} />{f}
                </span>
              ))}
            </div>
          </div>
        ))}
        <div className="pt-1">
          {isSignedIn ? (
            <Link href="/subscriptions" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold transition-all">
              Manage Plan <ArrowRight className="w-3 h-3" />
            </Link>
          ) : (
            <SignUpButton mode="modal">
              <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold transition-all">
                Start Free <ArrowRight className="w-3 h-3" />
              </button>
            </SignUpButton>
          )}
        </div>
      </div>
    </PageShell>
  );
}

// ─── RIGHT: Get Started / CTA ─────────────────────────────────────────────────

function RightCTA({ isSignedIn, animKey }: { isSignedIn: boolean; animKey: number }) {
  return (
    <PageShell pageNum={17} animKey={animKey} hint="© 2026 Bookyfied · Made for book lovers">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-6 h-6 text-blue-500" />
        </div>
        <h2 className="font-serif text-xl font-bold text-[#2c1f0e] mb-2">Your Library Awaits</h2>
        <p className="font-serif text-[#5a4a3a] text-xs leading-relaxed mb-5 max-w-48 mx-auto">
          Join thousands of readers transforming how they engage with every book they read.
        </p>
        {isSignedIn ? (
          <Link href="/library" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all hover:scale-105">
            Open My Library <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        ) : (
          <SignUpButton mode="modal">
            <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all hover:scale-105">
              Start Reading Free <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </SignUpButton>
        )}
      </div>
    </PageShell>
  );
}

// ─── Content helpers ────────────────────────────────────────────────────────

function getLeft(page: number) {
  return page >= 1 && page <= 4
    ? <LeftSteps currentStepIndex={page - 1} />
    : <LeftTOC currentPage={page} />;
}

function getRight(page: number, animKey: number, isSignedIn: boolean): React.ReactNode {
  if (page === 0)                        return <RightHero isSignedIn={isSignedIn} animKey={animKey} />;
  if (page >= 1 && page <= 4)           return <RightStep step={STEPS[page - 1]} animKey={animKey} />;
  if (page === 5)                        return <RightFeatures animKey={animKey} />;
  if (page === 6)                        return <RightTestimonials animKey={animKey} />;
  if (page === 7)                        return <RightPricing isSignedIn={isSignedIn} animKey={animKey} />;
  return                                        <RightCTA isSignedIn={isSignedIn} animKey={animKey} />;
}

type FlipState = { dir: 'fwd' | 'bwd'; from: number } | null;

// ─── Open Book Shell ──────────────────────────────────────────────────────────

function OpenBook({
  currentPage, animKey, isSignedIn, flip,
}: {
  currentPage: number; animKey: number; isSignedIn: boolean; flip: FlipState;
}) {
  const leftContent  = getLeft(currentPage);
  const rightContent = getRight(currentPage, animKey, isSignedIn);

  return (
    <div style={{ perspective: '1600px', perspectiveOrigin: '50% 40%', width: '100%' }}>
      <div
        className="relative w-full max-w-7xl mx-auto rounded-xl overflow-hidden"
        style={{
          filter: 'drop-shadow(0 60px 120px rgba(0,0,0,0.8))',
        }}
      >
        {/* Stacked pages depth */}
        {[3, 2, 1].map((offset) => (
          <div
            key={offset}
            className="absolute inset-x-0 rounded-xl"
            style={{
              top: offset * 2, bottom: -offset * 2,
              left: offset * 2, right: offset * 2,
              background: offset === 1 ? '#d9c9a8' : offset === 2 ? '#e2d0b0' : '#eadcbc',
            }}
          />
        ))}

        {/* Book spread */}
        <div
          className="relative flex rounded-xl overflow-hidden"
          style={{ background: '#e8d5b0', minHeight: 680 }}
        >
          {/* Spine line */}
          <div
            className="absolute top-0 bottom-0 z-20 pointer-events-none"
            style={{ left: '50%', width: 2, background: 'linear-gradient(to bottom,#c9b99a,#8a6840,#c9b99a)', boxShadow: '0 0 16px rgba(100,70,30,0.6)' }}
          />
          {/* Deep spine crease */}
          <div
            className="absolute top-0 bottom-0 z-10 pointer-events-none"
            style={{ left: 'calc(50% - 48px)', width: 96, background: 'radial-gradient(ellipse 100% 100% at center, rgba(0,0,0,0.22) 0%, transparent 70%)' }}
          />

          {/* Left page */}
          <div
            className="relative w-1/2 border-r border-[#b8956a]/30"
            style={{ background: '#f5e6c8', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' } as React.CSSProperties}
          >
            {leftContent}
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to left, rgba(0,0,0,0.09) 0%, transparent 28%)' }} />
          </div>

          {/* Right page */}
          <div
            className="relative w-1/2"
            style={{ background: '#f0ddb8', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' } as React.CSSProperties}
          >
            {rightContent}
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.09) 0%, transparent 28%)' }} />
          </div>

          {/* ── Forward flip: right page sweeps to spine, back reveals over left ── */}
          {flip?.dir === 'fwd' && (
            <>
              {/* Phase 1 — 0 → −90°: old right page folds toward spine */}
              <div
                key={`f1-${flip.from}`}
                style={{
                  position: 'absolute', top: 0, bottom: 0, left: '50%', right: 0,
                  transformOrigin: 'left center',
                  background: '#f0ddb8',
                  animation: 'flipF1 0.38s ease-in forwards',
                  zIndex: 40, overflow: 'hidden',
                }}
              >
                {getRight(flip.from, 0, isSignedIn)}
                {/* curl shadow darkens toward spine as page closes */}
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(to left, transparent 10%, rgba(0,0,0,0.55) 100%)', animation: 'flipShadeIn 0.38s ease-in forwards', opacity: 0 }} />
              </div>
              {/* Phase 2 — −90° → −180°: back-of-page sweeps over left half */}
              <div
                key={`f2-${flip.from}`}
                style={{
                  position: 'absolute', top: 0, bottom: 0, left: '50%', right: 0,
                  transformOrigin: 'left center',
                  background: '#d4bc96',
                  transform: 'perspective(1400px) rotateY(-90deg)',
                  animation: 'flipF2 0.38s ease-out 0.37s forwards',
                  zIndex: 40,
                }}
              >
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(to right, rgba(0,0,0,0.3) 0%, transparent 50%)' }} />
              </div>
            </>
          )}

          {/* ── Backward flip: left page sweeps to spine, back reveals over right ── */}
          {flip?.dir === 'bwd' && (
            <>
              {/* Phase 1 — 0 → +90°: old left page folds toward spine */}
              <div
                key={`b1-${flip.from}`}
                style={{
                  position: 'absolute', top: 0, bottom: 0, left: 0, right: '50%',
                  transformOrigin: 'right center',
                  background: '#f5e6c8',
                  animation: 'flipB1 0.38s ease-in forwards',
                  zIndex: 40, overflow: 'hidden',
                }}
              >
                {getLeft(flip.from)}
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(to right, transparent 10%, rgba(0,0,0,0.55) 100%)', animation: 'flipShadeIn 0.38s ease-in forwards', opacity: 0 }} />
              </div>
              {/* Phase 2 — +90° → +180°: back-of-page sweeps over right half */}
              <div
                key={`b2-${flip.from}`}
                style={{
                  position: 'absolute', top: 0, bottom: 0, left: 0, right: '50%',
                  transformOrigin: 'right center',
                  background: '#d4bc96',
                  transform: 'perspective(1400px) rotateY(90deg)',
                  animation: 'flipB2 0.38s ease-out 0.37s forwards',
                  zIndex: 40,
                }}
              >
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(to left, rgba(0,0,0,0.3) 0%, transparent 50%)' }} />
              </div>
            </>
          )}
        </div>

        {/* Elliptical cast shadow below the book */}
        <div
          className="absolute pointer-events-none"
          style={{ bottom: -16, left: '6%', right: '6%', height: 48, background: 'rgba(0,0,0,0.42)', filter: 'blur(20px)', borderRadius: '50%' }}
        />
      </div>
    </div>
  );
}

// ─── Mobile Book (single page) ─────────────────────────────────────────────────

function MobileBook({
  currentPage, animKey, isSignedIn, flip,
}: {
  currentPage: number; animKey: number; isSignedIn: boolean; flip: FlipState;
}) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', perspective: '900px', perspectiveOrigin: '50% 50%' }}>
      {/* Full-bleed parchment page */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          background: '#f0ddb8',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        } as React.CSSProperties}
      >
        {/* Left spine shadow */}
        <div
          className="absolute top-0 left-0 bottom-0 w-6 pointer-events-none z-10"
          style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.12), transparent)' }}
        />
        {/* Right edge shadow */}
        <div
          className="absolute top-0 right-0 bottom-0 w-6 pointer-events-none z-10"
          style={{ background: 'linear-gradient(to left, rgba(0,0,0,0.08), transparent)' }}
        />

        {getRight(currentPage, animKey, isSignedIn)}

        {/* ── Forward flip on mobile: page sweeps upward — rotate around X axis ── */}
        {flip?.dir === 'fwd' && (
          <>
            {/* Phase 1: old page folds up toward top */}
            <div
              key={`mf1-${flip.from}`}
              style={{
                position: 'absolute', inset: 0,
                transformOrigin: 'center top',
                background: '#f0ddb8',
                animation: 'mflipF1 0.38s ease-in forwards',
                zIndex: 40, overflow: 'hidden',
              }}
            >
              {getRight(flip.from, 0, isSignedIn)}
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(to top, transparent 10%, rgba(0,0,0,0.5) 100%)', animation: 'flipShadeIn 0.38s ease-in forwards', opacity: 0 }} />
            </div>
            {/* Phase 2: back of page sweeps over from top */}
            <div
              key={`mf2-${flip.from}`}
              style={{
                position: 'absolute', inset: 0,
                transformOrigin: 'center top',
                background: '#e2ccaa',
                transform: 'perspective(900px) rotateX(90deg)',
                animation: 'mflipF2 0.38s ease-out 0.37s forwards',
                zIndex: 40,
              }}
            >
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(to bottom, rgba(0,0,0,0.28) 0%, transparent 45%)' }} />
            </div>
          </>
        )}

        {/* ── Backward flip: page sweeps downward ── */}
        {flip?.dir === 'bwd' && (
          <>
            {/* Phase 1: old page folds down toward bottom */}
            <div
              key={`mb1-${flip.from}`}
              style={{
                position: 'absolute', inset: 0,
                transformOrigin: 'center bottom',
                background: '#f0ddb8',
                animation: 'mflipB1 0.38s ease-in forwards',
                zIndex: 40, overflow: 'hidden',
              }}
            >
              {getRight(flip.from, 0, isSignedIn)}
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(to bottom, transparent 10%, rgba(0,0,0,0.5) 100%)', animation: 'flipShadeIn 0.38s ease-in forwards', opacity: 0 }} />
            </div>
            {/* Phase 2: back of page sweeps over from bottom */}
            <div
              key={`mb2-${flip.from}`}
              style={{
                position: 'absolute', inset: 0,
                transformOrigin: 'center bottom',
                background: '#e2ccaa',
                transform: 'perspective(900px) rotateX(-90deg)',
                animation: 'mflipB2 0.38s ease-out 0.37s forwards',
                zIndex: 40,
              }}
            >
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(to top, rgba(0,0,0,0.28) 0%, transparent 45%)' }} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function BookHero({ isSignedIn }: { isSignedIn: boolean }) {
  const pageRef    = useRef(0);
  const isChanging = useRef(false);
  const [displayPage, setDisplayPage] = useState(0);
  const [animKey, setAnimKey]         = useState(0);
  const [flip, setFlip]               = useState<FlipState>(null);
  const [isMobile, setIsMobile]       = useState(false);
  const flipAudioRef = useRef<HTMLAudioElement | null>(null);

  // Unlock audio on first trusted gesture so wheel-triggered plays aren't
  // blocked by Chrome's autoplay policy.
  useEffect(() => {
    const unlock = () => {
      const audio = flipAudioRef.current;
      if (!audio) return;
      // Play + pause immediately to mark the element as "user-activated".
      audio.volume = 0;
      const p = audio.play();
      if (p) p.then(() => { audio.pause(); audio.currentTime = 0; audio.volume = 1; }).catch(() => {});
    };
    window.addEventListener('pointerdown', unlock, { once: true, passive: true });
    window.addEventListener('keydown',     unlock, { once: true, passive: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown',     unlock);
    };
  }, []);

  const playFlipSound = () => {
    const audio = flipAudioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    void audio.play();
  };

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    const go = (dir: 1 | -1) => {
      if (isChanging.current) return;
      const next = Math.min(TOTAL_PAGES - 1, Math.max(0, pageRef.current + dir));
      if (next === pageRef.current) return;
      isChanging.current = true;
      playFlipSound();
      const from = pageRef.current;
      pageRef.current = next;
      setFlip({ dir: dir > 0 ? 'fwd' : 'bwd', from });
      setDisplayPage(next);
      setAnimKey((k) => k + 1);
      setTimeout(() => {
        setFlip(null);
        setTimeout(() => { isChanging.current = false; }, 50);
      }, 800);
    };

    const onWheel = (e: WheelEvent) => { e.preventDefault(); go(e.deltaY > 0 ? 1 : -1); };

    let ty = 0;
    const onTouchStart = (e: TouchEvent) => { ty = e.changedTouches[0].clientY; };
    const onTouchEnd   = (e: TouchEvent) => {
      const d = ty - e.changedTouches[0].clientY;
      if (Math.abs(d) > 40) go(d > 0 ? 1 : -1);
    };

    window.addEventListener('wheel',      onWheel,      { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true  });
    window.addEventListener('touchend',   onTouchEnd,   { passive: true  });
    return () => {
      window.removeEventListener('wheel',      onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend',   onTouchEnd);
    };
  }, []);

  const chapterIndex = CHAPTERS.findIndex((c) => c.pages.includes(displayPage));
  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 3800);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style>{`
        @keyframes bookPageIn {
          from { opacity: 0; transform: translateX(18px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        /* Forward: right page folds to spine */
        @keyframes flipF1 {
          0%   { transform: perspective(1400px) rotateY(0deg); }
          100% { transform: perspective(1400px) rotateY(-90deg); }
        }
        /* Forward: back of page sweeps over left */
        @keyframes flipF2 {
          0%   { transform: perspective(1400px) rotateY(-90deg);  opacity: 1; }
          85%  { transform: perspective(1400px) rotateY(-180deg); opacity: 1; }
          100% { transform: perspective(1400px) rotateY(-180deg); opacity: 0; }
        }
        /* Backward: left page folds to spine */
        @keyframes flipB1 {
          0%   { transform: perspective(1400px) rotateY(0deg); }
          100% { transform: perspective(1400px) rotateY(90deg); }
        }
        /* Backward: back of page sweeps over right */
        @keyframes flipB2 {
          0%   { transform: perspective(1400px) rotateY(90deg);  opacity: 1; }
          85%  { transform: perspective(1400px) rotateY(180deg); opacity: 1; }
          100% { transform: perspective(1400px) rotateY(180deg); opacity: 0; }
        }
        /* Curl shadow intensifies as page folds */
        @keyframes flipShadeIn {
          0%   { opacity: 0; }
          100% { opacity: 1; }
        }
        /* Hint toast */
        @keyframes hintIn {
          from { opacity: 0; transform: translateX(-50%) translateY(12px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes hintOut {
          from { opacity: 1; transform: translateX(-50%) translateY(0); }
          to   { opacity: 0; transform: translateX(-50%) translateY(12px); }
        }
        /* Mobile: 180° forward flip (top-pivot, rotateX) */
        @keyframes mflipF1 {
          0%   { transform: perspective(900px) rotateX(0deg); }
          100% { transform: perspective(900px) rotateX(-90deg); }
        }
        @keyframes mflipF2 {
          0%   { transform: perspective(900px) rotateX(90deg);  opacity: 1; }
          85%  { transform: perspective(900px) rotateX(180deg); opacity: 1; }
          100% { transform: perspective(900px) rotateX(180deg); opacity: 0; }
        }
        /* Mobile: 180° backward flip (bottom-pivot, rotateX) */
        @keyframes mflipB1 {
          0%   { transform: perspective(900px) rotateX(0deg); }
          100% { transform: perspective(900px) rotateX(90deg); }
        }
        @keyframes mflipB2 {
          0%   { transform: perspective(900px) rotateX(-90deg); opacity: 1; }
          85%  { transform: perspective(900px) rotateX(-180deg); opacity: 1; }
          100% { transform: perspective(900px) rotateX(-180deg); opacity: 0; }
        }
        /* Mobile: page-turn fade+slide */
        @keyframes mobileFadeOut {
          from { opacity: 1; transform: translateX(0); }
          to   { opacity: 0; transform: translateX(-16px); }
        }
        @media (max-width: 767px) {
          .step-illustration svg { height: 150px !important; }
        }
      `}</style>

      {/* Hidden audio element — rendered in DOM so browser tracks user-activation */}
      <audio ref={flipAudioRef} src="/BookFlip.mp3" preload="auto" />

      {/* Full-screen fixed canvas — nothing scrolls */}
      <div
        className="fixed inset-0 flex flex-col overflow-hidden"
        style={{
          background: isMobile ? '#f0ddb8' : '#1c1208',
          alignItems: isMobile ? 'stretch' : 'center',
          justifyContent: isMobile ? 'stretch' : 'center',
          paddingTop: isMobile ? 0 : '24px',
          paddingBottom: isMobile ? 0 : '24px',
          paddingLeft: isMobile ? 0 : '16px',
          paddingRight: isMobile ? 0 : '16px',
        }}
      >
        {/* Background texture layers */}
        <div className="absolute inset-0 pointer-events-none">
          {isMobile ? (
            <>
              {/* Parchment paper texture for mobile */}
              <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 140% 50% at 50% 0%, #e8d0a0 0%, transparent 60%)' }} />
              <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 60% at 20% 80%, rgba(180,140,80,0.07) 0%, transparent 55%)' }} />
              <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 50% at 80% 20%, rgba(200,160,90,0.06) 0%, transparent 50%)' }} />
            </>
          ) : (
            <>
              {/* Dark wood texture for desktop */}
              <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 120% 80% at 50% 0%, #2e1e0a 0%, transparent 60%)' }} />
              <div className="absolute top-0 left-0 right-0 h-1/3" style={{ background: 'linear-gradient(to bottom, #251a09, transparent)' }} />
              <div className="absolute top-1/4 left-1/6 w-96 h-96 rounded-full blur-3xl" style={{ background: 'rgba(180,120,40,0.07)' }} />
              <div className="absolute bottom-1/4 right-1/6 w-80 h-80 rounded-full blur-3xl" style={{ background: 'rgba(160,100,30,0.06)' }} />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-75 rounded-full blur-3xl" style={{ background: 'rgba(201,185,154,0.04)' }} />
            </>
          )}
        </div>

        {/* Book */}
        <div
          style={{
          position: 'relative',
            width: '100%',
            flex: isMobile ? '1 1 0' : '0 0 auto',
            minHeight: 0,
            height: isMobile ? undefined : 'auto',
          }}
        >
          {isMobile
            ? <MobileBook currentPage={displayPage} animKey={animKey} isSignedIn={isSignedIn} flip={flip} />
            : <OpenBook currentPage={displayPage} animKey={animKey} isSignedIn={isSignedIn} flip={flip} />
          }
        </div>

        {/* Chapter dots */}
        <div
          className="relative flex-none flex items-center justify-center gap-2"
          style={{ padding: isMobile ? '8px 16px 10px' : '12px 0 0 0' }}
        >
          {CHAPTERS.map((ch, i) => {
            const isActive = i === chapterIndex;
            const isPast   = i < chapterIndex;
            return (
              <div
                key={ch.title}
                className="rounded-full transition-all duration-500"
                style={{
                  width:  isActive ? 22 : 7,
                  height: 7,
                  background: isMobile
                    ? (isPast ? '#b8956a' : isActive ? '#8b6040' : 'rgba(139,96,64,0.2)')
                    : (isPast ? '#a08060' : isActive ? '#c9b99a' : 'rgba(201,185,154,0.25)'),
                }}
              />
            );
          })}
        </div>

        <p className="relative flex-none text-[9px] select-none"
          style={{
            color: isMobile ? 'rgba(139,96,64,0.45)' : 'rgba(201,185,154,0.3)',
            textAlign: 'center',
            padding: isMobile ? '0 0 6px 0' : '4px 0 0 0',
          }}>
          page {displayPage + 1} of {TOTAL_PAGES}
        </p>
      </div>

      {/* Hint toast — fades in on load, fades out after 3.2s */}
      {showHint && (
        <div
          style={{
            position: 'fixed',
            bottom: 68,
            left: '50%',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '9px 20px',
            borderRadius: 999,
            background: isMobile ? 'rgba(92,60,28,0.88)' : 'rgba(28,18,8,0.72)',
            border: `1px solid ${isMobile ? 'rgba(184,149,106,0.4)' : 'rgba(201,185,154,0.28)'}`,
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            boxShadow: '0 4px 28px rgba(0,0,0,0.32)',
            animation: 'hintIn 0.5s ease forwards, hintOut 0.6s ease 3.2s forwards',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke={isMobile ? '#f5e6c8' : '#c9b99a'} strokeWidth="2.2"
            strokeLinecap="round" strokeLinejoin="round"
          >
            {isMobile ? (
              <>
                <polyline points="18 15 12 9 6 15" />
                <polyline points="18 21 12 15 6 21" />
              </>
            ) : (
              <>
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="13 18 19 12 13 6" />
              </>
            )}
          </svg>
          <span style={{
            fontSize: 11, fontWeight: 600,
            letterSpacing: '0.07em', fontFamily: 'sans-serif',
            color: isMobile ? '#f5e6c8' : '#c9b99a',
          }}>
            {isMobile ? 'Swipe up / down to turn pages' : 'Scroll to turn pages'}
          </span>
        </div>
      )}
    </>
  );
}
