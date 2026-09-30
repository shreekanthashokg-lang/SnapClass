import crypto from "node:crypto";
import path from "node:path";
import process from "node:process";

const isProd = process.env.NODE_ENV === "production";

let sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  if (isProd) {
    throw new Error(
      "SESSION_SECRET is not set. Generate one with: node -e \"console.log(require('crypto').randomBytes(48).toString('hex'))\" and set it in your hosting dashboard.",
    );
  }
  // Dev-only convenience: a random secret that changes every restart (so dev sessions
  // don't persist across server restarts, which is fine locally, never used in production).
  sessionSecret = crypto.randomBytes(48).toString("hex");
  console.warn("[env] SESSION_SECRET is not set; using a temporary development-only secret.");
}

export const env = {
  isProd,
  port: Number(process.env.PORT) || 8787,
  sessionSecret,
  dataDir: path.resolve(process.env.DATA_DIR || "./server/data"),
  siteUrl: (process.env.SITE_URL || "").replace(/\/+$/, ""),
};
