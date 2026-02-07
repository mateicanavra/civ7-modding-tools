import { clampInt, ctxRandom, ctxRandomLabel, defineVizMeta } from "@swooper/mapgen-core";
import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";
import { foundationArtifacts } from "../artifacts.js";
import MeshStepContract from "./mesh.contract.js";
import { validateMeshArtifact, wrapFoundationValidateNoDims } from "./validation.js";
import type { FoundationPlateCountKnob } from "@mapgen/domain/foundation/shared/knobs.js";
import { interleaveXY, segmentsFromMeshNeighbors } from "./viz.js";

const GROUP_MESH = "Foundation / Mesh";

export default createStep(MeshStepContract, {
  artifacts: implementArtifacts([foundationArtifacts.mesh], {
    foundationMesh: {
      validate: (value) => wrapFoundationValidateNoDims(value, validateMeshArtifact),
    },
  }),
  normalize: (config, ctx) => {
    const { plateCount } = ctx.knobs as Readonly<{ plateCount?: FoundationPlateCountKnob }>;
    const override =
      typeof plateCount === "number" && Number.isFinite(plateCount) ? plateCount : undefined;

    const computeMesh =
      config.computeMesh.strategy === "default" && override !== undefined
        ? {
            ...config.computeMesh,
	            config: {
	              ...config.computeMesh.config,
	              plateCount: clampInt(override, 2, 256),
	            },
	          }
	        : config.computeMesh;

    return { ...config, computeMesh };
  },
  run: (context, config, ops, deps) => {
    const { width, height } = context.dimensions;
    const stepId = `${MeshStepContract.phase}/${MeshStepContract.id}`;
    const rngSeed = ctxRandom(context, ctxRandomLabel(stepId, "foundation/compute-mesh"), 2_147_483_647);

    const meshResult = ops.computeMesh(
      {
        width,
        height,
        rngSeed,
      },
      config.computeMesh
    );

    deps.artifacts.foundationMesh.publish(context, meshResult.mesh);

    context.viz?.dumpPoints(context.trace, {
      dataTypeKey: "foundation.mesh.sites",
      spaceId: "world.xy",
      positions: interleaveXY(meshResult.mesh.siteX, meshResult.mesh.siteY),
      values: meshResult.mesh.areas,
      valueFormat: "f32",
      meta: defineVizMeta("foundation.mesh.sites", {
        label: "Mesh Sites (Area)",
        group: GROUP_MESH,
      }),
    });

    context.viz?.dumpSegments(context.trace, {
      dataTypeKey: "foundation.mesh.edges",
      spaceId: "world.xy",
      segments: segmentsFromMeshNeighbors(
        meshResult.mesh.neighborsOffsets,
        meshResult.mesh.neighbors,
        meshResult.mesh.siteX,
        meshResult.mesh.siteY
      ),
      meta: defineVizMeta("foundation.mesh.edges", {
        label: "Mesh Neighbor Edges",
        group: GROUP_MESH,
        visibility: "debug",
        role: "edgeOverlay",
      }),
    });
  },
});
