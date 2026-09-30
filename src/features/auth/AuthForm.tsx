import { useState, type FormEvent } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { ApiError } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

interface AuthFormProps {
  mode: "login" | "register";
  role: "teacher" | "student";
  onRoleChange: (role: "teacher" | "student") => void;
  onSubmit: (values: { username: string; password: string; displayName: string }) => Promise<void>;
}

const roleLabel = { teacher: "Teacher", student: "Student" } as const;

export function AuthForm({ mode, role, onRoleChange, onSubmit }: AuthFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await onSubmit({ username, password, displayName });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div role="group" aria-label="I am a" className="mb-6 inline-flex rounded-control border-2 border-ink p-1">
        {(["teacher", "student"] as const).map((r) => (
          <button
            key={r}
            type="button"
            aria-pressed={role === r}
            onClick={() => onRoleChange(r)}
            className={cn(
              "h-9 rounded-[0.4rem] px-4 text-sm font-semibold transition-colors",
              role === r ? "bg-ink text-paper" : "text-ink hover:bg-ink/8",
            )}
          >
            {roleLabel[r]}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {mode === "register" && (
          <div>
            <label htmlFor="displayName" className="mb-1.5 block text-sm font-semibold text-ink-soft">
              Full name
            </label>
            <input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              autoComplete="name"
              className="h-11 w-full rounded-control border border-line bg-sheet px-3.5 focus-visible:border-brand"
            />
          </div>
        )}
        <div>
          <label htmlFor="username" className="mb-1.5 block text-sm font-semibold text-ink-soft">
            Username
          </label>
          <input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
            className="h-11 w-full rounded-control border border-line bg-sheet px-3.5 focus-visible:border-brand"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-ink-soft">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={mode === "register" ? 8 : undefined}
            autoComplete={mode === "register" ? "new-password" : "current-password"}
            className="h-11 w-full rounded-control border border-line bg-sheet px-3.5 focus-visible:border-brand"
          />
          {mode === "register" && <p className="mt-1.5 text-xs text-ink-soft">At least 8 characters.</p>}
        </div>

        {error && (
          <p role="alert" className="flex items-start gap-2 text-sm text-absent">
            <AlertCircle aria-hidden className="mt-0.5 size-4 shrink-0" />
            {error}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy && <Loader2 aria-hidden className="size-4 animate-spin" />}
          {mode === "login" ? "Sign in" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-sm text-ink-soft">
        {mode === "login" ? (
          <>
            New here? <Link to="/register" className="font-semibold text-brand-deep underline underline-offset-2">Create an account</Link>
          </>
        ) : (
          <>
            Already have an account? <Link to="/login" className="font-semibold text-brand-deep underline underline-offset-2">Sign in</Link>
          </>
        )}
      </p>
    </div>
  );
}
