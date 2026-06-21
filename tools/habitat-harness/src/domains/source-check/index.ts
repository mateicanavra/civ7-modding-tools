export {
  approvedSourceScanRootsForRules,
  collapsedSourceScanRoots,
  pathsOverlap,
  selectedSourceScanRootsForRules,
  sortedUnique,
  sourceCheckCandidateExtensions,
  stagedSourceScanRoots,
} from "./scan-roots.js";
export {
  makeFakeSourceCheckLayer,
  SourceCheck,
  SourceCheckLive,
  type SourceCheckOptions,
  type SourceCheckRequirements,
  type SourceCheckService,
} from "./service.js";
export { runSourceRulesEffect } from "./source-rules.js";
