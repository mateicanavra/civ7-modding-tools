import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Value } from "typebox/value";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { makeTestHabitatServiceDeps } from "../support/habitat-service-deps.js";

const mockReport = vi.hoisted(() => ({
  schemaVersion: 2,
  command: "habitat check --json --rule block_unapproved_base_standard_boundary_leaks",
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
const mockFixPreviewPatterns = vi.hoisted(() => vi.fn());
const mockCreateLiveHabitatServiceContext = vi.hoisted(() => vi.fn());
const mockGraphWorkspaceGraph = vi.hoisted(() => vi.fn());
const mockHookPreCommit = vi.hoisted(() => vi.fn());
const mockHookPrePush = vi.hoisted(() => vi.fn());
const mockVerifyChanges = vi.hoisted(() => vi.fn());
const mockWriteFileSync = vi.hoisted(() => vi.fn());
const mockHabitatRuntimeDispose = vi.hoisted(() => vi.fn(async () => {}));

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
      reportSchemaVersion: 2,
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
    fix: { previewPatterns: mockFixPreviewPatterns },
    graph: { workspaceGraph: mockGraphWorkspaceGraph },
    hook: { preCommit: mockHookPreCommit, prePush: mockHookPrePush },
    verify: { changes: mockVerifyChanges },
  })),
}));

vi.mock("../../src/runtime/service-context.js", () => ({
  createLiveHabitatServiceContext: mockCreateLiveHabitatServiceContext,
}));

