import type { HabitatConfigValue } from "./habitat-config.js";

export function isHabitatConfigValue(value: unknown): value is HabitatConfigValue {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as HabitatConfigValue).repoRoot === "string" &&
    typeof (value as HabitatConfigValue).cacheRoot === "string" &&
    (value as HabitatConfigValue).workspaceTools instanceof Map
  );
}
