import { describe, expect, it } from "vitest";
import { formatErrorForUi } from "../../src/features/browserRunner/errorFormat";

describe("formatErrorForUi", () => {
  it("formats Error instances", () => {
    const err = new Error("boom");
    const output = formatErrorForUi(err);
    expect(output).toContain("Error: boom");
  });

  it("formats ErrorEvent-like payloads", () => {
    const output = formatErrorForUi({
      message: "worker failed",
      filename: "worker.ts",
      lineno: 12,
      colno: 7,
    });
    expect(output).toContain("worker failed");
    expect(output).toContain("worker.ts:12:7");
  });

  it("formats nested error payloads", () => {
    const output = formatErrorForUi({
      message: "worker failed",
      error: new Error("inner boom"),
    });
    expect(output).toContain("worker failed");
    expect(output).toContain("inner boom");
  });

  it("formats primitives", () => {
    expect(formatErrorForUi(42)).toBe("42");
    expect(formatErrorForUi(true)).toBe("true");
  });
});

