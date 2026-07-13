export const defaultGritCommandTimeoutMs = 600_000;

export const protectedScanRootPrefixes = [
  ".git/",
  ".habitat/cache/patterns/",
  "dist/",
  "node_modules/",
  "tools/habitat/dist/",
];

export const gritCandidateExtensions = new Set([
  ".cjs",
  ".cts",
  ".js",
  ".jsx",
  ".mjs",
  ".mts",
  ".ts",
  ".tsx",
]);
