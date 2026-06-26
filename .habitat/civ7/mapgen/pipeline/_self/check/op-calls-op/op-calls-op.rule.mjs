import { sourceCheckRuntime as runtime } from "../runtime/rule-runtime.policy.mjs";

export const ruleId = "op-calls-op";
export const candidateExtensions = [".ts"];

export function diagnosticsForRule(rule, file) {
  return runtime.sourceRefsMatching(
    rule,
    file,
    /mods\/mod-swooper-maps\/src\/domain\/[^/]+\/ops\/[^/]+\/index\.ts$/,
    /^(?:\.\.\/[^/]+\/index\.js|@mapgen\/domain\/[^/]+\/ops(?:\/index\.js)?)$/
  );
}
