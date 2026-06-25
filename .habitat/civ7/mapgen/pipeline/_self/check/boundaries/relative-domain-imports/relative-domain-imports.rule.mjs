import { sourceCheckRuntime as runtime } from "../../../../../../../habitat/toolkit/_self/triage/structure/legacy-source-check/rule-runtime.policy.mjs";

export const ruleId = "relative-domain-imports";
export const candidateExtensions = [".ts"];

export function diagnosticsForRule(rule, file) {
  return runtime.relativeDomainImportDiagnostics(rule, file);
}
