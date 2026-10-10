import { Command } from "@oclif/core";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import MapgenMetricsReport from "../../../../src/commands/mapgen/metrics/report";

const { evaluate, selectStudies, coreStudies, allStudies } = vi.hoisted(() => ({
  evaluate: vi.fn(),
  selectStudies: vi.fn(),
  coreStudies: [{ id: "representative-study" }],
  allStudies: [{ id: "representative-study" }, { id: "configuration-stress-study" }],
}));

vi.mock("@swooper/swooper-physics/standard/metrics", () => ({
  evaluateStandardMetricStudies: evaluate,
  selectStandardMetricStudies: selectStudies,
}));

const evaluation = {
  status: "pass",
  scenarioCount: 1,
  studies: [
    {
      kind: "sample",
      studyId: "representative-study",
      status: "pass",
      scenario: {
        scenarioId: "representative-scenario",
        provenance: {
          largeEvidence: "x".repeat(131_072),
          finalSentinel: "report-complete",
        },
        status: "pass",
        targets: [{ id: "representative-target", status: "pass" }],
      },
    },
  ],
};

describe("MapGen metrics report command", () => {
  let stdout: string[];
  let stderr: string[];
  let originalLog: typeof console.log;
  let originalExitCode: typeof process.exitCode;
  let events: string[];

  beforeEach(() => {
    stdout = [];
    stderr = [];
    events = [];
    originalExitCode = process.exitCode;
    vi.spyOn(process.stdout, "write").mockImplementation((chunk, encoding, callback) => {
      stdout.push(String(chunk));
      events.push("write");
      const done = typeof encoding === "function" ? encoding : callback;
      queueMicrotask(() => {
        events.push("flush");
        done?.();
      });
      return false;
    });
    vi.spyOn(Command.prototype, "log").mockImplementation((message = "") => {
      stdout.push(message);
    });
    vi.spyOn(Command.prototype, "logToStderr").mockImplementation((message = "") => {
      stderr.push(message);
      events.push("summary");
    });
    vi.spyOn(console, "log").mockImplementation((...args: unknown[]) => {
      stdout.push(args.join(" "));
    });
    vi.spyOn(console, "error").mockImplementation((...args: unknown[]) => {
      stderr.push(args.join(" "));
    });
    originalLog = console.log;
    selectStudies.mockReset();
    selectStudies.mockImplementation((scope) => scope === "all" ? allStudies : coreStudies);
    evaluate.mockReset();
    evaluate.mockImplementation(() => {
      console.log("metric telemetry", 42);
      return evaluation;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.exitCode = originalExitCode;
  });

  test("isolates evaluator telemetry from the single JSON report and restores console.log", async () => {
    await MapgenMetricsReport.run();

    expect(selectStudies).toHaveBeenCalledExactlyOnceWith("earthlike-core");
    expect(evaluate).toHaveBeenCalledExactlyOnceWith(coreStudies);
    expect(stdout).toEqual([`${JSON.stringify(evaluation)}\n`]);
    expect(Buffer.byteLength(stdout[0]!)).toBeGreaterThan(65_536);
    expect(JSON.parse(stdout[0]!)).toEqual(evaluation);
    expect(events).toEqual(["write", "flush", "summary"]);
    expect(Command.prototype.log).not.toHaveBeenCalled();
    expect(stderr).toEqual([
      "metric telemetry 42",
      "Standard metrics pass: 1 scenarios, 1/1 targets passed.",
    ]);
    expect(console.error).toHaveBeenCalledExactlyOnceWith("metric telemetry", 42);
    expect(console.log).toBe(originalLog);
    console.log("after evaluation");
    expect(stdout.at(-1)).toBe("after evaluation");
  });

  test("requires explicit all scope to evaluate configuration-stress studies", async () => {
    await MapgenMetricsReport.run(["--scope", "all"]);

    expect(selectStudies).toHaveBeenCalledExactlyOnceWith("all");
    expect(evaluate).toHaveBeenCalledExactlyOnceWith(allStudies);
    expect(stdout).toEqual([`${JSON.stringify(evaluation)}\n`]);
  });

  test("accepts an explicit Earthlike core scope without adding stress coverage", async () => {
    await MapgenMetricsReport.run(["--scope", "earthlike-core"]);

    expect(selectStudies).toHaveBeenCalledExactlyOnceWith("earthlike-core");
    expect(evaluate).toHaveBeenCalledExactlyOnceWith(coreStudies);
  });

  test("refuses an unknown scope before selecting studies or generating maps", async () => {
    await expect(MapgenMetricsReport.run(["--scope", "desert-only"]))
      .rejects.toThrow(/Expected --scope=desert-only to be one of/);

    expect(selectStudies).not.toHaveBeenCalled();
    expect(evaluate).not.toHaveBeenCalled();
    expect(stdout).toEqual([]);
  });

  test("restores console.log when the evaluator throws without publishing a partial report", async () => {
    const failure = new Error("evaluation exploded");
    evaluate.mockImplementationOnce(() => {
      console.log("before evaluator failure");
      throw failure;
    });

    await expect(MapgenMetricsReport.run()).rejects.toBe(failure);

    expect(stdout).toEqual([]);
    expect(stderr).toEqual(["before evaluator failure"]);
    expect(console.log).toBe(originalLog);
    console.log("after evaluator failure");
    expect(stdout).toEqual(["after evaluator failure"]);
  });

  test("publishes failed metrics as isolated JSON and stderr before exiting with status one", async () => {
    const failed = structuredClone(evaluation);
    failed.status = "fail";
    const study = failed.studies[0]!;
    study.status = study.scenario.status = study.scenario.targets[0]!.status = "fail";
    evaluate.mockImplementationOnce(() => {
      console.log("failed metric telemetry");
      return failed;
    });
    const failureExit = new Error("metrics exit");
    const exit = vi.spyOn(Command.prototype, "exit").mockImplementation(() => {
      expect(console.log).toBe(originalLog);
      expect(stdout).toEqual([`${JSON.stringify(failed)}\n`]);
      expect(events).toEqual(["write", "flush", "summary"]);
      expect(stderr).toEqual([
        "failed metric telemetry",
        "Standard metrics fail: 1 scenarios, 0/1 targets passed.",
      ]);
      throw failureExit;
    });

    await expect(MapgenMetricsReport.run()).rejects.toBe(failureExit);

    expect(exit).toHaveBeenCalledExactlyOnceWith(1);
    expect(Buffer.byteLength(stdout[0]!)).toBeGreaterThan(65_536);
    expect(JSON.parse(stdout[0]!)).toEqual(failed);
    expect(console.log).toBe(originalLog);
  });

  test("preserves broken-pipe semantics when the stdout reader closes", async () => {
    const error = Object.assign(new Error("reader closed"), { code: "EPIPE" });
    vi.spyOn(process.stdout, "write").mockImplementationOnce((_chunk, encoding, callback) => {
      const done = typeof encoding === "function" ? encoding : callback;
      queueMicrotask(() => done?.(error));
      return false;
    });

    await expect(MapgenMetricsReport.run()).resolves.toBeUndefined();

    expect(stderr.at(-1)).toBe("Standard metrics pass: 1 scenarios, 1/1 targets passed.");
    expect(console.log).toBe(originalLog);
  });

  test("propagates other stdout write failures instead of reporting metrics success", async () => {
    const error = Object.assign(new Error("stdout write failed"), { code: "EIO" });
    vi.spyOn(process.stdout, "write").mockImplementationOnce((_chunk, encoding, callback) => {
      const done = typeof encoding === "function" ? encoding : callback;
      queueMicrotask(() => done?.(error));
      return false;
    });

    await expect(MapgenMetricsReport.run()).rejects.toBe(error);

    expect(stderr).toEqual(["metric telemetry 42"]);
    expect(console.log).toBe(originalLog);
  });
});
