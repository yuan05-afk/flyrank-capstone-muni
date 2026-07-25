"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useReducedMotion } from "framer-motion";

/**
 * CheckMyDevice-style smooth scrolling via Lenis.
 * Disabled when the user prefers reduced motion.
 */
export function useLenis() {
  const shouldReduce = useReducedMotion();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (shouldReduce) {
      lenisRef.current = null;
      return;
    }

    const lenis = new Lenis({
      autoRaf: true,
      duration: 1.6,
      smoothWheel: true,
      wheelMultiplier: 0.85,
      touchMultiplier: 1.2,
    });
    lenisRef.current = lenis;

    return () => {
      if (lenisRef.current === lenis) lenisRef.current = null;
      lenis.destroy();
    };
  }, [shouldReduce]);

  return lenisRef;
}

export function scrollToTop(
  lenisLike?: { scrollTo: (target: number, opts?: { duration?: number }) => void } | null,
  reduce = false,
) {
  if (lenisLike?.scrollTo) {
    lenisLike.scrollTo(0, { duration: 1.2 });
    return;
  }
  window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
}
