import path from "node:path";
import { Effect } from "effect";
import { HabitatConfig } from "../config/index.js";
import { HabitatFileSystem } from "./filesystem.js";

export function ensurePatternCacheRoot() {
  return Effect.gen(function* () {
    const configService = yield* HabitatConfig;
    const config = yield* configService.get;
    const fs = yield* HabitatFileSystem;
    yield* fs.makeDirectory(config.patternCacheRoot);
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
