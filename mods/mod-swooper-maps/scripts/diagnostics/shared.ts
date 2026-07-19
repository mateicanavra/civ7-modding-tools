import { readFileSync } from "node:fs";
import { join } from "node:path";
import { forEachHexNeighborOddQ } from "@swooper/mapgen-core/lib/grid";
import type {
  VizGridLayerEntryV1,
  VizManifestV1,
  VizPathRef,
  VizScalarFormat,
  VizScalarStats,
} from "@swooper/mapgen-viz";

type PathManifest = VizManifestV1<VizPathRef>;
type PathGridLayer = VizGridLayerEntryV1<VizPathRef>;

type LayerInventoryRow = Readonly<{
  dataTypeKey: string;
  variantKey: string | null;
  stepId: string;
  stepIndex: number;
  kind: PathManifest["layers"][number]["kind"];
  format: VizScalarFormat | null;
  stats: VizScalarStats | null;
  path: string | null;
  dims: Readonly<{ width: number; height: number }> | null;
}>;

/**
 * Identifies JSON-style records accepted by the diagnostic config merger.
 * Arrays and class instances remain atomic values so command overrides cannot silently reshape them.
 */
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value == null || typeof value !== "object" || Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

/**
 * Applies diagnostic command overrides recursively while replacing non-record values as a unit.
 * This keeps shipped recipe config structure intact without giving arrays implicit merge semantics.
 */
export function mergeDeep(base: unknown, override: unknown): unknown {
  if (override === undefined) return base;
  if (!isPlainObject(base) || !isPlainObject(override)) return override;
  const out: Record<string, unknown> = { ...base };
  for (const [k, v] of Object.entries(override)) {
    const prev = out[k];
    out[k] = mergeDeep(prev, v);
  }
  return out;
}

/**
 * Splits a diagnostic command line into positional operands and `--key [value]` flags.
 * A flag without a following value is preserved as `true`, which distinguishes switches from omission.
 */
export function parseArgs(argv: readonly string[]): {
  positionals: string[];
  flags: Record<string, string | true>;
} {
  const positionals: string[] = [];
  const flags: Record<string, string | true> = {};

  for (let i = 0; i < argv.length; i++) {
    const raw = argv[i] ?? "";
    if (!raw.startsWith("--")) {
      positionals.push(raw);
      continue;
    }
    const key = raw.slice(2);
    const next = argv[i + 1];
    if (next != null && !next.startsWith("--")) {
      flags[key] = next;
      i++;
    } else {
      flags[key] = true;
    }
  }

  return { positionals, flags };
}

function loadJsonFile(path: string): unknown {
  const text = readFileSync(path, "utf8");
  return JSON.parse(text) as unknown;
}

/**
 * Loads the path-backed visualization manifest that indexes one diagnostic map run.
 * Diagnostic readers use its layer paths and step ordering as the run's evidence inventory.
 */
export function loadManifest(runDir: string): PathManifest {
  return loadJsonFile(join(runDir, "manifest.json")) as PathManifest;
}

/**
 * Reads the trace stream for a diagnostic run, discarding malformed or blank JSONL rows.
 * Consumers use the remaining events as best-effort evidence rather than generation authority.
 */
