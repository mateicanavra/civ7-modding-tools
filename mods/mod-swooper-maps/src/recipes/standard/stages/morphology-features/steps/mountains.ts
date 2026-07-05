import {
  MORPHOLOGY_OROGENY_HILL_THRESHOLD_DELTA,
  MORPHOLOGY_OROGENY_MOUNTAIN_THRESHOLD_DELTA,
  MORPHOLOGY_OROGENY_TECTONIC_INTENSITY_MULTIPLIER,
} from "@mapgen/domain/morphology/model/policy/landform-knob-policy.js";
import {
  BYTE_SHADE_RAMP,
  computeSampleStep,
  defineVizMeta,
  deriveStepSeed,
  renderAsciiGrid,
  shadeByte,
} from "@swooper/mapgen-core";
import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";
import { clampFinite } from "@swooper/mapgen-core/lib/math";
import { PerlinNoise } from "@swooper/mapgen-core/lib/noise";

import { artifacts as morphologyArtifacts } from "../../morphology/artifacts/index.js";
import type { MorphologyOrogenyKnob } from "../index.js";
import MountainsStepContract from "./mountains.contract.js";

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

type MountainFamilySelection = Readonly<{
  strategy?: unknown;
  config?: unknown;
}>;

function stableConfigString(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableConfigString).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableConfigString(item)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function stableRootConfigString(value: unknown): string {
  return stableConfigString(value === undefined ? {} : value);
}

export function assertSameMountainFamilySelection(
  ridges: MountainFamilySelection,
  foothills: MountainFamilySelection
): void {
  if (ridges.strategy !== foothills.strategy) {
    throw new Error(
      `[Morphology] Mountain-family config requires identical ridge/foothill strategies (ridges=${String(ridges.strategy)}, foothills=${String(foothills.strategy)}).`
    );
  }
  const ridgeConfig = stableRootConfigString(ridges.config);
  const foothillConfig = stableRootConfigString(foothills.config);
  if (ridgeConfig !== foothillConfig) {
    throw new Error(
      "[Morphology] Mountain-family config requires identical ridge/foothill config; tune the shared terrain-classification posture once, not as divergent op-local worlds."
    );
  }
}

