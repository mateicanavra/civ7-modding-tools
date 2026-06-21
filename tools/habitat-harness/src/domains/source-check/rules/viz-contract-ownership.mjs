import { sourceCheckRuntime as runtime } from "../rule-runtime.mjs";

export const ruleId = "viz-contract-ownership";

export function diagnosticsForRule(rule, file) {
  return runtime.vizContractOwnershipDiagnostics(rule, file);
}
