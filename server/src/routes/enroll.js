import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import { db } from "../db.js";
import { requireStudent } from "../auth.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { faceDescriptorSchema, validateBody } from "../lib/validate.js";
import { extractVoiceprint } from "../voice.js";

export const enrollRouter = Router();

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });
const faceSchema = z.object({ descriptor: faceDescriptorSchema });

enrollRouter.get(
  "/status",
  requireStudent,
  asyncHandler(async (req, res) => {
    res.json({
      face: !!db.prepare("SELECT 1 FROM face_enrollments WHERE student_id = ?").get(req.session.id),
      voice: !!db.prepare("SELECT 1 FROM voice_enrollments WHERE student_id = ?").get(req.session.id),
    });
  }),
);

// The browser runs face detection + descriptor extraction (face-api.js) locally and
// posts only the resulting 128 numbers here - the photo itself never leaves the device.
enrollRouter.post(
  "/face",
  requireStudent,
  validateBody(faceSchema),
  asyncHandler(async (req, res) => {
    const json = JSON.stringify(req.body.descriptor);
    db.prepare(
      `INSERT INTO face_enrollments (student_id, descriptor, updated_at) VALUES (?, ?, strftime('%Y-%m-%dT%H:%M:%fZ','now'))
       ON CONFLICT (student_id) DO UPDATE SET descriptor = excluded.descriptor, updated_at = excluded.updated_at`,
    ).run(req.session.id, json);
    res.status(201).json({ ok: true });
  }),
);

enrollRouter.post(
  "/voice",
  requireStudent,
  upload.single("sample"),
  asyncHandler(async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No audio file was uploaded." });
    let voiceprint;
    try {
      voiceprint = await extractVoiceprint(req.file.buffer);
    } catch (error) {
      if (error.code === "AUDIO_TOO_QUIET") return res.status(400).json({ error: error.message });
      console.error("[enroll/voice] could not decode audio:", error.message);
      return res.status(400).json({ error: "Could not read that recording. Please try again." });
    }
    db.prepare(
      `INSERT INTO voice_enrollments (student_id, voiceprint, updated_at) VALUES (?, ?, strftime('%Y-%m-%dT%H:%M:%fZ','now'))
       ON CONFLICT (student_id) DO UPDATE SET voiceprint = excluded.voiceprint, updated_at = excluded.updated_at`,
    ).run(req.session.id, JSON.stringify(voiceprint));
    res.status(201).json({ ok: true });
  }),
);
