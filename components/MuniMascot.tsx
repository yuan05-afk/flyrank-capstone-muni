"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type MuniState =
  | "idle"
  | "wave"
  | "listening"
  | "thinking"
  | "answering"
  | "grounded-refuse";

/**
 * Muni: warm amber companion with a real face.
 * Thinks before speaking. Bright when grounded. Soft shrug when refusing.
 */
export function MuniMascot({
  state = "idle",
  className = "h-44 w-44",
}: {
  state?: MuniState;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    if (reduce || state === "grounded-refuse") return;
    let timeout = 0;
    const loop = () => {
      timeout = window.setTimeout(() => {
        setBlink(true);
        timeout = window.setTimeout(() => {
          setBlink(false);
          loop();
        }, 140);
      }, 2400 + Math.random() * 1800);
    };
    loop();
    return () => window.clearTimeout(timeout);
  }, [reduce, state]);

  const looking =
    state === "listening" ? { lx: -2.2, rx: -2.2 } :
    state === "thinking" ? { lx: 1.8, rx: 1.8 } :
    state === "answering" ? { lx: 0, rx: 0 } :
    { lx: 0, rx: 0 };

  const eyeOpen = blink || state === "grounded-refuse" ? 1.2 : state === "thinking" ? 3.2 : 4.4;
  const bodyOpacity = state === "grounded-refuse" ? 0.82 : 1;

  const bob = reduce
    ? {}
    : state === "idle" || state === "wave"
      ? { y: [0, -5, 0] }
      : state === "listening"
        ? { y: 2, rotate: -5 }
        : state === "thinking"
          ? { rotate: [0, 4, -4, 0] }
          : state === "answering"
            ? { y: [0, -6, 0], scale: [1, 1.04, 1] }
            : { y: 5, rotate: 6 };

  return (
    <motion.div
      className={`relative ${className}`}
      animate={bob}
      transition={{
        duration: state === "thinking" ? 1.35 : state === "answering" ? 1.1 : 2.3,
        repeat: reduce ? 0 : Infinity,
        ease: "easeInOut",
      }}
      aria-label={`Muni is ${state}`}
      role="img"
    >
      <svg viewBox="0 0 160 160" className="h-full w-full" overflow="visible">
        {/* Focus ring */}
        <motion.circle
          cx="80"
          cy="82"
          r="56"
          fill="none"
          stroke="#F59E0B"
          strokeWidth="2.5"
          strokeDasharray={state === "thinking" ? "7 9" : "0"}
          opacity={state === "grounded-refuse" ? 0.28 : 0.55}
          animate={
            reduce || state !== "thinking"
              ? undefined
              : { rotate: 360 }
          }
          style={{ transformOrigin: "80px 82px" }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
        />

        {/* Soft shadow disc */}
        <ellipse cx="80" cy="138" rx="28" ry="5" fill="#101828" opacity="0.08" />

        {/* Wave arm: rooted inside the body so the shoulder is truly attached */}
        {state === "wave" && (
          <motion.g
            style={{ transformOrigin: "100px 100px" }}
            animate={reduce ? undefined : { rotate: [0, -20, 2, -20, 0] }}
            transition={{ duration: 1.15, repeat: Infinity, ease: "easeInOut" }}
          >
            <path
              d="M100 100 Q124 94 133 70"
              fill="none"
              stroke="#E08A14"
              strokeWidth="10"
              strokeLinecap="round"
            />
            <circle cx="134" cy="66" r="9.5" fill="#F0A020" stroke="#D97706" strokeWidth="2.5" />
          </motion.g>
        )}

        {/* Body */}
        <g opacity={bodyOpacity}>
          <circle cx="80" cy="84" r="40" fill="#F59E0B" />
          <circle cx="80" cy="84" r="40" fill="none" stroke="#D97706" strokeWidth="3" />

          {/* Cheeks */}
          <circle cx="58" cy="92" r="6.5" fill="#FDBA74" opacity="0.85" />
          <circle cx="102" cy="92" r="6.5" fill="#FDBA74" opacity="0.85" />

          {/* Eyes */}
          <ellipse
            cx={68 + looking.lx}
            cy="78"
            rx="5.2"
            ry={eyeOpen}
            fill="#101828"
          />
          <ellipse
            cx={92 + looking.rx}
            cy="78"
            rx="5.2"
            ry={eyeOpen}
            fill="#101828"
          />
          {!blink && state !== "grounded-refuse" && (
            <>
              <circle cx={66.5 + looking.lx} cy={76.2} r="1.5" fill="#FEF3C7" />
              <circle cx={90.5 + looking.rx} cy={76.2} r="1.5" fill="#FEF3C7" />
            </>
          )}

          {/* Brows */}
          {state === "thinking" && (
            <>
              <path d="M60 68c4-3 10-3 14 0" fill="none" stroke="#92400E" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M86 68c4-3 10-3 14 0" fill="none" stroke="#92400E" strokeWidth="2.2" strokeLinecap="round" />
            </>
          )}
          {state === "listening" && (
            <>
              <path d="M60 69c5-1 11-1 15 1" fill="none" stroke="#92400E" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M86 69c5-1 11-1 15 1" fill="none" stroke="#92400E" strokeWidth="2.2" strokeLinecap="round" />
            </>
          )}

          {/* Mouth */}
          {state === "grounded-refuse" ? (
            <path d="M70 102c5-3 15-3 20 0" fill="none" stroke="#101828" strokeWidth="3" strokeLinecap="round" />
          ) : state === "answering" || state === "wave" ? (
            <path d="M68 98c6 9 18 9 24 0" fill="none" stroke="#101828" strokeWidth="3" strokeLinecap="round" />
          ) : state === "thinking" ? (
            <circle cx="80" cy="102" r="2.4" fill="#101828" />
          ) : (
            <path d="M69 99c6 6 16 6 22 0" fill="none" stroke="#101828" strokeWidth="3" strokeLinecap="round" />
          )}
        </g>

        {/* Thinking / answering sparks */}
        {(state === "thinking" || state === "answering") && (
          <g>
            <motion.circle
              cx="122"
              cy="48"
              r="5"
              fill="#FEF3C7"
              stroke="#D97706"
              strokeWidth="2"
              animate={reduce ? undefined : { y: [0, -3, 0], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
            <motion.circle
              cx="136"
              cy="62"
              r="3.5"
              fill="#FEF3C7"
              stroke="#D97706"
              strokeWidth="1.8"
              animate={reduce ? undefined : { y: [0, -2, 0], opacity: [0.55, 1, 0.55] }}
              transition={{ duration: 1.1, repeat: Infinity, delay: 0.15 }}
            />
            {state === "thinking" && (
              <motion.text
                x="118"
                y="42"
                fill="#92400E"
                fontSize="10"
                fontFamily="IBM Plex Mono, monospace"
                animate={reduce ? undefined : { opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.4, repeat: Infinity }}
              >
                ···
              </motion.text>
            )}
          </g>
        )}

        {/* Tiny spark mark */}
        <circle cx="104" cy="54" r="3.2" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.5" opacity={state === "grounded-refuse" ? 0.35 : 0.9} />
      </svg>
    </motion.div>
  );
}
