import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import { db, withTransaction } from "../db.js";
import { requireTeacher } from "../auth.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { cosineSimilarity, euclideanDistance, FACE_MATCH_DISTANCE_THRESHOLD, VOICE_MATCH_SIMILARITY_THRESHOLD } from "../matching.js";
import { extractVoiceprint } from "../voice.js";
import { faceDescriptorSchema, validateBody } from "../lib/validate.js";

export const attendanceRouter = Router();

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });

function subjectOwnedByTeacher(subjectId, teacherId) {
  return db.prepare("SELECT * FROM subjects WHERE id = ? AND teacher_id = ?").get(subjectId, teacherId);
}

function rosterWithFace(subjectId) {
  return db
    .prepare(
      `SELECT st.id, st.display_name, f.descriptor
       FROM students st
       JOIN enrollments e ON e.student_id = st.id
       LEFT JOIN face_enrollments f ON f.student_id = st.id
       WHERE e.subject_id = ?
       ORDER BY st.display_name COLLATE NOCASE`,
    )
    .all(subjectId);
}

// --- Photo attendance: browser extracts one descriptor per detected face and posts the
// whole array here. A student is present if any provided face is close enough to theirs. ---

const photoPreviewSchema = z.object({ descriptors: z.array(faceDescriptorSchema).max(80) });

attendanceRouter.post(
  "/:id/attendance/photo/preview",
  requireTeacher,
  validateBody(photoPreviewSchema),
  asyncHandler(async (req, res) => {
    const subject = subjectOwnedByTeacher(req.params.id, req.session.id);
    if (!subject) return res.status(404).json({ error: "Subject not found." });
    const { descriptors } = req.body;

    const rows = rosterWithFace(subject.id).map((student) => {
      if (!student.descriptor) {
        return { studentId: student.id, name: student.display_name, present: false, distance: null, reason: "not_enrolled" };
      }
      const enrolled = JSON.parse(student.descriptor);
      let best = Infinity;
      for (const candidate of descriptors) {
        const distance = euclideanDistance(enrolled, candidate);
        if (distance < best) best = distance;
      }
      return {
        studentId: student.id,
        name: student.display_name,
        present: best <= FACE_MATCH_DISTANCE_THRESHOLD,
        distance: Number.isFinite(best) ? Number(best.toFixed(4)) : null,
      };
    });

    res.json({ threshold: FACE_MATCH_DISTANCE_THRESHOLD, faceCount: descriptors.length, rows });
  }),
);

// --- Voice attendance: the teacher runs this once per student while they say the phrase. ---

attendanceRouter.post(
  "/:id/attendance/voice/check",
  requireTeacher,
  upload.single("sample"),
  asyncHandler(async (req, res) => {
    const subject = subjectOwnedByTeacher(req.params.id, req.session.id);
    if (!subject) return res.status(404).json({ error: "Subject not found." });
    const studentId = Number(req.body.studentId);
    if (!studentId) return res.status(400).json({ error: "studentId is required." });
    if (!req.file) return res.status(400).json({ error: "No audio file was uploaded." });

    const enrolled = db.prepare("SELECT voiceprint FROM voice_enrollments WHERE student_id = ?").get(studentId);
    if (!enrolled) return res.status(409).json({ error: "This student has not enrolled a voice sample yet." });

    let sample;
    try {
      sample = await extractVoiceprint(req.file.buffer);
    } catch (error) {
      if (error.code === "AUDIO_TOO_QUIET") return res.status(400).json({ error: error.message });
      console.error("[attendance/voice/check] could not decode audio:", error.message);
      return res.status(400).json({ error: "Could not read that recording. Please try again." });
    }

    const similarity = cosineSimilarity(JSON.parse(enrolled.voiceprint), sample);
    res.json({
      studentId,
      present: similarity >= VOICE_MATCH_SIMILARITY_THRESHOLD,
      similarity: Number(similarity.toFixed(4)),
      threshold: VOICE_MATCH_SIMILARITY_THRESHOLD,
    });
  }),
);

// --- Confirm: save a reviewed report as a session + records. -------------------------------

const confirmSchema = z.object({
  method: z.enum(["photo", "voice"]),
  records: z
    .array(z.object({ studentId: z.number().int().positive(), status: z.enum(["present", "absent"]), score: z.number().finite().nullable().optional() }))
    .min(1),
});

