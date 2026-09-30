import { cn } from "@/lib/cn";

/** SnapClass mark: a viewfinder (scan) around a check (present). Same artwork as public/favicon.svg. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden className={cn("size-9", className)}>
      <rect width="40" height="40" rx="11" fill="#0B7A80" />
      <g fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 14V10a2 2 0 0 1 2-2h4" />
        <path d="M26 8h4a2 2 0 0 1 2 2v4" />
        <path d="M32 26v4a2 2 0 0 1-2 2h-4" />
        <path d="M14 32h-4a2 2 0 0 1-2-2v-4" />
      </g>
      <path d="M14.5 20.5l4 4 7.5-8.5" fill="none" stroke="#FF6A3D" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface LogoProps {
  className?: string;
  textClassName?: string;
}

export function Logo({ className, textClassName }: LogoProps) {
  return (
    <a href="#top" className={cn("inline-flex items-center gap-2.5", className)} aria-label="SnapClass, back to top">
      <LogoMark />
      <span className={cn("font-display text-[1.5rem] leading-none font-semibold tracking-tight", textClassName)}>SnapClass</span>
    </a>
  );
}
