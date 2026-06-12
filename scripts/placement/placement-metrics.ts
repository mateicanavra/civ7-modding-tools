/**
 * Placement metrics runner (placement-realignment S0).
 *
 * Runs the standard recipe headlessly with the mock adapter over one or more
 * stable seeds and reports the E1/E2/E3 placement expectation metrics
 * (docs/projects/placement-realignment/expectations.md) plus the RDP step-1
 * metrics (E2.9). REPORTS only; never gates.
 *
 * Usage:
 *   bun scripts/placement/placement-metrics.ts [--seed 1337] [--seeds 5] \
 *     [--size standard|tiny|small|large|huge|WxH] [--players N] \
 *     [--studio-mapinfo] [--json out.json]
 *
 * Flags:
 *   --seed N          first seed (default 1337); additional seeds increment by 1
 *   --seeds N         number of seeds to run (default 1)
 *   --size S          named Civ7 size preset or explicit WxH (default standard = 84x54)
 *   --players N       intended total player count (default 8, split across hemispheres)
 *   --studio-mapinfo  reproduce the studio worker mapInfo defect:
 *                     PlayersLandmass1 = PlayersLandmass2 = players (E1.2 doubling probe)
 *   --json PATH       write { runs, aggregate } JSON to PATH
 *
 * Stdout is the aggregate JSON; per-run progress goes to stderr.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { getCiv7StandardMapSizePreset } from "../../packages/civ7-adapter/src/map-metadata.ts";

import {
  aggregatePlacementMetrics,
  runPlacementMetrics,
  type PlacementMetricsRun,
} from "../../mods/mod-swooper-maps/src/dev/diagnostics/placement-metrics.js";
import { parseArgs } from "../../mods/mod-swooper-maps/src/dev/diagnostics/shared.js";

function parseIntFlag(value: string | true | undefined, fallback: number): number {
  if (typeof value !== "string") return fallback;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
}

function parseSize(value: string | true | undefined): { width: number; height: number; label: string } {
  const raw = typeof value === "string" ? value.trim().toLowerCase() : "standard";
  const explicit = /^(\d+)x(\d+)$/.exec(raw);
  if (explicit) {
    return { width: Number(explicit[1]), height: Number(explicit[2]), label: raw };
  }
  const preset = getCiv7StandardMapSizePreset(`MAPSIZE_${raw.toUpperCase()}`);
  if (!preset) {
    throw new Error(`Unknown --size "${raw}". Use tiny|small|standard|large|huge or WxH.`);
  }
  return { ...preset.dimensions, label: raw };
}

function main(): void {
  const { flags } = parseArgs(process.argv.slice(2));
  const firstSeed = parseIntFlag(flags.seed, 1337);
  const seedCount = Math.max(1, parseIntFlag(flags.seeds, 1));
  const size = parseSize(flags.size);
  const players = Math.max(1, parseIntFlag(flags.players, 8));
  const studioMapInfo = flags["studio-mapinfo"] === true;

  const playersLandmass1 = studioMapInfo ? players : Math.ceil(players / 2);
  const playersLandmass2 = studioMapInfo ? players : Math.floor(players / 2);

  const runs: PlacementMetricsRun[] = [];
  for (let i = 0; i < seedCount; i++) {
    const seed = firstSeed + i;
    process.stderr.write(
      `[placement-metrics] run ${i + 1}/${seedCount} seed=${seed} size=${size.label} (${size.width}x${size.height}) ` +
        `players=${players} mapInfo=(${playersLandmass1},${playersLandmass2})${studioMapInfo ? " [studio-mapinfo]" : ""}\n`
    );
    // Keep stdout reserved for the aggregate JSON; pipeline runtime logs
    // (e.g. [SWOOPER_MOD] telemetry lines) are redirected to stderr.
    const originalLog = console.log;
    console.log = (...logArgs: unknown[]) => {
      process.stderr.write(`${logArgs.map((entry) => String(entry)).join(" ")}\n`);
    };
    try {
      runs.push(
        runPlacementMetrics({
          seed,
          width: size.width,
          height: size.height,
          playersLandmass1,
          playersLandmass2,
          intendedPlayerCount: players,
          label: studioMapInfo ? "studio-mapinfo" : "baseline",
        })
      );
    } finally {
      console.log = originalLog;
    }
  }

  const aggregate = aggregatePlacementMetrics(runs);

  if (typeof flags.json === "string") {
    const outPath = resolve(process.cwd(), flags.json);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, `${JSON.stringify({ runs, aggregate }, null, 2)}\n`);
    process.stderr.write(`[placement-metrics] wrote ${outPath}\n`);
  }

  console.log(JSON.stringify(aggregate, null, 2));
}

main();
