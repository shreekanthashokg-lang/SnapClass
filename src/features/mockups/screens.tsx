import type { ReactElement } from "react";
import { AudioLines, Camera, Download, ScanFace, Share2, Users } from "lucide-react";
import { LogoMark } from "@/components/ui/Logo";
import { outcomeFor, SAMPLE_STUDENTS, SAMPLE_SUBJECT } from "@/features/register-demo/data";
import { cn } from "@/lib/cn";
import { Dialog, Field, MockButton, MockTable, PhotoPlaceholder, Shell, StatusPill } from "./primitives";

/* Illustrated screens for the walkthrough. All names, numbers and codes are sample data. */

export type ScreenKey =
  | "teacher-sign-in"
  | "teacher-dashboard"
  | "teacher-create-subject"
  | "teacher-share-code"
  | "teacher-photo-attendance"
  | "teacher-voice-attendance"
  | "teacher-records"
  | "student-biometrics"
  | "student-enroll"
  | "student-dashboard";

const subject = `${SAMPLE_SUBJECT.name} (${SAMPLE_SUBJECT.code})`;

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="grid h-full w-full place-items-center p-[4cqw]">{children}</div>;
}

function TeacherSignIn() {
  return (
    <Centered>
      <div className="w-[52cqw] rounded-[2cqw] bg-sheet p-[4cqw] shadow-frame">
        <LogoMark className="mb-[2cqw] size-[7cqw]" />
        <p className="mk-lg mb-[2.4cqw]">Teacher sign in</p>
        <Field label="Username" hint="Your username" />
        <Field label="Password" value="••••••••••" />
        <div className="mt-[2.4cqw] flex gap-[1.6cqw]">
          <MockButton>Sign in</MockButton>
          <MockButton tone="outline">Create account</MockButton>
        </div>
      </div>
    </Centered>
  );
}

function TeacherDashboard() {
  const tiles = [
    { icon: ScanFace, label: "Take attendance" },
    { icon: Users, label: "Manage subjects" },
    { icon: Download, label: "Attendance records" },
  ];
  return (
    <Shell persona="Teacher" heading="Dashboard" active={0}>
      <div className="grid grid-cols-3 gap-[2cqw]">
        {tiles.map(({ icon: Icon, label }) => (
          <div key={label} className="rounded-[1.6cqw] border border-line bg-sheet p-[2.4cqw]">
            <span className="mb-[1.6cqw] flex size-[6cqw] items-center justify-center rounded-[1.2cqw] bg-brand-soft text-brand-deep">
              <Icon className="size-[3.2cqw]" />
            </span>
            <p className="mk-sm font-semibold">{label}</p>
          </div>
        ))}
      </div>
      <p className="mk-sm mt-[3cqw] mb-[1.4cqw] font-semibold text-ink-soft">Your subjects</p>
      <MockTable
        columns="1.6fr 0.7fr 0.5fr 0.6fr"
        head={["Subject", "Code", "Section", "Students"]}
        rows={[
          [SAMPLE_SUBJECT.name, SAMPLE_SUBJECT.code, "A", String(SAMPLE_STUDENTS.length)],
          ["Data Structures", "CS201", "B", "0"],
        ]}
      />
    </Shell>
  );
}

function CreateSubject() {
  return (
    <>
      <Shell persona="Teacher" heading="Subjects" active={1} dimmed>
        <MockTable columns="1.6fr 0.7fr" head={["Subject", "Code"]} rows={[[SAMPLE_SUBJECT.name, SAMPLE_SUBJECT.code]]} />
      </Shell>
      <Dialog title="Create a subject" width="52cqw">
        <Field label="Subject code" value="CS111" />
        <Field label="Subject name" value="Intro to Machine Learning" />
        <Field label="Section" value="A" />
        <MockButton>Create subject</MockButton>
      </Dialog>
    </>
  );
}

