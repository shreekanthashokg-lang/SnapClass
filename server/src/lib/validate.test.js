import { describe, expect, it } from "vitest";
import { faceDescriptorSchema, passwordSchema, subjectCodeSchema, usernameSchema } from "./validate.js";

describe("usernameSchema", () => {
  it("accepts ordinary usernames", () => {
    expect(usernameSchema.safeParse("aarav_m").success).toBe(true);
  });
  it("rejects too short, too long, and disallowed characters", () => {
    expect(usernameSchema.safeParse("ab").success).toBe(false);
    expect(usernameSchema.safeParse("a".repeat(41)).success).toBe(false);
    expect(usernameSchema.safeParse("bad name!").success).toBe(false);
  });
});

describe("passwordSchema", () => {
  it("requires at least 8 characters", () => {
    expect(passwordSchema.safeParse("short1").success).toBe(false);
    expect(passwordSchema.safeParse("longenough1").success).toBe(true);
  });
});

describe("subjectCodeSchema", () => {
  it("uppercases and trims a valid code", () => {
    const result = subjectCodeSchema.safeParse(" cs111 ");
    expect(result.success).toBe(true);
    expect(result.data).toBe("CS111");
  });
  it("rejects codes with spaces or symbols", () => {
    expect(subjectCodeSchema.safeParse("CS 111").success).toBe(false);
    expect(subjectCodeSchema.safeParse("CS111!").success).toBe(false);
  });
});

describe("faceDescriptorSchema", () => {
  it("requires exactly 128 finite numbers", () => {
    expect(faceDescriptorSchema.safeParse(Array(128).fill(0.1)).success).toBe(true);
    expect(faceDescriptorSchema.safeParse(Array(127).fill(0.1)).success).toBe(false);
    expect(faceDescriptorSchema.safeParse([...Array(127).fill(0.1), Infinity]).success).toBe(false);
  });
});
