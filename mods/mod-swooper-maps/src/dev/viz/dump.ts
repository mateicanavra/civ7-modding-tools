import type { TraceEvent, TraceSink, TraceScope, VizDumper } from "@swooper/mapgen-core";
import { computeVizScalarStats, createVizLayerKey } from "@swooper/mapgen-viz";
import type {
  Bounds,
  VizBinaryRef,
  VizGridFieldsLayerEmissionV1,
  VizLayerEmissionV1,
  VizLayerEntryV1,
  VizManifestV1,
  VizScalarField,
} from "@swooper/mapgen-viz";
import { mkdirSync, writeFileSync, appendFileSync } from "node:fs";
import { join } from "node:path";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value == null || typeof value !== "object" || Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+)|(-+$)/g, "");
}

function ensureDir(path: string): void {
  mkdirSync(path, { recursive: true });
}

function boundsFromPositions(positions: Float32Array): Bounds {
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (let i = 0; i + 1 < positions.length; i += 2) {
    const x = positions[i]!;
    const y = positions[i + 1]!;
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }

  if (!Number.isFinite(minX) || !Number.isFinite(minY) || !Number.isFinite(maxX) || !Number.isFinite(maxY)) {
    return [0, 0, 1, 1];
  }

  return [minX, minY, maxX, maxY];
}

function boundsFromSegments(segments: Float32Array): Bounds {
  // segments is [x0,y0,x1,y1,...] pairs; treat as positions list
  return boundsFromPositions(segments);
}

function writeBinary(path: string, view: ArrayBufferView): void {
  const buffer = Buffer.from(view.buffer, view.byteOffset, view.byteLength);
  writeFileSync(path, buffer);
}

function resolveRunDir(outputRoot: string, runId: string): string {
  return join(outputRoot, runId);
}

function resolveDataDir(outputRoot: string, runId: string): string {
  return join(resolveRunDir(outputRoot, runId), "data");
}

export function createTraceDumpSink(options: { outputRoot: string }): TraceSink {
  const { outputRoot } = options;

  const stepIndexById = new Map<string, number>();
  let nextStepIndex = 0;

  const manifestByRun = new Map<string, VizManifestV1>();

  const emit = (event: TraceEvent): void => {
    try {
      const runDir = resolveRunDir(outputRoot, event.runId);
      const dataDir = resolveDataDir(outputRoot, event.runId);
      ensureDir(dataDir);

      appendFileSync(join(runDir, "trace.jsonl"), `${JSON.stringify(event)}\n`);

      let manifest = manifestByRun.get(event.runId);
      if (!manifest) {
        manifest = {
          version: 1,
          runId: event.runId,
          planFingerprint: event.planFingerprint,
          steps: [],
          layers: [],
        };
        manifestByRun.set(event.runId, manifest);
      }

      if (event.kind === "step.start" && event.stepId) {
        if (!stepIndexById.has(event.stepId)) {
          const stepIndex = nextStepIndex++;
          stepIndexById.set(event.stepId, stepIndex);
          manifest.steps.push({ stepId: event.stepId, phase: event.phase, stepIndex });
          writeFileSync(join(runDir, "manifest.json"), JSON.stringify(manifest, null, 2));
        }
        return;
      }

      if (event.kind !== "step.event" || !event.stepId) return;
      const data = event.data;
      if (!isPlainObject(data)) return;
      if (data.type !== "viz.layer.dump.v1") return;
      const payload = data as unknown as { type: "viz.layer.dump.v1"; layer: VizLayerEmissionV1 };
      const stepIndex = stepIndexById.get(event.stepId) ?? -1;
      const layer: VizLayerEntryV1 = { ...payload.layer, stepId: event.stepId, phase: event.phase, stepIndex };
      manifest.layers.push(layer);
      writeFileSync(join(runDir, "manifest.json"), JSON.stringify(manifest, null, 2));
    } catch {
      // tracing/diagnostics must never alter execution flow
    }
  };

  return { emit };
}

