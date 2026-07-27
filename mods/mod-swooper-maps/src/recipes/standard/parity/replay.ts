/// <reference types="@civ7/types" />

import { createMockAdapter, type EngineAdapter } from "@civ7/adapter";
import { artifacts as hydrographyArtifacts } from "@mapgen/domain/hydrology/modules/hydrography/artifacts/index.js";
import { artifacts as placementWonderArtifacts } from "@mapgen/domain/placement/modules/wonders/artifacts/index.js";
import { artifacts as resourceSupportArtifacts } from "@mapgen/domain/resources/modules/support/artifacts/index.js";
import { createLabelRng, createMapContext } from "@swooper/mapgen-core";
import {
  type Artifact,
  type ArtifactReadValueOf,
  observeArtifact,
} from "@swooper/mapgen-core/authoring";
import { fnv1a32StringHex } from "@swooper/mapgen-core/lib/hash";
import { Value } from "typebox/value";
import type { StandardInitialSetup } from "../initial-setup.js";
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
  STANDARD_RESOURCE_PLACEMENT_METRIC_KEY,
  type StandardResourcePlacementMeasurements,
  StandardResourcePlacementMeasurementsSchema,
} from "../metrics/families/placement/resource-placement.js";
import {
  type StandardPlacementParityMeasurements,
  StandardPlacementParityMeasurementsSchema,
} from "../metrics/families/placement-parity.js";
import standardRecipe from "../recipe.js";
import { projectStandardNaturalWonderPlanEvidence } from "./placement-exact-log.js";
import type {
  StandardFinalSurfaceCapture,
  StandardLocalParityCapture,
  StandardParityGrid,
  StandardRiverProjectionCapture,
} from "./types.js";

/** Fully correlated immutable inputs required to replay one Standard generation. */
type StandardParityReplayInput = Readonly<{
  plan: ReturnType<typeof standardRecipe.compile>;
  canonicalConfigDigest: string;
  launchEnvelopeDigest: string;
}>;

declare const STANDARD_PARITY_REPLAY_AUTHORITY: unique symbol;

const EMPTY_RESOURCE_PLACEMENT_COORDINATE_DIGEST = Object.freeze({
  count: 0,
  hash32: fnv1a32StringHex(""),
});

/**
 * Opaque authority issued only after exact authorship and the generation
 * manifest have been correlated into one immutable replay request.
 */
export type StandardParityReplayAuthority = Readonly<{
  [STANDARD_PARITY_REPLAY_AUTHORITY]: true;
}>;

const replayInputs = new WeakMap<StandardParityReplayAuthority, StandardParityReplayInput>();

function requireArtifact<A extends Artifact>(
  context: ReturnType<typeof createMapContext>,
  artifact: A
): ArtifactReadValueOf<A> {
  const observation = observeArtifact(context, artifact);
  if (!observation.found) {
    throw new Error(`Standard parity replay did not publish required artifact "${artifact.id}".`);
  }
  return observation.value;
}

/**
 * Resolves replay metadata from the exact admitted setup captured by the executed recipe plan.
 * Product parity is defined only for a real Civ7 preset; custom headless scenarios have no live row.
 */
function createStandardParityReplayMetadata(initialSetup: StandardInitialSetup) {
  const { selection } = initialSetup.map;
  if (selection.kind !== "civ7-preset") {
    throw new Error("Standard parity replay requires an exact Civ7 preset selection.");
  }
  return {
    dimensions: selection.dimensions,
    mapInfo: selection.mapInfo,
    mapSizeId: selection.id,
  } as const;
}

/**
 * Replays one admitted Standard launch through the real recipe and closes over
 * only evidence consumed by Standard parity product comparisons.
 */
function runStandardParityReplay(input: StandardParityReplayInput): StandardLocalParityCapture {
  const { plan } = input;
  const inspectedPlan = standardRecipe.inspectPlan(plan);
  const metadata = createStandardParityReplayMetadata(inspectedPlan.initialSetup.value);
  const { width, height } = metadata.dimensions;
  const adapter = createMockAdapter({
    width,
    height,
    mapInfo: metadata.mapInfo,
    mapSizeId: metadata.mapSizeId,
    aliveMajorPlayerIds: inspectedPlan.initialSetup.value.aliveMajorPlayerIds,
    rng: createLabelRng(inspectedPlan.initialSetup.value.map.mapSeed),
  });
  const context = createMapContext({ setup: plan.setup, adapter });
  let featureProjection: StandardFeatureProjectionMeasurements | undefined;
  let lakeProjection: StandardLakeProjectionMeasurements | undefined;
  let naturalWonderPlanInput: StandardNaturalWonderPlanInputMeasurements | undefined;
  let placementParity: StandardPlacementParityMeasurements | undefined;
  let resourcePlacement: StandardResourcePlacementMeasurements | undefined;
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
        const placementCandidate = projection["placement.parity"];
        if (placementCandidate !== undefined) {
          placementParity = Value.Parse(
            StandardPlacementParityMeasurementsSchema,
            placementCandidate
          );
        }
        const resourcePlacementCandidate = projection[STANDARD_RESOURCE_PLACEMENT_METRIC_KEY];
        if (resourcePlacementCandidate !== undefined) {
          resourcePlacement = Value.Parse(
            StandardResourcePlacementMeasurementsSchema,
            resourcePlacementCandidate
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
  if (placementParity === undefined) {
    throw new Error("Standard parity replay requires terminal Placement parity measurements.");
  }
  if (resourcePlacement === undefined) {
    throw new Error("Standard parity replay requires terminal resource-placement measurements.");
  }

  const naturalWonderPlan = requireArtifact(context, placementWonderArtifacts.naturalWonderPlan);
  const resourcePlan = requireArtifact(context, resourceSupportArtifacts.resourcePlanAdjusted);

  return {
    source: "standard-replay",
    identity: {
      planFingerprint: inspectedPlan.planFingerprint,
      mapSeed: inspectedPlan.initialSetup.value.map.mapSeed,
      gameSeed: inspectedPlan.initialSetup.value.gameSeed,
      mapSize: metadata.mapSizeId,
      aliveMajorPlayerIds: Object.freeze([...inspectedPlan.initialSetup.value.aliveMajorPlayerIds]),
      canonicalConfigDigest: input.canonicalConfigDigest,
      launchEnvelopeDigest: input.launchEnvelopeDigest,
    },
    surface: captureFinalSurface(adapter, metadata.dimensions),
    hydrology: {
      rivers: captureRiverProjection(context, adapter, metadata.dimensions),
      lakeProjection,
      featureProjection,
    },
    placement: {
      terminalParity: placementParity,
      naturalWonderPlanEvidence: projectStandardNaturalWonderPlanEvidence(naturalWonderPlan),
      naturalWonderPlanInput: { status: "present", value: naturalWonderPlanInput },
      resourcePlanIntents: resourcePlan.intents,
      resourcePlacement: {
        coordinateEvidence: {
          ...resourcePlacement.summary.coordinateEvidence,
          mismatch: EMPTY_RESOURCE_PLACEMENT_COORDINATE_DIGEST,
        },
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
  standardRecipe.inspectPlan(input.plan);
  const retainedInput = Object.freeze({
    plan: input.plan,
    canonicalConfigDigest: input.canonicalConfigDigest,
    launchEnvelopeDigest: input.launchEnvelopeDigest,
  });
  const authority = Object.freeze({}) as StandardParityReplayAuthority;
  replayInputs.set(authority, retainedInput);
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
  const projected = requireArtifact(context, hydrographyArtifacts.projectedNavigableRivers);
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
