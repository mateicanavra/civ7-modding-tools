import { sourceCheckRuntime as runtime } from "../rule-runtime.policy.mjs";

export const ruleId = "stage-contract-dependencies";
export const candidateExtensions = [".ts"];

export function diagnosticsForRule(rule, file) {
  return runtime.stageContractDependencyDiagnostics(rule, file);
}
