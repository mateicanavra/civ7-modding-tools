import { sourceCheckRuntime as runtime } from "../../../../../../../habitat/toolkit/_self/triage/structure/legacy-source-check/rule-runtime.policy.mjs";

export const ruleId = "sdk-mapgen-entrypoint";
export const candidateExtensions = [".ts"];

export function diagnosticsForRule(rule, file) {
  return runtime.sdkMapgenEntrypointDiagnostics(rule, file);
}
