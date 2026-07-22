import path from "node:path";
import { HabitatConfig } from "@habitat/cli/resources/config/index";
import { Effect } from "effect";
import { makeDirectory } from "./filesystem.js";

export const ensurePatternCacheRoot = Effect.fn("habitat.platform.ensurePatternCacheRoot")(
  function* () {
    const configService = yield* HabitatConfig;
    const config = yield* configService.get;
    yield* makeDirectory(config.patternCacheRoot);
    return config.patternCacheRoot;
  }
);

export const cachePath = Effect.fn("habitat.platform.cachePath")(function* (
  ...segments: readonly string[]
) {
    const configService = yield* HabitatConfig;
    const config = yield* configService.get;
    return path.join(config.cacheRoot, ...segments);
  });
