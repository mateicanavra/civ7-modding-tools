import { Effect } from "effect";
import { describe, expect, test, vi } from "vitest";

const mockReport = vi.hoisted(() => ({
  schemaVersion: 1,
  command: "habitat check --json",
  startedAt: "2026-06-20T00:00:00.000Z",
  ok: true,
  rules: [],
}));

const expandBaselineResult = vi.hoisted(() => ({
  current: { ok: true as const, messages: ["baseline written: rule-a (1 entries)"] },
}));

vi.mock("../../src/lib/check-report.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../src/lib/check-report.js")>();
  return {
    ...actual,
    checkCommandContext: vi.fn((argv: string[]) => ({
      bin: "habitat",
      id: "check",
      argv,
      serialized: ["habitat", "check", ...argv].join(" "),
    })),
    createCheckReport: vi.fn(async () => mockReport),
    expandBaselines: vi.fn(async () => expandBaselineResult.current),
  };
});

describe("Habitat check service", () => {
  test("runs owned check orchestration from service input", async () => {
    const checkReport = await import("../../src/lib/check-report.js");
    const { runCheckService } = await import("../../src/service/modules/check/run.js");

    const result = await Effect.runPromise(
      runCheckService({
        selectors: { rule: "format-ci", tool: "biome" },
        baselineIntegrity: true,
        base: "origin/main",
        commandArgs: ["--json"],
        staged: true,
        stagedPaths: ["tools/habitat-harness/src/commands/check.ts"],
      })
    );

    expect(result).toBe(mockReport);
    expect(checkReport.createCheckReport).toHaveBeenCalledWith({
      rule: "format-ci",
      tool: "biome",
      base: "origin/main",
      baselineIntegrity: true,
      command: {
        bin: "habitat",
        id: "check",
        argv: ["--json"],
        serialized: "habitat check --json",
      },
      staged: true,
      stagedPaths: ["tools/habitat-harness/src/commands/check.ts"],
    });
  });

  test("projects baseline expansion into service output states", async () => {
    const checkReport = await import("../../src/lib/check-report.js");
    const { expandCheckBaselinesService } = await import("../../src/service/modules/check/run.js");

    const expanded = await Effect.runPromise(
      expandCheckBaselinesService({
        selectors: { owner: "tools-habitat-harness" },
        base: "main",
      })
    );

    expect(expanded).toEqual({
      kind: "expanded",
      messages: ["baseline written: rule-a (1 entries)"],
    });
    expect(checkReport.expandBaselines).toHaveBeenCalledWith(
      { owner: "tools-habitat-harness" },
      { base: "main" }
    );

    expandBaselineResult.current = {
      ok: false,
      requested: { rule: "missing-rule" },
      reason: "unknown-selector",
      selectorFacts: [],
      message: 'Unknown Habitat rule id: "missing-rule".',
    };

    const refused = await Effect.runPromise(
      expandCheckBaselinesService({
        selectors: { rule: "missing-rule" },
      })
    );

    expect(refused).toEqual({
      kind: "refused",
      message: 'Unknown Habitat rule id: "missing-rule".',
    });
  });
});
