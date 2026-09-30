/**
 * Security headers applied by the app itself so they work on any host (the old
 * static-host header files were removed when the site became a Node server).
 *
 * Camera and microphone are allowed for this origin only - the app needs them for
 * face and voice enrollment - and denied to any embedded third party.
 *
 * CSP notes: everything (scripts, fonts, models, API) is same-origin (small fonts are
 * inlined by the build as data: URIs, hence data: under font-src). 'unsafe-inline'
 * styles are required because the animation library sets inline style attributes;
 * 'wasm-unsafe-eval' lets the ML runtime use WebAssembly if a device selects it;
 * blob:/data: cover a captured photo preview and locally recorded audio playback.
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'wasm-unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "media-src 'self' blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "worker-src 'self' blob:",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
].join("; ");

export function securityHeaders(req, res, next) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(self), microphone=(self), geolocation=()");
  res.setHeader("Content-Security-Policy", CSP);
  if (req.secure) res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  next();
}
