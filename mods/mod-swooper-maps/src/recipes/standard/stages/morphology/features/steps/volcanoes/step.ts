import {
  MORPHOLOGY_VOLCANISM_BASE_DENSITY_MULTIPLIER,
  MORPHOLOGY_VOLCANISM_CONVERGENT_MULTIPLIER_MULTIPLIER,
  MORPHOLOGY_VOLCANISM_HOTSPOT_WEIGHT_MULTIPLIER,
} from "@mapgen/domain/morphology/modules/landforms/model/policy/landform-knob-policy.js";
import { deriveStepSeed, xyFromIndex } from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
import { clampFinite } from "@swooper/mapgen-core/lib/math";
import { defineStandardVizMeta } from "../../../../../viz.js";
import type { MorphologyVolcanismKnob } from "../../index.js";
import { config } from "./config.js";

const GROUP_VOLCANOES = "Morphology / Volcanoes";
const TILE_SPACE_ID = "tile.hexOddQ" as const;

/**
 * Invokes the complete domain-owned volcano planner, publishes its immutable
 * intent, and leaves Civ7 materialization to the downstream projection stage.
 */
export const VolcanoesStep = createStep(config, {
  normalize: (stepConfig, ctx) => {
    const { volcanism } = ctx.knobs as Readonly<{ volcanism?: MorphologyVolcanismKnob }>;
    const densityMultiplier =
      MORPHOLOGY_VOLCANISM_BASE_DENSITY_MULTIPLIER[volcanism ?? "normal"] ?? 1.0;
    const hotspotMultiplier =
      MORPHOLOGY_VOLCANISM_HOTSPOT_WEIGHT_MULTIPLIER[volcanism ?? "normal"] ?? 1.0;
    const convergentMultiplier =
      MORPHOLOGY_VOLCANISM_CONVERGENT_MULTIPLIER_MULTIPLIER[volcanism ?? "normal"] ?? 1.0;

    const volcanoesSelection =
      stepConfig.volcanoes.strategy === "plate-hotspot-ranking"
        ? {
            ...stepConfig.volcanoes,
            config: {
              ...stepConfig.volcanoes.config,
              baseDensity: clampFinite(
                stepConfig.volcanoes.config.baseDensity * densityMultiplier,
                0
              ),
              hotspotWeight: clampFinite(
                stepConfig.volcanoes.config.hotspotWeight * hotspotMultiplier,
                0
              ),
              convergentMultiplier: clampFinite(
                stepConfig.volcanoes.config.convergentMultiplier * convergentMultiplier,
                0
              ),
            },
          }
        : stepConfig.volcanoes;

    return { ...stepConfig, volcanoes: volcanoesSelection };
  },
  run: (context, stepConfig, ops, deps) => {
    const plates = deps.artifacts.plates.read();
    const topography = deps.artifacts.topography.read();
    const { width, height } = context.setup.dimensions;
    const rngSeed = deriveStepSeed(context.setup.mapSeed, "morphology:planVolcanoes");

    const volcanoEvidence = ops.volcanoes(
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
      stepConfig.volcanoes
    );

    context.trace.event(() => ({
      kind: "morphology.volcanoes.summary",
      volcanoes: volcanoEvidence.volcanoes.length,
    }));
    deps.artifacts.volcanoes.publish(volcanoEvidence);
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