function pathRef(path: string): VizBinaryRef {
  return { kind: "path", path };
}

function scalarField(args: {
  format: VizScalarField["format"];
  values: ArrayBufferView;
  path: string;
  stats?: VizScalarField["stats"];
  valueSpec?: VizScalarField["valueSpec"];
}): VizScalarField {
  return {
    format: args.format,
    stats:
      args.stats ??
      computeVizScalarStats({ format: args.format, values: args.values, noData: args.valueSpec?.noData }) ??
      undefined,
    valueSpec: args.valueSpec,
    data: pathRef(args.path),
  };
}

export function createVizDumper(options: { outputRoot: string }): VizDumper {
  const { outputRoot } = options;

  const dumpGrid: VizDumper["dumpGrid"] = (trace, layer) => {
    if (!trace.isVerbose) return;
    if (!trace.runId) return;

    try {
      const runDir = resolveRunDir(outputRoot, trace.runId);
      const dataDir = resolveDataDir(outputRoot, trace.runId);
      ensureDir(dataDir);

      const layerKey = createVizLayerKey({
        stepId: trace.stepId,
        dataTypeKey: layer.dataTypeKey,
        spaceId: layer.spaceId,
        kind: "grid",
        role: layer.meta?.role,
        variantKey: layer.variantKey,
      });

      const fileBase = slugify(layerKey);
      const relPath = `data/${fileBase}.bin`;
      writeBinary(join(runDir, relPath), layer.values);

      trace.event((): { type: "viz.layer.dump.v1"; layer: VizLayerEmissionV1 } => ({
        type: "viz.layer.dump.v1",
        layer: {
          kind: "grid",
          layerKey,
          dataTypeKey: layer.dataTypeKey,
          variantKey: layer.variantKey,
          stepId: trace.stepId,
          phase: trace.phase,
          spaceId: layer.spaceId,
          bounds: [0, 0, layer.dims.width, layer.dims.height],
          meta: layer.meta,
          dims: layer.dims,
          field: scalarField({
            format: layer.format,
            values: layer.values,
            path: relPath,
            stats: layer.stats,
            valueSpec: layer.valueSpec,
          }),
        },
      }));
    } catch {
      // diagnostics must not break generation
    }
  };

  const dumpPoints: VizDumper["dumpPoints"] = (trace, layer) => {
    if (!trace.isVerbose) return;
    if (!trace.runId) return;

    try {
      const runDir = resolveRunDir(outputRoot, trace.runId);
      const dataDir = resolveDataDir(outputRoot, trace.runId);
      ensureDir(dataDir);

      const layerKey = createVizLayerKey({
        stepId: trace.stepId,
        dataTypeKey: layer.dataTypeKey,
        spaceId: layer.spaceId,
        kind: "points",
        role: layer.meta?.role,
        variantKey: layer.variantKey,
      });

      const fileBase = slugify(layerKey);
      const posRel = `data/${fileBase}__pos.bin`;
      const valRel = layer.values && layer.valueFormat ? `data/${fileBase}__val.bin` : undefined;

      writeBinary(join(runDir, posRel), layer.positions);
      if (layer.values && valRel) {
        writeBinary(join(runDir, valRel), layer.values);
      }

      const bounds = boundsFromPositions(layer.positions);
      trace.event((): { type: "viz.layer.dump.v1"; layer: VizLayerEmissionV1 } => ({
        type: "viz.layer.dump.v1",
        layer: {
          kind: "points",
          layerKey,
          dataTypeKey: layer.dataTypeKey,
          variantKey: layer.variantKey,
          stepId: trace.stepId,
          phase: trace.phase,
          spaceId: layer.spaceId,
          bounds,
          meta: layer.meta,
          count: (layer.positions.length / 2) | 0,
          positions: pathRef(posRel),
          values:
            layer.values && layer.valueFormat && valRel
              ? scalarField({
                  format: layer.valueFormat,
                  values: layer.values,
                  path: valRel,
                  stats: layer.valueStats,
                  valueSpec: layer.valueSpec,
                })
              : undefined,
        },
      }));
    } catch {
      // diagnostics must not break generation
    }
  };

  const dumpSegments: VizDumper["dumpSegments"] = (trace, layer) => {
    if (!trace.isVerbose) return;
    if (!trace.runId) return;

    try {
      const runDir = resolveRunDir(outputRoot, trace.runId);
      const dataDir = resolveDataDir(outputRoot, trace.runId);
      ensureDir(dataDir);

      const layerKey = createVizLayerKey({
        stepId: trace.stepId,
        dataTypeKey: layer.dataTypeKey,
        spaceId: layer.spaceId,
        kind: "segments",
        role: layer.meta?.role,
        variantKey: layer.variantKey,
      });

      const fileBase = slugify(layerKey);
      const segRel = `data/${fileBase}__seg.bin`;
      const valRel = layer.values && layer.valueFormat ? `data/${fileBase}__val.bin` : undefined;

      writeBinary(join(runDir, segRel), layer.segments);
      if (layer.values && valRel) {
        writeBinary(join(runDir, valRel), layer.values);
      }

      const bounds = boundsFromSegments(layer.segments);
      trace.event((): { type: "viz.layer.dump.v1"; layer: VizLayerEmissionV1 } => ({
        type: "viz.layer.dump.v1",
        layer: {
          kind: "segments",
          layerKey,
          dataTypeKey: layer.dataTypeKey,
          variantKey: layer.variantKey,
          stepId: trace.stepId,
          phase: trace.phase,
          spaceId: layer.spaceId,
          bounds,
          meta: layer.meta,
          count: (layer.segments.length / 4) | 0,
          segments: pathRef(segRel),
          values:
            layer.values && layer.valueFormat && valRel
              ? scalarField({
                  format: layer.valueFormat,
                  values: layer.values,
                  path: valRel,
                  stats: layer.valueStats,
                  valueSpec: layer.valueSpec,
                })
              : undefined,
        },
      }));
    } catch {
      // diagnostics must not break generation
    }
  };

  const dumpGridFields: VizDumper["dumpGridFields"] = (trace, layer) => {
    if (!trace.isVerbose) return;
    if (!trace.runId) return;

    try {
      const runDir = resolveRunDir(outputRoot, trace.runId);
      const dataDir = resolveDataDir(outputRoot, trace.runId);
      ensureDir(dataDir);

      const layerKey = createVizLayerKey({
        stepId: trace.stepId,
        dataTypeKey: layer.dataTypeKey,
        spaceId: layer.spaceId,
        kind: "gridFields",
        role: layer.meta?.role,
        variantKey: layer.variantKey,
      });

      const fileBase = slugify(layerKey);

      const fields: Record<string, VizScalarField> = {};
      for (const [fieldKey, field] of Object.entries(layer.fields)) {
        const relPath = `data/${fileBase}__${slugify(fieldKey)}.bin`;
        writeBinary(join(runDir, relPath), field.values);
        fields[fieldKey] = scalarField({
          format: field.format,
          values: field.values,
          path: relPath,
          stats: field.stats,
          valueSpec: field.valueSpec,
        });
      }

      const emitted: VizGridFieldsLayerEmissionV1 = {
        kind: "gridFields",
        layerKey,
        dataTypeKey: layer.dataTypeKey,
        variantKey: layer.variantKey,
        stepId: trace.stepId,
        phase: trace.phase,
        spaceId: layer.spaceId,
        bounds: [0, 0, layer.dims.width, layer.dims.height],
        meta: layer.meta,
        dims: layer.dims,
        fields,
        vector: layer.vector,
      };

      trace.event((): { type: "viz.layer.dump.v1"; layer: VizLayerEmissionV1 } => ({
        type: "viz.layer.dump.v1",
        layer: emitted,
      }));
    } catch {
      // diagnostics must not break generation
    }
  };

  return { outputRoot, dumpGrid, dumpPoints, dumpSegments, dumpGridFields };
}
