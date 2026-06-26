import { sourceCheckRuntime as runtime } from "../runtime/rule-runtime.policy.mjs";

export const ruleId = "prohibit_runtime_validation_and_compiler_imports";
export const candidateExtensions = [".ts"];

export function diagnosticsForRule(rule, file) {
  return runtime.sourceRefsMatching(
    rule,
    file,
    /mods\/[^/]+\/src\/(?:recipes\/.*\/stages\/.*\/steps|domain\/.*\/ops\/.*\/strategies)\/.*\.ts$/,
    /^(?:@sinclair\/typebox\/value|@sinclair\/typebox\/compiler|@swooper\/mapgen-core\/compiler\/normalize|@swooper\/mapgen-core\/authoring\/validation|@swooper\/mapgen-core\/authoring\/op\/validation-surface)$/
  );
}