export default createStep(MountainsStepContract, {
  artifacts: implementArtifacts([morphologyArtifacts.mountains], {
    mountains: {},
  }),
  normalize: (config, ctx) => {
    assertSameMountainFamilySelection(config.ridges, config.foothills);
    assertSameMountainFamilySelection(config.ridges, config.roughLands);

    const { orogeny } = ctx.knobs as Readonly<{ orogeny?: MorphologyOrogenyKnob }>;
    const multiplier = MORPHOLOGY_OROGENY_TECTONIC_INTENSITY_MULTIPLIER[orogeny ?? "normal"] ?? 1.0;
    const mountainThresholdDelta =
      MORPHOLOGY_OROGENY_MOUNTAIN_THRESHOLD_DELTA[orogeny ?? "normal"] ?? 0;
    const hillThresholdDelta = MORPHOLOGY_OROGENY_HILL_THRESHOLD_DELTA[orogeny ?? "normal"] ?? 0;

    const ridgesSelection =
      config.ridges.strategy === "default"
        ? {
            ...config.ridges,
            config: {
              ...config.ridges.config,
              tectonicIntensity: clampFinite(
                config.ridges.config.tectonicIntensity * multiplier,
                0
              ),
              mountainThreshold: clampFinite(
                config.ridges.config.mountainThreshold + mountainThresholdDelta,
                0
              ),
              hillThreshold: clampFinite(
                config.ridges.config.hillThreshold + hillThresholdDelta,
                0
              ),
            },
          }
        : config.ridges;

    const foothillsSelection =
      config.foothills.strategy === "default"
        ? {
            ...config.foothills,
            config: {
              ...config.foothills.config,
              tectonicIntensity: clampFinite(
                config.foothills.config.tectonicIntensity * multiplier,
                0
              ),
              mountainThreshold: clampFinite(
                config.foothills.config.mountainThreshold + mountainThresholdDelta,
                0
              ),
              hillThreshold: clampFinite(
                config.foothills.config.hillThreshold + hillThresholdDelta,
                0
              ),
            },
          }
        : config.foothills;

    const roughLandsSelection =
      config.roughLands.strategy === "default"
        ? {
            ...config.roughLands,
            config: {
              ...config.roughLands.config,
              tectonicIntensity: clampFinite(
                config.roughLands.config.tectonicIntensity * multiplier,
                0
              ),
              mountainThreshold: clampFinite(
                config.roughLands.config.mountainThreshold + mountainThresholdDelta,
                0
              ),
              hillThreshold: clampFinite(
                config.roughLands.config.hillThreshold + hillThresholdDelta,
                0
              ),
            },
          }
        : config.roughLands;

    return {
      ...config,
      ridges: ridgesSelection,
      foothills: foothillsSelection,
      roughLands: roughLandsSelection,
    };
  },
  run: (context, config, ops, deps) => {
    const topography = deps.artifacts.topography.read(context);
    const beltDrivers = deps.artifacts.beltDrivers.read(context);
    const substrate = deps.artifacts.substrate.read(context);
    const routing = deps.artifacts.routing.read(context);
    const coastlineMetrics = deps.artifacts.coastlineMetrics.read(context);
    const { width, height } = context.dimensions;
    const baseSeed = deriveStepSeed(context.env.seed, "morphology:planMountains");

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
      config.ridges
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
      config.foothills
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
        distanceToCoast: coastlineMetrics.distanceToCoast,
        fractalRoughLand,
      },
      config.roughLands
    );

    const size = Math.max(0, (width | 0) * (height | 0));
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

    // Belt-driver diagnostics stay with the producing landmass-plates step.
    // This consumer only publishes mountain intent diagnostics derived from
    // those drivers, which keeps viz ownership aligned with artifact ownership.

    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "morphology.mountains.mountainMask",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: plan.mountainMask,
      meta: defineVizMeta("morphology.mountains.mountainMask", {
        label: "Mountain Mask (Planned)",
        group: GROUP_MORPHOLOGY_FEATURES,
        categories: [
          { value: 0, label: "Not mountain", color: [148, 163, 184, 0] },
          { value: 1, label: "Mountain", color: [250, 204, 21, 240] },
        ],
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "morphology.mountains.hillMask",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: plan.hillMask,
      meta: defineVizMeta("morphology.mountains.hillMask", {
        label: "Hill Mask (Planned)",
        group: GROUP_MORPHOLOGY_FEATURES,
        visibility: "debug",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "morphology.mountains.mountainRegionMask",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: plan.mountainRegionMask,
      meta: defineVizMeta("morphology.mountains.mountainRegionMask", {
        label: "Mountain Region Footprint (Planned)",
        group: GROUP_MORPHOLOGY_FEATURES,
        visibility: "debug",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "morphology.mountains.foothillMask",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: plan.foothillMask,
      meta: defineVizMeta("morphology.mountains.foothillMask", {
        label: "Foothill Mask (Planned)",
        group: GROUP_MORPHOLOGY_FEATURES,
        visibility: "debug",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "morphology.mountains.roughLandMask",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: plan.roughLandMask,
      meta: defineVizMeta("morphology.mountains.roughLandMask", {
        label: "Rough-Land Hill Mask (Planned)",
        group: GROUP_MORPHOLOGY_FEATURES,
        visibility: "debug",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "morphology.mountains.orogenyPotential",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: plan.orogenyPotential,
      meta: defineVizMeta("morphology.mountains.orogenyPotential", {
        label: "Orogeny Potential (Planned)",
        group: GROUP_MORPHOLOGY_FEATURES,
        visibility: "debug",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "morphology.mountains.fracturePotential",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: plan.fracturePotential,
      meta: defineVizMeta("morphology.mountains.fracturePotential", {
        label: "Fracture (Planned)",
        group: GROUP_MORPHOLOGY_FEATURES,
        visibility: "debug",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "morphology.mountains.roughnessPotential",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: plan.roughnessPotential,
      meta: defineVizMeta("morphology.mountains.roughnessPotential", {
        label: "Rough-Land Potential (Planned)",
        group: GROUP_MORPHOLOGY_FEATURES,
        palette: "continuous",
        visibility: "debug",
      }),
    });

    context.trace.event(() => {
      const size = Math.max(0, (width | 0) * (height | 0));
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
    context.trace.event(() => {
      const sampleStep = computeSampleStep(width, height);
      const rows = renderAsciiGrid({
        width,
        height,
        sampleStep,
        cellFn: (x, y) => {
          const idx = y * width + x;
          const base = topography.landMask[idx] === 1 ? "." : "~";
          const overlay =
            plan.mountainMask[idx] === 1
              ? "M"
              : plan.foothillMask[idx] === 1
                ? "f"
                : plan.roughLandMask[idx] === 1
                  ? "r"
                  : undefined;
          return { base, overlay };
        },
      });
      return {
        kind: "morphology.mountains.ascii.reliefMask",
        sampleStep,
        legend: ".=land ~=water M=mountain f=foothill r=rough-land hill",
        rows,
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
          return { base: shadeByte(plan.orogenyPotential[idx] ?? 0) };
        },
      });
      return {
        kind: "morphology.mountains.ascii.orogenyPotential",
        sampleStep,
        legend: `${BYTE_SHADE_RAMP} (low→high)`,
        rows,
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
          return { base: shadeByte(plan.fracturePotential[idx] ?? 0) };
        },
      });
      return {
        kind: "morphology.mountains.ascii.fracturePotential",
        sampleStep,
        legend: `${BYTE_SHADE_RAMP} (low→high)`,
        rows,
      };
    });

    deps.artifacts.mountains.publish(context, plan);
  },
});
