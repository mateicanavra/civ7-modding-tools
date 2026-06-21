import { sourceCheckRuntime as runtime } from "../rule-runtime.mjs";

export const ruleId = "ecology-step-imports";

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
