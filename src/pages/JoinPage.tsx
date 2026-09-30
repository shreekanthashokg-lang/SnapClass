import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { api, ApiError, type Subject } from "@/lib/api";
import { useAuth } from "@/features/auth/AuthContext";
import { AppLoading } from "@/features/app-shell/AppShell";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

/** Landing point for a scanned class QR code / shared link: /app/join?code=CS111 */
export function JoinPage() {
  const { user, loading: authLoading } = useAuth();
  const [params] = useSearchParams();
  const code = params.get("code") ?? "";
  const navigate = useNavigate();
  const [state, setState] = useState<{ status: "joining" | "done" | "error"; subject?: Subject; error?: string }>({ status: "joining" });

  useEffect(() => {
    if (authLoading || !user) return; // handled by the loading/redirect branches below
    if (user.role !== "student" || !code) return; // handled by the derived precheckError branch below

    let cancelled = false;
    async function join() {
      try {
        const { subject } = await api.post<{ subject: Subject }>("/subjects/join", { code });
        if (!cancelled) setState({ status: "done", subject });
      } catch (err) {
        if (!cancelled) setState({ status: "error", error: err instanceof ApiError ? err.message : "Could not join that class." });
      }
    }
    void join();
    return () => {
      cancelled = true;
    };
  }, [authLoading, user, code]);

  const precheckError = user && user.role !== "student" ? "Only a student account can join a subject. Sign in as a student to continue." : user && !code ? "No class code was given." : null;

  if (authLoading) return <AppLoading />;
  if (!user) {
    return <Navigate to={`/login?role=student&next=${encodeURIComponent(`/app/join?code=${code}`)}`} />;
  }

  return (
    <div className="grid min-h-screen place-items-center bg-paper px-4">
      <Container className="max-w-sm text-center">
        {!precheckError && state.status === "joining" && (
          <>
            <Loader2 className="mx-auto mb-4 size-8 animate-spin text-brand" aria-hidden />
            <p className="text-ink-soft">Joining {code}…</p>
          </>
        )}
        {state.status === "done" && state.subject && (
          <>
            <h1 className="type-title mb-2 text-[1.75rem]">You&rsquo;re in!</h1>
            <p className="mb-6 text-ink-soft">
              You&rsquo;ve joined <strong className="text-ink">{state.subject.name}</strong>.
            </p>
            <Button onClick={() => navigate("/app/student")}>Go to my subjects</Button>
          </>
        )}
        {(precheckError || state.status === "error") && (
          <>
            <h1 className="type-title mb-2 text-[1.75rem]">Couldn&rsquo;t join</h1>
            <p className="mb-6 text-ink-soft">{precheckError ?? state.error}</p>
            <Link to="/app/student" className="font-semibold text-brand-deep underline underline-offset-2">
              Back to my subjects
            </Link>
          </>
        )}
      </Container>
    </div>
  );
}
