import { Loader2, LogOut } from "lucide-react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";
import { Logo } from "@/components/ui/Logo";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

/** Shared chrome for every signed-in page: logo, current user, sign out. */
export function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/", { replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <header className="border-b border-line bg-sheet">
        <Container className="flex h-16 items-center justify-between gap-4">
          <Logo />
          {user && (
            <div className="flex items-center gap-3">
              <div className="text-right leading-tight">
                <p className="font-semibold">{user.displayName}</p>
                <p className="text-xs text-ink-soft capitalize">{user.role}</p>
              </div>
              <Button variant="outline" size="md" onClick={handleLogout}>
                <LogOut aria-hidden className="size-4" />
                <span className="max-sm:hidden">Sign out</span>
              </Button>
            </div>
          )}
        </Container>
      </header>
      <main className="flex-1">
        <Container className="py-8 sm:py-10">
          <Outlet />
        </Container>
      </main>
    </div>
  );
}

/** Full-page centered loading state, used while the initial session check is in flight. */
export function AppLoading() {
  return (
    <div className="grid min-h-screen place-items-center bg-paper">
      <Loader2 className="size-8 animate-spin text-brand" aria-hidden />
    </div>
  );
}

export function BrandLinkBar() {
  return (
    <Container className="flex h-16 items-center">
      <Logo />
    </Container>
  );
}

export { Link };
