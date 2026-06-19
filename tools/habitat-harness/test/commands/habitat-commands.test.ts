import { Value } from "typebox/value";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const mockReport = vi.hoisted(() => ({
  schemaVersion: 1,
  command: "habitat check --json --rule doc-ambiguity",
  startedAt: "2026-06-13T00:00:00.000Z",
  ok: true,
  rules: [],
}));
const mockVerifyTargetPlan = vi.hoisted(() => ({
  kind: "verify-target-plan",
  targets: ["build"],
  states: [],
}));

vi.mock("../../src/lib/check-report.js", () => ({
  checkCommandContext: vi.fn((argv: string[]) => ({
    bin: "habitat",
    id: "check",
    argv,
    serialized: ["habitat", "check", ...argv].join(" "),
  })),
  createCheckReport: vi.fn(() => mockReport),
  describeRuleSelectionFailure: vi.fn(() => "invalid selector"),
  expandBaselines: vi.fn(() => ({ ok: true, messages: ["baseline written: demo-rule (1 entry)"] })),
  renderCheckReport: vi.fn(() => '{"ok":true}'),
  verifyCheckSummaryProjection: vi.fn(() => ({
    reportSchemaVersion: 1,
    requestedSelectors: {},
    selectedRuleIds: [],
    selectedRealRuleIds: [],
    builtInRuleIds: [],
    statusCounts: {},
    advisoryCount: 0,
    failingCount: 0,
    refusedCount: 0,
    notApplicableCount: 0,
    allowsAffectedExecution: true,
  })),
}));

vi.mock("../../src/lib/classify.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../src/lib/classify.js")>();
  return {
    ...actual,
    classifyTargetResult: vi.fn((target: string) => ({
      schemaVersion: 1,
      state: "project-path",
      input: target,
      path: target,
      owner: {
        project: "@internal/habitat-harness",
        projectRoot: "tools/habitat-harness",
        tags: ["kind:tooling"],
      },
      ruleRouting: [
        {
          ruleId: "workspace-entrypoints",
          ownerTool: "habitat-native",
          ownerProject: "@internal/habitat-harness",
          coverageKind: "workspace-gate",
          reason: "Workspace-level Habitat gate relevant beyond a single owning project.",
        },
      ],
      runnableTargets: [],
      unavailableTargets: [],
      recoveryInstructions: [],
    })),
    stringifyClassifyResult: vi.fn(actual.stringifyClassifyResult),
  };
});

vi.mock("../../src/lib/fix.js", () => ({
  runFix: vi.fn(() => ({ exitCode: 0, stdout: "biome ok\n", stderr: "" })),
}));

vi.mock("../../src/lib/graph.js", () => ({
  runGraph: vi.fn(() => ({ exitCode: 0, stdout: '{"nodes":{}}\n', stderr: "" })),
}));

vi.mock("../../src/lib/hooks.js", () => ({
  runHook: vi.fn(() => ({ exitCode: 0, stdout: "hook ok\n", stderr: "" })),
}));

