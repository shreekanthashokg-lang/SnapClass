import { AudioLines, FileDown, QrCode, ScanFace, type LucideIcon } from "lucide-react";
import { Container } from "@/components/ui/Container";

interface Capability {
  icon: LucideIcon;
  name: string;
  input: string;
  output: string;
}

const CAPABILITIES: readonly Capability[] = [
  {
    icon: ScanFace,
    name: "Face attendance",
    input: "One or more class photos.",
    output: "Present or absent for every enrolled student, with the photos each was found in.",
  },
  {
    icon: AudioLines,
    name: "Voice roll-call",
    input: "A short recording of each student saying “I am present”.",
    output: "Present or absent for every student, with a voice match score.",
  },
  {
    icon: QrCode,
    name: "QR enrolment",
    input: "A subject code, name and section.",
    output: "A class link and QR code. Students join by opening or scanning it.",
  },
  {
    icon: FileDown,
    name: "Attendance records",
    input: "Every session you confirm.",
    output: "A log by subject and time, with present counts, that you can download as CSV.",
  },
];

export function Capabilities() {
  return (
    <section id="capabilities" aria-labelledby="capabilities-title" className="border-y border-line bg-sheet py-20 lg:py-28">
      <Container>
        <div className="max-w-2xl">
          <h2 id="capabilities-title" className="type-title">
            What SnapClass handles for a class
          </h2>
          <p className="type-lede mt-5 text-ink-soft">
            Four jobs a teacher used to do by hand, each with a clear input and a clear result.
          </p>
        </div>

        <div className="mt-14 border-t-2 border-ink">
          <div
            aria-hidden
            className="hidden grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1.5fr)] gap-8 border-b border-line py-3 text-sm font-medium text-ink-soft md:grid"
          >
            <span>Job</span>
            <span>You provide</span>
            <span>SnapClass returns</span>
          </div>
          <dl>
          {CAPABILITIES.map(({ icon: Icon, name, input, output }) => (
            <div
              key={name}
              className="grid gap-x-8 gap-y-3 border-b border-line py-7 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1.5fr)] md:py-8"
            >
              <dt className="flex items-center gap-3.5">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-control bg-brand-soft text-brand-deep">
                  <Icon aria-hidden className="size-5" />
                </span>
                <span className="type-heading">{name}</span>
              </dt>
              <dd className="text-ink-soft">
                <span className="mb-1 block text-sm font-medium text-ink md:sr-only">You provide</span>
                {input}
              </dd>
              <dd>
                <span className="mb-1 block text-sm font-medium text-ink-soft md:sr-only">SnapClass returns</span>
                {output}
              </dd>
            </div>
          ))}
          </dl>
        </div>
      </Container>
    </section>
  );
}
