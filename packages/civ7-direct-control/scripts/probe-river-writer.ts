#!/usr/bin/env bun

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import {
  CIV7_BROWSER_TABLES_V0,
  NO_RIVER_TYPE,
  RIVER_TYPE_MINOR,
  RIVER_TYPE_NAVIGABLE,
} from "@civ7/map-policy";
import {
  type Civ7CommandResult,
  type Civ7DirectControlOptions,
  type Civ7FullMapGridResult,
  type Civ7RuntimeProbe,
  executeCiv7TunerCommand,
  getCiv7FullMapGrid,
} from "../src/index.js";

type Args = Readonly<{
  host?: string;
  port?: number;
  timeoutMs: number;
  maxPlotsPerRead: number;
  readFullGrid: boolean;
  confirmDisposableSession: boolean;
  output?: string;
  help: boolean;
}>;

export type RiverWriterRuntimeInventory = Readonly<{
  terrainBuilder: RuntimeObjectInventory;
  mapRivers: RuntimeObjectInventory;
  riverTypes: Readonly<Record<string, unknown>>;
  terrainNavigableRiver: number;
}>;

type RuntimeObjectInventory = Readonly<{
  exists: boolean;
  type: string;
  ownKeys: ReadonlyArray<string>;
  prototypeKeys: ReadonlyArray<string>;
  setRiverValidationValues?: RuntimeMethodInventory;
}>;

type RuntimeMethodInventory = Readonly<{
  exists: boolean;
  type: string;
  length?: number;
  signature?: string;
}>;

export type RiverMetadataReadbackSummary = Readonly<{
  plotCount: number;
  omitted: number;
  terrainNavigableRiver: number;
  river: number;
  navigableRiver: number;
  minorRiver: number;
  noRiver: number;
  missingFacts: ReadonlyArray<string>;
  failedFacts: ReadonlyArray<string>;
}>;

type RiverWriterMutationResult = Readonly<{
  attempted: boolean;
  ok: boolean;
  returnedType?: string;
  returnedValue?: unknown;
  error?: string;
}>;

