#!/usr/bin/env bun

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import {
  executeCiv7TunerCommand,
  getCiv7FullMapGrid,
  getCiv7NativeRiverObjects,
  type Civ7CommandResult,
  type Civ7DirectControlOptions,
  type Civ7NativeRiverObjectsResult,
  type Civ7RuntimeProbe,
} from "../../packages/civ7-direct-control/src/index.ts";
import { CIV7_DEFAULT_RIVER_MODELING_ARGS } from "../../packages/civ7-map-policy/src/index.ts";

import {
  summarizeRiverMetadataReadback,
  type RiverMetadataReadbackSummary,
} from "./probe-river-writer.ts";

type Args = Readonly<{
  host?: string;
  port?: number;
  timeoutMs: number;
  maxPlotsPerRead: number;
  readFullGrid: boolean;
  confirmDisposableSession: boolean;
  minLength: number;
  maxLength: number;
  navigableTerrain?: number;
  output?: string;
  help: boolean;
}>;

type RuntimeObjectInventory = Readonly<{
  exists: boolean;
  type: string;
  ownKeys: ReadonlyArray<string>;
  prototypeKeys: ReadonlyArray<string>;
  modelRivers?: RuntimeMethodInventory;
  validateAndFixTerrain?: RuntimeMethodInventory;
  defineNamedRivers?: RuntimeMethodInventory;
  storeWaterData?: RuntimeMethodInventory;
}>;

type RuntimeMethodInventory = Readonly<{
  exists: boolean;
  type: string;
  length?: number;
  signature?: string;
}>;

export type RiverModelingRuntimeInventory = Readonly<{
  terrainBuilder: RuntimeObjectInventory;
  mapRivers: RuntimeObjectInventory;
  riverTypes: Readonly<Record<string, unknown>>;
  terrainNavigableRiver: number | null;
  officialPolicyDefaults: Readonly<{
    minLength: number;
    maxLength: number;
  }>;
}>;

export type NativeRiverObjectSummary = Readonly<{
  exists: boolean;
  numRivers: number | null;
  samples: ReadonlyArray<
    Readonly<{
      index: number;
      riverType: number | null;
      plotCount: number | null;
      connectedToOcean: boolean | null;
    }>
  >;
  blockedBy: ReadonlyArray<string>;
}>;

type RiverModelingMutationResult = Readonly<{
  attempted: boolean;
  ok: boolean;
  sequence: ReadonlyArray<string>;
  minLength: number;
  maxLength: number;
  navigableTerrain?: number;
  error?: string;
}>;

export type RiverModelingProbeOutput = Readonly<{
  ok: boolean;
  status: "dry-run" | "writer-supported" | "unsupported-or-unproven";
  mutationAttempted: boolean;
  blockedBy: ReadonlyArray<string>;
  evidenceBoundary: string;
  inventory: RiverModelingRuntimeInventory;
  preNativeRiverObjects: NativeRiverObjectSummary | null;
  preReadback: RiverMetadataReadbackSummary | null;
  mutation?: RiverModelingMutationResult;
  postNativeRiverObjects?: NativeRiverObjectSummary;
  postReadback?: RiverMetadataReadbackSummary;
  deltas?: Readonly<{
    terrainNavigableRiver: number;
    river: number;
    navigableRiver: number;
    minorRiver: number;
    noRiver: number;
    nativeRiverCount: number | null;
    terrainChanged: boolean;
    metadataChanged: boolean;
    nativeRiverObjectsChanged: boolean;
  }> | null;
}>;

const OFFICIAL_DEFAULT_MIN_LENGTH = CIV7_DEFAULT_RIVER_MODELING_ARGS.minLength;
const OFFICIAL_DEFAULT_MAX_LENGTH = CIV7_DEFAULT_RIVER_MODELING_ARGS.maxLength;

