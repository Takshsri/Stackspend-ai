"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  BadgeDollarSign,
  Sparkles,
  TrendingDown,
  ArrowRight,
  Zap,
  Shield,
  BarChart3,
  ChevronRight,
} from "lucide-react";

// ─── ANIMATED COUNTER ────────────────────────────────────────────────────────

function Counter({ to, prefix = "", suffix = "" }: { to: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1800;
    const step = 16;
    const increment = to / (duration / step);
    const timer = setInterval(() => {
      start += increment;
      if (start >= to) {
        setCount(to);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, step);
    return () => clearInterval(timer);
  }, [inView, to]);

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

// ─── TICKER ──────────────────────────────────────────────────────────────────

const TOOLS = ["Cursor", "Claude", "ChatGPT", "GitHub Copilot", "Gemini", "Windsurf", "OpenAI API", "Anthropic API"];

function ToolTicker() {
  return (
    <div className="relative overflow-hidden py-3" style={{ maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }}>
      <motion.div
        className="flex gap-6 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      >
        {[...TOOLS, ...TOOLS].map((tool, i) => (
          <span key={i} className="text-zinc-600 text-sm font-medium px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/50">
            {tool}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ─── FEATURE CARD ────────────────────────────────────────────────────────────

function FeatureCard({
  icon, title, description, delay, accent,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
  accent: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className="group relative rounded-2xl border border-zinc-800 bg-zinc-900 p-6 overflow-hidden hover:border-zinc-700 transition-all duration-300"
    >
      {/* Accent glow on hover */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${accent} blur-3xl scale-75`} />

      <div className="relative z-10">
        <div className="mb-5 w-11 h-11 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
        <p className="text-zinc-500 text-sm leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

// ─── STAT PILL ────────────────────────────────────────────────────────────────

function StatPill({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 px-6 py-4 rounded-2xl border border-zinc-800 bg-zinc-900/60">
      <span className="text-white font-bold text-2xl">{value}</span>
      <span className="text-zinc-500 text-xs">{label}</span>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-300 overflow-x-hidden">

      {/* ── BACKGROUND TEXTURE ── */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-green-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-500/5 blur-[100px] rounded-full" />
        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.02]"
          style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "60px 60px" }}
        />
      </div>

      {/* ── NAVBAR ── */}
      <nav className="relative z-20 border-b border-zinc-800/60 backdrop-blur-sm bg-zinc-950/80 sticky top-0">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
              <BarChart3 size={16} className="text-black" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">StackAudit</span>
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm text-zinc-500">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
            <a href="#stats" className="hover:text-white transition-colors">Results</a>
          </div>

          <Link href="/audit">
            <button className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full font-semibold text-sm hover:bg-zinc-100 transition-all">
              Start free audit
              <ChevronRight size={14} />
            </button>
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-16">
        <div className="max-w-4xl mx-auto text-center">

          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 text-xs font-medium mb-8"
          >
            <Zap size={11} />
            Free AI spend audit 
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold text-white leading-[1.05] tracking-tight mb-6"
          >
            Stop burning money
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">
              on AI tools
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Audit your startup's AI stack in 60 seconds. Find out where you're overspending across ChatGPT, Claude, Cursor, Gemini, Copilot, and more — then get a shareable savings report.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex items-center justify-center gap-4 flex-wrap"
          >
            <Link href="/login">
              <button className="flex items-center gap-2 bg-white text-black px-7 py-3.5 rounded-full font-bold text-base hover:bg-zinc-100 transition-all shadow-lg shadow-white/10 hover:shadow-white/20 hover:scale-[1.02]">
                Audit my stack — it's free
                <ArrowRight size={16} />
              </button>
            </Link>
            <Link href="/dashboard">
              <button className="flex items-center gap-2 border border-zinc-700 text-zinc-300 px-7 py-3.5 rounded-full font-medium text-base hover:border-zinc-500 hover:text-white transition-all">
                View dashboard
              </button>
            </Link>
          </motion.div>

          {/* Trust line */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-5 text-zinc-600 text-xs flex items-center justify-center gap-1.5"
          >
            <Shield size={11} />
            Results in 60 seconds · Share with your team
          </motion.p>
        </div>

        {/* Tool ticker */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-16 max-w-2xl mx-auto"
        >
          <p className="text-center text-zinc-600 text-xs mb-3 uppercase tracking-widest">Supports</p>
          <ToolTicker />
        </motion.div>
      </section>

      {/* ── STATS ── */}
      <section id="stats" className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <StatPill
            value={<Counter to={2400} prefix="$" suffix="/yr" />}
            label="avg savings found"
          />
          <StatPill
            value={<Counter to={9} />}
            label="AI tools audited"
          />
          <StatPill
            value={<Counter to={60} suffix="s" />}
            label="to complete audit"
          />
          <StatPill
            value={<><Counter to={100} />%</>}
            label="free, always"
          />
        </motion.div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-zinc-500 text-sm uppercase tracking-widest mb-3">How it works</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white">Three steps to savings</h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-8 left-[33%] right-[33%] h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />

          {[
            {
              step: "01",
              title: "Enter your stack",
              desc: "Add each AI tool you pay for — plan, seats, and monthly spend. Takes under a minute.",
              color: "text-green-400",
            },
            {
              step: "02",
              title: "Get your audit",
              desc: "Our engine checks every tool against current pricing and flags overspending instantly.",
              color: "text-blue-400",
            },
            {
              step: "03",
              title: "Share & save",
              desc: "Get a shareable link with your savings report. High-spend teams get connected to Credex credits.",
              color: "text-indigo-400",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-center"
            >
              <div className={`text-4xl font-black mb-4 ${item.color} opacity-40`}>{item.step}</div>
              <h3 className="text-white font-semibold text-lg mb-2">{item.title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-zinc-500 text-sm uppercase tracking-widest mb-3">Features</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Everything you need to optimize
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4">
          <FeatureCard
            delay={0}
            icon={<BadgeDollarSign size={20} />}
            title="Detect Overspending"
            description="Identify overpriced plans and unnecessary subscriptions. See exactly which tools are draining your budget and why."
            accent="bg-green-500/10"
          />
          <FeatureCard
            delay={0.1}
            icon={<TrendingDown size={20} />}
            title="Compare Alternatives"
            description="Discover lower-cost tools and optimized plans tailored to your team size, use case, and workflow."
            accent="bg-blue-500/10"
          />
          <FeatureCard
            delay={0.2}
            icon={<Sparkles size={20} />}
            title="AI-Powered Summary"
            description="Get a personalized savings summary generated by Claude, with specific recommendations for your exact stack."
            accent="bg-indigo-500/10"
          />
        </div>
      </section>

      {/* ── CREDEX CTA ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/50 to-zinc-900 p-10 md:p-14 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-indigo-500/5 blur-3xl" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-medium mb-6">
              <BadgeDollarSign size={11} />
              Powered by Credex
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Saving $500+/mo on AI tools?
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto mb-8 leading-relaxed">
              Credex sells discounted AI infrastructure credits — Cursor, Claude, ChatGPT Enterprise — sourced from companies that overforecast. Teams saving $500+/mo on plan switches can often save an additional 20–40% with credits.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link href="/login">
                <button className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-bold text-sm hover:bg-zinc-100 transition-all">
                  Start your audit
                  <ArrowRight size={14} />
                </button>
              </Link>
              <a
                href="https://credex.rocks"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 border border-indigo-500/40 text-indigo-400 hover:border-indigo-400 px-6 py-3 rounded-full font-medium text-sm transition-all"
              >
                Learn about Credex
                <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 border-t border-zinc-800 mt-8">
        <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between flex-wrap gap-4 text-xs text-zinc-600">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-white flex items-center justify-center">
              <BarChart3 size={12} className="text-black" />
            </div>
            <span>StackAudit by Credex</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="https://credex.rocks" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-400 transition-colors">credex.rocks</a>
            <Link href="/login" className="hover:text-zinc-400 transition-colors">Run audit</Link>
            <Link href="/dashboard" className="hover:text-zinc-400 transition-colors">Dashboard</Link>
          </div>
        </div>
      </footer>

    </main>
  );
}