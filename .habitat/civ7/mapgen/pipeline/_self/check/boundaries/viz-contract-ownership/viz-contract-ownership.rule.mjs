import { sourceCheckRuntime as runtime } from "../../../../../../../habitat/toolkit/_self/triage/structure/legacy-source-check/rule-runtime.policy.mjs";

export const ruleId = "viz-contract-ownership";
export const candidateExtensions = [".ts"];

export function diagnosticsForRule(rule, file) {
  return runtime.vizContractOwnershipDiagnostics(rule, file);
}
