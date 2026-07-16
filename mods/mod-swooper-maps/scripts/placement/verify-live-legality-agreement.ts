#!/usr/bin/env bun

/**
 * Live legality agreement probe (placement-realignment Milestone A3 / E4.4).
 *
 * Measures agreement between the repo's mock resource-legality emulation
 * (`buildResourceLegalityMask`, generated Resource_ValidPlacements policy
 * rows) and the live engine oracle `ResourceBuilder.canHaveResource` over a
 * deterministic stratified sample of plots, classifies disagreements, probes
 * ignoreWeight semantics, and counts live-legal SILVER tiles over the full
 * grid (DEF-009).
 *
 * Verified live API signatures (official scripts):
 *   ResourceBuilder.canHaveResource(iX, iY, resourceTypeIndex, bIgnoreWeight)
 *     - .civ7/outputs/resources/Base/modules/base-standard/maps/resource-generator.js:176
 *       `ResourceBuilder.canHaveResource(iX, iY, resourceType, false)`
 *     - .civ7/outputs/resources/Base/modules/base-standard/maps/map-utilities.js:479
 *       `ResourceBuilder.canHaveResource(iX, iY, resources[iI], true)`
 *     (x/y coordinates, NOT plot index; resource index is the
 *     GameInfo.Resources row index, see resource-generator.js:110-115.)
 *   GameplayMap getters (x, y):
 *     - getTerrainType: feature-biome-generator.js:43
 *     - getBiomeType:   assign-starting-plots.js:796
 *     - getFeatureType: feature-biome-generator.js:82
 *     - isWater:        feature-biome-generator.js:11
 *     - getRiverType:   map-utilities.js:418
 *     - getGridWidth:   map-utilities.js:382
 *
 * Engine reads are batched: each batch is ONE executeCiv7TunerCommand whose
 * command is an IIFE returning a JSON.stringify'd compact payload; large
 * surfaces (full-grid strata, per-type legality bits) are chunked. Legality
 * bits are hex-packed (4 plots per character) to keep payloads small.
 *
 * This script CONNECTS TO THE LIVE GAME (read-only). Do not run while the
 * game is restarting. `--help` exits before any socket work.
 *
 * Usage:
 *   nx run mod-swooper-maps:verify:operational -- --mode placement-live-legality-agreement [--host h] [--port p] \
 *     [--sample-size 400] [--timeout-ms 45000] [--output out.json]
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import {
  type Civ7CommandResult,
  type Civ7DirectControlOptions,
  executeCiv7TunerCommand,
} from "@civ7/direct-control";
import {
  buildResourceLegalityMask,
  type OfficialResourceType,
  type ResourceLegalitySurface,
  resolveResourceRuntimeIds,
} from "@civ7/map-policy";

const AGREEMENT_GATE_THRESHOLD = 0.95;
const DEFAULT_SAMPLE_SIZE = 400;
const STRATA_CHUNK_PLOTS = 2_000;
const SURFACE_CHUNK_PLOTS = 200;
const LEGALITY_TYPES_PER_EXEC = 8;

type Args = Readonly<{
  host?: string;
  port?: number;
  sampleSize: number;
  timeoutMs: number;
  output?: string;
  help: boolean;
}>;

const usage = `Usage:
  nx run mod-swooper-maps:verify:operational -- --mode placement-live-legality-agreement [options]

Measures mock-vs-live ResourceBuilder.canHaveResource agreement over a
deterministic stratified plot sample (Milestone A3 / E4.4) and counts
full-grid live-legal SILVER tiles (DEF-009). Read-only; requires a live game.

Options:
  --host <host>         Civ7 tuner host
  --port <port>         Civ7 tuner port
  --sample-size <n>     Stratified sample size (default: ${DEFAULT_SAMPLE_SIZE})
  --timeout-ms <ms>     Direct-control timeout (default: 45000)
  --output <path>       Write full agreement JSON to path
  --help, -h            Show this help (no game connection)
`;

export function parseArgs(argv: string[]): Args {
  const args: {
    host?: string;
    port?: number;
    sampleSize: number;
    timeoutMs: number;
    output?: string;
    help: boolean;
  } = {
    sampleSize: DEFAULT_SAMPLE_SIZE,
    timeoutMs: 45_000,
    help: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const value = () => {
      const next = argv[index + 1];
      if (!next || next.startsWith("--")) throw new Error(`Missing value for ${arg}`);
      index += 1;
      return next;
    };
    switch (arg) {
      case "--help":
      case "-h":
        args.help = true;
        break;
      case "--host":
        args.host = value();
        break;
      case "--port":
        args.port = parseInteger(value(), arg);
        break;
      case "--sample-size":
        args.sampleSize = parseInteger(value(), arg);
        break;
      case "--timeout-ms":
        args.timeoutMs = parseInteger(value(), arg);
        break;
      case "--output":
        args.output = value();
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }
  if (args.sampleSize < 4) throw new Error("--sample-size must be >= 4");
  return args;
}

function parseInteger(value: string, label: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) throw new Error(`${label} must be an integer: ${value}`);
  return parsed;
}

/* ---------------------------------------------------------------- engine */

