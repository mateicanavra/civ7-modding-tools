#!/usr/bin/env bun

import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, resolve } from "node:path";

import type {
  FinalSurfaceParityProof,
  RiverMetadataSnapshot,
  SurfaceGrid,
} from "../../mods/mod-swooper-maps/src/dev/diagnostics/live-parity.ts";

type VisualVerdict = "visible" | "not-visible" | "obscured" | "inconclusive";
type CameraSource = "direct-control" | "manual" | "unknown";
type VerdictSource = "manual-review" | "classifier";
type CaptureMode = "direct-control" | "os-fallback" | "manual-file";

type Args = Readonly<{
  parityProof?: string;
  screenshots: ReadonlyArray<string>;
  cameraTarget?: MapLocation;
  cameraSource: CameraSource;
  cameraZoom?: string;
  visibilityState?: string;
  verdict?: VisualVerdict;
  verdictSource?: VerdictSource;
  captureMode: CaptureMode;
  maxSamples: number;
  output?: string;
  help: boolean;
}>;

type MapLocation = Readonly<{ x: number; y: number }>;

type RiverSample = Readonly<{
  x: number;
  y: number;
  index: number;
  projectedNavigableTerrain: number | null;
  liveTerrainNavigableRiver: number | null;
  liveNavigableRiver: number | null;
  liveRiverType: number | null;
}>;

type ScreenshotProof = Readonly<{
  path: string;
  sha256: string;
  sizeBytes: number;
  captureMode: CaptureMode;
  target: MapLocation;
}>;

type RiverVisibleProofStatus =
  | "visible"
  | "not-visible"
  | "obscured"
  | "inconclusive"
  | "blocked";

export type RiverVisibleProof = Readonly<{
  version: 1;
  createdAt: string;
  source: "river-runtime-visible-proof";
  parityProofHash: string;
  exactAuthorshipSummary: FinalSurfaceParityProof["exactAuthorshipSummary"];
  liveRiverSamples: Readonly<{
    status: "selected" | "missing";
    totalLiveTerrainNavigableRiverTiles: number;
    totalProjectedNavigableTerrainTiles: number;
    sampleCount: number;
    samples: ReadonlyArray<RiverSample>;
  }>;
  camera: Readonly<{
    status: "bound-to-sample" | "missing" | "target-not-sampled";
    source: CameraSource;
    target?: MapLocation;
    zoom?: string;
    visibilityState?: string;
  }>;
  screenshots: Readonly<{
    status: "bound" | "missing" | "path-missing" | "target-not-sampled";
    items: ReadonlyArray<ScreenshotProof>;
    missingPaths: ReadonlyArray<string>;
  }>;
  visualVerdict: Readonly<{
    status: VisualVerdict | "missing";
    source?: VerdictSource;
  }>;
  blockedBy: ReadonlyArray<string>;
}>;

export type RiverVisibleProofOutput = Readonly<{
  ok: boolean;
  status: RiverVisibleProofStatus;
  proofHash: string;
  proof: RiverVisibleProof;
}>;

const usage = `Usage:
  bun scripts/civ7-direct-control/verify-river-visible-proof.ts --parity-proof <path> [flags]

Required for a passing visible proof:
  --parity-proof <path>          Final-surface parity proof JSON
  --camera-target <x,y>          Camera target that must be one sampled live river tile
  --camera-source <source>       direct-control | manual | unknown
  --screenshot <path>            Repeatable screenshot artifact path
  --verdict <verdict>            visible | not-visible | obscured | inconclusive
  --verdict-source <source>      manual-review | classifier

Options:
  --capture-mode <mode>          direct-control | os-fallback | manual-file (default: manual-file)
  --camera-zoom <value>          Captured zoom label/value
  --visibility-state <value>     Captured visibility/layer/graphics state
  --max-samples <n>              Number of live river tiles to sample (default: 8)
  --output <path>                Write proof JSON to path
`;

