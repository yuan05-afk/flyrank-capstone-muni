"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

export type HeroMode = "flank" | "stack";

/**
 * Drive the landing hero layout with an exit beat before the layout swap,
 * so side cards fade/scale out instead of blinking away on zoom/resize.
 */
export function useHeroMode(minWidth = 1280) {
  const reduce = useReducedMotion();
  const [mode, setMode] = useState<HeroMode>("stack");
  const [exiting, setExiting] = useState(false);
  const modeRef = useRef<HeroMode>("stack");
  const exitingRef = useRef(false);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    exitingRef.current = exiting;
  }, [exiting]);

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${minWidth}px)`);

    const sync = () => {
      if (mq.matches) {
        setExiting(false);
        setMode("flank");
        return;
      }

      if (modeRef.current === "stack") return;

      if (reduce) {
        setExiting(false);
        setMode("stack");
        return;
      }

      if (!exitingRef.current) setExiting(true);
    };

    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [minWidth, reduce]);

  useEffect(() => {
    if (!exiting) return;
    const delay = reduce ? 0 : 420;
    const timer = window.setTimeout(() => {
      setMode("stack");
      setExiting(false);
    }, delay);
    return () => window.clearTimeout(timer);
  }, [exiting, reduce]);

  return {
    mode,
    exiting,
    showFlank: mode === "flank",
    flankActive: mode === "flank" && !exiting,
  };
}