const usage = `Usage:
  bun scripts/civ7-direct-control/probe-river-modeling.ts
  bun scripts/civ7-direct-control/probe-river-modeling.ts --read-full-grid
  bun scripts/civ7-direct-control/probe-river-modeling.ts --confirm-disposable-session --read-full-grid

Options:
  --host <host>                    Civ7 tuner host
  --port <port>                    Civ7 tuner port
  --timeout-ms <ms>                Direct-control timeout (default: 45000)
  --max-plots-per-read <n>         Direct-control tile size cap (default: 512)
  --read-full-grid                 Include full-grid terrain/river metadata counts
  --confirm-disposable-session     Allow one official-sequence modelRivers mutation
  --min-length <n>                 Official compatibility minLength (default: 5)
  --max-length <n>                 Official compatibility maxLength (default: 15)
  --navigable-terrain <id>         Override TERRAIN_NAVIGABLE_RIVER terrain id
  --output <path>                  Write full probe JSON to path
`;

export function parseArgs(argv: string[]): Args {
  const args: {
    host?: string;
    port?: number;
    timeoutMs: number;
    maxPlotsPerRead: number;
    readFullGrid: boolean;
    confirmDisposableSession: boolean;
    minLength: number;
    maxLength: number;
    navigableTerrain?: number;
    output?: string;
    help: boolean;
  } = {
    timeoutMs: 45_000,
    maxPlotsPerRead: 512,
    readFullGrid: false,
    confirmDisposableSession: false,
    minLength: OFFICIAL_DEFAULT_MIN_LENGTH,
    maxLength: OFFICIAL_DEFAULT_MAX_LENGTH,
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
      case "--timeout-ms":
        args.timeoutMs = parseInteger(value(), arg);
        break;
      case "--max-plots-per-read":
        args.maxPlotsPerRead = parseInteger(value(), arg);
        break;
      case "--read-full-grid":
        args.readFullGrid = true;
        break;
      case "--confirm-disposable-session":
        args.confirmDisposableSession = true;
        break;
      case "--min-length":
        args.minLength = parseInteger(value(), arg);
        break;
      case "--max-length":
        args.maxLength = parseInteger(value(), arg);
        break;
      case "--navigable-terrain":
        args.navigableTerrain = parseInteger(value(), arg);
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

function parseInteger(value: string, label: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) throw new Error(`${label} must be an integer: ${value}`);
  return parsed;
}

async function main(): Promise<number> {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage);
    return 0;
  }

  const directControl = { host: args.host, port: args.port, timeoutMs: args.timeoutMs };
  const inventory = await readRuntimeInventory(directControl);
  const preNativeRiverObjects = await readNativeRiverObjects(directControl);
  const preReadback =
    args.readFullGrid || args.confirmDisposableSession
      ? summarizeRiverMetadataReadback(
          await getCiv7FullMapGrid(
            {
              fields: ["terrain", "hydrology"],
              includeHidden: true,
              maxPlotsPerRead: args.maxPlotsPerRead,
            },
            directControl,
          ),
        )
      : undefined;

  if (!args.confirmDisposableSession) {
    const output = buildDryRunOutput({ inventory, preNativeRiverObjects, preReadback });
    writeOutput(args.output, output);
    console.log(JSON.stringify(output, null, 2));
    return 2;
  }

  const mutation = await callModelRiversSequence(
    {
      minLength: args.minLength,
      maxLength: args.maxLength,
      navigableTerrain: args.navigableTerrain,
    },
    directControl,
  );

  const postReadback = summarizeRiverMetadataReadback(
    await getCiv7FullMapGrid(
      {
        fields: ["terrain", "hydrology"],
        includeHidden: true,
        maxPlotsPerRead: args.maxPlotsPerRead,
      },
      directControl,
    ),
  );
  const postNativeRiverObjects = await readNativeRiverObjects(directControl);

  const output = buildMutationOutput({
    inventory,
    preNativeRiverObjects,
    preReadback,
    mutation,
    postNativeRiverObjects,
    postReadback,
  });
  writeOutput(args.output, output);
  console.log(JSON.stringify(output, null, 2));
  return output.ok ? 0 : 2;
}

