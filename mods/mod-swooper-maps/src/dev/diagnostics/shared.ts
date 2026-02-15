import { readFileSync } from "node:fs";
import { join } from "node:path";
import { forEachHexNeighborOddQ } from "@swooper/mapgen-core/lib/grid";

export type VizManifestV1 = Readonly<{
  version: number;
  runId: string;
  planFingerprint: string;
  steps: ReadonlyArray<Readonly<{ stepId: string; phase: string; stepIndex: number }>>;
  layers: ReadonlyArray<
    Readonly<{
      kind: string;
      layerKey: string;
      dataTypeKey: string;
      variantKey?: string;
      stepId: string;
      phase: string;
      stepIndex: number;
      spaceId: string;
      meta?: unknown;
      dims?: Readonly<{ width: number; height: number }>;
      field?: Readonly<{
        format: string;
        stats?: unknown;
        data: Readonly<{ kind: "path"; path: string }>;
      }>;
    }>
  >;
}>;

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value == null || typeof value !== "object" || Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

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

export function loadJsonFile(path: string): unknown {
  const text = readFileSync(path, "utf8");
  return JSON.parse(text) as unknown;
}

export function loadManifest(runDir: string): VizManifestV1 {
  return loadJsonFile(join(runDir, "manifest.json")) as VizManifestV1;
}

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

export function pickLatestGridLayer(manifest: VizManifestV1, dataTypeKey: string): VizManifestV1["layers"][number] {
  const matches = manifest.layers.filter((l) => l.kind === "grid" && l.dataTypeKey === dataTypeKey);
  if (matches.length === 0) throw new Error(`Missing grid layer for dataTypeKey="${dataTypeKey}".`);
  return matches.slice().sort((a, b) => (b.stepIndex ?? 0) - (a.stepIndex ?? 0))[0]!;
}

export function listLayers(manifest: VizManifestV1, filter?: { prefix?: string; dataTypeKey?: string }): any[] {
  const prefix = filter?.prefix;
  const exact = filter?.dataTypeKey;
  return manifest.layers
    .filter((l) => {
      if (exact && l.dataTypeKey !== exact) return false;
      if (prefix && !l.dataTypeKey.startsWith(prefix)) return false;
      return true;
    })
    .map((l) => ({
      dataTypeKey: l.dataTypeKey,
      variantKey: l.variantKey ?? null,
      stepId: l.stepId,
      stepIndex: l.stepIndex,
      kind: l.kind,
      format: l.field?.format ?? null,
      stats: l.field?.stats ?? null,
      path: l.field?.data?.path ?? null,
      dims: l.dims ?? null,
    }))
    .sort((a, b) => (a.stepIndex ?? 0) - (b.stepIndex ?? 0));
}

export function readBinaryView(runDir: string, relPath: string): Buffer {
  const abs = join(runDir, relPath);
  return readFileSync(abs);
}

export function readU8Grid(runDir: string, layer: VizManifestV1["layers"][number]): {
  values: Uint8Array;
  width: number;
  height: number;
} {
  if (!layer.dims) throw new Error(`Layer "${layer.dataTypeKey}" missing dims.`);
  const relPath = layer.field?.data?.path;
  if (!relPath) throw new Error(`Layer "${layer.dataTypeKey}" missing field.data.path.`);
  const buf = readBinaryView(runDir, relPath);
  return {
    values: new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength),
    width: layer.dims.width,
    height: layer.dims.height,
  };
}

export function readI16Grid(runDir: string, layer: VizManifestV1["layers"][number]): {
  values: Int16Array;
  width: number;
  height: number;
} {
  if (!layer.dims) throw new Error(`Layer "${layer.dataTypeKey}" missing dims.`);
  const relPath = layer.field?.data?.path;
  if (!relPath) throw new Error(`Layer "${layer.dataTypeKey}" missing field.data.path.`);
  const buf = readBinaryView(runDir, relPath);
  const arr = new Int16Array(buf.buffer, buf.byteOffset, Math.floor(buf.byteLength / 2));
  return { values: arr, width: layer.dims.width, height: layer.dims.height };
}

export function readF32Grid(runDir: string, layer: VizManifestV1["layers"][number]): {
  values: Float32Array;
  width: number;
  height: number;
} {
  if (!layer.dims) throw new Error(`Layer "${layer.dataTypeKey}" missing dims.`);
  const relPath = layer.field?.data?.path;
  if (!relPath) throw new Error(`Layer "${layer.dataTypeKey}" missing field.data.path.`);
  const buf = readBinaryView(runDir, relPath);
  const arr = new Float32Array(buf.buffer, buf.byteOffset, Math.floor(buf.byteLength / 4));
  return { values: arr, width: layer.dims.width, height: layer.dims.height };
}

export function hammingU8(a: Uint8Array, b: Uint8Array): number {
  if (a.length !== b.length) throw new Error(`Hamming length mismatch: ${a.length} vs ${b.length}`);
  let diff = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) diff++;
  return diff;
}

export function landmaskStats(values: Uint8Array): { land: number; water: number; pctLand: number } {
  let land = 0;
  for (let i = 0; i < values.length; i++) if (values[i] === 1) land++;
  const water = values.length - land;
  return { land, water, pctLand: values.length > 0 ? land / values.length : 0 };
}

export function connectedComponentsLandOddQ(values: Uint8Array, width: number, height: number): {
  landComponents: number;
  largestLandComponent: number;
  largestLandFrac: number;
  totalLand: number;
} {
  const size = width * height;
  if (values.length !== size) throw new Error(`CC size mismatch: values=${values.length} dims=${size}`);

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
