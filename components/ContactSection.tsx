"use client";

import { CAPSTONE_LINKS } from "@/config/capstones.config";
import { MotifArrow, MotifCite } from "@/components/Motifs";

const GITHUB_URL = "https://github.com/yuan05-afk";

/**
 * Real contact surface Muni's answers can point to.
 * Chat used to mention a "contact section" that did not exist on the page.
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
            <strong className="!text-sm">GitHub · yuan05-afk</strong>
            <p className="text-xs leading-relaxed text-muted">Capstone repos and demos.</p>
            <span className="contact-cta !pt-1 text-xs">
              Open profile <MotifArrow className="h-3.5 w-3.5" />
            </span>
          </a>
          <a href="/#contact" className="surface contact-card focus-ring !p-3">
            <strong className="!text-sm">Full contact + live Capstones</strong>
            <p className="text-xs leading-relaxed text-muted">
              Checkpoint, Lens, Broadcast, and Muni demos.
            </p>
            <span className="contact-cta !pt-1 text-xs">
              Open section <MotifArrow className="h-3.5 w-3.5" />
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
          <span className="motif-well">
            <MotifCite />
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
          <span className="motif-well">
            <MotifCite />
          </span>
          <strong>Leave a note</strong>
          <p className="text-sm leading-relaxed text-muted">
            Ask in chat. Refused topics land in Yuan&apos;s owner inbox as knowledge gaps.
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
