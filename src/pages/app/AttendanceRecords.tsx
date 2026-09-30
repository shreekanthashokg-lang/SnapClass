import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { api, type AttendanceSession, type Subject } from "@/lib/api";
import { ButtonLink } from "@/components/ui/Button";
import { AppLoading } from "@/features/app-shell/AppShell";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export function AttendanceRecords() {
  const { id } = useParams<{ id: string }>();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [sessions, setSessions] = useState<AttendanceSession[] | null>(null);

  useEffect(() => {
    api.get<{ subject: Subject }>(`/subjects/${id}`).then(({ subject: s }) => setSubject(s));
    api.get<{ sessions: AttendanceSession[] }>(`/subjects/${id}/attendance/records`).then(({ sessions: rows }) => setSessions(rows));
  }, [id]);

  if (!subject || !sessions) return <AppLoading />;

  return (
    <div>
      <p className="text-sm text-ink-soft">
        <Link to={`/app/teacher/subjects/${id}`} className="hover:underline">
          {subject.code}
        </Link>{" "}
        / Attendance records
      </p>
      <div className="mt-1 flex flex-wrap items-center justify-between gap-4">
        <h1 className="type-title text-[1.75rem] sm:text-[2rem]">Attendance records</h1>
        <ButtonLink variant="outline" href={`/api/subjects/${id}/attendance/records.csv`}>
          <Download aria-hidden className="size-4" /> Download CSV
        </ButtonLink>
      </div>

      {sessions.length === 0 ? (
        <p className="mt-6 text-ink-soft">No attendance has been taken for this subject yet.</p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-frame border border-line bg-sheet">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-line bg-paper text-sm text-ink-soft">
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Date and time
                </th>
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Method
                </th>
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Present
                </th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.id} className="border-b border-line last:border-b-0">
                  <td className="px-4 py-3">{formatDateTime(session.created_at)}</td>
                  <td className="px-4 py-3 capitalize">{session.method}</td>
                  <td className="px-4 py-3 tabular-nums">
                    {session.present_count} of {session.total_count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
