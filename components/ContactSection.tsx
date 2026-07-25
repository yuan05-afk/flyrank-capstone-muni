"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CAPSTONE_LINKS } from "@/config/capstones.config";
import { MotifArrow, MotifGitHub, MotifNote } from "@/components/Motifs";

const GITHUB_URL = "https://github.com/yuan05-afk";
const EASE = [0.22, 1, 0.36, 1] as const;
const viewIn = { once: false as const, amount: 0.2, margin: "-40px 0px" as const };

const FAVICON: Record<string, string> = {
  checkpoint: "/capstones/checkpoint.svg",
  lens: "/capstones/lens.svg",
  broadcast: "/capstones/broadcast.svg",
  muni: "/capstones/muni.svg",
};

/**
 * Real contact surface Muni's answers can point to.
 * Each Capstone card uses that product's live favicon and opens its domain.
 * Pass `embedded` when wrapped by ScrollChapter so we don't nest sections.
 */
export function ContactSection({
  compact = false,
  embedded = false,
}: {
  compact?: boolean;
  embedded?: boolean;
}) {
  const reduce = useReducedMotion();

  if (compact) {
    return (
      <div id="contact" className="contact-panel">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
          Contact Yuan
        </p>
        <div className="contact-grid contact-grid--compact">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="surface contact-card focus-ring !p-3"
          >
            <span className="contact-icon contact-icon--sm">
              <MotifGitHub className="h-6 w-6" />
            </span>
            <strong className="!text-sm">GitHub · yuan05-afk</strong>
            <p className="text-xs leading-relaxed text-muted">Capstone repos and demos.</p>
            <span className="contact-cta !pt-1 text-xs">
              Open profile <MotifArrow className="h-3.5 w-3.5" />
            </span>
          </a>
          <a href="/chat" className="surface contact-card focus-ring !p-3">
            <span className="contact-icon contact-icon--sm">
              <MotifNote className="h-6 w-6" />
            </span>
            <strong className="!text-sm">Leave a note in chat</strong>
            <p className="text-xs leading-relaxed text-muted">
              Type any question. Refused asks still land in Yuan&apos;s owner inbox.
            </p>
            <span className="contact-cta !pt-1 text-xs">
              Open chat <MotifArrow className="h-3.5 w-3.5" />
            </span>
          </a>
        </div>
      </div>
    );
  }

  const body = (
    <>
      <div className="chapter-head">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 28 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={viewIn}
          transition={{ duration: 0.55, ease: EASE }}
        >
          <span className="eyebrow">
            <span className="muni-dot" /> Contact
          </span>
          <h2>Reach Yuan directly.</h2>
          <p className="text-muted">
            When Muni refuses, it is not a dead end. Leave a note in chat or open a Capstone and
            review the work yourself.
          </p>
        </motion.div>
      </div>

      <div className="contact-grid">
        <motion.a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="surface contact-card focus-ring"
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={viewIn}
          transition={{ duration: 0.4, ease: EASE }}
          whileHover={reduce ? undefined : { y: -4 }}
        >
          <span className="contact-icon">
            <MotifGitHub />
          </span>
          <strong>GitHub</strong>
          <p className="text-sm leading-relaxed text-muted">
            yuan05-afk · Capstone repos, READMEs, and demos.
          </p>
          <span className="contact-cta">
            Open profile <MotifArrow />
          </span>
        </motion.a>

        <motion.a
          href="/chat"
          className="surface contact-card focus-ring"
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={viewIn}
          transition={{ duration: 0.4, delay: reduce ? 0 : 0.04, ease: EASE }}
          whileHover={reduce ? undefined : { y: -4 }}
        >
          <span className="contact-icon">
            <MotifNote />
          </span>
          <strong>Leave a note</strong>
          <p className="text-sm leading-relaxed text-muted">
            Type any question in chat. Even refused asks land in Yuan&apos;s owner inbox as knowledge gaps.
          </p>
          <span className="contact-cta">
            Chat with Muni <MotifArrow />
          </span>
        </motion.a>

        {CAPSTONE_LINKS.map((link, index) => (
          <motion.a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="surface contact-card focus-ring"
            initial={reduce ? false : { opacity: 0, y: 18 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={viewIn}
            transition={{ duration: 0.4, delay: reduce ? 0 : 0.06 + index * 0.04, ease: EASE }}
            whileHover={reduce ? undefined : { y: -4 }}
          >
            <span className="contact-icon">
              <img
                src={FAVICON[link.id] || "/favicon.svg"}
                alt=""
                width={28}
                height={28}
              />
            </span>
            <span className="mono text-[10px] uppercase tracking-widest text-muni">{link.id}</span>
            <strong>{link.name}</strong>
            <p className="text-sm leading-relaxed text-muted">{link.tagline}</p>
            <span className="contact-cta">
              Live demo <MotifArrow />
            </span>
          </motion.a>
        ))}
      </div>
    </>
  );

  if (embedded) return <div className="contact-embedded">{body}</div>;
  return (
    <section id="contact" className="chapter">
      {body}
    </section>
  );
}