type MapHeader = Readonly<{
  width: number;
  height: number;
  plotCount: number;
  coastTerrain: number | null;
  noFeature: number;
  noRiver: number;
}>;

type StrataChunk = Readonly<{ start: number; end: number; strata: string }>;

type ResourceCatalogRow = Readonly<{ index: number; type: string | null }>;

type ResourceCatalog = Readonly<{ count: number; rows: ReadonlyArray<ResourceCatalogRow> }>;

type SurfaceChunk = Readonly<{
  t: ReadonlyArray<number>;
  b: ReadonlyArray<number>;
  f: ReadonlyArray<number>;
  w: ReadonlyArray<number>;
}>;

type LegalityChunk = Readonly<Record<string, Readonly<{ ig: string; st: string }>>>;

type SilverFullGrid = Readonly<{
  resourceIndex: number;
  plotCount: number;
  ignoreWeightTrueCount: number;
  ignoreWeightFalseCount: number;
}>;

function jsonPayloadFromCommandResult<T>(result: Civ7CommandResult, label: string): T {
  const payload = [...result.output].reverse().find((line) => {
    const trimmed = line.trim();
    return trimmed.startsWith("{") || trimmed.startsWith("[");
  });
  try {
    return JSON.parse(payload ?? "{}") as T;
  } catch (error) {
    throw new Error(`${label} returned invalid JSON: ${result.output.join("\n") || "<empty>"}`, {
      cause: error,
    });
  }
}

async function execJson<T>(
  options: Civ7DirectControlOptions,
  command: string,
  label: string
): Promise<T> {
  const result = await executeCiv7TunerCommand({ ...options, command });
  return jsonPayloadFromCommandResult<T>(result, label);
}

function buildMapHeaderCommand(): string {
  return `(() => {
    const coastRow = typeof GameInfo !== "undefined" && GameInfo.Terrains
      ? GameInfo.Terrains.find((row) => row.TerrainType === "TERRAIN_COAST")
      : undefined;
    return JSON.stringify({
      width: GameplayMap.getGridWidth(),
      height: GameplayMap.getGridHeight(),
      plotCount: GameplayMap.getGridWidth() * GameplayMap.getGridHeight(),
      coastTerrain: coastRow ? coastRow.$index : null,
      noFeature: typeof FeatureTypes !== "undefined" && typeof FeatureTypes.NO_FEATURE === "number"
        ? FeatureTypes.NO_FEATURE
        : -1,
      noRiver: typeof RiverTypes !== "undefined" && typeof RiverTypes.NO_RIVER === "number"
        ? RiverTypes.NO_RIVER
        : -1,
    });
  })()`;
}

/**
 * Strata codes per plot (one char each):
 *   0 = land, no river; 1 = land, river; 2 = water, coast terrain; 3 = water, deep.
 * Stratified by GameplayMap.isWater + GameplayMap.getRiverType + coast terrain.
 */