const usage = `Usage:
  bun packages/civ7-direct-control/scripts/probe-river-writer.ts
  bun packages/civ7-direct-control/scripts/probe-river-writer.ts --read-full-grid
  bun packages/civ7-direct-control/scripts/probe-river-writer.ts --confirm-disposable-session --read-full-grid

Options:
  --host <host>                    Civ7 tuner host
  --port <port>                    Civ7 tuner port
  --timeout-ms <ms>                Direct-control timeout (default: 45000)
  --max-plots-per-read <n>         Direct-control tile size cap (default: 512)
  --read-full-grid                 Include full-grid terrain/river metadata counts
  --confirm-disposable-session     Allow one call to TerrainBuilder.setRiverValidationValues()
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
    output?: string;
    help: boolean;
  } = {
    timeoutMs: 45_000,
    maxPlotsPerRead: 512,
    readFullGrid: false,
    confirmDisposableSession: false,
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
  const inventory = await readRiverWriterRuntimeInventory(directControl);
  const preReadback =
    args.readFullGrid || args.confirmDisposableSession
      ? summarizeRiverMetadataReadback(
          await getCiv7FullMapGrid(
            {
              fields: ["terrain", "hydrology"],
              includeHidden: true,
              maxPlotsPerRead: args.maxPlotsPerRead,
            },
            directControl
          )
        )
      : undefined;

  if (!args.confirmDisposableSession) {
    const output = buildDryRunOutput({ inventory, preReadback });
    writeOutput(args.output, output);
    console.log(JSON.stringify(output, null, 2));
    return 2;
  }

  const mutation = await callSetRiverValidationValues(directControl);
  const postReadback = summarizeRiverMetadataReadback(
    await getCiv7FullMapGrid(
      {
        fields: ["terrain", "hydrology"],
        includeHidden: true,
        maxPlotsPerRead: args.maxPlotsPerRead,
      },
      directControl
    )
  );
  const output = buildMutationOutput({ inventory, preReadback, mutation, postReadback });
  writeOutput(args.output, output);
  console.log(JSON.stringify(output, null, 2));
  return output.ok ? 0 : 2;
}

export function summarizeRiverMetadataReadback(
  grid: Civ7FullMapGridResult
): RiverMetadataReadbackSummary {
  const terrainNavigableRiverType =
    CIV7_BROWSER_TABLES_V0.terrainTypeIndices.TERRAIN_NAVIGABLE_RIVER;
  let terrainNavigableRiver = 0;
  let river = 0;
  let navigableRiver = 0;
  let minorRiver = 0;
  let noRiver = 0;
  const missingFacts: string[] = [];
  const failedFacts: string[] = [];

  for (const plot of grid.plots) {
    const terrain = factValue<number>(plot.facts.terrain, "terrain", missingFacts, failedFacts);
    const riverType = factValue<number>(
      plot.facts.riverType,
      "riverType",
      missingFacts,
      failedFacts
    );
    const isRiver = factValue<boolean>(plot.facts.river, "river", missingFacts, failedFacts);
    const isNavigableRiver = factValue<boolean>(
      plot.facts.navigableRiver,
      "navigableRiver",
      missingFacts,
      failedFacts
    );

    if (terrain === terrainNavigableRiverType) terrainNavigableRiver += 1;
    if (riverType === NO_RIVER_TYPE) noRiver += 1;
    if (riverType === RIVER_TYPE_MINOR) minorRiver += 1;
    if (riverType === RIVER_TYPE_NAVIGABLE || isNavigableRiver === true) navigableRiver += 1;
    if (isRiver === true) river += 1;
  }

  return {
    plotCount: grid.plotCount,
    omitted: grid.omitted,
    terrainNavigableRiver,
    river,
    navigableRiver,
    minorRiver,
    noRiver,
    missingFacts: [...new Set(missingFacts)].sort((left, right) => left.localeCompare(right)),
    failedFacts: [...new Set(failedFacts)].sort((left, right) => left.localeCompare(right)),
  };
}

function factValue<T>(
  probe: Civ7RuntimeProbe<unknown> | undefined,
  field: string,
  missingFacts: string[],
  failedFacts: string[]
): T | undefined {
  if (!probe) {
    missingFacts.push(field);
    return undefined;
  }
  if (probe.ok !== true || probe.value === undefined) {
    failedFacts.push(field);
    return undefined;
  }
  return probe.value as T;
}

export function buildDryRunOutput(args: {
  inventory: RiverWriterRuntimeInventory;
  preReadback?: RiverMetadataReadbackSummary;
}) {
  const hasCandidate = args.inventory.terrainBuilder.setRiverValidationValues?.exists === true;
  const blockedBy = [
    "river-writer-probe.confirm-disposable-session",
    ...(hasCandidate ? [] : ["river-writer-probe.setRiverValidationValues.missing"]),
  ];
  return {
    ok: false,
    status: "dry-run" as const,
    mutationAttempted: false,
    blockedBy,
    evidenceBoundary:
      "Read-only unless --confirm-disposable-session is passed. A native TerrainBuilder hook is not production authoring evidence until a disposable runtime proof shows river metadata changes and same-run parity can read them back.",
    inventory: args.inventory,
    preReadback: args.preReadback ?? null,
  };
}

export function buildMutationOutput(args: {
  inventory: RiverWriterRuntimeInventory;
  preReadback: RiverMetadataReadbackSummary | undefined;
  mutation: RiverWriterMutationResult;
  postReadback: RiverMetadataReadbackSummary;
}) {
  const pre = args.preReadback;
  const post = args.postReadback;
  const metadataChanged = pre
    ? pre.river !== post.river ||
      pre.navigableRiver !== post.navigableRiver ||
      pre.minorRiver !== post.minorRiver ||
      pre.noRiver !== post.noRiver
    : false;
  const terrainChanged = pre ? pre.terrainNavigableRiver !== post.terrainNavigableRiver : false;
  const readbackComplete =
    post.missingFacts.length === 0 &&
    post.failedFacts.length === 0 &&
    (pre === undefined || (pre.missingFacts.length === 0 && pre.failedFacts.length === 0));
  const ok = args.mutation.ok && metadataChanged && readbackComplete;
  return {
    ok,
    status: ok ? ("writer-supported" as const) : ("unsupported-or-unproven" as const),
    mutationAttempted: true,
    blockedBy: ok
      ? []
      : [
          ...(args.mutation.ok ? [] : ["river-writer-probe.setRiverValidationValues.call-failed"]),
          ...(metadataChanged ? [] : ["river-writer-probe.metadata-unchanged"]),
          ...(readbackComplete ? [] : ["river-writer-probe.readback-incomplete"]),
        ],
    evidenceBoundary:
      "This probe only tests TerrainBuilder.setRiverValidationValues in the current disposable runtime session. Production use still requires source-integrated adapter semantics and same-run Studio/Civ parity proof.",
    inventory: args.inventory,
    mutation: args.mutation,
    preReadback: pre ?? null,
    postReadback: post,
    deltas: pre
      ? {
          terrainNavigableRiver: post.terrainNavigableRiver - pre.terrainNavigableRiver,
          river: post.river - pre.river,
          navigableRiver: post.navigableRiver - pre.navigableRiver,
          minorRiver: post.minorRiver - pre.minorRiver,
          noRiver: post.noRiver - pre.noRiver,
          terrainChanged,
          metadataChanged,
        }
      : null,
  };
}

async function readRiverWriterRuntimeInventory(
  options: Civ7DirectControlOptions
): Promise<RiverWriterRuntimeInventory> {
  const result = await executeCiv7TunerCommand({
    ...options,
    command: buildRuntimeInventoryCommand(),
  });
  return jsonPayloadFromCommandResult<RiverWriterRuntimeInventory>(
    result,
    "river writer runtime inventory"
  );
}

async function callSetRiverValidationValues(
  options: Civ7DirectControlOptions
): Promise<RiverWriterMutationResult> {
  const result = await executeCiv7TunerCommand({
    ...options,
    command: buildSetRiverValidationValuesCommand(),
  });
  return jsonPayloadFromCommandResult<RiverWriterMutationResult>(
    result,
    "setRiverValidationValues mutation probe"
  );
}

function buildRuntimeInventoryCommand(): string {
  return `(() => {
    const inspect = (value) => {
      const ownKeys = value ? Object.getOwnPropertyNames(value).sort() : [];
      const prototype = value ? Object.getPrototypeOf(value) : undefined;
      const prototypeKeys = prototype ? Object.getOwnPropertyNames(prototype).sort() : [];
      const method = value && typeof value.setRiverValidationValues === "function"
        ? {
            exists: true,
            type: typeof value.setRiverValidationValues,
            length: value.setRiverValidationValues.length,
            signature: Function.prototype.toString.call(value.setRiverValidationValues).slice(0, 160),
          }
        : { exists: false, type: value ? typeof value.setRiverValidationValues : "undefined" };
      return {
        exists: value !== undefined && value !== null,
        type: typeof value,
        ownKeys,
        prototypeKeys,
        setRiverValidationValues: method,
      };
    };
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
      terrainNavigableRiver: terrain ? terrain.$index : null,
    });
  })()`;
}

function buildSetRiverValidationValuesCommand(): string {
  return `(() => {
    const out = { attempted: false, ok: false };
    try {
      if (typeof TerrainBuilder === "undefined" || typeof TerrainBuilder.setRiverValidationValues !== "function") {
        out.error = "TerrainBuilder.setRiverValidationValues unavailable";
        return JSON.stringify(out);
      }
      out.attempted = true;
      const value = TerrainBuilder.setRiverValidationValues();
      out.ok = true;
      out.returnedType = typeof value;
      if (value === null || ["number", "string", "boolean"].includes(typeof value)) out.returnedValue = value;
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
      console.error(error instanceof Error ? (error.stack ?? error.message) : String(error));
      process.exit(1);
    }
  );
}
