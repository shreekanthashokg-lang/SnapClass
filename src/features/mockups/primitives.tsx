import type { ReactNode } from "react";
import { FileDown, LayoutGrid, ScanFace, Users, type LucideIcon } from "lucide-react";
import { LogoMark } from "@/components/ui/Logo";
import { cn } from "@/lib/cn";

/* Building blocks for the illustrated screens. Everything is sized in cqw. */

const RAIL: ReadonlyArray<{ icon: LucideIcon }> = [
  { icon: ScanFace },
  { icon: Users },
  { icon: FileDown },
  { icon: LayoutGrid },
];

interface ShellProps {
  persona: "Teacher" | "Student";
  heading: string;
  /** Index of the highlighted rail icon. */
  active?: number;
  /** Dim the page behind a dialog. */
  dimmed?: boolean;
  children: ReactNode;
}

export function Shell({ persona, heading, active = 0, dimmed, children }: ShellProps) {
  return (
    <div className="flex h-full w-full">
      <div className="flex w-[10cqw] shrink-0 flex-col items-center gap-[2.4cqw] bg-ink py-[2.6cqw]">
        <LogoMark className="size-[5.6cqw]" />
        {RAIL.map(({ icon: Icon }, index) => (
          <span
            key={index}
            className={cn(
              "flex size-[5.6cqw] items-center justify-center rounded-[1.2cqw]",
              index === active ? "bg-brand text-white" : "text-ink-mute",
            )}
          >
            <Icon className="size-[3cqw]" />
          </span>
        ))}
      </div>
      <div className={cn("flex min-w-0 flex-1 flex-col transition-opacity", dimmed && "opacity-40")}>
        <div className="flex h-[8.6cqw] items-center justify-between border-b border-line bg-sheet px-[3cqw]">
          <p className="mk-md font-semibold">{heading}</p>
          <span className="mk-xs rounded-full bg-brand-soft px-[2cqw] py-[0.6cqw] font-semibold text-brand-deep">{persona}</span>
        </div>
        <div className="min-h-0 flex-1 p-[3cqw]">{children}</div>
      </div>
    </div>
  );
}

export function Dialog({ title, children, width = "58cqw" }: { title: string; children: ReactNode; width?: string }) {
  return (
    <div className="absolute inset-0 grid place-items-center bg-ink/45 p-[3cqw]">
      <div className="rounded-[1.8cqw] bg-sheet p-[3cqw] shadow-frame" style={{ width }}>
        <p className="mk-md mb-[2cqw] font-semibold">{title}</p>
        {children}
      </div>
    </div>
  );
}

type Tone = "primary" | "ink" | "outline";

export function MockButton({ children, tone = "primary" }: { children: ReactNode; tone?: Tone }) {
  const tones: Record<Tone, string> = {
    primary: "bg-brand text-white",
    ink: "bg-ink text-white",
    outline: "border border-ink text-ink",
  };
  return (
    <span className={cn("mk-sm inline-flex h-[6.2cqw] items-center rounded-[1.2cqw] px-[2.6cqw] font-semibold whitespace-nowrap", tones[tone])}>
      {children}
    </span>
  );
}

export function Field({ label, value, hint }: { label: string; value?: string; hint?: string }) {
  return (
    <div className="mb-[1.8cqw]">
      <p className="mk-xs mb-[0.6cqw] font-semibold text-ink-soft">{label}</p>
      <div className="mk-sm flex h-[6.2cqw] items-center rounded-[1.1cqw] border border-line bg-paper px-[2cqw]">
        <span className={value ? "text-ink" : "text-ink-soft"}>{value ?? hint}</span>
      </div>
    </div>
  );
}

export function StatusPill({ status }: { status: "present" | "absent" }) {
  return (
    <span
      className={cn(
        "mk-xs inline-flex items-center rounded-full px-[1.8cqw] py-[0.5cqw] font-semibold",
        status === "present" ? "bg-present-soft text-present" : "bg-absent-soft text-absent",
      )}
    >
      {status === "present" ? "Present" : "Absent"}
    </span>
  );
}

interface TableProps {
  columns: string;
  head: readonly string[];
  rows: ReadonlyArray<readonly ReactNode[]>;
}

/** A tiny grid table; `columns` is a CSS grid-template-columns value. */
export function MockTable({ columns, head, rows }: TableProps) {
  const style = { gridTemplateColumns: columns };
  return (
    <div className="overflow-hidden rounded-[1.4cqw] border border-line bg-sheet">
      <div className="mk-xs grid gap-[2cqw] bg-paper px-[2.4cqw] py-[1.4cqw] font-semibold text-ink-soft" style={style}>
        {head.map((h) => (
          <span key={h}>{h}</span>
        ))}
      </div>
      {rows.map((row, r) => (
        <div key={r} className="mk-sm grid items-center gap-[2cqw] border-t border-line px-[2.4cqw] py-[1.5cqw]" style={style}>
          {row.map((cell, c) => (
            <span key={c} className="min-w-0 truncate">
              {cell}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

/** A grey block standing in for a class photo. Deliberately abstract: no faces. */
export function PhotoPlaceholder({ label }: { label: string }) {
  return (
    <div className="relative flex-1 overflow-hidden rounded-[1.4cqw] bg-brand-soft">
      <div className="absolute right-[18%] bottom-0 left-[18%] h-[34%] rounded-t-full bg-brand/25" />
      <div className="absolute bottom-[26%] left-[42%] size-[7cqw] rounded-full bg-brand/25" />
      <span className="mk-xs absolute bottom-[1.4cqw] left-[2cqw] font-semibold text-brand-deep">{label}</span>
    </div>
  );
}
