import { sourceCheckRuntime as runtime } from "../runtime/rule-runtime.policy.mjs";

export const ruleId = "prohibit_relative_domain_reaches_from_recipes_and_maps";
export const candidateExtensions = [".ts"];

export function diagnosticsForRule(rule, file) {
  return runtime.relativeDomainImportDiagnostics(rule, file);
}
