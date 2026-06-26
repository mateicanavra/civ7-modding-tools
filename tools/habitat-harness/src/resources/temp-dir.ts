import { FileSystem } from "@effect/platform";
import { Effect } from "effect";

export function acquireTempDirectory(prefix: string) {
  return Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    return yield* fs.makeTempDirectoryScoped({ prefix });
  });
}
