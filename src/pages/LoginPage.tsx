import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthForm } from "@/features/auth/AuthForm";
import { useAuth } from "@/features/auth/AuthContext";
import { BrandLinkBar } from "@/features/app-shell/AppShell";
import { Container } from "@/components/ui/Container";

export function LoginPage() {
  const { loginTeacher, loginStudent } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initialRole = params.get("role") === "student" ? "student" : params.get("role") === "teacher" ? "teacher" : "teacher";
  const [role, setRole] = useState<"teacher" | "student">(initialRole);

  async function handleSubmit(values: { username: string; password: string }) {
    const user = role === "teacher" ? await loginTeacher(values) : await loginStudent(values);
    const next = params.get("next");
    navigate(next || (user.role === "teacher" ? "/app/teacher" : "/app/student"), { replace: true });
  }

  return (
    <div className="min-h-screen bg-paper">
      <BrandLinkBar />
      <Container className="flex justify-center py-12 sm:py-16">
        <div className="w-full max-w-sm">
          <h1 className="type-title mb-8 text-[2rem]">Sign in</h1>
          <AuthForm mode="login" role={role} onRoleChange={setRole} onSubmit={handleSubmit} />
        </div>
      </Container>
    </div>
  );
}
