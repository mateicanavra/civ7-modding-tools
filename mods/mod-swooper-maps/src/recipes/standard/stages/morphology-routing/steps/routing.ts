import { defineVizMeta, dumpVectorFieldVariants } from "@swooper/mapgen-core";
import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";

import RoutingStepContract from "./routing.contract.js";
import { validators as morphologyArtifactValidators } from "../../morphology/artifacts/index.js";

const GROUP_ROUTING = "Morphology / Routing";
const TILE_SPACE_ID = "tile.hexOddQ" as const;

function clampI8(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(-127, Math.min(127, Math.round(value)));
}

export default createStep(RoutingStepContract, {
  artifacts: implementArtifacts(RoutingStepContract.artifacts!.provides!, {
    routing: {
      validate: morphologyArtifactValidators.routing,
    },
  }),
  run: (context, config, ops, deps) => {
    const topography = deps.artifacts.topography.read(context);
    const { width, height } = context.dimensions;
    const routing = ops.routing(
      {
        width,
        height,
        elevation: topography.elevation,
        landMask: topography.landMask,
      },
      config.routing
    );

    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "morphology.routing.flowDir",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "i32",
      values: routing.flowDir,
      meta: defineVizMeta("morphology.routing.flowDir", {
        label: "Flow Direction",
        group: GROUP_ROUTING,
        visibility: "debug",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "morphology.routing.flowAccum",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "f32",
      values: routing.flowAccum,
      meta: defineVizMeta("morphology.routing.flowAccum", {
        label: "Flow Accumulation",
        group: GROUP_ROUTING,
      }),
    });
    {
      const size = Math.max(0, width * height);
      const u = new Int8Array(size);
      const v = new Int8Array(size);
      const magnitude = new Float32Array(size);
      for (let i = 0; i < size; i++) {
        const receiver = routing.flowDir[i] ?? -1;
        const x = i % width;
        const y = (i / width) | 0;
        if (receiver >= 0) {
          const rx = receiver % width;
          const ry = (receiver / width) | 0;
          u[i] = clampI8(rx - x);
          v[i] = clampI8(ry - y);
        } else {
          u[i] = 0;
          v[i] = 0;
        }
        magnitude[i] = routing.flowAccum[i] ?? 0;
      }

      dumpVectorFieldVariants(context.trace, context.viz, {
        dataTypeKey: "morphology.routing.flow",
        spaceId: TILE_SPACE_ID,
        dims: { width, height },
        u: { format: "i8", values: u },
        v: { format: "i8", values: v },
        magnitude: { values: magnitude, format: "f32", debugOnly: true },
        label: "Flow",
        group: GROUP_ROUTING,
        palette: "continuous",
        arrows: { maxArrowLenTiles: 1.25 },
        points: { debugOnly: true },
      });
    }
    if (routing.basinId instanceof Int32Array) {
      context.viz?.dumpGrid(context.trace, {
        dataTypeKey: "morphology.routing.basinId",
        spaceId: TILE_SPACE_ID,
        dims: { width, height },
        format: "i32",
        values: routing.basinId,
        meta: defineVizMeta("morphology.routing.basinId", {
          label: "Basin Id",
          group: GROUP_ROUTING,
          visibility: "debug",
          palette: "categorical",
        }),
      });
    }

    context.trace.event(() => {
      const size = Math.max(0, (width | 0) * (height | 0));
      const flowDir = routing.flowDir;
      const flowAccum = routing.flowAccum;
      const landMask = topography.landMask;

      let landTiles = 0;
      let sinks = 0;
      let minFlow = 0;
      let maxFlow = 0;
      let sumFlow = 0;

      for (let i = 0; i < size; i++) {
        if (landMask[i] !== 1) continue;
        landTiles += 1;

        const dir = flowDir[i] ?? -1;
        if (dir < 0) sinks += 1;

        const flow = flowAccum[i] ?? 0;
        if (landTiles === 1 || flow < minFlow) minFlow = flow;
        if (landTiles === 1 || flow > maxFlow) maxFlow = flow;
        sumFlow += flow;
      }

      return {
        kind: "morphology.routing.summary",
        landTiles,
        sinks,
        flowAccumMin: landTiles ? Number(minFlow.toFixed(4)) : 0,
        flowAccumMax: landTiles ? Number(maxFlow.toFixed(4)) : 0,
        flowAccumMean: landTiles ? Number((sumFlow / landTiles).toFixed(4)) : 0,
      };
    });
    deps.artifacts.routing.publish(context, routing);
  },
});
