import { BrowserRouter } from "react-router-dom";
import { LazyMotion, MotionConfig, domAnimation } from "motion/react";
import { AuthProvider } from "@/features/auth/AuthContext";
import { AppRoutes } from "@/AppRoutes";

export function App() {
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation} strict>
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </LazyMotion>
    </MotionConfig>
  );
}
