import {
  MORPHOLOGY_OROGENY_HILL_THRESHOLD_DELTA,
  MORPHOLOGY_OROGENY_MOUNTAIN_THRESHOLD_DELTA,
  MORPHOLOGY_OROGENY_TECTONIC_INTENSITY_MULTIPLIER,
} from "@mapgen/domain/morphology/modules/landforms/model/policy/landform-knob-policy.js";
import { deriveStepSeed } from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
import { clampFinite } from "@swooper/mapgen-core/lib/math";
import { PerlinNoise } from "@swooper/mapgen-core/lib/noise";
import {
  defineStandardVizCategoryMeta,
  defineStandardVizMeta,
  STANDARD_VIZ_COLORS,
} from "../../../../../viz.js";
import type { MorphologyMountainRangesKnob, MorphologyOrogenyKnob } from "../../index.js";
import { config } from "./config.js";
import { resolveMountainRangesControl } from "./mountain-ranges.js";

const GROUP_MORPHOLOGY_FEATURES = "Morphology / Features";
const TILE_SPACE_ID = "tile.hexOddQ" as const;

function buildFractalArray(width: number, height: number, seed: number, grain: number): Int16Array {
  const fractal = new Int16Array(width * height);
  const perlin = new PerlinNoise(seed | 0);
  const scale = 1 / Math.max(1, Math.round(grain));
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const noise = perlin.noise2D(x * scale, y * scale);
      const normalized = Math.max(0, Math.min(1, (noise + 1) / 2));
      fractal[i] = Math.round(normalized * 255);
    }
  }
  return fractal;
}

/**
 * Plans ridges, foothills, and rough lands from shared terrain drivers under
 * one family selection, leaving Civ7 terrain stamping to map-morphology.
 */