function buildStrataChunkCommand(start: number, end: number): string {
  return `(() => {
    const width = GameplayMap.getGridWidth();
    const noRiver = typeof RiverTypes !== "undefined" && typeof RiverTypes.NO_RIVER === "number"
      ? RiverTypes.NO_RIVER
      : -1;
    const coastRow = typeof GameInfo !== "undefined" && GameInfo.Terrains
      ? GameInfo.Terrains.find((row) => row.TerrainType === "TERRAIN_COAST")
      : undefined;
    const coast = coastRow ? coastRow.$index : -1;
    let strata = "";
    for (let i = ${start}; i < ${end}; i++) {
      const y = (i / width) | 0;
      const x = i - y * width;
      if (GameplayMap.isWater(x, y)) {
        strata += GameplayMap.getTerrainType(x, y) === coast ? "2" : "3";
      } else {
        strata += GameplayMap.getRiverType(x, y) !== noRiver ? "1" : "0";
      }
    }
    return JSON.stringify({ start: ${start}, end: ${end}, strata });
  })()`;
}

function buildResourceCatalogCommand(): string {
  return `(() => {
    const rows = [];
    for (let i = 0; i < GameInfo.Resources.length; i++) {
      const row = GameInfo.Resources.lookup(i);
      rows.push({ index: i, type: row && typeof row.ResourceType === "string" ? row.ResourceType : null });
    }
    return JSON.stringify({ count: GameInfo.Resources.length, rows });
  })()`;
}

function buildSurfaceChunkCommand(indices: ReadonlyArray<number>): string {
  return `(() => {
    const idx = ${JSON.stringify(indices)};
    const width = GameplayMap.getGridWidth();
    const t = [];
    const b = [];
    const f = [];
    const w = [];
    for (const i of idx) {
      const y = (i / width) | 0;
      const x = i - y * width;
      t.push(GameplayMap.getTerrainType(x, y));
      b.push(GameplayMap.getBiomeType(x, y));
      f.push(GameplayMap.getFeatureType(x, y));
      w.push(GameplayMap.isWater(x, y) ? 1 : 0);
    }
    return JSON.stringify({ t, b, f, w });
  })()`;
}

/**
 * For each resource type, evaluates canHaveResource at every sampled plot with
 * ignoreWeight=true (ig) and ignoreWeight=false (st), hex-packed 4 plots per
 * character (bit order: plot k is bit (3 - k % 4) of char floor(k / 4)).
 */
function buildLegalityChunkCommand(
  indices: ReadonlyArray<number>,
  resourceTypes: ReadonlyArray<number>
): string {
  return `(() => {
    const idx = ${JSON.stringify(indices)};
    const types = ${JSON.stringify(resourceTypes)};
    const width = GameplayMap.getGridWidth();
    const pack = (bits) => {
      let s = "";
      for (let i = 0; i < bits.length; i += 4) {
        s += (((bits[i] || 0) << 3) | ((bits[i + 1] || 0) << 2) | ((bits[i + 2] || 0) << 1) | (bits[i + 3] || 0)).toString(16);
      }
      return s;
    };
    const out = {};
    for (const type of types) {
      const ig = [];
      const st = [];
      for (const i of idx) {
        const y = (i / width) | 0;
        const x = i - y * width;
        ig.push(ResourceBuilder.canHaveResource(x, y, type, true) ? 1 : 0);
        st.push(ResourceBuilder.canHaveResource(x, y, type, false) ? 1 : 0);
      }
      out[String(type)] = { ig: pack(ig), st: pack(st) };
    }
    return JSON.stringify(out);
  })()`;
}

function buildSilverFullGridCommand(resourceIndex: number): string {
  return `(() => {
    const width = GameplayMap.getGridWidth();
    const height = GameplayMap.getGridHeight();
    let ig = 0;
    let st = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (ResourceBuilder.canHaveResource(x, y, ${resourceIndex}, true)) ig++;
        if (ResourceBuilder.canHaveResource(x, y, ${resourceIndex}, false)) st++;
      }
    }
    return JSON.stringify({
      resourceIndex: ${resourceIndex},
      plotCount: width * height,
      ignoreWeightTrueCount: ig,
      ignoreWeightFalseCount: st,
    });
  })()`;
}

