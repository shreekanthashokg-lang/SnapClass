import { Router } from "express";
import { z } from "zod";
import { db } from "../db.js";
import { clearSession, hashPassword, issueSession, verifyPassword } from "../auth.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { displayNameSchema, passwordSchema, usernameSchema, validateBody } from "../lib/validate.js";

export const authRouter = Router();

const registerSchema = z.object({ username: usernameSchema, password: passwordSchema, displayName: displayNameSchema });
const loginSchema = z.object({ username: z.string().min(1), password: z.string().min(1) });

function tableFor(role) {
  return role === "teacher" ? "teachers" : "students";
}

function publicUser(role, row) {
  return { role, id: row.id, username: row.username, displayName: row.display_name };
}

function registerHandler(role) {
  return asyncHandler(async (req, res) => {
    const { username, password, displayName } = req.body;
    const table = tableFor(role);
    const existing = db.prepare(`SELECT id FROM ${table} WHERE username = ?`).get(username);
    if (existing) return res.status(409).json({ error: "That username is already taken." });

    const info = db
      .prepare(`INSERT INTO ${table} (username, password_hash, display_name) VALUES (?, ?, ?)`)
      .run(username, hashPassword(password), displayName);
    const user = { id: info.lastInsertRowid, username, display_name: displayName };
    issueSession(res, { role, id: user.id, username: user.username, displayName: user.display_name });
    res.status(201).json({ user: publicUser(role, user) });
  });
}

function loginHandler(role) {
  return asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    const table = tableFor(role);
    const row = db.prepare(`SELECT * FROM ${table} WHERE username = ?`).get(username.trim());
    if (!row || !verifyPassword(password, row.password_hash)) {
      return res.status(401).json({ error: "Incorrect username or password." });
    }
    issueSession(res, { role, id: row.id, username: row.username, displayName: row.display_name });
    res.json({ user: publicUser(role, row) });
  });
}

authRouter.post("/teacher/register", validateBody(registerSchema), registerHandler("teacher"));
authRouter.post("/teacher/login", validateBody(loginSchema), loginHandler("teacher"));
authRouter.post("/student/register", validateBody(registerSchema), registerHandler("student"));
authRouter.post("/student/login", validateBody(loginSchema), loginHandler("student"));

authRouter.post("/logout", (_req, res) => {
  clearSession(res);
  res.status(204).end();
});

authRouter.get(
  "/me",
  asyncHandler(async (req, res) => {
    if (!req.session) return res.json({ user: null });
    const table = tableFor(req.session.role);
    const row = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(req.session.id);
    if (!row) {
      clearSession(res);
      return res.json({ user: null });
    }
    const user = publicUser(req.session.role, row);
    if (req.session.role === "student") {
      user.enrolled = {
        face: !!db.prepare("SELECT 1 FROM face_enrollments WHERE student_id = ?").get(row.id),
        voice: !!db.prepare("SELECT 1 FROM voice_enrollments WHERE student_id = ?").get(row.id),
      };
    }
    res.json({ user });
  }),
);
