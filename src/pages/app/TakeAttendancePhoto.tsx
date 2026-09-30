import { useEffect, useState } from "react";
import { Check, ImagePlus, Loader2, ScanFace, X } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, type PhotoPreviewRow, type Subject } from "@/lib/api";
import { detectAllFaces, loadImageFile } from "@/features/biometrics/face";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

type Stage = "collect" | "analyzing" | "review" | "saving" | "saved";

export function TakeAttendancePhoto() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [stage, setStage] = useState<Stage>("collect");
  const [faceCount, setFaceCount] = useState(0);
  const [rows, setRows] = useState<PhotoPreviewRow[]>([]);
  const [statuses, setStatuses] = useState<Record<number, "present" | "absent">>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<{ subject: Subject }>(`/subjects/${id}`).then(({ subject: s }) => setSubject(s));
  }, [id]);

  function addFiles(list: FileList | null) {
    if (!list) return;
    setFiles((prev) => [...prev, ...Array.from(list)]);
  }

  async function runAnalysis() {
    setError(null);
    setStage("analyzing");
    try {
      const descriptors: number[][] = [];
      for (const file of files) {
        const img = await loadImageFile(file);
        const faces = await detectAllFaces(img);
        descriptors.push(...faces.map((f) => f.descriptor));
      }
      const result = await api.post<{ threshold: number; faceCount: number; rows: PhotoPreviewRow[] }>(`/subjects/${id}/attendance/photo/preview`, {
        descriptors,
      });
      setFaceCount(result.faceCount);
      setRows(result.rows);
      setStatuses(Object.fromEntries(result.rows.map((r) => [r.studentId, r.present ? "present" : "absent"])));
      setStage("review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not analyse those photos.");
      setStage("collect");
    }
  }

  async function confirm() {
    setStage("saving");
    try {
      await api.post(`/subjects/${id}/attendance/confirm`, {
        method: "photo",
        records: rows.map((r) => ({ studentId: r.studentId, status: statuses[r.studentId], score: r.distance })),
      });
      setStage("saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save this report.");
      setStage("review");
    }
  }

  const presentCount = Object.values(statuses).filter((s) => s === "present").length;

  return (
    <div className="max-w-2xl">
      <p className="text-sm text-ink-soft">
        <Link to={`/app/teacher/subjects/${id}`} className="hover:underline">
          {subject?.code ?? "Subject"}
        </Link>{" "}
        / Take attendance (photo)
      </p>
      <h1 className="type-title mt-1 text-[1.75rem] sm:text-[2rem]">Photo attendance</h1>

      {stage === "collect" && (
        <div className="mt-6">
          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-frame border-2 border-dashed border-line bg-sheet px-6 py-10 text-center hover:border-brand">
            <ImagePlus aria-hidden className="size-8 text-brand" />
            <span className="font-semibold">Add one or more class photos</span>
            <span className="text-sm text-ink-soft">Faces are matched in your browser before anything is sent.</span>
            <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => addFiles(e.target.files)} />
          </label>

          {files.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2">
              {files.map((file, i) => (
                <li key={i} className="rounded-control bg-brand-soft px-3 py-1.5 text-sm text-brand-deep">
                  {file.name}
                </li>
              ))}
            </ul>
          )}

          {error && (
            <p role="alert" className="mt-4 text-sm text-absent">
              {error}
            </p>
          )}

          <Button className="mt-6" disabled={files.length === 0} onClick={runAnalysis}>
            <ScanFace aria-hidden className="size-4" /> Run face analysis
          </Button>
        </div>
      )}

      {stage === "analyzing" && (
        <div className="mt-10 flex items-center gap-3 text-ink-soft">
          <Loader2 className="size-5 animate-spin" aria-hidden /> Detecting faces in {files.length} photo{files.length === 1 ? "" : "s"}…
        </div>
      )}

      {(stage === "review" || stage === "saving" || stage === "saved") && (
        <div className="mt-6">
          <p className="mb-4 text-ink-soft">
            Found {faceCount} face{faceCount === 1 ? "" : "s"} across {files.length} photo{files.length === 1 ? "" : "s"}. Review before saving.
          </p>
          <div className="overflow-hidden rounded-frame border border-line bg-sheet">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-line bg-paper text-sm text-ink-soft">
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    Student
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    Distance
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.studentId} className="border-b border-line last:border-b-0">
                    <td className="px-4 py-3 font-medium">{row.name}</td>
                    <td className="px-4 py-3 text-sm text-ink-soft tabular-nums">
                      {row.reason === "not_enrolled" ? "No face enrolled" : (row.distance ?? "-")}
                    </td>
                    <td className="px-4 py-3">
                      <div role="group" aria-label={`Status for ${row.name}`} className="inline-flex overflow-hidden rounded-control border border-line">
                        {(["present", "absent"] as const).map((s) => (
                          <button
                            key={s}
                            type="button"
                            disabled={stage !== "review"}
                            onClick={() => setStatuses((prev) => ({ ...prev, [row.studentId]: s }))}
                            className={cn(
                              "px-3 py-1.5 text-sm font-semibold capitalize",
                              statuses[row.studentId] === s ? (s === "present" ? "bg-present-soft text-present" : "bg-absent-soft text-absent") : "bg-sheet text-ink-soft",
                            )}
                          >
                            {s === "present" ? <Check aria-hidden className="mr-1 inline size-3.5" /> : <X aria-hidden className="mr-1 inline size-3.5" />}
                            {s}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 font-semibold">
            {presentCount} of {rows.length} present
          </p>

          {error && (
            <p role="alert" className="mt-3 text-sm text-absent">
              {error}
            </p>
          )}

          <div className="mt-6 flex gap-3">
            {stage === "review" && (
              <>
                <Button variant="outline" onClick={() => setStage("collect")}>
                  Discard
                </Button>
                <Button onClick={confirm}>Confirm &amp; save</Button>
              </>
            )}
            {stage === "saving" && (
              <Button disabled>
                <Loader2 aria-hidden className="size-4 animate-spin" /> Saving…
              </Button>
            )}
            {stage === "saved" && (
              <>
                <p className="flex items-center gap-2 font-semibold text-present">
                  <Check aria-hidden className="size-5" /> Attendance saved
                </p>
                <Button variant="outline" onClick={() => navigate(`/app/teacher/subjects/${id}/records`)}>
                  View records
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
