import { sourceCheckRuntime as runtime } from "../rule-runtime.mjs";

export const ruleId = "stage-contract-dependencies";

export function diagnosticsForRule(rule, file) {
  return runtime.stageContractDependencyDiagnostics(rule, file);
}
