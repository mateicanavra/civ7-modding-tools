import { MORPHOLOGY_EROSION_RATE_MULTIPLIER } from "@mapgen/domain/morphology/model/policy/erosion-knob-policy.js";
import {
  BYTE_SHADE_RAMP,
  computeSampleStep,
  renderAsciiGrid,
  shadeByte,
} from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
import { clampFinite, clampInt16, roundHalfAwayFromZero } from "@swooper/mapgen-core/lib/math";
import { buildScalarFieldProjections } from "@swooper/mapgen-viz";
import { defineStandardVizMeta } from "../../../../viz.js";
import type { MorphologyErosionKnob } from "../../index.js";
import { GeomorphologyStepContract } from "./config.js";

const GROUP_GEOMORPHOLOGY = "Morphology / Geomorphology";
const TILE_SPACE_ID = "tile.hexOddQ" as const;

/**
 * Applies routing- and substrate-driven incision, diffusion, and deposition,
 * then publishes the eroded topography and final substrate vintages.
 */
export const GeomorphologyStep = createStep(GeomorphologyStepContract, {
  normalize: (config, ctx) => {
    const { erosion } = ctx.knobs as Readonly<{ erosion?: MorphologyErosionKnob }>;
    const multiplier = MORPHOLOGY_EROSION_RATE_MULTIPLIER[erosion ?? "normal"] ?? 1.0;

    const geomorphologySelection =
      config.geomorphology.strategy === "default"
        ? {
            ...config.geomorphology,
            config: {
              ...config.geomorphology.config,
              geomorphology: {
                ...config.geomorphology.config.geomorphology,
                fluvial: {
                  ...config.geomorphology.config.geomorphology.fluvial,
                  rate: clampFinite(
                    config.geomorphology.config.geomorphology.fluvial.rate * multiplier,
                    0
                  ),
                },
                diffusion: {
                  ...config.geomorphology.config.geomorphology.diffusion,
                  rate: clampFinite(
                    config.geomorphology.config.geomorphology.diffusion.rate * multiplier,
                    0
                  ),
                },
                deposition: {
                  ...config.geomorphology.config.geomorphology.deposition,
                  rate: clampFinite(
                    config.geomorphology.config.geomorphology.deposition.rate * multiplier,
                    0
                  ),
                },
              },
            },
          }
        : config.geomorphology;

    return { ...config, geomorphology: geomorphologySelection };
  },
  run: (context, config, ops, deps) => {
    const topography = deps.artifacts.carvedTopography.read(context);
    const routing = deps.artifacts.routing.read(context);
    const substrate = deps.artifacts.baseSubstrate.read(context);
    const { width, height } = context.dimensions;
    const elevation = new Int16Array(topography.elevation);
    const landMask = new Uint8Array(topography.landMask);
    const bathymetry = new Int16Array(topography.bathymetry);
    const erodibilityK = new Float32Array(substrate.erodibilityK);
    const sedimentDepth = new Float32Array(substrate.sedimentDepth);

    const deltas = ops.geomorphology(
      {
        width,
        height,
        elevation,
        landMask,
        flowDir: routing.flowDir,
        flowAccum: routing.flowAccum,
        erodibilityK,
        sedimentDepth,
      },
      config.geomorphology
    );

    for (let i = 0; i < elevation.length; i++) {
      const nextElevation = clampInt16(Math.round(elevation[i] + deltas.elevationDelta[i]));
      elevation[i] = nextElevation;
      sedimentDepth[i] = Math.max(0, sedimentDepth[i] + deltas.sedimentDelta[i]);
    }

    const seaLevel = topography.seaLevel;
    const waterElevation = clampInt16(Math.floor(seaLevel));
    const landElevation = clampInt16(Math.floor(seaLevel) + 1);
    for (let i = 0; i < elevation.length; i++) {
      const isLand = landMask[i] === 1;
      landMask[i] = isLand ? 1 : 0;
      if (isLand) {
        // Erosion should sculpt; it must not silently reclassify land/water by pushing tiles across sea level.
        if ((elevation[i] ?? 0) <= seaLevel) elevation[i] = landElevation;
        bathymetry[i] = 0;
      } else {
        if ((elevation[i] ?? 0) > seaLevel) elevation[i] = waterElevation;
        const delta = Math.min(0, elevation[i] - seaLevel);
        bathymetry[i] = clampInt16(roundHalfAwayFromZero(delta));
      }
    }

    context.trace.event(() => {
      const size = Math.max(0, (width | 0) * (height | 0));
      let landTiles = 0;
      let deltaMin = 0;
      let deltaMax = 0;
      let deltaSum = 0;
      let elevationMin = 0;
      let elevationMax = 0;

      for (let i = 0; i < size; i++) {
        if (landMask[i] !== 1) continue;
        landTiles += 1;

        const delta = deltas.elevationDelta[i] ?? 0;
        if (landTiles === 1 || delta < deltaMin) deltaMin = delta;
        if (landTiles === 1 || delta > deltaMax) deltaMax = delta;
        deltaSum += delta;

        const nextElevation = elevation[i] ?? 0;
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

    if (context.trace.isVerbose) {
      context.trace.event(() => {
        const sampleStep = computeSampleStep(width, height);

        let maxErosion = 0;
        let maxDeposit = 0;
        for (let i = 0; i < deltas.elevationDelta.length; i++) {
          const delta = deltas.elevationDelta[i] ?? 0;
          if (delta < 0) maxErosion = Math.max(maxErosion, -delta);
          if (delta > 0) maxDeposit = Math.max(maxDeposit, delta);
        }

        const erosionRows = renderAsciiGrid({
          width,
          height,
          sampleStep,
          cellFn: (x, y) => {
            const idx = y * width + x;
            if (landMask[idx] !== 1) return { base: "~" };
            const delta = deltas.elevationDelta[idx] ?? 0;
            const erosion = delta < 0 ? (-delta / Math.max(1e-9, maxErosion)) * 255 : 0;
            return { base: shadeByte(Math.round(erosion)) };
          },
        });

        const depositRows = renderAsciiGrid({
          width,
          height,
          sampleStep,
          cellFn: (x, y) => {
            const idx = y * width + x;
            if (landMask[idx] !== 1) return { base: "~" };
            const delta = deltas.elevationDelta[idx] ?? 0;
            const deposit = delta > 0 ? (delta / Math.max(1e-9, maxDeposit)) * 255 : 0;
            return { base: shadeByte(Math.round(deposit)) };
          },
        });

        return {
          kind: "morphology.geomorphology.ascii.netErosionAndDeposit",
          sampleStep,
          legend: `${BYTE_SHADE_RAMP} (low→high) ~=water`,
          erosionRows,
          depositRows,
        };
      });
    }
    const erodedTopography = {
      elevation,
      seaLevel,
      landMask,
      bathymetry,
    };
    const finalSubstrate = { erodibilityK, sedimentDepth };
    deps.artifacts.erodedTopography.publish(context, erodedTopography);
    deps.artifacts.substrate.publish(context, finalSubstrate);
    return {
      deltas,
      elevation,
      landMask,
      bathymetry,
    };
  },
  viz: ({ result, dimensions }) => [
    {
      kind: "grid",
      dataTypeKey: "morphology.geomorphology.elevationDelta",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "f32", values: result.deltas.elevationDelta },
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
      field: { format: "f32", values: result.deltas.sedimentDelta },
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
      field: { format: "i16", values: result.elevation },
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
      field: { format: "u8", values: result.landMask },
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
      field: { format: "i16", values: result.bathymetry },
      meta: defineStandardVizMeta("morphology.topography.bathymetry", "water.depth", {
        label: "Bathymetry (After Geomorphology)",
        group: GROUP_GEOMORPHOLOGY,
        visibility: "debug",
      }),
    },
  ],
});
