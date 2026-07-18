import { MORPHOLOGY_COAST_RUGGEDNESS_MULTIPLIER } from "@mapgen/domain/morphology/model/policy/coast-knob-policy.js";
import { computeSampleStep, deriveStepSeed, renderAsciiGrid } from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
import { clampFinite } from "@swooper/mapgen-core/lib/math";
import { defineStandardVizMeta } from "../../../../viz.js";
import type { MorphologyCoastRuggednessKnob } from "../../index.js";
import { RuggedCoastsStepContract } from "./config.js";

const GROUP_COASTLINES = "Morphology / Coastlines";
const TILE_SPACE_ID = "tile.hexOddQ" as const;

/**
 * Carves a producer-owned copy of base topography and publishes the CARVED (pre-island)
 * coastline metrics. The continental shelf used to be computed here too, but it is
 * now a separate post-features stage (morphology-shelf) so it sees final post-island
 * geography; this step only owns carving + reconciliation + the carved metrics that
 * mountains (stage morphology-features) consumes.
 */
export const RuggedCoastsStep = createStep(RuggedCoastsStepContract, {
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
    const baseTopography = deps.artifacts.baseTopography.read(context);
    const rngSeed = deriveStepSeed(context.env.seed, "morphology:computeCoastlineMetrics");

    const result = ops.coastlines(
      {
        width,
        height,
        landMask: baseTopography.landMask,
        boundaryCloseness: beltDrivers.boundaryCloseness,
        boundaryType: beltDrivers.boundaryType,
        rngSeed,
      },
      config.coastlines
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
      config.reconcileHeightfield
    );
    const carvedTopography = {
      elevation: reconciled.elevation,
      seaLevel: seaLevelValue,
      landMask: reconciled.landMask,
      bathymetry: reconciled.bathymetry,
    };

    context.trace.event(() => {
      const size = Math.max(0, (width | 0) * (height | 0));
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
    context.trace.event(() => {
      const sampleStep = computeSampleStep(width, height);
      const rows = renderAsciiGrid({
        width,
        height,
        sampleStep,
        cellFn: (x, y) => {
          const idx = y * width + x;
          const base = carvedTopography.landMask[idx] === 1 ? "." : "~";
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

    const coastlineMetrics = {
      coastalLand: result.coastalLand,
      coastalWater: result.coastalWater,
      distanceToCoast,
    };
    deps.artifacts.carvedTopography.publish(context, carvedTopography);
    deps.artifacts.coastlineMetrics.publish(context, coastlineMetrics);
    return { bathymetry: carvedTopography.bathymetry, coastlineMetrics };
  },
  viz: ({ result: { bathymetry, coastlineMetrics }, dimensions }) => [
    {
      kind: "grid",
      dataTypeKey: "morphology.coastlineMetrics.bathymetryPreErosion",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "i16", values: bathymetry },
      meta: defineStandardVizMeta(
        "morphology.coastlineMetrics.bathymetryPreErosion",
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
          "morphology.coastlineMetrics.coastalLand",
          "Coastal Land",
          coastlineMetrics.coastalLand,
          "default",
        ],
        [
          "morphology.coastlineMetrics.coastalWater",
          "Coastal Water",
          coastlineMetrics.coastalWater,
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
      dataTypeKey: "morphology.coastlineMetrics.distanceToCoast",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "u16", values: coastlineMetrics.distanceToCoast },
      meta: defineStandardVizMeta(
        "morphology.coastlineMetrics.distanceToCoast",
        "field.intensity",
        {
          label: "Distance To Coast (Tiles)",
          group: GROUP_COASTLINES,
          visibility: "debug",
        }
      ),
    },
  ],
});
