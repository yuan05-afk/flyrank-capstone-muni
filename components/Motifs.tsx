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
