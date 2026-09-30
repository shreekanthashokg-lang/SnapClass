import path from "node:path";
import cookieParser from "cookie-parser";
import express from "express";
import { ZodError } from "zod";
import { attachSession } from "./auth.js";
import { rateLimit } from "./lib/rateLimit.js";
import { securityHeaders } from "./lib/securityHeaders.js";
import { authRouter } from "./routes/auth.js";
import { subjectsRouter } from "./routes/subjects.js";
import { enrollRouter } from "./routes/enroll.js";
import { attendanceRouter } from "./routes/attendance.js";

const distDir = path.resolve("dist");

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", 1); // needed for secure cookies behind Render/Railway/Fly's proxy

  app.use(securityHeaders);
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());
  app.use(attachSession);

  // Brute-force protection. Only FAILED sign-ins count, keyed per IP + username, so one person
  // guessing at an account is stopped while a classroom sharing a school IP can sign in freely.
  // A wider per-IP cap on failures still stops one machine trying many different usernames.
  const loginPaths = ["/api/auth/teacher/login", "/api/auth/student/login"];
  app.use(
    loginPaths,
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 8,
      countOnlyFailures: true,
      keyFn: (req) => `${req.ip}|${String(req.body?.username ?? "").toLowerCase()}`,
    }),
  );
  app.use(loginPaths, rateLimit({ windowMs: 15 * 60 * 1000, max: 300, countOnlyFailures: true }));
  // Account-creation spam guard, generous enough for a whole class registering together.
  app.use(
    ["/api/auth/teacher/register", "/api/auth/student/register"],
    rateLimit({ windowMs: 60 * 60 * 1000, max: 150, message: "Too many accounts created from this network. Please try again later." }),
  );

  app.use("/api/auth", authRouter);
  app.use("/api/subjects", subjectsRouter);
  app.use("/api/enroll", enrollRouter);
  app.use("/api/subjects", attendanceRouter); // adds /:id/attendance/* under the same prefix

  app.get("/api/health", (_req, res) => res.json({ ok: true }));

  // Serve the built frontend in production. In dev, Vite's own server handles this and
  // proxies /api to this server instead (see vite.config.ts).
  app.use(express.static(distDir, { index: false }));
  app.get(/^(?!\/api\/).*/, (_req, res) => {
    res.sendFile(path.join(distDir, "index.html"));
  });

  // Central error handler: never leak stack traces or internal messages to the client.
  app.use((err, _req, res, _next) => {
    if (err instanceof ZodError) {
      return res.status(400).json({ error: err.issues[0]?.message ?? "Invalid request." });
    }
    if (err?.type === "entity.too.large" || err?.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ error: "That upload is too large." });
    }
    console.error("[app] unhandled error:", err);
    res.status(500).json({ error: "Something went wrong on our end. Please try again." });
  });

  return app;
}