export function loadTraceLines(runDir: string): any[] {
  const text = readFileSync(join(runDir, "trace.jsonl"), "utf8");
  return text
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

/**
 * Selects the last emitted grid for a semantic data type.
 * The manifest step index, not filesystem ordering, determines which projection is current.
 */
export function pickLatestGridLayer(manifest: PathManifest, dataTypeKey: string): PathGridLayer {
  const matches = manifest.layers.filter(
    (layer): layer is PathGridLayer => layer.kind === "grid" && layer.dataTypeKey === dataTypeKey
  );
  if (matches.length === 0) throw new Error(`Missing grid layer for dataTypeKey="${dataTypeKey}".`);
  return matches.slice().sort((a, b) => b.stepIndex - a.stepIndex)[0]!;
}

/**
 * Projects manifest layers into stable, human-readable inventory rows for CLI diagnostics.
 * Optional filters narrow by exact data type or monotonic key prefix without reading payload files.
 */
export function listLayers(
  manifest: PathManifest,
  filter?: { prefix?: string; dataTypeKey?: string }
): LayerInventoryRow[] {
  const prefix = filter?.prefix;
  const exact = filter?.dataTypeKey;
  return manifest.layers
    .filter((l) => {
      if (exact && l.dataTypeKey !== exact) return false;
      if (prefix && !l.dataTypeKey.startsWith(prefix)) return false;
      return true;
    })
    .map((layer): LayerInventoryRow => {
      const grid = layer.kind === "grid" ? layer : undefined;
      const dims = layer.kind === "grid" || layer.kind === "gridFields" ? layer.dims : undefined;
      return {
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
    .sort((a, b) => a.stepIndex - b.stepIndex);
}

function readBinaryView(runDir: string, relPath: string): Buffer {
  const abs = join(runDir, relPath);
  return readFileSync(abs);
}

function requireGridLayer(layer: PathManifest["layers"][number]): PathGridLayer {
  if (layer.kind !== "grid") {
    throw new Error(`Layer "${layer.dataTypeKey}" is ${layer.kind}, not a scalar grid.`);
  }
  return layer;
}

/**
 * Reads an unsigned-byte grid from the layer's manifest-owned binary path.
 * Non-grid entries are refused before accessing the canonical grid dimensions and payload reference.
 */
export function readU8Grid(
  runDir: string,
  layer: PathManifest["layers"][number]
): {
  values: Uint8Array;
  width: number;
  height: number;
} {
  const grid = requireGridLayer(layer);
  const relPath = grid.field.data.path;
  const buf = readBinaryView(runDir, relPath);
  return {
    values: new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength),
    width: grid.dims.width,
    height: grid.dims.height,
  };
}

/**
 * Reads a signed 16-bit grid from the layer's manifest-owned binary path.
 * The returned typed view preserves the manifest dimensions used by cross-run diagnostics.
 */
export function readI16Grid(
  runDir: string,
  layer: PathManifest["layers"][number]
): {
  values: Int16Array;
  width: number;
  height: number;
} {
  const grid = requireGridLayer(layer);
  const relPath = grid.field.data.path;
  const buf = readBinaryView(runDir, relPath);
  const arr = new Int16Array(buf.buffer, buf.byteOffset, Math.floor(buf.byteLength / 2));
  return { values: arr, width: grid.dims.width, height: grid.dims.height };
}

/**
 * Reads a 32-bit floating-point grid from the layer's manifest-owned binary path.
 * The returned typed view preserves the manifest dimensions used by cross-run diagnostics.
 */
export function readF32Grid(
  runDir: string,
  layer: PathManifest["layers"][number]
): {
  values: Float32Array;
  width: number;
  height: number;
} {
  const grid = requireGridLayer(layer);
  const relPath = grid.field.data.path;
  const buf = readBinaryView(runDir, relPath);
  const arr = new Float32Array(buf.buffer, buf.byteOffset, Math.floor(buf.byteLength / 4));
  return { values: arr, width: grid.dims.width, height: grid.dims.height };
}

/**
 * Counts differing cells between equal-length unsigned-byte grids.
 * Length mismatches are refused so a shape error cannot be misreported as ordinary cell drift.
 */
export function hammingU8(a: Uint8Array, b: Uint8Array): number {
  if (a.length !== b.length) throw new Error(`Hamming length mismatch: ${a.length} vs ${b.length}`);
  let diff = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) diff++;
  return diff;
}

/**
 * Summarizes the binary land mask used by dump reports and map-balance diagnostics.
 * Only the canonical value `1` counts as land; every other cell remains water evidence.
 */
export function landmaskStats(values: Uint8Array): {
  land: number;
  water: number;
  pctLand: number;
} {
  let land = 0;
  for (let i = 0; i < values.length; i++) if (values[i] === 1) land++;
  const water = values.length - land;
  return { land, water, pctLand: values.length > 0 ? land / values.length : 0 };
}

/**
 * Measures connected landmasses with the engine's odd-Q hex adjacency.
 * The input must cover the declared grid exactly; wrapping is intentionally not inferred here.
 */
export function connectedComponentsLandOddQ(
  values: Uint8Array,
  width: number,
  height: number
): {
  landComponents: number;
  largestLandComponent: number;
  largestLandFrac: number;
  totalLand: number;
} {
  const size = width * height;
  if (values.length !== size)
    throw new Error(`CC size mismatch: values=${values.length} dims=${size}`);

  const visited = new Uint8Array(size);
  const componentSizes: number[] = [];
  const queue: number[] = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (visited[idx]) continue;
      if (values[idx] !== 1) {
        visited[idx] = 1;
        continue;
      }

      visited[idx] = 1;
      queue.length = 0;
      queue.push(idx);

      let count = 0;
      while (queue.length) {
        const cur = queue.pop()!;
        count++;
        const cy = (cur / width) | 0;
        const cx = cur - cy * width;
        forEachHexNeighborOddQ(cx, cy, width, height, (nx, ny) => {
          const ni = ny * width + nx;
          if (visited[ni]) return;
          visited[ni] = 1;
          if (values[ni] === 1) queue.push(ni);
        });
      }
      componentSizes.push(count);
    }
  }

  componentSizes.sort((a, b) => b - a);
  const totalLand = componentSizes.reduce((a, b) => a + b, 0);
  const largest = componentSizes[0] ?? 0;
  return {
    landComponents: componentSizes.length,
    largestLandComponent: largest,
    largestLandFrac: totalLand > 0 ? largest / totalLand : 0,
    totalLand,
  };
}
