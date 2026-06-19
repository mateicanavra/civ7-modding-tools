export { injectedProbeRoot } from "../adapters/grit/constants.js";
export {
  gritCheckProgram,
  gritCheckRequest,
} from "../adapters/grit/request.js";
export {
  runGritRule,
  runGritRules,
} from "../adapters/grit/runner.js";
export type { GritScanRootValidationOptions } from "../adapters/grit/scan-roots/index.js";
export {
  discoverGritScanRoots,
  effectiveGritScanRoots,
  validateScanRoots,
} from "../adapters/grit/scan-roots/index.js";
export type {
  GritCheckCacheMode,
  GritCheckOptions,
  GritCheckOutputFormat,
  GritCheckRequestOptions,
  GritProjectionOptions,
} from "../adapters/grit/types.js";
