export const gritBin = "grit";

export const protectedScanRootPrefixes = [
  ".git/",
  ".grit/cache/",
  "dist/",
  "node_modules/",
  "tools/habitat-harness/dist/",
];

export const docsLocalCheckoutPathsRewritePattern =
  ".grit/patterns/habitat/apply/docs_local_checkout_paths_rewrite.md";

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
