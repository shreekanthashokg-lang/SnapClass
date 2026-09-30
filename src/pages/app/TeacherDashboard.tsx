import { useEffect, useState, type FormEvent } from "react";
import { Loader2, Plus, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { api, ApiError, type Subject } from "@/lib/api";
import { useAuth } from "@/features/auth/AuthContext";
import { Button } from "@/components/ui/Button";

export function TeacherDashboard() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ code: "", name: "", section: "" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function loadSubjects() {
    api.get<{ subjects: Subject[] }>("/subjects/mine").then(({ subjects: s }) => setSubjects(s));
  }

  useEffect(loadSubjects, []);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await api.post("/subjects", form);
      setForm({ code: "", name: "", section: "" });
      setCreating(false);
      loadSubjects();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create the subject.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="type-title text-[2rem]">Welcome, {user?.displayName}</h1>
          <p className="mt-1 text-ink-soft">Your subjects</p>
        </div>
        <Button onClick={() => setCreating((c) => !c)}>
          <Plus aria-hidden className="size-4" /> New subject
        </Button>
      </div>

      {creating && (
        <form onSubmit={handleCreate} className="mt-6 max-w-lg space-y-4 rounded-frame border border-line bg-sheet p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="code" className="mb-1.5 block text-sm font-semibold text-ink-soft">
                Subject code
              </label>
              <input
                id="code"
                required
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                placeholder="CS111"
                className="h-11 w-full rounded-control border border-line bg-paper px-3.5 uppercase focus-visible:border-brand"
              />
            </div>
            <div>
              <label htmlFor="section" className="mb-1.5 block text-sm font-semibold text-ink-soft">
                Section (optional)
              </label>
              <input
                id="section"
                value={form.section}
                onChange={(e) => setForm((f) => ({ ...f, section: e.target.value }))}
                placeholder="A"
                className="h-11 w-full rounded-control border border-line bg-paper px-3.5 focus-visible:border-brand"
              />
            </div>
          </div>
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-semibold text-ink-soft">
              Subject name
            </label>
            <input
              id="name"
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Intro to Machine Learning"
              className="h-11 w-full rounded-control border border-line bg-paper px-3.5 focus-visible:border-brand"
            />
          </div>
          {error && (
            <p role="alert" className="text-sm text-absent">
              {error}
            </p>
          )}
          <Button type="submit" disabled={busy}>
            {busy && <Loader2 aria-hidden className="size-4 animate-spin" />}
            Create subject
          </Button>
        </form>
      )}

      <div className="mt-8">
        {subjects === null ? (
          <Loader2 className="size-6 animate-spin text-brand" aria-hidden />
        ) : subjects.length === 0 ? (
          <p className="text-ink-soft">No subjects yet. Create one to get started.</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.map((subject) => (
              <li key={subject.id}>
                <Link
                  to={`/app/teacher/subjects/${subject.id}`}
                  className="block rounded-frame border border-line bg-sheet p-5 transition-shadow hover:shadow-frame"
                >
                  <p className="type-heading text-[1.125rem]">{subject.name}</p>
                  <p className="mt-1 text-sm text-ink-soft">
                    {subject.code}
                    {subject.section ? ` · Section ${subject.section}` : ""}
                  </p>
                  <p className="mt-4 flex items-center gap-1.5 text-sm text-ink-soft">
                    <Users aria-hidden className="size-4" /> {subject.student_count ?? 0} students · {subject.session_count ?? 0} sessions
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
