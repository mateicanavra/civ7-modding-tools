import { describe, expect, it, spyOn } from "bun:test";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createMockAdapter } from "@civ7/adapter";
import { admitMapSetup, createMapContext, createTraceSession } from "@swooper/mapgen-core";
import { createRecipe, createStage, createStep, defineStep } from "@swooper/mapgen-core/authoring";
import { admitPathVizManifest, createVizLayerKey, type PathVizManifest } from "@swooper/mapgen-viz";
import { Type } from "typebox";
import { createVizDumpAdapters } from "../../scripts/diagnostics/dump.js";

function readManifest(outputRoot: string, runId: string): PathVizManifest {
  return admitPathVizManifest(
    JSON.parse(readFileSync(join(outputRoot, runId, "manifest.json"), "utf8")) as unknown
  );
}

describe("filesystem visualization adapters", () => {
  it("materializes execution-owned projections into the shared trace manifest", () => {
    const outputRoot = mkdtempSync(join(tmpdir(), "swooper-viz-facet-"));
    try {
      const outputs = createVizDumpAdapters({ outputRoot });
      const session = createTraceSession({
        runId: "facet-run",
        planFingerprint: "facet-plan",
        config: { steps: { "test.facet-step": "verbose" } },
        sink: outputs.traceSink,
      });
      session.emitStepStart({ stepId: "test.facet-step", stageId: "foundation" });
      const backing = new Uint8Array([90, 4, 7, 91]);
      outputs.facetSinks.viz?.(
        [
          {
            kind: "grid",
            dataTypeKey: "test.facet*grid",
            spaceId: "tile.hexOddQ",
            dims: { width: 2, height: 1 },
            field: {
              format: "u8",
              values: new Uint8Array(backing.buffer, 1, 2),
            },
          },
        ],
        {
          runId: "facet-run",
          planFingerprint: "facet-plan",
          stepId: "test.facet-step",
          stageId: "foundation",
          stepIndex: 0,
        }
      );

      const manifest = readManifest(outputRoot, "facet-run");
      expect(manifest.steps).toEqual([
        { stepId: "test.facet-step", stageId: "foundation", stepIndex: 0 },
      ]);
      expect(manifest.layers).toHaveLength(1);
      const layer = manifest.layers[0];
      if (layer?.kind !== "grid") throw new Error("Expected grid facet evidence.");
      expect(layer).toMatchObject({
        dataTypeKey: "test.facet*grid",
        stepId: "test.facet-step",
        stageId: "foundation",
        stepIndex: 0,
      });
      expect(
        Array.from(readFileSync(join(outputRoot, "facet-run", layer.field.data.path)))
      ).toEqual([4, 7]);
      expect(layer.field.data.path).toContain("%2A");
      expect(Array.from(backing)).toEqual([90, 4, 7, 91]);
    } finally {
      rmSync(outputRoot, { recursive: true, force: true });
    }
  });

  it("rejects facet identity that contradicts an admitted trace tuple", () => {
    const outputRoot = mkdtempSync(join(tmpdir(), "swooper-viz-index-"));
    try {
      const runId = "partial-trace-run";
      const stepId = "test.late-faceted-step";
      const outputs = createVizDumpAdapters({ outputRoot });
      const session = createTraceSession({
        runId,
        planFingerprint: "partial-trace-plan",
        config: { steps: { [stepId]: "verbose" } },
        sink: outputs.traceSink,
      });
      session.emitStepStart({ stepId, stageId: "foundation" });
      const projections = [
        {
          kind: "grid" as const,
          dataTypeKey: "test.core-facet",
          spaceId: "tile.hexOddQ" as const,
          dims: { width: 1, height: 1 },
          field: { format: "u8" as const, values: new Uint8Array([2]) },
        },
      ];
      expect(() =>
        outputs.facetSinks.viz?.(projections, {
          runId,
          planFingerprint: "partial-trace-plan",
          stepId,
          stageId: "foundation",
          stepIndex: 7,
        })
      ).toThrow("Contradictory visualization step identity");
      expect(() =>
        outputs.facetSinks.viz?.(projections, {
          runId,
          planFingerprint: "partial-trace-plan",
          stepId,
          stageId: "other-stage",
          stepIndex: 0,
        })
      ).toThrow("Contradictory visualization step identity");
      expect(() =>
        outputs.facetSinks.viz?.(projections, {
          runId,
          planFingerprint: "different-plan",
          stepId,
          stageId: "foundation",
          stepIndex: 0,
        })
      ).toThrow("Contradictory visualization run identity");

      const manifest = readManifest(outputRoot, runId);
      expect(manifest.steps).toEqual([{ stepId, stageId: "foundation", stepIndex: 0 }]);
      expect(manifest.layers).toHaveLength(0);
    } finally {
      rmSync(outputRoot, { recursive: true, force: true });
    }
  });

  it("leaves trace and manifest evidence unchanged when run or step identity is contradictory", () => {
    const outputRoot = mkdtempSync(join(tmpdir(), "swooper-viz-trace-identity-"));
    try {
      const runId = "identity-run";
      const planFingerprint = "identity-plan";
      const runDir = join(outputRoot, runId);
      const outputs = createVizDumpAdapters({ outputRoot });
      outputs.traceSink.emit({
        tsMs: 1,
        runId,
        planFingerprint,
        kind: "step.start",
        stepId: "test.step",
        stageId: "foundation",
      });
      const tracePath = join(runDir, "trace.jsonl");
      const manifestPath = join(runDir, "manifest.json");
      const admittedTrace = readFileSync(tracePath, "utf8");
      const admittedManifest = readFileSync(manifestPath, "utf8");

      outputs.traceSink.emit({
        tsMs: 2,
        runId,
        planFingerprint: "different-plan",
        kind: "run.finish",
        success: false,
      });
      outputs.traceSink.emit({
        tsMs: 3,
        runId,
        planFingerprint,
        kind: "step.finish",
        stepId: "test.step",
        stageId: "morphology",
        success: false,
      });

      expect(readFileSync(tracePath, "utf8")).toBe(admittedTrace);
      expect(readFileSync(manifestPath, "utf8")).toBe(admittedManifest);
      expect(readManifest(outputRoot, runId).steps).toEqual([
        { stepId: "test.step", stageId: "foundation", stepIndex: 0 },
      ]);
    } finally {
      rmSync(outputRoot, { recursive: true, force: true });
    }
  });

  it("contains projector and sink failures while reporting each once at the filesystem edge", () => {
    const outputRoot = mkdtempSync(join(tmpdir(), "swooper-viz-failure-"));
    const diagnostics = spyOn(console, "error").mockImplementation(() => {});
    const executions: string[] = [];
    try {
      const EmptySchema = Type.Object({}, { additionalProperties: false });
      const projectorContract = defineStep({
        id: "projector-failure",
        requires: [],
        provides: [],
        schema: EmptySchema,
      });
      const sinkContract = defineStep({
        id: "sink-failure",
        requires: [],
        provides: [],
        schema: EmptySchema,
      });
      const projectorStep = createStep(projectorContract, {
        run: () => {
          executions.push("projector-step-completed");
          return undefined;
        },
        viz: () => {
          throw new Error("private projector detail");
        },
      });
      const sinkStep = createStep(sinkContract, {
        run: () => {
          executions.push("sink-step-completed");
          return undefined;
        },
        viz: () => [
          {
            kind: "grid",
            dataTypeKey: "test.invalid-cardinality",
            spaceId: "tile.hexOddQ",
            dims: { width: 2, height: 2 },
            field: { format: "u8", values: new Uint8Array([1]) },
          },
        ],
      });
      const stage = createStage({
        id: "foundation",
        knobsSchema: EmptySchema,
        steps: [projectorStep, sinkStep],
      });
      const recipe = createRecipe({
        id: "facet-failures",
        namespace: "test",
        tagDefinitions: [],
        stages: [stage],
        compileOpsById: {},
      });
      const setup = admitMapSetup({
        mapSeed: 1,
        dimensions: { width: 2, height: 2 },
        latitudeBounds: { topLatitude: 90, bottomLatitude: -90 },
      });
      const context = createMapContext({
        setup,
        adapter: createMockAdapter({ width: 2, height: 2, mapSizeId: 1 }),
      });
      const outputs = createVizDumpAdapters({ outputRoot });

      recipe.run(
        context,
        {
          foundation: {
            knobs: {},
            "projector-failure": {},
            "sink-failure": {},
          },
        },
        { facets: outputs.facetSinks }
      );

      expect(executions).toEqual(["projector-step-completed", "sink-step-completed"]);
      expect(diagnostics).toHaveBeenCalledTimes(2);
      const messages = diagnostics.mock.calls.map(([message]) => String(message));
      expect(messages).toEqual([
        expect.stringContaining("viz.project failed"),
        expect.stringContaining("viz.emit failed"),
      ]);
      expect(messages.join("\n")).not.toContain("private projector detail");
    } finally {
      diagnostics.mockRestore();
      rmSync(outputRoot, { recursive: true, force: true });
    }
  });

  it("isolates run step indexes, rejects repeated layer identity, and writes exact subview bytes", () => {
    const outputRoot = mkdtempSync(join(tmpdir(), "swooper-viz-"));
    try {
      const outputs = createVizDumpAdapters({ outputRoot });
      const run = (runId: string, first: Uint8Array, second: Uint8Array): void => {
        const session = createTraceSession({
          runId,
          planFingerprint: `${runId}-plan`,
          config: { steps: { "test.step": "verbose" } },
          sink: outputs.traceSink,
        });
        session.emitStepStart({ stepId: "test.step", stageId: "foundation" });
        const publish = (values: Uint8Array): void => {
          outputs.facetSinks.viz?.(
            [
              {
                kind: "grid",
                dataTypeKey: "test.grid",
                spaceId: "tile.hexOddQ",
                dims: { width: 2, height: 1 },
                field: { format: "u8", values },
              },
            ],
            {
              runId,
              planFingerprint: `${runId}-plan`,
              stepId: "test.step",
              stageId: "foundation",
              stepIndex: 0,
            }
          );
        };
        publish(first);
        const beforeDuplicate = readdirSync(join(outputRoot, runId, "data")).sort();
        expect(() => publish(second)).toThrow("duplicate layer key");
        expect(readdirSync(join(outputRoot, runId, "data")).sort()).toEqual(beforeDuplicate);
      };

      const firstBacking = new Uint8Array([90, 1, 2, 91]);
      const secondBacking = new Uint8Array([80, 7, 8, 81]);
      run(
        "run-one",
        new Uint8Array(firstBacking.buffer, 1, 2),
        new Uint8Array(secondBacking.buffer, 1, 2)
      );
      run("run-two", new Uint8Array([3, 4]), new Uint8Array([5, 6]));

      const firstManifest = readManifest(outputRoot, "run-one");
      const secondManifest = readManifest(outputRoot, "run-two");
      expect(firstManifest.steps).toEqual([
        { stepId: "test.step", stageId: "foundation", stepIndex: 0 },
      ]);
      expect(secondManifest.steps).toEqual([
        { stepId: "test.step", stageId: "foundation", stepIndex: 0 },
      ]);
      expect(firstManifest.layers).toHaveLength(1);
      expect(secondManifest.layers).toHaveLength(1);

      const firstLayer = firstManifest.layers[0];
      if (firstLayer?.kind !== "grid") throw new Error("Expected grid manifest layer.");
      expect(
        Array.from(readFileSync(join(outputRoot, "run-one", firstLayer.field.data.path)))
      ).toEqual([1, 2]);
      expect(Array.from(secondBacking)).toEqual([80, 7, 8, 81]);
    } finally {
      rmSync(outputRoot, { recursive: true, force: true });
    }
  });

  it("leaves the data directory unchanged when one batch repeats a layer identity", () => {
    const outputRoot = mkdtempSync(join(tmpdir(), "swooper-viz-duplicate-batch-"));
    try {
      const runId = "duplicate-batch-run";
      const outputs = createVizDumpAdapters({ outputRoot });
      const session = createTraceSession({
        runId,
        planFingerprint: "duplicate-batch-plan",
        config: { steps: { "test.step": "verbose" } },
        sink: outputs.traceSink,
      });
      session.emitStepStart({ stepId: "test.step", stageId: "foundation" });
      const dataDirectory = join(outputRoot, runId, "data");
      const beforeDuplicate = readdirSync(dataDirectory).sort();
      const projection = {
        kind: "grid" as const,
        dataTypeKey: "test.duplicate-batch",
        spaceId: "tile.hexOddQ" as const,
        dims: { width: 1, height: 1 },
        field: { format: "u8" as const, values: new Uint8Array([1]) },
      };

      expect(() =>
        outputs.facetSinks.viz?.([projection, projection], {
          runId,
          planFingerprint: "duplicate-batch-plan",
          stepId: "test.step",
          stageId: "foundation",
          stepIndex: 0,
        })
      ).toThrow("duplicate layer key");

      expect(readdirSync(dataDirectory).sort()).toEqual(beforeDuplicate);
      expect(readManifest(outputRoot, runId).layers).toEqual([]);
    } finally {
      rmSync(outputRoot, { recursive: true, force: true });
    }
  });

  it("preserves last-good evidence when a later multi-slot publication fails", () => {
    const outputRoot = mkdtempSync(join(tmpdir(), "swooper-viz-atomic-"));
    try {
      const runId = "atomic-run";
      const runDir = join(outputRoot, runId);
      const outputs = createVizDumpAdapters({ outputRoot });
      const session = createTraceSession({
        runId,
        planFingerprint: "atomic-plan",
        config: { steps: { "test.step": "verbose" } },
        sink: outputs.traceSink,
      });
      session.emitStepStart({ stepId: "test.step", stageId: "foundation" });
      const dump = (a: number, b: number, dataTypeKey = "test.atomic"): void => {
        outputs.facetSinks.viz?.(
          [
            {
              kind: "gridFields",
              dataTypeKey,
              spaceId: "tile.hexOddQ",
              dims: { width: 1, height: 1 },
              fields: {
                a: { format: "u8", values: new Uint8Array([a]) },
                b: { format: "u8", values: new Uint8Array([b]) },
              },
            },
          ],
          {
            runId,
            planFingerprint: "atomic-plan",
            stepId: "test.step",
            stageId: "foundation",
            stepIndex: 0,
          }
        );
      };

      dump(1, 2);
      const manifestPath = join(runDir, "manifest.json");
      const lastGoodManifest = readFileSync(manifestPath, "utf8");
      const lastGood = readManifest(outputRoot, runId);
      const oldLayer = lastGood.layers[0];
      if (oldLayer?.kind !== "gridFields") {
        throw new Error("Expected the last-good grid-fields layer.");
      }
      const oldAPath = oldLayer.fields.a?.data.path;
      const oldBPath = oldLayer.fields.b?.data.path;
      if (!oldAPath || !oldBPath) throw new Error("Expected both last-good field paths.");

      const layerKey = createVizLayerKey({
        stepId: "test.step",
        dataTypeKey: "test.atomic.second",
        spaceId: "tile.hexOddQ",
        kind: "gridFields",
      });
      const digest = createHash("sha256")
        .update(new Uint8Array([10]))
        .digest("hex");
      const blockedPath = join(
        runDir,
        `data/${encodeURIComponent(layerKey)}__field-b__sha256-${digest}.bin`
      );
      mkdirSync(blockedPath);

      expect(() => dump(9, 10, "test.atomic.second")).toThrow();

      expect(readFileSync(manifestPath, "utf8")).toBe(lastGoodManifest);
      expect(Array.from(readFileSync(join(runDir, oldAPath)))).toEqual([1]);
      expect(Array.from(readFileSync(join(runDir, oldBPath)))).toEqual([2]);
      const newADigest = createHash("sha256")
        .update(new Uint8Array([9]))
        .digest("hex");
      expect(readdirSync(join(runDir, "data"))).toContain(
        `${encodeURIComponent(layerKey)}__field-a__sha256-${newADigest}.bin`
      );
    } finally {
      rmSync(outputRoot, { recursive: true, force: true });
    }
  });
});
