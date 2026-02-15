import { requireMesh as requireMeshInput, requirePlateGraph as requirePlateGraphInput, requirePlateMotion as requirePlateMotionInput } from "../../../lib/require.js";

export { ERA_COUNT_MAX, ERA_COUNT_MIN } from "./constants.js";
export { computePlateIdByEra } from "./compute-plate-id-by-era.js";

export function requireMesh(...args: Parameters<typeof requireMeshInput>): ReturnType<typeof requireMeshInput> {
  return requireMeshInput(...args);
}

export function requirePlateGraph(
  ...args: Parameters<typeof requirePlateGraphInput>
): ReturnType<typeof requirePlateGraphInput> {
  return requirePlateGraphInput(...args);
}

export function requirePlateMotion(
  ...args: Parameters<typeof requirePlateMotionInput>
): ReturnType<typeof requirePlateMotionInput> {
  return requirePlateMotionInput(...args);
}
