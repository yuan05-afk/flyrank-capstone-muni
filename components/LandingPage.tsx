"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { BrandLockup, BrandMark } from "@/components/BrandMark";
import { ContactSection } from "@/components/ContactSection";
import { HeroAnswerCard } from "@/components/HeroAnswerCard";
import { MarqueeBand } from "@/components/MarqueeBand";
import { MuniMascot } from "@/components/MuniMascot";
import { MotifArrow, MotifCards, MotifCite, MotifGuard } from "@/components/Motifs";
import { SiteHeader } from "@/components/SiteHeader";
import { useLenis } from "@/hooks/useLenis";

const features = [
  {
    Icon: MotifCards,
    title: "Verified cards",
    copy: "Bio, projects, skills, and FAQ live as editable knowledge cards, not prompt folklore.",
  },
  {
    Icon: MotifCite,
    title: "Cited answers",
    copy: "Every grounded reply maps claims back to retrieved cards with source chips.",
  },
  {
    Icon: MotifGuard,
    title: "Grounding Guard",
    copy: "Weak similarity, missing citations, or low confidence triggers an honest refusal.",
  },
];

export function LandingPage() {
  useLenis();
  const reduce = useReducedMotion();
  const enter = reduce ? {} : { opacity: 0, y: 22, filter: "blur(8px)" };
  const spring = { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <main className="hero-mesh">
      <SiteHeader
        links={[
          { href: "#contact", label: "Contact" },
          { href: "/login", label: "Owner desk" },
          { href: "/chat", label: "Chat with Muni", primary: true },
        ]}
      />

      <section className="hero-stage">
        <div className="hero-grid">
          <motion.aside
            className="hero-side hero-side--left"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.12 }}
          >
            <div className="surface muni-hello-card h-full">
              <MuniMascot state="wave" className="muni-hello-mascot" />
              <div className="muni-hello-copy">
                <span className="muni-hello-kicker">
                  <span className="muni-hello-dot" aria-hidden="true" />
                  Kumusta!
                </span>
                <p>
                  I&apos;m Muni. Ask me about Yuan&apos;s work, and I&apos;ll answer
                  from verified sources.
                </p>
                <Link href="/chat" className="muni-hello-link focus-ring">
                  Come say hello <MotifArrow className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </motion.aside>

          <div className="hero-safe">
            <motion.div
              initial={enter}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={spring}
              className="eyebrow mx-auto"
            >
              <span className="muni-dot" /> Personal AI with a grounding guard
            </motion.div>
            <motion.h1
              initial={enter}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ ...spring, delay: 0.08 }}
              className="hero-title font-display"
            >
              Meet <span className="text-muni">Muni</span>. The personal AI that only speaks from verified knowledge.
            </motion.h1>
            <motion.p
              initial={enter}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ ...spring, delay: 0.16 }}
              className="hero-lead mx-auto mt-5 max-w-xl text-muted"
            >
              Muni comes from Filipino &quot;muni-muni,&quot; thoughtful reflection. It retrieves Yuan&apos;s knowledge cards, cites every claim, and refuses when evidence is missing.
            </motion.p>
            <motion.div
              initial={enter}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ ...spring, delay: 0.22 }}
              className="hero-cta mt-6 flex flex-wrap justify-center gap-3"
            >
              <Link href="/chat" className="btn-primary">
                Talk to Muni <MotifArrow />
              </Link>
              <a href="#guard" className="btn-secondary">
                See the guard
              </a>
            </motion.div>
            <motion.div
              className="grounding-strip"
              aria-label="Example grounding decision"
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.3 }}
            >
              <span className="match-token">q: What is Lens?</span>
              <span className="text-muted">
                <MotifArrow className="h-3.5 w-3.5" />
              </span>
              <span className="match-token good">cited · grounded</span>
              <span className="match-token bad">salary? refused</span>
            </motion.div>
          </div>

          <motion.aside
            className="hero-side hero-side--right"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.18 }}
          >
            <HeroAnswerCard />
          </motion.aside>
        </div>
      </section>

      <MarqueeBand />

      <section className="chapter">
        <div className="chapter-head">
          <span className="eyebrow">
            <span className="muni-dot" /> Retrieve, ground, refuse
          </span>
          <h2>Think first. Speak only when grounded.</h2>
          <p className="text-muted">
            Muni is Yuan&apos;s personal brand site and digital twin. The hard part is not answering. It is knowing when not to.
          </p>
        </div>
        <div className="grid-3">
          {features.map(({ Icon, title, copy }, index) => (
            <motion.article
              key={title}
              whileInView={{ opacity: 1, y: 0 }}
              initial={reduce ? false : { opacity: 0, y: 22 }}
              transition={{ delay: index * 0.06, duration: 0.45 }}
              viewport={{ once: true, margin: "-40px" }}
              whileHover={reduce ? undefined : { y: -5 }}
              tabIndex={0}
              className="surface feature-card"
            >
              <div className="motif-well">
                <Icon />
              </div>
              <strong>{title}</strong>
              <p className="text-sm leading-relaxed text-muted">{copy}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section id="guard" className="chapter">
        <div className="chapter-head">
          <span className="eyebrow">
            <span className="muni-dot" /> Grounding Guard
          </span>
          <h2>The best retrieval can still be wrong.</h2>
          <p className="text-muted">
            Muni refuses to invent credentials. Out-of-scope questions get humility, not hallucination.
          </p>
        </div>
        <div className="grid-2">
          <motion.article
            whileInView={{ opacity: 1, y: 0 }}
            initial={reduce ? false : { opacity: 0, y: 18 }}
            viewport={{ once: true }}
            whileHover={reduce ? undefined : { y: -4 }}
            className="surface feature-card"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <span className="mono text-[10px] uppercase tracking-widest text-muted">in scope</span>
                <h3 className="font-display text-xl font-semibold sm:text-2xl">Cited answer</h3>
              </div>
              <span className="badge badge-ok">grounded</span>
            </div>
            <MuniMascot state="answering" className="mx-auto h-28 w-28" />
            <p className="mt-4 text-sm text-muted">
              Suggested: Lens tags images and refuses wrong pairings with a mismatch guard.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="tag-chip">Lens image relevance</span>
              <span className="badge badge-ok">cited</span>
            </div>
          </motion.article>
          <motion.article
            whileInView={{ opacity: 1, y: 0 }}
            initial={reduce ? false : { opacity: 0, y: 18 }}
            viewport={{ once: true }}
            whileHover={reduce ? undefined : { y: -4 }}
            className="surface feature-card"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <span className="mono text-[10px] uppercase tracking-widest text-muted">out of scope</span>
                <h3 className="font-display text-xl font-semibold sm:text-2xl">Honest refuse</h3>
              </div>
              <span className="badge badge-danger">refused</span>
            </div>
            <MuniMascot state="grounded-refuse" className="mx-auto h-28 w-28" />
            <p className="mt-4 text-sm text-muted">
              Refused: I do not have verified knowledge for secret salary details.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="badge badge-danger">guarded</span>
              <span className="tag-chip">similarity below floor</span>
            </div>
          </motion.article>
        </div>
      </section>

      <section className="chapter">
        <div className="grid-3">
          {[
            ["10", "verified knowledge cards"],
            ["4", "live Capstone demos"],
            ["0.80+", "eval floors"],
          ].map(([v, l], index) => (
            <motion.div
              key={l}
              tabIndex={0}
              className="surface feature-card text-center"
              whileInView={{ opacity: 1, y: 0 }}
              initial={reduce ? false : { opacity: 0, y: 16 }}
              transition={{ delay: index * 0.05 }}
              viewport={{ once: true }}
            >
              <b className="font-display text-4xl text-muni">{v}</b>
              <p className="mono mt-2 text-[10px] uppercase tracking-widest text-muted">{l}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <ContactSection />

      <section className="chapter">
        <motion.div
          className="surface flex flex-col items-center p-8 text-center sm:p-16"
          whileInView={{ opacity: 1, scale: 1 }}
          initial={reduce ? false : { opacity: 0, scale: 0.98 }}
          viewport={{ once: true }}
        >
          <BrandMark className="h-12 w-12" />
          <h2 className="!mb-2">Put every claim in focus.</h2>
          <p className="max-w-xl text-muted">
            Ask about Lens, refuse a fantasy question, then open the owner inbox to see grounded vs guarded and knowledge gaps.
          </p>
          <Link href="/chat" className="btn-primary mt-6">
            Open Muni <MotifArrow />
          </Link>
        </motion.div>
      </section>

      <footer className="border-t border-line py-8">
        <div className="footer-row mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-5">
          <BrandLockup />
          <span className="mono text-[10px] text-muted">General AI Fluency · Week 6 · Impact Project</span>
        </div>
      </footer>
    </main>
  );
}
