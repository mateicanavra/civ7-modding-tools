export const gritBin = "grit";
export const defaultGritCommandTimeoutMs = 120_000;

export const protectedScanRootPrefixes = [
  ".git/",
  ".habitat/cache/patterns/",
  "dist/",
  "node_modules/",
  "tools/habitat/dist/",
];

export const docsLocalCheckoutPathsRewritePattern =
  ".habitat/docs/blueprints/_self/quality/check/ensure_docs_checkout_paths_are_portable/pattern.md";

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
