import { ctxRandom, ctxRandomLabel } from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
import { buildNeighborSegments, defineVizMeta, interleaveXY } from "@swooper/mapgen-viz";
import { defineStandardVizMeta } from "../../../../viz.js";
import { MeshStepContract } from "./config.js";

const GROUP_MESH = "Foundation / Mesh";

/**
 * Bootstraps Foundation's mesh exactly once, fixing cell identity and resolution
 * for every subsequent mantle, lithosphere, and tectonics operation.
 */
export const MeshStep = createStep(MeshStepContract, {
  run: (context, config, ops, deps) => {
    const { width, height } = context.setup.dimensions;
    const stepId = `foundation/${MeshStepContract.id}`;
    const rngSeed = ctxRandom(
      context,
      ctxRandomLabel(stepId, "foundation/compute-mesh"),
      2_147_483_647
    );

    const meshResult = ops.computeMesh(
      {
        width,
        height,
        rngSeed,
      },
      config.computeMesh
    );

    deps.artifacts.foundationMesh.publish(context, meshResult.mesh);
    return meshResult.mesh;
  },
  viz: ({ result: mesh }) => [
    {
      kind: "points",
      dataTypeKey: "foundation.mesh.sites",
      spaceId: "world.xy",
      positions: interleaveXY(mesh.siteX, mesh.siteY),
      values: { format: "f32", values: mesh.areas },
      meta: defineStandardVizMeta("foundation.mesh.sites", "field.intensity", {
        label: "Mesh Sites (Area)",
        group: GROUP_MESH,
      }),
    },
    {
      kind: "segments",
      dataTypeKey: "foundation.mesh.edges",
      spaceId: "world.xy",
      segments: buildNeighborSegments({
        offsets: mesh.neighborsOffsets,
        neighbors: mesh.neighbors,
        x: mesh.siteX,
        y: mesh.siteY,
      }),
      meta: defineVizMeta("foundation.mesh.edges", {
        label: "Mesh Neighbor Edges",
        group: GROUP_MESH,
        visibility: "debug",
        role: "edgeOverlay",
      }),
    },
  ],
});
