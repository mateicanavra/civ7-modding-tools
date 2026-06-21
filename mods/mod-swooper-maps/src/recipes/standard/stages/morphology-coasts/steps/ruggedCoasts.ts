import type { MapDimensions } from "@civ7/adapter";
import type { MorphologyCoastRuggednessKnob } from "@mapgen/domain/morphology/config.js";
import { MORPHOLOGY_COAST_RUGGEDNESS_MULTIPLIER } from "@mapgen/domain/morphology/config.js";
import {
  computeSampleStep,
  defineVizMeta,
  deriveStepSeed,
  renderAsciiGrid,
} from "@swooper/mapgen-core";
import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";
import { clampFinite } from "@swooper/mapgen-core/lib/math";
import RuggedCoastsStepContract from "./ruggedCoasts.contract.js";

type ArtifactValidationIssue = Readonly<{ message: string }>;

const GROUP_COASTLINES = "Morphology / Coastlines";
const TILE_SPACE_ID = "tile.hexOddQ" as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function expectedSize(dimensions: MapDimensions): number {
  return Math.max(0, (dimensions.width | 0) * (dimensions.height | 0));
}

function validateTypedArray(
  errors: ArtifactValidationIssue[],
  label: string,
  value: unknown,
  ctor: { new (...args: any[]): { length: number } },
  expectedLength?: number
): value is { length: number } {
  if (!(value instanceof ctor)) {
    errors.push({ message: `Expected ${label} to be ${ctor.name}.` });
    return false;
  }
  if (expectedLength != null && value.length !== expectedLength) {
    errors.push({
      message: `Expected ${label} length ${expectedLength} (received ${value.length}).`,
    });
  }
  return true;
}

function validateCoastlineMetrics(
  value: unknown,
  dimensions: MapDimensions
): ArtifactValidationIssue[] {
  const errors: ArtifactValidationIssue[] = [];
  if (!isRecord(value)) {
    errors.push({ message: "Missing coastline metrics." });
    return errors;
  }
  const size = expectedSize(dimensions);
  const candidate = value as {
    coastalLand?: unknown;
    coastalWater?: unknown;
    distanceToCoast?: unknown;
  };
  validateTypedArray(
    errors,
    "coastlineMetrics.coastalLand",
    candidate.coastalLand,
    Uint8Array,
    size
  );
  validateTypedArray(
    errors,
    "coastlineMetrics.coastalWater",
    candidate.coastalWater,
    Uint8Array,
    size
  );
  validateTypedArray(
    errors,
    "coastlineMetrics.distanceToCoast",
    candidate.distanceToCoast,
    Uint16Array,
    size
  );
  return errors;
}

/**
 * Carves the coastline into the heightfield and publishes the CARVED (pre-island)
 * coastline metrics. The continental shelf used to be computed here too, but it is
 * now a separate post-features stage (morphology-shelf) so it sees final post-island
 * geography; this step only owns carving + reconciliation + the carved metrics that
 * mountains (stage morphology-features) consumes.
 */
