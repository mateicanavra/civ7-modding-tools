import path from "node:path";
import type { HabitatConfigValue } from "./habitat-config.js";

export function habitatCachePath(config: HabitatConfigValue, ...segments: readonly string[]) {
  return path.join(config.cacheRoot, ...segments);
}

export function habitatPatternCachePath(
  config: HabitatConfigValue,
  ...segments: readonly string[]
) {
  return path.join(config.patternCacheRoot, ...segments);
}
