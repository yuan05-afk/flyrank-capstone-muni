"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { MotifArrow } from "@/components/Motifs";

type DemoPanel = {
  question: string;
  answer: string;
  confidence: string;
  nextAsks: string[];
  reason?: string;
};

type DemoTab = {
  id: "grounded" | "refused";
  tab: string;
  panel: DemoPanel;
};

const DEMOS: DemoTab[] = [
  {
    id: "grounded",
    tab: "In scope",
    panel: {
      question: "What is Muni?",
      answer:
        "Muni comes from Filipino muni-muni, thoughtful reflection. It answers only from Yuan's verified knowledge cards and refuses when evidence is missing.",
      confidence: "0.92",
      nextAsks: ["What Capstones has Yuan shipped?", "What will Muni refuse?"],
    },
  },
  {
    id: "refused",
    tab: "Out of scope",
    panel: {
      question: "Write me a Python exploit script",
      answer:
        "I will not write code, exploits, or homework solutions. Ask about Yuan's verified work instead.",
      confidence: "0.25",
      nextAsks: ["What is Muni?", "What Capstones has Yuan shipped?"],
      reason: "Assist policy blocks code, exploit, and homework requests before retrieval.",
    },
  },
];

const FOLLOW_UPS: Record<string, DemoPanel> = {
  "What is Muni?": DEMOS[0].panel,
  "What Capstones has Yuan shipped?": {
    question: "What Capstones has Yuan shipped?",
    answer:
      "Yuan shipped five live FlyRank Capstones: Checkpoint, Lens, Broadcast, Ledger, and Muni. CheckMyDevice and ShopScript are separate personal and course projects.",
    confidence: "0.91",
    nextAsks: ["What is Muni?", "What will Muni refuse?"],
  },
  "What will Muni refuse?": {
    question: "What will Muni refuse?",
    answer:
      "Muni refuses private details without verified cards, fantasy claims, and asks to write code, exploits, or homework solutions.",
    confidence: "0.90",
    nextAsks: ["What is Muni?", "What Capstones has Yuan shipped?"],
  },
};

function chatHref(question: string) {
  return `/chat?q=${encodeURIComponent(question)}`;
}

export function HeroAnswerCard() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState<DemoTab["id"]>("grounded");
  const [panel, setPanel] = useState<DemoPanel>(DEMOS[0].panel);

  const grounded = active === "grounded";
  const tab = DEMOS.find((item) => item.id === active) ?? DEMOS[0];

  function selectTab(id: DemoTab["id"]) {
    const next = DEMOS.find((item) => item.id === id) ?? DEMOS[0];
    setActive(id);
    setPanel(next.panel);
  }

  function previewAsk(ask: string) {
    const next = FOLLOW_UPS[ask];
    if (!next) return;
    setActive("grounded");
    setPanel(next);
  }

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
            onClick={() => selectTab(item.id)}
          >
            {item.tab}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${active}:${panel.question}`}
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -8 }}
          transition={{ duration: 0.22 }}
          className="answer-card-panel"
        >
          <div className="answer-card-head">
            <span className="mono answer-card-q">q: {panel.question}</span>
            <span className={`badge ${grounded ? "badge-ok" : "badge-danger"}`}>
              {grounded ? "grounded" : "refused"}
            </span>
          </div>

          <p className="answer-card-body">{panel.answer}</p>

          {grounded ? (
            <div className="answer-card-sources">
              <span className="mono answer-card-label">suggested next asks</span>
              {panel.nextAsks.map((ask) => (
                <button
                  key={ask}
                  type="button"
                  className={`source-chip ${panel.question === ask ? "is-open" : ""}`}
                  onClick={() => previewAsk(ask)}
                >
                  {ask}
                </button>
              ))}
            </div>
          ) : (
            <div className="answer-card-sources">
              <span className="mono answer-card-label">guard reason</span>
              <p className="source-quote is-static">{tab.panel.reason}</p>
              <span className="mono answer-card-label">try instead</span>
              {panel.nextAsks.map((ask) => (
                <button
                  key={ask}
                  type="button"
                  className="source-chip"
                  onClick={() => previewAsk(ask)}
                >
                  {ask}
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="answer-card-foot">
        <span className="mono">confidence {panel.confidence}</span>
        <Link href={chatHref(panel.question)} className="answer-card-cta">
          Try in chat <MotifArrow className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
