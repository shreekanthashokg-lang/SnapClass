import { useEffect, useRef, useState } from "react";
import { Loader2, Mic, RotateCcw, Square } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useVoiceRecorder } from "./useVoiceRecorder";

interface VoiceCaptureProps {
  /** Called with the recorded clip once the person accepts it. */
  onRecorded: (blob: Blob) => void;
  busy?: boolean;
  phrase?: string;
}

/** Mic capture: record, play back what was recorded, then accept or retake. */
export function VoiceCapture({ onRecorded, busy, phrase = "I am present" }: VoiceCaptureProps) {
  const { recording, error, start, stop } = useVoiceRecorder();
  const [clip, setClip] = useState<{ url: string; blob: Blob } | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (recording) {
      // Restarts the on-screen timer for the new recording.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setElapsed(0);
      timerRef.current = window.setInterval(() => setElapsed((s) => s + 1), 1000);
    } else if (timerRef.current) {
      window.clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [recording]);

  useEffect(
    () => () => {
      if (clip) URL.revokeObjectURL(clip.url);
    },
    [clip],
  );

  async function handleStart() {
    setClip(null);
    await start();
  }

  async function handleStop() {
    const blob = await stop();
    setClip({ url: URL.createObjectURL(blob), blob });
  }

  function retake() {
    setClip(null);
  }

  return (
    <div className="w-full max-w-sm">
      <div className="flex h-28 items-center justify-center gap-3 rounded-frame border border-line bg-paper">
        {clip ? (
          // eslint-disable-next-line jsx-a11y/media-has-caption -- a locally recorded voice clip has no captions to provide
          <audio src={clip.url} controls className="w-11/12" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-ink-soft">
            <span className={`flex size-12 items-center justify-center rounded-full ${recording ? "bg-signal text-ink" : "bg-brand-soft text-brand-deep"}`}>
              <Mic aria-hidden className="size-5" />
            </span>
            <span className="text-sm tabular-nums">{recording ? `Recording… ${elapsed}s` : `Say “${phrase}”`}</span>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-absent" role="alert">
          {error}
        </p>
      )}

      <div className="mt-3 flex gap-2">
        {clip ? (
          <>
            <Button variant="outline" onClick={retake} disabled={busy}>
              <RotateCcw aria-hidden className="size-4" /> Retake
            </Button>
            <Button onClick={() => onRecorded(clip.blob)} disabled={busy}>
              {busy ? <Loader2 aria-hidden className="size-4 animate-spin" /> : <Mic aria-hidden className="size-4" />}
              Use this recording
            </Button>
          </>
        ) : recording ? (
          <Button variant="ink" onClick={handleStop}>
            <Square aria-hidden className="size-4" /> Stop
          </Button>
        ) : (
          <Button onClick={handleStart}>
            <Mic aria-hidden className="size-4" /> Record
          </Button>
        )}
      </div>
    </div>
  );
}
