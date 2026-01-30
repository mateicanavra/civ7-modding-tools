export type DumpFileIndex = Map<string, File>;

export function stripRootDirPrefix(path: string): string {
  const parts = path.split("/").filter(Boolean);
  if (parts.length <= 1) return path;
  return parts.slice(1).join("/");
}

export function buildDumpFileIndexFromDirectoryFiles(files: Map<string, File>): DumpFileIndex {
  const index: DumpFileIndex = new Map();
  for (const [path, file] of files.entries()) {
    index.set(path, file);
    index.set(stripRootDirPrefix(path), file);
  }
  return index;
}

export function buildDumpFileIndexFromFileList(files: FileList): DumpFileIndex {
  const index: DumpFileIndex = new Map();
  for (const file of Array.from(files)) {
    const rel = (file as any).webkitRelativePath ? String((file as any).webkitRelativePath) : file.name;
    index.set(stripRootDirPrefix(rel), file);
  }
  return index;
}

export function resolveDumpPath(index: DumpFileIndex, path: string): File | undefined {
  return index.get(path);
}
