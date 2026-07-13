import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const picomatch = require("picomatch") as {
  (
    glob: string,
    options?: { readonly contains?: boolean; readonly dot?: boolean }
  ): (candidate: string) => boolean;
  readonly scan: (glob: string) => { readonly isGlob: boolean };
};

export function pathCoveragePatternMatches(pattern: string, pathInRepo: string): boolean {
  const normalized = pattern.replaceAll("\\", "/");
  if (!picomatch.scan(normalized).isGlob) {
    return pathInRepo === normalized || pathInRepo.startsWith(`${normalized}/`);
  }
  return picomatch(normalized, { contains: false, dot: true })(pathInRepo);
}
