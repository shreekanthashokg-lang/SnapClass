import { useEffect, useState } from "react";
import { AlertCircle, Check, Loader2, Mic, X } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, ApiError, type RosterEntry, type Subject, type VoiceCheckResult } from "@/lib/api";
import { VoiceCapture } from "@/features/biometrics/VoiceCapture";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

interface Row {
  studentId: number;
  name: string;
  hasVoice: boolean;
  status: "present" | "absent";
  similarity: number | null;
  checked: boolean;
}

export function TakeAttendanceVoice() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [activeStudentId, setActiveStudentId] = useState<number | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get<{ subject: Subject; roster: RosterEntry[] }>(`/subjects/${id}`).then(({ subject: s, roster }) => {
      setSubject(s);
      setRows(
        roster.map((r) => ({ studentId: r.id, name: r.display_name, hasVoice: r.has_voice, status: "absent", similarity: null, checked: false })),
      );
    });
  }, [id]);

  async function handleRecorded(studentId: number, blob: Blob) {
    setChecking(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("studentId", String(studentId));
      form.append("sample", blob, "sample.webm");
      const result = await api.postForm<VoiceCheckResult>(`/subjects/${id}/attendance/voice/check`, form);
      setRows((prev) =>
        prev.map((row) => (row.studentId === studentId ? { ...row, status: result.present ? "present" : "absent", similarity: result.similarity, checked: true } : row)),
      );
      setActiveStudentId(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not check that recording.");
    } finally {
      setChecking(false);
    }
  }

  async function confirm() {
    setSaving(true);
    setError(null);
    try {
      await api.post(`/subjects/${id}/attendance/confirm`, {
        method: "voice",
        records: rows.map((r) => ({ studentId: r.studentId, status: r.status, score: r.similarity })),
      });
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save this report.");
    } finally {
      setSaving(false);
    }
  }

  const presentCount = rows.filter((r) => r.status === "present").length;

  return (
    <div className="max-w-2xl">
      <p className="text-sm text-ink-soft">
        <Link to={`/app/teacher/subjects/${id}`} className="hover:underline">
          {subject?.code ?? "Subject"}
        </Link>{" "}
        / Take attendance (voice)
      </p>
      <h1 className="type-title mt-1 text-[1.75rem] sm:text-[2rem]">Voice roll-call</h1>
      <p className="mt-2 text-ink-soft">Hand the device to each student in turn and have them say “I am present.”</p>

      <ul className="mt-6 divide-y divide-line rounded-frame border border-line bg-sheet">
        {rows.map((row) => (
          <li key={row.studentId} className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium">{row.name}</p>
                {!row.hasVoice ? (
                  <p className="text-sm text-ink-soft">No voice enrolled</p>
                ) : row.checked ? (
                  <p className="text-sm text-ink-soft tabular-nums">similarity {row.similarity?.toFixed(2)}</p>
                ) : (
                  <p className="text-sm text-ink-soft">Not checked yet</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div role="group" aria-label={`Status for ${row.name}`} className="inline-flex overflow-hidden rounded-control border border-line">
                  {(["present", "absent"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRows((prev) => prev.map((r) => (r.studentId === row.studentId ? { ...r, status: s } : r)))}
                      className={cn(
                        "px-3 py-1.5 text-sm font-semibold capitalize",
                        row.status === s ? (s === "present" ? "bg-present-soft text-present" : "bg-absent-soft text-absent") : "bg-sheet text-ink-soft",
                      )}
                    >
                      {s === "present" ? <Check aria-hidden className="mr-1 inline size-3.5" /> : <X aria-hidden className="mr-1 inline size-3.5" />}
                      {s}
                    </button>
                  ))}
                </div>
                {row.hasVoice && (
                  <Button variant="outline" size="md" onClick={() => setActiveStudentId(row.studentId)}>
                    <Mic aria-hidden className="size-4" /> {row.checked ? "Recheck" : "Check"}
                  </Button>
                )}
              </div>
            </div>

            {activeStudentId === row.studentId && (
              <div className="mt-4 border-t border-line pt-4">
                <VoiceCapture onRecorded={(blob) => handleRecorded(row.studentId, blob)} busy={checking} />
              </div>
            )}
          </li>
        ))}
      </ul>

      <p className="mt-4 font-semibold">
        {presentCount} of {rows.length} present
      </p>

      {error && (
        <p role="alert" className="mt-3 flex items-center gap-2 text-sm text-absent">
          <AlertCircle aria-hidden className="size-4" /> {error}
        </p>
      )}

      <div className="mt-6 flex items-center gap-3">
        {saved ? (
          <>
            <p className="flex items-center gap-2 font-semibold text-present">
              <Check aria-hidden className="size-5" /> Attendance saved
            </p>
            <Button variant="outline" onClick={() => navigate(`/app/teacher/subjects/${id}/records`)}>
              View records
            </Button>
          </>
        ) : (
          <Button onClick={confirm} disabled={saving || rows.length === 0}>
            {saving && <Loader2 aria-hidden className="size-4 animate-spin" />}
            Confirm &amp; save
          </Button>
        )}
      </div>
    </div>
  );
}
