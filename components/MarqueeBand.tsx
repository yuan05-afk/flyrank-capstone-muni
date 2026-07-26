"use client";

import { useReducedMotion } from "framer-motion";
import { CAPSTONE_LINKS, capstoneUrl } from "@/config/capstones.config";

/**
 * Full-bleed two-row marquee under the hero (Broadcast pattern).
 * Opposite drift, soft L/R fade, pauses on hover, respects reduced motion.
 * Capstone chips use each product's live favicon and link to its domain.
 */

type CapstoneTone = "checkpoint" | "lens" | "broadcast" | "muni";

type Token =
  | { kind: "capstone"; label: string; tone: CapstoneTone }
  | { kind: "status"; label: string; tone: "grounded" | "refused" | "thinking" }
  | { kind: "word"; label: string };

const FAVICON: Record<CapstoneTone, string> = {
  checkpoint: "/capstones/checkpoint.svg",
  lens: "/capstones/lens.svg",
  broadcast: "/capstones/broadcast.svg",
  muni: "/capstones/muni.svg",
};

const ROW_A: Token[] = [
  { kind: "capstone", label: "Checkpoint", tone: "checkpoint" },
  { kind: "word", label: "Suggested next asks" },
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
  { kind: "word", label: "Code-assist refuse" },
  { kind: "capstone", label: "Checkpoint", tone: "checkpoint" },
];

function Chip({ token }: { token: Token }) {
  if (token.kind === "capstone") {
    const href = capstoneUrl(token.tone) || CAPSTONE_LINKS.find((l) => l.id === token.tone)?.url;
    const inner = (
      <>
        <img
          className="muni-marquee-favicon"
          src={FAVICON[token.tone]}
          alt=""
          width={16}
          height={16}
        />
        {token.label}
      </>
    );
    if (!href) {
      return (
        <span className={`muni-marquee-chip muni-marquee-chip--${token.tone}`}>{inner}</span>
      );
    }
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`muni-marquee-chip muni-marquee-chip--${token.tone} muni-marquee-chip--link`}
        onClick={(e) => e.stopPropagation()}
      >
        {inner}
      </a>
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
      aria-label="Muni answers from verified knowledge, suggests next asks, refuses without evidence, and links Yuan's live Capstones: Checkpoint, Lens, Broadcast, and Muni."
    >
      <Track tokens={ROW_A} dir="left" />
      <Track tokens={ROW_B} dir="right" />
    </div>
  );
}
