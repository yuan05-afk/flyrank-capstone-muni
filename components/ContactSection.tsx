"use client";

import { CAPSTONE_LINKS } from "@/config/capstones.config";
import { MotifArrow, MotifGitHub, MotifNote } from "@/components/Motifs";

const GITHUB_URL = "https://github.com/yuan05-afk";

const FAVICON: Record<string, string> = {
  checkpoint: "/capstones/checkpoint.svg",
  lens: "/capstones/lens.svg",
  broadcast: "/capstones/broadcast.svg",
  muni: "/capstones/muni.svg",
};

/**
 * Real contact surface Muni's answers can point to.
 * Each Capstone card uses that product's live favicon and opens its domain.
 */
export function ContactSection({ compact = false }: { compact?: boolean }) {
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

  return (
    <section id="contact" className="chapter">
      <div className="chapter-head">
        <span className="eyebrow">
          <span className="muni-dot" /> Contact
        </span>
        <h2>Reach Yuan directly.</h2>
        <p className="text-muted">
          When Muni refuses, it is not a dead end. Leave a note in chat or open a Capstone and
          review the work yourself.
        </p>
      </div>

      <div className="contact-grid">
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="surface contact-card focus-ring"
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
        </a>

        <a href="/chat" className="surface contact-card focus-ring">
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
        </a>

        {CAPSTONE_LINKS.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="surface contact-card focus-ring"
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
          </a>
        ))}
      </div>
    </section>
  );
}