/** A deterministic decorative pattern. It is not a real QR code and is labelled as a sample. */
function SamplePattern() {
  const size = 11;
  const finder = (x: number, y: number) => (x < 3 && y < 3) || (x > size - 4 && y < 3) || (x < 3 && y > size - 4);
  return (
    <div className="grid aspect-square w-full grid-cols-11 gap-[0.5cqw] rounded-[1cqw] bg-paper p-[1.6cqw]">
      {Array.from({ length: size * size }, (_, i) => {
        const x = i % size;
        const y = Math.floor(i / size);
        const on = finder(x, y) || (x * 7 + y * 13 + x * y) % 3 === 0;
        return <span key={i} className={cn("rounded-[0.3cqw]", on ? "bg-ink" : "bg-transparent")} />;
      })}
    </div>
  );
}

function ShareCode() {
  return (
    <>
      <Shell persona="Teacher" heading="Subjects" active={1} dimmed>
        <MockTable columns="1.6fr 0.7fr" head={["Subject", "Code"]} rows={[[SAMPLE_SUBJECT.name, SAMPLE_SUBJECT.code]]} />
      </Shell>
      <Dialog title="Share this class" width="64cqw">
        <div className="flex gap-[3cqw]">
          <div className="flex-1">
            <Field label="Class link" value="/app/join?code=CS111" />
            <Field label="Subject code" value="CS111" />
            <span className="mk-xs inline-flex items-center gap-[1cqw] text-ink-soft">
              <Share2 className="size-[2.4cqw]" /> Post it or send it to students
            </span>
          </div>
          <div className="w-[20cqw] shrink-0">
            <SamplePattern />
            <p className="mk-xs mt-[0.8cqw] text-center text-ink-soft">Sample code</p>
          </div>
        </div>
      </Dialog>
    </>
  );
}

function PhotoAttendance() {
  return (
    <>
      <Shell persona="Teacher" heading="Take attendance" active={0} dimmed>
        <p className="mk-sm mb-[1.6cqw] font-semibold">{subject}</p>
        <div className="flex h-[26cqw] gap-[2cqw]">
          <PhotoPlaceholder label="Photo 1" />
          <PhotoPlaceholder label="Photo 2" />
        </div>
      </Shell>
      <Dialog title="Attendance report" width="66cqw">
        <MockTable
          columns="1.3fr 1.2fr 0.9fr"
          head={["Student", "Found in", "Status"]}
          rows={SAMPLE_STUDENTS.slice(0, 4).map((s) => {
            const o = outcomeFor(s, "photo");
            return [s.name, o.evidence, <StatusPill key={s.id} status={o.present ? "present" : "absent"} />];
          })}
        />
        <div className="mt-[2cqw] flex justify-end gap-[1.6cqw]">
          <MockButton tone="outline">Discard</MockButton>
          <MockButton tone="ink">Confirm &amp; save</MockButton>
        </div>
      </Dialog>
    </>
  );
}

function VoiceAttendance() {
  const bars = [30, 55, 40, 75, 90, 60, 35, 70, 85, 50, 30, 62, 78, 44, 26, 58, 68, 38];
  return (
    <>
      <Shell persona="Teacher" heading="Take attendance" active={0} dimmed>
        <p className="mk-sm font-semibold">{subject}</p>
      </Shell>
      <Dialog title="Voice roll-call" width="66cqw">
        <div className="mb-[2cqw] flex h-[9cqw] items-center gap-[1.6cqw] rounded-[1.4cqw] bg-paper px-[2cqw]">
          <span className="flex size-[5.6cqw] shrink-0 items-center justify-center rounded-full bg-brand text-white">
            <AudioLines className="size-[3cqw]" />
          </span>
          <div className="flex h-full flex-1 items-center gap-[0.7cqw]">
            {bars.map((h, i) => (
              <span key={i} className="w-[1cqw] rounded-full bg-brand/70" style={{ height: `${h * 0.7}%` }} />
            ))}
          </div>
          <span className="mk-xs text-ink-soft tabular-nums">0:24</span>
        </div>
        <MockTable
          columns="1.3fr 0.9fr 0.9fr"
          head={["Student", "Match score", "Status"]}
          rows={SAMPLE_STUDENTS.slice(0, 3).map((s) => {
            const o = outcomeFor(s, "voice");
            return [s.name, o.evidence, <StatusPill key={s.id} status={o.present ? "present" : "absent"} />];
          })}
        />
      </Dialog>
    </>
  );
}

