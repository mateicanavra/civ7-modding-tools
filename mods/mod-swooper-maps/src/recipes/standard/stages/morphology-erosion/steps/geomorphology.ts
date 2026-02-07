import { BYTE_SHADE_RAMP, computeSampleStep, defineVizMeta, dumpScalarFieldVariants, renderAsciiGrid, shadeByte } from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
import { clampFinite, clampInt16, roundHalfAwayFromZero } from "@swooper/mapgen-core/lib/math";

import GeomorphologyStepContract from "./geomorphology.contract.js";
import { MORPHOLOGY_EROSION_RATE_MULTIPLIER } from "@mapgen/domain/morphology/shared/knob-multipliers.js";
import type { MorphologyErosionKnob } from "@mapgen/domain/morphology/shared/knobs.js";

const GROUP_GEOMORPHOLOGY = "Morphology / Geomorphology";
const TILE_SPACE_ID = "tile.hexOddR" as const;

export default createStep(GeomorphologyStepContract, {
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
                  rate: clampFinite(config.geomorphology.config.geomorphology.fluvial.rate * multiplier, 0),
                },
                diffusion: {
                  ...config.geomorphology.config.geomorphology.diffusion,
                  rate: clampFinite(config.geomorphology.config.geomorphology.diffusion.rate * multiplier, 0),
                },
                deposition: {
                  ...config.geomorphology.config.geomorphology.deposition,
                  rate: clampFinite(config.geomorphology.config.geomorphology.deposition.rate * multiplier, 0),
                },
              },
            },
          }
        : config.geomorphology;

    return { ...config, geomorphology: geomorphologySelection };
  },
  run: (context, config, ops, deps) => {
    const topography = deps.artifacts.topography.read(context) as {
      seaLevel?: number;
      bathymetry?: Int16Array;
    };
    const routing = deps.artifacts.routing.read(context);
    const substrate = deps.artifacts.substrate.read(context) as {
      erodibilityK: Float32Array;
      sedimentDepth: Float32Array;
    };
    const { width, height } = context.dimensions;
    const heightfield = context.buffers.heightfield;
    const landMaskStable = new Uint8Array(heightfield.landMask);

    const deltas = ops.geomorphology(
      {
        width,
        height,
        elevation: heightfield.elevation,
        landMask: heightfield.landMask,
        flowDir: routing.flowDir,
        flowAccum: routing.flowAccum,
        erodibilityK: substrate.erodibilityK,
        sedimentDepth: substrate.sedimentDepth,
      },
      config.geomorphology
    );

    const elevation = heightfield.elevation;
    const sedimentDepth = substrate.sedimentDepth;

    for (let i = 0; i < elevation.length; i++) {
      const nextElevation = clampInt16(Math.round(elevation[i] + deltas.elevationDelta[i]));
      elevation[i] = nextElevation;
      sedimentDepth[i] = Math.max(0, sedimentDepth[i] + deltas.sedimentDelta[i]);
    }

    const seaLevel = typeof topography.seaLevel === "number" ? topography.seaLevel : 0;
    const bathymetry = topography.bathymetry;
    if (!(bathymetry instanceof Int16Array) || bathymetry.length !== elevation.length) {
      throw new Error("Morphology topography bathymetry buffer missing or shape-mismatched.");
    }
    const waterElevation = clampInt16(Math.floor(seaLevel));
    const landElevation = clampInt16(Math.floor(seaLevel) + 1);
    for (let i = 0; i < elevation.length; i++) {
      const isLand = landMaskStable[i] === 1;
      heightfield.landMask[i] = isLand ? 1 : 0;
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

    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "morphology.geomorphology.elevationDelta",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "f32",
      values: deltas.elevationDelta,
      meta: defineVizMeta("morphology.geomorphology.elevationDelta", {
        label: "Elevation Delta",
        group: GROUP_GEOMORPHOLOGY,
        visibility: "debug",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "morphology.geomorphology.sedimentDelta",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "f32",
      values: deltas.sedimentDelta,
      meta: defineVizMeta("morphology.geomorphology.sedimentDelta", {
        label: "Sediment Delta",
        group: GROUP_GEOMORPHOLOGY,
        visibility: "debug",
      }),
    });

    dumpScalarFieldVariants(context.trace, context.viz, {
      dataTypeKey: "morphology.topography.elevation",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      field: { format: "i16", values: heightfield.elevation },
      label: "Elevation (After Geomorphology)",
      group: GROUP_GEOMORPHOLOGY,
      palette: "continuous",
      points: {},
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "morphology.topography.landMask",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: heightfield.landMask,
      meta: defineVizMeta("morphology.topography.landMask", {
        label: "Land Mask (After Geomorphology)",
        group: GROUP_GEOMORPHOLOGY,
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "morphology.topography.bathymetry",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "i16",
      values: bathymetry,
      meta: defineVizMeta("morphology.topography.bathymetry", {
        label: "Bathymetry (After Geomorphology)",
        group: GROUP_GEOMORPHOLOGY,
        visibility: "debug",
      }),
    });

    context.trace.event(() => {
      const size = Math.max(0, (width | 0) * (height | 0));
      const landMask = heightfield.landMask;

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
            if (heightfield.landMask[idx] !== 1) return { base: "~" };
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
            if (heightfield.landMask[idx] !== 1) return { base: "~" };
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
  },
});
