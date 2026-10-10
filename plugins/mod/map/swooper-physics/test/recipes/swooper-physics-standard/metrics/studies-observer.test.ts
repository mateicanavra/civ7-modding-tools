import { describe, expect, it } from "bun:test";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const packageRoot = resolve(import.meta.dir, "../../../..");

function observerFixture(mode: "success" | "observer" | "async" | "capture" | "measure" | "reconcile") {
  // Isolate module mocks from the real generated-product tests in this process.
  const source = `
    import { mock } from "bun:test";
    const mode = ${JSON.stringify(mode)};
    const calls = [], events = [], observations = [];
    const engine = await import("@swooper/mapgen-metrics");
    mock.module("@swooper/mapgen-metrics", () => ({ ...engine,
      evaluateMetricTargets(input, targets) {
        const samples = Array.isArray(input) ? input : [input];
        return targets.map(target => ({ targetId: target.id, status: "pass",
          expectations: [{ id: "captured-marker", status: "pass", observed: samples.map(sample => sample.metrics.marker) }] }));
      }
    }));
    mock.module(${JSON.stringify(resolve(packageRoot, "src/recipes/standard/metrics/capture.ts"))}, () => ({
      captureStandardMapScenario(scenario, options) {
        calls.push({ id: scenario.id, options: options ?? null });
        events.push("capture:" + scenario.id);
        if (mode === "capture") throw new Error("capture refused");
        return Object.freeze({
          execution: Object.freeze({ definitionGenerationDurationMs: 1 }),
          provenance: Object.freeze({ scenarioId: scenario.id }),
          model: Object.freeze({ marker: Float32Array.of(7) }),
          ...(options?.includeMoistureDiagnostics ? { moistureDiagnostics: Object.freeze({ witness: "existing observation" }) } : {})
        });
      }
    }));
    mock.module(${JSON.stringify(resolve(packageRoot, "src/recipes/standard/metrics/sample.ts"))}, () => ({
      measureStandardMapCapture(capture) {
        events.push("measure:" + capture.provenance.scenarioId);
        if (mode === "measure") throw new Error("measurement refused");
        return Object.freeze({ provenance: capture.provenance, metrics: Object.freeze({ marker: capture.model.marker[0] }) });
      }
    }));
    const { evaluateStandardMetricStudies } = await import(${JSON.stringify(resolve(packageRoot, "src/recipes/standard/metrics/studies/evaluate.ts"))});
    const { EARTHLIKE_CLIMATE_STRUCTURE_STUDY: cohort } = await import(${JSON.stringify(resolve(packageRoot, "src/recipes/standard/metrics/studies/benchmarks/earthlike-climate-structure.study.ts"))});
    const first = cohort.scenarios[0], second = cohort.scenarios[1];
    const sample = { kind: "sample", id: "observer/sample", scenario: first, targets: cohort.sampleTargets };
    const studies = [sample, { ...sample, id: "observer/shared" }, { ...cohort, id: "observer/cohort", scenarios: [first, second] }];
    function onCapture(capture) {
      const id = capture.provenance.scenarioId;
      if (events.at(-1) !== "measure:" + id) throw new Error("observer preceded measurement");
      observations.push({ id, diagnostics: capture.moistureDiagnostics !== undefined,
        frozen: Object.isFrozen(capture) && Object.isFrozen(capture.provenance),
        hasContext: Object.hasOwn(capture, "context"), hasAdapter: Object.hasOwn(capture, "adapter") });
      events.push("observe:" + id);
      if (mode === "observer") throw new Error("observer refused");
      if (mode === "async") return Promise.resolve(undefined);
      capture.model.marker[0] = 999;
    }
    let output;
    if (mode === "success") {
      const defaultEvaluation = evaluateStandardMetricStudies(studies);
      const defaultCalls = calls.splice(0);
      events.length = 0;
      const evaluation = evaluateStandardMetricStudies(studies, { includeMoistureDiagnostics: true, onCapture });
      output = { defaultEvaluation, defaultCalls, evaluation, calls, events, observations };
    } else {
      if (mode === "reconcile") studies[1] = { ...studies[1], scenario: { ...first, gameSeed: first.gameSeed + 1 } };
      let error = null, completed = false;
      try {
        evaluateStandardMetricStudies(studies, { includeMoistureDiagnostics: true, onCapture });
        completed = true;
      } catch (failure) { error = failure.message; }
      output = { completed, error, calls, events, observations };
    }
    process.stdout.write(JSON.stringify(output));
  `;
  const result = spawnSync(process.execPath, ["-e", source], {
    cwd: packageRoot,
    encoding: "utf8",
    timeout: 30_000,
  });
  expect(result.status, result.stderr).toBe(0);
  return JSON.parse(result.stdout);
}

describe("Standard study capture observer", () => {
  it("observes each reconciled capture once, forwards opt-in diagnostics, and cannot alter stored samples", () => {
    const result = observerFixture("success");
    expect(result.defaultCalls).toHaveLength(2);
    expect(result.defaultCalls.every((call: { options: unknown }) => call.options === null)).toBe(true);
    expect(result.calls).toHaveLength(2);
    expect(result.calls.every((call: { options: unknown }) => JSON.stringify(call.options) === '{"includeMoistureDiagnostics":true}')).toBe(true);
    expect(result.observations).toHaveLength(2);
    expect(result.observations.map((row: { id: string }) => row.id)).toEqual(result.calls.map((row: { id: string }) => row.id));
    expect(result.observations.every((row: { diagnostics: boolean; frozen: boolean; hasContext: boolean; hasAdapter: boolean }) => row.diagnostics && row.frozen && !row.hasContext && !row.hasAdapter)).toBe(true);
    expect(result.evaluation).toEqual(result.defaultEvaluation);
    expect(result.evaluation.scenarioCount).toBe(2);
    expect(result.evaluation.studies.map((study: { kind: string }) => study.kind)).toEqual(["sample", "sample", "cohort"]);
    expect(result.events).toEqual(result.calls.flatMap((row: { id: string }) => ["capture:" + row.id, "measure:" + row.id, "observe:" + row.id]));
  });

  it("fails the entire evaluation on observer refusal or an asynchronous return", () => {
    for (const mode of ["observer", "async"] as const) {
      const result = observerFixture(mode);
      expect(result.completed).toBe(false);
      expect(result.calls).toHaveLength(1);
      expect(result.observations).toHaveLength(1);
      expect(result.error).toContain(mode === "observer" ? "observer refused" : "complete synchronously");
    }
  });

  it("preserves reconciliation, capture, and measurement failure ordering without invoking an observer", () => {
    for (const mode of ["reconcile", "capture", "measure"] as const) {
      const result = observerFixture(mode);
      expect(result.completed).toBe(false);
      expect(result.observations).toEqual([]);
      expect(result.calls).toHaveLength(mode === "reconcile" ? 0 : 1);
      expect(result.error).toContain(mode === "reconcile" ? "conflicting definitions" : mode === "capture" ? "capture refused" : "measurement refused");
    }
  });
});
