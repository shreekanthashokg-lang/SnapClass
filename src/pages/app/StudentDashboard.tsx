import { useEffect, useState, type FormEvent } from "react";
import { AlertCircle, Fingerprint, Loader2 } from "lucide-react";
import { api, ApiError, type SessionUser, type StudentSubject, type Subject } from "@/lib/api";
import { useAuth } from "@/features/auth/AuthContext";
import { Button, RouterButtonLink } from "@/components/ui/Button";

export function StudentDashboard() {
  const { user, refresh } = useAuth();
  const [subjects, setSubjects] = useState<StudentSubject[] | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function loadSubjects() {
    api.get<{ subjects: StudentSubject[] }>("/subjects/mine/student").then(({ subjects: s }) => setSubjects(s));
  }

  useEffect(loadSubjects, []);
  useEffect(() => {
    void refresh(); // pick up enrollment status if the person just came from /app/student/enroll
    // Runs once on mount; refresh is stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleJoin(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await api.post<{ subject: Subject }>("/subjects/join", { code });
      setCode("");
      loadSubjects();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not join that subject.");
    } finally {
      setBusy(false);
    }
  }

  const needsEnrollment = user && (!user.enrolled?.face || !user.enrolled?.voice);

  return (
    <div>
      <h1 className="type-title text-[2rem]">Welcome, {user?.displayName}</h1>

      {needsEnrollment && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-frame border border-signal bg-signal-soft p-5">
          <div className="flex items-center gap-3">
            <Fingerprint aria-hidden className="size-6 shrink-0 text-ink" />
            <p>
              Finish enrolling your <MissingBits user={user} /> so teachers can mark you present.
            </p>
          </div>
          <RouterButtonLink to="/app/student/enroll" variant="ink" size="md" className="shrink-0">
            Enroll now
          </RouterButtonLink>
        </div>
      )}

      <form onSubmit={handleJoin} className="mt-8 flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="joinCode" className="mb-1.5 block text-sm font-semibold text-ink-soft">
            Join a subject with its code
          </label>
          <input
            id="joinCode"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="CS111"
            required
            className="h-11 w-48 rounded-control border border-line bg-sheet px-3.5 uppercase focus-visible:border-brand"
          />
        </div>
        <Button type="submit" disabled={busy}>
          {busy && <Loader2 aria-hidden className="size-4 animate-spin" />}
          Join
        </Button>
      </form>
      {error && (
        <p role="alert" className="mt-2 flex items-center gap-2 text-sm text-absent">
          <AlertCircle aria-hidden className="size-4" /> {error}
        </p>
      )}

      <div className="mt-8">
        <h2 className="type-heading text-[1.25rem]">Your subjects</h2>
        {subjects === null ? (
          <Loader2 className="mt-4 size-6 animate-spin text-brand" aria-hidden />
        ) : subjects.length === 0 ? (
          <p className="mt-3 text-ink-soft">You are not enrolled in any subjects yet. Join one above.</p>
        ) : (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.map((subject) => (
              <li key={subject.id} className="rounded-frame border border-line bg-sheet p-5">
                <p className="type-heading text-[1.125rem]">{subject.name}</p>
                <p className="mt-1 text-sm text-ink-soft">
                  {subject.code}
                  {subject.section ? ` · Section ${subject.section}` : ""}
                </p>
                <div className="mt-4 flex gap-6">
                  <div>
                    <p className="type-heading text-[1.375rem] tabular-nums">{subject.classes_held}</p>
                    <p className="text-sm text-ink-soft">Classes held</p>
                  </div>
                  <div>
                    <p className="type-heading text-[1.375rem] tabular-nums">{subject.classes_attended}</p>
                    <p className="text-sm text-ink-soft">Attended</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function MissingBits({ user }: { user: SessionUser | null }) {
  const missing = [!user?.enrolled?.face && "face", !user?.enrolled?.voice && "voice"].filter(Boolean);
  return <>{missing.join(" and ")}</>;
}
