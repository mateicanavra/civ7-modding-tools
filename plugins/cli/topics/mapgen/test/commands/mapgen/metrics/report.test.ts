import { Command } from "@oclif/core";
import { describe, expect, test, vi } from "vitest";
import MapgenMetricsReport from "../../../../src/commands/mapgen/metrics/report";

vi.mock("@swooper/swooper-physics/standard/metrics", () => ({
  evaluateStandardMetricStudies: () => ({
    status: "pass",
    scenarioCount: 1,
    studies: [
      {
        kind: "sample",
        studyId: "representative-study",
        status: "pass",
        scenario: {
          scenarioId: "representative-scenario",
          provenance: {},
          status: "pass",
          targets: [{ id: "representative-target", status: "pass" }],
        },
      },
    ],
  }),
  STANDARD_METRIC_STUDIES: [{ id: "representative-study" }],
}));

describe("MapGen metrics report command", () => {
  test("emits the complete Standard study evaluation and human summary", async () => {
    const stdout: string[] = [];
    const stderr: string[] = [];
    const log = vi.spyOn(Command.prototype, "log").mockImplementation((message = "") => {
      stdout.push(message);
    });
    const logToStderr = vi
      .spyOn(Command.prototype, "logToStderr")
      .mockImplementation((message = "") => {
        stderr.push(message);
      });

    try {
      await MapgenMetricsReport.run();
    } finally {
      log.mockRestore();
      logToStderr.mockRestore();
    }

    const evaluation = JSON.parse(stdout.at(-1) ?? "null") as {
      scenarioCount: number;
      status: string;
      studies: unknown[];
    };
    expect(evaluation.status).toBe("pass");
    expect(evaluation.scenarioCount).toBe(1);
    expect(evaluation.studies).toHaveLength(1);
    expect(stderr.at(-1)).toBe("Standard metrics pass: 1 scenarios, 1/1 targets passed.");
  });
});