vi.mock("../../src/lib/verify/index.js", () => ({
  createVerifyReceipt: vi.fn(() => ({
    schemaVersion: 1,
    outcome: "succeeded",
    command: {
      argv: ["habitat", "verify", "--json"],
      cwd: "/repo",
      env: {},
      startedAt: "2026-06-13T00:00:00.000Z",
      durationMs: 1,
      exitCode: 0,
    },
    base: { requested: "HEAD~1", resolved: "HEAD~1", source: "flag" },
    habitatCheck: {
      reportSchemaVersion: 1,
      selectedRuleIds: [],
      selectedRealRuleIds: ["workspace-entrypoints"],
      builtInRuleIds: [],
      statusCounts: {},
      advisoryCount: 0,
      failingCount: 0,
      refusedCount: 0,
      notApplicableCount: 0,
      consumption: "allows-affected-execution",
      selectorState: { kind: "none" },
    },
    targetPlan: { kind: "target-plan-ready", targets: ["build"] },
    nxAffected: {
      kind: "executed",
      argv: ["nx", "affected", "-t", "build", "--base", "HEAD~1"],
      targets: ["build"],
      projects: [],
      cacheStateByTask: [],
      exitCode: 0,
      stdoutLength: 12,
      stderrLength: 0,
      stdoutPreview: "affected ok\n",
      stderrPreview: "",
      stdoutTruncated: false,
      stderrTruncated: false,
    },
    postState: {
      kind: "observed-clean",
      gitStatus: {
        argv: ["git", "status", "--short", "--branch"],
        cwd: "/repo",
        exitCode: 0,
        stdoutLength: 0,
        stderrLength: 0,
        stdoutPreview: "",
        stderrPreview: "",
        stdoutTruncated: false,
        stderrTruncated: false,
      },
    },
  })),
  readVerifyTargetPlan: vi.fn(() => mockVerifyTargetPlan),
  resolveVerifyBase: vi.fn((base?: string) => ({
    kind: "resolved",
    base: base ?? "merge-base",
    source: base ? "flag" : "merge-base",
  })),
  runAffectedVerification: vi.fn(() => ({ exitCode: 0, stdout: "affected ok\n", stderr: "" })),
  stringifyVerifyReceipt: vi.fn((receipt) => JSON.stringify(receipt, null, 2)),
}));

import Check from "../../src/commands/check.js";
import Classify from "../../src/commands/classify.js";
import Fix from "../../src/commands/fix.js";
import Graph from "../../src/commands/graph.js";
import Hook from "../../src/commands/hook.js";
import Verify from "../../src/commands/verify.js";
import * as checkReport from "../../src/lib/check-report.js";
import * as classify from "../../src/lib/classify.js";
import * as fix from "../../src/lib/fix.js";
import * as graph from "../../src/lib/graph.js";
import * as hooks from "../../src/lib/hooks.js";
import * as verifyReceipt from "../../src/lib/verify/index.js";

