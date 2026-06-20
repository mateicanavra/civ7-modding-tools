import { Effect } from "effect";
import { HabitatFileSystem } from "./filesystem.js";

export function acquireTempDirectory(prefix: string) {
  return Effect.acquireRelease(
    Effect.gen(function* () {
      const fs = yield* HabitatFileSystem;
      return yield* fs.makeTempDirectory(prefix);
    }),
    (targetPath) =>
      Effect.gen(function* () {
        const fs = yield* HabitatFileSystem;
        yield* fs.remove(targetPath).pipe(Effect.ignore);
      })
  );
}
