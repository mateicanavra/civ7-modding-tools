import { sourceCheckRuntime as runtime } from "../../../../../../../habitat/blueprints/toolkit/structure/triage/legacy-source-check/rule-runtime.policy.mjs";

export const ruleId = "ecology-step-imports";
export const candidateExtensions = [".ts"];

export function diagnosticsForRule(rule, file) {
  return [
    ...(runtime.isRetiredEcologyPath(file) ? [runtime.diagnostic(rule, file)] : []),
    ...runtime
      .importRefs(file)
      .filter(() => runtime.isActiveEcologyStagePath(file))
      .filter((ref) => ref.kind === "import" || ref.kind === "export")
      .filter((ref) => /^@mapgen\/domain\/ecology\/(?:ops|rules)(?:$|\/)/.test(ref.source))
      .map((ref) => runtime.diagnostic(rule, file, ref.node)),
  ];
}