function parseArgs(argv: string[]): Args {
  const args: {
    parityProof?: string;
    screenshots: string[];
    cameraTarget?: MapLocation;
    cameraSource: CameraSource;
    cameraZoom?: string;
    visibilityState?: string;
    verdict?: VisualVerdict;
    verdictSource?: VerdictSource;
    captureMode: CaptureMode;
    maxSamples: number;
    output?: string;
    help: boolean;
  } = {
    screenshots: [],
    cameraSource: "unknown",
    captureMode: "manual-file",
    maxSamples: 8,
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
      case "--parity-proof":
        args.parityProof = value();
        break;
      case "--screenshot":
        args.screenshots.push(value());
        break;
      case "--camera-target":
        args.cameraTarget = parseLocation(value(), arg);
        break;
      case "--camera-source":
        args.cameraSource = parseEnum(value(), ["direct-control", "manual", "unknown"], arg);
        break;
      case "--camera-zoom":
        args.cameraZoom = value();
        break;
      case "--visibility-state":
        args.visibilityState = value();
        break;
      case "--verdict":
        args.verdict = parseEnum(value(), ["visible", "not-visible", "obscured", "inconclusive"], arg);
        break;
      case "--verdict-source":
        args.verdictSource = parseEnum(value(), ["manual-review", "classifier"], arg);
        break;
      case "--capture-mode":
        args.captureMode = parseEnum(value(), ["direct-control", "os-fallback", "manual-file"], arg);
        break;
      case "--max-samples":
        args.maxSamples = parsePositiveInteger(value(), arg);
        break;
      case "--output":
        args.output = value();
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return args;
}

function parseEnum<const T extends string>(value: string, accepted: readonly T[], label: string): T {
  if ((accepted as readonly string[]).includes(value)) return value as T;
  throw new Error(`${label} must be one of: ${accepted.join(", ")}`);
}

function parseLocation(value: string, label: string): MapLocation {
  const [x, y] = value.split(",").map((part) => Number(part.trim()));
  if (!Number.isInteger(x) || !Number.isInteger(y) || x < 0 || y < 0) {
    throw new Error(`${label} must be a non-negative x,y pair: ${value}`);
  }
  return { x, y };
}

function parsePositiveInteger(value: string, label: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${label} must be a positive integer: ${value}`);
  }
  return parsed;
}

export function extractFinalSurfaceParityProof(payload: unknown): FinalSurfaceParityProof {
  const proof = isRecord(payload) && isRecord(payload.proof) ? payload.proof : payload;
  if (!isRecord(proof) || !isRecord(proof.local) || !isRecord(proof.live)) {
    throw new Error("Missing final-surface parity proof payload");
  }
  return proof as FinalSurfaceParityProof;
}

export function buildRiverVisibleProofOutput(args: {
  parity: FinalSurfaceParityProof;
  screenshots?: ReadonlyArray<string>;
  cameraTarget?: MapLocation;
  cameraSource?: CameraSource;
  cameraZoom?: string;
  visibilityState?: string;
  verdict?: VisualVerdict;
  verdictSource?: VerdictSource;
  captureMode?: CaptureMode;
  maxSamples?: number;
  now?: () => Date;
}): RiverVisibleProofOutput {
  const maxSamples = Math.max(1, Math.trunc(args.maxSamples ?? 8));
  const parityProofHash = hashValue(args.parity);
  const allLiveSamples = collectLiveRiverSamples(args.parity.live.riverMetadata, args.parity.local.riverMetadata);
  const selectedSamples = sampleEvenly(allLiveSamples, maxSamples);
  const target = args.cameraTarget;
  const targetIsSampled = target !== undefined && selectedSamples.some((sample) => sameLocation(sample, target));
  const screenshots = args.screenshots ?? [];
  const missingPaths = screenshots.filter((path) => !existsSync(path));
  const screenshotItems = missingPaths.length === 0 && target !== undefined && targetIsSampled
    ? screenshots.map((path) => screenshotProof(path, args.captureMode ?? "manual-file", target))
    : [];
  const blockedBy = new Set<string>();

  if (args.parity.proofClaims.claims["terrain-readback"]?.status !== "pass") {
    blockedBy.add("final-surface-parity.terrain-readback-pass");
  }
  if (allLiveSamples.length === 0) blockedBy.add("river-visible.live-terrain-river-samples");
  if (target === undefined) blockedBy.add("river-visible.camera-target");
  if (target !== undefined && !targetIsSampled) blockedBy.add("river-visible.camera-target-sampled-live-river");
  if (args.cameraSource === undefined || args.cameraSource === "unknown") {
    blockedBy.add("river-visible.camera-source");
  }
  if (screenshots.length === 0) blockedBy.add("river-visible.screenshot");
  if (missingPaths.length > 0) blockedBy.add("river-visible.screenshot-file");
  if (screenshots.length > 0 && !targetIsSampled) blockedBy.add("river-visible.screenshot-target");
  if (args.verdict === undefined) blockedBy.add("river-visible.verdict");
  if (args.verdictSource === undefined) blockedBy.add("river-visible.verdict-source");

  const cameraStatus =
    target === undefined
      ? "missing"
      : targetIsSampled
        ? "bound-to-sample"
        : "target-not-sampled";
  const screenshotStatus =
    screenshots.length === 0
      ? "missing"
      : missingPaths.length > 0
        ? "path-missing"
        : targetIsSampled
          ? "bound"
          : "target-not-sampled";
  const proof: RiverVisibleProof = {
    version: 1,
    createdAt: (args.now ?? (() => new Date()))().toISOString(),
    source: "river-runtime-visible-proof",
    parityProofHash,
    exactAuthorshipSummary: args.parity.exactAuthorshipSummary,
    liveRiverSamples: {
      status: allLiveSamples.length > 0 ? "selected" : "missing",
      totalLiveTerrainNavigableRiverTiles: allLiveSamples.length,
      totalProjectedNavigableTerrainTiles: countGridOnes(args.parity.local.riverMetadata?.projectedNavigableTerrain),
      sampleCount: selectedSamples.length,
      samples: selectedSamples,
    },
    camera: {
      status: cameraStatus,
      source: args.cameraSource ?? "unknown",
      ...(target === undefined ? {} : { target }),
      ...(args.cameraZoom === undefined ? {} : { zoom: args.cameraZoom }),
      ...(args.visibilityState === undefined ? {} : { visibilityState: args.visibilityState }),
    },
    screenshots: {
      status: screenshotStatus,
      items: screenshotItems,
      missingPaths,
    },
    visualVerdict: {
      status: args.verdict ?? "missing",
      ...(args.verdictSource === undefined ? {} : { source: args.verdictSource }),
    },
    blockedBy: [...blockedBy].sort((a, b) => a.localeCompare(b)),
  };
  const status = classifyRiverVisibleProof(proof);
  return {
    ok: status === "visible",
    status,
    proofHash: hashValue(proof),
    proof,
  };
}

function collectLiveRiverSamples(
  live: RiverMetadataSnapshot | undefined,
  local: RiverMetadataSnapshot | undefined
): ReadonlyArray<RiverSample> {
  const terrain = live?.terrainNavigableRiver;
  if (!terrain) return [];
  const projected = local?.projectedNavigableTerrain;
  const navigable = live?.navigableRiver;
  const riverType = live?.riverType;
  const samples: RiverSample[] = [];
  for (let index = 0; index < terrain.values.length; index += 1) {
    if (normalizedMaskValue(terrain.values[index]) !== 1) continue;
    const y = Math.floor(index / terrain.width);
    samples.push({
      x: index - y * terrain.width,
      y,
      index,
      projectedNavigableTerrain: gridValue(projected, index),
      liveTerrainNavigableRiver: gridValue(terrain, index),
      liveNavigableRiver: gridValue(navigable, index),
      liveRiverType: gridValue(riverType, index),
    });
  }
  return samples;
}

function sampleEvenly(samples: ReadonlyArray<RiverSample>, maxSamples: number): ReadonlyArray<RiverSample> {
  if (samples.length <= maxSamples) return samples;
  const selected: RiverSample[] = [];
  const last = samples.length - 1;
  for (let i = 0; i < maxSamples; i += 1) {
    const index = Math.round((i * last) / (maxSamples - 1));
    selected.push(samples[index]!);
  }
  return selected;
}

function screenshotProof(path: string, captureMode: CaptureMode, target: MapLocation): ScreenshotProof {
  const absolute = resolve(path);
  const bytes = readFileSync(absolute);
  const stat = statSync(absolute);
  return {
    path: absolute,
    sha256: createHash("sha256").update(bytes).digest("hex"),
    sizeBytes: stat.size,
    captureMode,
    target,
  };
}

function classifyRiverVisibleProof(proof: RiverVisibleProof): RiverVisibleProofStatus {
  if (proof.blockedBy.length > 0) return "blocked";
  return proof.visualVerdict.status;
}

function gridValue(grid: SurfaceGrid | undefined, index: number): number | null {
  if (!grid || index < 0 || index >= grid.values.length) return null;
  const value = grid.values[index];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function normalizedMaskValue(value: unknown): 0 | 1 | null {
  if (value === 1 || value === true) return 1;
  if (value === 0 || value === false) return 0;
  return null;
}

function countGridOnes(grid: SurfaceGrid | undefined): number {
  if (!grid) return 0;
  let count = 0;
  for (const value of grid.values) {
    if (normalizedMaskValue(value) === 1) count += 1;
  }
  return count;
}

function sameLocation(a: MapLocation, b: MapLocation): boolean {
  return a.x === b.x && a.y === b.y;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hashValue(value: unknown): string {
  return createHash("sha256").update(stableStringify(value)).digest("hex");
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((entry) => stableStringify(entry)).join(",")}]`;
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, entry]) => entry !== undefined)
    .sort(([a], [b]) => a.localeCompare(b));
  return `{${entries.map(([key, entry]) => `${JSON.stringify(key)}:${stableStringify(entry)}`).join(",")}}`;
}

