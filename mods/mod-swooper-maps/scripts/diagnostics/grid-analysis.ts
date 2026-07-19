import { readFileSync, realpathSync } from "node:fs";
import { isAbsolute, relative, resolve } from "node:path";
import { forEachHexNeighborOddQ } from "@swooper/mapgen-core/lib/grid";
import { assertVizBinaryByteLength, type VizScalarFormat } from "@swooper/mapgen-viz";
import type { PathVizGridLayer, PathVizManifest } from "./serialized-evidence.js";

/** Stable manifest inventory row printed by layer-listing and cross-run diagnostic commands. */
export type LayerInventoryRow = Readonly<{
  layerKey: string;
  dataTypeKey: string;
  variantKey: string | null;
  stepId: string;
  stepIndex: number;
  kind: PathVizManifest["layers"][number]["kind"];
  format: PathVizGridLayer["field"]["format"] | null;
  stats: PathVizGridLayer["field"]["stats"] | null;
  path: string | null;
  dims: Readonly<{ width: number; height: number }> | null;
}>;

/** Typed scalar grid loaded from path-backed Viz evidence. */
export type LoadedGrid<Values extends Uint8Array | Int16Array | Float32Array> = Readonly<{
  values: Values;
  width: number;
  height: number;
}>;

function readBinaryView(runDirectory: string, relativePath: string): Buffer {
  const admittedRunDirectory = realpathSync(runDirectory);
  const candidatePath = resolve(admittedRunDirectory, relativePath);
  assertContainedByRunDirectory(admittedRunDirectory, candidatePath);
  const admittedCandidatePath = realpathSync(candidatePath);
  assertContainedByRunDirectory(admittedRunDirectory, admittedCandidatePath);
  return readFileSync(admittedCandidatePath);
}

function assertContainedByRunDirectory(runDirectory: string, candidatePath: string): void {
  const pathFromRun = relative(runDirectory, candidatePath);
  if (
    pathFromRun === "" ||
    pathFromRun === ".." ||
    pathFromRun.startsWith(`..${process.platform === "win32" ? "\\" : "/"}`) ||
    isAbsolute(pathFromRun)
  ) {
    throw new TypeError(`Visualization binary path escapes its admitted run directory.`);
  }
}

function requireGridLayer(layer: PathVizManifest["layers"][number]): PathVizGridLayer {
  if (layer.kind !== "grid") {
    throw new Error(`Layer "${layer.dataTypeKey}" is ${layer.kind}, not a scalar grid.`);
  }
  return layer;
}

function readGridBinary(
  runDirectory: string,
  layer: PathVizManifest["layers"][number],
  format: VizScalarFormat
): Readonly<{ grid: PathVizGridLayer; buffer: ArrayBuffer }> {
  const grid = requireGridLayer(layer);
  if (grid.field.format !== format) {
    throw new TypeError(
      `Layer "${grid.layerKey}" uses ${grid.field.format} values, not requested ${format} values.`
    );
  }
  const bytes = readBinaryView(runDirectory, grid.field.data.path);
  assertVizBinaryByteLength(
    bytes.byteLength,
    {
      kind: "grid-values",
      format,
      width: grid.dims.width,
      height: grid.dims.height,
    },
    `Grid layer "${grid.layerKey}"`
  );
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return { grid, buffer: copy.buffer };
}

/**
 * Selects the last emitted scalar grid for one semantic data type.
 * The manifest step index, not filesystem ordering, determines which projection is current.
 */
export function pickLatestGridLayer(
  manifest: PathVizManifest,
  dataTypeKey: string
): PathVizGridLayer {
  const matches = manifest.layers.filter(
    (layer): layer is PathVizGridLayer => layer.kind === "grid" && layer.dataTypeKey === dataTypeKey
  );
  const latest = matches.slice().sort((left, right) => right.stepIndex - left.stepIndex)[0];
  if (!latest) throw new Error(`Missing grid layer for dataTypeKey="${dataTypeKey}".`);
  return latest;
}

/**
 * Projects manifest layers into deterministic inventory rows without reading binary payloads.
 * Filters narrow by an exact semantic data type or by a monotonic data-type prefix.
 */
export function listLayers(
  manifest: PathVizManifest,
  filter?: Readonly<{ prefix?: string; dataTypeKey?: string }>
): LayerInventoryRow[] {
  const prefix = filter?.prefix;
  const exact = filter?.dataTypeKey;
  return manifest.layers
    .filter((layer) => {
      if (exact && layer.dataTypeKey !== exact) return false;
      if (prefix && !layer.dataTypeKey.startsWith(prefix)) return false;
      return true;
    })
    .map((layer): LayerInventoryRow => {
      const grid = layer.kind === "grid" ? layer : undefined;
      const dims = layer.kind === "grid" || layer.kind === "gridFields" ? layer.dims : undefined;
      return {
        layerKey: layer.layerKey,
        dataTypeKey: layer.dataTypeKey,
        variantKey: layer.variantKey ?? null,
        stepId: layer.stepId,
        stepIndex: layer.stepIndex,
        kind: layer.kind,
        format: grid?.field.format ?? null,
        stats: grid?.field.stats ?? null,
        path: grid?.field.data.path ?? null,
        dims: dims ?? null,
      };
    })
    .sort((left, right) => left.stepIndex - right.stepIndex);
}

