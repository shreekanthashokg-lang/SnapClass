import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { MarketingPage } from "@/pages/MarketingPage";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { AppIndexPage } from "@/pages/AppIndexPage";
import { JoinPage } from "@/pages/JoinPage";
import { AppShell, AppLoading } from "@/features/app-shell/AppShell";
import { RequireRole } from "@/features/auth/RequireRole";

// Every signed-in page is code-split for two reasons: it keeps the biometric/ML
// libraries (face-api.js, etc.) out of the marketing bundle entirely, and it keeps
// them out of the prerendered SSR pass (see entry-server.tsx) - the "/" route is the
// only one ever prerendered, so nothing else needs to load eagerly on the server.
const TeacherDashboard = lazy(() => import("@/pages/app/TeacherDashboard").then((m) => ({ default: m.TeacherDashboard })));
const SubjectDetail = lazy(() => import("@/pages/app/SubjectDetail").then((m) => ({ default: m.SubjectDetail })));
const TakeAttendancePhoto = lazy(() => import("@/pages/app/TakeAttendancePhoto").then((m) => ({ default: m.TakeAttendancePhoto })));
const TakeAttendanceVoice = lazy(() => import("@/pages/app/TakeAttendanceVoice").then((m) => ({ default: m.TakeAttendanceVoice })));
const AttendanceRecords = lazy(() => import("@/pages/app/AttendanceRecords").then((m) => ({ default: m.AttendanceRecords })));
const StudentDashboard = lazy(() => import("@/pages/app/StudentDashboard").then((m) => ({ default: m.StudentDashboard })));
const EnrollPage = lazy(() => import("@/pages/app/EnrollPage").then((m) => ({ default: m.EnrollPage })));

/** Shorthand for wrapping a lazy page element with its loading fallback. */
function lazyPage(Component: React.ComponentType) {
  return (
    <Suspense fallback={<AppLoading />}>
      <Component />
    </Suspense>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<MarketingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/app" element={<AppIndexPage />} />
      <Route path="/app/join" element={<JoinPage />} />

      <Route
        path="/app/teacher"
        element={
          <RequireRole requiredRole="teacher">
            <AppShell />
          </RequireRole>
        }
      >
        <Route index element={lazyPage(TeacherDashboard)} />
        <Route path="subjects/:id" element={lazyPage(SubjectDetail)} />
        <Route path="subjects/:id/photo" element={lazyPage(TakeAttendancePhoto)} />
        <Route path="subjects/:id/voice" element={lazyPage(TakeAttendanceVoice)} />
        <Route path="subjects/:id/records" element={lazyPage(AttendanceRecords)} />
      </Route>

      <Route
        path="/app/student"
        element={
          <RequireRole requiredRole="student">
            <AppShell />
          </RequireRole>
        }
      >
        <Route index element={lazyPage(StudentDashboard)} />
        <Route path="enroll" element={lazyPage(EnrollPage)} />
      </Route>

      <Route path="*" element={<MarketingPage />} />
    </Routes>
  );
}
