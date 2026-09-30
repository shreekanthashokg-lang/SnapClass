import { useEffect, useReducer } from "react";
import { m, useReducedMotion } from "motion/react";
import { AudioLines, Check, ScanFace, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ScanCorners } from "@/components/ui/ScanCorners";
import { cn } from "@/lib/cn";
import { countPresent, outcomeFor, SAMPLE_STUDENTS, SAMPLE_SUBJECT, type Method } from "./data";
import { demoReducer, initialState, type Phase } from "./state";

const METHODS: ReadonlyArray<{ id: Method; label: string; icon: typeof ScanFace; action: string }> = [
  { id: "photo", label: "Class photos", icon: ScanFace, action: "Run face analysis" },
  { id: "voice", label: "Voice roll-call", icon: AudioLines, action: "Analyze voices" },
];

const TICK_MS = 520;
const AUTOPLAY_DELAY_MS = 1100;

type RowState = "pending" | "checking" | "present" | "absent";

function StatusChip({ state }: { state: RowState }) {
  const styles: Record<RowState, string> = {
    pending: "bg-paper text-ink-soft",
    checking: "bg-signal text-ink",
    present: "bg-present-soft text-present",
    absent: "bg-absent-soft text-absent",
  };
  const label = { pending: "Pending", checking: "Checking", present: "Present", absent: "Absent" }[state];
  return (
    <m.span
      key={state}
      initial={{ scale: 0.88, opacity: 0.4 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-semibold", styles[state])}
    >
      {state === "present" && <Check aria-hidden className="size-3.5" strokeWidth={3} />}
      {state === "absent" && <X aria-hidden className="size-3.5" strokeWidth={3} />}
      {label}
    </m.span>
  );
}

function statusMessage(phase: Phase, method: Method, present: number, revealed: number): string {
  const total = SAMPLE_STUDENTS.length;
  switch (phase) {
    case "idle":
      return "Sample register ready.";
    case "scanning":
      return `Checking ${method === "photo" ? "faces" : "voices"}: ${revealed} of ${total} students done.`;
    case "review":
      return `Report ready: ${present} of ${total} students present. Confirm or discard.`;
    case "saved":
      return `Attendance saved: ${present} present, ${total - present} absent.`;
    case "discarded":
      return "Report discarded. Nothing was saved.";
  }
}

export function RegisterDemo() {
  const [state, dispatch] = useReducer(demoReducer, initialState);
  const reduceMotion = useReducedMotion();
  const { method, phase, revealed } = state;
  const total = SAMPLE_STUDENTS.length;
  const present = countPresent(method);
  const activeMethod = METHODS.find((item) => item.id === method) ?? METHODS[0]!;

  // Advance one row at a time while scanning.
  useEffect(() => {
    if (phase !== "scanning") return;
    const timer = window.setTimeout(() => dispatch({ type: "tick" }), TICK_MS);
    return () => window.clearTimeout(timer);
  }, [phase, revealed]);

  // Play the demo once on load so the hero is alive; people who prefer reduced
  // motion get the finished report instead of an animation.
  useEffect(() => {
    const timer = window.setTimeout(
      () => dispatch(reduceMotion ? { type: "finishNow" } : { type: "start" }),
      AUTOPLAY_DELAY_MS,
    );
    return () => window.clearTimeout(timer);
  }, [reduceMotion]);

  const rowState = (index: number, isPresent: boolean): RowState => {
    if (index < revealed) return isPresent ? "present" : "absent";
    if (phase === "scanning" && index === revealed) return "checking";
    return "pending";
  };

  return (
    <figure id="demo" className="w-full">
      <div className="relative p-3.5">
        <ScanCorners />
      <div className="overflow-hidden rounded-sheet border border-ink/15 bg-sheet shadow-sheet">
        {/* Header: subject and method switch */}
        <div className="on-dark bg-ink px-4 py-4 text-paper sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
            <div className="min-w-0">
              <p className="type-heading text-[1.125rem] text-paper">Take attendance</p>
              <p className="truncate text-sm text-ink-mute">
                {SAMPLE_SUBJECT.name} ({SAMPLE_SUBJECT.code})
              </p>
            </div>
            <div role="group" aria-label="Attendance method" className="flex rounded-control bg-paper/10 p-1">
              {METHODS.map(({ id, label, icon: Icon }) => {
                const selected = id === method;
                return (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => dispatch({ type: "selectMethod", method: id })}
                    className={cn(
                      "inline-flex h-9 items-center gap-2 rounded-[0.5rem] px-3 text-sm font-semibold transition-colors duration-150",
                      selected ? "bg-signal text-ink" : "text-paper hover:bg-paper/15",
                    )}
                  >
                    <Icon aria-hidden className="size-4" />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Register */}
        <table className="w-full table-fixed border-collapse text-left">
          <caption className="sr-only">
            Sample attendance report for {SAMPLE_SUBJECT.name}. Students, IDs and scores are fictional.
          </caption>
          <colgroup>
            <col className="w-[40%]" />
            <col className="w-[30%]" />
            <col className="w-[30%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-line bg-paper/60 text-sm text-ink-soft">
              <th scope="col" className="py-2.5 pr-2 pl-4 font-medium sm:pl-6">
                Student
              </th>
              <th scope="col" className="px-2 py-2.5 font-medium">
                {method === "photo" ? "Found in" : "Match score"}
              </th>
              <th scope="col" className="py-2.5 pr-4 pl-2 font-medium sm:pr-6">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {SAMPLE_STUDENTS.map((student, index) => {
              const outcome = outcomeFor(student, method);
              const current = rowState(index, outcome.present);
              return (
                <tr
                  key={student.id}
                  className={cn(
                    "border-b border-line/80 transition-colors duration-300 last:border-b-0",
                    current === "checking" && "bg-signal-soft",
                  )}
                >
                  <th scope="row" className="py-3 pr-2 pl-4 font-medium sm:pl-6">
                    <span className="block leading-tight">{student.name}</span>
                    <span className="text-sm font-normal text-ink-soft tabular-nums">ID {student.id}</span>
                  </th>
                  <td className="px-2 py-3 text-[0.9375rem] text-ink-soft tabular-nums">
                    {index < revealed ? outcome.evidence : "–"}
                  </td>
                  <td className="py-3 pr-4 pl-2 sm:pr-6">
                    <StatusChip state={current} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Action bar: fixed height so the layout never jumps between phases */}
        <div className="flex min-h-[5.25rem] flex-wrap items-center justify-between gap-x-4 gap-y-3 border-t border-line bg-paper/60 px-4 py-4 sm:px-6">
          <div className="min-w-0 text-sm">
            {phase === "idle" && <p className="text-ink-soft">Press run to see how a report is built.</p>}
            {phase === "discarded" && <p className="font-medium text-ink">Discarded. Nothing was saved.</p>}
            {phase === "scanning" && (
              <div className="w-44">
                <p className="font-medium text-ink tabular-nums">
                  Checking {Math.min(revealed + 1, total)} of {total}
                </p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
                  <div
                    className="h-full rounded-full bg-brand transition-[width] duration-500 ease-linear"
                    style={{ width: `${(revealed / total) * 100}%` }}
                  />
                </div>
              </div>
            )}
            {phase === "review" && (
              <p className="text-ink-soft">
                <span className="type-heading block text-[1.375rem] text-ink tabular-nums">
                  {present} of {total} present
                </span>
                Review the report before saving.
              </p>
            )}
            {phase === "saved" && (
              <p className="flex items-center gap-2 font-semibold text-present">
                <Check aria-hidden className="size-5" strokeWidth={3} />
                Attendance saved
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {(phase === "idle" || phase === "discarded") && (
              <Button variant="primary" onClick={() => dispatch({ type: "start" })}>
                <activeMethod.icon aria-hidden className="size-4" />
                {activeMethod.action}
              </Button>
            )}
            {phase === "scanning" && (
              <Button variant="outline" onClick={() => dispatch({ type: "finishNow" })}>
                Skip to report
              </Button>
            )}
            {phase === "review" && (
              <>
                <Button variant="outline" onClick={() => dispatch({ type: "discard" })}>
                  Discard
                </Button>
                <Button variant="ink" onClick={() => dispatch({ type: "confirm" })}>
                  Confirm &amp; save
                </Button>
              </>
            )}
            {phase === "saved" && (
              <Button variant="outline" onClick={() => dispatch({ type: "reset" })}>
                Start over
              </Button>
            )}
          </div>
        </div>
      </div>
      </div>

      <figcaption className="mt-3 px-1 text-sm text-ink-soft">
        Interactive sample with made-up students, showing the analyse, review and confirm flow.
      </figcaption>
      <p role="status" className="sr-only">
        {statusMessage(phase, method, present, revealed)}
      </p>
    </figure>
  );
}

