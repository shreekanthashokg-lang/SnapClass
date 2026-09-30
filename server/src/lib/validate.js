import { z } from "zod";

/** Wraps a zod schema as Express middleware; on failure responds 400 with a short message. */
export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const first = result.error.issues[0];
      return res.status(400).json({ error: first ? `${first.path.join(".") || "body"}: ${first.message}` : "Invalid request body" });
    }
    req.body = result.data;
    next();
  };
}

export const usernameSchema = z
  .string()
  .trim()
  .min(3, "must be at least 3 characters")
  .max(40, "must be 40 characters or fewer")
  .regex(/^[a-zA-Z0-9._-]+$/, "use only letters, numbers, dots, underscores and hyphens");

export const passwordSchema = z.string().min(8, "must be at least 8 characters").max(200);

export const displayNameSchema = z.string().trim().min(1, "is required").max(80);

export const subjectCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .min(2, "must be at least 2 characters")
  .max(20, "must be 20 characters or fewer")
  .regex(/^[A-Z0-9-]+$/, "use only letters, numbers and hyphens");

export const faceDescriptorSchema = z.array(z.number().finite()).length(128, "must be a 128-value face descriptor");
