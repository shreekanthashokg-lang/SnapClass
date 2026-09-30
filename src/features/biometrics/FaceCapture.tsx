import { useEffect, useState } from "react";
import { Camera, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ScanCorners } from "@/components/ui/ScanCorners";
import { captureFrame, useCamera } from "./useCamera";
import { detectSingleFace, loadFaceModels, type FaceMatch } from "./face";

interface FaceCaptureProps {
  /** Called with the extracted 128-value descriptor once the person accepts a capture. */
  onCaptured: (descriptor: number[]) => void;
  busy?: boolean;
}

type Phase = "loading-models" | "live" | "captured" | "camera-error";

/** Webcam capture: live preview, one-tap capture, a preview of what was captured before accepting it. */
export function FaceCapture({ onCaptured, busy }: FaceCaptureProps) {
  const [phase, setPhase] = useState<Phase>("loading-models");
  const [hint, setHint] = useState("Loading the face model…");
  const [snapshot, setSnapshot] = useState<{ url: string; match: FaceMatch } | null>(null);
  const { videoRef, ready, error } = useCamera(phase === "live");

  useEffect(() => {
    let cancelled = false;
    loadFaceModels()
      .then(() => !cancelled && setPhase("live"))
      .catch((err: unknown) => !cancelled && setHint(err instanceof Error ? err.message : "Could not load the face model."));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    // Reflects the camera hook's error into local phase state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (error) setPhase("camera-error");
  }, [error]);

  useEffect(() => {
    // Updates the help text as the camera hook transitions from starting to ready.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (phase === "live") setHint(ready ? "Center your face in the frame, then capture." : "Starting the camera…");
  }, [phase, ready]);

  async function handleCapture() {
    const video = videoRef.current;
    if (!video) return;
    setHint("Looking for a face…");
    const canvas = captureFrame(video);
    const match = await detectSingleFace(canvas);
    if (!match) {
      setHint("No face found - center your face in the frame and try again.");
      return;
    }
    setSnapshot({ url: canvas.toDataURL("image/jpeg", 0.85), match });
    setPhase("captured");
  }

  function retake() {
    setSnapshot(null);
    setPhase("live");
  }

  return (
    <div className="w-full max-w-sm">
      <div className="relative aspect-4/3 overflow-hidden rounded-frame bg-ink">
        {phase === "captured" && snapshot ? (
          <img src={snapshot.url} alt="Captured for face enrollment" className="h-full w-full object-cover" />
        ) : (
          <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover [transform:scaleX(-1)]" />
        )}
        <ScanCorners />
        {phase === "loading-models" && (
          <div className="absolute inset-0 grid place-items-center bg-ink/60 text-white">
            <Loader2 className="size-6 animate-spin" aria-hidden />
          </div>
        )}
      </div>

      <p className="mt-3 min-h-5 text-sm text-ink-soft" role="status">
        {phase === "camera-error" ? (error ?? "Could not access the camera.") : hint}
      </p>

      <div className="mt-3 flex gap-2">
        {phase === "captured" ? (
          <>
            <Button variant="outline" onClick={retake} disabled={busy}>
              <RotateCcw aria-hidden className="size-4" /> Retake
            </Button>
            <Button onClick={() => snapshot && onCaptured(snapshot.match.descriptor)} disabled={busy}>
              {busy ? <Loader2 aria-hidden className="size-4 animate-spin" /> : <Camera aria-hidden className="size-4" />}
              Use this photo
            </Button>
          </>
        ) : (
          <Button onClick={handleCapture} disabled={phase !== "live" || !ready}>
            <Camera aria-hidden className="size-4" /> Capture
          </Button>
        )}
      </div>
    </div>
  );
}
