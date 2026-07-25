/** Hand-authored Muni motifs. Avoid generic lucide/sparkle icon packs. */

export function MotifCards({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden>
      <rect x="7" y="5" width="16" height="20" rx="4" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.6" />
      <rect x="10" y="8" width="16" height="20" rx="4" fill="#fff" stroke="#101828" strokeWidth="1.6" />
      <path d="M14 14h8M14 18h6" stroke="#D97706" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="23.5" cy="11.5" r="2" fill="#F59E0B" />
    </svg>
  );
}

export function MotifCite({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden>
      <circle cx="16" cy="16" r="11" stroke="#D97706" strokeWidth="1.6" strokeDasharray="3 3" />
      <path d="M11 13.5h10M11 17h7M11 20.5h8.5" stroke="#101828" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M20.5 9.5l3 1.2-1.2 3" stroke="#F59E0B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MotifGuard({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden>
      <path
        d="M16 5.5l9 3.2v7.2c0 5.4-3.7 9.4-9 11.1-5.3-1.7-9-5.7-9-11.1V8.7L16 5.5z"
        fill="#FEF3C7"
        stroke="#101828"
        strokeWidth="1.6"
      />
      <circle cx="16" cy="15" r="4.2" stroke="#D97706" strokeWidth="1.6" />
      <path d="M14.2 15.1l1.4 1.4 2.8-3" stroke="#D97706" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MotifReflect({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden>
      <circle cx="24" cy="25" r="14" fill="#F59E0B" stroke="#D97706" strokeWidth="2" />
      <circle cx="19.5" cy="22.5" r="2.1" fill="#101828" />
      <circle cx="28.5" cy="22.5" r="2.1" fill="#101828" />
      <path d="M19.5 29c2.5 2.4 6.5 2.4 9 0" stroke="#101828" strokeWidth="2" strokeLinecap="round" />
      <circle cx="34" cy="14" r="2.4" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.4" />
    </svg>
  );
}

export function MotifArrow({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M3 8h9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M8.5 3.8L12.7 8l-4.2 4.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MotifChevron({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M4 6.2L8 10l4-3.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MotifCheck({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="6.2" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.3" />
      <path d="M5.2 8.1l1.8 1.8 3.8-3.9" stroke="#101828" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MotifSend({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M8 12.5V3.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M4.4 7.2L8 3.5l3.6 3.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** GitHub mark for the contact card (matches what the link opens). */
export function MotifGitHub({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden>
      <rect width="32" height="32" rx="9" fill="#101828" />
      <path
        fill="#FEF3C7"
        d="M16 7.2c-4.9 0-8.8 4-8.8 8.8 0 3.9 2.5 7.2 6 8.3.4.1.6-.2.6-.4v-1.5c-2.4.5-2.9-1-2.9-1-.4-1-.9-1.3-.9-1.3-.8-.5.1-.5.1-.5.8.1 1.3.9 1.3.9.8 1.3 2 1 2.5.7.1-.6.3-.9.6-1.2-1.9-.2-4-1-4-4.3 0-1 .3-1.7.9-2.3-.1-.2-.4-1.1.1-2.3 0 0 .8-.2 2.5.9a8.6 8.6 0 0 1 4.5 0c1.7-1.1 2.5-.9 2.5-.9.5 1.2.2 2.1.1 2.3.6.6.9 1.4.9 2.3 0 3.3-2.1 4.1-4 4.3.3.3.6.8.6 1.6v2.4c0 .2.2.5.6.4 3.5-1.1 6-4.4 6-8.3 0-4.8-3.9-8.8-8.8-8.8Z"
      />
    </svg>
  );
}

/** Chat / leave-a-note motif for the owner-inbox path. */
export function MotifNote({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden>
      <rect x="5" y="6" width="22" height="16" rx="5" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.6" />
      <path d="M11 22.5 8.5 27l5-2.2" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="12.5" cy="14" r="1.35" fill="#101828" />
      <circle cx="16.5" cy="14" r="1.35" fill="#101828" />
      <circle cx="20.5" cy="14" r="1.35" fill="#F59E0B" />
    </svg>
  );
}
