import { createMockAdapter } from "@civ7/adapter";
import { admitMapSetup, createMapContext, type StepFacetSinks } from "@swooper/mapgen-core";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";

import standardRecipe, { type StandardRecipeConfig } from "../../src/recipes/standard/recipe.js";
import { initializeStandardRuntime } from "../../src/recipes/standard/runtime.js";
import { artifacts as ecologyArtifacts } from "../../src/recipes/standard/stages/ecology/artifacts/index.js";

import { standardConfig } from "./standard-config.js";
import { computeArtifactFingerprints } from "./validation-harness.js";

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

const VIZ_KEY_PREFIXES = ["ecology.", "map.ecology."] as const;

type VizKeyEntry = Readonly<{ dataTypeKey: string; spaceId: string; kind: string }>;

function createVizKeyCollector(): {
  sink: NonNullable<StepFacetSinks["viz"]>;
  entries: VizKeyEntry[];
} {
  const entries: VizKeyEntry[] = [];
  const sink: NonNullable<StepFacetSinks["viz"]> = (projections) => {
    for (const projection of projections) {
      entries.push({
        dataTypeKey: projection.dataTypeKey,
        spaceId: projection.spaceId,
        kind: projection.kind,
      });
    }
  };
  return { sink, entries };
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

  const setupBase = {
    mapSeed: seed,
    dimensions: { width, height },
    latitudeBounds: { topLatitude: mapInfo.MaxLatitude, bottomLatitude: mapInfo.MinLatitude },
  } as const;

  const setup = admitMapSetup(setupBase);

  const adapter = createMockAdapter({
    width,
    height,
    mapInfo,
    mapSizeId: 1,
    rng: createLabelRng(seed),
  });

  const context = createMapContext({ setup, adapter });
  const { sink, entries } = createVizKeyCollector();

  initializeStandardRuntime(context, {
    mapInfo,
    logPrefix: "[ecology-baseline]",
  });

  standardRecipe.run(context, config, {
    facets: { viz: sink },
    log: () => {},
  });

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
