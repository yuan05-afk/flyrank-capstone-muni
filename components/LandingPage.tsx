"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { BookOpenCheck, ShieldCheck, Sparkles, ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { BrandLockup, BrandMark } from "@/components/BrandMark";
import { MuniMascot } from "@/components/MuniMascot";
import { useLenis } from "@/hooks/useLenis";

const tags = [
  "kind:bio",
  "kind:project",
  "citation:lens",
  "status:grounded",
  "status:refused",
  "muni-muni",
  "policy:v1",
  "seed provider",
  "gemini optional",
];

export function LandingPage() {
  useLenis();
  const reduce = useReducedMotion();
  const enter = reduce ? {} : { opacity: 0, y: 20, filter: "blur(8px)" };

  return (
    <main className="hero-mesh">
      <header className="sticky top-0 z-40 border-b border-line/80 bg-canvas/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
          <BrandLockup />
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-secondary !min-h-9 !py-1.5">Owner desk</Link>
            <Link href="/chat" className="btn-primary !min-h-9 !py-1.5">Chat with Muni</Link>
          </div>
        </div>
      </header>

      <section className="hero-stage">
        <div className="companion left" aria-hidden="true">
          <div className="surface flex h-full items-center justify-center p-4">
            <MuniMascot state="wave" className="h-40 w-40" />
          </div>
        </div>
        <div className="companion right" aria-hidden="true">
          <div className="surface cite-stack h-full">
            <span className="badge badge-ok">grounded</span>
            <div className="tag-chip">source: About Yuan</div>
            <div className="tag-chip">source: Lens image relevance</div>
            <span className="badge badge-danger mt-auto">refused out-of-scope</span>
          </div>
        </div>
        <div className="hero-wash" />
        <div className="hero-safe">
          <motion.div initial={enter} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.7 }} className="eyebrow mx-auto">
            <span className="muni-dot" /> Personal AI with a grounding guard
          </motion.div>
          <motion.h1 initial={enter} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.75, delay: 0.08 }} className="font-display mt-5 text-balance text-5xl font-bold leading-[.98] tracking-[-.05em] sm:text-7xl">
            Meet <span className="text-muni">Muni</span>. The personal AI that only speaks from verified knowledge.
          </motion.h1>
          <motion.p initial={enter} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.75, delay: 0.16 }} className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted">
            Muni comes from Filipino &quot;muni-muni,&quot; thoughtful reflection. It retrieves Yuan&apos;s knowledge cards, cites every claim, and refuses when evidence is missing.
          </motion.p>
          <motion.div initial={enter} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.75, delay: 0.22 }} className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/chat" className="btn-primary">Talk to Muni <ArrowRight size={16} /></Link>
            <a href="#guard" className="btn-secondary">See the guard</a>
          </motion.div>
          <div className="grounding-strip" aria-label="Example grounding decision">
            <span className="match-token">q: What is Lens?</span>
            <ArrowRight size={14} className="text-muted" />
            <span className="match-token good">cited · grounded</span>
            <span className="match-token bad">salary? refused</span>
          </div>
        </div>
      </section>

      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[...tags, ...tags].map((tag, i) => (
            <span key={`${tag}-${i}`} className="tag-chip">{tag}</span>
          ))}
        </div>
      </div>

      <section className="chapter">
        <div className="chapter-head">
          <span className="eyebrow"><Sparkles size={13} /> Retrieve, ground, refuse</span>
          <h2>Think first. Speak only when grounded.</h2>
          <p className="text-muted">Muni is Yuan&apos;s personal brand site and digital twin. The hard part is not answering. It is knowing when not to.</p>
        </div>
        <div className="grid-3">
          {[
            [BookOpenCheck, "Verified cards", "Bio, projects, skills, and FAQ live as editable knowledge cards, not prompt folklore."],
            [Sparkles, "Cited answers", "Every grounded reply maps claims back to retrieved cards with source chips."],
            [ShieldCheck, "Grounding Guard", "Weak similarity, missing citations, or low confidence triggers an honest refusal."],
          ].map(([Icon, title, copy]) => {
            const C = Icon as typeof Sparkles;
            return (
              <motion.article key={String(title)} whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 18 }} viewport={{ once: true }} tabIndex={0} className="surface feature-card">
                <C size={25} className="text-muni" />
                <strong>{String(title)}</strong>
                <p className="text-sm leading-relaxed text-muted">{String(copy)}</p>
              </motion.article>
            );
          })}
        </div>
      </section>

      <section id="guard" className="chapter">
        <div className="chapter-head">
          <span className="eyebrow"><ShieldCheck size={13} /> Grounding Guard</span>
          <h2>The best retrieval can still be wrong.</h2>
          <p className="text-muted">Muni refuses to invent credentials. Out-of-scope questions get humility, not hallucination.</p>
        </div>
        <div className="grid-2">
          <motion.article whileHover={{ y: -4 }} className="surface feature-card">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <span className="mono text-[10px] uppercase tracking-widest text-muted">in scope</span>
                <h3 className="font-display text-2xl font-semibold">Cited answer</h3>
              </div>
              <CheckCircle2 className="text-ok" />
            </div>
            <MuniMascot state="answering" className="mx-auto h-28 w-28" />
            <p className="mt-4 text-sm text-muted">Suggested: Lens tags images and refuses wrong pairings with a mismatch guard.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="tag-chip">Lens image relevance</span>
              <span className="badge badge-ok">grounded</span>
            </div>
          </motion.article>
          <motion.article whileHover={{ y: -4 }} className="surface feature-card">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <span className="mono text-[10px] uppercase tracking-widest text-muted">out of scope</span>
                <h3 className="font-display text-2xl font-semibold">Honest refuse</h3>
              </div>
              <XCircle className="text-danger" />
            </div>
            <MuniMascot state="grounded-refuse" className="mx-auto h-28 w-28" />
            <p className="mt-4 text-sm text-muted">Refused: I do not have verified knowledge for secret salary details.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="badge badge-danger">refused</span>
              <span className="tag-chip">similarity below floor</span>
            </div>
          </motion.article>
        </div>
      </section>

      <section className="chapter">
        <div className="grid-3">
          {[
            ["9", "seed knowledge cards"],
            ["0.80+", "eval floors"],
            ["$0.00", "seed provider cost"],
          ].map(([v, l]) => (
            <div key={l} tabIndex={0} className="surface feature-card text-center">
              <b className="font-display text-4xl text-muni">{v}</b>
              <p className="mono mt-2 text-[10px] uppercase tracking-widest text-muted">{l}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="chapter">
        <div className="surface flex flex-col items-center p-10 text-center sm:p-16">
          <BrandMark className="h-12 w-12" />
          <h2 className="!mb-2">Put every claim in focus.</h2>
          <p className="max-w-xl text-muted">Ask about Lens, refuse a fantasy question, then open the owner inbox to see grounded vs guarded and knowledge gaps.</p>
          <Link href="/chat" className="btn-primary mt-6">Open Muni <ArrowRight size={16} /></Link>
        </div>
      </section>

      <footer className="border-t border-line py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5">
          <BrandLockup />
          <span className="mono text-[10px] text-muted">General AI Fluency · Week 6 · Impact Project</span>
        </div>
      </footer>
    </main>
  );
}
