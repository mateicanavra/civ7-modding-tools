import { sourceCheckRuntime as runtime } from "../../../../../../../../habitat/toolkit/blueprints/_self/structure/triage/preserve_legacy_source_check_runtime_during_cutover/rule-runtime.policy.mjs";

export const ruleId = "require_typed_dependency_and_effect_tag_constants";
export const candidateExtensions = [".ts"];

export function diagnosticsForRule(rule, file) {
  return runtime.stageContractDependencyDiagnostics(rule, file);
}
