import { Check } from "lucide-react";
import { AppWindow } from "@/components/ui/AppWindow";
import { Container } from "@/components/ui/Container";
import { SCREENS } from "@/features/mockups/screens";

const POINTS = [
  "Every confirmed session is stored by subject and time.",
  "Present counts are visible at a glance, session by session.",
  "Download the log as CSV and keep working in your own spreadsheets.",
  "Nothing is stored until you press Confirm & save, so a bad photo never becomes a bad record.",
] as const;

export function Records() {
  const RecordsScreen = SCREENS["teacher-records"];
  return (
    <section id="records" aria-labelledby="records-title" className="border-y border-line bg-sheet py-20 lg:py-28">
      <Container className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <h2 id="records-title" className="type-title">
            Attendance records you can trust and reuse
          </h2>
          <ul className="mt-8 space-y-4">
            {POINTS.map((point) => (
              <li key={point} className="flex gap-3">
                <span className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-present-soft text-present">
                  <Check aria-hidden className="size-3.5" strokeWidth={3} />
                </span>
                <span className="text-ink-soft">{point}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-7">
          <AppWindow
            title="SnapClass · Teacher"
            label="Illustrated attendance records table with date and time, subject and present counts, plus a Download CSV button."
          >
            <RecordsScreen />
          </AppWindow>
          <p className="mt-3 px-1 text-sm text-ink-soft">Illustration with sample data.</p>
        </div>
      </Container>
    </section>
  );
}
