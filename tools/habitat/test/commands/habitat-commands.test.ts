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
const mockCheckReport = vi.hoisted(() => vi.fn());
const mockCheckExpandBaseline = vi.hoisted(() => vi.fn());
const mockClassifyTarget = vi.hoisted(() => vi.fn());
const mockFixPlanPatterns = vi.hoisted(() => vi.fn());
const mockFixApplyPatterns = vi.hoisted(() => vi.fn());
const mockGraphWorkspaceGraph = vi.hoisted(() => vi.fn());
const mockHookPreCommit = vi.hoisted(() => vi.fn());
const mockHookPrePush = vi.hoisted(() => vi.fn());
const mockVerifyChanges = vi.hoisted(() => vi.fn());
const mockWriteFileSync = vi.hoisted(() => vi.fn());

vi.mock("node:fs", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:fs")>();
  return {
    ...actual,
    writeFileSync: mockWriteFileSync,
  };
});

vi.mock("../../src/service/model/check/index.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../src/service/model/check/index.js")>();
  return {
    ...actual,
    checkCommandContext: vi.fn((argv: string[]) => ({
      bin: "habitat",
      id: "check",
      argv,
      serialized: ["habitat", "check", ...argv].join(" "),
    })),
    renderCheckReport: vi.fn(() => '{"ok":true}'),
    stringifyCheckReport: vi.fn(() => '{"ok":true}'),
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

vi.mock("../../src/service/modules/verify/model/index.js", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../src/service/modules/verify/model/index.js")>();
  return {
    ...actual,
    stringifyVerifyReceipt: vi.fn((receipt) => JSON.stringify(receipt, null, 2)),
  };
});

vi.mock("@orpc/server", () => ({
  createRouterClient: vi.fn(() => ({
    check: { expandBaseline: mockCheckExpandBaseline, report: mockCheckReport },
    classify: { target: mockClassifyTarget },
    fix: { planPatterns: mockFixPlanPatterns, applyPatterns: mockFixApplyPatterns },
    graph: { workspaceGraph: mockGraphWorkspaceGraph },
    hook: { preCommit: mockHookPreCommit, prePush: mockHookPrePush },
    verify: { changes: mockVerifyChanges },
  })),
}));

vi.mock("../../src/runtime/service-context.js", async () => {
  const { makeTestHabitatServiceDeps } = await import("../support/habitat-service-deps.js");

  return {
    createLiveHabitatServiceContext: vi.fn(async () => ({
      deps: makeTestHabitatServiceDeps(),
    })),
  };
});

