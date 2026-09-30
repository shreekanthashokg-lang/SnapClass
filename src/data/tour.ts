import type { ScreenKey } from "@/features/mockups/screens";

export interface TourStep {
  id: string;
  title: string;
  body: string;
  screen: ScreenKey;
  /** Read by screen readers in place of the drawn screen. */
  label: string;
}

export type TourId = "teacher" | "student";

export const TOURS: Record<TourId, { label: string; steps: readonly TourStep[] }> = {
  teacher: {
    label: "For teachers",
    steps: [
      {
        id: "teacher-sign-in",
        title: "Sign in with a password",
        body: "Teachers sign in with a username and password, or register a new account.",
        screen: "teacher-sign-in",
        label: "Illustrated teacher sign-in card with username and password fields, a Sign in button and a Create account button.",
      },
      {
        id: "teacher-dashboard",
        title: "Start from the dashboard",
        body: "Take attendance, manage subjects and open attendance records from three shortcuts at the top.",
        screen: "teacher-dashboard",
        label: "Illustrated teacher dashboard with shortcuts for taking attendance, managing subjects and viewing records, above a list of subjects.",
      },
      {
        id: "teacher-create-subject",
        title: "Create a subject",
        body: "Enter a subject code, name and section. SnapClass creates the roster your students will join.",
        screen: "teacher-create-subject",
        label: "Illustrated dialog for creating a subject with subject code, subject name and section fields.",
      },
      {
        id: "teacher-share-code",
        title: "Share the link or QR code",
        body: "Every subject gets a class link and a QR code. Post either one and students enroll themselves.",
        screen: "teacher-share-code",
        label: "Illustrated dialog for sharing a class with a copyable link, the subject code and a sample code pattern.",
      },
      {
        id: "teacher-photo-attendance",
        title: "Take attendance from photos",
        body: "Pick a subject, add one or more class photos and run face analysis. Students found in any photo are marked present and everyone else absent. Review the report, then confirm or discard it.",
        screen: "teacher-photo-attendance",
        label: "Illustrated attendance report listing students, the photos they were found in and a Present or Absent status, with Discard and Confirm and save buttons.",
      },
      {
        id: "teacher-voice-attendance",
        title: "Or take it by voice",
        body: "Hand the device to each student in turn to say “I am present.” SnapClass compares each voice with the enrolled sample and shows a similarity score next to every name.",
        screen: "teacher-voice-attendance",
        label: "Illustrated voice roll-call dialog with an audio waveform and a table of students with voice match scores and statuses.",
      },
      {
        id: "teacher-records",
        title: "Keep the records",
        body: "Each confirmed session is stored by subject and time with its present count, and can be downloaded as CSV.",
        screen: "teacher-records",
        label: "Illustrated attendance records table with date and time, subject and present counts, plus a Download CSV button.",
      },
    ],
  },
  student: {
    label: "For students",
    steps: [
      {
        id: "student-biometrics",
        title: "Create an account and enroll",
        body: "Students register with a name, username and password, then capture a photo and a short voice sample once from their dashboard.",
        screen: "student-biometrics",
        label: "Illustrated face enrollment card with a camera view and a Take photo button.",
      },
      {
        id: "student-enroll",
        title: "Join a subject",
        body: "Open the teacher's class link or scan the QR code, then confirm enrolment in one tap.",
        screen: "student-enroll",
        label: "Illustrated dialog asking a student whether to join a subject, with Not now and Join subject buttons.",
      },
      {
        id: "student-dashboard",
        title: "Follow your subjects",
        body: "The student dashboard lists every enrolled subject with the classes held and the classes attended.",
        screen: "student-dashboard",
        label: "Illustrated student dashboard showing one subject with classes held and classes attended.",
      },
    ],
  },
};
