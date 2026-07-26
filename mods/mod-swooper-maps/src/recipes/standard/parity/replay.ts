/// <reference types="@civ7/types" />

import {
  type Civ7StandardMapSizeId,
  createMockAdapter,
  type EngineAdapter,
  getCiv7StandardMapSizePreset,
} from "@civ7/adapter";
import { artifacts as hydrographyArtifacts } from "@mapgen/domain/hydrology/modules/hydrography/artifacts/index.js";
import { artifacts as placementWonderArtifacts } from "@mapgen/domain/placement/modules/wonders/artifacts/index.js";
import { artifacts as resourceSiteArtifacts } from "@mapgen/domain/resources/modules/sites/artifacts/index.js";
import { artifacts as resourceSupportArtifacts } from "@mapgen/domain/resources/modules/support/artifacts/index.js";
import { createLabelRng, createMapContext } from "@swooper/mapgen-core";
import {
  type Artifact,
  type ArtifactReadValueOf,
  observeValidatedArtifact,
} from "@swooper/mapgen-core/authoring";
import { fnv1a32StringHex } from "@swooper/mapgen-core/lib/hash";
import { Value } from "typebox/value";
import {
  canonicalRecipeConfig,
  type StandardMapConfigEnvelope,
} from "../../../maps/configs/canonical.js";
import {
  type StandardFeatureProjectionMeasurements,
  StandardFeatureProjectionMeasurementsSchema,
} from "../metrics/families/ecology-projection.js";
import {
  type StandardLakeProjectionMeasurements,
  StandardLakeProjectionMeasurementsSchema,
} from "../metrics/families/hydrology/lake-projection.js";
import {
  STANDARD_NATURAL_WONDER_PLAN_INPUT_METRIC_KEY,
  type StandardNaturalWonderPlanInputMeasurements,
  StandardNaturalWonderPlanInputMeasurementsSchema,
} from "../metrics/families/placement/natural-wonder-plan-input.js";
import {
  type StandardPlacementSurfaceMeasurements,
  StandardPlacementSurfaceMeasurementsSchema,
} from "../metrics/families/placement-surface.js";
import standardRecipe from "../recipe.js";
import type {
  StandardFinalSurfaceCapture,
  StandardLocalParityCapture,
  StandardNaturalWonderPlanEvidence,
  StandardParityGrid,
  StandardRiverProjectionCapture,
} from "./types.js";

/** Latitude bounds frozen into the launch envelope and reused by deterministic replay. */
type StandardParityMapEnvelopeBounds = Readonly<{
  topLatitude: number;
  bottomLatitude: number;
}>;

/** Fully correlated immutable inputs required to replay one Standard generation. */
type StandardParityReplayInput = Readonly<{
  mapSize: Civ7StandardMapSizeId;
  mapSeed: number;
  gameSeed: number;
  playerCount: number;
  config: StandardMapConfigEnvelope;
  canonicalConfigDigest: string;
  launchEnvelopeDigest: string;
  mapEnvelopeBounds: StandardParityMapEnvelopeBounds;
}>;

declare const STANDARD_PARITY_REPLAY_AUTHORITY: unique symbol;

/**
 * Opaque authority issued only after exact authorship and the generation
 * manifest have been correlated into one immutable replay request.
 */
export type StandardParityReplayAuthority = Readonly<{
  [STANDARD_PARITY_REPLAY_AUTHORITY]: true;
}>;

const replayInputs = new WeakMap<StandardParityReplayAuthority, StandardParityReplayInput>();

function observeArtifact<A extends Artifact>(
  context: ReturnType<typeof createMapContext>,
  artifact: A
): ArtifactReadValueOf<A> {
  const observation = observeValidatedArtifact(context, artifact);
  if (!observation.found) {
    throw new Error(`Standard parity replay did not publish required artifact "${artifact.id}".`);
  }
  return observation.value;
}

/**
 * Resolves replay metadata only from a real Civ7 preset and the frozen launch envelope.
 * Runtime dimensions may confirm a preset; they can never synthesize one.
 */
function createStandardParityReplayMetadata(
  input: Pick<StandardParityReplayInput, "mapSize" | "mapEnvelopeBounds" | "playerCount">
) {
  const preset = getCiv7StandardMapSizePreset(input.mapSize);
  if (!Number.isInteger(input.playerCount) || input.playerCount < 1) {
    throw new Error(
      `Standard parity replay requires a positive frozen player count, received ${String(input.playerCount)}.`
    );
  }
  return {
    latitudeBounds: input.mapEnvelopeBounds,
    dimensions: preset.dimensions,
    mapInfo: preset.mapInfo,
    mapSizeId: preset.id,
    playerCount: input.playerCount,
  } as const;
}

/**
 * Replays one admitted Standard launch through the real recipe and closes over
 * only evidence consumed by Standard parity product comparisons.
 */
