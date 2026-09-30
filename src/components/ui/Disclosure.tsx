import { useId, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

interface DisclosureProps {
  question: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

/** Accessible accordion item: a real button controlling a labelled region. */
export function Disclosure({ question, defaultOpen = false, children }: DisclosureProps) {
  const [open, setOpen] = useState(defaultOpen);
  const uid = useId();
  const buttonId = `${uid}-button`;
  const panelId = `${uid}-panel`;

  return (
    <div className="border-b border-line first:border-t">
      <h3>
        <button
          id={buttonId}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
          className="flex min-h-14 w-full items-center justify-between gap-6 py-4 text-left"
        >
          <span className="type-heading text-[1.1875rem]">{question}</span>
          <ChevronDown
            aria-hidden
            className={cn("size-5 shrink-0 text-ink-soft transition-transform duration-300", open && "rotate-180")}
          />
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        inert={!open}
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-(--ease-settle)",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="max-w-[40rem] pb-6 text-ink-soft">{children}</div>
        </div>
      </div>
    </div>
  );
}