export function buildDryRunOutput(args: {
  inventory: RiverModelingRuntimeInventory;
  preNativeRiverObjects?: NativeRiverObjectSummary;
  preReadback?: RiverMetadataReadbackSummary;
}): RiverModelingProbeOutput {
  const hasCandidate = args.inventory.terrainBuilder.modelRivers?.exists === true;
  return {
    ok: false,
    status: "dry-run",
    mutationAttempted: false,
    blockedBy: [
      "river-modeling-probe.confirm-disposable-session",
      ...(hasCandidate ? [] : ["river-modeling-probe.modelRivers.missing"]),
    ],
    evidenceBoundary:
      "Read-only unless --confirm-disposable-session is passed. A native TerrainBuilder.modelRivers sequence is not product authoring evidence until disposable runtime proof shows river metadata and MapRivers object changes on the same run.",
    inventory: args.inventory,
    preNativeRiverObjects: args.preNativeRiverObjects ?? null,
    preReadback: args.preReadback ?? null,
  };
}

export function buildMutationOutput(args: {
  inventory: RiverModelingRuntimeInventory;
  preNativeRiverObjects?: NativeRiverObjectSummary;
  preReadback: RiverMetadataReadbackSummary | undefined;
  mutation: RiverModelingMutationResult;
  postNativeRiverObjects?: NativeRiverObjectSummary;
  postReadback: RiverMetadataReadbackSummary;
}): RiverModelingProbeOutput {
  const pre = args.preReadback;
  const post = args.postReadback;
  const metadataChanged = pre
    ? pre.river !== post.river ||
      pre.navigableRiver !== post.navigableRiver ||
      pre.minorRiver !== post.minorRiver ||
      pre.noRiver !== post.noRiver
    : false;
  const terrainChanged = pre ? pre.terrainNavigableRiver !== post.terrainNavigableRiver : false;
  const nativeRiverObjectsChanged =
    typeof args.preNativeRiverObjects?.numRivers === "number" &&
    typeof args.postNativeRiverObjects?.numRivers === "number"
      ? args.preNativeRiverObjects.numRivers !== args.postNativeRiverObjects.numRivers
      : false;
  const nativeReadbackComplete =
    args.postNativeRiverObjects === undefined || args.postNativeRiverObjects.blockedBy.length === 0;
  const nativeEvidenceSatisfied =
    args.postNativeRiverObjects === undefined ||
    nativeRiverObjectsChanged ||
    (args.postNativeRiverObjects.numRivers ?? 0) > 0;
  const readbackComplete =
    post.missingFacts.length === 0 &&
    post.failedFacts.length === 0 &&
    (pre === undefined || (pre.missingFacts.length === 0 && pre.failedFacts.length === 0));
  const ok =
    args.mutation.ok &&
    metadataChanged &&
    readbackComplete &&
    nativeReadbackComplete &&
    nativeEvidenceSatisfied;

  return {
    ok,
    status: ok ? "writer-supported" : "unsupported-or-unproven",
    mutationAttempted: true,
    blockedBy: ok
      ? []
      : [
          ...(args.mutation.ok ? [] : ["river-modeling-probe.sequence.call-failed"]),
          ...(metadataChanged ? [] : ["river-modeling-probe.metadata-unchanged"]),
          ...(readbackComplete ? [] : ["river-modeling-probe.readback-incomplete"]),
          ...(nativeReadbackComplete ? [] : ["river-modeling-probe.native-river-readback-incomplete"]),
          ...(nativeEvidenceSatisfied ? [] : ["river-modeling-probe.native-river-objects-unchanged"]),
        ],
    evidenceBoundary:
      "This probe only tests the official TerrainBuilder.modelRivers sequence in the current disposable runtime session. Production use still requires source-integrated semantics and same-run Studio/Civ parity proof.",
    inventory: args.inventory,
    mutation: args.mutation,
    preNativeRiverObjects: args.preNativeRiverObjects ?? null,
    preReadback: pre ?? null,
    ...(args.postNativeRiverObjects === undefined
      ? {}
      : { postNativeRiverObjects: args.postNativeRiverObjects }),
    postReadback: post,
    deltas: pre
      ? {
          terrainNavigableRiver: post.terrainNavigableRiver - pre.terrainNavigableRiver,
          river: post.river - pre.river,
          navigableRiver: post.navigableRiver - pre.navigableRiver,
          minorRiver: post.minorRiver - pre.minorRiver,
          noRiver: post.noRiver - pre.noRiver,
          nativeRiverCount:
            typeof args.preNativeRiverObjects?.numRivers === "number" &&
            typeof args.postNativeRiverObjects?.numRivers === "number"
              ? args.postNativeRiverObjects.numRivers - args.preNativeRiverObjects.numRivers
              : null,
          terrainChanged,
          metadataChanged,
          nativeRiverObjectsChanged,
        }
      : null,
  };
}

