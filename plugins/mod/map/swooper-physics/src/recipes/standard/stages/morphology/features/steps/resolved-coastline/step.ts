import { createStep } from "@swooper/mapgen-core/authoring";
import { config } from "./config.js";

/** Reuses the coastal operations once for all final-surface consumers; does not change ground or water. */
export const ResolvedCoastlineStep = createStep(config, {
  run: (context, stepConfig, ops, deps) => {
    const { width, height } = context.setup.dimensions;
    const { exposedLandMask } = deps.artifacts.hydrography.read();
    const adjacency = ops.adjacency({ width, height, landMask: exposedLandMask }, stepConfig.adjacency);
    const coastal = Uint8Array.from(adjacency.coastalLand, (land, cell) =>
      land === 1 || adjacency.coastalWater[cell] === 1 ? 1 : 0
    );
    const { distanceToCoast } = ops.distanceToCoast({ width, height, coastal }, stepConfig.distanceToCoast);
    deps.artifacts.resolvedCoastline.publish({ ...adjacency, distanceToCoast });
  },
});