attendanceRouter.post(
  "/:id/attendance/confirm",
  requireTeacher,
  validateBody(confirmSchema),
  asyncHandler(async (req, res) => {
    const subject = subjectOwnedByTeacher(req.params.id, req.session.id);
    if (!subject) return res.status(404).json({ error: "Subject not found." });
    const { method, records } = req.body;

    const enrolledIds = new Set(db.prepare("SELECT student_id FROM enrollments WHERE subject_id = ?").all(subject.id).map((r) => r.student_id));
    const invalid = records.find((r) => !enrolledIds.has(r.studentId));
    if (invalid) return res.status(400).json({ error: "One of the records is not a student enrolled in this subject." });

    const sessionId = withTransaction(() => {
      const sessionInfo = db
        .prepare("INSERT INTO attendance_sessions (subject_id, teacher_id, method) VALUES (?, ?, ?)")
        .run(subject.id, req.session.id, method);
      const insertRecord = db.prepare("INSERT INTO attendance_records (session_id, student_id, status, score) VALUES (?, ?, ?, ?)");
      for (const record of records) {
        insertRecord.run(sessionInfo.lastInsertRowid, record.studentId, record.status, record.score ?? null);
      }
      return sessionInfo.lastInsertRowid;
    });

    res.status(201).json({ sessionId });
  }),
);

// --- Records: list past sessions, and export as CSV. ---------------------------------------

function sessionsFor(subjectId) {
  return db
    .prepare(
      `SELECT a.id, a.method, a.created_at,
              (SELECT COUNT(*) FROM attendance_records r WHERE r.session_id = a.id AND r.status = 'present') AS present_count,
              (SELECT COUNT(*) FROM attendance_records r WHERE r.session_id = a.id) AS total_count
       FROM attendance_sessions a
       WHERE a.subject_id = ?
       ORDER BY a.created_at DESC`,
    )
    .all(subjectId);
}

attendanceRouter.get(
  "/:id/attendance/records",
  requireTeacher,
  asyncHandler(async (req, res) => {
    const subject = subjectOwnedByTeacher(req.params.id, req.session.id);
    if (!subject) return res.status(404).json({ error: "Subject not found." });
    res.json({ sessions: sessionsFor(subject.id) });
  }),
);

attendanceRouter.get(
  "/:id/attendance/records/:sessionId",
  requireTeacher,
  asyncHandler(async (req, res) => {
    const subject = subjectOwnedByTeacher(req.params.id, req.session.id);
    if (!subject) return res.status(404).json({ error: "Subject not found." });
    const session = db.prepare("SELECT * FROM attendance_sessions WHERE id = ? AND subject_id = ?").get(req.params.sessionId, subject.id);
    if (!session) return res.status(404).json({ error: "Session not found." });
    const records = db
      .prepare(
        `SELECT st.display_name AS name, r.status, r.score
         FROM attendance_records r JOIN students st ON st.id = r.student_id
         WHERE r.session_id = ? ORDER BY st.display_name COLLATE NOCASE`,
      )
      .all(session.id);
    res.json({ session, records });
  }),
);

function csvEscape(value) {
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

attendanceRouter.get(
  "/:id/attendance/records.csv",
  requireTeacher,
  asyncHandler(async (req, res) => {
    const subject = subjectOwnedByTeacher(req.params.id, req.session.id);
    if (!subject) return res.status(404).json({ error: "Subject not found." });

    const rows = db
      .prepare(
        `SELECT a.created_at, a.method, st.display_name AS student, r.status, r.score
         FROM attendance_sessions a
         JOIN attendance_records r ON r.session_id = a.id
         JOIN students st ON st.id = r.student_id
         WHERE a.subject_id = ?
         ORDER BY a.created_at DESC, st.display_name COLLATE NOCASE`,
      )
      .all(subject.id);

    const header = "date_time,method,student,status,score";
    const body = rows.map((r) => [r.created_at, r.method, r.student, r.status, r.score ?? ""].map(csvEscape).join(",")).join("\n");
    const filename = `${subject.code}-attendance.csv`;
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(`${header}\n${body}\n`);
  }),
);
