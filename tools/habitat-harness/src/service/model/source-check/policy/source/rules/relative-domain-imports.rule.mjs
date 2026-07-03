import { sourceCheckRuntime as runtime } from "../rule-runtime.policy.mjs";

export const ruleId = "relative-domain-imports";
export const candidateExtensions = [".ts"];

export function diagnosticsForRule(rule, file) {
  return runtime.relativeDomainImportDiagnostics(rule, file);
}
