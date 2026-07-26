"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AUDIENCE_OPENERS, type Audience } from "@/config/audience.config";
import { MotifCheck, MotifChevron } from "@/components/Motifs";

export function AudienceSelect({
  value,
  onChange,
}: {
  value: Audience;
  onChange: (next: Audience) => void;
}) {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<"up" | "down">("down");
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const listId = useId();
  const current = AUDIENCE_OPENERS[value];

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

  useEffect(() => {
    if (!open || !rootRef.current) return;
    const trigger = rootRef.current.getBoundingClientRect();
    const below = window.innerHeight - trigger.bottom - 12;
    const above = trigger.top - 12;
    setPlacement(below >= 220 || below >= above ? "down" : "up");

    const frame = window.requestAnimationFrame(() => {
      const menu = menuRef.current;
      const selected = menu?.querySelector<HTMLElement>('[aria-selected="true"]');
      if (!menu || !selected) return;
      menu.scrollTop =
        selected.offsetTop - menu.clientHeight / 2 + selected.offsetHeight / 2;
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open, value]);

  return (
    <div ref={rootRef} className={`audience-select ${open ? "is-open" : ""}`}>
      <button
        type="button"
        className="audience-trigger focus-ring"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="min-w-0">
          <span className="block text-[10px] font-medium uppercase tracking-[0.14em] text-muni">
            Talking as
          </span>
          <span className="mt-0.5 block truncate font-display text-base font-semibold text-ink">
            {current.label}
          </span>
          <span className="mt-0.5 block truncate text-xs text-muted">{current.blurb}</span>
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
            ref={menuRef}
            id={listId}
            role="listbox"
            aria-label="Audience"
            initial={{ opacity: 0, y: placement === "up" ? 8 : -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: placement === "up" ? 8 : -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className={`audience-menu audience-menu--${placement} signal-scroll`}
          >
            {(Object.keys(AUDIENCE_OPENERS) as Audience[]).map((key) => {
              const item = AUDIENCE_OPENERS[key];
              const selected = key === value;
              return (
                <li key={key} role="option" aria-selected={selected}>
                  <button
                    type="button"
                    className={`audience-option ${selected ? "is-selected" : ""}`}
                    onClick={() => {
                      onChange(key);
                      setOpen(false);
                    }}
                  >
                    <span className="min-w-0 flex-1 text-left">
                      <span className="block font-display text-sm font-semibold">{item.label}</span>
                      <span className="mt-0.5 block text-xs text-muted">{item.blurb}</span>
                    </span>
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
