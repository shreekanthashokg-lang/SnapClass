import { useEffect, useState } from "react";
import { AudioLines, ClipboardList, Copy, ScanFace, Check } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { api, type RosterEntry, type Subject } from "@/lib/api";
import { AppLoading } from "@/features/app-shell/AppShell";
import { RouterButtonLink } from "@/components/ui/Button";

export function SubjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<{ subject: Subject; roster: RosterEntry[] } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.get<{ subject: Subject; roster: RosterEntry[] }>(`/subjects/${id}`).then(setData);
  }, [id]);

  if (!data) return <AppLoading />;
  const { subject, roster } = data;
  const joinUrl = `${window.location.origin}/app/join?code=${subject.code}`;

  function copyLink() {
    navigator.clipboard.writeText(joinUrl).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div>
      <p className="text-sm text-ink-soft">
        <Link to="/app/teacher" className="hover:underline">
          Subjects
        </Link>{" "}
        / {subject.code}
      </p>
      <h1 className="type-title mt-1 text-[2rem]">{subject.name}</h1>
      <p className="mt-1 text-ink-soft">
        {subject.code}
        {subject.section ? ` · Section ${subject.section}` : ""}
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <RouterButtonLink to={`/app/teacher/subjects/${subject.id}/photo`}>
          <ScanFace aria-hidden className="size-4" /> Take attendance (photo)
        </RouterButtonLink>
        <RouterButtonLink to={`/app/teacher/subjects/${subject.id}/voice`}>
          <AudioLines aria-hidden className="size-4" /> Take attendance (voice)
        </RouterButtonLink>
        <RouterButtonLink variant="outline" to={`/app/teacher/subjects/${subject.id}/records`}>
          <ClipboardList aria-hidden className="size-4" /> Attendance records
        </RouterButtonLink>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-12">
        <section className="lg:col-span-7">
          <h2 className="type-heading text-[1.25rem]">Roster ({roster.length})</h2>
          {roster.length === 0 ? (
            <p className="mt-3 text-ink-soft">No students yet. Share the class link or QR code to the right.</p>
          ) : (
            <div className="mt-4 overflow-hidden rounded-frame border border-line bg-sheet">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-line bg-paper text-sm text-ink-soft">
                    <th scope="col" className="px-4 py-2.5 font-medium">
                      Student
                    </th>
                    <th scope="col" className="px-4 py-2.5 font-medium">
                      Face
                    </th>
                    <th scope="col" className="px-4 py-2.5 font-medium">
                      Voice
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {roster.map((student) => (
                    <tr key={student.id} className="border-b border-line last:border-b-0">
                      <td className="px-4 py-3">
                        <span className="block font-medium">{student.display_name}</span>
                        <span className="text-sm text-ink-soft">@{student.username}</span>
                      </td>
                      <td className="px-4 py-3">
                        {student.has_face ? <Check aria-hidden className="size-4 text-present" /> : <span className="text-sm text-ink-soft">Not yet</span>}
                      </td>
                      <td className="px-4 py-3">
                        {student.has_voice ? <Check aria-hidden className="size-4 text-present" /> : <span className="text-sm text-ink-soft">Not yet</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <aside className="lg:col-span-5">
          <h2 className="type-heading text-[1.25rem]">Share this class</h2>
          <div className="mt-4 rounded-frame border border-line bg-sheet p-6 text-center">
            <img src={`/api/subjects/${subject.id}/qrcode.png`} alt={`QR code to join ${subject.name}`} className="mx-auto size-48" width={192} height={192} />
            <p className="mt-4 font-mono text-lg font-semibold tracking-wide">{subject.code}</p>
            <button
              type="button"
              onClick={copyLink}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-deep underline underline-offset-2"
            >
              <Copy aria-hidden className="size-4" /> {copied ? "Copied!" : "Copy join link"}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
