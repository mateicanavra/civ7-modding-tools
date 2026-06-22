import { Value } from "typebox/value";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const mockReport = vi.hoisted(() => ({
  schemaVersion: 1,
  command: "habitat check --json --rule adapter-boundary",
  startedAt: "2026-06-13T00:00:00.000Z",
  ok: true,
  rules: [],
}));
const mockVerifyTargetPlan = vi.hoisted(() => ({
  kind: "verify-target-plan",
  targets: ["build"],
  states: [],
}));
const mockCheckRun = vi.hoisted(() => vi.fn());
const mockCheckExpandBaseline = vi.hoisted(() => vi.fn());
const mockClassifyRun = vi.hoisted(() => vi.fn());
const mockFixRun = vi.hoisted(() => vi.fn());
const mockGraphRun = vi.hoisted(() => vi.fn());
const mockHookRun = vi.hoisted(() => vi.fn());
const mockVerifyRun = vi.hoisted(() => vi.fn());

vi.mock("../../src/service/model/check/structural/index.js", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../src/service/model/check/structural/index.js")>();
  return {
    ...actual,
    checkCommandContext: vi.fn((argv: string[]) => ({
      bin: "habitat",
      id: "check",
      argv,
      serialized: ["habitat", "check", ...argv].join(" "),
    })),
    renderCheckReport: vi.fn(() => '{"ok":true}'),
    verifyCheckSummary: vi.fn(() => ({
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
  };
});

vi.mock("../../src/service/model/verify/index.js", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("../../src/service/model/verify/index.js")
    >();
  return {
    ...actual,
    stringifyVerifyReceipt: vi.fn((receipt) => JSON.stringify(receipt, null, 2)),
  };
});

vi.mock("../../src/service/router.js", () => ({
  createHabitatServiceClient: vi.fn(() => ({
    check: { expandBaseline: mockCheckExpandBaseline, run: mockCheckRun },
    classify: { run: mockClassifyRun },
    fix: { run: mockFixRun },
    graph: { run: mockGraphRun },
    hook: { run: mockHookRun },
    verify: { run: mockVerifyRun },
  })),
}));

import Check from "@internal/habitat-harness/cli/commands/check";
import Classify from "@internal/habitat-harness/cli/commands/classify";
import Fix from "@internal/habitat-harness/cli/commands/fix";
import Graph from "@internal/habitat-harness/cli/commands/graph";
import Hook from "@internal/habitat-harness/cli/commands/hook";
import Verify from "@internal/habitat-harness/cli/commands/verify";
import * as checkReport from "@internal/habitat-harness/service/model/check/structural/index";
import * as classify from "@internal/habitat-harness/service/model/workspace/index";
import * as verifyReceipt from "@internal/habitat-harness/service/model/verify/index";
import * as serviceClient from "@internal/habitat-harness/service/router";

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
    mockCheckRun.mockResolvedValue(mockReport);
    mockCheckExpandBaseline.mockResolvedValue({
      kind: "expanded",
      messages: ["baseline written: demo-rule (1 entry)"],
    });
    mockClassifyRun.mockImplementation(async (input: { target: string }) => ({
      schemaVersion: 1,
      state: "project-path",
      input: input.target,
      path: input.target,
      owner: {
        project: "@internal/habitat-harness",
        projectRoot: "tools/habitat-harness",
        tags: ["kind:tooling"],
      },
      ruleRouting: [
        {
          ruleId: "adapter-boundary",
          ownerTool: "command-check",
          ownerProject: "@internal/habitat-harness",
          coverageKind: "workspace-gate",
          reason: "Workspace-level Habitat gate relevant beyond a single owning project.",
        },
      ],
      runnableTargets: [],
      unavailableTargets: [],
      recoveryInstructions: [],
    }));
    mockFixRun.mockResolvedValue({ exitCode: 0, stdout: "biome ok\n", stderr: "" });
    mockGraphRun.mockResolvedValue({ exitCode: 0, stdout: '{"nodes":{}}\n', stderr: "" });
    mockHookRun.mockResolvedValue({ exitCode: 0, stdout: "hook ok\n", stderr: "" });
    mockVerifyRun.mockImplementation(
      async (input: { base?: string; affectedExecution?: string }) => {
        const base = input.base ?? "merge-base";
        return {
          kind: "completed",
          base,
          checkReport: mockReport,
          targetPlan: mockVerifyTargetPlan,
          affectedResult: { exitCode: 0, stdout: "affected ok\n", stderr: "" },
          receipt: verifyReceiptPayload(base, input),
        };
      }
    );
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
      "adapter-boundary",
      "--owner",
      "@internal/habitat-harness",
      "--tool",
      "source-check",
      "--staged",
      "--base",
      "HEAD",
    ]);

    expect(serviceClient.createHabitatServiceClient).toHaveBeenCalled();
    expect(mockCheckRun).toHaveBeenCalledWith(
      expect.objectContaining({
        base: "HEAD",
        baselineIntegrity: true,
        selectors: {
          owner: "@internal/habitat-harness",
          rule: "adapter-boundary",
          tool: "source-check",
        },
        staged: true,
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

    expect(mockCheckExpandBaseline).toHaveBeenCalledWith(
      expect.objectContaining({
        selectors: {
          owner: undefined,
          rule: "demo-rule",
          tool: undefined,
        },
        base: "main",
      })
    );
    expect(mockCheckRun).not.toHaveBeenCalled();
    expect(capturedOutput()).toContain("baseline written: demo-rule");
  });

  test("check expand-baseline exits on service refusal", async () => {
    mockCheckExpandBaseline.mockResolvedValueOnce({
      kind: "refused",
      message: "invalid selector",
    });

    await expect(Check.run(["--expand-baseline", "--rule", "missing-rule"])).rejects.toMatchObject({
      oclif: { exit: 1 },
    });
    expect(mockCheckRun).not.toHaveBeenCalled();
  });

  test("fix forwards dry-run intent through the Habitat service client", async () => {
    await Fix.run(["--dry-run"]);

    expect(serviceClient.createHabitatServiceClient).toHaveBeenCalled();
    expect(mockFixRun).toHaveBeenCalledWith({ kind: "dry-run-intent" });
    expect(stdout.join("")).toContain("biome ok");
    expect(stderr.join("")).toBe("");
  });

  test("fix forwards live-write intent by default", async () => {
    await Fix.run([]);

    expect(serviceClient.createHabitatServiceClient).toHaveBeenCalled();
    expect(mockFixRun).toHaveBeenCalledWith({ kind: "live-write-intent" });
    expect(stdout.join("")).toContain("biome ok");
  });

  test("fix forwards refusal streams and exit code", async () => {
    mockFixRun.mockResolvedValueOnce({
      exitCode: 1,
      stdout: "",
      stderr: "habitat fix refused: missing-apply-admission\n",
    });

    await expect(Fix.run([])).rejects.toMatchObject({ oclif: { exit: 1 } });

    expect(mockFixRun).toHaveBeenCalledWith({ kind: "live-write-intent" });
    expect(stdout.join("")).toBe("");
    expect(stderr.join("")).toContain("missing-apply-admission");
  });

  test("verify awaits check and affected target execution", async () => {
    await Verify.run(["--base", "HEAD~1"]);

    expect(serviceClient.createHabitatServiceClient).toHaveBeenCalled();
    expect(mockVerifyRun).toHaveBeenCalledWith({
      base: "HEAD~1",
      affectedExecution: "run",
    });
    expect(checkReport.verifyCheckSummary).toHaveBeenCalledWith(mockReport);
    expect(checkReport.renderCheckReport).toHaveBeenCalledWith(mockReport);
    expect(stdout.join("")).toContain("affected ok");
  });

  test("verify can emit structured receipt JSON", async () => {
    await Verify.run(["--base", "HEAD~1", "--json"]);

    expect(mockVerifyRun).toHaveBeenCalledWith({
      base: "HEAD~1",
      affectedExecution: "plan-only",
    });
    expect(checkReport.verifyCheckSummary).toHaveBeenCalledWith(mockReport);
    expect(verifyReceipt.stringifyVerifyReceipt).toHaveBeenCalledWith(
      expect.objectContaining({ schemaVersion: 1 })
    );
    const payload = JSON.parse(capturedOutput()) as { schemaVersion: number };
    expect(payload.schemaVersion).toBe(1);
  });

  test("graph forwards compact JSON output", async () => {
    await Graph.run(["--json"]);

    expect(serviceClient.createHabitatServiceClient).toHaveBeenCalled();
    expect(mockGraphRun).toHaveBeenCalledWith({ json: true });
    expect(stdout.join("")).toContain('{"nodes":{}}');
  });

  test("classify emits ownership JSON", async () => {
    await Classify.run(["tools/habitat-harness/src/cli/commands/check.ts"]);

    const payload: unknown = JSON.parse(capturedOutput());
    expect(Value.Check(classify.ClassifyResultSchema, payload)).toBe(true);
    const result = Value.Parse(classify.ClassifyResultSchema, payload);
    expect(result.state).toBe("project-path");
    if (result.state !== "project-path") throw new Error("expected project-path");
    expect(result.owner.project).toBe("@internal/habitat-harness");
    expect(result.owner.tags).toEqual(["kind:tooling"]);
    expect(serviceClient.createHabitatServiceClient).toHaveBeenCalled();
    expect(mockClassifyRun).toHaveBeenCalledWith({
      target: "tools/habitat-harness/src/cli/commands/check.ts",
    });
  });

  test("hook dispatches through the Habitat service client", async () => {
    await Hook.run(["pre-push", "--base", "HEAD~1"]);

    expect(serviceClient.createHabitatServiceClient).toHaveBeenCalled();
    expect(mockHookRun).toHaveBeenCalledWith({ name: "pre-push", base: "HEAD~1" });
    expect(stdout.join("")).toContain("hook ok");
  });

  test("classify uses oclif parse errors for missing required path", async () => {
    await expect(Classify.run([])).rejects.toThrow(/Missing 1 required arg/);
  });

  function capturedOutput(): string {
    return `${stdout.join("")}${logs.join("\n")}`;
  }
});

function verifyReceiptPayload(
  base: string,
  input: { base?: string; affectedExecution?: string }
) {
  const planned = input.affectedExecution === "plan-only";
  return {
    schemaVersion: 1,
    outcome: planned ? "planned" : "succeeded",
    command: {
      argv: ["habitat", "verify"],
      cwd: "/repo",
      env: {},
      startedAt: "2026-06-13T00:00:00.000Z",
      durationMs: 1,
      exitCode: 0,
    },
    base: {
      requested: input.base ?? null,
      resolved: base,
      source: input.base ? "flag" : "merge-base",
    },
    habitatCheck: {
      reportSchemaVersion: 1,
      selectedRuleIds: [],
      selectedRealRuleIds: ["adapter-boundary"],
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
      kind: planned ? "skipped" : "executed",
      ...(planned ? { skipReason: "receipt-only" } : {}),
      argv: ["nx", "affected", "-t", "build", "--base", base],
      targets: ["build"],
      projects: [],
      cacheStateByTask: [],
      exitCode: planned ? null : 0,
      stdoutLength: planned ? 0 : 12,
      stderrLength: 0,
      stdoutPreview: planned ? "" : "affected ok\n",
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
  };
}
