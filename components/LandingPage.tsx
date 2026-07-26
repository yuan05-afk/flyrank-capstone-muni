"use client";

import type { MouseEvent as ReactMouseEvent } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BrandLockup, BrandMark } from "@/components/BrandMark";
import { ContactSection } from "@/components/ContactSection";
import { HeroAnswerCard } from "@/components/HeroAnswerCard";
import { MarqueeBand } from "@/components/MarqueeBand";
import { MuniMascot } from "@/components/MuniMascot";
import { MotifArrow, MotifCards, MotifCite, MotifGuard } from "@/components/Motifs";
import { ScrollChapter } from "@/components/ScrollChapter";
import { SiteHeader } from "@/components/SiteHeader";
import { useHeroMode } from "@/hooks/useHeroMode";
import { scrollToTop, useLenis } from "@/hooks/useLenis";

const EASE = [0.22, 1, 0.36, 1] as const;

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

/** Replays on scroll up and down (CheckMyDevice once:false). Transform-only for speed. */
const viewIn = {
  once: false as const,
  amount: 0.22,
  margin: "-40px 0px" as const,
};

function HelloCard({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`surface muni-hello-card ${compact ? "muni-hello-card--compact" : ""}`}>
      <MuniMascot state="wave" className="muni-hello-mascot" />
      <div className="muni-hello-copy">
        <span className="muni-hello-kicker">
          <span className="muni-hello-dot" aria-hidden="true" />
          Kumusta!
        </span>
        <p>
          I&apos;m Muni. Ask me about Yuan&apos;s work, and I&apos;ll answer from verified sources.
        </p>
        <Link href="/chat" className="muni-hello-link focus-ring">
          Come say hello <MotifArrow className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

export function LandingPage() {
  const lenisRef = useLenis();
  const reduce = useReducedMotion();
  const { mode, exiting, showFlank, flankActive } = useHeroMode(1280);
  // Blur only on first hero paint (one-shot). Scroll chapters stay transform-only.
  const enter = reduce ? {} : { opacity: 0, y: 22, filter: "blur(8px)" };
  const spring = { duration: 0.7, ease: EASE };
  const sideMotion = {
    duration: reduce ? 0.01 : 0.42,
    ease: EASE,
  };

  function handleBrandClick(event: ReactMouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    scrollToTop(lenisRef.current, Boolean(reduce));
  }

  return (
    <main className="hero-mesh">
      <SiteHeader
        onBrandClick={handleBrandClick}
        links={[
          { href: "#contact", label: "Contact" },
          { href: "/login", label: "Owner desk" },
          { href: "/chat", label: "Chat with Muni", primary: true },
        ]}
      />

      <section
        className={`hero-stage ${showFlank ? "hero-stage--flank" : "hero-stage--stack"}`}
      >
        <div className="hero-orbs" aria-hidden="true">
          <span className="hero-orb hero-orb-a" />
          <span className="hero-orb hero-orb-b" />
        </div>
        <div className="hero-wash" aria-hidden="true" />

        <AnimatePresence>
          {showFlank && (
            <>
              <motion.aside
                key="flank-left"
                className="hero-flank hero-flank--left"
                initial={reduce ? false : { opacity: 0, x: -28, scale: 0.92 }}
                animate={
                  flankActive
                    ? { opacity: 1, x: 0, scale: 1 }
                    : { opacity: 0, x: -20, scale: 0.9 }
                }
                exit={reduce ? undefined : { opacity: 0, x: -24, scale: 0.88 }}
                transition={sideMotion}
              >
                <HelloCard />
              </motion.aside>
              <motion.aside
                key="flank-right"
                className="hero-flank hero-flank--right"
                initial={reduce ? false : { opacity: 0, x: 28, scale: 0.92 }}
                animate={
                  flankActive
                    ? { opacity: 1, x: 0, scale: 1 }
                    : { opacity: 0, x: 20, scale: 0.9 }
                }
                exit={reduce ? undefined : { opacity: 0, x: 24, scale: 0.88 }}
                transition={{ ...sideMotion, delay: reduce ? 0 : 0.04 }}
              >
                <HeroAnswerCard />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

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

        <AnimatePresence mode="wait">
          {mode === "stack" && !exiting && (
            <motion.div
              key="hero-stack"
              className="hero-stack"
              initial={reduce ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: 10 }}
              transition={sideMotion}
            >
              <HelloCard compact />
              <HeroAnswerCard />
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <MarqueeBand />

      <ScrollChapter className="chapter">
        <div className="chapter-head">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 28 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={viewIn}
            transition={{ duration: 0.55, ease: EASE }}
          >
            <span className="eyebrow">
              <span className="muni-dot" /> Retrieve, ground, refuse
            </span>
            <h2>Think first. Speak only when grounded.</h2>
            <p className="text-muted">
              Muni is Yuan&apos;s personal brand site and digital twin. The hard part is not answering. It is knowing when not to.
            </p>
          </motion.div>
        </div>
        <div className="grid-3">
          {features.map(({ Icon, title, copy }, index) => (
            <motion.article
              key={title}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              initial={reduce ? false : { opacity: 0, y: 22 }}
              transition={{ delay: index * 0.06, duration: 0.45, ease: EASE }}
              viewport={viewIn}
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
      </ScrollChapter>

      <ScrollChapter id="guard" className="chapter">
        <div className="chapter-head">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 28 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={viewIn}
            transition={{ duration: 0.55, ease: EASE }}
          >
            <span className="eyebrow">
              <span className="muni-dot" /> Grounding Guard
            </span>
            <h2>The best retrieval can still be wrong.</h2>
            <p className="text-muted">
              Muni refuses to invent credentials. Out-of-scope questions get humility, not hallucination.
            </p>
          </motion.div>
        </div>
        <div className="grid-2">
          <motion.article
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            initial={reduce ? false : { opacity: 0, y: 18 }}
            viewport={viewIn}
            transition={{ duration: 0.45, ease: EASE }}
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
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            initial={reduce ? false : { opacity: 0, y: 18 }}
            viewport={{ ...viewIn, amount: 0.18 }}
            transition={{ duration: 0.45, delay: reduce ? 0 : 0.05, ease: EASE }}
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
      </ScrollChapter>

      <ScrollChapter className="chapter">
        <div className="grid-3">
          {[
            ["35", "verified knowledge cards"],
            ["4", "live Capstone demos"],
            ["0.80+", "eval floors"],
          ].map(([v, l], index) => (
            <motion.div
              key={l}
              tabIndex={0}
              className="surface feature-card text-center"
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              initial={reduce ? false : { opacity: 0, y: 16 }}
              transition={{ delay: index * 0.05, duration: 0.4, ease: EASE }}
              viewport={viewIn}
            >
              <b className="font-display text-4xl text-muni">{v}</b>
              <p className="mono mt-2 text-[10px] uppercase tracking-widest text-muted">{l}</p>
            </motion.div>
          ))}
        </div>
      </ScrollChapter>

      <ScrollChapter id="contact" className="chapter">
        <ContactSection embedded />
      </ScrollChapter>

      <ScrollChapter className="chapter">
        <motion.div
          className="surface flex flex-col items-center p-8 text-center sm:p-16"
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          initial={reduce ? false : { opacity: 0, y: 20 }}
          viewport={{ once: false, amount: 0.35 }}
          transition={{ duration: 0.5, ease: EASE }}
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
      </ScrollChapter>

      <footer className="border-t border-line py-8">
        <div className="footer-row mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-5">
          <BrandLockup onClick={handleBrandClick} />
          <span className="mono text-[10px] text-muted">General AI Fluency · Week 6 · Impact Project</span>
        </div>
      </footer>
    </main>
  );
}
