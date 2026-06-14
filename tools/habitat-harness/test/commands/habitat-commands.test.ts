import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const mockReport = vi.hoisted(() => ({
  schemaVersion: 1,
  command: "habitat check --json --rule doc-ambiguity",
  startedAt: "2026-06-13T00:00:00.000Z",
  ok: true,
  rules: [],
}));

vi.mock("../../src/lib/command-engine.js", () => ({
  classifyTarget: vi.fn((target: string) => ({
    path: target,
    project: "@internal/habitat-harness",
    projectRoot: "tools/habitat-harness",
    tags: ["kind:tooling"],
    rulesInScope: ["biome-ci"],
    requiredTargets: ["bun run habitat:check"],
  })),
  createCheckReport: vi.fn(() => mockReport),
  expandBaselines: vi.fn(() => ["baseline written: demo-rule (1 entry)"]),
  renderCheckReport: vi.fn(() => '{"ok":true}'),
  resolveVerifyBase: vi.fn((base?: string) => base ?? "merge-base"),
  runHook: vi.fn(() => ({ exitCode: 0, stdout: "hook ok\n", stderr: "" })),
  runAffectedVerification: vi.fn(() => ({ exitCode: 0, stdout: "affected ok\n", stderr: "" })),
  runFix: vi.fn(() => ({ exitCode: 0, stdout: "biome ok\n", stderr: "" })),
  runGraph: vi.fn(() => ({ exitCode: 0, stdout: '{"nodes":{}}\n', stderr: "" })),
}));

import Check from "../../src/commands/check.js";
import Classify from "../../src/commands/classify.js";
import Fix from "../../src/commands/fix.js";
import Graph from "../../src/commands/graph.js";
import Hook from "../../src/commands/hook.js";
import Verify from "../../src/commands/verify.js";
import * as engine from "../../src/lib/command-engine.js";

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

    expect(engine.createCheckReport).toHaveBeenCalledWith(
      expect.objectContaining({
        base: "HEAD",
        owner: "@internal/habitat-harness",
        rule: "doc-ambiguity",
        tool: "grit-check",
        staged: true,
        commandArgs: expect.arrayContaining(["--json", "--rule", "doc-ambiguity"]),
      })
    );
    expect(engine.renderCheckReport).toHaveBeenCalledWith(mockReport, {
      json: true,
      output: "/tmp/report.json",
    });
    expect(capturedOutput()).toContain('{"ok":true}');
  });

  test("check expand-baseline uses the authoring path instead of report emission", async () => {
    await Check.run(["--expand-baseline", "--rule", "demo-rule"]);

    expect(engine.expandBaselines).toHaveBeenCalledWith({
      owner: undefined,
      rule: "demo-rule",
      tool: undefined,
    });
    expect(engine.createCheckReport).not.toHaveBeenCalled();
    expect(capturedOutput()).toContain("baseline written: demo-rule");
  });

  test("fix forwards dry-run to the Biome runner", async () => {
    await Fix.run(["--dry-run"]);

    expect(engine.runFix).toHaveBeenCalledWith({ dryRun: true });
    expect(stdout.join("")).toContain("biome ok");
    expect(stderr.join("")).toBe("");
  });

  test("verify awaits check and affected target execution", async () => {
    await Verify.run(["--base", "HEAD~1"]);

    expect(engine.createCheckReport).toHaveBeenCalledWith(
      expect.objectContaining({ base: "HEAD~1", commandArgs: ["--base", "HEAD~1"] })
    );
    expect(engine.runAffectedVerification).toHaveBeenCalledWith("HEAD~1");
    expect(stdout.join("")).toContain("affected ok");
  });

  test("graph forwards compact JSON output", async () => {
    await Graph.run(["--json"]);

    expect(engine.runGraph).toHaveBeenCalledWith({ json: true });
    expect(stdout.join("")).toContain('{"nodes":{}}');
  });

  test("classify emits ownership JSON", async () => {
    await Classify.run(["tools/habitat-harness/src/commands/check.ts"]);

    const payload = JSON.parse(capturedOutput()) as { project: string; tags: string[] };
    expect(payload.project).toBe("@internal/habitat-harness");
    expect(payload.tags).toEqual(["kind:tooling"]);
    expect(engine.classifyTarget).toHaveBeenCalledWith(
      "tools/habitat-harness/src/commands/check.ts"
    );
  });

  test("hook dispatches to the Habitat hook runner", async () => {
    await Hook.run(["pre-push", "--base", "HEAD~1"]);

    expect(engine.runHook).toHaveBeenCalledWith("pre-push", { base: "HEAD~1" });
    expect(stdout.join("")).toContain("hook ok");
  });

  test("classify uses oclif parse errors for missing required path", async () => {
    await expect(Classify.run([])).rejects.toThrow(/Missing 1 required arg/);
  });

  function capturedOutput(): string {
    return `${stdout.join("")}${logs.join("\n")}`;
  }
});
