import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "./env.js";

const COOKIE_NAME = "sc_session";
const SESSION_TTL = "12h";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

export function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

/** Issues a session cookie for a teacher or student and sends it on the response. */
export function issueSession(res, { role, id, username, displayName }) {
  const token = jwt.sign({ role, sub: id, username, displayName }, env.sessionSecret, { expiresIn: SESSION_TTL });
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.isProd,
    maxAge: SESSION_TTL_MS,
    path: "/",
  });
}

export function clearSession(res) {
  res.clearCookie(COOKIE_NAME, { path: "/" });
}

function readSession(req) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return null;
  try {
    const payload = jwt.verify(token, env.sessionSecret);
    return { role: payload.role, id: payload.sub, username: payload.username, displayName: payload.displayName };
  } catch {
    return null;
  }
}

/** Attaches req.session (or null) on every request. Always call this first. */
export function attachSession(req, _res, next) {
  req.session = readSession(req);
  next();
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.session || req.session.role !== role) {
      return res.status(401).json({ error: `${role} sign-in required` });
    }
    next();
  };
}

export const requireTeacher = requireRole("teacher");
export const requireStudent = requireRole("student");

export function requireAnyRole(req, res, next) {
  if (!req.session) return res.status(401).json({ error: "Sign-in required" });
  next();
}