/* ------------------------------------------------------------- sampling */

export function unpackHexBits(hex: string, bitCount: number): Uint8Array {
  const bits = new Uint8Array(bitCount);
  for (let i = 0; i < bitCount; i += 1) {
    const nibble = parseInt(hex[(i / 4) | 0] ?? "0", 16);
    bits[i] = (nibble >> (3 - (i % 4))) & 1;
  }
  return bits;
}

/**
 * Deterministic stratified sample: proportional allocation (largest remainder,
 * minimum 1 per non-empty stratum) with even-stride selection within each
 * stratum. No RNG; identical inputs yield identical samples.
 */
export function stratifiedSampleIndices(
  strata: string,
  sampleSize: number
): Readonly<{
  indices: ReadonlyArray<number>;
  strataCounts: Record<string, number>;
  sampleCounts: Record<string, number>;
}> {
  const buckets = new Map<string, number[]>();
  for (let i = 0; i < strata.length; i += 1) {
    const code = strata[i] ?? "0";
    const bucket = buckets.get(code);
    if (bucket) bucket.push(i);
    else buckets.set(code, [i]);
  }
  const codes = [...buckets.keys()].sort();
  const total = strata.length;
  const target = Math.min(sampleSize, total);

  const quotas = new Map<string, number>();
  const remainders: Array<{ code: string; remainder: number }> = [];
  let allocated = 0;
  for (const code of codes) {
    const size = buckets.get(code)?.length ?? 0;
    const exact = (target * size) / total;
    const quota = Math.min(size, Math.max(1, Math.floor(exact)));
    quotas.set(code, quota);
    allocated += quota;
    remainders.push({ code, remainder: exact - Math.floor(exact) });
  }
  remainders.sort((a, b) => b.remainder - a.remainder || a.code.localeCompare(b.code));
  let cursor = 0;
  while (allocated < target && cursor < remainders.length * 4) {
    const { code } = remainders[cursor % remainders.length];
    const size = buckets.get(code)?.length ?? 0;
    const quota = quotas.get(code) ?? 0;
    if (quota < size) {
      quotas.set(code, quota + 1);
      allocated += 1;
    }
    cursor += 1;
  }
  while (allocated > target) {
    const code = [...quotas.keys()].sort((a, b) => (quotas.get(b) ?? 0) - (quotas.get(a) ?? 0))[0];
    quotas.set(code, (quotas.get(code) ?? 1) - 1);
    allocated -= 1;
  }

  const indices: number[] = [];
  const strataCounts: Record<string, number> = {};
  const sampleCounts: Record<string, number> = {};
  for (const code of codes) {
    const bucket = buckets.get(code) ?? [];
    const quota = quotas.get(code) ?? 0;
    strataCounts[code] = bucket.length;
    sampleCounts[code] = quota;
    if (quota <= 0) continue;
    const stride = bucket.length / quota;
    for (let k = 0; k < quota; k += 1) {
      indices.push(bucket[Math.min(bucket.length - 1, Math.floor(k * stride))]);
    }
  }
  indices.sort((a, b) => a - b);
  return { indices: [...new Set(indices)], strataCounts, sampleCounts };
}

/* ------------------------------------------------------------ comparison */

type DisagreementBreakdown = {
  total: number;
  waterPlot: number;
  landPlot: number;
  withFeature: number;
  withoutFeature: number;
};

type PerTypeReport = {
  liveIndex: number;
  resourceType: string;
  comparisons: number;
  agreements: number;
  agreement: number;
  mockLegalLiveIllegal: number;
  mockIllegalLiveLegal: number;
  liveIgnoreWeightTrueCount: number;
  liveIgnoreWeightFalseCount: number;
  ignoreWeightDelta: number;
  strictLegalButIgnoreWeightIllegal: number;
};

function emptyBreakdown(): DisagreementBreakdown {
  return { total: 0, waterPlot: 0, landPlot: 0, withFeature: 0, withoutFeature: 0 };
}

