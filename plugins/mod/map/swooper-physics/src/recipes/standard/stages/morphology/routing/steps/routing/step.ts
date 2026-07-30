import { createStep } from "@swooper/mapgen-core/authoring";
import { buildVectorFieldProjections } from "@swooper/mapgen-viz";
import { defineStandardVizMeta } from "../../../../../viz.js";
import { config } from "./config.js";

const GROUP_ROUTING = "Morphology / Routing";
const TILE_SPACE_ID = "tile.hexOddQ" as const;

function clampI8(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(-127, Math.min(127, Math.round(value)));
}

/**
 * Computes and publishes flow direction, accumulation, and basin evidence for
 * geomorphic erosion without substituting for Hydrology's river routing.
 */
export const RoutingStep = createStep(config, {
  run: (context, stepConfig, ops, deps) => {
    const topography = deps.artifacts.baseTopography.read();
    const { width, height } = context.setup.dimensions;
    const routing = ops.routing(
      {
        width,
        height,
        elevation: topography.elevation,
        landMask: topography.landMask,
      },
      stepConfig.routing
    );

    context.trace.event(() => {
      const size = width * height;
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
    deps.artifacts.routing.publish(routing);
    return routing;
  },
  viz: ({ observation: routing, dimensions }) => {
    const size = dimensions.width * dimensions.height;
    const u = new Int8Array(size);
    const v = new Int8Array(size);
    const magnitude = new Float32Array(size);
    for (let i = 0; i < size; i++) {
      const receiver = routing.flowDir[i] ?? -1;
      const x = i % dimensions.width;
      const y = (i / dimensions.width) | 0;
      if (receiver >= 0) {
        const rx = receiver % dimensions.width;
        const ry = (receiver / dimensions.width) | 0;
        u[i] = clampI8(rx - x);
        v[i] = clampI8(ry - y);
      }
      magnitude[i] = routing.flowAccum[i] ?? 0;
    }
    return [
      {
        kind: "grid",
        dataTypeKey: "morphology.routing.flowDir",
        spaceId: TILE_SPACE_ID,
        dims: dimensions,
        field: { format: "i32", values: routing.flowDir },
        meta: defineStandardVizMeta("morphology.routing.flowDir", "category.distinct", {
          label: "Flow Direction",
          group: GROUP_ROUTING,
          visibility: "debug",
        }),
      },
      {
        kind: "grid",
        dataTypeKey: "morphology.routing.flowAccum",
        spaceId: TILE_SPACE_ID,
        dims: dimensions,
        field: { format: "f32", values: routing.flowAccum },
        meta: defineStandardVizMeta("morphology.routing.flowAccum", "field.intensity", {
          label: "Flow Accumulation",
          group: GROUP_ROUTING,
        }),
      },
      ...buildVectorFieldProjections({
        dataTypeKey: "morphology.routing.flow",
        spaceId: TILE_SPACE_ID,
        dims: dimensions,
        u: { format: "i8", values: u },
        v: { format: "i8", values: v },
        magnitude: {
          source: { format: "f32", values: magnitude },
          debugOnly: true,
        },
        meta: defineStandardVizMeta("morphology.routing.flow", "field.intensity", {
          label: "Flow",
          group: GROUP_ROUTING,
        }),
        arrows: { maxArrowLengthTiles: 1.25 },
        points: { debugOnly: true },
      }),
      {
        kind: "grid",
        dataTypeKey: "morphology.routing.basinId",
        spaceId: TILE_SPACE_ID,
        dims: dimensions,
        field: { format: "i32", values: routing.basinId },
        meta: defineStandardVizMeta("morphology.routing.basinId", "category.distinct", {
          label: "Basin Id",
          group: GROUP_ROUTING,
          visibility: "debug",
        }),
      },
    ];
  },
});
