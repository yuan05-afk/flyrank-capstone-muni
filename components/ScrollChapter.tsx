"use client";

import { type ReactNode, useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

type ScrollChapterProps = {
  children: ReactNode;
  className?: string;
  id?: string;
};

/**
 * CheckMyDevice-style chapter parallax: opacity / y / scale stay linked to
 * scroll both directions. Transform-only (no blur filters) for paint cost.
 */
export function ScrollChapter({ children, className = "", id }: ScrollChapterProps) {
  const chapterRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: chapterRef,
    offset: ["start end", "end start"],
  });

  // Softer floors than CheckMyDevice (0.3) so chapters never look "stuck faded"
  // while still replaying motion on scroll up and down.
  const opacity = useTransform(scrollYProgress, [0, 0.08, 0.92, 1], [0.62, 1, 1, 0.62]);
  const y = useTransform(scrollYProgress, [0, 0.18, 0.82, 1], [28, 0, 0, -22]);
  const scale = useTransform(scrollYProgress, [0, 0.16, 0.84, 1], [0.988, 1, 1, 0.988]);

  return (
    <section ref={chapterRef} id={id} className={className}>
      <motion.div
        className="w-full"
        style={reduce ? undefined : { opacity, y, scale }}
      >
        {children}
      </motion.div>
    </section>
  );
}
