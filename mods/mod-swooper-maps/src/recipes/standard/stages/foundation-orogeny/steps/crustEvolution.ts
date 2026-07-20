import {
  artifacts as foundationArtifacts,
  validators as foundationArtifactValidators,
} from "@mapgen/domain/foundation";
import {
  resolveContinentalAbundance,
  resolveContinentalRelief,
} from "@mapgen/domain/foundation/model/policy/crust-character.js";
import { defineVizMeta } from "@swooper/mapgen-core";
import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";
import { interleaveXY } from "../../foundation/viz.js";
import CrustEvolutionStepContract from "./crustEvolution.contract.js";

const GROUP_CRUST = "Foundation / Crust";

export default createStep(CrustEvolutionStepContract, {
  artifacts: implementArtifacts([foundationArtifacts.crust], {
    foundationCrust: {
      validate: (value) => foundationArtifactValidators.crust(value),
    },
  }),
  // Explicit knobs remain late semantic overrides over public crustCharacter; omitted knobs stay
  // undefined so they cannot replace authored crust-character fields with neutral defaults.
  normalize: (config, ctx) => {
    const { continentalAbundance, continentalRelief } = ctx.knobs as Readonly<{
      continentalAbundance?: number;
      continentalRelief?: number;
    }>;
    if (config.computeCrustEvolution.strategy !== "default") return config;
    if (continentalAbundance === undefined && continentalRelief === undefined) return config;
    return {
      ...config,
      computeCrustEvolution: {
        ...config.computeCrustEvolution,
        config: {
          ...config.computeCrustEvolution.config,
          ...(continentalAbundance === undefined
            ? {}
            : resolveContinentalAbundance(continentalAbundance)),
          ...(continentalRelief === undefined ? {} : resolveContinentalRelief(continentalRelief)),
        },
      },
    };
  },
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

    const positions = interleaveXY(mesh.siteX, mesh.siteY);
    context.viz?.dumpPoints(context.trace, {
      dataTypeKey: "foundation.crust.cellType",
      spaceId: "world.xy",
      positions,
      values: crustResult.crust.type,
      valueFormat: "u8",
      meta: defineVizMeta("foundation.crust.cellType", {
        label: "Crust Cell Type",
        group: GROUP_CRUST,
      }),
    });
    context.viz?.dumpPoints(context.trace, {
      dataTypeKey: "foundation.crust.cellAge",
      spaceId: "world.xy",
      positions,
      values: crustResult.crust.age,
      valueFormat: "u8",
      meta: defineVizMeta("foundation.crust.cellAge", {
        label: "Crust Thermal Age",
        group: GROUP_CRUST,
      }),
    });
    context.viz?.dumpPoints(context.trace, {
      dataTypeKey: "foundation.crust.maturity",
      spaceId: "world.xy",
      positions,
      values: crustResult.crust.maturity,
      valueFormat: "f32",
      meta: defineVizMeta("foundation.crust.maturity", {
        label: "Crust Maturity",
        group: GROUP_CRUST,
      }),
    });
    context.viz?.dumpPoints(context.trace, {
      dataTypeKey: "foundation.crust.thickness",
      spaceId: "world.xy",
      positions,
      values: crustResult.crust.thickness,
      valueFormat: "f32",
      meta: defineVizMeta("foundation.crust.thickness", {
        label: "Crust Thickness",
        group: GROUP_CRUST,
        visibility: "debug",
      }),
    });
    context.viz?.dumpPoints(context.trace, {
      dataTypeKey: "foundation.crust.strength",
      spaceId: "world.xy",
      positions,
      values: crustResult.crust.strength,
      valueFormat: "f32",
      meta: defineVizMeta("foundation.crust.strength", {
        label: "Crust Strength",
        group: GROUP_CRUST,
        visibility: "debug",
      }),
    });
    context.viz?.dumpPoints(context.trace, {
      dataTypeKey: "foundation.crust.cellBaseElevation",
      spaceId: "world.xy",
      positions,
      values: crustResult.crust.baseElevation,
      valueFormat: "f32",
      meta: defineVizMeta("foundation.crust.cellBaseElevation", {
        label: "Crust Cell Base Elevation",
        group: GROUP_CRUST,
      }),
    });
  },
});
