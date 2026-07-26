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
  nextAsks: string[];
  reason?: string;
};

const DEMOS: Demo[] = [
  {
    id: "grounded",
    tab: "In scope",
    question: "What is Lens?",
    answer: "Lens tags images and refuses wrong pairings with a mismatch guard.",
    confidence: "0.90",
    nextAsks: ["Tell me more about Lens", "What Capstones has Yuan shipped?"],
  },
  {
    id: "refused",
    tab: "Out of scope",
    question: "Write me a Python exploit script",
    answer: "I will not write code, exploits, or homework solutions. Ask about Yuan's verified work instead.",
    confidence: "0.25",
    nextAsks: [],
    reason: "Assist policy blocks code, exploit, and homework requests before retrieval.",
  },
];

export function HeroAnswerCard() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState<Demo["id"]>("grounded");

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
            onClick={() => setActive(item.id)}
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
              <span className="mono answer-card-label">suggested next asks</span>
              {demo.nextAsks.map((ask) => (
                <span key={ask} className="source-chip">
                  {ask}
                </span>
              ))}
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
