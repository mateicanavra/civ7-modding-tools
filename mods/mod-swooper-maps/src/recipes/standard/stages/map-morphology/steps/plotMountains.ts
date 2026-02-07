import {
  HILL_TERRAIN,
  MOUNTAIN_TERRAIN,
  BYTE_SHADE_RAMP,
  computeSampleStep,
  defineVizMeta,
  logMountainSummary,
  logReliefAscii,
  shadeByte,
  renderAsciiGrid,
} from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
import { clampFinite } from "@swooper/mapgen-core/lib/math";
import { PerlinNoise } from "@swooper/mapgen-core/lib/noise";
import { deriveStepSeed } from "@swooper/mapgen-core/lib/rng";
import PlotMountainsStepContract from "./plotMountains.contract.js";
import { assertNoWaterDrift } from "./assertions.js";
import {
  MORPHOLOGY_OROGENY_HILL_THRESHOLD_DELTA,
  MORPHOLOGY_OROGENY_MOUNTAIN_THRESHOLD_DELTA,
  MORPHOLOGY_OROGENY_TECTONIC_INTENSITY_MULTIPLIER,
} from "@mapgen/domain/morphology/shared/knob-multipliers.js";
import type { MorphologyOrogenyKnob } from "@mapgen/domain/morphology/shared/knobs.js";

const GROUP_MAP_MORPHOLOGY = "Map / Morphology (Engine)";
const GROUP_BELT_DRIVERS = "Morphology / Belt Drivers";
const TILE_SPACE_ID = "tile.hexOddR" as const;

