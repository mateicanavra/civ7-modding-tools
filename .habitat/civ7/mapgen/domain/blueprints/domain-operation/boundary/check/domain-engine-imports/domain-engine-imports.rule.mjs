import { sourceCheckRuntime as runtime } from "../../../../../../../../habitat/toolkit/blueprints/_self/structure/triage/legacy-source-check/rule-runtime.policy.mjs";

export const ruleId = "domain-engine-imports";
export const candidateExtensions = [".ts"];

export function diagnosticsForRule(rule, file) {
  return runtime
    .importRefs(file)
    .filter((ref) => ref.kind === "import" && !ref.isTypeOnly)
    .filter(() =>
      runtime.pathMatches(file, /mods\/mod-swooper-maps\/src\/domain\/.*\/ops\/.*\.ts$/)
    )
    .filter((ref) => /(?:@swooper\/mapgen-core\/engine|@mapgen\/engine)$/.test(ref.source))
    .map((ref) => runtime.diagnostic(rule, file, ref.node));
}
