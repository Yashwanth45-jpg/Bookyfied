'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles, BookOpen, Brain, Mic, Search, History, Zap, Check, Star } from 'lucide-react';
import { SignUpButton } from '@clerk/nextjs';

// ─── Hero Section ─────────────────────────────────────────────────────────────
export const HeroSection = ({ isSignedIn }: { isSignedIn: boolean }) => (
  <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
    <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
    <div className="max-w-7xl mx-auto px-5 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-20">
      <div className="space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-400/30 bg-blue-400/10 text-blue-300 text-sm">
          <Sparkles className="w-3.5 h-3.5" />
          AI-Powered Book Intelligence
        </div>
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold font-serif leading-[1.05] tracking-tight">
          Talk to<br />
          <span className="bg-linear-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Your Books.
          </span>
        </h1>
        <p className="text-lg sm:text-xl text-gray-400 leading-relaxed max-w-lg">
          Upload any book and chat with an AI that understands every page.
          Bookyfied turns books into interactive knowledge — instantly.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          {isSignedIn ? (
            <Link href="/library"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg transition-all hover:scale-105">
              Open Library <ArrowRight className="w-5 h-5" />
            </Link>
          ) : (
            <SignUpButton mode="modal">
              <button className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg transition-all hover:scale-105">
                Get Started Free <ArrowRight className="w-5 h-5" />
              </button>
            </SignUpButton>
          )}
        </div>
        <div className="flex items-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-400" />No credit card required</div>
          <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-400" />Free tier available</div>
        </div>
      </div>
    </div>
  </section>
);

// ─── Features Section ─────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: BookOpen,
    accent: '#60a5fa',
    title: 'Instant PDF Processing',
    description: 'Drop any PDF and Bookyfied processes it in seconds — every chapter, insight, and idea ready to explore.',
  },
  {
    icon: Brain,
    accent: '#a78bfa',
    title: 'Deep AI Comprehension',
    description: 'Our AI understands themes, characters, arguments, and nuance — not just keywords, but the full meaning.',
  },
  {
    icon: Mic,
    accent: '#34d399',
    title: 'Natural Voice Chat',
    description: 'Have a real conversation with your book. Ask questions, request summaries, or debate ideas out loud.',
  },
  {
    icon: Search,
    accent: '#f59e0b',
    title: 'Smart Search',
    description: 'Find any concept, quote, or idea across your entire library instantly, no matter how you phrase it.',
  },
  {
    icon: History,
    accent: '#f472b6',
    title: 'Session History',
    description: 'Every conversation is saved. Pick up where you left off and build deeper understanding over time.',
  },
  {
    icon: Zap,
    accent: '#38bdf8',
    title: 'Lightning Fast',
    description: 'Responses in under a second. No waiting — just continuous, flowing conversation with your books.',
  },
];

export const FeaturesSection = () => (
  <section id="features" className="py-24 relative">
    <div className="absolute top-1/3 right-0 w-96 h-96 bg-purple-600/8 rounded-full blur-3xl pointer-events-none" />
    <div className="max-w-7xl mx-auto px-5">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-400/30 bg-purple-400/10 text-purple-300 text-sm mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          Everything you need
        </div>
        <h2 className="text-4xl sm:text-5xl font-bold font-serif text-white mb-4">
          Packed with powerful features
        </h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Bookyfied combines cutting-edge AI with a beautifully simple interface so you can focus on learning.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEATURES.map(({ icon: Icon, accent, title, description }) => (
          <div
            key={title}
            className="group relative p-6 rounded-2xl border border-white/5 bg-white/3 hover:bg-white/6 transition-all duration-300 hover:border-white/10"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
              style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}
            >
              <Icon className="w-5 h-5" style={{ color: accent }} />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ─── Testimonials Section ─────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    quote: "I used to take notes for hours after reading. Now I just ask Bookyfied. It's like having a study partner who's read everything.",
    author: 'Sarah K.',
    role: 'PhD Student, Literature',
    accent: '#60a5fa',
    stars: 5,
  },
  {
    quote: "The voice chat feature is mind-blowing. I drove to work while having a deep conversation about Atomic Habits. Changed how I commute.",
    author: 'Marcus T.',
    role: 'Product Manager',
    accent: '#a78bfa',
    stars: 5,
  },
  {
    quote: "I uploaded a dense finance textbook at 11pm and was quizzing the AI on derivatives by midnight. Incredible tool.",
    author: 'Priya R.',
    role: 'Finance Analyst',
    accent: '#34d399',
    stars: 5,
  },
];