export const MountainsStep = createStep(config, {
  normalize: (stepConfig, ctx) => {
    const { orogeny, mountainRanges } = ctx.knobs as Readonly<{
      orogeny?: MorphologyOrogenyKnob;
      mountainRanges?: MorphologyMountainRangesKnob | null;
    }>;
    const coupledConfig =
      mountainRanges === null || mountainRanges === undefined
        ? undefined
        : resolveMountainRangesControl(mountainRanges);
    const multiplier = MORPHOLOGY_OROGENY_TECTONIC_INTENSITY_MULTIPLIER[orogeny ?? "normal"] ?? 1.0;
    const mountainThresholdDelta =
      MORPHOLOGY_OROGENY_MOUNTAIN_THRESHOLD_DELTA[orogeny ?? "normal"] ?? 0;
    const hillThresholdDelta = MORPHOLOGY_OROGENY_HILL_THRESHOLD_DELTA[orogeny ?? "normal"] ?? 0;

    const authoredRidges =
      coupledConfig === undefined || stepConfig.ridges.strategy !== "orogenic-range-growth"
        ? stepConfig.ridges
        : { ...stepConfig.ridges, config: coupledConfig };
    const authoredFoothills =
      coupledConfig === undefined || stepConfig.foothills.strategy !== "mountain-proximity"
        ? stepConfig.foothills
        : { ...stepConfig.foothills, config: coupledConfig };
    const authoredRoughLands =
      coupledConfig === undefined || stepConfig.roughLands.strategy !== "relief-substrate-clusters"
        ? stepConfig.roughLands
        : { ...stepConfig.roughLands, config: coupledConfig };

    const ridgesSelection =
      authoredRidges.strategy === "orogenic-range-growth"
        ? {
            ...authoredRidges,
            config: {
              ...authoredRidges.config,
              tectonicIntensity: clampFinite(
                authoredRidges.config.tectonicIntensity * multiplier,
                0
              ),
              mountainThreshold: clampFinite(
                authoredRidges.config.mountainThreshold + mountainThresholdDelta,
                0
              ),
              hillThreshold: clampFinite(
                authoredRidges.config.hillThreshold + hillThresholdDelta,
                0
              ),
            },
          }
        : authoredRidges;

    const foothillsSelection =
      authoredFoothills.strategy === "mountain-proximity"
        ? {
            ...authoredFoothills,
            config: {
              ...authoredFoothills.config,
              tectonicIntensity: clampFinite(
                authoredFoothills.config.tectonicIntensity * multiplier,
                0
              ),
              mountainThreshold: clampFinite(
                authoredFoothills.config.mountainThreshold + mountainThresholdDelta,
                0
              ),
              hillThreshold: clampFinite(
                authoredFoothills.config.hillThreshold + hillThresholdDelta,
                0
              ),
            },
          }
        : authoredFoothills;

    const roughLandsSelection =
      authoredRoughLands.strategy === "relief-substrate-clusters"
        ? {
            ...authoredRoughLands,
            config: {
              ...authoredRoughLands.config,
              tectonicIntensity: clampFinite(
                authoredRoughLands.config.tectonicIntensity * multiplier,
                0
              ),
              mountainThreshold: clampFinite(
                authoredRoughLands.config.mountainThreshold + mountainThresholdDelta,
                0
              ),
              hillThreshold: clampFinite(
                authoredRoughLands.config.hillThreshold + hillThresholdDelta,
                0
              ),
            },
          }
        : authoredRoughLands;

    return {
      ...stepConfig,
      ridges: ridgesSelection,
      foothills: foothillsSelection,
      roughLands: roughLandsSelection,
    };
  },
  run: (context, stepConfig, ops, deps) => {
    const topography = deps.artifacts.topography.read(context);
    const beltDrivers = deps.artifacts.beltDrivers.read(context);
    const substrate = deps.artifacts.substrate.read(context);
    const routing = deps.artifacts.routing.read(context);
    const carvedCoastline = deps.artifacts.carvedCoastline.read(context);
    const { width, height } = context.setup.dimensions;
    const baseSeed = deriveStepSeed(context.setup.mapSeed, "morphology:planMountains");

    const fractalMountain = buildFractalArray(width, height, baseSeed ^ 0x3d, 5);
    const fractalHill = buildFractalArray(width, height, baseSeed ^ 0x5f, 5);
    const fractalRoughLand = buildFractalArray(width, height, baseSeed ^ 0xa7, 9);

    const ridges = ops.ridges(
      {
        width,
        height,
        landMask: topography.landMask,
        boundaryCloseness: beltDrivers.boundaryCloseness,
        boundaryType: beltDrivers.boundaryType,
        upliftPotential: beltDrivers.upliftPotential,
        collisionPotential: beltDrivers.collisionPotential,
        subductionPotential: beltDrivers.subductionPotential,
        riftPotential: beltDrivers.riftPotential,
        tectonicStress: beltDrivers.tectonicStress,
        beltAge: beltDrivers.beltAge,
        fractalMountain,
      },
      stepConfig.ridges
    );
    const foothills = ops.foothills(
      {
        width,
        height,
        landMask: topography.landMask,
        mountainMask: ridges.mountainMask,
        mountainRegionMask: ridges.mountainRegionMask,
        mountainRegionIdByTile: ridges.mountainRegionIdByTile,
        boundaryCloseness: beltDrivers.boundaryCloseness,
        boundaryType: beltDrivers.boundaryType,
        upliftPotential: beltDrivers.upliftPotential,
        collisionPotential: beltDrivers.collisionPotential,
        subductionPotential: beltDrivers.subductionPotential,
        riftPotential: beltDrivers.riftPotential,
        tectonicStress: beltDrivers.tectonicStress,
        beltAge: beltDrivers.beltAge,
        fractalHill,
      },
      stepConfig.foothills
    );
    const roughLands = ops.roughLands(
      {
        width,
        height,
        landMask: topography.landMask,
        mountainMask: ridges.mountainMask,
        mountainRegionMask: ridges.mountainRegionMask,
        mountainRegionIdByTile: ridges.mountainRegionIdByTile,
        foothillMask: foothills.hillMask,
        elevation: topography.elevation,
        seaLevel: topography.seaLevel,
        boundaryCloseness: beltDrivers.boundaryCloseness,
        boundaryType: beltDrivers.boundaryType,
        upliftPotential: beltDrivers.upliftPotential,
        riftPotential: beltDrivers.riftPotential,
        tectonicStress: beltDrivers.tectonicStress,
        beltAge: beltDrivers.beltAge,
        erodibilityK: substrate.erodibilityK,
        sedimentDepth: substrate.sedimentDepth,
        flowAccum: routing.flowAccum,
        distanceToCoast: carvedCoastline.distanceToCoast,
        fractalRoughLand,
      },
      stepConfig.roughLands
    );

    const size = width * height;
    const hillMask = new Uint8Array(size);
    for (let i = 0; i < size; i++) {
      hillMask[i] = foothills.hillMask[i] === 1 || roughLands.hillMask[i] === 1 ? 1 : 0;
    }

    const plan = {
      mountainMask: ridges.mountainMask,
      mountainRegionMask: ridges.mountainRegionMask,
      mountainRegionIdByTile: ridges.mountainRegionIdByTile,
      hillMask,
      foothillMask: foothills.hillMask,
      roughLandMask: roughLands.hillMask,
      orogenyPotential: ridges.orogenyPotential,
      fracturePotential: ridges.fracturePotential,
      roughnessPotential: roughLands.roughnessPotential,
    } as const;

    context.trace.event(() => {
      const size = width * height;
      let landTiles = 0;
      let mountainTiles = 0;
      let hillTiles = 0;
      let foothillTiles = 0;
      let roughLandHillTiles = 0;
      for (let i = 0; i < size; i++) {
        if (topography.landMask[i] !== 1) continue;
        landTiles += 1;
        if (plan.mountainMask[i] === 1) mountainTiles += 1;
        if (plan.hillMask[i] === 1) hillTiles += 1;
        if (plan.foothillMask[i] === 1) foothillTiles += 1;
        if (plan.roughLandMask[i] === 1) roughLandHillTiles += 1;
      }
      return {
        kind: "morphology.mountains.summary",
        landTiles,
        mountainTiles,
        hillTiles,
        foothillTiles,
        roughLandHillTiles,
      };
    });
    deps.artifacts.mountains.publish(context, plan);
    return plan;
  },
  viz: ({ result: plan, dimensions }) => [
    {
      kind: "grid",
      dataTypeKey: "morphology.mountains.mountainMask",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "u8", values: plan.mountainMask },
      meta: defineStandardVizCategoryMeta(
        "morphology.mountains.mountainMask",
        [
          { value: 0, label: "Not mountain", color: STANDARD_VIZ_COLORS.absent },
          { value: 1, label: "Mountain", color: STANDARD_VIZ_COLORS.field.high },
        ],
        {
          label: "Mountain Mask (Planned)",
          group: GROUP_MORPHOLOGY_FEATURES,
        }
      ),
    },
    ...(
      [
        ["morphology.mountains.hillMask", "Hill Mask (Planned)", plan.hillMask],
        [
          "morphology.mountains.mountainRegionMask",
          "Mountain Region Footprint (Planned)",
          plan.mountainRegionMask,
        ],
        ["morphology.mountains.foothillMask", "Foothill Mask (Planned)", plan.foothillMask],
        [
          "morphology.mountains.roughLandMask",
          "Rough-Land Hill Mask (Planned)",
          plan.roughLandMask,
        ],
      ] as const
    ).map(([dataTypeKey, label, values]) => ({
      kind: "grid" as const,
      dataTypeKey,
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "u8" as const, values },
      meta: defineStandardVizMeta(dataTypeKey, "category.distinct", {
        label,
        group: GROUP_MORPHOLOGY_FEATURES,
        visibility: "debug",
      }),
    })),
    ...(
      [
        [
          "morphology.mountains.orogenyPotential",
          "Orogeny Potential (Planned)",
          plan.orogenyPotential,
        ],
        ["morphology.mountains.fracturePotential", "Fracture (Planned)", plan.fracturePotential],
        [
          "morphology.mountains.roughnessPotential",
          "Rough-Land Potential (Planned)",
          plan.roughnessPotential,
        ],
      ] as const
    ).map(([dataTypeKey, label, values]) => ({
      kind: "grid" as const,
      dataTypeKey,
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "u8" as const, values },
      meta: defineStandardVizMeta(dataTypeKey, "field.intensity", {
        label,
        group: GROUP_MORPHOLOGY_FEATURES,
        visibility: "debug",
      }),
    })),
  ],
});
