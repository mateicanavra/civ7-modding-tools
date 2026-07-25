import { MORPHOLOGY_COAST_RUGGEDNESS_MULTIPLIER } from "@mapgen/domain/morphology/modules/coasts/model/policy/coast-knob-policy.js";
import { deriveStepSeed } from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
import { clampFinite } from "@swooper/mapgen-core/lib/math";
import { defineStandardVizMeta } from "../../../../../viz.js";
import type { MorphologyCoastRuggednessKnob } from "../../index.js";
import { config } from "./config.js";

const GROUP_COASTLINES = "Morphology / Coastlines";
const TILE_SPACE_ID = "tile.hexOddQ" as const;

/**
 * Carves a producer-owned copy of base topography and publishes the CARVED (pre-island)
 * coastline metrics. The continental shelf used to be computed here too, but it is
 * now a separate post-features stage (morphology-shelf) so it sees final post-island
 * geography; this step only owns carving + reconciliation + the carved metrics that
 * mountains (stage morphology-features) consumes.
 */
export const RuggedCoastsStep = createStep(config, {
  normalize: (stepConfig, ctx) => {
    const { coastRuggedness } = ctx.knobs as Readonly<{
      coastRuggedness?: MorphologyCoastRuggednessKnob;
    }>;
    const multiplier = MORPHOLOGY_COAST_RUGGEDNESS_MULTIPLIER[coastRuggedness ?? "normal"] ?? 1.0;

    const coastlinesSelection =
      stepConfig.coastlines.strategy === "plate-aware-carving"
        ? {
            ...stepConfig.coastlines,
            config: {
              ...stepConfig.coastlines.config,
              coast: {
                ...stepConfig.coastlines.config.coast,
                plateBias: {
                  ...stepConfig.coastlines.config.coast.plateBias,
                  bayWeight: clampFinite(
                    stepConfig.coastlines.config.coast.plateBias.bayWeight * multiplier,
                    0
                  ),
                  bayNoiseBonus: clampFinite(
                    stepConfig.coastlines.config.coast.plateBias.bayNoiseBonus * multiplier,
                    0
                  ),
                  fjordWeight: clampFinite(
                    stepConfig.coastlines.config.coast.plateBias.fjordWeight * multiplier,
                    0
                  ),
                },
              },
            },
          }
        : stepConfig.coastlines;

    return { ...stepConfig, coastlines: coastlinesSelection };
  },
  run: (context, stepConfig, ops, deps) => {
    const { width, height } = context.setup.dimensions;
    const beltDrivers = deps.artifacts.beltDrivers.read(context);
    const baseTopography = deps.artifacts.baseTopography.read(context);
    const rngSeed = deriveStepSeed(context.setup.mapSeed, "morphology:computeCoastlineMetrics");

    const result = ops.coastlines(
      {
        width,
        height,
        landMask: baseTopography.landMask,
        boundaryCloseness: beltDrivers.boundaryCloseness,
        boundaryType: beltDrivers.boundaryType,
        rngSeed,
      },
      stepConfig.coastlines
    );

    const updatedLandMask = result.landMask;
    const coastMask = result.coastMask;

    const seaLevelValue = baseTopography.seaLevel;

    // Reconcile land/water + elevation + bathymetry with the carved coastline. The op is
    // pure (returns fresh arrays); the step publishes those arrays as the next immutable vintage.
    const reconciled = ops.reconcileHeightfield(
      {
        width,
        height,
        landMask: updatedLandMask,
        coastMask,
        elevation: baseTopography.elevation,
        seaLevel: seaLevelValue,
      },
      stepConfig.reconcileHeightfield
    );
    const carvedTopography = {
      elevation: reconciled.elevation,
      seaLevel: seaLevelValue,
      landMask: reconciled.landMask,
      bathymetry: reconciled.bathymetry,
    };

    context.trace.event(() => {
      const size = width * height;
      let coastTiles = 0;
      let landTiles = 0;
      for (let i = 0; i < size; i++) {
        if (coastMask[i] === 1) coastTiles += 1;
        if (carvedTopography.landMask[i] === 1) landTiles += 1;
      }
      return {
        kind: "morphology.coastlines.summary",
        coastTiles,
        landTiles,
        waterTiles: Math.max(0, size - landTiles),
      };
    });
    // Carved distance-to-coast (pre-island): windows the shelf-break sample is now the
    // shelf stage's concern; here it is the snapshot mountains(morphology-features) consume.
    const coastal = new Uint8Array(width * height);
    for (let i = 0; i < coastal.length; i++) {
      coastal[i] = result.coastalLand[i] === 1 || result.coastalWater[i] === 1 ? 1 : 0;
    }
    const { distanceToCoast } = ops.distanceToCoast(
      { width, height, coastal },
      stepConfig.distanceToCoast
    );

    const carvedCoastline = {
      coastalLand: result.coastalLand,
      coastalWater: result.coastalWater,
      distanceToCoast,
    };
    deps.artifacts.carvedTopography.publish(context, carvedTopography);
    deps.artifacts.carvedCoastline.publish(context, carvedCoastline);
    return { bathymetry: carvedTopography.bathymetry, carvedCoastline };
  },
  viz: ({ result: { bathymetry, carvedCoastline }, dimensions }) => [
    {
      kind: "grid",
      dataTypeKey: "morphology.carvedCoastline.bathymetryPreErosion",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "i16", values: bathymetry },
      meta: defineStandardVizMeta(
        "morphology.carvedCoastline.bathymetryPreErosion",
        "water.depth",
        {
          label: "Bathymetry (Post-carve, Pre-erosion)",
          group: GROUP_COASTLINES,
          visibility: "debug",
        }
      ),
    },
    ...(
      [
        [
          "morphology.carvedCoastline.coastalLand",
          "Coastal Land",
          carvedCoastline.coastalLand,
          "default",
        ],
        [
          "morphology.carvedCoastline.coastalWater",
          "Coastal Water",
          carvedCoastline.coastalWater,
          "default",
        ],
      ] as const
    ).map(([dataTypeKey, label, values, visibility]) => ({
      kind: "grid" as const,
      dataTypeKey,
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "u8" as const, values },
      meta: defineStandardVizMeta(dataTypeKey, "category.distinct", {
        label,
        group: GROUP_COASTLINES,
        visibility,
      }),
    })),
    {
      kind: "grid",
      dataTypeKey: "morphology.carvedCoastline.distanceToCoast",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "u16", values: carvedCoastline.distanceToCoast },
      meta: defineStandardVizMeta("morphology.carvedCoastline.distanceToCoast", "field.intensity", {
        label: "Distance To Coast (Tiles)",
        group: GROUP_COASTLINES,
        visibility: "debug",
      }),
    },
  ],
});