function Records() {
  return (
    <Shell persona="Teacher" heading="Attendance records" active={2}>
      <div className="mb-[2cqw] flex items-center justify-between">
        <p className="mk-sm font-semibold">{subject}</p>
        <MockButton tone="outline">Download CSV</MockButton>
      </div>
      <MockTable
        columns="1.2fr 1.2fr 0.9fr"
        head={["Date and time", "Subject", "Present"]}
        rows={[
          ["20 Sep, 09:52", SAMPLE_SUBJECT.code, "5 of 6"],
          ["19 Sep, 09:48", SAMPLE_SUBJECT.code, "4 of 6"],
          ["18 Sep, 09:50", SAMPLE_SUBJECT.code, "6 of 6"],
          ["17 Sep, 09:47", SAMPLE_SUBJECT.code, "5 of 6"],
        ]}
      />
    </Shell>
  );
}

function StudentBiometrics() {
  return (
    <Centered>
      <div className="w-[46cqw] rounded-[2cqw] bg-sheet p-[3.4cqw] shadow-frame">
        <p className="mk-lg mb-[2cqw]">Enroll your face</p>
        <div className="relative mb-[2.4cqw] flex aspect-4/3 items-center justify-center rounded-[1.4cqw] bg-ink">
          <div className="h-[62%] w-[38%] rounded-full border-2 border-dashed border-ink-mute/70" />
          {(["top-2 left-2 border-t-2 border-l-2", "top-2 right-2 border-t-2 border-r-2", "right-2 bottom-2 border-r-2 border-b-2", "bottom-2 left-2 border-b-2 border-l-2"] as const).map((c) => (
            <span key={c} className={cn("absolute size-[4cqw] border-signal", c)} />
          ))}
        </div>
        <MockButton>
          <Camera className="mr-[1.2cqw] size-[2.8cqw]" /> Take photo
        </MockButton>
      </div>
    </Centered>
  );
}

function StudentEnroll() {
  return (
    <>
      <Shell persona="Student" heading="My subjects" active={1} dimmed>
        <p className="mk-sm text-ink-soft">You are not enrolled in any subjects yet.</p>
      </Shell>
      <Dialog title="Join this subject?" width="54cqw">
        <p className="mk-sm mb-[2.4cqw] text-ink-soft">
          Enroll in <span className="font-semibold text-ink">{subject}</span>?
        </p>
        <div className="flex gap-[1.6cqw]">
          <MockButton tone="outline">Not now</MockButton>
          <MockButton>Join subject</MockButton>
        </div>
      </Dialog>
    </>
  );
}

function StudentDashboard() {
  return (
    <Shell persona="Student" heading="My subjects" active={1}>
      <div className="rounded-[1.8cqw] border border-line bg-sheet p-[3cqw]">
        <p className="mk-md font-semibold">{SAMPLE_SUBJECT.name}</p>
        <p className="mk-xs mb-[2.4cqw] text-ink-soft">
          {SAMPLE_SUBJECT.code} · Section A
        </p>
        <div className="flex gap-[3cqw]">
          <div>
            <p className="mk-lg">12</p>
            <p className="mk-xs text-ink-soft">Classes held</p>
          </div>
          <div>
            <p className="mk-lg">10</p>
            <p className="mk-xs text-ink-soft">Classes attended</p>
          </div>
        </div>
      </div>
    </Shell>
  );
}

export const SCREENS: Record<ScreenKey, () => ReactElement> = {
  "teacher-sign-in": TeacherSignIn,
  "teacher-dashboard": TeacherDashboard,
  "teacher-create-subject": CreateSubject,
  "teacher-share-code": ShareCode,
  "teacher-photo-attendance": PhotoAttendance,
  "teacher-voice-attendance": VoiceAttendance,
  "teacher-records": Records,
  "student-biometrics": StudentBiometrics,
  "student-enroll": StudentEnroll,
  "student-dashboard": StudentDashboard,
};
