import { useId, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, m } from "motion/react";
import { AppWindow } from "@/components/ui/AppWindow";
import { Container } from "@/components/ui/Container";
import { TOURS, type TourId } from "@/data/tour";
import { SCREENS } from "@/features/mockups/screens";
import { cn } from "@/lib/cn";

const TOUR_IDS = Object.keys(TOURS) as TourId[];

function Screen({ name }: { name: keyof typeof SCREENS }) {
  const Component = SCREENS[name];
  return <Component />;
}

export function Tour() {
  const [tourId, setTourId] = useState<TourId>("teacher");
  const [stepIndex, setStepIndex] = useState(0);
  const uid = useId();
  const tabRefs = useRef<Partial<Record<TourId, HTMLButtonElement | null>>>({});

  const tour = TOURS[tourId];
  const step = tour.steps[stepIndex] ?? tour.steps[0]!;
  const panelId = `${uid}-panel`;
  const windowTitle = `SnapClass · ${tourId === "teacher" ? "Teacher" : "Student"}`;

  const selectTour = (id: TourId) => {
    setTourId(id);
    setStepIndex(0);
  };

  // Roving tabindex + arrow keys, as the tabs pattern expects.
  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const current = TOUR_IDS.indexOf(tourId);
    let next = current;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (current + 1) % TOUR_IDS.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (current - 1 + TOUR_IDS.length) % TOUR_IDS.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = TOUR_IDS.length - 1;
    else return;
    event.preventDefault();
    const nextId = TOUR_IDS[next]!;
    selectTour(nextId);
    tabRefs.current[nextId]?.focus();
  };

  return (
    <section id="tour" aria-labelledby="tour-title" className="py-20 lg:py-28">
      <Container>
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <h2 id="tour-title" className="type-title">
              Follow a class from setup to records
            </h2>
            <p className="type-lede mt-5 text-ink-soft">
              Illustrated screens, in the order a teacher and a student meet them. All names and numbers are sample data.
            </p>
          </div>

          <div role="tablist" aria-label="Choose a role" className="inline-flex shrink-0 rounded-control border-2 border-ink p-1">
            {TOUR_IDS.map((id) => {
              const selected = id === tourId;
              return (
                <button
                  key={id}
                  ref={(node) => {
                    tabRefs.current[id] = node;
                  }}
                  id={`${uid}-tab-${id}`}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls={panelId}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => selectTour(id)}
                  onKeyDown={onTabKeyDown}
                  className={cn(
                    "h-10 rounded-[0.4rem] px-5 text-[0.9375rem] font-semibold transition-colors duration-150",
                    selected ? "bg-ink text-paper" : "text-ink hover:bg-ink/8",
                  )}
                >
                  {TOURS[id].label}
                </button>
              );
            })}
          </div>
        </div>

        <div
          id={panelId}
          role="tabpanel"
          aria-labelledby={`${uid}-tab-${tourId}`}
          className="mt-12 grid gap-10 lg:grid-cols-12 lg:gap-14"
        >
          <ol className="lg:col-span-5">
            {tour.steps.map((item, index) => {
              const active = index === stepIndex;
              const bodyId = `${uid}-${item.id}-body`;
              return (
                <li key={item.id} className="relative border-l-2 border-line pl-6">
                  {/* The active marker sits on top of the rail. */}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute top-0 -left-0.5 h-full w-1 origin-top rounded-full bg-signal transition-transform duration-300 ease-(--ease-settle)",
                      active ? "scale-y-100" : "scale-y-0",
                    )}
                  />
                  <h3>
                    <button
                      type="button"
                      aria-expanded={active}
                      aria-controls={bodyId}
                      onClick={() => setStepIndex(index)}
                      className={cn(
                        "flex min-h-14 w-full items-baseline gap-3 py-3 text-left transition-colors",
                        active ? "text-ink" : "text-ink-soft hover:text-ink",
                      )}
                    >
                      <span className="type-heading w-5 shrink-0 text-base tabular-nums">{index + 1}</span>
                      <span className="type-heading text-[1.1875rem]">{item.title}</span>
                    </button>
                  </h3>
                  <div
                    id={bodyId}
                    inert={!active}
                    className={cn(
                      "grid transition-[grid-template-rows] duration-300 ease-(--ease-settle)",
                      active ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                    )}
                  >
                    <div className="overflow-hidden">
                      <p className="max-w-[30rem] pb-2 pl-8 text-ink-soft">{item.body}</p>
                      {/* On small screens the illustrated screen sits directly under the step you tapped. */}
                      {active && (
                        <div className="mt-3 mb-5 lg:hidden">
                          <AppWindow title={windowTitle} label={item.label}>
                            <Screen name={item.screen} />
                          </AppWindow>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="hidden lg:col-span-7 lg:block">
            <div className="sticky top-24">
              <AppWindow title={windowTitle} label={step.label}>
                <AnimatePresence initial={false}>
                  <m.div
                    key={step.screen}
                    className="absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, position: "absolute" }}
                    transition={{ duration: 0.25 }}
                  >
                    <Screen name={step.screen} />
                  </m.div>
                </AnimatePresence>
              </AppWindow>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