vi.mock("../../src/runtime/service-runtime.js", () => ({
  habitatServiceManagedRuntime: { dispose: mockHabitatRuntimeDispose },
}));

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
    mockCreateLiveHabitatServiceContext.mockImplementation(async () => ({
      deps: makeTestHabitatServiceDeps(),
    }));
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
        project: "habitat",
        projectRoot: "tools/habitat",
        tags: ["kind:tooling"],
      },
      ruleRouting: [
        {
          ruleId: "block_unapproved_base_standard_boundary_leaks",
          runner: "habitat",
          ownerProject: "habitat",
          coverageKind: "workspace-gate",
          reason: "Workspace-level Habitat gate relevant beyond a single owning project.",
        },
      ],
      runnableTargets: [],
      unavailableTargets: [],
      recoveryInstructions: [],
    }));
    mockFixPreviewPatterns.mockResolvedValue({ exitCode: 0, stdout: "biome ok\n", stderr: "" });
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

  test("check forwards top-level runner selection with other report flags", async () => {
    await Check.run([
      "--json",
      "--output",
      "/tmp/report.json",
      "--rule",
      "block_unapproved_base_standard_boundary_leaks",
      "--owner",
      "habitat",
      "--runner",
      "habitat",
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
            "block_unapproved_base_standard_boundary_leaks",
            "--owner",
            "habitat",
            "--runner",
            "habitat",
            "--staged",
            "--base",
            "HEAD",
          ],
          serialized:
            "habitat check --json --output /tmp/report.json --rule block_unapproved_base_standard_boundary_leaks --owner habitat --runner habitat --staged --base HEAD",
        },
        selectors: {
          owner: "habitat",
          rule: "block_unapproved_base_standard_boundary_leaks",
          runner: "habitat",
        },
        staged: true,
      }),
      expectHabitatCallerOptions()
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
      "prohibit_cross_op_runtime_calls",
      "--rule",
      "prohibit_runtime_validation_and_compiler_imports",
      "--rule",
      "require_recipe_stage_source_topology",
    ]);

    expect(mockCheckReport).toHaveBeenCalledWith(
      expect.objectContaining({
        selectors: {
          owner: undefined,
          rules: [
            "prohibit_cross_op_runtime_calls",
            "prohibit_runtime_validation_and_compiler_imports",
            "require_recipe_stage_source_topology",
          ],
          runner: undefined,
        },
        command: {
          bin: "habitat",
          id: "check",
          argv: [
            "--rule",
            "prohibit_cross_op_runtime_calls",
            "--rule",
            "prohibit_runtime_validation_and_compiler_imports",
            "--rule",
            "require_recipe_stage_source_topology",
          ],
          serialized:
            "habitat check --rule prohibit_cross_op_runtime_calls --rule prohibit_runtime_validation_and_compiler_imports --rule require_recipe_stage_source_topology",
        },
      }),
      expectHabitatCallerOptions()
    );
  });

  test("check expand-baseline uses the authoring path instead of report emission", async () => {
    await Check.run(["--expand-baseline", "--rule", "demo-rule"]);

    expect(mockCheckExpandBaseline).toHaveBeenCalledWith(
      expect.objectContaining({
        selectors: {
          owner: undefined,
          rule: "demo-rule",
          runner: undefined,
        },
        base: "main",
      }),
      expectHabitatCallerOptions()
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
    expect(mockFixPreviewPatterns).toHaveBeenCalledWith({}, expectHabitatCallerOptions());
    expect(stdout.join("")).toContain("biome ok");
    expect(stderr.join("")).toBe("");
  });

  test("fix forwards repeatable rule selection in first-seen CLI order", async () => {
    await Fix.run(["--dry-run", "--rule", "second", "--rule", "first", "--rule", "second"]);

    expect(mockFixPreviewPatterns).toHaveBeenCalledWith(
      { rules: ["second", "first", "second"] },
      expectHabitatCallerOptions()
    );
  });

  test("fix help describes the no-write diagnostic path and live-mutation refusal", async () => {
    const result = spawnSync(
      "bun",
      [resolve(dirname(fileURLToPath(import.meta.url)), "../../bin/dev.ts"), "fix", "--help"],
      { encoding: "utf8" }
    );

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("admitted Habitat rule fixes without writing");
    expect(result.stdout).toMatch(/live mutation is\s+not implemented/);
  });

  test("fix refuses live mutation before constructing a service client", async () => {
    await expect(Fix.run([])).rejects.toMatchObject({ oclif: { exit: 1 } });

    expect(mockCreateLiveHabitatServiceContext).not.toHaveBeenCalled();
    expect(createRouterClient).not.toHaveBeenCalled();
    expect(mockFixPreviewPatterns).not.toHaveBeenCalled();
    expect(stdout.join("")).toBe("");
    expect(stderr.join("")).toContain("unsupported-live-mutation");
  });

  test("fix forwards preview refusal streams and exit code", async () => {
    mockFixPreviewPatterns.mockResolvedValueOnce({
      exitCode: 1,
      stdout: "",
      stderr: "habitat fix refused: invalid-rule-selection\n",
    });

    await expect(Fix.run(["--dry-run", "--rule", "missing"])).rejects.toMatchObject({
      oclif: { exit: 1 },
    });

    expect(mockFixPreviewPatterns).toHaveBeenCalledWith(
      { rules: ["missing"] },
      expectHabitatCallerOptions()
    );
    expect(stdout.join("")).toBe("");
    expect(stderr.join("")).toContain("invalid-rule-selection");
  });

  test("verify awaits check and affected target execution", async () => {
    await Verify.run(["--base", "HEAD~1"]);

    expect(createRouterClient).toHaveBeenCalled();
    expect(mockVerifyChanges).toHaveBeenCalledWith(
      {
        base: "HEAD~1",
        affectedExecution: "run",
      },
      expectHabitatCallerOptions()
    );
    expect(checkReport.verifyCheckSummary).toHaveBeenCalledWith(mockReport);
    expect(checkReport.renderCheckReport).toHaveBeenCalledWith(mockReport);
    expect(stdout.join("")).toContain("affected ok");
  });

  test("verify can emit structured receipt JSON", async () => {
    await Verify.run(["--base", "HEAD~1", "--json"]);

    expect(mockVerifyChanges).toHaveBeenCalledWith(
      {
        base: "HEAD~1",
        affectedExecution: "plan-only",
      },
      expectHabitatCallerOptions()
    );
    expect(checkReport.verifyCheckSummary).toHaveBeenCalledWith(mockReport);
    expect(verifyReceipt.stringifyVerifyReceipt).toHaveBeenCalledWith(
      expect.objectContaining({ schemaVersion: 2 })
    );
    const payload = JSON.parse(capturedOutput()) as { schemaVersion: number };
    expect(payload.schemaVersion).toBe(2);
  });

  test("graph forwards compact JSON output", async () => {
    await Graph.run(["--json"]);

    expect(createRouterClient).toHaveBeenCalled();
    expect(mockGraphWorkspaceGraph).toHaveBeenCalledWith({}, expectHabitatCallerOptions());
    expect(stdout.join("")).toContain('{"nodes":{}}');
  });

  test("classify emits ownership JSON", async () => {
    await Classify.run(["tools/habitat/src/cli/commands/check.ts"]);

    const payload: unknown = JSON.parse(capturedOutput());
    expect(Value.Check(classify.ClassifyResultSchema, payload)).toBe(true);
    const result = Value.Parse(classify.ClassifyResultSchema, payload);
    expect(result.state).toBe("project-path");
    if (result.state !== "project-path") throw new Error("expected project-path");
    expect(result.owner.project).toBe("habitat");
    expect(result.owner.tags).toEqual(["kind:tooling"]);
    expect(createRouterClient).toHaveBeenCalled();
    expect(mockClassifyTarget).toHaveBeenCalledWith(
      {
        target: "tools/habitat/src/cli/commands/check.ts",
      },
      expectHabitatCallerOptions()
    );
  });

  test("hook dispatches through the Habitat service router", async () => {
    await Hook.run(["pre-push", "--base", "HEAD~1"]);

    expect(createRouterClient).toHaveBeenCalled();
    expect(mockHookPrePush).toHaveBeenCalledWith({ base: "HEAD~1" }, expectHabitatCallerOptions());
    expect(stdout.join("")).toContain("hook ok");
  });

  test("pre-commit forwards command cancellation to its Habitat service call", async () => {
    await Hook.run(["pre-commit"]);

    expect(mockHookPreCommit).toHaveBeenCalledWith({}, expectHabitatCallerOptions());
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

  test("normal command completion disposes the managed runtime and removes signal listeners", async () => {
    const before = {
      sigint: process.listenerCount("SIGINT"),
      sigterm: process.listenerCount("SIGTERM"),
    };

    await Classify.run(["tools/habitat/src"]);
    const callerOptions = mockClassifyTarget.mock.calls[0]?.[1];

    expect(mockCreateLiveHabitatServiceContext).toHaveBeenCalledWith({}, callerOptions);
    expect(mockHabitatRuntimeDispose).toHaveBeenCalledTimes(1);
    expect(process.listenerCount("SIGINT")).toBe(before.sigint);
    expect(process.listenerCount("SIGTERM")).toBe(before.sigterm);
  });

  test("interrupts the exact check caller signal before runtime disposal and signal replay", async () => {
    const originalSigintListeners = new Set(process.listeners("SIGINT"));
    const events: string[] = [];
    let callerSignal: AbortSignal | undefined;
    mockCheckReport.mockImplementationOnce(
      async (_input: unknown, options: { readonly signal: AbortSignal }) => {
        callerSignal = options.signal;
        await new Promise<void>((resolve) => {
          options.signal.addEventListener(
            "abort",
            () => {
              events.push("service-finalizer");
              resolve();
            },
            { once: true }
          );
        });
        return mockReport;
      }
    );
    mockHabitatRuntimeDispose.mockImplementationOnce(async () => {
      events.push("runtime-dispose");
    });
    const killSpy = vi.spyOn(process, "kill").mockImplementation(() => {
      events.push("signal-replay");
      return true;
    });

    try {
      const command = Check.run(["--rule", "block_unapproved_base_standard_boundary_leaks"]);
      await vi.waitFor(() => expect(mockCheckReport).toHaveBeenCalledTimes(1));

      const commandListeners = process
        .listeners("SIGINT")
        .filter((listener) => !originalSigintListeners.has(listener));
      expect(commandListeners).toHaveLength(1);
      commandListeners[0]?.("SIGINT");

      await command;

      expect(callerSignal?.aborted).toBe(true);
      expect(events).toEqual(["service-finalizer", "runtime-dispose", "signal-replay"]);
    } finally {
      killSpy.mockRestore();
    }
  });

  function capturedOutput(): string {
    return `${stdout.join("")}${logs.join("\n")}`;
  }
});

function expectHabitatCallerOptions() {
  return expect.objectContaining({
    signal: expect.objectContaining({ aborted: false }),
  });
}

function verifyReceiptPayload(base: string, input: { base?: string; affectedExecution?: string }) {
  const planned = input.affectedExecution === "plan-only";
  return {
    schemaVersion: 2,
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
      reportSchemaVersion: 2,
      selectedRuleIds: [],
      selectedRealRuleIds: ["block_unapproved_base_standard_boundary_leaks"],
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
