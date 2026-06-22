import path from "node:path";

export interface ClassifyFileSystem {
  readonly isFile: (targetPath: string) => boolean;
  readonly readText: (targetPath: string) => string;
  readonly statKind: (targetPath: string) => string | undefined;
}

export function diffText(
  target: string,
  context: { readonly repoRoot: string; readonly fileSystem: ClassifyFileSystem }
): string | undefined {
  if (target.includes("\n") || target.startsWith("diff --git ")) return target;
  const candidate = path.resolve(context.repoRoot, target);
  if (isDiffPath(candidate) && context.fileSystem.isFile(candidate)) {
    const text = context.fileSystem.readText(candidate);
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
