import { describe, expect, it } from "vitest";
import { countPresent, outcomeFor, SAMPLE_STUDENTS } from "./data";
import { demoReducer, initialState, type DemoState } from "./state";

const total = SAMPLE_STUDENTS.length;

describe("demoReducer", () => {
  it("starts idle with nothing revealed", () => {
    expect(initialState).toEqual({ method: "photo", phase: "idle", revealed: 0 });
  });

  it("moves from idle to scanning, then reveals one row per tick", () => {
    let state = demoReducer(initialState, { type: "start" });
    expect(state.phase).toBe("scanning");
    state = demoReducer(state, { type: "tick" });
    expect(state.revealed).toBe(1);
  });

  it("enters review after the last row is resolved", () => {
    let state: DemoState = demoReducer(initialState, { type: "start" });
    for (let i = 0; i < total; i += 1) state = demoReducer(state, { type: "tick" });
    expect(state).toMatchObject({ phase: "review", revealed: total });
  });

  it("ignores ticks and confirms outside their phase", () => {
    expect(demoReducer(initialState, { type: "tick" })).toBe(initialState);
    expect(demoReducer(initialState, { type: "confirm" })).toBe(initialState);
  });

  it("saves on confirm and clears rows on discard", () => {
    const review = demoReducer(initialState, { type: "finishNow" });
    expect(demoReducer(review, { type: "confirm" }).phase).toBe("saved");
    expect(demoReducer(review, { type: "discard" })).toMatchObject({ phase: "discarded", revealed: 0 });
  });

  it("allows another run after a discard but not after saving", () => {
    const discarded = demoReducer(demoReducer(initialState, { type: "finishNow" }), { type: "discard" });
    expect(demoReducer(discarded, { type: "start" }).phase).toBe("scanning");
    const saved = demoReducer(demoReducer(initialState, { type: "finishNow" }), { type: "confirm" });
    expect(demoReducer(saved, { type: "start" })).toBe(saved);
  });

  it("resets progress when the method changes", () => {
    const review = demoReducer(initialState, { type: "finishNow" });
    expect(demoReducer(review, { type: "selectMethod", method: "voice" })).toEqual({
      method: "voice",
      phase: "idle",
      revealed: 0,
    });
  });
});

describe("sample data", () => {
  it("shows a dash instead of a score for absent voices", () => {
    const absent = SAMPLE_STUDENTS.find((student) => !student.voice.present);
    expect(absent && outcomeFor(absent, "voice").evidence).toBe("–");
  });

  it("counts present students per method", () => {
    expect(countPresent("photo")).toBe(5);
    expect(countPresent("voice")).toBe(4);
  });
});
