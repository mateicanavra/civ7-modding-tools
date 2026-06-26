import { sourceCheckRuntime as runtime } from "../../../../../../../../habitat/toolkit/blueprints/_self/structure/triage/legacy-source-check/rule-runtime.policy.mjs";

export const ruleId = "recipe-domain-surface";
export const candidateExtensions = [".ts"];

export function diagnosticsForRule(rule, file) {
  return runtime
    .importRefs(file)
    .filter(() => runtime.pathMatches(file, /mods\/mod-swooper-maps\/src\/recipes\/.*\.ts$/))
    .filter((ref) => /@mapgen\/domain\/[^/]+\/.+/.test(ref.source))
    .filter((ref) => !/@mapgen\/domain\/[^/]+\/(?:ops|config\.js)$/.test(ref.source))
    .filter(
      (ref) =>
        !/@mapgen\/domain\/[^/]+\/(?:ops\/.+|ops-by-id|rules\/.+|strategies\/.+)/.test(ref.source)
    )
    .map((ref) => runtime.diagnostic(rule, file, ref.node));
}
