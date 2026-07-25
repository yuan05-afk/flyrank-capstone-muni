"use client";

import { useReducedMotion } from "framer-motion";

/**
 * Full-bleed two-row marquee under the hero (Broadcast pattern).
 * Opposite drift, soft L/R fade, pauses on hover, respects reduced motion.
 * Content is Muni's powers + Yuan's live Capstones - product, not decoration.
 */

type Token =
  | { kind: "capstone"; label: string; tone: "checkpoint" | "lens" | "broadcast" | "muni" }
  | { kind: "status"; label: string; tone: "grounded" | "refused" | "thinking" }
  | { kind: "word"; label: string };

const ROW_A: Token[] = [
  { kind: "capstone", label: "Checkpoint", tone: "checkpoint" },
  { kind: "word", label: "Cite every claim" },
  { kind: "status", label: "grounded", tone: "grounded" },
  { kind: "capstone", label: "Lens", tone: "lens" },
  { kind: "word", label: "Think first" },
  { kind: "capstone", label: "Broadcast", tone: "broadcast" },
  { kind: "status", label: "refused", tone: "refused" },
  { kind: "capstone", label: "Muni", tone: "muni" },
  { kind: "word", label: "Verified cards only" },
  { kind: "status", label: "thinking", tone: "thinking" },
];

const ROW_B: Token[] = [
  { kind: "word", label: "Grounding Guard" },
  { kind: "status", label: "grounded", tone: "grounded" },
  { kind: "word", label: "Owner decision inbox" },
  { kind: "capstone", label: "Lens", tone: "lens" },
  { kind: "word", label: "Live Capstone links" },
  { kind: "status", label: "refused", tone: "refused" },
  { kind: "word", label: "Honest refuse" },
  { kind: "capstone", label: "Broadcast", tone: "broadcast" },
  { kind: "word", label: "Audience openers" },
  { kind: "capstone", label: "Checkpoint", tone: "checkpoint" },
];

function Chip({ token }: { token: Token }) {
  if (token.kind === "capstone") {
    return (
      <span className={`muni-marquee-chip muni-marquee-chip--${token.tone}`}>
        <span className="muni-marquee-dot" aria-hidden="true" />
        {token.label}
      </span>
    );
  }
  if (token.kind === "status") {
    return (
      <span className={`muni-marquee-chip muni-marquee-status muni-marquee-status--${token.tone}`}>
        <span className="muni-marquee-dot" aria-hidden="true" />
        {token.label}
      </span>
    );
  }
  return <span className="muni-marquee-word">{token.label}</span>;
}

function Track({ tokens, dir }: { tokens: Token[]; dir: "left" | "right" }) {
  return (
    <div className={`muni-marquee-track muni-marquee-track--${dir}`}>
      {[0, 1].map((copy) => (
        <div className="muni-marquee-group" key={copy} aria-hidden={copy === 1}>
          {tokens.map((token, i) => (
            <div className="muni-marquee-item" key={`${copy}-${i}`}>
              <Chip token={token} />
              <span className="muni-marquee-sep" aria-hidden="true">
                /
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function MarqueeBand() {
  const shouldReduce = useReducedMotion();

  return (
    <div
      className={`muni-marquee ${shouldReduce ? "muni-marquee--static" : ""}`}
      role="img"
      aria-label="Muni cites verified knowledge, refuses without evidence, and links Yuan's live Capstones: Checkpoint, Lens, Broadcast, and Muni."
    >
      <Track tokens={ROW_A} dir="left" />
      <Track tokens={ROW_B} dir="right" />
    </div>
  );
}
