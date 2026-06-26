import { sourceCheckRuntime as runtime } from "../../../../../../../../habitat/toolkit/blueprints/_self/structure/triage/preserve_legacy_source_check_runtime_during_cutover/rule-runtime.policy.mjs";

export const ruleId = "prohibit_cutover_shims_dual_paths_and_legacy_stage_aliases";
export const candidateExtensions = [".ts"];

export function diagnosticsForRule(rule, file) {
  return runtime.isSwooperRuntimeSource(file)
    ? [
        ...runtime
          .cutoverShimSurfaceLines(file)
          .map((line) => runtime.diagnostic(rule, file, undefined, line)),
        ...runtime
          .cutoverLegacyStageLines(file)
          .map((line) => runtime.diagnostic(rule, file, undefined, line)),
        ...runtime
          .cutoverDualStageLines(file)
          .map((line) => runtime.diagnostic(rule, file, undefined, line)),
      ]
    : [];
}
