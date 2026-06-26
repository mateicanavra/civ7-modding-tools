import { sourceCheckRuntime as runtime } from "../../../../../../../../habitat/toolkit/blueprints/_self/structure/triage/preserve_legacy_source_check_runtime_during_cutover/rule-runtime.policy.mjs";

export const ruleId = "prohibit_ambient_rng_in_authored_generation";
export const candidateExtensions = [".ts"];

export function diagnosticsForRule(rule, file) {
  return runtime.isRngAuthorityScope(file)
    ? [
        ...runtime
          .rngAuthorityLines(file)
          .map((line) =>
            runtime.diagnostic(
              rule,
              file,
              undefined,
              line,
              "Keep authored generation off engine RNG and official generators."
            )
          ),
        ...runtime
          .sourceRefsMatching(
            rule,
            file,
            /mods\/mod-swooper-maps\/src\/(?:domain|recipes\/standard)\/.*\.ts$/,
            /^@swooper\/mapgen-core\/lib\/rng$/
          )
          .map((hit) => ({
            ...hit,
            message:
              "Do not import internal mapgen-core RNG from authored domain or standard recipe source.",
          })),
      ]
    : [];
}
