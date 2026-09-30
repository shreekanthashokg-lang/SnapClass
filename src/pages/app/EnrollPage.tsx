import { useState } from "react";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/features/auth/AuthContext";
import { FaceCapture } from "@/features/biometrics/FaceCapture";
import { VoiceCapture } from "@/features/biometrics/VoiceCapture";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

type StepStatus = "todo" | "done";

export function EnrollPage() {
  const { user, refresh } = useAuth();
  const navigate = useNavigate();
  const [faceStatus, setFaceStatus] = useState<StepStatus>(user?.enrolled?.face ? "done" : "todo");
  const [voiceStatus, setVoiceStatus] = useState<StepStatus>(user?.enrolled?.voice ? "done" : "todo");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitFace(descriptor: number[]) {
    setBusy(true);
    setError(null);
    try {
      await api.post("/enroll/face", { descriptor });
      setFaceStatus("done");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save your face enrollment.");
    } finally {
      setBusy(false);
    }
  }

  async function submitVoice(blob: Blob) {
    setBusy(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("sample", blob, "sample.webm");
      await api.postForm("/enroll/voice", form);
      setVoiceStatus("done");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save your voice enrollment.");
    } finally {
      setBusy(false);
    }
  }

  const bothDone = faceStatus === "done" && voiceStatus === "done";

  async function finish() {
    await refresh();
    navigate("/app/student");
  }

  return (
    <div className="max-w-2xl">
      <h1 className="type-title text-[2rem]">Enroll your biometrics</h1>
      <p className="mt-2 text-ink-soft">This lets teachers mark you present from a class photo or a voice roll-call.</p>

      {error && (
        <p role="alert" className="mt-4 text-sm text-absent">
          {error}
        </p>
      )}

      <div className="mt-8 grid gap-8 sm:grid-cols-2">
        <section>
          <StepHeading step={1} label="Face" status={faceStatus} />
          {faceStatus === "done" ? (
            <ReenrollPrompt onReenroll={() => setFaceStatus("todo")} kind="face" />
          ) : (
            <FaceCapture onCaptured={submitFace} busy={busy} />
          )}
        </section>
        <section>
          <StepHeading step={2} label="Voice" status={voiceStatus} />
          {voiceStatus === "done" ? (
            <ReenrollPrompt onReenroll={() => setVoiceStatus("todo")} kind="voice" />
          ) : (
            <VoiceCapture onRecorded={submitVoice} busy={busy} />
          )}
        </section>
      </div>

      {bothDone && (
        <Button className="mt-8" onClick={finish}>
          Done - go to my subjects
        </Button>
      )}
    </div>
  );
}

function StepHeading({ step, label, status }: { step: number; label: string; status: StepStatus }) {
  return (
    <div className="mb-4 flex items-center gap-2.5">
      <span
        className={cn(
          "flex size-7 items-center justify-center rounded-full text-sm font-semibold",
          status === "done" ? "bg-present-soft text-present" : "bg-brand-soft text-brand-deep",
        )}
      >
        {status === "done" ? <Check aria-hidden className="size-4" /> : step}
      </span>
      <h2 className="type-heading text-[1.125rem]">{label}</h2>
    </div>
  );
}

function ReenrollPrompt({ kind, onReenroll }: { kind: "face" | "voice"; onReenroll: () => void }) {
  return (
    <div className="rounded-frame border border-present/30 bg-present-soft p-5">
      <p className="font-semibold text-present">Your {kind} is enrolled.</p>
      <button type="button" onClick={onReenroll} className="mt-2 text-sm font-semibold text-ink-soft underline underline-offset-2">
        Redo it
      </button>
    </div>
  );
}
