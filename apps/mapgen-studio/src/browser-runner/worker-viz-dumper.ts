import type { VizDumper } from "@swooper/mapgen-core";

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

export function createWorkerVizDumper(): VizDumper {
  const outputRoot = "browser://viz";

  const dumpGrid: VizDumper["dumpGrid"] = (trace, layer) => {
    if (!trace.isVerbose) return;
    trace.event(() => ({
      type: "layer.stream",
      kind: "grid",
      layerId: layer.layerId,
      fileKey: layer.fileKey,
      format: layer.format,
      dims: layer.dims,
      bounds: [0, 0, layer.dims.width, layer.dims.height],
      values: layer.values,
      meta: layer.meta,
    }));
  };

  const dumpPoints: VizDumper["dumpPoints"] = (trace, layer) => {
    if (!trace.isVerbose) return;
    const bounds = boundsFromPositions(layer.positions);
    trace.event(() => ({
      type: "layer.stream",
      kind: "points",
      layerId: layer.layerId,
      fileKey: layer.fileKey,
      bounds,
      positions: layer.positions,
      values: layer.values,
      valueFormat: layer.valueFormat,
      meta: layer.meta,
    }));
  };

  const dumpSegments: VizDumper["dumpSegments"] = (trace, layer) => {
    if (!trace.isVerbose) return;
    const bounds = boundsFromSegments(layer.segments);
    trace.event(() => ({
      type: "layer.stream",
      kind: "segments",
      layerId: layer.layerId,
      fileKey: layer.fileKey,
      bounds,
      segments: layer.segments,
      values: layer.values,
      valueFormat: layer.valueFormat,
      meta: layer.meta,
    }));
  };

  return { outputRoot, dumpGrid, dumpPoints, dumpSegments };
}
