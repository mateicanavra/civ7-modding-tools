import { sourceCheckRuntime as runtime } from "../../../../../../../../habitat/toolkit/blueprints/_self/structure/triage/legacy-source-check/rule-runtime.policy.mjs";

export const ruleId = "sibling-stage-step-imports";
export const candidateExtensions = [".ts"];

export function diagnosticsForRule(rule, file) {
  return runtime.sourceRefsMatching(
    rule,
    file,
    /mods\/mod-swooper-maps\/src\/recipes\/standard\/stages\/[^/]+\/.*\.ts$/,
    /.*\.\.\/[^/]+\/steps\/.*/
  );
}
