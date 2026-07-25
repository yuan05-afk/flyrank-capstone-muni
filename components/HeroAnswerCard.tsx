"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { MotifArrow } from "@/components/Motifs";

type Demo = {
  id: "grounded" | "refused";
  tab: string;
  question: string;
  answer: string;
  confidence: string;
  sources: Array<{ title: string; quote: string }>;
  reason?: string;
};

const DEMOS: Demo[] = [
  {
    id: "grounded",
    tab: "In scope",
    question: "What is Lens?",
    answer: "Lens tags images and refuses wrong pairings with a mismatch guard.",
    confidence: "0.90",
    sources: [
      { title: "About Yuan", quote: "Yuan ships grounded AI systems with honest evals." },
      { title: "Lens image relevance", quote: "Refuses wrong pairings with a mismatch guard." },
    ],
  },
  {
    id: "refused",
    tab: "Out of scope",
    question: "What is Yuan's secret salary?",
    answer: "I do not have verified knowledge for that. Leave a note in the owner inbox.",
    confidence: "0.25",
    sources: [],
    reason: "Topical overlap 0.00 is below the 0.20 grounding floor.",
  },
];

export function HeroAnswerCard() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState<Demo["id"]>("grounded");
  const [hovered, setHovered] = useState<string | null>(null);

  const demo = DEMOS.find((item) => item.id === active) ?? DEMOS[0];
  const grounded = demo.id === "grounded";

  return (
    <div className="surface answer-card h-full">
      <div className="answer-card-tabs" role="tablist" aria-label="Grounding demo">
        {DEMOS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={item.id === active}
            className={`answer-tab ${item.id === active ? "is-active" : ""}`}
            onClick={() => {
              setActive(item.id);
              setHovered(null);
            }}
          >
            {item.tab}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={demo.id}
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -8 }}
          transition={{ duration: 0.22 }}
          className="answer-card-panel"
        >
          <div className="answer-card-head">
            <span className="mono answer-card-q">q: {demo.question}</span>
            <span className={`badge ${grounded ? "badge-ok" : "badge-danger"}`}>
              {grounded ? "grounded" : "refused"}
            </span>
          </div>

          <p className="answer-card-body">{demo.answer}</p>

          {grounded ? (
            <div className="answer-card-sources">
              <span className="mono answer-card-label">cited sources</span>
              {demo.sources.map((source) => (
                <button
                  key={source.title}
                  type="button"
                  className={`source-chip ${hovered === source.title ? "is-open" : ""}`}
                  onMouseEnter={() => setHovered(source.title)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(source.title)}
                  onBlur={() => setHovered(null)}
                >
                  {source.title}
                </button>
              ))}
              <AnimatePresence>
                {hovered && (
                  <motion.p
                    initial={reduce ? false : { opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={reduce ? undefined : { opacity: 0, height: 0 }}
                    className="source-quote"
                  >
                    {demo.sources.find((s) => s.title === hovered)?.quote}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="answer-card-sources">
              <span className="mono answer-card-label">guard reason</span>
              <p className="source-quote is-static">{demo.reason}</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="answer-card-foot">
        <span className="mono">confidence {demo.confidence}</span>
        <Link href="/chat" className="answer-card-cta">
          Try in chat <MotifArrow className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
