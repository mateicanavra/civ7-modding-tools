import { describe, expect, test } from "vitest";
import { runGeneratedZoneRule } from "../../src/lib/generated-zones.js";

describe("file-layer rule execution", () => {
  test("rejects an unknown generated zone before staged no-op behavior", () => {
    const result = runGeneratedZoneRule({
      id: "file-layer-unknown-zone",
      lane: "enforced",
      message: "Generated output must be regenerated.",
      generatedZone: "unknown-zone",
    });

    expect(result.exitCode).toBe(1);
    expect(result.diagnostics).toEqual([
      {
        ruleId: "file-layer-unknown-zone",
        path: ".",
        message: "Unknown generated zone 'unknown-zone'.",
        severity: "error",
        baselined: false,
      },
    ]);
  });
});
