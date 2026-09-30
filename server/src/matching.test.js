import { describe, expect, it } from "vitest";
import { cosineSimilarity, euclideanDistance, FACE_MATCH_DISTANCE_THRESHOLD, VOICE_MATCH_SIMILARITY_THRESHOLD } from "./matching.js";

describe("euclideanDistance", () => {
  it("computes the straight-line distance between two vectors", () => {
    expect(euclideanDistance([0, 0], [3, 4])).toBe(5);
    expect(euclideanDistance([1, 1, 1], [1, 1, 1])).toBe(0);
  });

  it("returns Infinity for mismatched lengths rather than throwing", () => {
    expect(euclideanDistance([1, 2], [1, 2, 3])).toBe(Infinity);
  });
});

describe("cosineSimilarity", () => {
  it("is 1 for identical direction, 0 for orthogonal, -1 for opposite", () => {
    expect(cosineSimilarity([1, 0], [1, 0])).toBe(1);
    expect(cosineSimilarity([1, 0], [0, 1])).toBe(0);
    expect(cosineSimilarity([1, 0], [-1, 0])).toBe(-1);
  });

  it("is scale-invariant (only direction matters)", () => {
    expect(cosineSimilarity([2, 0], [5, 0])).toBe(1);
  });

  it("returns -1 for a zero vector or mismatched lengths instead of NaN", () => {
    expect(cosineSimilarity([0, 0], [1, 1])).toBe(-1);
    expect(cosineSimilarity([1, 2], [1, 2, 3])).toBe(-1);
  });
});

describe("thresholds", () => {
  // These document the calibrated cutoffs the attendance routes rely on; a change here
  // is a deliberate accuracy/strictness trade-off, not a refactor.
  it("face distance threshold is 0.6 (face-api.js / dlib's documented same-person cutoff)", () => {
    expect(FACE_MATCH_DISTANCE_THRESHOLD).toBe(0.6);
  });

  it("voice similarity threshold is conservative given the lightweight MFCC method", () => {
    expect(VOICE_MATCH_SIMILARITY_THRESHOLD).toBeGreaterThan(0.7);
    expect(VOICE_MATCH_SIMILARITY_THRESHOLD).toBeLessThan(1);
  });
});
