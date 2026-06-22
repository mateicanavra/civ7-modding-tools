import { sourceCheckRuntime as runtime } from "../rule-runtime.policy.mjs";

export const ruleId = "placement-outcome-boundary";
export const candidateExtensions = [".ts"];

export function diagnosticsForRule(rule, file) {
  return runtime.pathMatches(
    file,
    /mods\/mod-swooper-maps\/src\/recipes\/standard\/stages\/placement\/steps\/placement\/apply\.ts$/
  )
    ? ["generateOfficialResources", "generateOfficialDiscoveries"].flatMap((name) =>
        runtime.callExpressions(file, name).map((node) => runtime.diagnostic(rule, file, node))
      )
    : [];
}