function runStandardParityReplay(input: StandardParityReplayInput): StandardLocalParityCapture {
  const metadata = createStandardParityReplayMetadata(input);
  const { width, height } = metadata.dimensions;
  const setupBase = {
    mapSeed: input.mapSeed,
    dimensions: metadata.dimensions,
    latitudeBounds: metadata.latitudeBounds,
  } as const;
  const plan = standardRecipe.compile(setupBase, canonicalRecipeConfig(input.config));
  const adapter = createMockAdapter({
    width,
    height,
    mapInfo: metadata.mapInfo,
    mapSizeId: metadata.mapSizeId,
    aliveMajorCount: metadata.playerCount,
    rng: createLabelRng(input.mapSeed),
  });
  const context = createMapContext({ setup: plan.setup, adapter });
  let featureProjection: StandardFeatureProjectionMeasurements | undefined;
  let lakeProjection: StandardLakeProjectionMeasurements | undefined;
  let naturalWonderPlanInput: StandardNaturalWonderPlanInputMeasurements | undefined;
  let placementSurface: StandardPlacementSurfaceMeasurements | undefined;
  let metricFailure: unknown;

  standardRecipe.execute(context, plan, {
    log: () => {},
    facets: {
      metrics: (projection) => {
        const featureCandidate = projection["ecology.featureProjection"];
        if (featureCandidate !== undefined) {
          featureProjection = Value.Parse(
            StandardFeatureProjectionMeasurementsSchema,
            featureCandidate
          );
        }
        const lakeCandidate = projection["map.hydrology.lakeProjection"];
        if (lakeCandidate !== undefined) {
          lakeProjection = Value.Parse(StandardLakeProjectionMeasurementsSchema, lakeCandidate);
        }
        const naturalWonderInputCandidate =
          projection[STANDARD_NATURAL_WONDER_PLAN_INPUT_METRIC_KEY];
        if (naturalWonderInputCandidate !== undefined) {
          naturalWonderPlanInput = Value.Parse(
            StandardNaturalWonderPlanInputMeasurementsSchema,
            naturalWonderInputCandidate
          );
        }
        const placementCandidate = projection["placement.surfacePreparation"];
        if (placementCandidate !== undefined) {
          placementSurface = Value.Parse(
            StandardPlacementSurfaceMeasurementsSchema,
            placementCandidate
          );
        }
      },
      onError: ({ facet, error }) => {
        if (facet === "metrics") metricFailure = error;
      },
    },
  });
  if (metricFailure !== undefined) throw metricFailure;
  if (featureProjection === undefined) {
    throw new Error("Standard parity replay requires Ecology feature-projection measurements.");
  }
  if (lakeProjection === undefined) {
    throw new Error("Standard parity replay requires Hydrology lake-projection measurements.");
  }
  if (naturalWonderPlanInput === undefined) {
    throw new Error(
      "Standard parity replay requires typed natural-wonder planning-input measurements."
    );
  }
  if (placementSurface === undefined) {
    throw new Error("Standard parity replay requires Placement surface-preparation measurements.");
  }

  const naturalWonderPlan = observeArtifact(context, placementWonderArtifacts.naturalWonderPlan);
  const resourcePlan = observeArtifact(context, resourceSupportArtifacts.resourcePlanAdjusted);
  const resourcePlacement = observeArtifact(
    context,
    resourceSiteArtifacts.resourcePlacementOutcomes
  );

  return {
    source: "standard-replay",
    identity: {
      mapSeed: input.mapSeed,
      gameSeed: input.gameSeed,
      mapSize: input.mapSize,
      playerCount: input.playerCount,
      canonicalConfigDigest: input.canonicalConfigDigest,
      launchEnvelopeDigest: input.launchEnvelopeDigest,
    },
    surface: captureFinalSurface(adapter, metadata.dimensions),
    hydrology: {
      rivers: captureRiverProjection(context, adapter, metadata.dimensions),
      lakeProjection,
      finalLakes: {
        acceptedLakeTileCount: placementSurface.acceptedLakeTileCount,
        finalLakeWaterDriftCount: placementSurface.finalLakeWaterDriftCount,
        finalLakeClassificationDriftCount: placementSurface.finalLakeClassificationDriftCount,
      },
      featureProjection,
    },
    placement: {
      naturalWonderPlanEvidence: naturalWonderPlanEvidence(naturalWonderPlan),
      naturalWonderPlanInput: { status: "present", value: naturalWonderPlanInput },
      resourcePlanIntents: resourcePlan.intents,
      resourcePlacement: {
        coordinateEvidence: resourcePlacement.summary.coordinateEvidence,
        outcomes: resourcePlacement.outcomes,
      },
    },
  };
}

/**
 * Seals one already-correlated replay request behind an opaque capability.
 *
 * This is an internal parity-module handoff; the public recipe surface exports
 * only the resolver and the authority-consuming replay command.
 */
export function issueStandardParityReplayAuthority(
  input: StandardParityReplayInput
): StandardParityReplayAuthority {
  const authority = Object.freeze({}) as StandardParityReplayAuthority;
  replayInputs.set(authority, input);
  return authority;
}

