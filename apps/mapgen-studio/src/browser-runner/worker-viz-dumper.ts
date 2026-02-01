import type { VizDumper } from "@swooper/mapgen-core";
import { computeVizScalarStats, createVizLayerKey } from "@swooper/mapgen-viz";
import type { VizGridFieldsLayerEmissionV1, VizLayerEmissionV1, VizScalarField } from "@swooper/mapgen-viz";

type Bounds = [minX: number, minY: number, maxX: number, maxY: number];

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
  return boundsFromPositions(segments);
}

function cloneArrayBuffer(view: ArrayBufferView): ArrayBuffer {
  const u8 = new Uint8Array(view.byteLength);
  u8.set(new Uint8Array(view.buffer, view.byteOffset, view.byteLength));
  return u8.buffer;
}

function inlineField(args: {
  format: VizScalarField["format"];
  values: ArrayBufferView;
  stats?: VizScalarField["stats"];
  valueSpec?: VizScalarField["valueSpec"];
}): VizScalarField {
  return {
    format: args.format,
    stats: args.stats ?? computeVizScalarStats({ format: args.format, values: args.values }) ?? undefined,
    valueSpec: args.valueSpec,
    data: { kind: "inline", buffer: cloneArrayBuffer(args.values) },
  };
}

function addVectorMagnitudeField(layer: VizGridFieldsLayerEmissionV1): VizGridFieldsLayerEmissionV1 {
  const vector = layer.vector;
  if (!vector?.magnitude) return layer;
  if (layer.fields[vector.magnitude]) return layer;
  const u = layer.fields[vector.u];
  const v = layer.fields[vector.v];
  if (!u || !v) return layer;
  if (u.format !== "f32" || v.format !== "f32") return layer;
  if (u.data.kind !== "inline" || v.data.kind !== "inline") return layer;

  const uArr = new Float32Array(u.data.buffer);
  const vArr = new Float32Array(v.data.buffer);
  const n = Math.min(uArr.length, vArr.length);
  const magArr = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const ux = uArr[i] ?? 0;
    const vy = vArr[i] ?? 0;
    magArr[i] = Math.hypot(ux, vy);
  }
  const magField = inlineField({ format: "f32", values: magArr });
  return { ...layer, fields: { ...layer.fields, [vector.magnitude]: magField } };
}

export function createWorkerVizDumper(): VizDumper {
  const outputRoot = "browser://viz";

  const dumpGrid: VizDumper["dumpGrid"] = (trace, layer) => {
    if (!trace.isVerbose) return;
    trace.event((): { type: "viz.layer.emit.v1"; layer: VizLayerEmissionV1 } => ({
      type: "viz.layer.emit.v1",
      layer: {
        kind: "grid",
        layerKey: createVizLayerKey({ stepId: trace.stepId, dataTypeKey: layer.dataTypeKey, kind: "grid", variantKey: layer.variantKey }),
        dataTypeKey: layer.dataTypeKey,
        variantKey: layer.variantKey,
        stepId: trace.stepId,
        phase: trace.phase,
        spaceId: layer.spaceId,
        bounds: [0, 0, layer.dims.width, layer.dims.height],
        meta: layer.meta,
        dims: layer.dims,
        field: inlineField({ format: layer.format, values: layer.values, stats: layer.stats, valueSpec: layer.valueSpec }),
      },
    }));
  };

  const dumpPoints: VizDumper["dumpPoints"] = (trace, layer) => {
    if (!trace.isVerbose) return;
    const bounds = boundsFromPositions(layer.positions);
    trace.event((): { type: "viz.layer.emit.v1"; layer: VizLayerEmissionV1 } => ({
      type: "viz.layer.emit.v1",
      layer: {
        kind: "points",
        layerKey: createVizLayerKey({ stepId: trace.stepId, dataTypeKey: layer.dataTypeKey, kind: "points", variantKey: layer.variantKey }),
        dataTypeKey: layer.dataTypeKey,
        variantKey: layer.variantKey,
        stepId: trace.stepId,
        phase: trace.phase,
        spaceId: layer.spaceId,
        bounds,
        meta: layer.meta,
        count: (layer.positions.length / 2) | 0,
        positions: { kind: "inline", buffer: cloneArrayBuffer(layer.positions) },
        values: layer.values && layer.valueFormat ? inlineField({ format: layer.valueFormat, values: layer.values, stats: layer.valueStats, valueSpec: layer.valueSpec }) : undefined,
      },
    }));
  };

  const dumpSegments: VizDumper["dumpSegments"] = (trace, layer) => {
    if (!trace.isVerbose) return;
    const bounds = boundsFromSegments(layer.segments);
    trace.event((): { type: "viz.layer.emit.v1"; layer: VizLayerEmissionV1 } => ({
      type: "viz.layer.emit.v1",
      layer: {
        kind: "segments",
        layerKey: createVizLayerKey({ stepId: trace.stepId, dataTypeKey: layer.dataTypeKey, kind: "segments", variantKey: layer.variantKey }),
        dataTypeKey: layer.dataTypeKey,
        variantKey: layer.variantKey,
        stepId: trace.stepId,
        phase: trace.phase,
        spaceId: layer.spaceId,
        bounds,
        meta: layer.meta,
        count: (layer.segments.length / 4) | 0,
        segments: { kind: "inline", buffer: cloneArrayBuffer(layer.segments) },
        values: layer.values && layer.valueFormat ? inlineField({ format: layer.valueFormat, values: layer.values, stats: layer.valueStats, valueSpec: layer.valueSpec }) : undefined,
      },
    }));
  };

  const dumpGridFields: VizDumper["dumpGridFields"] = (trace, layer) => {
    if (!trace.isVerbose) return;

    const fields: Record<string, VizScalarField> = {};
    for (const [key, field] of Object.entries(layer.fields)) {
      fields[key] = inlineField({ format: field.format, values: field.values, stats: field.stats, valueSpec: field.valueSpec });
    }

    const emitted: VizGridFieldsLayerEmissionV1 = {
      kind: "gridFields",
      layerKey: createVizLayerKey({ stepId: trace.stepId, dataTypeKey: layer.dataTypeKey, kind: "gridFields", variantKey: layer.variantKey }),
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

    trace.event((): { type: "viz.layer.emit.v1"; layer: VizLayerEmissionV1 } => ({
      type: "viz.layer.emit.v1",
      layer: addVectorMagnitudeField(emitted),
    }));
  };

  return { outputRoot, dumpGrid, dumpPoints, dumpSegments, dumpGridFields };
}
