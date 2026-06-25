export {
  runSourceRulesEffect,
  type SourceCheckOptions,
  type SourceRuleFileSystem,
} from "./policy/source/source-rules.policy.js";
export {
  approvedSourceScanRootsForRules,
  approvedSourceScanRootsForRules as approvedScanRootsForRules,
  collapsedSourceScanRoots,
  pathsOverlap,
  selectedSourceScanRootsForRules,
  sortedUnique,
  sourceCheckCandidateExtensions,
  stagedSourceCheckPaths,
  stagedSourceScanRoots,
} from "./policy/source-scope.policy.js";
