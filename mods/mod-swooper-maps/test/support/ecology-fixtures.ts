import { createMockAdapter } from "@civ7/adapter";
import { createExtendedMapContext, type TraceSink, type TraceScope, type VizDumper } from "@swooper/mapgen-core";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";

import standardRecipe, { type StandardRecipeConfig } from "../../src/recipes/standard/recipe.js";
import { initializeStandardRuntime } from "../../src/recipes/standard/runtime.js";
import { ecologyArtifacts } from "../../src/recipes/standard/stages/ecology/artifacts.js";

import { standardConfig } from "./standard-config.js";
import { computeArtifactFingerprints } from "./validation-harness.js";

const NOOP_TRACE_SINK: TraceSink = { emit: () => undefined };

export const ECOLOGY_TIER1_ARTIFACT_IDS = [
  ecologyArtifacts.pedology.id,
  ecologyArtifacts.resourceBasins.id,
  ecologyArtifacts.biomeClassification.id,
  ecologyArtifacts.scoreLayers.id,
  ecologyArtifacts.occupancyBase.id,
  ecologyArtifacts.occupancyIce.id,
  ecologyArtifacts.occupancyReefs.id,
  ecologyArtifacts.occupancyWetlands.id,
  ecologyArtifacts.occupancyVegetation.id,
  ecologyArtifacts.featureIntentsVegetation.id,
  ecologyArtifacts.featureIntentsWetlands.id,
  ecologyArtifacts.featureIntentsReefs.id,
  ecologyArtifacts.featureIntentsIce.id,
] as const;

const VIZ_KEY_PREFIXES = ["ecology.", "map.ecology.", "debug.heightfield."] as const;

type VizKeyEntry = Readonly<{ dataTypeKey: string; spaceId: string; kind: string }>;

function createVizKeyCollector(): { viz: VizDumper; entries: VizKeyEntry[] } {
  const entries: VizKeyEntry[] = [];

  const push = (trace: TraceScope, entry: VizKeyEntry): void => {
    if (!trace.isVerbose) return;
    entries.push(entry);
  };

  const viz: VizDumper = {
    outputRoot: "memory://viz-key-collector",
    dumpGrid: (trace, layer) => push(trace, { dataTypeKey: layer.dataTypeKey, spaceId: layer.spaceId, kind: "grid" }),
    dumpPoints: (trace, layer) =>
      push(trace, { dataTypeKey: layer.dataTypeKey, spaceId: layer.spaceId, kind: "points" }),
    dumpSegments: (trace, layer) =>
      push(trace, { dataTypeKey: layer.dataTypeKey, spaceId: layer.spaceId, kind: "segments" }),
    dumpGridFields: (trace, layer) =>
      push(trace, { dataTypeKey: layer.dataTypeKey, spaceId: layer.spaceId, kind: "gridFields" }),
  };

  return { viz, entries };
}

function listVizKeys(entries: readonly VizKeyEntry[]): string[] {
  const out = new Set<string>();
  for (const entry of entries) {
    if (!VIZ_KEY_PREFIXES.some((prefix) => entry.dataTypeKey.startsWith(prefix))) continue;
    out.add(`${entry.dataTypeKey}|${entry.spaceId}|${entry.kind}`);
  }
  return Array.from(out).sort((a, b) => a.localeCompare(b));
}

export type EcologyFixtureBaselineV1 = Readonly<{
  version: 1;
  case: Readonly<{ seed: number; width: number; height: number }>;
  artifacts: Readonly<Record<(typeof ECOLOGY_TIER1_ARTIFACT_IDS)[number], string>>;
  vizKeys: readonly string[];
}>;

export function computeEcologyBaselineV1(input?: {
  seed?: number;
  width?: number;
  height?: number;
  config?: StandardRecipeConfig;
}): EcologyFixtureBaselineV1 {
  const seed = input?.seed ?? 1337;
  const width = input?.width ?? 32;
  const height = input?.height ?? 20;
  const config = input?.config ?? standardConfig;

  const mapInfo = {
    GridWidth: width,
    GridHeight: height,
    MinLatitude: -60,
    MaxLatitude: 60,
    PlayersLandmass1: 4,
    PlayersLandmass2: 4,
    StartSectorRows: 4,
    StartSectorCols: 4,
  } as const;

  const envBase = {
    seed,
    dimensions: { width, height },
    latitudeBounds: { topLatitude: mapInfo.MaxLatitude, bottomLatitude: mapInfo.MinLatitude },
  } as const;

  // Enable verbose tracing for every step so viz dumps are captured deterministically.
  const plan = standardRecipe.compile(envBase, config);
  const verboseSteps = Object.fromEntries(plan.nodes.map((node: any) => [node.stepId, "verbose"] as const));
  const env = { ...envBase, trace: { enabled: true, steps: verboseSteps } } as const;

  const adapter = createMockAdapter({
    width,
    height,
    mapInfo,
    mapSizeId: 1,
    rng: createLabelRng(seed),
  });

  const context = createExtendedMapContext({ width, height }, adapter, env);
  const { viz, entries } = createVizKeyCollector();
  context.viz = viz;

  initializeStandardRuntime(context, { mapInfo, logPrefix: "[ecology-baseline]", storyEnabled: true });

  standardRecipe.run(context, env, config, { traceSink: NOOP_TRACE_SINK, log: () => {} });

  const report = computeArtifactFingerprints(context, ECOLOGY_TIER1_ARTIFACT_IDS);
  if (report.missing.length > 0) {
    throw new Error(`Missing expected ecology artifacts: ${report.missing.join(", ")}`);
  }

  const artifacts = Object.fromEntries(
    ECOLOGY_TIER1_ARTIFACT_IDS.map((id) => {
      const entry = report.artifacts[id];
      const fp = entry?.fingerprint;
      if (!fp) throw new Error(`Missing fingerprint for artifact "${id}".`);
      return [id, fp] as const;
    })
  ) as EcologyFixtureBaselineV1["artifacts"];

  return {
    version: 1,
    case: { seed, width, height },
    artifacts,
    vizKeys: listVizKeys(entries),
  };
}