function buildFractalArray(
  width: number,
  height: number,
  seed: number,
  grain: number
): Int16Array {
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

export default createStep(PlotMountainsStepContract, {
  normalize: (config, ctx) => {
    const { orogeny } = ctx.knobs as Readonly<{ orogeny?: MorphologyOrogenyKnob }>;
    const multiplier = MORPHOLOGY_OROGENY_TECTONIC_INTENSITY_MULTIPLIER[orogeny ?? "normal"] ?? 1.0;
    const mountainThresholdDelta = MORPHOLOGY_OROGENY_MOUNTAIN_THRESHOLD_DELTA[orogeny ?? "normal"] ?? 0;
    const hillThresholdDelta = MORPHOLOGY_OROGENY_HILL_THRESHOLD_DELTA[orogeny ?? "normal"] ?? 0;

    const ridgesSelection =
      config.ridges.strategy === "default"
        ? {
            ...config.ridges,
            config: {
              ...config.ridges.config,
              tectonicIntensity: clampFinite(config.ridges.config.tectonicIntensity * multiplier, 0),
              mountainThreshold: clampFinite(config.ridges.config.mountainThreshold + mountainThresholdDelta, 0),
              hillThreshold: clampFinite(config.ridges.config.hillThreshold + hillThresholdDelta, 0),
            },
          }
        : config.ridges;

    const foothillsSelection =
      config.foothills.strategy === "default"
        ? {
            ...config.foothills,
            config: {
              ...config.foothills.config,
              tectonicIntensity: clampFinite(config.foothills.config.tectonicIntensity * multiplier, 0),
              mountainThreshold: clampFinite(
                config.foothills.config.mountainThreshold + mountainThresholdDelta,
                0
              ),
              hillThreshold: clampFinite(config.foothills.config.hillThreshold + hillThresholdDelta, 0),
            },
          }
        : config.foothills;

    return { ...config, ridges: ridgesSelection, foothills: foothillsSelection };
  },
  run: (context, config, ops, deps) => {
    const topography = deps.artifacts.topography.read(context);
    const beltDrivers = deps.artifacts.beltDrivers.read(context);
    const { width, height } = context.dimensions;
    const baseSeed = deriveStepSeed(context.env.seed, "morphology:planMountains");

    const fractalMountain = buildFractalArray(width, height, baseSeed ^ 0x3d, 5);
    const fractalHill = buildFractalArray(width, height, baseSeed ^ 0x5f, 5);

    const ridges = ops.ridges(
      {
        width,
        height,
        landMask: topography.landMask,
        boundaryCloseness: beltDrivers.boundaryCloseness,
        boundaryType: beltDrivers.boundaryType,
        upliftPotential: beltDrivers.upliftPotential,
        riftPotential: beltDrivers.riftPotential,
        tectonicStress: beltDrivers.tectonicStress,
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
        boundaryCloseness: beltDrivers.boundaryCloseness,
        boundaryType: beltDrivers.boundaryType,
        upliftPotential: beltDrivers.upliftPotential,
        riftPotential: beltDrivers.riftPotential,
        tectonicStress: beltDrivers.tectonicStress,
        fractalHill,
      },
      config.foothills
    );

    const plan = {
      mountainMask: ridges.mountainMask,
      hillMask: foothills.hillMask,
      orogenyPotential01: ridges.orogenyPotential01,
      fracture01: ridges.fracture01,
    } as const;

    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "morphology.belts.boundaryCloseness",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: beltDrivers.boundaryCloseness,
      meta: defineVizMeta("morphology.belts.boundaryCloseness", {
        label: "Belt Boundary Closeness",
        group: GROUP_BELT_DRIVERS,
        visibility: "debug",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "morphology.belts.boundaryType",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: beltDrivers.boundaryType,
      meta: defineVizMeta("morphology.belts.boundaryType", {
        label: "Belt Boundary Type",
        group: GROUP_BELT_DRIVERS,
        visibility: "debug",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "morphology.belts.upliftPotential",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: beltDrivers.upliftPotential,
      meta: defineVizMeta("morphology.belts.upliftPotential", {
        label: "Belt Uplift Potential",
        group: GROUP_BELT_DRIVERS,
        visibility: "debug",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "morphology.belts.riftPotential",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: beltDrivers.riftPotential,
      meta: defineVizMeta("morphology.belts.riftPotential", {
        label: "Belt Rift Potential",
        group: GROUP_BELT_DRIVERS,
        visibility: "debug",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "morphology.belts.tectonicStress",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: beltDrivers.tectonicStress,
      meta: defineVizMeta("morphology.belts.tectonicStress", {
        label: "Belt Tectonic Stress",
        group: GROUP_BELT_DRIVERS,
        visibility: "debug",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "morphology.belts.mask",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: beltDrivers.beltMask,
      meta: defineVizMeta("morphology.belts.mask", {
        label: "Belt Mask",
        group: GROUP_BELT_DRIVERS,
        visibility: "debug",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "morphology.belts.distance",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: beltDrivers.beltDistance,
      meta: defineVizMeta("morphology.belts.distance", {
        label: "Belt Distance",
        group: GROUP_BELT_DRIVERS,
        visibility: "debug",
      }),
    });

    context.trace.event(() => {
      const totals = { convergent: 0, divergent: 0, transform: 0 };
      for (const component of beltDrivers.beltComponents) {
        if (component.boundaryType === 1) totals.convergent += 1;
        if (component.boundaryType === 2) totals.divergent += 1;
        if (component.boundaryType === 3) totals.transform += 1;
      }
      return {
        kind: "morphology.belts.summary",
        componentCount: beltDrivers.beltComponents.length,
        componentCounts: totals,
        components: beltDrivers.beltComponents.slice(0, 64),
        truncated: beltDrivers.beltComponents.length > 64,
      };
    });

    if (plan.mountainMask instanceof Uint8Array) {
      context.viz?.dumpGrid(context.trace, {
        dataTypeKey: "map.morphology.mountains.mountainMask",
        spaceId: TILE_SPACE_ID,
        dims: { width, height },
        format: "u8",
        values: plan.mountainMask,
        meta: defineVizMeta("map.morphology.mountains.mountainMask", {
          label: "Mountain Mask (Planned)",
          group: GROUP_MAP_MORPHOLOGY,
        }),
      });
    }
    if (plan.hillMask instanceof Uint8Array) {
      context.viz?.dumpGrid(context.trace, {
        dataTypeKey: "map.morphology.mountains.hillMask",
        spaceId: TILE_SPACE_ID,
        dims: { width, height },
        format: "u8",
        values: plan.hillMask,
        meta: defineVizMeta("map.morphology.mountains.hillMask", {
          label: "Hill Mask (Planned)",
          group: GROUP_MAP_MORPHOLOGY,
          visibility: "debug",
        }),
      });
    }
    if (plan.orogenyPotential01 instanceof Uint8Array) {
      context.viz?.dumpGrid(context.trace, {
        dataTypeKey: "map.morphology.mountains.orogenyPotential01",
        spaceId: TILE_SPACE_ID,
        dims: { width, height },
        format: "u8",
        values: plan.orogenyPotential01,
        meta: defineVizMeta("map.morphology.mountains.orogenyPotential01", {
          label: "Orogeny Potential (Planned)",
          group: GROUP_MAP_MORPHOLOGY,
          visibility: "debug",
        }),
      });
    }
    if (plan.fracture01 instanceof Uint8Array) {
      context.viz?.dumpGrid(context.trace, {
        dataTypeKey: "map.morphology.mountains.fracture01",
        spaceId: TILE_SPACE_ID,
        dims: { width, height },
        format: "u8",
        values: plan.fracture01,
        meta: defineVizMeta("map.morphology.mountains.fracture01", {
          label: "Fracture (Planned)",
          group: GROUP_MAP_MORPHOLOGY,
          visibility: "debug",
        }),
      });
    }

    context.trace.event(() => {
      const size = Math.max(0, (width | 0) * (height | 0));
      let landTiles = 0;
      let mountainTiles = 0;
      let hillTiles = 0;
      for (let i = 0; i < size; i++) {
        if (topography.landMask[i] !== 1) continue;
        landTiles += 1;
        if (plan.mountainMask[i] === 1) mountainTiles += 1;
        if (plan.hillMask[i] === 1) hillTiles += 1;
      }
      return {
        kind: "morphology.mountains.summary",
        landTiles,
        mountainTiles,
        hillTiles,
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
            plan.mountainMask[idx] === 1 ? "M" : plan.hillMask[idx] === 1 ? "h" : undefined;
          return { base, overlay };
        },
      });
      return {
        kind: "morphology.mountains.ascii.reliefMask",
        sampleStep,
        legend: ".=land ~=water M=mountain h=hill",
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
          return { base: shadeByte(plan.orogenyPotential01?.[idx] ?? 0) };
        },
      });
      return {
        kind: "morphology.mountains.ascii.orogenyPotential01",
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
          return { base: shadeByte(plan.fracture01?.[idx] ?? 0) };
        },
      });
      return {
        kind: "morphology.mountains.ascii.fracture01",
        sampleStep,
        legend: `${BYTE_SHADE_RAMP} (low→high)`,
        rows,
      };
    });

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        if (topography.landMask[idx] !== 1) continue;
        if (plan.mountainMask[idx] === 1) {
          context.adapter.setTerrainType(x, y, MOUNTAIN_TERRAIN);
          continue;
        }
        if (plan.hillMask[idx] === 1) {
          context.adapter.setTerrainType(x, y, HILL_TERRAIN);
        }
      }
    }

    logMountainSummary(context.trace, context.adapter, width, height);
    logReliefAscii(context.trace, context.adapter, width, height);
    assertNoWaterDrift(context, topography.landMask, "map-morphology/plot-mountains");
  },
});
