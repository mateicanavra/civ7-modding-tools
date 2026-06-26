import { sourceCheckRuntime as runtime } from "../runtime/rule-runtime.policy.mjs";

export const ruleId = "require_explicit_mapgen_sdk_opt_in";
export const candidateExtensions = [".ts"];

export function diagnosticsForRule(rule, file) {
  return runtime.sdkMapgenEntrypointDiagnostics(rule, file);
}
