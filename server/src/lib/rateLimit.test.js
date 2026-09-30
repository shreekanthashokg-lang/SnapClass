import { describe, expect, it } from "vitest";
import { rateLimit } from "./rateLimit.js";

function run(limiter, req, statusCode = 200) {
  const finishHandlers = [];
  const res = {
    statusCode,
    headers: {},
    body: null,
    setHeader(k, v) {
      this.headers[k] = v;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
    on(event, fn) {
      if (event === "finish") finishHandlers.push(fn);
    },
  };
  let passed = false;
  limiter(req, res, () => {
    passed = true;
  });
  finishHandlers.forEach((fn) => fn()); // simulate the response completing
  return { passed, res };
}

describe("rateLimit (count every request)", () => {
  it("allows up to max, then blocks with 429 and a Retry-After header", () => {
    const limiter = rateLimit({ windowMs: 60_000, max: 2 });
    const req = { ip: "1.1.1.1" };
    expect(run(limiter, req).passed).toBe(true);
    expect(run(limiter, req).passed).toBe(true);
    const third = run(limiter, req);
    expect(third.passed).toBe(false);
    expect(third.res.statusCode).toBe(429);
    expect(Number(third.res.headers["Retry-After"])).toBeGreaterThan(0);
  });

  it("tracks different clients independently", () => {
    const limiter = rateLimit({ windowMs: 60_000, max: 1 });
    expect(run(limiter, { ip: "1.1.1.1" }).passed).toBe(true);
    expect(run(limiter, { ip: "2.2.2.2" }).passed).toBe(true);
    expect(run(limiter, { ip: "1.1.1.1" }).passed).toBe(false);
  });
});

describe("rateLimit (count only failures)", () => {
  it("never blocks successful requests, however many there are", () => {
    const limiter = rateLimit({ windowMs: 60_000, max: 2, countOnlyFailures: true });
    for (let i = 0; i < 50; i += 1) expect(run(limiter, { ip: "1.1.1.1" }, 200).passed).toBe(true);
  });

  it("blocks after max failures for the same key, but not other keys", () => {
    const limiter = rateLimit({
      windowMs: 60_000,
      max: 2,
      countOnlyFailures: true,
      keyFn: (req) => `${req.ip}|${req.body.username}`,
    });
    const alice = { ip: "9.9.9.9", body: { username: "alice" } };
    const bob = { ip: "9.9.9.9", body: { username: "bob" } };
    expect(run(limiter, alice, 401).passed).toBe(true);
    expect(run(limiter, alice, 401).passed).toBe(true);
    expect(run(limiter, alice, 401).passed).toBe(false); // alice is locked out
    expect(run(limiter, bob, 401).passed).toBe(true); // bob, same IP, is unaffected
  });
});
