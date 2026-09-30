import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { AppLoading } from "@/features/app-shell/AppShell";

interface RequireRoleProps {
  /** Renamed from "role" so eslint-plugin-jsx-a11y doesn't mistake this for an ARIA role attribute. */
  requiredRole: "teacher" | "student";
  children: ReactNode;
}

/** Gate for /app/teacher/* and /app/student/* - redirects to /login (preserving destination) if unmet. */
export function RequireRole({ requiredRole, children }: RequireRoleProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <AppLoading />;
  if (!user) return <Navigate to={`/login?role=${requiredRole}&next=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  if (user.role !== requiredRole) return <Navigate to={user.role === "teacher" ? "/app/teacher" : "/app/student"} replace />;
  return <>{children}</>;
}
