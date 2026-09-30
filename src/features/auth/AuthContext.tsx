import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, type SessionUser } from "@/lib/api";

interface Credentials {
  username: string;
  password: string;
  displayName?: string;
}

interface AuthContextValue {
  user: SessionUser | null;
  /** True until the initial /api/auth/me check completes. */
  loading: boolean;
  loginTeacher: (c: Credentials) => Promise<SessionUser>;
  loginStudent: (c: Credentials) => Promise<SessionUser>;
  registerTeacher: (c: Required<Credentials>) => Promise<SessionUser>;
  registerStudent: (c: Required<Credentials>) => Promise<SessionUser>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const { user: current } = await api.get<{ user: SessionUser | null }>("/auth/me");
    setUser(current);
  }, []);

  useEffect(() => {
    // setLoading below fires only once the awaited /auth/me request settles, not synchronously.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      async loginTeacher(c) {
        const { user: u } = await api.post<{ user: SessionUser }>("/auth/teacher/login", c);
        setUser(u);
        return u;
      },
      async loginStudent(c) {
        const { user: u } = await api.post<{ user: SessionUser }>("/auth/student/login", c);
        setUser(u);
        return u;
      },
      async registerTeacher(c) {
        const { user: u } = await api.post<{ user: SessionUser }>("/auth/teacher/register", c);
        setUser(u);
        return u;
      },
      async registerStudent(c) {
        const { user: u } = await api.post<{ user: SessionUser }>("/auth/student/register", c);
        setUser(u);
        return u;
      },
      async logout() {
        await api.post("/auth/logout");
        setUser(null);
      },
      refresh,
    }),
    [user, loading, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