export default createStep(RuggedCoastsStepContract, {
  artifacts: implementArtifacts(RuggedCoastsStepContract.artifacts!.provides!, {
    coastlineMetrics: {
      validate: (value, context) => validateCoastlineMetrics(value, context.dimensions),
    },
  }),
  normalize: (config, ctx) => {
    const { coastRuggedness } = ctx.knobs as Readonly<{
      coastRuggedness?: MorphologyCoastRuggednessKnob;
    }>;
    const multiplier = MORPHOLOGY_COAST_RUGGEDNESS_MULTIPLIER[coastRuggedness ?? "normal"] ?? 1.0;

    const coastlinesSelection =
      config.coastlines.strategy === "default"
        ? {
            ...config.coastlines,
            config: {
              ...config.coastlines.config,
              coast: {
                ...config.coastlines.config.coast,
                plateBias: {
                  ...config.coastlines.config.coast.plateBias,
                  bayWeight: clampFinite(
                    config.coastlines.config.coast.plateBias.bayWeight * multiplier,
                    0
                  ),
                  bayNoiseBonus: clampFinite(
                    config.coastlines.config.coast.plateBias.bayNoiseBonus * multiplier,
                    0
                  ),
                  fjordWeight: clampFinite(
                    config.coastlines.config.coast.plateBias.fjordWeight * multiplier,
                    0
                  ),
                },
              },
            },
          }
        : config.coastlines;

    return { ...config, coastlines: coastlinesSelection };
  },
  run: (context, config, ops, deps) => {
    const { width, height } = context.dimensions;
    const beltDrivers = deps.artifacts.beltDrivers.read(context);
    const topography = deps.artifacts.topography.read(context);
    const heightfield = context.buffers.heightfield;
    const rngSeed = deriveStepSeed(context.env.seed, "morphology:computeCoastlineMetrics");

    const result = ops.coastlines(
      {
        width,
        height,
        landMask: heightfield.landMask,
        boundaryCloseness: beltDrivers.boundaryCloseness,
        boundaryType: beltDrivers.boundaryType,
        rngSeed,
      },
      config.coastlines
    );

    const updatedLandMask = result.landMask;
    const coastMask = result.coastMask;

    const seaLevelValue = topography.seaLevel;
    const bathymetry = topography.bathymetry;

    // Reconcile land/water + elevation + bathymetry with the carved coastline. The op is
    // pure (returns fresh arrays); the step owns the only legitimate side effect: copying the
    // result back into the shared heightfield + topography bathymetry buffers in place.
    const reconciled = ops.reconcileHeightfield(
      {
        width,
        height,
        landMask: updatedLandMask,
        coastMask,
        elevation: heightfield.elevation,
        seaLevel: seaLevelValue,
      },
      config.reconcileHeightfield
    );
    heightfield.landMask.set(reconciled.landMask);
    heightfield.elevation.set(reconciled.elevation);
    bathymetry.set(reconciled.bathymetry);

    context.trace.event(() => {
      const size = Math.max(0, (width | 0) * (height | 0));
      let coastTiles = 0;
      let landTiles = 0;
      for (let i = 0; i < size; i++) {
        if (coastMask[i] === 1) coastTiles += 1;
        if (heightfield.landMask[i] === 1) landTiles += 1;
      }
      return {
        kind: "morphology.coastlines.summary",
        coastTiles,
        landTiles,
        waterTiles: Math.max(0, size - landTiles),
      };
    });
    context.trace.event(() => {
      const sampleStep = computeSampleStep(width, height);
      const rows = renderAsciiGrid({
        width,
        height,
        sampleStep,
        cellFn: (x, y) => {
          const idx = y * width + x;
          const base = heightfield.landMask[idx] === 1 ? "." : "~";
          const overlay = coastMask[idx] === 1 ? "," : undefined;
          return { base, overlay };
        },
      });
      return {
        kind: "morphology.coastlines.ascii.coastMask",
        sampleStep,
        legend: ".=land ~=water ,=coast",
        rows,
      };
    });

    // Carved distance-to-coast (pre-island): windows the shelf-break sample is now the
    // shelf stage's concern; here it is the snapshot mountains(morphology-features) consume.
    const coastal = new Uint8Array(Math.max(0, (width | 0) * (height | 0)));
    for (let i = 0; i < coastal.length; i++) {
      coastal[i] = result.coastalLand[i] === 1 || result.coastalWater[i] === 1 ? 1 : 0;
    }
    const { distanceToCoast } = ops.distanceToCoast(
      { width, height, coastal },
      config.distanceToCoast
    );

    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "morphology.coastlineMetrics.coastalLand",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: result.coastalLand,
      meta: defineVizMeta("morphology.coastlineMetrics.coastalLand", {
        label: "Coastal Land",
        group: GROUP_COASTLINES,
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "morphology.coastlineMetrics.coastalWater",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: result.coastalWater,
      meta: defineVizMeta("morphology.coastlineMetrics.coastalWater", {
        label: "Coastal Water",
        group: GROUP_COASTLINES,
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "morphology.coastlineMetrics.distanceToCoast",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u16",
      values: distanceToCoast,
      meta: defineVizMeta("morphology.coastlineMetrics.distanceToCoast", {
        label: "Distance To Coast (Tiles)",
        group: GROUP_COASTLINES,
        visibility: "debug",
      }),
    });

    deps.artifacts.coastlineMetrics.publish(context, {
      coastalLand: result.coastalLand,
      coastalWater: result.coastalWater,
      distanceToCoast,
    });
  },
});
