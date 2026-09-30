import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import { LazyMotion, MotionConfig, domAnimation } from "motion/react";
import { AuthProvider } from "@/features/auth/AuthContext";
import { AppRoutes } from "@/AppRoutes";

/**
 * Used by scripts/prerender.mjs to produce the static HTML shipped in dist/.
 * Only ever renders "/" (the marketing page) - every other route is behind sign-in
 * and has nothing worth prerendering, so the client renders those fresh (see main.tsx).
 */
export function render(): string {
  return renderToString(
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation} strict>
        <StaticRouter location="/">
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </StaticRouter>
      </LazyMotion>
    </MotionConfig>,
  );
}
