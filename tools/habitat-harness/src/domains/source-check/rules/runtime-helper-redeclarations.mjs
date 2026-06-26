import { sourceCheckRuntime as runtime } from "../rule-runtime.mjs";

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
