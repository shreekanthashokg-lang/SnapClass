import type { ReactNode } from "react";

interface AppWindowProps {
  /** Short title shown in the window bar, e.g. "SnapClass · Teacher". */
  title: string;
  /** Description for screen readers; the drawn screen itself is presentational. */
  label: string;
  children: ReactNode;
}

/** Window chrome around an illustrated product screen. */
export function AppWindow({ title, label, children }: AppWindowProps) {
  return (
    <div className="overflow-hidden rounded-frame border border-ink/15 bg-sheet shadow-frame">
      <div className="flex items-center gap-3 border-b border-line bg-sheet px-3.5 py-2.5" aria-hidden>
        <div className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-line" />
          <span className="size-2.5 rounded-full bg-line" />
          <span className="size-2.5 rounded-full bg-line" />
        </div>
        <p className="min-w-0 flex-1 truncate text-center text-xs text-ink-soft">{title}</p>
        <div className="w-11" />
      </div>
      {/* @container makes the cqw units used inside the screen scale with this box. */}
      <div role="img" aria-label={label} className="@container relative aspect-3/2 overflow-hidden bg-paper">
        {children}
      </div>
    </div>
  );
}
