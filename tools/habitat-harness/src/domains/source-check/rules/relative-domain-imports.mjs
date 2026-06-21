import { sourceCheckRuntime as runtime } from "../rule-runtime.mjs";

export const ruleId = "relative-domain-imports";

export function diagnosticsForRule(rule, file) {
  return runtime.relativeDomainImportDiagnostics(rule, file);
}
