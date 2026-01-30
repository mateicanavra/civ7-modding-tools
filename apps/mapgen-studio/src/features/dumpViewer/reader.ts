import type { DumpFileIndex } from "./fileIndex";

export type DumpReader = {
  has(path: string): boolean;
  readText(path: string): Promise<string>;
  readArrayBuffer(path: string): Promise<ArrayBuffer>;
};

export function createDumpReader(index: DumpFileIndex): DumpReader {
  const getFile = (path: string) => {
    const file = index.get(path);
    if (!file) throw new Error(`Missing file: ${path}`);
    return file;
  };

  return {
    has: (path) => index.has(path),
    readText: async (path) => await getFile(path).text(),
    readArrayBuffer: async (path) => await getFile(path).arrayBuffer(),
  };
}