/**
 * Reads an unsigned-byte scalar grid from its manifest-owned binary path.
 * Non-grid entries are refused before their dimensions or payload reference can be consumed.
 */
export function readU8Grid(
  runDirectory: string,
  layer: PathVizManifest["layers"][number]
): LoadedGrid<Uint8Array> {
  const { grid, buffer } = readGridBinary(runDirectory, layer, "u8");
  return {
    values: new Uint8Array(buffer),
    width: grid.dims.width,
    height: grid.dims.height,
  };
}

/**
 * Reads a signed 16-bit scalar grid from its manifest-owned binary path.
 * The returned dimensions remain those admitted by the serialized manifest.
 */
export function readI16Grid(
  runDirectory: string,
  layer: PathVizManifest["layers"][number]
): LoadedGrid<Int16Array> {
  const { grid, buffer } = readGridBinary(runDirectory, layer, "i16");
  return {
    values: new Int16Array(buffer),
    width: grid.dims.width,
    height: grid.dims.height,
  };
}

/**
 * Reads a 32-bit floating-point scalar grid from its manifest-owned binary path.
 * The returned dimensions remain those admitted by the serialized manifest.
 */
export function readF32Grid(
  runDirectory: string,
  layer: PathVizManifest["layers"][number]
): LoadedGrid<Float32Array> {
  const { grid, buffer } = readGridBinary(runDirectory, layer, "f32");
  return {
    values: new Float32Array(buffer),
    width: grid.dims.width,
    height: grid.dims.height,
  };
}

/**
 * Counts differing cells between equal-length unsigned-byte grids.
 * Length mismatches are refused so a shape error cannot masquerade as ordinary cell drift.
 */
export function hammingU8(left: Uint8Array, right: Uint8Array): number {
  if (left.length !== right.length) {
    throw new Error(`Hamming length mismatch: ${left.length} vs ${right.length}`);
  }
  let differenceCount = 0;
  for (let index = 0; index < left.length; index++) {
    if (left[index] !== right[index]) differenceCount++;
  }
  return differenceCount;
}

/**
 * Summarizes the binary land mask used by dump reports and map-balance diagnostics.
 * Only the canonical value `1` counts as land; every other cell remains water evidence.
 */
export function landmaskStats(values: Uint8Array): Readonly<{
  land: number;
  water: number;
  pctLand: number;
}> {
  let land = 0;
  for (let index = 0; index < values.length; index++) {
    if (values[index] === 1) land++;
  }
  const water = values.length - land;
  return { land, water, pctLand: values.length > 0 ? land / values.length : 0 };
}

/**
 * Measures connected landmasses with the engine's odd-Q hex adjacency.
 * The binary mask must cover the declared grid exactly; wrapping is intentionally not inferred.
 */
export function connectedComponentsLandOddQ(
  values: Uint8Array,
  width: number,
  height: number
): Readonly<{
  landComponents: number;
  largestLandComponent: number;
  largestLandFrac: number;
  totalLand: number;
}> {
  const size = width * height;
  if (values.length !== size) {
    throw new Error(`Connected-component size mismatch: values=${values.length} dims=${size}`);
  }

  const visited = new Uint8Array(size);
  const componentSizes: number[] = [];
  const queue: number[] = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = y * width + x;
      if (visited[index]) continue;
      if (values[index] !== 1) {
        visited[index] = 1;
        continue;
      }

      visited[index] = 1;
      queue.length = 0;
      queue.push(index);

      let count = 0;
      while (queue.length > 0) {
        const current = queue.pop();
        if (current === undefined) break;
        count++;
        const currentY = Math.floor(current / width);
        const currentX = current - currentY * width;
        forEachHexNeighborOddQ(currentX, currentY, width, height, (neighborX, neighborY) => {
          const neighborIndex = neighborY * width + neighborX;
          if (visited[neighborIndex]) return;
          visited[neighborIndex] = 1;
          if (values[neighborIndex] === 1) queue.push(neighborIndex);
        });
      }
      componentSizes.push(count);
    }
  }

  componentSizes.sort((left, right) => right - left);
  const totalLand = componentSizes.reduce((total, count) => total + count, 0);
  const largestLandComponent = componentSizes[0] ?? 0;
  return {
    landComponents: componentSizes.length,
    largestLandComponent,
    largestLandFrac: totalLand > 0 ? largestLandComponent / totalLand : 0,
    totalLand,
  };
}
