import { sourceCheckRuntime as runtime } from "../../../../../../../../habitat/toolkit/blueprints/_self/structure/triage/preserve_legacy_source_check_runtime_during_cutover/rule-runtime.policy.mjs";

export const ruleId = "require_public_ecology_surfaces_and_retired_topology_removal";
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
