import { sourceCheckRuntime as runtime } from "../runtime/rule-runtime.policy.mjs";

export const ruleId = "block_engine_runtime_imports_from_domain_ops";
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
