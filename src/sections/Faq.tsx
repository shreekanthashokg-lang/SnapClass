import { Container } from "@/components/ui/Container";
import { Disclosure } from "@/components/ui/Disclosure";

const FAQS: ReadonlyArray<{ question: string; answer: string }> = [
  {
    question: "How do students join a class?",
    answer:
      "The teacher creates a subject, which gets a code, a shareable link and a QR code. A student opens the link or scans the code, confirms enrolment, and the subject appears on their dashboard.",
  },
  {
    question: "How does photo attendance work?",
    answer:
      "Pick a subject, add one or more class photos and run face analysis. SnapClass compares the faces with the students enrolled in that subject. Anyone found in any photo is marked present, and everyone else is marked absent.",
  },
  {
    question: "How does voice attendance work?",
    answer:
      "Pass the device to each student in turn and have them say “I am present.” SnapClass compares that voice with the sample the student enrolled and shows a similarity score. You can override any result before saving.",
  },
  {
    question: "Can I check the result before it is saved?",
    answer:
      "Yes. Every analysis ends in a report. Nothing is stored until you press Confirm & save. If the report looks wrong, discard it and run the analysis again, ideally with a clearer photo or a quieter recording.",
  },
  {
    question: "Where are records kept, and can I export them?",
    answer:
      "Confirmed sessions are stored in the SQLite database on the server that hosts SnapClass. The Attendance Records screen lists each session by subject and time, and you can download the log as CSV.",
  },
  {
    question: "What do I need to use it?",
    answer:
      "A modern browser. Students need a camera and a microphone once, to enroll. Photo attendance needs class photos, and voice attendance needs a microphone on the teacher's device.",
  },
  {
    question: "What is stored about a student's face and voice?",
    answer:
      "Only numbers. A face becomes a list of 128 values computed in the browser; the photo is never uploaded. A voice recording is sent to the server, turned into a short numeric voiceprint, and discarded. No photos or audio are kept.",
  },
  {
    question: "How accurate is it?",
    answer:
      "Face matching uses a well-known open model and works best with clear, well-lit, front-facing photos. Voice matching is a lightweight method and is less reliable, especially with background noise. That is why every report is shown to you first and each row can be overridden.",
  },
  {
    question: "What should I check before using it with a real class?",
    answer:
      "Faces and voices are personal data. Students register their own, and you should follow your institution's policy on biometric data and get any consent it requires before you roll SnapClass out.",
  },
];

export function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="py-20 lg:py-28">
      <Container className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <h2 id="faq-title" className="type-title">
            Questions teachers ask first
          </h2>
        </div>
        <div className="lg:col-span-8">
          {FAQS.map((item, index) => (
            <Disclosure key={item.question} question={item.question} defaultOpen={index === 0}>
              <p>{item.answer}</p>
            </Disclosure>
          ))}
        </div>
      </Container>
    </section>
  );
}
