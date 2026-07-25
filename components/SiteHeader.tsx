"use client";

import { useState } from "react";
import type { MouseEvent } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BrandLockup } from "@/components/BrandMark";

type NavLink = {
  href?: string;
  label: string;
  primary?: boolean;
  onClick?: () => void;
};

export function SiteHeader({
  links,
  onBrandClick,
}: {
  links: NavLink[];
  onBrandClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
}) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

  function renderLink(link: NavLink, mobile = false) {
    const className = link.primary
      ? mobile
        ? "btn-primary w-full"
        : "btn-primary !min-h-9 !py-1.5"
      : mobile
        ? "rounded-xl border border-line bg-white px-4 py-3 text-sm font-medium"
        : "text-sm text-muted transition hover:text-muni";

    if (link.onClick) {
      return (
        <button
          key={link.label}
          type="button"
          className={className}
          onClick={() => {
            setOpen(false);
            link.onClick?.();
          }}
        >
          {link.label}
        </button>
      );
    }

    return (
      <Link
        key={(link.href || "") + link.label}
        href={link.href || "/"}
        className={className}
        onClick={() => setOpen(false)}
      >
        {link.label}
      </Link>
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-canvas">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-5">
        <BrandLockup onClick={onBrandClick} />
        <nav className="hidden items-center gap-3 md:flex">{links.map((link) => renderLink(link))}</nav>
        <button
          type="button"
          className="nav-toggle md:hidden"
          aria-expanded={open}
          aria-label="Toggle navigation"
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduce ? undefined : { height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-line bg-canvas/95 md:hidden"
          >
            <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-3 sm:px-5">
              {links.map((link) => renderLink(link, true))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