describe("Habitat oclif commands", () => {
  let stdout: string[];
  let stderr: string[];
  let logs: string[];
  let stdoutSpy: ReturnType<typeof vi.spyOn>;
  let stderrSpy: ReturnType<typeof vi.spyOn>;
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    stdout = [];
    stderr = [];
    logs = [];
    stdoutSpy = vi.spyOn(process.stdout, "write").mockImplementation((chunk) => {
      stdout.push(String(chunk));
      return true;
    });
    stderrSpy = vi.spyOn(process.stderr, "write").mockImplementation((chunk) => {
      stderr.push(String(chunk));
      return true;
    });
    logSpy = vi.spyOn(console, "log").mockImplementation((message) => {
      logs.push(String(message));
    });
  });

  afterEach(() => {
    stdoutSpy.mockRestore();
    stderrSpy.mockRestore();
    logSpy.mockRestore();
  });

  test("check parses JSON, output, rule, owner, and base flags", async () => {
    await Check.run([
      "--json",
      "--output",
      "/tmp/report.json",
      "--rule",
      "doc-ambiguity",
      "--owner",
      "@internal/habitat-harness",
      "--tool",
      "grit-check",
      "--staged",
      "--base",
      "HEAD",
    ]);

    expect(checkReport.createCheckReport).toHaveBeenCalledWith(
      expect.objectContaining({
        base: "HEAD",
        owner: "@internal/habitat-harness",
        rule: "doc-ambiguity",
        tool: "grit-check",
        staged: true,
        command: expect.objectContaining({
          argv: expect.arrayContaining(["--json", "--rule", "doc-ambiguity"]),
          bin: "habitat",
          id: "check",
        }),
      })
    );
    expect(checkReport.renderCheckReport).toHaveBeenCalledWith(mockReport, {
      json: true,
      output: "/tmp/report.json",
    });
    expect(capturedOutput()).toContain('{"ok":true}');
  });

  test("check expand-baseline uses the authoring path instead of report emission", async () => {
    await Check.run(["--expand-baseline", "--rule", "demo-rule"]);

    expect(checkReport.expandBaselines).toHaveBeenCalledWith(
      {
        owner: undefined,
        rule: "demo-rule",
        tool: undefined,
      },
      {
        base: "main",
      }
    );
    expect(checkReport.createCheckReport).not.toHaveBeenCalled();
    expect(capturedOutput()).toContain("baseline written: demo-rule");
  });

  test("fix forwards dry-run intent to the transaction runner", async () => {
    await Fix.run(["--dry-run"]);

    expect(fix.runFix).toHaveBeenCalledWith({ kind: "dry-run-intent" });
    expect(stdout.join("")).toContain("biome ok");
    expect(stderr.join("")).toBe("");
  });

  test("verify awaits check and affected target execution", async () => {
    await Verify.run(["--base", "HEAD~1"]);

    expect(checkReport.createCheckReport).toHaveBeenCalledWith(
      expect.objectContaining({
        base: "HEAD~1",
        command: expect.objectContaining({
          argv: ["--base", "HEAD~1"],
          bin: "habitat",
          id: "check",
        }),
      })
    );
    expect(verifyReceipt.runAffectedVerification).toHaveBeenCalledWith(
      "HEAD~1",
      mockVerifyTargetPlan
    );
    expect(checkReport.verifyCheckSummaryProjection).toHaveBeenCalledWith(mockReport);
    expect(stdout.join("")).toContain("affected ok");
  });

  test("verify can emit structured receipt JSON", async () => {
    await Verify.run(["--base", "HEAD~1", "--json"]);

    expect(checkReport.createCheckReport).toHaveBeenCalledWith(
      expect.objectContaining({
        base: "HEAD~1",
        command: expect.objectContaining({
          argv: ["--base", "HEAD~1", "--json"],
          bin: "habitat",
          id: "check",
        }),
      })
    );
    expect(verifyReceipt.runAffectedVerification).toHaveBeenCalledWith(
      "HEAD~1",
      mockVerifyTargetPlan
    );
    expect(checkReport.verifyCheckSummaryProjection).toHaveBeenCalledWith(mockReport);
    expect(verifyReceipt.createVerifyReceipt).toHaveBeenCalledWith(
      expect.objectContaining({
        requestedBase: "HEAD~1",
        resolvedBase: "HEAD~1",
        commandArgs: ["--base", "HEAD~1", "--json"],
        exitCode: 0,
        checkReport: mockReport,
        verifyTargetPlan: mockVerifyTargetPlan,
        baseSource: "flag",
      })
    );
    const payload = JSON.parse(capturedOutput()) as { schemaVersion: number };
    expect(payload.schemaVersion).toBe(1);
  });

  test("graph forwards compact JSON output", async () => {
    await Graph.run(["--json"]);

    expect(graph.runGraph).toHaveBeenCalledWith({ json: true });
    expect(stdout.join("")).toContain('{"nodes":{}}');
  });

  test("classify emits ownership JSON", async () => {
    await Classify.run(["tools/habitat-harness/src/commands/check.ts"]);

    const payload: unknown = JSON.parse(capturedOutput());
    expect(Value.Check(classify.ClassifyResultSchema, payload)).toBe(true);
    const result = Value.Parse(classify.ClassifyResultSchema, payload);
    expect(result.state).toBe("project-path");
    if (result.state !== "project-path") throw new Error("expected project-path");
    expect(result.owner.project).toBe("@internal/habitat-harness");
    expect(result.owner.tags).toEqual(["kind:tooling"]);
    expect(classify.classifyTargetResult).toHaveBeenCalledWith(
      "tools/habitat-harness/src/commands/check.ts"
    );
  });

  test("hook dispatches to the Habitat hook runner", async () => {
    await Hook.run(["pre-push", "--base", "HEAD~1"]);

    expect(hooks.runHook).toHaveBeenCalledWith("pre-push", { base: "HEAD~1" });
    expect(stdout.join("")).toContain("hook ok");
  });

  test("classify uses oclif parse errors for missing required path", async () => {
    await expect(Classify.run([])).rejects.toThrow(/Missing 1 required arg/);
  });

  function capturedOutput(): string {
    return `${stdout.join("")}${logs.join("\n")}`;
  }
});