/** Executes the immutable replay request retained by one admitted authority. */
export function runStandardParityReplayAuthority(
  authority: StandardParityReplayAuthority
): StandardLocalParityCapture {
  const input = replayInputs.get(authority);
  if (input === undefined) {
    throw new Error("Standard parity replay requires an authority issued by correlation.");
  }
  return runStandardParityReplay(input);
}

function captureFinalSurface(
  adapter: ReturnType<typeof createMockAdapter>,
  dimensions: Readonly<{ width: number; height: number }>
): StandardFinalSurfaceCapture {
  const { width, height } = dimensions;
  const size = width * height;
  const terrain = new Array<number>(size);
  const biome = new Array<number>(size);
  const feature = new Array<number>(size);
  const resource = new Array<number>(size);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = y * width + x;
      terrain[index] = adapter.getTerrainType(x, y) | 0;
      biome[index] = adapter.getBiomeType(x, y) | 0;
      feature[index] = adapter.getFeatureType(x, y) | 0;
      resource[index] = adapter.getResourceType(x, y) | 0;
    }
  }
  return {
    dimensions,
    grids: {
      terrain: { width, height, values: terrain },
      biome: { width, height, values: biome },
      feature: { width, height, values: feature },
      resource: { width, height, values: resource },
    },
  };
}

function captureRiverProjection(
  context: ReturnType<typeof createMapContext>,
  adapter: Pick<EngineAdapter, "readRiverProjection">,
  dimensions: Readonly<{ width: number; height: number }>
): StandardRiverProjectionCapture {
  const projected = observeArtifact(context, hydrographyArtifacts.projectedNavigableRivers);
  const { width, height } = dimensions;
  const size = width * height;
  const readback = adapter.readRiverProjection(width, height, projected.riverMask);
  const unsupportedReason = nonEmptyString(readback.minorRiverUnsupportedReason);
  return {
    plannedMinor: requiredGrid(
      width,
      height,
      projected.plannedMinorRiverMask,
      size,
      "planned minor rivers"
    ),
    plannedMajor: requiredGrid(
      width,
      height,
      projected.plannedMajorRiverMask,
      size,
      "planned major rivers"
    ),
    projectedNavigableTerrain: requiredGrid(
      width,
      height,
      projected.riverMask,
      size,
      "projected navigable terrain"
    ),
    minorRiverStamping:
      readback.minorRiverStampingSupported === true
        ? { status: "supported" }
        : readback.minorRiverStampingSupported === false && unsupportedReason !== undefined
          ? { status: "unsupported", reason: unsupportedReason }
          : {
              status: "unresolved",
              reason:
                unsupportedReason ??
                "The adapter did not identify whether native minor-river stamping is supported.",
            },
  };
}

function naturalWonderPlanEvidence(
  plan: ArtifactReadValueOf<typeof placementWonderArtifacts.naturalWonderPlan>
): StandardNaturalWonderPlanEvidence {
  const rows = plan.placements.slice(0, 16).map((placement) => {
    const plotIndex = placement.plotIndex | 0;
    const y = (plotIndex / plan.width) | 0;
    const x = plotIndex - y * plan.width;
    return {
      plotIndex,
      x,
      y,
      featureType: placement.featureType | 0,
      direction: placement.direction | 0,
      elevation: normalizeInteger(placement.elevation),
      priorityPpm: normalizeOptionalPpm(placement.priority),
    };
  });
  return {
    version: 1,
    plannedCount: Math.max(0, plan.plannedCount | 0),
    coordinateDigest: {
      count: rows.length,
      hash32: fnv1a32StringHex(
        rows
          .slice()
          .sort((left, right) => {
            if (left.plotIndex !== right.plotIndex) {
              return left.plotIndex - right.plotIndex;
            }
            if (left.featureType !== right.featureType) {
              return left.featureType - right.featureType;
            }
            return left.direction - right.direction;
          })
          .map((row) =>
            [
              "p",
              row.plotIndex,
              row.x,
              row.y,
              row.featureType,
              row.direction,
              row.elevation,
              row.priorityPpm,
            ].join(":")
          )
          .join("|")
      ),
    },
    rows,
  };
}

function requiredGrid(
  width: number,
  height: number,
  value: ArrayLike<number>,
  expectedLength: number,
  label: string
): StandardParityGrid {
  if (value.length !== expectedLength) {
    throw new Error(
      `Standard parity replay ${label} length ${value.length} does not match ${width}x${height}.`
    );
  }
  return {
    width,
    height,
    values: Array.from(value, (entry) => (Number.isFinite(entry) ? Math.trunc(entry) : null)),
  };
}

function nonEmptyString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}

function normalizeInteger(value: unknown): number | null {
  return Number.isFinite(value) ? Math.trunc(value as number) : null;
}

function normalizeOptionalPpm(value: unknown): number | null {
  if (!Number.isFinite(value)) return null;
  return Math.max(0, Math.min(1_000_000, Math.round((value as number) * 1_000_000)));
}