export const TestimonialsSection = () => (
  <section className="py-24 relative">
    <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-blue-600/8 rounded-full blur-3xl pointer-events-none" />
    <div className="max-w-7xl mx-auto px-5">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-300 text-sm mb-4">
          <Star className="w-3.5 h-3.5 fill-amber-300" />
          Loved by readers
        </div>
        <h2 className="text-4xl sm:text-5xl font-bold font-serif text-white mb-4">
          What our readers say
        </h2>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          Thousands of readers use Bookyfied every day to get more from every book they open.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TESTIMONIALS.map(({ quote, author, role, accent, stars }) => (
          <div
            key={author}
            className="p-7 rounded-2xl border border-white/5 bg-white/3 flex flex-col gap-4"
          >
            <div className="flex gap-1">
              {Array.from({ length: stars }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-gray-300 leading-relaxed text-sm flex-1">&ldquo;{quote}&rdquo;</p>
            <div className="flex items-center gap-3 pt-2 border-t border-white/5">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{ background: `${accent}22`, color: accent }}
              >
                {author[0]}
              </div>
              <div>
                <p className="text-white text-sm font-semibold">{author}</p>
                <p className="text-gray-500 text-xs">{role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ─── Pricing Section ──────────────────────────────────────────────────────────
const PRICING_PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for trying out Bookyfied.',
    accent: '#60a5fa',
    features: [
      '1 book in your library',
      '5 voice sessions / month',
      '5 minutes per session',
      'Core AI chat features',
    ],
    cta: 'Get Started Free',
    popular: false,
  },
  {
    name: 'Standard',
    price: '$9',
    period: '/ month',
    description: 'For avid readers who want more.',
    accent: '#a78bfa',
    features: [
      '10 books in your library',
      '100 voice sessions / month',
      '15 minutes per session',
      'Session history',
      'Priority support',
    ],
    cta: 'Start Standard',
    popular: true,
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/ month',
    description: 'Unlimited reading, unlimited insight.',
    accent: '#34d399',
    features: [
      '100 books in your library',
      'Unlimited voice sessions',
      '60 minutes per session',
      'Full session history',
      'Early access to new features',
      'Priority support',
    ],
    cta: 'Go Pro',
    popular: false,
  },
];

export const PricingSection = ({ isSignedIn }: { isSignedIn: boolean }) => (
  <section id="pricing" className="py-28 relative">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
    <div className="max-w-7xl mx-auto px-5 relative">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-green-400/30 bg-green-400/10 text-green-300 text-sm mb-4">
          <Zap className="w-3.5 h-3.5" />
          Simple pricing
        </div>
        <h2 className="text-4xl sm:text-5xl font-bold font-serif text-white mb-4">
          Start free, scale as you grow
        </h2>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          No hidden fees. Cancel anytime. Pick the plan that fits your reading habit.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {PRICING_PLANS.map(({ name, price, period, description, accent, features, cta, popular }) => (
          <div
            key={name}
            className={`relative p-8 rounded-2xl border transition-all duration-300 ${
              popular
                ? 'border-purple-400/40 bg-purple-400/5 scale-[1.03]'
                : 'border-white/5 bg-white/3 hover:bg-white/5'
            }`}
          >
            {popular && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-purple-600 text-white text-xs font-bold tracking-wide whitespace-nowrap">
                Most Popular
              </div>
            )}
            <div className="mb-6">
              <p className="text-sm font-semibold mb-1" style={{ color: accent }}>{name}</p>
              <div className="flex items-end gap-1 mb-2">
                <span className="text-4xl font-bold text-white">{price}</span>
                <span className="text-gray-500 text-sm mb-1">{period}</span>
              </div>
              <p className="text-gray-400 text-sm">{description}</p>
            </div>
            <ul className="space-y-3 mb-8">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-gray-300">
                  <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: accent }} />
                  {f}
                </li>
              ))}
            </ul>
            {isSignedIn ? (
              <Link
                href="/subscriptions"
                className="block text-center py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-200 hover:opacity-90"
                style={popular
                  ? { background: accent, color: '#0e0b05' }
                  : { border: `1px solid ${accent}50`, color: accent }}
              >
                {cta}
              </Link>
            ) : (
              <SignUpButton mode="modal">
                <button
                  className="w-full py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-200 hover:opacity-90"
                  style={popular
                    ? { background: accent, color: '#0e0b05' }
                    : { border: `1px solid ${accent}50`, color: accent }}
                >
                  {cta}
                </button>
              </SignUpButton>
            )}
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ─── Footer Section ───────────────────────────────────────────────────────────
export const FooterSection = () => (
  <footer className="border-t border-white/5 py-16">
    <div className="max-w-7xl mx-auto px-5">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <span className="font-bold text-lg font-serif text-white">Bookyfied</span>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
            Transform your books into interactive AI conversations. Upload, explore, and truly
            understand every book in your library.
          </p>
        </div>
        <div>
          <p className="text-white text-sm font-semibold mb-4">Product</p>
          <ul className="space-y-3 text-sm text-gray-500">
            <li><Link href="/library" className="hover:text-white transition-colors">Library</Link></li>
            <li><Link href="/books/new" className="hover:text-white transition-colors">Add a Book</Link></li>
            <li><Link href="/subscriptions" className="hover:text-white transition-colors">Pricing</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-white text-sm font-semibold mb-4">Company</p>
          <ul className="space-y-3 text-sm text-gray-500">
            <li><span className="cursor-default">About</span></li>
            <li><span className="cursor-default">Privacy Policy</span></li>
            <li><span className="cursor-default">Terms of Service</span></li>
          </ul>
        </div>
      </div>
      <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-gray-600 text-sm">© 2026 Bookyfied. All rights reserved.</p>
        <p className="text-gray-600 text-sm">Made for book lovers everywhere.</p>
      </div>
    </div>
  </footer>
);
