export const gritBin = "grit";

export const protectedScanRootPrefixes = [
  ".git/",
  ".habitat/cache/patterns/",
  "dist/",
  "node_modules/",
  "tools/habitat-harness/dist/",
];

export const docsLocalCheckoutPathsRewritePattern =
  ".habitat/patterns/apply/docs_local_checkout_paths_rewrite.md";

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
