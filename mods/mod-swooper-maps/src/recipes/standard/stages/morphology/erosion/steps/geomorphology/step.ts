import { MORPHOLOGY_EROSION_RATE_MULTIPLIER } from "@mapgen/domain/morphology/modules/erosion/model/policy/erosion-knob-policy.js";
import { createStep } from "@swooper/mapgen-core/authoring";
import { clampFinite } from "@swooper/mapgen-core/lib/math";
import { buildScalarFieldProjections } from "@swooper/mapgen-viz";
import { defineStandardVizMeta } from "../../../../../viz.js";
import type { MorphologyErosionKnob } from "../../index.js";
import { config } from "./config.js";

const GROUP_GEOMORPHOLOGY = "Morphology / Geomorphology";
const TILE_SPACE_ID = "tile.hexOddQ" as const;

/**
 * Publishes the complete relief and substrate transition produced by Morphology erosion.
 */
export const GeomorphologyStep = createStep(config, {
  normalize: (stepConfig, ctx) => {
    const { erosion } = ctx.knobs as Readonly<{ erosion?: MorphologyErosionKnob }>;
    const multiplier = MORPHOLOGY_EROSION_RATE_MULTIPLIER[erosion ?? "normal"] ?? 1.0;

    const geomorphologySelection =
      stepConfig.geomorphology.strategy === "stream-power-diffusion"
        ? {
            ...stepConfig.geomorphology,
            config: {
              ...stepConfig.geomorphology.config,
              geomorphology: {
                ...stepConfig.geomorphology.config.geomorphology,
                fluvial: {
                  ...stepConfig.geomorphology.config.geomorphology.fluvial,
                  rate: clampFinite(
                    stepConfig.geomorphology.config.geomorphology.fluvial.rate * multiplier,
                    0
                  ),
                },
                diffusion: {
                  ...stepConfig.geomorphology.config.geomorphology.diffusion,
                  rate: clampFinite(
                    stepConfig.geomorphology.config.geomorphology.diffusion.rate * multiplier,
                    0
                  ),
                },
                deposition: {
                  ...stepConfig.geomorphology.config.geomorphology.deposition,
                  rate: clampFinite(
                    stepConfig.geomorphology.config.geomorphology.deposition.rate * multiplier,
                    0
                  ),
                },
              },
            },
          }
        : stepConfig.geomorphology;

    return { ...stepConfig, geomorphology: geomorphologySelection };
  },
  run: (context, stepConfig, ops, deps) => {
    const topography = deps.artifacts.baseTopography.read();
    const routing = deps.artifacts.routing.read();
    const substrate = deps.artifacts.baseSubstrate.read();
    const { width, height } = context.setup.dimensions;

    const result = ops.geomorphology(
      {
        width,
        height,
        elevation: topography.elevation,
        seaLevel: topography.seaLevel,
        landMask: topography.landMask,
        flowDir: routing.flowDir,
        flowAccum: routing.flowAccum,
        erodibilityK: substrate.erodibilityK,
        sedimentDepth: substrate.sedimentDepth,
      },
      stepConfig.geomorphology
    );

    context.trace.event(() => {
      const size = width * height;
      let landTiles = 0;
      let deltaMin = 0;
      let deltaMax = 0;
      let deltaSum = 0;
      let elevationMin = 0;
      let elevationMax = 0;

      for (let i = 0; i < size; i++) {
        if (result.topography.landMask[i] !== 1) continue;
        landTiles += 1;

        const delta = result.deltas.elevationDelta[i] ?? 0;
        if (landTiles === 1 || delta < deltaMin) deltaMin = delta;
        if (landTiles === 1 || delta > deltaMax) deltaMax = delta;
        deltaSum += delta;

        const nextElevation = result.topography.elevation[i] ?? 0;
        if (landTiles === 1 || nextElevation < elevationMin) elevationMin = nextElevation;
        if (landTiles === 1 || nextElevation > elevationMax) elevationMax = nextElevation;
      }

      return {
        kind: "morphology.geomorphology.summary",
        landTiles,
        elevationDeltaMin: landTiles ? Number(deltaMin.toFixed(4)) : 0,
        elevationDeltaMax: landTiles ? Number(deltaMax.toFixed(4)) : 0,
        elevationDeltaMean: landTiles ? Number((deltaSum / landTiles).toFixed(4)) : 0,
        elevationMin,
        elevationMax,
      };
    });

    deps.artifacts.erodedTopography.publish(result.topography);
    deps.artifacts.substrate.publish(result.substrate);
    return result;
  },
  viz: ({ observation, dimensions }) => [
    {
      kind: "grid",
      dataTypeKey: "morphology.geomorphology.elevationDelta",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "f32", values: observation.deltas.elevationDelta },
      meta: defineStandardVizMeta("morphology.geomorphology.elevationDelta", "field.signed", {
        label: "Elevation Delta",
        group: GROUP_GEOMORPHOLOGY,
        visibility: "debug",
      }),
    },
    {
      kind: "grid",
      dataTypeKey: "morphology.geomorphology.sedimentDelta",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "f32", values: observation.deltas.sedimentDelta },
      meta: defineStandardVizMeta("morphology.geomorphology.sedimentDelta", "field.signed", {
        label: "Sediment Delta",
        group: GROUP_GEOMORPHOLOGY,
        visibility: "debug",
      }),
    },
    ...buildScalarFieldProjections({
      dataTypeKey: "morphology.topography.elevation",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "i16", values: observation.topography.elevation },
      meta: defineStandardVizMeta("morphology.topography.elevation", "terrain.elevation", {
        label: "Elevation (After Geomorphology)",
        group: GROUP_GEOMORPHOLOGY,
      }),
      points: {},
    }),
    {
      kind: "grid",
      dataTypeKey: "morphology.topography.landMask",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "u8", values: observation.topography.landMask },
      meta: defineStandardVizMeta("morphology.topography.landMask", "category.distinct", {
        label: "Land Mask (After Geomorphology)",
        group: GROUP_GEOMORPHOLOGY,
      }),
    },
    {
      kind: "grid",
      dataTypeKey: "morphology.topography.bathymetry",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "i16", values: observation.topography.bathymetry },
      meta: defineStandardVizMeta("morphology.topography.bathymetry", "water.depth", {
        label: "Bathymetry (After Geomorphology)",
        group: GROUP_GEOMORPHOLOGY,
        visibility: "debug",
      }),
    },
  ],
});
