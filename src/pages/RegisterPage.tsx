import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthForm } from "@/features/auth/AuthForm";
import { useAuth } from "@/features/auth/AuthContext";
import { BrandLinkBar } from "@/features/app-shell/AppShell";
import { Container } from "@/components/ui/Container";

export function RegisterPage() {
  const { registerTeacher, registerStudent } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initialRole = params.get("role") === "student" ? "student" : "teacher";
  const [role, setRole] = useState<"teacher" | "student">(initialRole);

  async function handleSubmit(values: { username: string; password: string; displayName: string }) {
    const user = role === "teacher" ? await registerTeacher(values) : await registerStudent(values);
    const next = params.get("next");
    navigate(next || (user.role === "teacher" ? "/app/teacher" : "/app/student"), { replace: true });
  }

  return (
    <div className="min-h-screen bg-paper">
      <BrandLinkBar />
      <Container className="flex justify-center py-12 sm:py-16">
        <div className="w-full max-w-sm">
          <h1 className="type-title mb-8 text-[2rem]">Create your account</h1>
          <AuthForm mode="register" role={role} onRoleChange={setRole} onSubmit={handleSubmit} />
        </div>
      </Container>
    </div>
  );
}
