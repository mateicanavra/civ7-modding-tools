import { sourceCheckRuntime as runtime } from "../rule-runtime.policy.mjs";

export const ruleId = "viz-contract-ownership";
export const candidateExtensions = [".ts"];

export function diagnosticsForRule(rule, file) {
  return runtime.vizContractOwnershipDiagnostics(rule, file);
}