import Check from "@habitat/cli/cli/commands/check";
import Classify from "@habitat/cli/cli/commands/classify";
import Fix from "@habitat/cli/cli/commands/fix";
import Graph from "@habitat/cli/cli/commands/graph";
import Hook from "@habitat/cli/cli/commands/hook";
import Verify from "@habitat/cli/cli/commands/verify";
import * as checkReport from "@habitat/cli/service/model/check/index";
import * as classify from "@habitat/cli/service/modules/classify/model/index";
import * as verifyReceipt from "@habitat/cli/service/modules/verify/model/index";
import { createRouterClient } from "@orpc/server";

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
    mockCheckReport.mockResolvedValue(mockReport);
    mockCheckExpandBaseline.mockResolvedValue({
      kind: "expanded",
      messages: ["baseline written: demo-rule (1 entry)"],
    });
    mockClassifyTarget.mockImplementation(async (input: { target: string }) => ({
      schemaVersion: 1,
      state: "project-path",
      input: input.target,
      path: input.target,
      owner: {
        project: "@habitat/cli",
        projectRoot: "tools/habitat",
        tags: ["kind:tooling"],
      },
      ruleRouting: [
        {
          ruleId: "adapter-boundary",
          ownerTool: "command-check",
          ownerProject: "@habitat/cli",
          coverageKind: "workspace-gate",
          reason: "Workspace-level Habitat gate relevant beyond a single owning project.",
        },
      ],
      runnableTargets: [],
      unavailableTargets: [],
      recoveryInstructions: [],
    }));
    mockFixPlanPatterns.mockResolvedValue({ exitCode: 0, stdout: "biome ok\n", stderr: "" });
    mockFixApplyPatterns.mockResolvedValue({ exitCode: 0, stdout: "biome ok\n", stderr: "" });
    mockGraphWorkspaceGraph.mockResolvedValue({
      kind: "completed",
      graph: { nodes: {} },
    });
    mockHookPreCommit.mockResolvedValue({ exitCode: 0, stdout: "hook ok\n", stderr: "" });
    mockHookPrePush.mockResolvedValue({ exitCode: 0, stdout: "hook ok\n", stderr: "" });
    mockVerifyChanges.mockImplementation(
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
      "@habitat/cli",
      "--tool",
      "source-check",
      "--staged",
      "--base",
      "HEAD",
    ]);

    expect(createRouterClient).toHaveBeenCalled();
    expect(mockCheckReport).toHaveBeenCalledWith(
      expect.objectContaining({
        base: "HEAD",
        baselineIntegrity: true,
        command: {
          bin: "habitat",
          id: "check",
          argv: [
            "--json",
            "--output",
            "/tmp/report.json",
            "--rule",
            "adapter-boundary",
            "--owner",
            "@habitat/cli",
            "--tool",
            "source-check",
            "--staged",
            "--base",
            "HEAD",
          ],
          serialized:
            "habitat check --json --output /tmp/report.json --rule adapter-boundary --owner @habitat/cli --tool source-check --staged --base HEAD",
        },
        selectors: {
          owner: "@habitat/cli",
          rule: "adapter-boundary",
          tool: "source-check",
        },
        staged: true,
      })
    );
    expect(checkReport.renderCheckReport).toHaveBeenCalledWith(mockReport, {
      json: true,
    });
    expect(checkReport.stringifyCheckReport).toHaveBeenCalledWith(mockReport);
    expect(mockWriteFileSync).toHaveBeenCalledWith("/tmp/report.json", '{"ok":true}\n');
    expect(capturedOutput()).toContain('{"ok":true}');
  });

  test("check forwards repeated rule flags as a curated rule selection", async () => {
    await Check.run([
      "--rule",
      "op-calls-op",
      "--rule",
      "cutover-source-guardrails",
      "--rule",
      "standard-stage-topology",
    ]);

    expect(mockCheckReport).toHaveBeenCalledWith(
      expect.objectContaining({
        selectors: {
          owner: undefined,
          rules: ["op-calls-op", "cutover-source-guardrails", "standard-stage-topology"],
          tool: undefined,
        },
        command: {
          bin: "habitat",
          id: "check",
          argv: [
            "--rule",
            "op-calls-op",
            "--rule",
            "cutover-source-guardrails",
            "--rule",
            "standard-stage-topology",
          ],
          serialized:
            "habitat check --rule op-calls-op --rule cutover-source-guardrails --rule standard-stage-topology",
        },
      })
    );
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
    expect(mockCheckReport).not.toHaveBeenCalled();
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
    expect(mockCheckReport).not.toHaveBeenCalled();
  });

  test("fix forwards dry-run through the Habitat service router as a plan action", async () => {
    await Fix.run(["--dry-run"]);

    expect(createRouterClient).toHaveBeenCalled();
    expect(mockFixPlanPatterns).toHaveBeenCalledWith({});
    expect(mockFixApplyPatterns).not.toHaveBeenCalled();
    expect(stdout.join("")).toContain("biome ok");
    expect(stderr.join("")).toBe("");
  });

  test("fix forwards live-write intent by default", async () => {
    await Fix.run([]);

    expect(createRouterClient).toHaveBeenCalled();
    expect(mockFixApplyPatterns).toHaveBeenCalledWith({});
    expect(mockFixPlanPatterns).not.toHaveBeenCalled();
    expect(stdout.join("")).toContain("biome ok");
  });

  test("fix forwards refusal streams and exit code", async () => {
    mockFixApplyPatterns.mockResolvedValueOnce({
      exitCode: 1,
      stdout: "",
      stderr: "habitat fix refused: missing-apply-admission\n",
    });

    await expect(Fix.run([])).rejects.toMatchObject({ oclif: { exit: 1 } });

    expect(mockFixApplyPatterns).toHaveBeenCalledWith({});
    expect(stdout.join("")).toBe("");
    expect(stderr.join("")).toContain("missing-apply-admission");
  });

  test("verify awaits check and affected target execution", async () => {
    await Verify.run(["--base", "HEAD~1"]);

    expect(createRouterClient).toHaveBeenCalled();
    expect(mockVerifyChanges).toHaveBeenCalledWith({
      base: "HEAD~1",
      affectedExecution: "run",
    });
    expect(checkReport.verifyCheckSummary).toHaveBeenCalledWith(mockReport);
    expect(checkReport.renderCheckReport).toHaveBeenCalledWith(mockReport);
    expect(stdout.join("")).toContain("affected ok");
  });

  test("verify can emit structured receipt JSON", async () => {
    await Verify.run(["--base", "HEAD~1", "--json"]);

    expect(mockVerifyChanges).toHaveBeenCalledWith({
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

    expect(createRouterClient).toHaveBeenCalled();
    expect(mockGraphWorkspaceGraph).toHaveBeenCalledWith({});
    expect(stdout.join("")).toContain('{"nodes":{}}');
  });

  test("classify emits ownership JSON", async () => {
    await Classify.run(["tools/habitat/src/cli/commands/check.ts"]);

    const payload: unknown = JSON.parse(capturedOutput());
    expect(Value.Check(classify.ClassifyResultSchema, payload)).toBe(true);
    const result = Value.Parse(classify.ClassifyResultSchema, payload);
    expect(result.state).toBe("project-path");
    if (result.state !== "project-path") throw new Error("expected project-path");
    expect(result.owner.project).toBe("@habitat/cli");
    expect(result.owner.tags).toEqual(["kind:tooling"]);
    expect(createRouterClient).toHaveBeenCalled();
    expect(mockClassifyTarget).toHaveBeenCalledWith({
      target: "tools/habitat/src/cli/commands/check.ts",
    });
  });

  test("hook dispatches through the Habitat service router", async () => {
    await Hook.run(["pre-push", "--base", "HEAD~1"]);

    expect(createRouterClient).toHaveBeenCalled();
    expect(mockHookPrePush).toHaveBeenCalledWith({ base: "HEAD~1" });
    expect(stdout.join("")).toContain("hook ok");
  });

  test("hook rejects unknown names before calling the service router", async () => {
    await expect(Hook.run([])).rejects.toThrow();

    expect(mockHookPreCommit).not.toHaveBeenCalled();
    expect(mockHookPrePush).not.toHaveBeenCalled();
    expect(stderr.join("")).toBe(
      "Unknown Habitat hook '(missing)'. Expected pre-commit or pre-push.\n"
    );
  });

  test("classify uses oclif parse errors for missing required path", async () => {
    await expect(Classify.run([])).rejects.toThrow(/Missing 1 required arg/);
  });

  function capturedOutput(): string {
    return `${stdout.join("")}${logs.join("\n")}`;
  }
});

function verifyReceiptPayload(base: string, input: { base?: string; affectedExecution?: string }) {
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
