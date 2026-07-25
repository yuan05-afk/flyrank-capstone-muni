"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MotifCheck, MotifChevron } from "@/components/Motifs";

/**
 * Custom select that opens upward so menus never hide under cards below.
 * Muni-aligned styling (amber focus, fog selected state).
 */
export function KindSelect({
  value,
  options,
  onChange,
  label = "Kind",
}: {
  value: string;
  options: string[];
  onChange: (next: string) => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    function onDoc(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={rootRef} className={`muni-select ${open ? "is-open" : ""}`}>
      <button
        type="button"
        className="muni-select-trigger focus-ring"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="min-w-0">
          <span className="block text-[10px] font-medium uppercase tracking-[0.14em] text-muni">
            {label}
          </span>
          <span className="mt-0.5 block truncate font-display text-base font-semibold text-ink">
            {value}
          </span>
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.18 }}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-fog text-muni"
        >
          <MotifChevron />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            id={listId}
            role="listbox"
            aria-label={label}
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="muni-select-menu signal-scroll"
          >
            {options.map((option) => {
              const selected = option === value;
              return (
                <li key={option} role="option" aria-selected={selected}>
                  <button
                    type="button"
                    className={`muni-select-option ${selected ? "is-selected" : ""}`}
                    onClick={() => {
                      onChange(option);
                      setOpen(false);
                    }}
                  >
                    <span className="font-display text-sm font-semibold">{option}</span>
                    {selected && <MotifCheck className="h-4 w-4 shrink-0" />}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