async function readRuntimeInventory(options: Civ7DirectControlOptions): Promise<RiverModelingRuntimeInventory> {
  const result = await executeCiv7TunerCommand({
    ...options,
    command: buildRuntimeInventoryCommand(),
  });
  return jsonPayloadFromCommandResult<RiverModelingRuntimeInventory>(result, "river modeling runtime inventory");
}

async function readNativeRiverObjects(options: Civ7DirectControlOptions): Promise<NativeRiverObjectSummary> {
  return summarizeNativeRiverObjects(await getCiv7NativeRiverObjects({ maxSamples: 16 }, options));
}

function summarizeNativeRiverObjects(result: Civ7NativeRiverObjectsResult): NativeRiverObjectSummary {
  return {
    exists: result.exists,
    numRivers: probeNumberValue(result.numRivers),
    samples: result.samples.map((sample) => ({
      index: sample.index,
      riverType: probeNullableNumberValue(sample.riverType),
      plotCount: probeNullableNumberValue(sample.plotCount),
      connectedToOcean: probeNullableBooleanValue(sample.connectedToOcean),
    })),
    blockedBy: [
      ...(result.exists ? [] : ["native-river-objects.MapRivers.missing"]),
      ...(result.numRivers.ok ? [] : ["native-river-objects.numRivers.unavailable"]),
    ],
  };
}

function probeNumberValue(probe: Civ7RuntimeProbe<number> | undefined): number | null {
  if (!probe || probe.ok !== true || typeof probe.value !== "number" || !Number.isFinite(probe.value)) return null;
  return probe.value;
}

function probeNullableNumberValue(probe: Civ7RuntimeProbe<number | null> | undefined): number | null {
  if (!probe || probe.ok !== true || typeof probe.value !== "number" || !Number.isFinite(probe.value)) return null;
  return probe.value;
}

function probeNullableBooleanValue(probe: Civ7RuntimeProbe<boolean | null> | undefined): boolean | null {
  if (!probe || probe.ok !== true || typeof probe.value !== "boolean") return null;
  return probe.value;
}

async function callModelRiversSequence(
  input: Readonly<{ minLength: number; maxLength: number; navigableTerrain?: number }>,
  options: Civ7DirectControlOptions,
): Promise<RiverModelingMutationResult> {
  const result = await executeCiv7TunerCommand({
    ...options,
    command: buildModelRiversSequenceCommand(input),
  });
  return jsonPayloadFromCommandResult<RiverModelingMutationResult>(result, "modelRivers mutation probe");
}

