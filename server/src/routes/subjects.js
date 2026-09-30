import { Router } from "express";
import QRCode from "qrcode";
import { z } from "zod";
import { db } from "../db.js";
import { requireStudent, requireTeacher } from "../auth.js";
import { env } from "../env.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { displayNameSchema, subjectCodeSchema, validateBody } from "../lib/validate.js";

export const subjectsRouter = Router();

const createSubjectSchema = z.object({
  code: subjectCodeSchema,
  name: displayNameSchema,
  section: z.string().trim().max(40).optional().default(""),
});
const joinSchema = z.object({ code: subjectCodeSchema });

function subjectOwnedByTeacher(subjectId, teacherId) {
  return db.prepare("SELECT * FROM subjects WHERE id = ? AND teacher_id = ?").get(subjectId, teacherId);
}

// --- Teacher: create + list own subjects -----------------------------------------------

subjectsRouter.post(
  "/",
  requireTeacher,
  validateBody(createSubjectSchema),
  asyncHandler(async (req, res) => {
    const { code, name, section } = req.body;
    const clash = db.prepare("SELECT id FROM subjects WHERE code = ?").get(code);
    if (clash) return res.status(409).json({ error: `Subject code "${code}" is already in use.` });

    const info = db
      .prepare("INSERT INTO subjects (teacher_id, code, name, section) VALUES (?, ?, ?, ?)")
      .run(req.session.id, code, name, section);
    res.status(201).json({ subject: db.prepare("SELECT * FROM subjects WHERE id = ?").get(info.lastInsertRowid) });
  }),
);

subjectsRouter.get(
  "/mine",
  requireTeacher,
  asyncHandler(async (req, res) => {
    const rows = db
      .prepare(
        `SELECT s.*,
                (SELECT COUNT(*) FROM enrollments e WHERE e.subject_id = s.id) AS student_count,
                (SELECT COUNT(*) FROM attendance_sessions a WHERE a.subject_id = s.id) AS session_count
         FROM subjects s WHERE s.teacher_id = ? ORDER BY s.created_at DESC`,
      )
      .all(req.session.id);
    res.json({ subjects: rows });
  }),
);

// --- Student: join, list mine, unenroll -------------------------------------------------

subjectsRouter.post(
  "/join",
  requireStudent,
  validateBody(joinSchema),
  asyncHandler(async (req, res) => {
    const subject = db.prepare("SELECT * FROM subjects WHERE code = ?").get(req.body.code);
    if (!subject) return res.status(404).json({ error: "No subject has that code. Check it and try again." });

    const existing = db.prepare("SELECT 1 FROM enrollments WHERE subject_id = ? AND student_id = ?").get(subject.id, req.session.id);
    if (!existing) {
      db.prepare("INSERT INTO enrollments (subject_id, student_id) VALUES (?, ?)").run(subject.id, req.session.id);
    }
    res.status(201).json({ subject });
  }),
);

subjectsRouter.get(
  "/mine/student",
  requireStudent,
  asyncHandler(async (req, res) => {
    const rows = db
      .prepare(
        `SELECT s.id, s.code, s.name, s.section,
                (SELECT COUNT(*) FROM attendance_sessions a WHERE a.subject_id = s.id) AS classes_held,
                (SELECT COUNT(*) FROM attendance_records r
                   JOIN attendance_sessions a ON a.id = r.session_id
                   WHERE a.subject_id = s.id AND r.student_id = ? AND r.status = 'present') AS classes_attended
         FROM subjects s
         JOIN enrollments e ON e.subject_id = s.id
         WHERE e.student_id = ?
         ORDER BY s.created_at DESC`,
      )
      .all(req.session.id, req.session.id);
    res.json({ subjects: rows });
  }),
);

subjectsRouter.post(
  "/:id/unenroll",
  requireStudent,
  asyncHandler(async (req, res) => {
    db.prepare("DELETE FROM enrollments WHERE subject_id = ? AND student_id = ?").run(req.params.id, req.session.id);
    res.status(204).end();
  }),
);

// --- Teacher: subject detail, roster, QR code -------------------------------------------

subjectsRouter.get(
  "/:id",
  requireTeacher,
  asyncHandler(async (req, res) => {
    const subject = subjectOwnedByTeacher(req.params.id, req.session.id);
    if (!subject) return res.status(404).json({ error: "Subject not found." });

    const roster = db
      .prepare(
        `SELECT st.id, st.display_name, st.username,
                (SELECT 1 FROM face_enrollments f WHERE f.student_id = st.id) AS has_face,
                (SELECT 1 FROM voice_enrollments v WHERE v.student_id = st.id) AS has_voice
         FROM students st
         JOIN enrollments e ON e.student_id = st.id
         WHERE e.subject_id = ?
         ORDER BY st.display_name COLLATE NOCASE`,
      )
      .all(subject.id)
      .map((s) => ({ ...s, has_face: !!s.has_face, has_voice: !!s.has_voice }));

    res.json({ subject, roster });
  }),
);

subjectsRouter.get(
  "/:id/qrcode.png",
  requireTeacher,
  asyncHandler(async (req, res) => {
    const subject = subjectOwnedByTeacher(req.params.id, req.session.id);
    if (!subject) return res.status(404).json({ error: "Subject not found." });
    const joinUrl = `${env.siteUrl || `${req.protocol}://${req.get("host")}`}/app/join?code=${encodeURIComponent(subject.code)}`;
    const png = await QRCode.toBuffer(joinUrl, { margin: 1, width: 320 });
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "no-store");
    res.send(png);
  }),
);
