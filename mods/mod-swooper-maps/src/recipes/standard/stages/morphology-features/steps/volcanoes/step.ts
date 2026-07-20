import {
  MORPHOLOGY_VOLCANISM_BASE_DENSITY_MULTIPLIER,
  MORPHOLOGY_VOLCANISM_CONVERGENT_MULTIPLIER_MULTIPLIER,
  MORPHOLOGY_VOLCANISM_HOTSPOT_WEIGHT_MULTIPLIER,
} from "@mapgen/domain/morphology/model/policy/landform-knob-policy.js";
import {
  computeSampleStep,
  deriveStepSeed,
  renderAsciiGrid,
  xyFromIndex,
} from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
import { clamp01, clampFinite } from "@swooper/mapgen-core/lib/math";
import { defineStandardVizMeta } from "../../../../viz.js";
import type { MorphologyVolcanismKnob } from "../../index.js";
import { VolcanoesStepContract } from "./config.js";

type VolcanoKind = "subductionArc" | "rift" | "hotspot";

const GROUP_VOLCANOES = "Morphology / Volcanoes";
const TILE_SPACE_ID = "tile.hexOddQ" as const;

/**
 * Selects and classifies volcano intent from projected tectonic activity and
 * final land truth; engine volcano placement remains downstream.
 */
export const VolcanoesStep = createStep(VolcanoesStepContract, {
  normalize: (config, ctx) => {
    const { volcanism } = ctx.knobs as Readonly<{ volcanism?: MorphologyVolcanismKnob }>;
    const densityMultiplier =
      MORPHOLOGY_VOLCANISM_BASE_DENSITY_MULTIPLIER[volcanism ?? "normal"] ?? 1.0;
    const hotspotMultiplier =
      MORPHOLOGY_VOLCANISM_HOTSPOT_WEIGHT_MULTIPLIER[volcanism ?? "normal"] ?? 1.0;
    const convergentMultiplier =
      MORPHOLOGY_VOLCANISM_CONVERGENT_MULTIPLIER_MULTIPLIER[volcanism ?? "normal"] ?? 1.0;

    const volcanoesSelection =
      config.volcanoes.strategy === "default"
        ? {
            ...config.volcanoes,
            config: {
              ...config.volcanoes.config,
              baseDensity: clampFinite(config.volcanoes.config.baseDensity * densityMultiplier, 0),
              hotspotWeight: clampFinite(
                config.volcanoes.config.hotspotWeight * hotspotMultiplier,
                0
              ),
              convergentMultiplier: clampFinite(
                config.volcanoes.config.convergentMultiplier * convergentMultiplier,
                0
              ),
            },
          }
        : config.volcanoes;

    return { ...config, volcanoes: volcanoesSelection };
  },
  run: (context, config, ops, deps) => {
    const plates = deps.artifacts.foundationPlates.read(context);
    const topography = deps.artifacts.topography.read(context);
    const { width, height } = context.setup.dimensions;
    const rngSeed = deriveStepSeed(context.setup.mapSeed, "morphology:planVolcanoes");

    const plan = ops.volcanoes(
      {
        width,
        height,
        landMask: topography.landMask,
        boundaryCloseness: plates.boundaryCloseness,
        boundaryType: plates.boundaryType,
        shieldStability: plates.shieldStability,
        volcanism: plates.volcanism,
        rngSeed,
      },
      config.volcanoes
    );

    const size = width * height;
    const volcanoMask = new Uint8Array(size);
    const volcanoes = plan.volcanoes
      .map((entry) => entry.index | 0)
      .filter(
        (tileIndex) =>
          tileIndex >= 0 && tileIndex < size && (topography.landMask[tileIndex] | 0) === 1
      )
      .sort((a, b) => a - b)
      .map((tileIndex) => {
        volcanoMask[tileIndex] = 1;
        const bType = plates.boundaryType?.[tileIndex] ?? 0;
        const kind: VolcanoKind = bType === 1 ? "subductionArc" : bType === 2 ? "rift" : "hotspot";
        const strength01 = clamp01((plates.volcanism?.[tileIndex] ?? 0) / 255);
        return { tileIndex, kind, strength01 };
      });

    context.trace.event(() => ({
      kind: "morphology.volcanoes.summary",
      volcanoes: volcanoes.length,
    }));
    context.trace.event(() => {
      const sampleStep = computeSampleStep(width, height);
      const rows = renderAsciiGrid({
        width,
        height,
        sampleStep,
        cellFn: (x, y) => {
          const idx = y * width + x;
          const base = topography.landMask[idx] === 1 ? "." : "~";
          const overlay = volcanoMask[idx] === 1 ? "V" : undefined;
          return { base, overlay };
        },
      });
      return {
        kind: "morphology.volcanoes.ascii.indices",
        sampleStep,
        legend: ".=land ~=water V=volcano",
        rows,
      };
    });

    const volcanoEvidence = {
      volcanoMask,
      volcanoes,
    };
    deps.artifacts.volcanoes.publish(context, volcanoEvidence);
    return volcanoEvidence;
  },
  viz: ({ result: { volcanoMask, volcanoes }, dimensions }) => {
    const positions = new Float32Array(volcanoes.length * 2);
    const strengths = new Float32Array(volcanoes.length);
    for (let i = 0; i < volcanoes.length; i++) {
      const entry = volcanoes[i]!;
      const { x, y } = xyFromIndex(entry.tileIndex, dimensions.width);
      positions[i * 2] = x;
      positions[i * 2 + 1] = y;
      strengths[i] = entry.strength01;
    }
    return [
      {
        kind: "grid",
        dataTypeKey: "morphology.volcanoes.volcanoMask",
        spaceId: TILE_SPACE_ID,
        dims: dimensions,
        field: { format: "u8", values: volcanoMask },
        meta: defineStandardVizMeta("morphology.volcanoes.volcanoMask", "category.distinct", {
          label: "Volcano Mask",
          group: GROUP_VOLCANOES,
        }),
      },
      {
        kind: "points",
        dataTypeKey: "morphology.volcanoes.points",
        spaceId: TILE_SPACE_ID,
        positions,
        values: { format: "f32", values: strengths },
        meta: defineStandardVizMeta("morphology.volcanoes.points", "field.intensity", {
          label: "Volcano Points",
          group: GROUP_VOLCANOES,
        }),
      },
    ];
  },
});
