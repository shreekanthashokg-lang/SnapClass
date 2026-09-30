/** Illustrative sample data for the hero demo. Every name, ID and score is fictional. */

export type Method = "photo" | "voice";

export interface SampleStudent {
  id: number;
  name: string;
  photo: { present: boolean; foundIn: string };
  voice: { present: boolean; score: number | null };
}

export const SAMPLE_SUBJECT = { name: "Intro to Machine Learning", code: "CS111" } as const;

export const SAMPLE_STUDENTS: readonly SampleStudent[] = [
  { id: 3, name: "Aarav Menon", photo: { present: true, foundIn: "Photo 1, Photo 2" }, voice: { present: true, score: 0.83 } },
  { id: 5, name: "Diya Kapoor", photo: { present: true, foundIn: "Photo 1" }, voice: { present: false, score: null } },
  { id: 8, name: "Kabir Rao", photo: { present: true, foundIn: "Photo 1, Photo 2" }, voice: { present: true, score: 0.77 } },
  { id: 11, name: "Meera Nair", photo: { present: true, foundIn: "Photo 2" }, voice: { present: true, score: 0.71 } },
  { id: 14, name: "Rohan Shah", photo: { present: true, foundIn: "Photo 2" }, voice: { present: true, score: 0.79 } },
  { id: 17, name: "Sana Qureshi", photo: { present: false, foundIn: "" }, voice: { present: false, score: null } },
];

export interface Outcome {
  present: boolean;
  /** What the report shows next to the student: the photos they were found in, or a match score. */
  evidence: string;
}

export function outcomeFor(student: SampleStudent, method: Method): Outcome {
  if (method === "photo") {
    return { present: student.photo.present, evidence: student.photo.present ? student.photo.foundIn : "–" };
  }
  return {
    present: student.voice.present,
    evidence: student.voice.score === null ? "–" : student.voice.score.toFixed(2),
  };
}

export function countPresent(method: Method): number {
  return SAMPLE_STUDENTS.filter((student) => outcomeFor(student, method).present).length;
}
