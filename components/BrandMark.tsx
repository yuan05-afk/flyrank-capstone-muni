import Link from "next/link";

export function BrandMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" aria-hidden="true">
      <rect width="40" height="40" rx="12" fill="#101828" />
      <circle cx="20" cy="20" r="11" fill="none" stroke="#FEF3C7" strokeWidth="2.2" />
      <circle cx="20" cy="21" r="7.2" fill="#D97706" />
      <circle cx="17.2" cy="19.2" r="1.15" fill="#101828" />
      <circle cx="22.8" cy="19.2" r="1.15" fill="#101828" />
      <path d="M17.4 23.2c1.4 1.3 3.8 1.3 5.2 0" fill="none" stroke="#101828" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="29.5" cy="10.5" r="2.2" fill="#F59E0B" />
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
