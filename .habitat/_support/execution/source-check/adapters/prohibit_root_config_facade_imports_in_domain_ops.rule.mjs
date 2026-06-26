import { sourceCheckRuntime as runtime } from "../runtime/rule-runtime.policy.mjs";

export const ruleId = "prohibit_root_config_facade_imports_in_domain_ops";
export const candidateExtensions = [".ts"];

export function diagnosticsForRule(rule, file) {
  return runtime.sourceRefsMatching(
    rule,
    file,
    /mods\/mod-swooper-maps\/src\/domain\/.*\/ops\/.*\.ts$/,
    /^(?:\.\.\/){2,}config\.js$/
  );
}
