import { ArrowRight, ArrowDown } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/cn";

interface Node {
  title: string;
  detail: string;
  /** The human checkpoint gets the highlighter treatment. */
  highlight?: boolean;
}

interface Stage {
  name: string;
  nodes: readonly Node[];
}

const STAGES: readonly Stage[] = [
  {
    name: "Capture",
    nodes: [
      { title: "Class photos", detail: "Added in the teacher's browser" },
      { title: "Voice clip", detail: "Recorded on the device, one student at a time" },
    ],
  },
  {
    name: "Encode",
    nodes: [
      { title: "Face descriptors", detail: "128 numbers per face, computed in the browser" },
      { title: "Voiceprints", detail: "Averaged speech features, computed on the server" },
    ],
  },
  {
    name: "Match",
    nodes: [
      {
        title: "Compare with enrolled students",
        detail: "A face matches within a set distance, a voice above a similarity threshold. Every score is shown.",
      },
    ],
  },
  {
    name: "Confirm",
    nodes: [
      { title: "Teacher reviews the report", detail: "Override any row, then confirm & save or discard", highlight: true },
      { title: "Saved to the database", detail: "Records per subject, exportable as CSV" },
    ],
  },
];

const BIOMETRIC_STACK = [
  { name: "face-api.js", role: "Face detection and 128-number face descriptors. It runs in the browser, so photos are never uploaded." },
  { name: "Meyda, FFmpeg", role: "Voiceprints from a short recording, computed on the server. The audio itself is not kept." },
  { name: "Express, SQLite", role: "Accounts, subjects, enrollment and attendance records, served by one small Node process." },
  { name: "bcrypt, signed cookies", role: "Passwords are hashed. Sessions live in HttpOnly cookies and sign-in is rate-limited." },
] as const;

const WEB_STACK = [
  { name: "React 19, TypeScript", role: "Typed components; the marketing page is prerendered to static HTML." },
  { name: "Tailwind CSS 4", role: "One design-token file drives colour, type and spacing; fonts are Fraunces and Hanken Grotesk." },
  { name: "Motion", role: "Small, purposeful transitions that respect reduced-motion settings." },
  { name: "Vite", role: "Fast builds with hashed, cache-friendly assets." },
] as const;

function StackList({ title, items }: { title: string; items: ReadonlyArray<{ name: string; role: string }> }) {
  return (
    <div>
      <h3 className="type-heading text-[1.25rem]">{title}</h3>
      <dl className="mt-4 border-t-2 border-signal">
        {items.map((item) => (
          <div key={item.name} className="grid gap-1 border-b border-paper/15 py-4 sm:grid-cols-[minmax(0,12rem)_1fr] sm:gap-6">
            <dt className="font-semibold">{item.name}</dt>
            <dd className="text-ink-mute">{item.role}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function UnderTheHood() {
  return (
    <section id="stack" aria-labelledby="stack-title" className="on-dark bg-ink py-20 text-paper lg:py-28">
      <Container>
        <div className="max-w-2xl">
          <h2 id="stack-title" className="type-title">
            What runs behind the screens
          </h2>
          <p className="type-lede mt-5 text-ink-mute">
            Faces and voices are turned into numbers, compared with what each student enrolled, and handed to the
            teacher as a report. The last step is always a person.
          </p>
        </div>

        <ol className="mt-14 grid gap-4 lg:grid-cols-4 lg:gap-x-9">
          {STAGES.map((stage, stageIndex) => (
            <li key={stage.name} className="flex flex-col">
              <h3 className="mb-3 text-sm font-medium text-ink-mute">{stage.name}</h3>
              <div className="relative flex flex-1 flex-col gap-3">
                {stage.nodes.map((node) => (
                  <div
                    key={node.title}
                    className={cn(
                      "flex flex-1 flex-col justify-center rounded-frame border p-4",
                      node.highlight ? "border-signal bg-signal text-ink" : "border-paper/25 bg-paper/5",
                    )}
                  >
                    <p className="font-semibold">{node.title}</p>
                    <p className={cn("mt-1 text-[0.9375rem]", node.highlight ? "text-ink" : "text-ink-mute")}>{node.detail}</p>
                  </div>
                ))}
                {stageIndex < STAGES.length - 1 && (
                  <ArrowRight
                    aria-hidden
                    className="absolute top-1/2 -right-[1.625rem] z-10 hidden size-5 -translate-y-1/2 text-signal lg:block"
                  />
                )}
              </div>
              {stageIndex < STAGES.length - 1 && <ArrowDown aria-hidden className="mx-auto mt-4 size-5 text-signal lg:hidden" />}
            </li>
          ))}
        </ol>

        <div className="mt-20 grid gap-12 lg:grid-cols-2 lg:gap-16">
          <StackList title="Face, voice and data" items={BIOMETRIC_STACK} />
          <StackList title="The web app" items={WEB_STACK} />
        </div>
      </Container>
    </section>
  );
}
