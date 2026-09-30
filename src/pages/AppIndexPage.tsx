import { Navigate } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";
import { AppLoading } from "@/features/app-shell/AppShell";

/** Sends a signed-in visitor of /app to their dashboard, or to sign in otherwise. */
export function AppIndexPage() {
  const { user, loading } = useAuth();
  if (loading) return <AppLoading />;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === "teacher" ? "/app/teacher" : "/app/student"} replace />;
}
