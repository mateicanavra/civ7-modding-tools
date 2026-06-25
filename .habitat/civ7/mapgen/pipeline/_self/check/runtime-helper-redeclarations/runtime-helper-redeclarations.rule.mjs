import { sourceCheckRuntime as runtime } from "../../../../../../habitat/toolkit/_self/triage/legacy-source-check/rule-runtime.policy.mjs";

export const ruleId = "runtime-helper-redeclarations";
export const candidateExtensions = [".ts"];

export function diagnosticsForRule(rule, file) {
  return runtime
    .helperRedeclarations(file)
    .filter(() =>
      runtime.pathMatches(
        file,
        /mods\/[^/]+\/src\/(?:recipes\/.*\/stages\/.*\/steps|domain\/.*\/ops\/.*\/strategies)\/.*\.ts$/
      )
    )
    .map((node) => runtime.diagnostic(rule, file, node));
}
