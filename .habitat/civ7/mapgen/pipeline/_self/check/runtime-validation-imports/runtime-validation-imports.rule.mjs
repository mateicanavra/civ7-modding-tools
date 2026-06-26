import { sourceCheckRuntime as runtime } from "../../../../../../habitat/toolkit/_self/triage/legacy-source-check/rule-runtime.policy.mjs";

export const ruleId = "runtime-validation-imports";
export const candidateExtensions = [".ts"];

export function diagnosticsForRule(rule, file) {
  return runtime.sourceRefsMatching(
    rule,
    file,
    /mods\/[^/]+\/src\/(?:recipes\/.*\/stages\/.*\/steps|domain\/.*\/ops\/.*\/strategies)\/.*\.ts$/,
    /^(?:@sinclair\/typebox\/value|@sinclair\/typebox\/compiler|@swooper\/mapgen-core\/compiler\/normalize|@swooper\/mapgen-core\/authoring\/validation|@swooper\/mapgen-core\/authoring\/op\/validation-surface)$/
  );
}
