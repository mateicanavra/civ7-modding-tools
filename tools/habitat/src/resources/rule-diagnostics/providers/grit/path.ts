import path from "node:path";

/** Rejects parent traversal and cross-volume roots through one relative-path law. */
export function pathIsWithinRoot(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return (
    relative === "" ||
    (!path.isAbsolute(relative) && relative !== ".." && !relative.startsWith(`..${path.sep}`))
  );
}
