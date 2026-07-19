import { describe, expect, it, spyOn } from "bun:test";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createTraceSession } from "@swooper/mapgen-core";
import { admitPathVizManifest, createVizLayerKey, type PathVizManifest } from "@swooper/mapgen-viz";
import { createDiagnosticDumpAdapters } from "../src/index.js";

function readManifest(outputRoot: string, runId: string): PathVizManifest {
  return admitPathVizManifest(
    JSON.parse(readFileSync(join(outputRoot, runId, "manifest.json"), "utf8")) as unknown
  );
}

describe("diagnostic dump adapters", () => {
  it("silently refuses trace run identities outside the admitted output root", () => {
    const workspaceRoot = mkdtempSync(join(tmpdir(), "swooper-viz-trace-containment-"));
    const outputRoot = join(workspaceRoot, "output");
    try {
      const outputs = createDiagnosticDumpAdapters({ outputRoot });
      const escapedTargets = [
        { runId: "../trace-parent", path: join(workspaceRoot, "trace-parent") },
        {
          runId: join(workspaceRoot, "trace-absolute"),
          path: join(workspaceRoot, "trace-absolute"),
        },
      ];

      for (const escaped of escapedTargets) {
        const session = createTraceSession({
          runId: escaped.runId,
          planFingerprint: "trace-containment-plan",
          config: {},
          sink: outputs.traceSink,
        });
        expect(() => session.emitRunStart()).not.toThrow();
        expect(existsSync(escaped.path)).toBeFalse();
      }
      expect(existsSync(outputRoot)).toBeFalse();
    } finally {
      rmSync(workspaceRoot, { recursive: true, force: true });
    }
  });

  it("refuses facet run identities outside the admitted output root before writes", () => {
    const workspaceRoot = mkdtempSync(join(tmpdir(), "swooper-viz-facet-containment-"));
    const outputRoot = join(workspaceRoot, "output");
    try {
      const outputs = createDiagnosticDumpAdapters({ outputRoot });
      const projection = {
        kind: "grid" as const,
        dataTypeKey: "test.containment",
        spaceId: "tile.hexOddQ" as const,
        dims: { width: 1, height: 1 },
        field: { format: "u8" as const, values: new Uint8Array([1]) },
      };
      const escapedTargets = [
        { runId: "../facet-parent", path: join(workspaceRoot, "facet-parent") },
        {
          runId: join(workspaceRoot, "facet-absolute"),
          path: join(workspaceRoot, "facet-absolute"),
        },
      ];

      for (const escaped of escapedTargets) {
        expect(() =>
          outputs.facetSinks.viz?.([projection], {
            runId: escaped.runId,
            planFingerprint: "facet-containment-plan",
            stepId: "test.containment",
            stageId: "foundation",
            stepIndex: 0,
          })
        ).toThrow("must identify one direct child");
        expect(existsSync(escaped.path)).toBeFalse();
      }
      expect(existsSync(outputRoot)).toBeFalse();
    } finally {
      rmSync(workspaceRoot, { recursive: true, force: true });
    }
  });

  it("silently refuses a trace symlink without mutating its outside target", () => {
    const workspaceRoot = mkdtempSync(join(tmpdir(), "swooper-viz-trace-symlink-"));
    const outputRoot = join(workspaceRoot, "output");
    const runId = "trace-symlink-run";
    const runDirectory = join(outputRoot, runId);
    const outsideTrace = join(workspaceRoot, "outside-trace.jsonl");
    try {
      mkdirSync(join(runDirectory, "data"), { recursive: true });
      writeFileSync(outsideTrace, "outside evidence\n");
      symlinkSync(outsideTrace, join(runDirectory, "trace.jsonl"));
      const outputs = createDiagnosticDumpAdapters({ outputRoot });

      expect(() =>
        outputs.traceSink.emit({
          tsMs: 1,
          runId,
          planFingerprint: "trace-symlink-plan",
          kind: "run.start",
        })
      ).not.toThrow();

      expect(readFileSync(outsideTrace, "utf8")).toBe("outside evidence\n");
      expect(existsSync(join(runDirectory, "manifest.json"))).toBeFalse();
    } finally {
      rmSync(workspaceRoot, { recursive: true, force: true });
    }
  });

  it("refuses pre-existing run and data symlinks before facet evidence can escape", () => {
    const projection = {
      kind: "grid" as const,
      dataTypeKey: "test.symlink-containment",
      spaceId: "tile.hexOddQ" as const,
      dims: { width: 1, height: 1 },
      field: { format: "u8" as const, values: new Uint8Array([1]) },
    };

    for (const destination of ["run", "data"] as const) {
      const workspaceRoot = mkdtempSync(join(tmpdir(), `swooper-viz-${destination}-symlink-`));
      const outputRoot = join(workspaceRoot, "output");
      const outsideDirectory = join(workspaceRoot, "outside");
      const runId = `${destination}-symlink-run`;
      try {
        mkdirSync(outputRoot);
        mkdirSync(outsideDirectory);
        writeFileSync(join(outsideDirectory, "sentinel.txt"), "outside evidence\n");
        if (destination === "run") {
          symlinkSync(outsideDirectory, join(outputRoot, runId));
        } else {
          mkdirSync(join(outputRoot, runId));
          symlinkSync(outsideDirectory, join(outputRoot, runId, "data"));
        }
        const outputs = createDiagnosticDumpAdapters({ outputRoot });

        expect(() =>
          outputs.facetSinks.viz?.([projection], {
            runId,
            planFingerprint: `${destination}-symlink-plan`,
            stepId: "test.symlink-containment",
            stageId: "foundation",
            stepIndex: 0,
          })
        ).toThrow(`Diagnostic ${destination} directory must not be a symbolic link`);

        expect(readdirSync(outsideDirectory)).toEqual(["sentinel.txt"]);
        expect(readFileSync(join(outsideDirectory, "sentinel.txt"), "utf8")).toBe(
          "outside evidence\n"
        );
      } finally {
        rmSync(workspaceRoot, { recursive: true, force: true });
      }
    }
  });

  it("materializes execution-owned projections into the shared trace manifest", () => {
    const outputRoot = mkdtempSync(join(tmpdir(), "swooper-viz-facet-"));
    try {
      const outputs = createDiagnosticDumpAdapters({ outputRoot });
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

  it("lets the executor admit the exact index after earlier trace-off steps", () => {
    const outputRoot = mkdtempSync(join(tmpdir(), "swooper-viz-executor-index-"));
    try {
      const runId = "executor-index-run";
      const outputs = createDiagnosticDumpAdapters({ outputRoot });
      const session = createTraceSession({
        runId,
        planFingerprint: "executor-index-plan",
        config: {
          steps: {
            "test.untraced-step": "off",
            "test.traced-step": "verbose",
          },
        },
        sink: outputs.traceSink,
      });

      session.emitStepStart({ stepId: "test.untraced-step", stageId: "foundation" });
      session.emitStepStart({ stepId: "test.traced-step", stageId: "morphology" });
      expect(readManifest(outputRoot, runId).steps).toEqual([]);

      outputs.facetSinks.viz?.(
        [
          {
            kind: "grid",
            dataTypeKey: "test.executor-index",
            spaceId: "tile.hexOddQ",
            dims: { width: 1, height: 1 },
            field: { format: "u8", values: new Uint8Array([1]) },
          },
        ],
        {
          runId,
          planFingerprint: "executor-index-plan",
          stepId: "test.traced-step",
          stageId: "morphology",
          stepIndex: 1,
        }
      );

      const manifest = readManifest(outputRoot, runId);
      expect(manifest.steps).toEqual([
        { stepId: "test.traced-step", stageId: "morphology", stepIndex: 1 },
      ]);
      expect(manifest.layers).toHaveLength(1);
      expect(manifest.layers[0]).toMatchObject({
        stepId: "test.traced-step",
        stageId: "morphology",
        stepIndex: 1,
      });
    } finally {
      rmSync(outputRoot, { recursive: true, force: true });
    }
  });

  it("rejects facet stage and plan identities that contradict trace evidence", () => {
    const outputRoot = mkdtempSync(join(tmpdir(), "swooper-viz-index-"));
    try {
      const runId = "partial-trace-run";
      const stepId = "test.late-faceted-step";
      const outputs = createDiagnosticDumpAdapters({ outputRoot });
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
          stageId: "other-stage",
          stepIndex: 0,
        })
      ).toThrow("Contradictory visualization step stage");
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
      expect(manifest.steps).toEqual([]);
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
      const outputs = createDiagnosticDumpAdapters({ outputRoot });
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
      expect(readManifest(outputRoot, runId).steps).toEqual([]);
    } finally {
      rmSync(outputRoot, { recursive: true, force: true });
    }
  });

  it("reports facet failures once without exposing private error details", () => {
    const outputRoot = mkdtempSync(join(tmpdir(), "swooper-viz-failure-"));
    const diagnostics = spyOn(console, "error").mockImplementation(() => {});
    try {
      const outputs = createDiagnosticDumpAdapters({ outputRoot });
      const context = {
        runId: "failure-run",
        planFingerprint: "failure-plan",
        stepId: "test.failure",
        stageId: "foundation",
        stepIndex: 0,
      } as const;

      outputs.facetSinks.onError?.({
        facet: "viz",
        operation: "project",
        context,
        error: new Error("private projector detail"),
      });
      outputs.facetSinks.onError?.({
        facet: "viz",
        operation: "emit",
        context,
        error: new Error("private sink detail"),
      });

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
      const outputs = createDiagnosticDumpAdapters({ outputRoot });
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
      const outputs = createDiagnosticDumpAdapters({ outputRoot });
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
      const outputs = createDiagnosticDumpAdapters({ outputRoot });
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
