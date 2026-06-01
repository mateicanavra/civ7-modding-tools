import {
  BYTE_SHADE_RAMP,
  computeSampleStep,
  defineVizMeta,
  renderAsciiGrid,
  shadeByte,
} from "@swooper/mapgen-core";
import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";
import { clampFinite } from "@swooper/mapgen-core/lib/math";
import { PerlinNoise } from "@swooper/mapgen-core/lib/noise";
import { deriveStepSeed } from "@swooper/mapgen-core/lib/rng";
import {
  MORPHOLOGY_OROGENY_HILL_THRESHOLD_DELTA,
  MORPHOLOGY_OROGENY_MOUNTAIN_THRESHOLD_DELTA,
  MORPHOLOGY_OROGENY_TECTONIC_INTENSITY_MULTIPLIER,
  assertSameMountainFamilySelection,
} from "@mapgen/domain/morphology/config.js";
import type { MorphologyOrogenyKnob } from "@mapgen/domain/morphology/config.js";

import { morphologyArtifacts } from "../../morphology/artifacts.js";
import MountainsStepContract from "./mountains.contract.js";

const GROUP_MORPHOLOGY_FEATURES = "Morphology / Features";
const TILE_SPACE_ID = "tile.hexOddR" as const;

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

export default createStep(MountainsStepContract, {
  artifacts: implementArtifacts([morphologyArtifacts.mountains], {
    mountains: {},
  }),
  normalize: (config, ctx) => {
    assertSameMountainFamilySelection(config.ridges, config.foothills);

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

    const plan = {
      mountainMask: ridges.mountainMask,
      hillMask: foothills.hillMask,
      orogenyPotential: ridges.orogenyPotential,
      fracturePotential: ridges.fracturePotential,
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