function writeOutput(path: string | undefined, output: RiverVisibleProofOutput): void {
  if (!path) return;
  const absolute = resolve(path);
  mkdirSync(dirname(absolute), { recursive: true });
  writeFileSync(absolute, JSON.stringify(output, null, 2));
}

async function main(): Promise<number> {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage);
    return 0;
  }
  if (!args.parityProof) throw new Error("Expected --parity-proof");
  const parity = extractFinalSurfaceParityProof(JSON.parse(readFileSync(args.parityProof, "utf8")));
  const output = buildRiverVisibleProofOutput({
    parity,
    screenshots: args.screenshots,
    cameraTarget: args.cameraTarget,
    cameraSource: args.cameraSource,
    cameraZoom: args.cameraZoom,
    visibilityState: args.visibilityState,
    verdict: args.verdict,
    verdictSource: args.verdictSource,
    captureMode: args.captureMode,
    maxSamples: args.maxSamples,
  });
  writeOutput(args.output, output);
  console.log(JSON.stringify(output, null, 2));
  return output.ok ? 0 : 2;
}

if (import.meta.main) {
  main()
    .then((code) => {
      process.exitCode = code;
    })
    .catch((error) => {
      console.error(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : String(error) }, null, 2));
      process.exitCode = 1;
    });
}
