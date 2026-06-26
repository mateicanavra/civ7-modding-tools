import { sourceCheckRuntime as runtime } from "../runtime/rule-runtime.policy.mjs";

export const ruleId = "require_shared_visualization_contracts_at_stage_surfaces";
export const candidateExtensions = [".ts"];

export function diagnosticsForRule(rule, file) {
  return runtime.vizContractOwnershipDiagnostics(rule, file);
}
