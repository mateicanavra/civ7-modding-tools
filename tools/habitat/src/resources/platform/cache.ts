import path from "node:path";
import { HabitatConfig } from "@habitat/cli/resources/config/index";
import { Effect } from "effect";
import { makeDirectory } from "./filesystem.js";

export function ensurePatternCacheRoot() {
  return Effect.gen(function* () {
    const configService = yield* HabitatConfig;
    const config = yield* configService.get;
    yield* makeDirectory(config.patternCacheRoot);
    return config.patternCacheRoot;
  });
}

export function cachePath(...segments: readonly string[]) {
  return Effect.gen(function* () {
    const configService = yield* HabitatConfig;
    const config = yield* configService.get;
    return path.join(config.cacheRoot, ...segments);
  });
}
