import picomatch from "picomatch";

export function pathCoveragePatternMatches(pattern: string, pathInRepo: string): boolean {
  const normalized = pattern.replaceAll("\\", "/");
  if (!picomatch.scan(normalized).isGlob) {
    return pathInRepo === normalized || pathInRepo.startsWith(`${normalized}/`);
  }
  return picomatch(normalized, { contains: false, dot: true })(pathInRepo);
}
