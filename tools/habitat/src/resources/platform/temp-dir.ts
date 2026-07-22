import { FileSystem } from "@effect/platform";
import { Effect } from "effect";

export const acquireTempDirectory = Effect.fn("habitat.platform.acquireTempDirectory")(function* (
  prefix: string
) {
  const fs = yield* FileSystem.FileSystem;
  return yield* fs.makeTempDirectoryScoped({ prefix });
});
