import Link from "next/link";

/** Focus ring + Muni face mark. */
export function BrandMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" aria-hidden="true">
      <rect width="40" height="40" rx="12" fill="#101828" />
      <circle cx="20" cy="20" r="11" fill="none" stroke="#FEF3C7" strokeWidth="2" />
      <circle cx="20" cy="21" r="7.5" fill="#F59E0B" />
      <circle cx="17.4" cy="19.4" r="1.25" fill="#101828" />
      <circle cx="22.6" cy="19.4" r="1.25" fill="#101828" />
      <path d="M17.2 23.4c1.6 1.4 4 1.4 5.6 0" fill="none" stroke="#101828" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="29" cy="11" r="2.1" fill="#FEF3C7" stroke="#D97706" strokeWidth="1" />
    </svg>
  );
}

export function BrandLockup({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2.5 font-display font-semibold text-ink focus-ring">
      <BrandMark />
      <span>Muni</span>
    </Link>
  );
}
