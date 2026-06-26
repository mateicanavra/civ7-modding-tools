export {
  approvedSourceScanRootsForRules,
  collapsedSourceScanRoots,
  pathsOverlap,
  selectedSourceScanRootsForRules,
  sortedUnique,
  sourceCheckCandidateExtensions,
  stagedSourceScanRoots,
} from "@internal/habitat-harness/service/model/check/index";
export {
  SourceCheck,
  type SourceCheckOptions,
  type SourceCheckRequirements,
  type SourceCheckService,
} from "./service.policy.js";
export { runSourceRulesEffect } from "./source-rules.policy.js";
