/**
 * Minimal in-memory fixed-window rate limiter.
 *
 * Deliberately dependency-free. State is per-process and resets on restart, which suits a
 * single-instance deployment; if you scale to several instances behind a load balancer,
 * swap in a shared store (e.g. Redis) or use a platform-level limiter.
 *
 * Options:
 *  - windowMs / max: allow at most `max` counted events per key per window.
 *  - keyFn(req): what to limit by. Defaults to the client IP.
 *  - countOnlyFailures: count a request only if it ends with an HTTP error status. This is
 *    what protects sign-in from password guessing WITHOUT punishing a whole classroom that
 *    shares one school IP address and signs in at the same moment.
 */
export function rateLimit({ windowMs, max, message, keyFn = (req) => req.ip ?? "unknown", countOnlyFailures = false }) {
  const hits = new Map(); // key -> { count, resetAt }

  const sweep = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits) if (entry.resetAt <= now) hits.delete(key);
  }, windowMs);
  sweep.unref(); // never keep the process alive just for cleanup

  function record(key) {
    const now = Date.now();
    const entry = hits.get(key);
    if (!entry || entry.resetAt <= now) hits.set(key, { count: 1, resetAt: now + windowMs });
    else entry.count += 1;
  }

  return (req, res, next) => {
    const key = keyFn(req);
    const now = Date.now();
    const entry = hits.get(key);

    if (entry && entry.resetAt > now && entry.count >= max) {
      res.setHeader("Retry-After", Math.ceil((entry.resetAt - now) / 1000));
      return res.status(429).json({ error: message ?? "Too many attempts. Please wait a few minutes and try again." });
    }

    if (countOnlyFailures) {
      res.on("finish", () => {
        if (res.statusCode >= 400 && res.statusCode !== 429) record(key);
      });
    } else {
      record(key);
    }
    next();
  };
}