function buildRuntimeInventoryCommand(): string {
  return `(() => {
    const inspectMethod = (owner, name) => {
      const method = owner && typeof owner[name] === "function"
        ? owner[name]
        : undefined;
      return method
        ? {
            exists: true,
            type: typeof method,
            length: method.length,
            signature: Function.prototype.toString.call(method).slice(0, 160),
          }
        : { exists: false, type: owner ? typeof owner[name] : "undefined" };
    };
    const inspect = (value) => ({
      exists: value !== undefined && value !== null,
      type: typeof value,
      ownKeys: value ? Object.getOwnPropertyNames(value).sort() : [],
      prototypeKeys: value ? Object.getOwnPropertyNames(Object.getPrototypeOf(value) ?? {}).sort() : [],
      modelRivers: inspectMethod(value, "modelRivers"),
      validateAndFixTerrain: inspectMethod(value, "validateAndFixTerrain"),
      defineNamedRivers: inspectMethod(value, "defineNamedRivers"),
      storeWaterData: inspectMethod(value, "storeWaterData"),
    });
    const terrain = typeof GameInfo !== "undefined" && GameInfo.Terrains
      ? GameInfo.Terrains.find((row) => row.TerrainType === "TERRAIN_NAVIGABLE_RIVER")
      : undefined;
    return JSON.stringify({
      terrainBuilder: inspect(typeof TerrainBuilder === "undefined" ? undefined : TerrainBuilder),
      mapRivers: inspect(typeof MapRivers === "undefined" ? undefined : MapRivers),
      riverTypes: typeof RiverTypes === "undefined" ? {} : {
        NO_RIVER: RiverTypes.NO_RIVER,
        RIVER_MINOR: RiverTypes.RIVER_MINOR,
        RIVER_NAVIGABLE: RiverTypes.RIVER_NAVIGABLE,
      },
      terrainNavigableRiver: terrain ? (typeof terrain.$index === "number" ? terrain.$index : terrain.Index ?? null) : null,
      officialPolicyDefaults: {
        minLength: ${OFFICIAL_DEFAULT_MIN_LENGTH},
        maxLength: ${OFFICIAL_DEFAULT_MAX_LENGTH},
      },
    });
  })()`;
}

function buildModelRiversSequenceCommand(input: Readonly<{ minLength: number; maxLength: number; navigableTerrain?: number }>): string {
  const navigableTerrainLiteral =
    typeof input.navigableTerrain === "number" ? String(input.navigableTerrain) : "undefined";
  return `(() => {
    const out = {
      attempted: false,
      ok: false,
      sequence: [],
      minLength: ${input.minLength},
      maxLength: ${input.maxLength},
    };
    try {
      if (typeof TerrainBuilder === "undefined" || typeof TerrainBuilder.modelRivers !== "function") {
        out.error = "TerrainBuilder.modelRivers unavailable";
        return JSON.stringify(out);
      }
      const terrainId = (() => {
        const explicit = ${navigableTerrainLiteral};
        if (typeof explicit === "number") return explicit;
        if (typeof GameInfo === "undefined" || !GameInfo.Terrains) return undefined;
        const row = GameInfo.Terrains.find((candidate) => candidate.TerrainType === "TERRAIN_NAVIGABLE_RIVER");
        if (!row) return undefined;
        return typeof row.$index === "number" ? row.$index : row.Index;
      })();
      if (!Number.isInteger(terrainId)) {
        out.error = "TERRAIN_NAVIGABLE_RIVER terrain id unavailable";
        return JSON.stringify(out);
      }
      out.navigableTerrain = terrainId;
      out.attempted = true;
      TerrainBuilder.modelRivers(out.minLength, out.maxLength, terrainId);
      out.sequence.push("modelRivers");
      if (typeof TerrainBuilder.validateAndFixTerrain === "function") {
        TerrainBuilder.validateAndFixTerrain();
        out.sequence.push("validateAndFixTerrain");
      }
      if (typeof TerrainBuilder.defineNamedRivers === "function") {
        TerrainBuilder.defineNamedRivers();
        out.sequence.push("defineNamedRivers");
      }
      if (typeof TerrainBuilder.storeWaterData === "function") {
        TerrainBuilder.storeWaterData();
        out.sequence.push("storeWaterData");
      }
      out.ok = true;
    } catch (error) {
      out.error = error instanceof Error ? error.message : String(error);
    }
    return JSON.stringify(out);
  })()`;
}

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

function writeOutput(path: string | undefined, output: unknown): void {
  if (!path) return;
  const absolute = resolve(path);
  mkdirSync(dirname(absolute), { recursive: true });
  writeFileSync(absolute, `${JSON.stringify(output, null, 2)}\n`);
}

if (import.meta.main) {
  main().then(
    (code) => process.exit(code),
    (error) => {
      console.error(error instanceof Error ? error.stack ?? error.message : String(error));
      process.exit(1);
    },
  );
}
