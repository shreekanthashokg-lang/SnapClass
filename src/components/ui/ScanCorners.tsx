import { cn } from "@/lib/cn";

/** The four viewfinder corners that make up SnapClass's recurring motif. Decorative. */
export function ScanCorners({ className }: { className?: string }) {
  const corner = "absolute size-7 border-signal";
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0", className)}>
      <span className={cn(corner, "top-0 left-0 rounded-tl-xl border-t-[3px] border-l-[3px]")} />
      <span className={cn(corner, "top-0 right-0 rounded-tr-xl border-t-[3px] border-r-[3px]")} />
      <span className={cn(corner, "right-0 bottom-0 rounded-br-xl border-r-[3px] border-b-[3px]")} />
      <span className={cn(corner, "bottom-0 left-0 rounded-bl-xl border-b-[3px] border-l-[3px]")} />
    </div>
  );
}