function recordDisagreement(
  breakdown: DisagreementBreakdown,
  isWater: boolean,
  hasFeature: boolean
): void {
  breakdown.total += 1;
  if (isWater) breakdown.waterPlot += 1;
  else breakdown.landPlot += 1;
  if (hasFeature) breakdown.withFeature += 1;
  else breakdown.withoutFeature += 1;
}

/* ------------------------------------------------------------------ main */

async function main(): Promise<number> {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage);
    return 0;
  }

  const directControl: Civ7DirectControlOptions = {
    ...(args.host === undefined ? {} : { host: args.host }),
    ...(args.port === undefined ? {} : { port: args.port }),
    timeoutMs: args.timeoutMs,
  };

  const header = await execJson<MapHeader>(directControl, buildMapHeaderCommand(), "map header");
  const { width, height, plotCount } = header;
  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) {
    throw new Error(`Live map dimensions unavailable: ${JSON.stringify(header)}`);
  }

  let strata = "";
  for (let start = 0; start < plotCount; start += STRATA_CHUNK_PLOTS) {
    const end = Math.min(plotCount, start + STRATA_CHUNK_PLOTS);
    const chunk = await execJson<StrataChunk>(
      directControl,
      buildStrataChunkCommand(start, end),
      `strata chunk ${start}..${end}`
    );
    if (chunk.start !== start || chunk.strata.length !== end - start) {
      throw new Error(
        `Strata chunk mismatch at ${start}: ${JSON.stringify({ start: chunk.start, length: chunk.strata.length })}`
      );
    }
    strata += chunk.strata;
  }

  const sample = stratifiedSampleIndices(strata, args.sampleSize);
  const sampledIndices = sample.indices;

  const catalog = await execJson<ResourceCatalog>(
    directControl,
    buildResourceCatalogCommand(),
    "resource catalog"
  );

  const surfaceT: number[] = [];
  const surfaceB: number[] = [];
  const surfaceF: number[] = [];
  const surfaceW: number[] = [];
  for (let start = 0; start < sampledIndices.length; start += SURFACE_CHUNK_PLOTS) {
    const slice = sampledIndices.slice(start, start + SURFACE_CHUNK_PLOTS);
    const chunk = await execJson<SurfaceChunk>(
      directControl,
      buildSurfaceChunkCommand(slice),
      `surface chunk ${start}`
    );
    if (chunk.t.length !== slice.length) {
      throw new Error(`Surface chunk length mismatch at ${start}`);
    }
    surfaceT.push(...chunk.t);
    surfaceB.push(...chunk.b);
    surfaceF.push(...chunk.f);
    surfaceW.push(...chunk.w);
  }

  // Live per-type legality bits over the sample, both ignoreWeight variants.
  const liveLegality = new Map<number, { ig: Uint8Array; st: Uint8Array }>();
  const allTypeIndices = catalog.rows.map((row) => row.index);
  for (let start = 0; start < allTypeIndices.length; start += LEGALITY_TYPES_PER_EXEC) {
    const types = allTypeIndices.slice(start, start + LEGALITY_TYPES_PER_EXEC);
    const chunk = await execJson<LegalityChunk>(
      directControl,
      buildLegalityChunkCommand(sampledIndices, types),
      `legality chunk types ${types[0]}..${types[types.length - 1]}`
    );
    for (const type of types) {
      const entry = chunk[String(type)];
      if (!entry) throw new Error(`Missing legality payload for resource index ${type}`);
      liveLegality.set(type, {
        ig: unpackHexBits(entry.ig, sampledIndices.length),
        st: unpackHexBits(entry.st, sampledIndices.length),
      });
    }
  }

  // Full-grid SILVER counts (DEF-009).
  const silverRow = catalog.rows.find((row) => row.type === "RESOURCE_SILVER");
  const silverFullGrid: SilverFullGrid | null = silverRow
    ? await execJson<SilverFullGrid>(
        directControl,
        buildSilverFullGridCommand(silverRow.index),
        "silver full-grid counts"
      )
    : null;

  /* ---- mock side (no engine): sparse surface, full-grid water mask ---- */

  // engineWaterMask covers ALL plots (derived from strata: 2/3 = water) so the
  // mock's adjacent-to-land checks see real neighbor water state; biome /
  // terrain / feature are only populated (and only evaluated) at sampled plots.
  const surface: ResourceLegalitySurface = (() => {
    const biomeType = new Uint8Array(plotCount);
    const terrainType = new Uint8Array(plotCount);
    const featureType = new Int16Array(plotCount);
    const engineWaterMask = new Uint8Array(plotCount);
    for (let i = 0; i < plotCount; i += 1) {
      const code = strata[i];
      engineWaterMask[i] = code === "2" || code === "3" ? 1 : 0;
    }
    for (let k = 0; k < sampledIndices.length; k += 1) {
      const i = sampledIndices[k];
      // Mirrors readResourceLegalitySurface (plan-resources/planning.ts):
      // Math.max(0, v|0) for biome/terrain, raw feature with NO_FEATURE -> -1.
      biomeType[i] = Math.max(0, surfaceB[k] | 0);
      terrainType[i] = Math.max(0, surfaceT[k] | 0);
      featureType[i] = surfaceF[k] === header.noFeature ? -1 : surfaceF[k] | 0;
      engineWaterMask[i] = surfaceW[k] === 1 ? 1 : 0;
    }
    return { width, height, biomeType, terrainType, featureType, engineWaterMask };
  })();

  // Live index -> mock runtime id verification (no silent remapping).
  const runtimeIds = resolveResourceRuntimeIds();
  const indexMismatches: Array<{
    resourceType: string;
    liveIndex: number;
    expectedRuntimeId: number;
  }> = [];
  const unknownToMock: Array<{ resourceType: string | null; liveIndex: number }> = [];
  const comparableTypes: Array<{ liveIndex: number; resourceType: string }> = [];
  for (const row of catalog.rows) {
    if (!row.type) {
      unknownToMock.push({ resourceType: row.type, liveIndex: row.index });
      continue;
    }
    const resolved = runtimeIds.byType.get(row.type as OfficialResourceType);
    if (!resolved) {
      unknownToMock.push({ resourceType: row.type, liveIndex: row.index });
      continue;
    }
    if (resolved.resourceTypeId !== row.index) {
      indexMismatches.push({
        resourceType: row.type,
        liveIndex: row.index,
        expectedRuntimeId: resolved.resourceTypeId,
      });
      continue;
    }
    comparableTypes.push({ liveIndex: row.index, resourceType: row.type });
  }

  /* ---- comparison: mock legal vs live ignoreWeight=true ---- */

  const perType: PerTypeReport[] = [];
  const mockLegalLiveIllegal = emptyBreakdown();
  const mockIllegalLiveLegal = emptyBreakdown();
  let totalComparisons = 0;
  let totalAgreements = 0;

  for (const { liveIndex, resourceType } of comparableTypes) {
    const live = liveLegality.get(liveIndex);
    if (!live) continue;
    const mockMask = buildResourceLegalityMask(surface, liveIndex);
    let agreements = 0;
    let typeMockLegalLiveIllegal = 0;
    let typeMockIllegalLiveLegal = 0;
    let igCount = 0;
    let stCount = 0;
    let strictNotSubset = 0;
    for (let k = 0; k < sampledIndices.length; k += 1) {
      const plot = sampledIndices[k];
      const mockLegal = mockMask[plot] === 1;
      const liveLegal = live.ig[k] === 1;
      const strictLegal = live.st[k] === 1;
      if (liveLegal) igCount += 1;
      if (strictLegal) stCount += 1;
      if (strictLegal && !liveLegal) strictNotSubset += 1;
      if (mockLegal === liveLegal) {
        agreements += 1;
      } else {
        const isWater = surfaceW[k] === 1;
        const hasFeature = surfaceF[k] !== header.noFeature;
        if (mockLegal) {
          typeMockLegalLiveIllegal += 1;
          recordDisagreement(mockLegalLiveIllegal, isWater, hasFeature);
        } else {
          typeMockIllegalLiveLegal += 1;
          recordDisagreement(mockIllegalLiveLegal, isWater, hasFeature);
        }
      }
    }
    totalComparisons += sampledIndices.length;
    totalAgreements += agreements;
    perType.push({
      liveIndex,
      resourceType,
      comparisons: sampledIndices.length,
      agreements,
      agreement: sampledIndices.length > 0 ? agreements / sampledIndices.length : 1,
      mockLegalLiveIllegal: typeMockLegalLiveIllegal,
      mockIllegalLiveLegal: typeMockIllegalLiveLegal,
      liveIgnoreWeightTrueCount: igCount,
      liveIgnoreWeightFalseCount: stCount,
      ignoreWeightDelta: igCount - stCount,
      strictLegalButIgnoreWeightIllegal: strictNotSubset,
    });
  }

  const observedAgreement = totalComparisons > 0 ? totalAgreements / totalComparisons : 0;
  const gatePass = observedAgreement >= AGREEMENT_GATE_THRESHOLD;

  const output = {
    ok: gatePass,
    gate: {
      id: "E4.4",
      threshold: AGREEMENT_GATE_THRESHOLD,
      observed: observedAgreement,
      pass: gatePass,
      totalComparisons,
      totalAgreements,
    },
    map: {
      width,
      height,
      plotCount,
      coastTerrain: header.coastTerrain,
      noFeature: header.noFeature,
      noRiver: header.noRiver,
    },
    sample: {
      requestedSize: args.sampleSize,
      actualSize: sampledIndices.length,
      strataLegend: {
        "0": "land, no river",
        "1": "land, river",
        "2": "water, coast terrain",
        "3": "water, deep",
      },
      strataCounts: sample.strataCounts,
      sampleCounts: sample.sampleCounts,
    },
    resourceCatalog: {
      liveCount: catalog.count,
      comparedCount: comparableTypes.length,
      indexMismatches,
      unknownToMock,
    },
    comparison: {
      semantics:
        "mock buildResourceLegalityMask vs live ResourceBuilder.canHaveResource(x, y, type, /*ignoreWeight*/ true)",
      perType: perType.sort((a, b) => a.agreement - b.agreement || a.liveIndex - b.liveIndex),
      disagreements: {
        mockLegalLiveIllegal,
        mockIllegalLiveLegal,
      },
    },
    ignoreWeightProbe: {
      semantics:
        "delta = count(ignoreWeight=true legal) - count(ignoreWeight=false legal) over the sample; strictLegalButIgnoreWeightIllegal > 0 would mean ignoreWeight=true is NOT a superset of ignoreWeight=false",
      totalIgnoreWeightTrue: perType.reduce((sum, row) => sum + row.liveIgnoreWeightTrueCount, 0),
      totalIgnoreWeightFalse: perType.reduce((sum, row) => sum + row.liveIgnoreWeightFalseCount, 0),
      typesWhereStrictNotSubset: perType.filter((row) => row.strictLegalButIgnoreWeightIllegal > 0)
        .length,
    },
    silverFullGrid: silverFullGrid ?? {
      missing: "RESOURCE_SILVER not present in live GameInfo.Resources",
    },
    generatedAt: new Date().toISOString(),
  };

  writeOutput(args.output, output);
  console.log(JSON.stringify(output, null, 2));
  console.log(
    `E4.4 agreement >= ${AGREEMENT_GATE_THRESHOLD}: ${gatePass ? "PASS" : "FAIL"} (observed ${observedAgreement.toFixed(4)})`
  );
  return gatePass ? 0 : 2;
}

function writeOutput(path: string | undefined, output: unknown): void {
  if (!path) return;
  const absolute = resolve(path);
  mkdirSync(dirname(absolute), { recursive: true });
  writeFileSync(absolute, `${JSON.stringify(output, null, 2)}\n`);
}

if (import.meta.main) {
  main()
    .then((code) => {
      process.exitCode = code;
    })
    .catch((error) => {
      console.error(
        JSON.stringify(
          { ok: false, error: error instanceof Error ? error.message : String(error) },
          null,
          2
        )
      );
      process.exitCode = 1;
    });
}
