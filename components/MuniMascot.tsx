"use client";

import { motion, useReducedMotion } from "framer-motion";

export type MuniState =
  | "idle"
  | "wave"
  | "listening"
  | "thinking"
  | "answering"
  | "grounded-refuse";

export function MuniMascot({
  state = "idle",
  className = "h-44 w-44",
}: {
  state?: MuniState;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const bob = reduce
    ? {}
    : state === "idle" || state === "wave"
      ? { y: [0, -5, 0] }
      : state === "listening"
        ? { y: 2, rotate: -4 }
        : state === "thinking"
          ? { rotate: [0, 3, -3, 0] }
          : state === "answering"
            ? { scale: [1, 1.05, 1] }
            : { y: 6, rotate: 8, opacity: 0.78 };

  return (
    <motion.div
      className={`relative ${className}`}
      animate={bob}
      transition={{ duration: state === "thinking" ? 1.4 : 2.4, repeat: reduce ? 0 : Infinity, ease: "easeInOut" }}
      aria-label={`Muni is ${state}`}
    >
      <svg viewBox="0 0 160 160" className="h-full w-full drop-shadow-sm">
        <defs>
          <radialGradient id="muniGlow" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="55%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </radialGradient>
        </defs>
        <motion.circle
          cx="80"
          cy="80"
          r="54"
          fill="none"
          stroke="#F59E0B"
          strokeWidth="3"
          strokeDasharray={state === "thinking" ? "8 10" : "0"}
          animate={
            reduce || state !== "thinking"
              ? undefined
              : { rotate: 360 }
          }
          style={{ transformOrigin: "80px 80px" }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
          opacity={0.55}
        />
        <circle cx="80" cy="84" r="42" fill="url(#muniGlow)" />
        <circle cx="80" cy="84" r="42" fill="none" stroke="#FEF3C7" strokeWidth="3" opacity="0.7" />
        <circle cx="68" cy="78" r="4.2" fill="#101828" />
        <circle cx="92" cy="78" r="4.2" fill="#101828" />
        {state === "grounded-refuse" ? (
          <path d="M70 98c6-4 14-4 20 0" fill="none" stroke="#101828" strokeWidth="3" strokeLinecap="round" />
        ) : (
          <path d="M68 96c7 7 17 7 24 0" fill="none" stroke="#101828" strokeWidth="3" strokeLinecap="round" />
        )}
        {state === "wave" && (
          <motion.path
            d="M118 70c8-10 14-8 16-2"
            fill="none"
            stroke="#D97706"
            strokeWidth="5"
            strokeLinecap="round"
            animate={reduce ? undefined : { rotate: [0, 18, 0] }}
            style={{ transformOrigin: "118px 70px" }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        )}
        {(state === "answering" || state === "thinking") && (
          <>
            <circle cx="118" cy="48" r="5" fill="#FEF3C7" stroke="#D97706" />
            <circle cx="132" cy="62" r="3.5" fill="#FEF3C7" stroke="#D97706" />
          </>
        )}
      </svg>
    </motion.div>
  );
}
