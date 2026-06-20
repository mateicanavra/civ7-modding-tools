import path from "node:path";
import { Effect } from "effect";
import { repoRoot } from "../../lib/paths.js";
import { HabitatFileSystem, HabitatFileSystemLive } from "../../resources/filesystem.ts";

export function diffText(target: string): string | undefined {
  if (target.includes("\n") || target.startsWith("diff --git ")) return target;
  const candidate = path.resolve(repoRoot, target);
  if (isDiffPath(candidate) && readFileSystemBoolean((fs) => fs.isFile(candidate))) {
    const text = readFileSystemText(candidate);
    if (text.includes("diff --git ") || text.includes("\n+++ b/")) return text;
  }
  return undefined;
}

export function extractDiffPaths(diff: string): string[] {
  const paths = new Set<string>();
  for (const line of diff.split("\n")) {
    const gitHeader = line.match(/^diff --git a\/(.+?) b\/(.+)$/);
    if (gitHeader) {
      paths.add(gitHeader[2]);
      continue;
    }
    const changedFile = line.match(/^\+\+\+ b\/(.+)$/);
    if (changedFile && changedFile[1] !== "/dev/null") paths.add(changedFile[1]);
  }
  return [...paths].sort();
}

function isDiffPath(candidate: string): boolean {
  return candidate.endsWith(".diff") || candidate.endsWith(".patch");
}

function readFileSystemBoolean(
  operation: (fs: typeof HabitatFileSystem.Service) => Effect.Effect<boolean, unknown>
): boolean {
  return Effect.runSync(
    HabitatFileSystem.pipe(Effect.flatMap(operation), Effect.provide(HabitatFileSystemLive))
  );
}

function readFileSystemText(candidate: string): string {
  return Effect.runSync(
    HabitatFileSystem.pipe(
      Effect.flatMap((fs) => fs.readText(candidate)),
      Effect.provide(HabitatFileSystemLive)
    )
  );
}
