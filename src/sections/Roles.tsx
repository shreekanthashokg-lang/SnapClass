import { Camera, ClipboardCheck, FilePlus2, Link2, ScanFace, ScrollText, UserRoundCheck, type LucideIcon } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/cn";

interface Item {
  icon: LucideIcon;
  title: string;
  body: string;
}

const TEACHER: readonly Item[] = [
  { icon: FilePlus2, title: "Set up a subject", body: "Enter a code, name and section once. That is the roster students join." },
  { icon: Link2, title: "Share a link or QR code", body: "Students enroll themselves, so you never type a name list." },
  { icon: Camera, title: "Take attendance your way", body: "Add class photos, or have each student say “I am present” to your device." },
  { icon: ClipboardCheck, title: "Confirm before it counts", body: "Review the report, then save it or discard it and try again." },
];

const STUDENT: readonly Item[] = [
  { icon: ScanFace, title: "Register once", body: "Enroll your face and voice a single time." },
  { icon: UserRoundCheck, title: "Join with a tap", body: "Open the class link or scan the QR code to enroll in a subject." },
  { icon: ScrollText, title: "See your attendance", body: "Your dashboard lists each subject with classes held and attended." },
];

function ItemList({ items, tone }: { items: readonly Item[]; tone: "dark" | "light" }) {
  return (
    <ul className="mt-8 space-y-6">
      {items.map(({ icon: Icon, title, body }) => (
        <li key={title} className="flex gap-4">
          <span
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-control",
              tone === "dark" ? "bg-signal text-ink" : "bg-brand text-white",
            )}
          >
            <Icon aria-hidden className="size-5" />
          </span>
          <div>
            <h4 className="type-heading text-[1.125rem]">{title}</h4>
            <p className={cn("mt-1", tone === "dark" ? "text-ink-mute" : "text-ink-soft")}>{body}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function Roles() {
  return (
    <section id="roles" aria-labelledby="roles-title" className="py-20 lg:py-28">
      <Container>
        <div className="max-w-2xl">
          <h2 id="roles-title" className="type-title">
            One register, two points of view
          </h2>
          <p className="type-lede mt-5 text-ink-soft">
            Teachers run the class. Students only do what only they can do: enroll and show up.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-12">
          <article className="on-dark rounded-sheet bg-ink p-8 text-paper sm:p-10 lg:col-span-7">
            <h3 className="type-title text-[1.75rem] sm:text-[2rem]">The teacher experience</h3>
            <ItemList items={TEACHER} tone="dark" />
          </article>
          <article className="rounded-sheet bg-brand-soft p-8 sm:p-10 lg:col-span-5">
            <h3 className="type-title text-[1.75rem] sm:text-[2rem]">The student experience</h3>
            <ItemList items={STUDENT} tone="light" />
          </article>
        </div>
      </Container>
    </section>
  );
}
