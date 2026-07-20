import { createStep } from "@swooper/mapgen-core/authoring";
import { interleaveXY } from "@swooper/mapgen-viz";
import { defineStandardVizMeta } from "../../../../viz.js";
import { CrustEvolutionStepContract } from "./config.js";

const GROUP_CRUST = "Foundation / Crust";

/**
 * Evolves initial crust with current tectonics and accumulated history into the
 * final crust vintage consumed by Morphology, without projecting history as relief.
 */
export const CrustEvolutionStep = createStep(CrustEvolutionStepContract, {
  run: (context, config, ops, deps) => {
    const mesh = deps.artifacts.foundationMesh.read(context);
    const crustInit = deps.artifacts.foundationCrustInit.read(context);
    const tectonics = deps.artifacts.foundationTectonics.read(context);
    const tectonicHistory = deps.artifacts.foundationTectonicHistory.read(context);

    const crustResult = ops.computeCrustEvolution(
      {
        mesh,
        crustInit,
        tectonics,
        tectonicHistory,
      },
      config.computeCrustEvolution
    );

    deps.artifacts.foundationCrust.publish(context, crustResult.crust);
    return { mesh, crust: crustResult.crust };
  },
  viz: ({ result: { mesh, crust } }) => {
    const positions = interleaveXY(mesh.siteX, mesh.siteY);
    return [
      {
        kind: "points",
        dataTypeKey: "foundation.crust.cellType",
        spaceId: "world.xy",
        positions,
        values: { format: "u8", values: crust.type },
        meta: defineStandardVizMeta("foundation.crust.cellType", "category.distinct", {
          label: "Crust Cell Type",
          group: GROUP_CRUST,
        }),
      },
      {
        kind: "points",
        dataTypeKey: "foundation.crust.cellAge",
        spaceId: "world.xy",
        positions,
        values: { format: "u8", values: crust.age },
        meta: defineStandardVizMeta("foundation.crust.cellAge", "field.intensity", {
          label: "Crust Thermal Age",
          group: GROUP_CRUST,
        }),
      },
      ...(
        [
          ["foundation.crust.maturity", "Crust Maturity", crust.maturity, undefined],
          ["foundation.crust.thickness", "Crust Thickness", crust.thickness, "debug"],
          ["foundation.crust.strength", "Crust Strength", crust.strength, "debug"],
        ] as const
      ).map(([dataTypeKey, label, values, visibility]) => ({
        kind: "points" as const,
        dataTypeKey,
        spaceId: "world.xy" as const,
        positions,
        values: { format: "f32" as const, values },
        meta: defineStandardVizMeta(dataTypeKey, "field.intensity", {
          label,
          group: GROUP_CRUST,
          visibility,
        }),
      })),
      {
        kind: "points",
        dataTypeKey: "foundation.crust.cellBaseElevation",
        spaceId: "world.xy",
        positions,
        values: { format: "f32", values: crust.baseElevation },
        meta: defineStandardVizMeta("foundation.crust.cellBaseElevation", "terrain.elevation", {
          label: "Crust Cell Base Elevation",
          group: GROUP_CRUST,
        }),
      },
    ];
  },
});
